---
id: WIN-SECURITY-008
name: Enable PowerShell Script Block Logging
category: [Security, Logging, Auditing]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 10+, Windows 11, Windows Server 2016+, PowerShell 5.0+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable PowerShell Script Block Logging

> 🟠 **Risk Level: Medium** — Without script block logging, PowerShell-based attacks leave minimal forensic traces. Enabling it provides full visibility into every script executed on the endpoint.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Windows PowerShell
                    └── Turn on PowerShell Script Block Logging → Enabled
                          └── Log script block invocation start/stop events: Checked
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging` | `EnableScriptBlockLogging` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging` | `EnableScriptBlockInvocationLogging` | `1` | REG_DWORD |

## Description

PowerShell Script Block Logging records the full content of every script block executed by PowerShell, including obfuscated and decoded content. Logs are written to the Windows Event Log under **Microsoft-Windows-PowerShell/Operational** (Event ID 4104). This provides critical forensic visibility into fileless malware, living-off-the-land attacks, and all PowerShell-based offensive tooling. PowerShell 5.0+ automatically deobfuscates content before logging, defeating most basic obfuscation techniques.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"

If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }

Set-ItemProperty -Path $path -Name "EnableScriptBlockLogging" -Value 1 -Type DWord
Set-ItemProperty -Path $path -Name "EnableScriptBlockInvocationLogging" -Value 1 -Type DWord

Write-Output "PowerShell Script Block Logging enabled."

# Verify - view recent script block logs
Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational" -MaxEvents 5 |
    Where-Object { $_.Id -eq 4104 } | Select-Object TimeCreated, Message
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/WindowsPowerShell/TurnOnPowerShellScriptBlockLogging` |
| Data Type | String |
| Value | `<enabled/><data id="EnableScriptBlockInvocationLogging" value="true"/>` |

## Impact

- ✅ Full visibility into all PowerShell execution including deobfuscated content
- ✅ Captures fileless malware, Cobalt Strike, Empire, PowerSploit activity
- ✅ Event ID 4104 integrates with SIEM/EDR for alerting
- ⚠️ Generates high event log volume on systems with heavy PowerShell use
- ⚠️ Sensitive data in scripts (passwords, tokens) may appear in logs — protect log access
- ℹ️ Pair with PowerShell Transcription Logging and Module Logging for full coverage

## Use Cases

- **SOC / threat hunting** — baseline detection for PowerShell-based attacks
- **Incident response** — reconstruct exactly what scripts ran before/during an incident
- **Compliance logging** — required by many security frameworks for privileged activity logging
- **Red team detection** — catches Invoke-Mimikatz, PowerView, BloodHound collectors
- **SIEM integration** — forward Event ID 4104 to Splunk/Sentinel for real-time alerting

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | Command and Scripting Interpreter: PowerShell |
| [T1027](https://attack.mitre.org/techniques/T1027/) | Obfuscated Files or Information |
| [T1140](https://attack.mitre.org/techniques/T1140/) | Deobfuscate/Decode Files or Information |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.10.41.1
- **DISA STIG**: WN10-CC-000326
- **NIST SP 800-92**: Log management guidance
- **MS Security Baseline**: Included in Windows 10/11 and Server baselines

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
