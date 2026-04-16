---
id: WIN-SECURITY-009
name: Enable Audit Process Creation (with Command Line)
category: [Security, Auditing, Detection]
risk_level: Low
applies_to: [Windows Vista+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Audit Process Creation

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Advanced Audit Policy Configuration
                    └── Detailed Tracking
                          └── Audit Process Creation → Success
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit` | `ProcessCreationIncludeCmdLine_Enabled` | `1` | REG_DWORD |

## Description

Logs Event ID 4688 every time a process starts, including the **full command-line arguments** when the registry value above is set. The most comprehensive native endpoint telemetry source for detecting living-off-the-land attacks.

## PowerShell

```powershell
auditpol /set /subcategory:"Process Creation" /success:enable

$path = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "ProcessCreationIncludeCmdLine_Enabled" -Value 1 -Type DWord -Force

auditpol /get /subcategory:"Process Creation"
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation
Data Type: Integer
Value: 1 (Success) | 3 (Success + Failure)
```

## Key Event IDs

| Event ID | Description |
|---|---|
| 4688 | New process created (includes full command line if enabled) |
| 4689 | Process exited |

## MITRE ATT&CK Mapping (Detection)

| Technique Detected | Description |
|---|---|
| [T1059](https://attack.mitre.org/techniques/T1059/) | Command and Scripting Interpreter |
| [T1218](https://attack.mitre.org/techniques/T1218/) | System Binary Proxy Execution (LOLBins) |

## Compliance References

- **DISA STIG**: WN10-AU-000500, WN10-AU-000505
- **CIS Benchmark**: Level 1, Control 17.3.1
