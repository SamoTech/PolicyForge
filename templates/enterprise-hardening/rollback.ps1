#Requires -RunAsAdministrator
<#
.SYNOPSIS
    PolicyForge Enterprise Hardening — Rollback
    Removes registry values set by deploy.ps1, restoring Windows defaults.
.PARAMETER DryRun
    If set, shows what would be removed without making any modifications.
.EXAMPLE
    .\rollback.ps1
    .\rollback.ps1 -DryRun
.NOTES
    PolicyForge — https://github.com/SamoTech/PolicyForge
    Run as Administrator. Some settings (e.g. LmCompatibilityLevel) will revert
    to the Windows default value rather than being deleted, as removing the value
    entirely may behave differently from the default.
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'

# Settings to remove — mirrors deploy.ps1
# DefaultValue: the Windows out-of-box default (null = delete the value entirely)
$settings = @(
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"; Name="UseLogonCredential"; PolicyId="WIN-SECURITY-007"; Desc="Restore WDigest (remove override)"; DefaultValue=$null},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="RunAsPPL"; PolicyId="WIN-SECURITY-012"; Desc="Remove LSA PPL setting"; DefaultValue=$null},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="RestrictAnonymousSAM"; PolicyId="WIN-SECURITY-015"; Desc="Restore anonymous SAM default"; DefaultValue=$null},
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="LmCompatibilityLevel"; PolicyId="WIN-SECURITY-NET-NTLMV2"; Desc="Restore LM auth level default (3)"; DefaultValue=3},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient"; Name="EnableMulticast"; PolicyId="WIN-SECURITY-003"; Desc="Restore LLMNR default"; DefaultValue=$null},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"; Name="DisableRealtimeMonitoring"; PolicyId="DEF-001"; Desc="Remove Defender RT monitoring override"; DefaultValue=$null},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet"; Name="SpynetReporting"; PolicyId="DEF-002"; Desc="Remove MAPS override"; DefaultValue=$null},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender"; Name="PUAProtection"; PolicyId="DEF-010"; Desc="Remove PUA protection override"; DefaultValue=$null},
    @{Path="HKLM:\Software\Policies\Microsoft\Windows\DataCollection"; Name="AllowTelemetry"; PolicyId="WIN-PRIVACY-001"; Desc="Restore telemetry default"; DefaultValue=$null},
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"; Name="EnableLUA"; PolicyId="WIN-SECURITY-016"; Desc="Restore UAC LUA default"; DefaultValue=1},
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"; Name="ConsentPromptBehaviorAdmin"; PolicyId="WIN-SECURITY-016"; Desc="Restore UAC prompt default (5)"; DefaultValue=5},
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"; Name="ProcessCreationIncludeCmdLine_Enabled"; PolicyId="WIN-SECURITY-009"; Desc="Remove process creation cmd logging"; DefaultValue=$null},
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"; Name="EnableScriptBlockLogging"; PolicyId="WIN-SECURITY-008"; Desc="Remove PS Script Block Logging"; DefaultValue=$null}
)

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PolicyForge Enterprise Hardening — Rollback.ps1  ║" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "║   DRY RUN — no changes will be made                ║" -ForegroundColor Yellow
}
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$reverted = 0
$skipped  = 0
$failed   = 0

foreach ($s in $settings) {
    if (!(Test-Path $s.Path)) {
        Write-Host "[SKIP   ] $($s.PolicyId.PadRight(25)) Key not present: $($s.Path)" -ForegroundColor Gray
        $skipped++
        continue
    }

    $exists = $null -ne (Get-ItemProperty -Path $s.Path -Name $s.Name -ErrorAction SilentlyContinue)

    if (!$exists) {
        Write-Host "[SKIP   ] $($s.PolicyId.PadRight(25)) Value not set: $($s.Name)" -ForegroundColor Gray
        $skipped++
        continue
    }

    if ($DryRun) {
        if ($null -ne $s.DefaultValue) {
            Write-Host "[DRYRUN ] Would set $($s.Name) = $($s.DefaultValue) (default)" -ForegroundColor Yellow
        } else {
            Write-Host "[DRYRUN ] Would remove $($s.Name)" -ForegroundColor Yellow
        }
        $skipped++
    } else {
        try {
            if ($null -ne $s.DefaultValue) {
                Set-ItemProperty -Path $s.Path -Name $s.Name -Value $s.DefaultValue -Force
                Write-Host "[RESET  ] $($s.PolicyId.PadRight(25)) $($s.Desc) → $($s.DefaultValue)" -ForegroundColor Green
            } else {
                Remove-ItemProperty -Path $s.Path -Name $s.Name -Force
                Write-Host "[REMOVED] $($s.PolicyId.PadRight(25)) $($s.Desc)" -ForegroundColor Green
            }
            $reverted++
        } catch {
            Write-Host "[FAILED ] $($s.PolicyId) — $($s.Desc): $_" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "══════════════════════════════════" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  DRY RUN complete. $($skipped) settings would be processed." -ForegroundColor Yellow
} else {
    Write-Host "  REVERTED: $reverted" -ForegroundColor Green
    Write-Host "  SKIPPED : $skipped" -ForegroundColor Gray
    Write-Host "  FAILED  : $failed" -ForegroundColor $(if($failed -gt 0){'Red'}else{'Green'})
}
Write-Host "══════════════════════════════════" -ForegroundColor Cyan
