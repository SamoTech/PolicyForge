---
id: EDGE-002
name: Block Edge Built-in Password Manager
category: [Edge, Credential Security, Compliance]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 10, Windows 11, Microsoft Edge 77+]
test_status: "✅ Tested on Edge 124, Windows 11 24H2"
---

# Block Edge Built-in Password Manager

> 🟠 **Risk Level: Medium** — The built-in Edge password manager stores credentials locally and syncs to Microsoft accounts. In enterprise environments, credentials should be managed by approved PAM solutions only.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Microsoft Edge
              └── Password manager and protection
                    └── Enable saving passwords to the password manager → Disabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `PasswordManagerEnabled` | `0` | REG_DWORD |

## Description

The Edge built-in password manager saves credentials in an encrypted local store tied to the Windows user profile and optionally syncs to a Microsoft account. In enterprise environments, this creates risk: credentials may sync outside the corporate boundary, and local credential stores can be extracted by attackers with user-level access. Enterprise environments should disable the built-in manager and enforce use of an approved PAM or password manager solution (CyberArk, 1Password Business, Keeper, etc.).

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "PasswordManagerEnabled" -Value 0 -Type DWord

# Also disable password reveal button
Set-ItemProperty -Path $path -Name "PasswordRevealEnabled" -Value 0 -Type DWord

# Verify
Get-ItemProperty -Path $path | Select-Object PasswordManagerEnabled, PasswordRevealEnabled
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Browser/AllowPasswordManager` |
| Data Type | Integer |
| Value | `0` |

## Impact

- ✅ Prevents credentials from syncing outside corporate boundary via Microsoft accounts
- ✅ Eliminates local credential store as an attacker extraction target
- ✅ Forces use of approved enterprise PAM/password manager
- ⚠️ Users must use an alternative password manager — ensure approved solution is deployed first
- ⚠️ Existing saved passwords are not deleted — run cleanup script if required
- ℹ️ Combine with `SyncDisabled=1` to fully prevent Microsoft account sync

## Use Cases

- **Enterprise credential hygiene** — centralize credential management in approved PAM
- **BYOD policy** — prevent personal Microsoft account sync from capturing corporate credentials
- **Compliance** — PCI-DSS requires credential storage controls
- **Zero-trust baseline** — no credentials outside approved vault
- **Post-breach hardening** — disable browser credential stores after credential theft incident

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Password Stores: Credentials from Web Browsers |
| [T1539](https://attack.mitre.org/techniques/T1539/) | Steal Web Session Cookie |

## Compliance References

- **CIS Microsoft Edge Benchmark**: Level 1, Control 2.5
- **PCI-DSS**: Requirement 8.2 (Credential Management)
- **NIST SP 800-53**: IA-5 (Authenticator Management)

## Test Status

✅ Tested on Microsoft Edge 124, Windows 11 24H2
