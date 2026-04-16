---
id: DEF-003
name: Enable Behavior Monitoring
category: [Defender, Detection, EDR]
risk_level: Low
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Behavior Monitoring

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Real-time Protection
                          └── Turn on behavior monitoring → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection` | `DisableBehaviorMonitoring` | `0` | REG_DWORD |

## Description

Behavior monitoring tracks process behavior patterns (API calls, file system access, network connections, registry changes) rather than just file signatures. It catches fileless malware, LOLBin abuse, and polymorphic threats that evade signature-based detection. This is the behavioral engine that feeds into Microsoft Defender for Endpoint's EDR capabilities.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "DisableBehaviorMonitoring" -Value 0 -Type DWord -Force
Write-Output "Behavior monitoring enabled."
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/AllowBehaviorMonitoring
Data Type: Integer
Value: 1
```

## MITRE ATT&CK Mapping (Detection)

| Technique Detected | Description |
|---|---|
| [T1055](https://attack.mitre.org/techniques/T1055/) | Process Injection |
| [T1059](https://attack.mitre.org/techniques/T1059/) | Command and Scripting Interpreter |
| [T1218](https://attack.mitre.org/techniques/T1218/) | System Binary Proxy Execution |
