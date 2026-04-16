---
id: WIN-SECURITY-007
name: Disable WDigest Authentication (Plain-Text Password Storage)
category: [Security, Credential Protection, Critical Hardening]
risk_level: Critical
applies_to: [Windows 7+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable WDigest Authentication

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest` | `UseLogonCredential` | `0` | REG_DWORD |

## Description

When enabled, Windows stores a **plain-text copy of the user's password** in LSASS memory — the primary target of `mimikatz sekurlsa::wdigest`. This was default on Windows 7/Server 2008. Must be explicitly disabled on all modern systems.

## Use Cases

- ✅ **Every Windows environment** — no reason for WDigest in 2025
- ✅ Post-breach remediation
- ✅ Complements Credential Guard (`WIN-SECURITY-006`)

## PowerShell

```powershell
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "UseLogonCredential" -Value 0 -Type DWord -Force
Write-Output "WDigest plaintext credential caching disabled."
```

## Registry Export (.reg)

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest]
"UseLogonCredential"=dword:00000000
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | OS Credential Dumping: LSASS Memory |

## Compliance References

- **DISA STIG**: WN10-CC-000038
- **CIS Benchmark**: Level 1, Control 18.3.7
- **MS Security Advisory**: 2871997
