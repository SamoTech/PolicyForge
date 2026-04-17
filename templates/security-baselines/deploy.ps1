#Requires -RunAsAdministrator
<#
.SYNOPSIS
    PolicyForge Security Baselines — Deploy
    Applies the security baseline registry settings aligned with CIS/DISA/Microsoft recommendations.
.PARAMETER DryRun
    If set, shows what would be changed without making any modifications.
.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -DryRun
.NOTES
    PolicyForge — https://github.com/SamoTech/PolicyForge
    Run as Administrator. Run verify.ps1 after deployment to confirm settings applied.
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$settings = @(
    # WIN-SECURITY-001: Disable AutoRun
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"; Name="NoDriveTypeAutoRun"; Value=255; Type="DWord"; PolicyId="WIN-SECURITY-001"; Desc="Disable AutoRun (all drive types)"},
    # WIN-SECURITY-003: Disable LLMNR
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient"; Name="EnableMulticast"; Value=0; Type="DWord"; PolicyId="WIN-SECURITY-003"; Desc="Disable LLMNR"},
    # WIN-SECURITY-005: Enable Windows Firewall (Domain)
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall\DomainProfile"; Name="EnableFirewall"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-005"; Desc="Enable Firewall (Domain Profile)"},
    # WIN-SECURITY-005: Enable Windows Firewall (Private)
    @{Path="HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall\StandardProfile"; Name="EnableFirewall"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-005"; Desc="Enable Firewall (Private Profile)"},
    # WIN-SECURITY-007: Disable WDigest
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"; Name="UseLogonCredential"; Value=0; Type="DWord"; PolicyId="WIN-SECURITY-007"; Desc="Disable WDigest Authentication"},
    # WIN-SECURITY-009: Audit Process Creation
    @{Path="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"; Name="ProcessCreationIncludeCmdLine_Enabled"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-009"; Desc="Enable Event 4688 command line logging"},
    # WIN-SECURITY-013: Require NLA for RDP
    @{Path="HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp"; Name="UserAuthentication"; Value=1; Type="DWord"; PolicyId="WIN-SECURITY-013"; Desc="Require NLA for RDP"},
    # WIN-PRIVACY-001: Disable Telemetry
    @{Path="HKLM:\Software\Policies\Microsoft\Windows\DataCollection"; Name="AllowTelemetry"; Value=0; Type="DWord"; PolicyId="WIN-PRIVACY-001"; Desc="Disable Windows Telemetry"}
)

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PolicyForge Security Baselines — Deploy.ps1     ║" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "║   DRY RUN — no changes will be made                ║" -ForegroundColor Yellow
}
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$applied = 0
$failed  = 0

foreach ($s in $settings) {
    if (!(Test-Path $s.Path)) {
        if ($DryRun) {
            Write-Host "[DRYRUN ] Would create key: $($s.Path)" -ForegroundColor Yellow
        } else {
            try {
                New-Item -Path $s.Path -Force | Out-Null
            } catch {
                Write-Host "[FAILED ] $($s.PolicyId) — could not create key: $_" -ForegroundColor Red
                $failed++
                continue
            }
        }
    }

    if ($DryRun) {
        Write-Host "[DRYRUN ] $($s.PolicyId.PadRight(25)) $($s.Desc) → $($s.Name)=$($s.Value)" -ForegroundColor Yellow
    } else {
        try {
            Set-ItemProperty -Path $s.Path -Name $s.Name -Value $s.Value -Type $s.Type -Force
            Write-Host "[APPLIED] $($s.PolicyId.PadRight(25)) $($s.Desc)" -ForegroundColor Green
            $applied++
        } catch {
            Write-Host "[FAILED ] $($s.PolicyId) — $($s.Desc): $_" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "══════════════════════════════════" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "  DRY RUN complete. $($settings.Count) settings would be applied." -ForegroundColor Yellow
} else {
    Write-Host "  APPLIED : $applied" -ForegroundColor Green
    Write-Host "  FAILED  : $failed" -ForegroundColor $(if($failed -gt 0){'Red'}else{'Green'})
    Write-Host "  TOTAL   : $($settings.Count)" -ForegroundColor Cyan
}
Write-Host "══════════════════════════════════" -ForegroundColor Cyan
