---
id: DEF-001
name: Enable Microsoft Defender Real-Time Protection
category: [Defender, Antivirus, Endpoint Protection]
risk_level: Critical
risk_emoji: 🔴
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable Microsoft Defender Real-Time Protection

> 🔴 **Risk Level: Critical** — Disabling real-time protection removes the primary on-access scanning layer. Malware executes freely until a manual scan runs.

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

Real-time protection continuously monitors file system operations, process creation, network connections, and registry changes for malicious behavior. It is the primary detection layer in Microsoft Defender Antivirus. Disabling it — even temporarily — creates a window of exposure where malware can execute, persist, and spread without detection. This policy ensures the setting cannot be changed by users or malware.

## PowerShell

```powershell
# Ensure real-time protection is enabled via policy
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "DisableRealtimeMonitoring" -Value 0 -Type DWord

# Verify status
Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, AntivirusEnabled
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Defender/AllowRealtimeMonitoring` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Ensures on-access scanning cannot be disabled by users or malware
- ✅ Blocks file execution, download, and registry write threats in real time
- ⚠️ Minor CPU/disk overhead during heavy file I/O operations
- ℹ️ Tamper Protection (DEF-008) should also be enabled to prevent policy override

## Use Cases

- **Enterprise baseline** — mandatory on all managed endpoints
- **Compliance** — required by CIS, DISA STIG, and most security frameworks
- **Ransomware defense** — real-time scanning intercepts encryption attempts
- **SOC enforcement** — policy lock prevents attacker disablement pre-execution

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |
| [T1204](https://attack.mitre.org/techniques/T1204/) | User Execution |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.1
- **DISA STIG**: WN10-00-000015
- **NIST SP 800-53**: SI-3

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
