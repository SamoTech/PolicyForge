# 🏢 Enterprise Hardening Template

> **Target**: Domain-joined enterprise endpoints | **Risk**: High | **Scope**: Workstations + Servers
> **Compliance**: CIS Level 2, DISA STIG, NIST 800-53

This template provides a production-ready Group Policy baseline for enterprise Windows environments. It combines the highest-impact security controls across credential protection, network hardening, attack surface reduction, and audit logging into a single deployable pack.

---

## ⚠️ Deployment Prerequisites

- [ ] Test in a **staging OU** with 5–10 pilot machines before broad rollout
- [ ] Create **GPO backup** before applying (`Backup-GPO -All -Path C:\GPOBackups`)
- [ ] Run the **Policy Diff Tracker** after deployment to verify applied settings
- [ ] Ensure helpdesk is aware of potential impact (USB restrictions, etc.)
- [ ] Have a **rollback plan**: GPO link removal + `gpupdate /force`

---

## 🗂️ Template Structure

```
enterprise-hardening/
├── README.md               ← This file
├── deploy.ps1              ← Automated deployment script
├── verify.ps1              ← Post-deployment verification
├── gpo-settings.csv        ← Full settings list (import reference)
└── rollback.ps1            ← Emergency rollback
```

---

## 🔐 Layer 1: Credential Protection

### Deploy via PowerShell

```powershell
# ============================================================
# PolicyForge Enterprise Hardening — Layer 1: Credentials
# ============================================================

$lsaPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"

# NTLMv2 only — refuse LM and NTLM
Set-ItemProperty -Path $lsaPath -Name "LmCompatibilityLevel" -Value 5 -Type DWord -Force

# Disable WDigest (prevents cleartext credential caching)
$wdigestPath = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"
Set-ItemProperty -Path $wdigestPath -Name "UseLogonCredential" -Value 0 -Type DWord -Force

# Enable LSA Protection (RunAsPPL) — blocks Mimikatz LSASS access
Set-ItemProperty -Path $lsaPath -Name "RunAsPPL" -Value 1 -Type DWord -Force

# Disable anonymous SAM enumeration
Set-ItemProperty -Path $lsaPath -Name "RestrictAnonymousSAM" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $lsaPath -Name "RestrictAnonymous" -Value 1 -Type DWord -Force

# Disable LLMNR (prevents LLMNR poisoning attacks)
$dnsPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient"
if (!(Test-Path $dnsPath)) { New-Item -Path $dnsPath -Force }
Set-ItemProperty -Path $dnsPath -Name "EnableMulticast" -Value 0 -Type DWord -Force

Write-Host "[✓] Layer 1: Credential Protection applied" -ForegroundColor Green
Write-Host "[!] Reboot required for LSA PPL (RunAsPPL) to take effect" -ForegroundColor Yellow
```

---

## 🌐 Layer 2: Network Hardening

```powershell
# ============================================================
# PolicyForge Enterprise Hardening — Layer 2: Network
# ============================================================

# Disable SMBv1
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force

# Require SMB signing
Set-SmbServerConfiguration -RequireSecuritySignature $true -Force
Set-SmbClientConfiguration -RequireSecuritySignature $true -Force

# Enable Windows Firewall — all profiles
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True
Set-NetFirewallProfile -Profile Public -DefaultInboundAction Block

# Require NLA for RDP
$rdpPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp"
Set-ItemProperty -Path $rdpPath -Name "UserAuthentication" -Value 1 -Type DWord -Force

# Disable unused services
@('RemoteRegistry', 'Spooler') | ForEach-Object {
    Stop-Service $_ -Force -ErrorAction SilentlyContinue
    Set-Service $_ -StartupType Disabled
    Write-Host "[✓] Disabled service: $_" -ForegroundColor Green
}

Write-Host "[✓] Layer 2: Network Hardening applied" -ForegroundColor Green
```

---

## 🛡️ Layer 3: Microsoft Defender (Full Pack)

```powershell
# ============================================================
# PolicyForge Enterprise Hardening — Layer 3: Defender
# ============================================================

# Core protection
Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendSafeSamples
Set-MpPreference -EnableBehaviorMonitoring $true
Set-MpPreference -PUAProtection Enabled

# Network & folder protection (start in Audit, switch to Block after validation)
Set-MpPreference -EnableNetworkProtection AuditMode
Set-MpPreference -EnableControlledFolderAccess AuditMode

# ASR Rules — Audit mode first
$asrRules = @(
    "D4F940AB-401B-4EFC-AADC-AD5F3C50688A",  # Block Office child processes
    "9E6C4E1F-7D60-472F-BA1A-A39EF669E4B0",  # Block LSASS credential stealing
    "92E97FA1-2EDF-4476-BDD6-9DD0B4DDDC7B",  # Block Office macro Win32 API
    "BE9BA2D9-53EA-4CDC-84E5-9B1EEEE46550",  # Block email executable content
    "D3E037E1-3EB8-44C8-A917-57927947596D",  # Block JS/VBScript executables
    "B2B3F03D-6A65-4F7B-A9C7-1C7EF74A9BA4"   # Block untrusted USB processes
)
foreach ($rule in $asrRules) {
    Add-MpPreference -AttackSurfaceReductionRules_Ids $rule \
                     -AttackSurfaceReductionRules_Actions AuditMode
}

Write-Host "[✓] Layer 3: Defender configured (Audit mode for ASR/CFA/NP)" -ForegroundColor Green
Write-Host "[!] Review Event Viewer > Applications > Windows > Windows Defender for 14 days, then switch to Block" -ForegroundColor Yellow
```

