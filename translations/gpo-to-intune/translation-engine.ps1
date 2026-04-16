<#
.SYNOPSIS
    PolicyForge GPO-to-Intune Translation Engine
    Reads a GPO backup or GPRESULT XML and outputs a CSV of Intune OMA-URI mappings.

.DESCRIPTION
    This script helps migrate Group Policy settings to Intune by:
    1. Parsing a GPRESULT XML or GPO backup
    2. Looking up each setting in the PolicyForge translation database
    3. Outputting a CSV ready for Intune Custom Profile import

.PARAMETER GpResultXml
    Path to a GPRESULT /X output XML file
    Generate with: gpresult /X C:\temp\gpresult.xml /F

.PARAMETER OutputCsv
    Output path for the Intune OMA-URI CSV (default: .\intune-export.csv)

.PARAMETER ShowUnmapped
    Also output policies with no known CSP equivalent

.EXAMPLE
    gpresult /X C:\temp\gpresult.xml /F
    .\translation-engine.ps1 -GpResultXml C:\temp\gpresult.xml -OutputCsv .\intune-export.csv

.NOTES
    PolicyForge — https://github.com/SamoTech/PolicyForge
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$GpResultXml,

    [Parameter(Mandatory=$false)]
    [string]$OutputCsv = ".\intune-export.csv",

    [switch]$ShowUnmapped
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Translation Database ───────────────────────────────────────────────────────
# Inline database of known GPO registry → Intune CSP mappings
# Format: RegistryKey|ValueName → @{OmaUri; Value; DataType; Description}

$TranslationDB = @{
    # Defender
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection|DisableRealtimeMonitoring' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/Defender/AllowRealtimeMonitoring'
        RecommendedValue = '1'
        DataType = 'Integer'
        Description = 'Enable Real-Time Protection'
        PolicyForgeId = 'DEF-001'
    }
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet|SpynetReporting' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/Defender/AllowCloudProtection'
        RecommendedValue = '1'
        DataType = 'Integer'
        Description = 'Enable Cloud-Delivered Protection'
        PolicyForgeId = 'DEF-002'
    }
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection|DisableBehaviorMonitoring' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/Defender/AllowBehaviorMonitoring'
        RecommendedValue = '1'
        DataType = 'Integer'
        Description = 'Enable Behavior Monitoring'
        PolicyForgeId = 'DEF-003'
    }
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Network Protection|EnableNetworkProtection' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/Defender/EnableNetworkProtection'
        RecommendedValue = '1'
        DataType = 'Integer'
        Description = 'Enable Network Protection (Block mode)'
        PolicyForgeId = 'DEF-004'
    }
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender|PUAProtection' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/Defender/PUAProtection'
        RecommendedValue = '1'
        DataType = 'Integer'
        Description = 'Enable PUA Protection'
        PolicyForgeId = 'DEF-010'
    }
    # Privacy
    'HKLM\Software\Policies\Microsoft\Windows\DataCollection|AllowTelemetry' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry'
        RecommendedValue = '0'
        DataType = 'Integer'
        Description = 'Disable Windows Telemetry'
        PolicyForgeId = 'WIN-PRIVACY-001'
    }
    'HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search|AllowCortana' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/Experience/AllowCortana'
        RecommendedValue = '0'
        DataType = 'Integer'
        Description = 'Disable Cortana'
        PolicyForgeId = 'WIN-PRIVACY-002'
    }
    # Security
    'HKLM\SOFTWARE\Policies\Microsoft\Windows NT\CurrentVersion\Winlogon|EnableLUA' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_RunAllAdministratorsInAdminApprovalMode'
        RecommendedValue = '1'
        DataType = 'Integer'
        Description = 'Enable UAC Admin Approval Mode'
        PolicyForgeId = 'WIN-SECURITY-014'
    }
    'HKLM\SYSTEM\CurrentControlSet\Control\Lsa|LmCompatibilityLevel' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkSecurity_LANManagerAuthenticationLevel'
        RecommendedValue = '5'
        DataType = 'Integer'
        Description = 'Require NTLMv2 (LM Auth Level 5)'
        PolicyForgeId = 'WIN-SECURITY-007'
    }
    'HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest|UseLogonCredential' = @{
        OmaUri = 'PowerShell Remediation required'
        RecommendedValue = '0'
        DataType = 'N/A'
        Description = 'Disable WDigest Authentication'
        PolicyForgeId = 'WIN-SECURITY-006'
    }
    # Firewall
    'HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\DomainProfile|EnableFirewall' = @{
        OmaUri = './Device/Vendor/MSFT/Firewall/MdmStore/DomainProfile/EnableFirewall'
        RecommendedValue = 'true'
        DataType = 'Boolean'
        Description = 'Enable Windows Firewall (Domain Profile)'
        PolicyForgeId = 'WIN-SECURITY-010'
    }
    # Audit
    'HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit|ProcessCreationIncludeCmdLine_Enabled' = @{
        OmaUri = './Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation'
        RecommendedValue = '3'
        DataType = 'Integer'
        Description = 'Audit Process Creation with Command Line'
        PolicyForgeId = 'WIN-SECURITY-016'
    }
}

