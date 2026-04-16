---
id: WIN-PRIVACY-003
name: Disable OneDrive Automatic Sync
category: [Privacy, Data Protection, Compliance]
risk_level: Medium
applies_to: [Windows 8.1+, Windows 10, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable OneDrive Automatic Sync

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── OneDrive
                    └── Prevent the usage of OneDrive for file storage → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\OneDrive` | `DisableFileSyncNGSC` | `1` | REG_DWORD |

## Description

Prevents OneDrive from syncing files to Microsoft cloud storage. In environments handling sensitive data (HIPAA, PCI-DSS, legal privilege), uncontrolled cloud sync can constitute a compliance violation or data breach.

## Use Cases

- ✅ Healthcare (HIPAA) — PHI must not leave controlled storage
- ✅ Legal firms — privileged documents must stay on-premise
- ✅ Financial services (PCI-DSS, SOX)

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\OneDrive"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "DisableFileSyncNGSC" -Value 1 -Type DWord -Force
Write-Output "OneDrive file sync disabled."
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/System/DisableOneDriveFileSync
Data Type: Integer
Value: 1
```

## Compliance References

- **CIS Benchmark**: Level 2, Control 18.9.61.1
- **HIPAA**: Data storage and transmission controls
