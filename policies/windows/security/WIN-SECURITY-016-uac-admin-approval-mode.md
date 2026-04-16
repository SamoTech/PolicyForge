---
id: WIN-SECURITY-016
name: Configure UAC Admin Approval Mode
category: [Security, Privilege Management, UAC]
risk_level: Medium
applies_to: [Windows Vista+, Windows 10, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Configure UAC Admin Approval Mode

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System` | `FilterAdministratorToken` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System` | `ConsentPromptBehaviorAdmin` | `2` | REG_DWORD |

> `ConsentPromptBehaviorAdmin`: 0 = Elevate without prompt, 2 = Prompt on secure desktop (consent)

## Description

Ensures even the built-in Administrator runs under Admin Approval Mode with prompt on secure desktop, preventing malware from auto-accepting UAC dialogs rendered in the normal desktop (click-jacking).

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"
Set-ItemProperty -Path $path -Name "FilterAdministratorToken" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $path -Name "ConsentPromptBehaviorAdmin" -Value 2 -Type DWord -Force
Write-Output "UAC Admin Approval Mode configured."
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1548.002](https://attack.mitre.org/techniques/T1548/002/) | Abuse Elevation Control Mechanism: Bypass UAC |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 2.3.17.1–2.3.17.8
- **DISA STIG**: WN10-SO-000265
