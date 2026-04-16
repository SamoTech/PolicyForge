---
id: WIN-SECURITY-002
name: Disable SMBv1 Protocol
category: [Security, Network, Protocol Hardening]
risk_level: Critical
risk_emoji: 🔴
applies_to: [Windows 7+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Disable SMBv1 Protocol

> 🔴 **Risk Level: Critical** — SMBv1 is the attack vector for EternalBlue (MS17-010), used in WannaCry and NotPetya. Disable immediately on all systems.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Network
              └── Lanman Workstation
                    └── Enable insecure guest logons → Disabled
```

> **Note:** SMBv1 has no native GPO toggle. Use PowerShell or the registry method below. MDM/Intune uses a custom OMA-URI.

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters` | `SMB1` | `0` | REG_DWORD |

## Description

SMB version 1 is a legacy protocol (1983) with no encryption, no integrity validation, and multiple critical CVEs. It was exploited by EternalBlue (CVE-2017-0144) to spread WannaCry ransomware globally. Microsoft deprecated it in 2013 and recommends disabling it on all modern Windows systems.

## PowerShell

```powershell
# Disable SMBv1 Server
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force

# Disable SMBv1 Client (Windows Feature)
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

# Verify
Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Connectivity/AllowSMB1Server` |
| Data Type | Integer |
| Value | `0` |

## Impact

- ✅ Eliminates EternalBlue (MS17-010) attack surface entirely
- ✅ Removes WannaCry / NotPetya infection vector
- ⚠️ Breaks legacy printers, NAS devices, and scanners using SMBv1
- ⚠️ May affect Windows XP/2003 shares (these should be retired)
- ℹ️ SMBv2/SMBv3 remain fully functional as replacements

## Use Cases

- **Enterprise hardening** — mandatory on all domain-joined endpoints
- **Ransomware prevention** — eliminates the primary lateral movement protocol for WannaCry variants
- **PCI-DSS / HIPAA compliance** — required by most modern security frameworks
- **Air-gapped environments** — removes unnecessary legacy protocol surface
- **SOC baseline** — first check after incident response on any Windows endpoint

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1210](https://attack.mitre.org/techniques/T1210/) | Exploitation of Remote Services |
| [T1021.002](https://attack.mitre.org/techniques/T1021/002/) | Remote Services: SMB/Windows Admin Shares |
| [T1570](https://attack.mitre.org/techniques/T1570/) | Lateral Tool Transfer |

## Compliance References

- **CIS Benchmark**: Level 1, Control 9.3
- **DISA STIG**: WN10-00-000160
- **NIST SP 800-171**: 3.13.8
- **MS Security Baseline**: Windows 10/11 — SMBv1 disabled by default since 1709

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
