---
id: DEF-010
name: Enable Potentially Unwanted Application (PUA) Protection
category: [Defender, PUA, Baseline]
risk_level: Low
applies_to: [Windows 10 2004+, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable PUA Protection

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender` | `PUAProtection` | `1` | REG_DWORD |

> Values: 0 = Disabled, 1 = Block, 2 = Audit

## Description

PUA protection detects and blocks applications that are not technically malware but exhibit potentially harmful behaviors: bundled adware, browser hijackers, cryptocurrency miners installed without consent, dubious system optimizers, and software with deceptive bundling. These applications often serve as vectors for more serious malware and represent a significant helpdesk burden.

## PowerShell

```powershell
Set-MpPreference -PUAProtection Enabled

# Verify
Get-MpPreference | Select PUAProtection
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/PUAProtection
Data Type: Integer
Value: 1
```

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.47.16
