---
id: WIN-SECURITY-019
name: Configure Security Event Log Size (Minimum 196MB)
category: [Security, Auditing, Log Management]
risk_level: Medium
applies_to: [Windows Vista+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Configure Security Event Log Size

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Event Log Service
                    └── Security
                          └── Specify the maximum log file size (KB) → 196608
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\EventLog\Security` | `MaxSize` | `196608` | REG_DWORD |

## Description

The default Security log (20MB) is too small for environments with process creation auditing enabled. An undersized log overwrites old events, destroying forensic evidence. CIS minimum is 196MB. Environments with heavy audit loads should target 1GB+.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\EventLog\Security"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "MaxSize" -Value 196608 -Type DWord -Force
wevtutil sl Security /ms:201326592
Write-Output "Security Event Log size set to 192MB."
```

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.26.1.1
- **DISA STIG**: WN10-AU-000500