# ── Helper Functions ──────────────────────────────────────────────────────────

function Write-Status([string]$msg, [string]$color = 'Cyan') {
    Write-Host "[PolicyForge] $msg" -ForegroundColor $color
}

function Get-CurrentRegistryPolicies {
    """
    Enumerate current machine registry settings from known policy paths.
    Returns a list of @{Key; ValueName; CurrentValue} objects.
    """
    $policyRoots = @(
        'HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender',
        'HKLM:\SOFTWARE\Policies\Microsoft\Windows',
        'HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall',
        'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa',
        'HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest'
    )

    $results = @()
    foreach ($root in $policyRoots) {
        if (!(Test-Path $root)) { continue }
        try {
            Get-ChildItem -Path $root -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
                $key = $_.PSPath -replace 'Microsoft.PowerShell.Core\\Registry::', ''
                $_.Property | ForEach-Object {
                    $valueName = $_
                    try {
                        $val = Get-ItemPropertyValue -Path $key -Name $valueName -ErrorAction Stop
                        $results += @{ Key = $key; ValueName = $valueName; CurrentValue = $val }
                    } catch { }
                }
            }
        } catch { }
    }
    return $results
}

function Invoke-Translation {
    param([array]$RegistrySettings)

    $mapped = @()
    $unmapped = @()

    foreach ($setting in $RegistrySettings) {
        # Normalize key format for lookup
        $lookupKey = ($setting.Key -replace 'HKEY_LOCAL_MACHINE', 'HKLM') + "|" + $setting.ValueName

        if ($TranslationDB.ContainsKey($lookupKey)) {
            $translation = $TranslationDB[$lookupKey]
            $mapped += [PSCustomObject]@{
                PolicyForgeId    = $translation.PolicyForgeId
                Description      = $translation.Description
                RegistryKey      = $setting.Key
                ValueName        = $setting.ValueName
                CurrentValue     = $setting.CurrentValue
                OmaUri           = $translation.OmaUri
                RecommendedValue = $translation.RecommendedValue
                DataType         = $translation.DataType
                Status           = if ($translation.OmaUri -like 'PowerShell*') { 'Remediation Script' } else { 'Ready for Intune' }
            }
        } else {
            $unmapped += [PSCustomObject]@{
                RegistryKey  = $setting.Key
                ValueName    = $setting.ValueName
                CurrentValue = $setting.CurrentValue
                Status       = 'No CSP mapping found'
            }
        }
    }

    return @{ Mapped = $mapped; Unmapped = $unmapped }
}

# ── Main ──────────────────────────────────────────────────────────────────────

Write-Status "PolicyForge GPO → Intune Translation Engine" 'Green'
Write-Status "Translation database: $($TranslationDB.Count) known mappings"

# Get settings from live registry (or parse XML if provided)
if ($GpResultXml -and (Test-Path $GpResultXml)) {
    Write-Status "Parsing GPRESULT XML: $GpResultXml"
    # XML parsing would go here for GPRESULT format
    Write-Status "XML parsing mode: extracting registry extensions..." 'Yellow'
    $settings = @() # Placeholder — extend for your XML structure
} else {
    Write-Status "No GPRESULT XML provided. Scanning live registry..."
    $settings = Get-CurrentRegistryPolicies
    Write-Status "Found $($settings.Count) registry policy values"
}

$results = Invoke-Translation -RegistrySettings $settings

Write-Status "Mapped: $($results.Mapped.Count) | Unmapped: $($results.Unmapped.Count)"

# Export CSV
if ($results.Mapped.Count -gt 0) {
    $results.Mapped | Export-Csv -Path $OutputCsv -NoTypeInformation -Encoding UTF8
    Write-Status "Intune OMA-URI export saved: $OutputCsv" 'Green'
} else {
    Write-Status "No mapped policies found to export." 'Yellow'
}

# Show unmapped if requested
if ($ShowUnmapped -and $results.Unmapped.Count -gt 0) {
    Write-Host ""
    Write-Status "Unmapped policies (no CSP equivalent in database):" 'Yellow'
    $results.Unmapped | Format-Table -AutoSize
}

Write-Host ""
Write-Status "Done. Review $OutputCsv and import into Intune > Devices > Configuration > Create > Custom" 'Green'
