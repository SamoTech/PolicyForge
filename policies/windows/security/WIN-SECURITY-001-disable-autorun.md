---
id: WIN-SECURITY-001
name: Disable AutoRun / AutoPlay
category: [Security, Endpoint Hardening]
risk_level: High
applies_to:
  - Windows 7+
  - Windows 10 (all versions)
  - Windows 11 (all versions)
  - Windows Server 2008+
test_status: "✅ Tested on Windows 10 22H2 and Windows 11 23H2"
---

# Disable AutoRun / AutoPlay

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── AutoPlay Policies
                    ├── Turn off AutoPlay               ← Set to "Enabled, All Drives"
                    └── Disallow AutoPlay for non-volume devices ← Set to "Enabled"
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer` | `NoDriveTypeAutoRun` | `255` | REG_DWORD |
| `HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer` | `NoAutorun` | `1` | REG_DWORD |

> `255` (0xFF) disables AutoRun for all drive types.

## Description

AutoRun and AutoPlay automatically execute programs when removable media (USB, CD, DVD) is inserted. This is one of the oldest and most consistently exploited attack vectors — malware like Conficker spread globally by abusing AutoRun. **Disabling AutoRun on all drives is a mandatory baseline security requirement.**

## Impact

- Users must manually open removable drives (minor inconvenience)
- Kiosk or presentation setups relying on USB auto-start must be reconfigured
- No functional impact on system performance

## Use Cases

- ✅ **Any enterprise environment** — this is a mandatory baseline
- ✅ Compliance with CIS Benchmark (Level 1), DISA STIG
- ✅ Healthcare environments (HIPAA)
- ✅ Air-gapped systems and high-security networks

## Translations

### Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Autoplay/TurnOffAutoPlay
Data Type: Integer
Value: 255
```

### PowerShell

```powershell
$regPath = "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer"
if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force }
Set-ItemProperty -Path $regPath -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord -Force
Set-ItemProperty -Path $regPath -Name "NoAutorun" -Value 1 -Type DWord -Force
Write-Output "AutoRun disabled on all drive types."
```

### Registry Export (.reg)

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer]
"NoDriveTypeAutoRun"=dword:000000ff
"NoAutorun"=dword:00000001
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1091](https://attack.mitre.org/techniques/T1091/) | Replication Through Removable Media |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |

## Compliance References

- **CIS Benchmark**: Windows 10/11 Level 1, Control 18.9.8.1
- **DISA STIG**: WN10-CC-000052
- **NIST SP 800-53**: SI-3, MP-7