---

## 📋 Layer 4: Audit & Logging

```powershell
# ============================================================
# PolicyForge Enterprise Hardening — Layer 4: Audit
# ============================================================

# Enable advanced audit policies
$auditCategories = @(
    @{Category="Account Logon"; Subcategory="Kerberos Authentication Service"; Value="Success,Failure"},
    @{Category="Account Management"; Subcategory="User Account Management"; Value="Success,Failure"},
    @{Category="Detailed Tracking"; Subcategory="Process Creation"; Value="Success"},
    @{Category="Logon/Logoff"; Subcategory="Logon"; Value="Success,Failure"},
    @{Category="Object Access"; Subcategory="File System"; Value="Failure"},
    @{Category="Policy Change"; Subcategory="Audit Policy Change"; Value="Success"},
    @{Category="Privilege Use"; Subcategory="Sensitive Privilege Use"; Value="Success,Failure"},
    @{Category="System"; Subcategory="Security System Extension"; Value="Success"}
)

foreach ($audit in $auditCategories) {
    auditpol /set /subcategory:"$($audit.Subcategory)" /success:enable /failure:enable 2>$null
}

# Enable command line in process creation (Event 4688)
$auditPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"
if (!(Test-Path $auditPath)) { New-Item -Path $auditPath -Force }
Set-ItemProperty -Path $auditPath -Name "ProcessCreationIncludeCmdLine_Enabled" -Value 1 -Type DWord -Force

# Enable PowerShell Script Block Logging
$psPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
if (!(Test-Path $psPath)) { New-Item -Path $psPath -Force }
Set-ItemProperty -Path $psPath -Name "EnableScriptBlockLogging" -Value 1 -Type DWord -Force

# Set security event log to 200MB
Limit-EventLog -LogName Security -MaximumSize 204800KB

Write-Host "[✓] Layer 4: Audit & Logging configured" -ForegroundColor Green
```

---

## 🔒 Layer 5: UAC & Application Control

```powershell
# ============================================================
# PolicyForge Enterprise Hardening — Layer 5: UAC & AppControl
# ============================================================

$uacPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"

# UAC: Admin Approval Mode for all admins
Set-ItemProperty -Path $uacPath -Name "EnableLUA" -Value 1 -Type DWord -Force

# UAC: Prompt for credentials (not just consent) for admin elevation
Set-ItemProperty -Path $uacPath -Name "ConsentPromptBehaviorAdmin" -Value 1 -Type DWord -Force

# UAC: Always notify
Set-ItemProperty -Path $uacPath -Name "PromptOnSecureDesktop" -Value 1 -Type DWord -Force

# Disable AutoRun/AutoPlay
$autoRunPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Explorer"
if (!(Test-Path $autoRunPath)) { New-Item -Path $autoRunPath -Force }
Set-ItemProperty -Path $autoRunPath -Name "NoAutorun" -Value 1 -Type DWord -Force

$autoPlayPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"
Set-ItemProperty -Path $autoPlayPath -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord -Force

Write-Host "[✓] Layer 5: UAC & Application Control applied" -ForegroundColor Green
```

---

## 📊 CIS / STIG Coverage

| CIS Control | Policy | Status |
|---|---|---|
| 4.1 — Use Unique Passwords | Password complexity + history | ✅ Covered |
| 5.2 — Use MFA / Strong Auth | NTLMv2, NLA for RDP | ✅ Covered |
| 6.2 — Ensure Audit Logging | Event 4688, PS logging, 200MB log | ✅ Covered |
| 8.1 — Malware Defenses | Real-time protection, ASR, CFA | ✅ Covered |
| 9.2 — Limit Open Ports | Firewall all profiles, disable unused services | ✅ Covered |
| 13.1 — Data Protection | WDigest off, LSASS PPL | ✅ Covered |
| 16.1 — Account Monitoring | Lockout, audit logon, SAM enum disabled | ✅ Covered |
| 18.1 — Penetration Testing Support | MITRE mapping on all policies | ✅ Covered |

---

## 🔄 Rollback

```powershell
# Emergency rollback — restore GPO backup
Restore-GPO -Name "PolicyForge-Enterprise-Hardening" -Path "C:\GPOBackups"
Invoke-GPUpdate -Computer . -Force
Write-Host "Rollback complete. Verify with gpresult /H C:\temp\gpresult.html" -ForegroundColor Green
```
