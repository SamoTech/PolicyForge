---
id: WIN-SECURITY-012
name: Enable LSA Protection (RunAsPPL)
category: [Security, Credential Protection, Critical Hardening]
risk_level: High
applies_to: [Windows 8.1+, Windows 10, Windows 11, Windows Server 2012 R2+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable LSA Protection (RunAsPPL)

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Control\Lsa` | `RunAsPPL` | `1` | REG_DWORD |

## Description

Configures LSA as a **Protected Process Light (PPL)**, preventing non-protected processes — including those running as SYSTEM — from reading LSASS memory or injecting into it. Directly blocks `mimikatz`, `procdump`, and similar credential dumping tools. First line of defense before Credential Guard is available.

## Impact

- Some security software (AV/EDR) may fail — verify compatibility first
- Requires a **reboot** to take effect

## PowerShell

```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" `
  -Name "RunAsPPL" -Value 1 -Type DWord -Force
Write-Output "LSA Protection enabled. Reboot required."
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/MSSecurityGuide/ConfigureLsaProtectedProcess
Data Type: Integer
Value: 1
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | Credential Dumping: LSASS Memory |

## Compliance References

- **DISA STIG**: WN10-SO-000011
- **CIS Benchmark**: Level 1, Control 18.3.1
