#Requires -RunAsAdministrator
<#
.SYNOPSIS
    PolicyForge Enterprise Hardening — Post-Deployment Verification
    Run after applying the enterprise hardening template to confirm all settings applied correctly.
.NOTES
    Run as Administrator. Outputs a Pass/Fail/Missing report.
    PolicyForge — https://github.com/SamoTech/PolicyForge
#>

$ErrorActionPreference = 'Continue'
$results = @()
$pass = 0; $fail = 0; $missing = 0

function Test-RegistrySetting([string]$Path, [string]$Name, $Expected, [string]$PolicyId, [string]$Description) {
    try {
        $actual = Get-ItemPropertyValue -Path $Path -Name $Name -ErrorAction Stop
        if ($actual -eq $Expected) {
            return [PSCustomObject]@{ Status="PASS"; PolicyId=$PolicyId; Description=$Description; Expected=$Expected; Actual=$actual }
        } else {
            return [PSCustomObject]@{ Status="FAIL"; PolicyId=$PolicyId; Description=$Description; Expected=$Expected; Actual=$actual }
        }
    } catch [System.Management.Automation.ItemNotFoundException] {
        return [PSCustomObject]@{ Status="MISSING"; PolicyId=$PolicyId; Description=$Description; Expected=$Expected; Actual="(key not found)" }
    } catch {
        return [PSCustomObject]@{ Status="MISSING"; PolicyId=$PolicyId; Description=$Description; Expected=$Expected; Actual="(not set)" }
    }
}

# ── Define checks ────────────────────────────────────────────────────────────

$checks = @(
    # Credentials
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"; Name="UseLogonCredential"; Expected=0; PolicyId="WIN-SECURITY-007"; Desc="WDigest disabled"},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="RunAsPPL"; Expected=1; PolicyId="WIN-SECURITY-012"; Desc="LSA PPL enabled"},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="RestrictAnonymousSAM"; Expected=1; PolicyId="WIN-SECURITY-015"; Desc="Anonymous SAM enum blocked"},
    # NTLMv2 auth level — no canonical PolicyForge ID; tracked separately
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="LmCompatibilityLevel"; Expected=5; PolicyId="WIN-SECURITY-NET-NTLMV2"; Desc="NTLMv2 only (LM auth level 5)"},
    # Network
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient"; Name="EnableMulticast"; Expected=0; PolicyId="WIN-SECURITY-003"; Desc="LLMNR disabled"},
    # Defender
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"; Name="DisableRealtimeMonitoring"; Expected=0; PolicyId="DEF-001"; Desc="Real-time protection on"},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet"; Name="SpynetReporting"; Expected=2; PolicyId="DEF-002"; Desc="Cloud protection (Advanced MAPS)"},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender"; Name="PUAProtection"; Expected=1; PolicyId="DEF-010"; Desc="PUA protection on"},
    # Privacy
    @{Path="HKLM:\Software\Policies\Microsoft\Windows\DataCollection"; Name="AllowTelemetry"; Expected=0; PolicyId="WIN-PRIVACY-001"; Desc="Telemetry disabled"},
    # UAC
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"; Name="EnableLUA"; Expected=1; PolicyId="WIN-SECURITY-016"; Desc="UAC Admin Approval Mode on"},
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"; Name="ConsentPromptBehaviorAdmin"; Expected=1; PolicyId="WIN-SECURITY-016"; Desc="UAC prompt for credentials"},
    # Logging
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"; Name="ProcessCreationIncludeCmdLine_Enabled"; Expected=1; PolicyId="WIN-SECURITY-009"; Desc="Event 4688 cmd line logging"},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"; Name="EnableScriptBlockLogging"; Expected=1; PolicyId="WIN-SECURITY-008"; Desc="PS Script Block Logging on"}
)

# ── Run checks ───────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PolicyForge Enterprise Hardening — Verify.ps1     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

foreach ($c in $checks) {
    $r = Test-RegistrySetting -Path $c.Path -Name $c.Name -Expected $c.Expected -PolicyId $c.PolicyId -Description $c.Desc
    $results += $r
    $color = switch ($r.Status) { "PASS" { "Green" } "FAIL" { "Red" } "MISSING" { "Yellow" } }
    Write-Host "[$($r.Status.PadRight(7))] $($r.PolicyId.PadRight(25)) $($r.Description)" -ForegroundColor $color
    switch ($r.Status) { "PASS" { $pass++ } "FAIL" { $fail++ } "MISSING" { $missing++ } }
}

# ── Defender status ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "── Defender Live Status ──" -ForegroundColor Cyan
try {
    $mpStatus = Get-MpComputerStatus
    Write-Host "  Real-Time Protection : $($mpStatus.RealTimeProtectionEnabled)" -ForegroundColor $(if($mpStatus.RealTimeProtectionEnabled){'Green'}else{'Red'})
    Write-Host "  Tamper Protection    : $($mpStatus.IsTamperProtected)" -ForegroundColor $(if($mpStatus.IsTamperProtected){'Green'}else{'Yellow'})
    Write-Host "  AM Service Enabled   : $($mpStatus.AMServiceEnabled)" -ForegroundColor $(if($mpStatus.AMServiceEnabled){'Green'}else{'Red'})
} catch {
    Write-Host "  [!] Could not query Defender status" -ForegroundColor Yellow
}

# ── Summary ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "══════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PASS   : $pass" -ForegroundColor Green
Write-Host "  FAIL   : $fail" -ForegroundColor $(if($fail -gt 0){'Red'}else{'Green'})
Write-Host "  MISSING: $missing" -ForegroundColor $(if($missing -gt 0){'Yellow'}else{'Green'})
Write-Host "  TOTAL  : $($checks.Count)" -ForegroundColor Cyan
Write-Host "══════════════════════════════════" -ForegroundColor Cyan

# Export CSV
$csvPath = ".\policyforge-verify-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
$results | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
Write-Host ""
Write-Host "Full report saved: $csvPath" -ForegroundColor Cyan
