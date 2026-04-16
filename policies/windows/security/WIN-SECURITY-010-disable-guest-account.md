---
id: WIN-SECURITY-010
name: Disable the Guest Account
category: [Security, Account Management, Baseline]
risk_level: Medium
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Disable the Guest Account

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Local Policies
                    └── Security Options
                          └── Accounts: Guest account status → Disabled
```

## Description

The built-in Guest account provides unauthenticated access with default permissions. It has historically been used as an initial foothold for privilege escalation and lateral movement. Disable on all systems.

## PowerShell

```powershell
Disable-LocalUser -Name "Guest"
Get-LocalUser -Name "Guest" | Select Name, Enabled
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1078.003](https://attack.mitre.org/techniques/T1078/003/) | Valid Accounts: Local Accounts |

## Compliance References

- **CIS Benchmark**: Level 1, Control 2.3.1.2
- **DISA STIG**: WN10-SO-000010
- **NIST SP 800-53**: AC-2
