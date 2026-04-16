---
id: DEF-002
name: Enable Cloud-Delivered Protection (MAPS)
category: [Defender, Cloud Protection, Baseline]
risk_level: Medium
applies_to: [Windows 10, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Cloud-Delivered Protection

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── MAPS
                          ├── Join Microsoft MAPS → Advanced MAPS
                          └── Send file samples when further analysis is required → Send safe samples
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet` | `SpynetReporting` | `2` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet` | `SubmitSamplesConsent` | `1` | REG_DWORD |

> `SpynetReporting`: 0 = Disabled, 1 = Basic MAPS, 2 = Advanced MAPS

## Description

Cloud-delivered protection connects Defender to Microsoft's threat intelligence cloud, enabling near-instant detection of new malware variants (often within seconds of first appearance globally). Advanced MAPS sends richer telemetry and enables the cloud protection block level controls. Critical for environments that cannot afford the lag between new threat emergence and signature update deployment.

## Impact

- Requires internet connectivity to Microsoft cloud endpoints
- In air-gapped environments: set `SpynetReporting = 0` and rely on local signatures + WSUS updates
- Minor telemetry data sent to Microsoft

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "SpynetReporting" -Value 2 -Type DWord -Force
Set-ItemProperty -Path $path -Name "SubmitSamplesConsent" -Value 1 -Type DWord -Force

# Verify
Get-MpComputerStatus | Select MAPSReporting, IsManagedDevice
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/AllowCloudProtection
Data Type: Integer
Value: 1
```

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.47.5.1
- **DISA STIG**: WN10-00-000016
