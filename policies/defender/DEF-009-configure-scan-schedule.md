---
id: DEF-009
name: Configure Defender Scheduled Scan
category: [Defender, Scanning, Baseline]
risk_level: Low
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Configure Defender Scheduled Scan

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Scan
                          ├── Specify the scan type to use for a scheduled scan → Quick Scan
                          ├── Specify the day of the week to run a scheduled scan → Wednesday (4)
                          └── Specify the time of day to run a scheduled scan → 120 (2:00 AM)
```

## Registry

| Key | Value | Data | Notes |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Scan` | `ScheduleDay` | `4` | 0=Daily, 1=Mon...7=Sun |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Scan` | `ScheduleTime` | `120` | Minutes from midnight (120 = 2:00 AM) |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Scan` | `ScanParameters` | `1` | 1=Quick, 2=Full |

## Description

Scheduled scans run in the background to catch threats that slipped past real-time protection (e.g., files written while protection was briefly disabled, offline imports). Quick scans cover the most likely malware locations (registry, startup, running processes, system directories) in minutes. Full scans are more thorough but resource-intensive — reserve for after-hours or weekend runs.

## PowerShell

```powershell
# Schedule a weekly quick scan on Wednesday at 2:00 AM
Set-MpPreference -ScanScheduleDay Wednesday
Set-MpPreference -ScanScheduleTime (New-TimeSpan -Hours 2)
Set-MpPreference -ScanParameters QuickScan

# Run an immediate quick scan
Start-MpScan -ScanType QuickScan

# Verify
Get-MpPreference | Select ScanScheduleDay, ScanScheduleTime, ScanParameters
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/ScheduleScanDay
Value: 4 (Wednesday)

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/ScheduleScanTime
Value: 120
```
