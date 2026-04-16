---
id: WIN-SECURITY-002
name: Disable SMBv1 Protocol
category: [Security, Network, Critical Hardening]
risk_level: Critical
applies_to:
  - Windows 7+ (all versions)
  - Windows 10 (all versions)
  - Windows 11 (all versions)
  - Windows Server 2008+
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Disable SMBv1 Protocol

## Description

SMBv1 is a 30-year-old network file sharing protocol with **no encryption, no mutual authentication, and no integrity checking**. It was the primary vector for **WannaCry (2017)** and **NotPetya (2017)**, the most destructive ransomware campaigns in history. Microsoft has officially deprecated SMBv1. There is **no valid reason** to have SMBv1 enabled in any modern environment.

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters` | `SMB1` | `0` | REG_DWORD |

## Impact

- **Legacy systems risk**: Windows XP, old NAS devices, some printers may use SMBv1. Audit before disabling.
- No impact on modern Windows 7+ clients using SMBv2/v3
- Requires **reboot** to take full effect

## Use Cases

- ✅ **Every Windows environment** — this is a non-negotiable baseline
- ✅ Ransomware prevention (WannaCry, NotPetya, EternalBlue)
- ✅ Compliance: PCI-DSS, HIPAA, NIST CSF, ISO 27001
- ✅ Zero-trust network hardening

## Translations

### PowerShell

```powershell
# Check current state
Get-SmbServerConfiguration | Select EnableSMB1Protocol

# Disable SMBv1 (Windows 10/11)
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

# Via Registry
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters" `
  -Name "SMB1" -Value 0 -Type DWord -Force

# Find active SMBv1 connections before disabling
Get-SmbConnection | Where-Object Dialect -eq "1.0"
```

### Registry Export (.reg)

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters]
"SMB1"=dword:00000000
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1210](https://attack.mitre.org/techniques/T1210/) | Exploitation of Remote Services |
| [T1021.002](https://attack.mitre.org/techniques/T1021/002/) | Remote Services: SMB/Windows Admin Shares |
| [T1570](https://attack.mitre.org/techniques/T1570/) | Lateral Tool Transfer (worm propagation via SMB) |

## Compliance References

- **CIS Benchmark**: Windows 10/11 Level 1, Control 18.3.3
- **DISA STIG**: WN10-00-000160
- **MS Blog**: [Stop using SMB1](https://techcommunity.microsoft.com/t5/storage-at-microsoft/stop-using-smb1/ba-p/425858)
