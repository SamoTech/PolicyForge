---
id: DEF-001
name: Enable Real-Time Protection
category: [Defender, Antivirus, Baseline]
risk_level: Critical
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Real-Time Protection

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Real-time Protection
                          └── Turn off real-time protection → Disabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection` | `DisableRealtimeMonitoring` | `0` | REG_DWORD |

## Description

Real-time protection monitors files, processes, and network activity continuously for malware signatures and behavioral patterns. Setting `DisableRealtimeMonitoring = 0` via policy **forces** it on and prevents users or malware from disabling it through the UI or registry. This is the foundational Defender control — all other Defender policies build on top of it.

## Impact

- Minor CPU overhead on file I/O operations
- Required for all other Defender features (cloud protection, IOAV, behavior monitoring) to function

## Use Cases

- ✅ Every Windows endpoint — non-negotiable
- ✅ Compliance: CIS Level 1, DISA STIG

## PowerShell

```powershell
# Force real-time protection on via policy
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "DisableRealtimeMonitoring" -Value 0 -Type DWord -Force

# Verify current status
Get-MpComputerStatus | Select RealTimeProtectionEnabled, AMServiceEnabled
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/AllowRealtimeMonitoring
Data Type: Integer
Value: 1
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.47.4
- **DISA STIG**: WN10-00-000015
