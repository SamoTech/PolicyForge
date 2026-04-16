---
id: WIN-SECURITY-015
name: Restrict Anonymous Enumeration of SAM Accounts and Shares
category: [Security, Account Management, Network]
risk_level: High
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Restrict Anonymous Enumeration of SAM Accounts and Shares

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Local Policies
                    └── Security Options
                          ├── Network access: Do not allow anonymous enumeration of SAM accounts → Enabled
                          └── Network access: Do not allow anonymous enumeration of SAM accounts and shares → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Control\Lsa` | `RestrictAnonymousSAM` | `1` | REG_DWORD |
| `HKLM\SYSTEM\CurrentControlSet\Control\Lsa` | `RestrictAnonymous` | `1` | REG_DWORD |

## Description

Prevents unauthenticated null-session connections from enumerating user accounts, groups, and shares via SMB — removing the attacker's ability to map out usernames before credential attacks.

## PowerShell

```powershell
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $path -Name "RestrictAnonymousSAM" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $path -Name "RestrictAnonymous" -Value 1 -Type DWord -Force
Write-Output "Anonymous SAM enumeration restricted."
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1087.002](https://attack.mitre.org/techniques/T1087/002/) | Account Discovery: Domain Account |
| [T1135](https://attack.mitre.org/techniques/T1135/) | Network Share Discovery |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 2.3.10.2, 2.3.10.3
- **DISA STIG**: WN10-SO-000140, WN10-SO-000145
