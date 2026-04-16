---
id: WIN-SECURITY-013
name: Require Network Level Authentication for RDP
category: [Security, Remote Access, Authentication]
risk_level: High
applies_to: [Windows Vista+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Require Network Level Authentication for RDP

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Remote Desktop Services
                    └── Remote Desktop Session Host
                          └── Security
                                └── Require user authentication for remote connections
                                    by using Network Level Authentication → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services` | `UserAuthentication` | `1` | REG_DWORD |

## Description

NLA forces users to authenticate **before** the Windows login screen is rendered, preventing unauthenticated users from reaching the login UI and enabling BlueKeep-style exploits and credential brute-force. Minimum acceptable RDP security configuration.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "UserAuthentication" -Value 1 -Type DWord -Force
Write-Output "NLA required for RDP."
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1021.001](https://attack.mitre.org/techniques/T1021/001/) | Remote Services: Remote Desktop Protocol |
| [T1110](https://attack.mitre.org/techniques/T1110/) | Brute Force |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.65.3.2
- **DISA STIG**: WN10-CC-000280
