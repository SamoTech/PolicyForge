---
id: DEF-009
name: Configure Scheduled Scan Settings
category: [Defender, Scanning, Maintenance]
risk_level: Low
risk_emoji: 🟢
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Configure Scheduled Scan Settings

> 🟢 **Risk Level: Low** — Scheduled scans provide a safety net for threats that evaded real-time protection. Misconfiguring the schedule can result in scans never running or impacting system performance.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Scan
                          ├── Specify the scan type to use for a scheduled scan → Quick Scan
                          ├── Specify the day of the week to run a scheduled scan → Every day (0)
                          └── Specify the time of day to run a scheduled scan → 120 (2:00 AM)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Scan` | `ScheduleDay` | `0` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Scan` | `ScheduleTime` | `120` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Scan` | `ScanParameters` | `1` | REG_DWORD |

**ScheduleDay:** `0`=Daily, `1`=Sun, `2`=Mon ... `7`=Sat, `8`=Never
**ScanParameters:** `1`=Quick scan, `2`=Full scan

## Description

Scheduled scans run independently of real-time protection and serve as a secondary detection layer for threats that may have persisted on disk without triggering real-time alerts. Quick scans (recommended default) check the most likely locations for active threats in under 5 minutes on most systems. Full scans are resource-intensive and typically reserved for weekly or post-incident scanning. Scans are skipped when the system is in use by default — configure `ScanOnlyIfIdle` for low-interrupt operation.

## PowerShell

```powershell
# Set daily quick scan at 2:00 AM
Set-MpPreference -ScanScheduleDay Everyday
Set-MpPreference -ScanScheduleTime 02:00:00
Set-MpPreference -ScanParameters QuickScan

# Run an immediate quick scan
Start-MpScan -ScanType QuickScan

# Verify schedule
Get-MpPreference | Select-Object ScanScheduleDay, ScanScheduleTime, ScanParameters
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI (Day) | `./Device/Vendor/MSFT/Policy/Config/Defender/ScheduleScanDay` |
| OMA-URI (Time) | `./Device/Vendor/MSFT/Policy/Config/Defender/ScheduleScanTime` |
| Data Type | Integer |
| Value (Day) | `0` (Daily) |
| Value (Time) | `120` (minutes from midnight = 2:00 AM) |

## Impact

- ✅ Provides secondary detection for threats that bypassed real-time protection
- ✅ Quick scan completes in minutes with minimal user impact
- ⚠️ Full scans during business hours cause significant CPU/disk load
- ⚠️ Scans skipped if system is in use unless `ScanOnlyIfIdle=0`
- ℹ️ Set `RandomizeScheduleTaskTimes=1` to stagger scans across fleet

## Use Cases

- **Enterprise fleet** — daily quick scans at 2 AM off-hours minimize user disruption
- **High-security servers** — weekly full scans plus daily quick scans
- **Post-incident** — trigger immediate full scan across fleet via PowerShell or MDE
- **VDI environments** — stagger scan times to prevent storage I/O storms
- **Compliance** — many frameworks require documented scan frequency and coverage

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |
| [T1074](https://attack.mitre.org/techniques/T1074/) | Data Staged (persistent threats on disk) |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.4
- **NIST SP 800-53**: SI-3
- **PCI-DSS**: Requirement 5.2

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
