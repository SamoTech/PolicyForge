---
id: WIN-SECURITY-018
name: Disable Remote Registry Service
category: [Security, Service Hardening, Remote Access]
risk_level: High
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Disable Remote Registry Service

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Services\RemoteRegistry` | `Start` | `4` | REG_DWORD |

## Description

Allows remote modification of the Windows registry over the network. Attackers with valid credentials can use it to modify registry keys, persistence mechanisms, and security settings without interactive logon. Disable unless a specific management tool requires it.

## PowerShell

```powershell
Stop-Service -Name RemoteRegistry -ErrorAction SilentlyContinue
Set-Service -Name RemoteRegistry -StartupType Disabled
Write-Output "Remote Registry service disabled."
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1112](https://attack.mitre.org/techniques/T1112/) | Modify Registry |
| [T1021.002](https://attack.mitre.org/techniques/T1021/002/) | Remote Services: SMB |

## Compliance References

- **CIS Benchmark**: Level 1, Control 5.28
- **DISA STIG**: WN10-00-000175
