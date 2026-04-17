<#
.SYNOPSIS
    PolicyForge GPO → Intune Translation Engine
    Translates Group Policy registry settings to Intune OMA-URI / CSP equivalents.
.PARAMETER GpResultXml
    Path to a GPRESULT /X output file. If omitted, the script scans the live registry.
.PARAMETER OutputCsv
    Path for the CSV export. Defaults to .\intune-export.csv
.PARAMETER ShowUnmapped
    If set, prints registry values with no CSP mapping.
.EXAMPLE
    .\translation-engine.ps1
    .\translation-engine.ps1 -GpResultXml .\gpresult.xml -OutputCsv .\export.csv -ShowUnmapped
.NOTES
    PolicyForge — https://github.com/SamoTech/PolicyForge
    Run as Administrator for live registry scanning.
#>

param(
    [string]$GpResultXml   = '',
    [string]$OutputCsv     = '.\intune-export.csv',
    [switch]$ShowUnmapped
)

$ErrorActionPreference = 'Continue'

# ── Translation Database ───────────────────────────────────────────────────────────────
# Keys are "HKLM\<path>|<ValueName>" (HKLM short form, no trailing backslash)
# PolicyForgeId values must match the canonical mapping in policies/windows/README.md

$TranslationDB = @{
    # UAC — WIN-SECURITY-016
    'HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System|EnableLUA' = @{
        PolicyForgeId    = 'WIN-SECURITY-016'
        Description      = 'UAC Admin Approval Mode'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_RunAllAdministratorsInAdminApprovalMode'
        RecommendedValue = '1'
        DataType         = 'Integer'
    }
    'HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System|ConsentPromptBehaviorAdmin' = @{
        PolicyForgeId    = 'WIN-SECURITY-016'
        Description      = 'UAC Prompt Behavior for Admins'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_BehaviorOfTheElevationPromptForAdministrators'
        RecommendedValue = '1'
        DataType         = 'Integer'
    }
    # NTLMv2 Auth Level — no canonical PolicyForge ID; tracked as WIN-SECURITY-NET-NTLMV2
    # Note: LmCompatibilityLevel is NOT WIN-SECURITY-007 (that ID = WDigest)
    'HKLM\SYSTEM\CurrentControlSet\Control\Lsa|LmCompatibilityLevel' = @{
        PolicyForgeId    = 'WIN-SECURITY-NET-NTLMV2'
        Description      = 'LAN Manager Auth Level (NTLMv2 only)'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkSecurity_LANManagerAuthenticationLevel'
        RecommendedValue = '5'
        DataType         = 'Integer'
    }
    # WDigest — WIN-SECURITY-007
    'HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest|UseLogonCredential' = @{
        PolicyForgeId    = 'WIN-SECURITY-007'
        Description      = 'Disable WDigest Authentication'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/MSSLegacy/WDigestAuthentication'
        RecommendedValue = '0'
        DataType         = 'Integer'
    }
    # LSA PPL — WIN-SECURITY-012
    'HKLM\SYSTEM\CurrentControlSet\Control\Lsa|RunAsPPL' = @{
        PolicyForgeId    = 'WIN-SECURITY-012'
        Description      = 'Enable LSA Protection (PPL)'
        OmaUri           = 'Not available via OMA-URI CSP — use Intune Settings Catalog > Local Security Authority > RunAsPPL or PowerShell Remediation'
        RecommendedValue = '1'
        DataType         = 'Integer'
    }
    # Anonymous SAM — WIN-SECURITY-015
    'HKLM\SYSTEM\CurrentControlSet\Control\Lsa|RestrictAnonymousSAM' = @{
        PolicyForgeId    = 'WIN-SECURITY-015'
        Description      = 'Restrict Anonymous SAM Enumeration'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkAccess_DoNotAllowAnonymousEnumerationOfSAMAccounts'
        RecommendedValue = '1'
        DataType         = 'Integer'
    }
    # Windows Firewall — WIN-SECURITY-005
    'HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\DomainProfile|EnableFirewall' = @{
        PolicyForgeId    = 'WIN-SECURITY-005'
        Description      = 'Enable Windows Firewall (Domain Profile)'
        OmaUri           = './Device/Vendor/MSFT/Firewall/MdmStore/DomainProfile/EnableFirewall'
        RecommendedValue = 'true'
        DataType         = 'Boolean'
    }
    # LLMNR — WIN-SECURITY-003
    'HKLM\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient|EnableMulticast' = @{
        PolicyForgeId    = 'WIN-SECURITY-003'
        Description      = 'Disable LLMNR'
        OmaUri           = 'Not directly available via CSP — use PowerShell Remediation script or Intune Settings Catalog > DNS Client > Turn off Multicast Name Resolution'
        RecommendedValue = '0'
        DataType         = 'Integer'
    }
    # Defender Real-Time — DEF-001
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection|DisableRealtimeMonitoring' = @{
        PolicyForgeId    = 'DEF-001'
        Description      = 'Enable Defender Real-Time Protection'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/Defender/AllowRealtimeMonitoring'
        RecommendedValue = '1'
        DataType         = 'Integer'
    }
    # Defender Cloud (MAPS) — DEF-002
    # NOTE: The registry value SpynetReporting=2 means Advanced MAPS (registry level).
    # The OMA-URI CSP AllowCloudProtection uses value 1 to enable cloud protection
    # (CSP value 1 = enabled, regardless of MAPS level). These are different scales.
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet|SpynetReporting' = @{
        PolicyForgeId    = 'DEF-002'
        Description      = 'Enable Cloud Protection (Advanced MAPS)'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/Defender/AllowCloudProtection'
        RecommendedValue = '1'  # CSP value 1 = enabled. Registry Advanced MAPS = 2. These are different scales.
        DataType         = 'Integer'
    }
    # PUA Protection — DEF-010
    'HKLM\SOFTWARE\Policies\Microsoft\Windows Defender|PUAProtection' = @{
        PolicyForgeId    = 'DEF-010'
        Description      = 'Enable PUA Protection'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/Defender/PUAProtection'
        RecommendedValue = '1'
        DataType         = 'Integer'
    }
    # Telemetry — WIN-PRIVACY-001
    'HKLM\Software\Policies\Microsoft\Windows\DataCollection|AllowTelemetry' = @{
        PolicyForgeId    = 'WIN-PRIVACY-001'
        Description      = 'Disable Windows Telemetry'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry'
        RecommendedValue = '0'
        DataType         = 'Integer'
    }
    # Process Creation Logging — WIN-SECURITY-009
    'HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit|ProcessCreationIncludeCmdLine_Enabled' = @{
        PolicyForgeId    = 'WIN-SECURITY-009'
        Description      = 'Audit Process Creation (Event 4688 with command line)'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation'
        RecommendedValue = '3'
        DataType         = 'Integer'
    }
    # PS Script Block Logging — WIN-SECURITY-008
    'HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging|EnableScriptBlockLogging' = @{
        PolicyForgeId    = 'WIN-SECURITY-008'
        Description      = 'Enable PowerShell Script Block Logging'
        OmaUri           = './Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/EnableScriptBlockLogging'
        RecommendedValue = '1'
        DataType         = 'Integer'
    }
}

