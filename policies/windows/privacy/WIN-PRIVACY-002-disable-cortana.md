---
id: WIN-PRIVACY-002
name: Disable Cortana
category: [Privacy, Attack Surface Reduction]
risk_level: Low
applies_to: [Windows 10 1507+, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable Cortana

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Search
                    └── Allow Cortana → Disabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search` | `AllowCortana` | `0` | REG_DWORD |

## Description

Cortana sends search queries, typing patterns, and voice data to Microsoft cloud services. It has also been exploited to execute code from the lock screen (pre-2020 vulnerabilities). Disabling reduces data exfiltration risk and attack surface.

## Impact

- Search reverts to local-only Windows Search
- Voice search and "Hey Cortana" disabled

## Use Cases

- ✅ GDPR / HIPAA compliance environments
- ✅ Air-gapped and offline systems

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "AllowCortana" -Value 0 -Type DWord -Force
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Experience/AllowCortana
Data Type: Integer
Value: 0
```
