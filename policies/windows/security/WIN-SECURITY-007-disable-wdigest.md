---
id: WIN-SECURITY-007
name: Disable WDigest Authentication
category: [Security, Credential Protection, Authentication]
risk_level: Critical
risk_emoji: 🔴
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Disable WDigest Authentication

> 🔴 **Risk Level: Critical** — WDigest stores plaintext passwords in LSASS memory. Disabling it is one of the highest-impact single-registry changes you can make to stop credential theft.

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── (No native GPO — registry only)
```

> **Note:** WDigest has no ADMX template. Deploy via Group Policy Preferences (Registry) or PowerShell startup script.

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest` | `UseLogonCredential` | `0` | REG_DWORD |

**Values:**
- `1` = WDigest enabled — plaintext credentials cached in LSASS ❌
- `0` = WDigest disabled — no plaintext caching ✅

## Description

WDigest is a legacy authentication protocol designed for HTTP digest authentication. When enabled, Windows caches the user's plaintext password in LSASS memory so WDigest can respond to HTTP challenges. Attackers using Mimikatz's `sekurlsa::wdigest` command can extract these plaintext credentials from any authenticated session. Disabling WDigest forces LSASS to stop caching plaintext passwords. This is enabled by default on Windows XP through Server 2012 R2; disabled by default from Windows 8.1/Server 2012 R2 with KB2871997 applied.

## PowerShell

```powershell
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"

# Create key if missing
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }

# Disable WDigest
Set-ItemProperty -Path $path -Name "UseLogonCredential" -Value 0 -Type DWord -Force

Write-Output "WDigest disabled. Plaintext credential caching stopped."

# Verify
Get-ItemProperty -Path $path -Name "UseLogonCredential"
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/MSSLegacy/WDigestAuthentication` |
| Data Type | Integer |
| Value | `0` |

## Impact

- ✅ Eliminates plaintext password exposure in LSASS memory
- ✅ Defeats `sekurlsa::wdigest` Mimikatz module
- ✅ No user-facing change — transparent security improvement
- ✅ Takes effect at next logon (no reboot required)
- ⚠️ May break legacy IIS applications using HTTP Digest authentication
- ℹ️ Already disabled by default on Windows 8.1+ and Server 2012 R2+ with KB2871997

## Use Cases

- **Legacy OS environments** — critical on Windows 7, Server 2008 R2 which still default to WDigest enabled
- **Post-breach response** — immediate action item after any credential dumping incident
- **Enterprise hardening** — foundational policy in all Windows security baselines
- **Red team defense** — directly counters Mimikatz credential dumping workflow
- **Audit remediation** — commonly flagged by vulnerability scanners and pen testers

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | OS Credential Dumping: LSASS Memory |
| [T1555](https://attack.mitre.org/techniques/T1555/) | Credentials from Password Stores |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.3.7
- **DISA STIG**: WN10-CC-000038
- **NIST SP 800-171**: 3.5.10
- **MS Security Baseline**: Included in all Windows 10/11 baselines

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
