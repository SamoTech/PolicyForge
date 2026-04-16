---
id: WIN-SECURITY-008
name: Enable PowerShell Script Block Logging
category: [Security, Auditing, Detection]
risk_level: Low
applies_to: [Windows 10 1507+, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable PowerShell Script Block Logging

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Windows PowerShell
                    └── Turn on PowerShell Script Block Logging → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging` | `EnableScriptBlockLogging` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging` | `EnableScriptBlockInvocationLogging` | `1` | REG_DWORD |

## Description

Logs the full content of every PowerShell script block to Event ID 4104. Captures obfuscated/encoded commands **after deobfuscation** — exposing attacker intent in plain text. One of the most powerful native detection controls available.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "EnableScriptBlockLogging" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $path -Name "EnableScriptBlockInvocationLogging" -Value 1 -Type DWord -Force
Write-Output "Script Block Logging enabled. Events: Event ID 4104"
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/WindowsPowerShell/TurnOnPowerShellScriptBlockLogging
Data Type: String
Value: <enabled/><data id="EnableScriptBlockInvocationLogging" value="true"/>
```

## MITRE ATT&CK Mapping (Detection)

| Technique Detected | Description |
|---|---|
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | Command and Scripting: PowerShell |
| [T1027](https://attack.mitre.org/techniques/T1027/) | Obfuscated Files or Information |

## Compliance References

- **DISA STIG**: WN10-CC-000326
- **CIS Benchmark**: Level 1, Control 18.9.95.2