# ── Helper Functions ──────────────────────────────────────────────────────────────────

function Write-Status([string]$msg, [string]$color = 'Cyan') {
    Write-Host "[PolicyForge] $msg" -ForegroundColor $color
}

function Get-CurrentRegistryPolicies {
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

    $mapped   = @()
    $unmapped = @()

    foreach ($setting in $RegistrySettings) {
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
                Status           = if ($translation.OmaUri -like 'Not*') { 'Remediation Script' } else { 'Ready for Intune' }
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

# ── Main ──────────────────────────────────────────────────────────────────────────

Write-Status "PolicyForge GPO → Intune Translation Engine" 'Green'
Write-Status "Translation database: $($TranslationDB.Count) known mappings"

if ($GpResultXml -and (Test-Path $GpResultXml)) {
    Write-Status "Parsing GPRESULT XML: $GpResultXml"
    Write-Status "XML parsing mode: extracting registry extensions..." 'Yellow'
    $settings = @()
} else {
    Write-Status "No GPRESULT XML provided. Scanning live registry..."
    $settings = Get-CurrentRegistryPolicies
    Write-Status "Found $($settings.Count) registry policy values"
}

$results = Invoke-Translation -RegistrySettings $settings

Write-Status "Mapped: $($results.Mapped.Count) | Unmapped: $($results.Unmapped.Count)"

if ($results.Mapped.Count -gt 0) {
    $results.Mapped | Export-Csv -Path $OutputCsv -NoTypeInformation -Encoding UTF8
    Write-Status "Intune OMA-URI export saved: $OutputCsv" 'Green'
} else {
    Write-Status "No mapped policies found to export." 'Yellow'
}

if ($ShowUnmapped -and $results.Unmapped.Count -gt 0) {
    Write-Host ""
    Write-Status "Unmapped policies (no CSP equivalent in database):" 'Yellow'
    $results.Unmapped | Format-Table -AutoSize
}

Write-Host ""
Write-Status "Done. Review $OutputCsv and import into Intune > Devices > Configuration > Create > Custom" 'Green'
