---
id: DEF-002
name: Enable Cloud-Delivered Protection
category: [Defender, Antivirus, Cloud]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Cloud-Delivered Protection

> 🟠 **Risk Level: Medium** — Cloud-delivered protection provides near-zero-second detection of new malware variants. Disabling it forces reliance on local signatures alone, leaving a gap for zero-day threats.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── MAPS
                          └── Join Microsoft MAPS → Advanced MAPS
                          └── Send file samples when further analysis is required → Send safe samples
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet` | `SpynetReporting` | `2` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet` | `SubmitSamplesConsent` | `1` | REG_DWORD |

**SpynetReporting values:** `0` = Disabled, `1` = Basic, `2` = Advanced (recommended)

## Description

Cloud-delivered protection sends metadata about suspicious files and behaviors to Microsoft's cloud intelligence service (MAPS — Microsoft Active Protection Service) for rapid analysis. This enables sub-second detection of brand-new malware variants before local signatures are available. Combined with automatic sample submission, it dramatically reduces the window between malware release and detection. For air-gapped or high-privacy environments, this may need to be disabled with compensating controls.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "SpynetReporting" -Value 2 -Type DWord
Set-ItemProperty -Path $path -Name "SubmitSamplesConsent" -Value 1 -Type DWord

# Verify
Get-MpPreference | Select-Object MAPSReporting, SubmitSamplesConsent
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Defender/AllowCloudProtection` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Near-zero-day detection for new malware not yet in local signatures
- ✅ Automatic sample submission accelerates global threat intelligence
- ⚠️ Requires internet connectivity to Microsoft MAPS endpoints
- ⚠️ Not suitable for air-gapped or classified environments
- ℹ️ Disable `SubmitSamplesConsent` in high-privacy environments and use `SpynetReporting=1` (Basic)

## Use Cases

- **Internet-connected enterprise endpoints** — maximizes zero-day detection capability
- **SOC environments** — cloud telemetry feeds Microsoft Sentinel threat intelligence
- **SMB deployments** — compensates for limited local security tooling
- **High-privacy / air-gapped** — disable and replace with offline signature updates

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |
| [T1036](https://attack.mitre.org/techniques/T1036/) | Masquerading (zero-day payloads evading local signatures) |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.2
- **DISA STIG**: WN10-00-000020
- **NIST SP 800-53**: SI-3

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
