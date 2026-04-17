#Requires -RunAsAdministrator
<#
.SYNOPSIS
    PolicyForge Enterprise Hardening — Deploy
    Applies all enterprise hardening registry settings from the verified policy baseline.
.PARAMETER DryRun
    If set, shows what would be changed without making any modifications.
.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -DryRun
.NOTES
    PolicyForge — https://github.com/SamoTech/PolicyForge
    Run as Administrator. Run verify.ps1 after deployment to confirm all settings applied.
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$settings = @(
    # Credentials
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"; Name="UseLogonCredential"; Value=0; Type="DWord"; PolicyId="WIN-SECURITY-007"; Desc="Disable WDigest Authentication"},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="RunAsPPL"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-012"; Desc="Enable LSA Protection (PPL)"},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="RestrictAnonymousSAM"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-015"; Desc="Restrict Anonymous SAM Enumeration"},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="LmCompatibilityLevel"; Value=5; Type="DWord"; PolicyId="WIN-SECURITY-NET-NTLMV2"; Desc="NTLMv2 only (LM auth level 5)"},
    # Network
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient"; Name="EnableMulticast"; Value=0; Type="DWord"; PolicyId="WIN-SECURITY-003"; Desc="Disable LLMNR"},
    # Defender
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"; Name="DisableRealtimeMonitoring"; Value=0; Type="DWord"; PolicyId="DEF-001"; Desc="Enable Real-Time Protection"},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet"; Name="SpynetReporting"; Value=2; Type="DWord"; PolicyId="DEF-002"; Desc="Enable Cloud Protection (Advanced MAPS)"},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender"; Name="PUAProtection"; Value=1; Type="DWord"; PolicyId="DEF-010"; Desc="Enable PUA Protection"},
    # Privacy
    @{Path="HKLM:\Software\Policies\Microsoft\Windows\DataCollection"; Name="AllowTelemetry"; Value=0; Type="DWord"; PolicyId="WIN-PRIVACY-001"; Desc="Disable Telemetry"},
    # UAC
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"; Name="EnableLUA"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-016"; Desc="Enable UAC Admin Approval Mode"},
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"; Name="ConsentPromptBehaviorAdmin"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-016"; Desc="UAC prompt for credentials"},
    # Logging
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"; Name="ProcessCreationIncludeCmdLine_Enabled"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-009"; Desc="Enable Event 4688 command line logging"},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"; Name="EnableScriptBlockLogging"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-008"; Desc="Enable PS Script Block Logging"}
)

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PolicyForge Enterprise Hardening — Deploy.ps1    ║" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "║   DRY RUN — no changes will be made                ║" -ForegroundColor Yellow
}
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$applied = 0
$skipped = 0
$failed  = 0

foreach ($s in $settings) {
    # Ensure registry key path exists
    if (!(Test-Path $s.Path)) {
        if ($DryRun) {
            Write-Host "[DRYRUN ] Would create key: $($s.Path)" -ForegroundColor Yellow
        } else {
            try {
                New-Item -Path $s.Path -Force | Out-Null
            } catch {
                Write-Host "[FAILED ] $($s.PolicyId) — could not create key $($s.Path): $_" -ForegroundColor Red
                $failed++
                continue
            }
        }
    }

    if ($DryRun) {
        Write-Host "[DRYRUN ] $($s.PolicyId.PadRight(25)) $($s.Desc) → $($s.Name)=$($s.Value)" -ForegroundColor Yellow
        $skipped++
    } else {
        try {
            Set-ItemProperty -Path $s.Path -Name $s.Name -Value $s.Value -Type $s.Type -Force
            Write-Host "[APPLIED] $($s.PolicyId.PadRight(25)) $($s.Desc)" -ForegroundColor Green
            $applied++

            # Log to Windows Application event log
            try {
                Write-EventLog -LogName Application -Source "PolicyForge" -EventId 1000 `
                    -EntryType Information `
                    -Message "PolicyForge Deploy: applied $($s.PolicyId) — $($s.Desc) ($($s.Path)\$($s.Name)=$($s.Value))"
            } catch {
                # Event source may not be registered; non-fatal
            }
        } catch {
            Write-Host "[FAILED ] $($s.PolicyId) — $($s.Desc): $_" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "══════════════════════════════════" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  DRY RUN complete. $skipped settings would be applied." -ForegroundColor Yellow
} else {
    Write-Host "  APPLIED : $applied" -ForegroundColor Green
    Write-Host "  FAILED  : $failed" -ForegroundColor $(if($failed -gt 0){'Red'}else{'Green'})
    Write-Host "  TOTAL   : $($settings.Count)" -ForegroundColor Cyan
}
Write-Host "══════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (-not $DryRun -and $applied -gt 0) {
    Write-Host "Run verify.ps1 to confirm all settings applied correctly." -ForegroundColor Cyan
}
