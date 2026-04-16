---
id: WIN-PRIVACY-002
name: Disable Cortana
category: [Privacy, Attack Surface Reduction]
risk_level: Low
risk_emoji: 🟢
applies_to: [Windows 10 1507+, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable Cortana

> 🟢 **Risk Level: Low** — Disabling Cortana removes cloud search telemetry and a historically exploited lock-screen attack surface with negligible functional impact for enterprise users.

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

Cortana sends search queries, typing patterns, and voice data to Microsoft cloud services. It has also been exploited to execute code from the lock screen (CVE-2018-8140, CVE-2019-1253) in pre-2020 versions. Disabling reduces data exfiltration risk and removes the Cortana attack surface from lock screen exposure. On Windows 11, Cortana is already largely deprecated but the policy still applies to residual components.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
if (!(Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "AllowCortana" -Value 0 -Type DWord -Force

# Verify
Get-ItemProperty -Path $path -Name "AllowCortana"
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Experience/AllowCortana` |
| Data Type | Integer |
| Value | `0` |

## Impact

- ✅ Eliminates Cortana cloud telemetry (voice, typing, search queries)
- ✅ Removes lock-screen Cortana attack surface
- ✅ Reduces background network connections to Microsoft search services
- ⚠️ Voice search and "Hey Cortana" wake word disabled
- ℹ️ Local Windows Search (file/app search) continues to work normally
- ℹ️ On Windows 11 24H2, Cortana is already removed from most SKUs

## Use Cases

- **GDPR / HIPAA compliance** — eliminates uncontrolled cloud transmission of search data
- **Air-gapped systems** — prevents Cortana from attempting cloud connectivity
- **Kiosk / lockdown** — removes unneeded assistant from managed devices
- **High-security endpoints** — eliminates lock-screen attack surface
- **Enterprise baseline** — CIS Level 1 recommended disable

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1056.001](https://attack.mitre.org/techniques/T1056/001/) | Input Capture: Keylogging (typing telemetry) |
| [T1204](https://attack.mitre.org/techniques/T1204/) | User Execution (lock-screen exploit vector) |
| [T1119](https://attack.mitre.org/techniques/T1119/) | Automated Collection (cloud search query harvesting) |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.13.1
- **DISA STIG**: WN10-CC-000390
- **NIST SP 800-53**: AC-20, SI-12
- **GDPR**: Article 5 (data minimisation principle)

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
