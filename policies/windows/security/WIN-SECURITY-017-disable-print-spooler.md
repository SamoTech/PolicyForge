---
id: WIN-SECURITY-017
name: Disable Print Spooler Service (Non-Print Servers)
category: [Security, Service Hardening, PrintNightmare]
risk_level: Critical
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable Print Spooler Service

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Services\Spooler` | `Start` | `4` | REG_DWORD |

> Start values: 2 = Automatic, 3 = Manual, 4 = Disabled

## Description

The Print Spooler is the source of **PrintNightmare (CVE-2021-1675, CVE-2021-34527)** and **SpoolFool (CVE-2022-21999)**. On non-printing systems, disabling it eliminates this entire attack surface. Microsoft explicitly recommends disabling it on all Domain Controllers.

## Impact

- Printing is **disabled** on affected systems
- Required on all DCs per Microsoft post-PrintNightmare guidance
- Do not apply to dedicated print servers

## PowerShell

```powershell
Stop-Service -Name Spooler -Force
Set-Service -Name Spooler -StartupType Disabled
Get-Service -Name Spooler | Select Name, Status, StartType
```

## MITRE ATT&CK Mapping

| Technique | CVE | Description |
|---|---|---|
| [T1547.012](https://attack.mitre.org/techniques/T1547/012/) | CVE-2021-34527 | PrintNightmare privilege escalation |

## Compliance References

- **Microsoft Advisory**: KB5005010
- **CIS Benchmark**: Level 1 (DC only), Control 18.3.5
