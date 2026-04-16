---
id: WIN-SECURITY-015
name: Restrict Anonymous Enumeration of SAM Accounts and Shares
category: [Security, Account Management, Network]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Restrict Anonymous Enumeration of SAM Accounts and Shares

> 🔴 **Risk Level: High** — Unauthenticated null-session enumeration lets attackers map all usernames and shares before launching credential attacks. Block it before it leaks your entire user directory.

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

Prevents unauthenticated null-session connections from enumerating user accounts, groups, and shares via SMB — removing the attacker's ability to map out usernames before credential attacks. When `RestrictAnonymous = 0`, any unauthenticated client can connect via IPC$ and query the SAM database for a full list of local accounts. This feeds directly into password spraying, Kerberoasting targeting, and social engineering attacks.

## PowerShell

```powershell
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $path -Name "RestrictAnonymousSAM" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $path -Name "RestrictAnonymous" -Value 1 -Type DWord -Force
Write-Output "Anonymous SAM enumeration restricted."

# Verify
Get-ItemProperty -Path $path | Select-Object RestrictAnonymousSAM, RestrictAnonymous
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI (SAM) | `./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkAccess_DoNotAllowAnonymousEnumerationOfSAMAccounts` |
| OMA-URI (Shares) | `./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkAccess_DoNotAllowAnonymousEnumerationOfSAMAccountsandShares` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Blocks unauthenticated SAM account enumeration via null sessions
- ✅ Prevents share discovery without credentials
- ✅ Removes username list that feeds password spraying and Kerberoasting
- ⚠️ May break legacy applications that rely on anonymous IPC$ access
- ⚠️ Can affect older monitoring tools that query shares anonymously
- ℹ️ Pair with RestrictAnonymous = 2 for maximum restriction (blocks all anonymous access)

## Use Cases

- **Pre-attack reconnaissance defense** — denies attackers the username list needed for credential attacks
- **Active Directory hardening** — critical on all domain controllers and member servers
- **Password spray prevention** — no username list = no spray targets
- **SMB hardening baseline** — part of any Windows network security baseline
- **External-facing servers** — essential on any Windows server with network exposure

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1087.002](https://attack.mitre.org/techniques/T1087/002/) | Account Discovery: Domain Account |
| [T1135](https://attack.mitre.org/techniques/T1135/) | Network Share Discovery |
| [T1110.003](https://attack.mitre.org/techniques/T1110/003/) | Brute Force: Password Spraying |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 2.3.10.2, 2.3.10.3
- **DISA STIG**: WN10-SO-000140, WN10-SO-000145
- **NIST SP 800-53**: AC-3, AC-6
- **MS Security Baseline**: Included in all Windows 10/11 baselines

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
