---
id: WIN-SECURITY-014
name: Disable Default Autoplay for Removable Drives
category: [Security, Removable Media]
risk_level: Medium
applies_to: [Windows 7+, Windows 10, Windows 11]
test_status: "✅ Tested on Windows 11 24H2"
---

# Disable Default Autoplay for Removable Drives

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── AutoPlay Policies
                    └── Set the default behavior for AutoRun → Enabled
                          └── Default AutoRun Behavior: Do not execute any autorun commands
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer` | `NoAutorun` | `1` | REG_DWORD |

## Description

Complements `WIN-SECURITY-001` by explicitly setting the default AutoRun behavior to never execute commands from removable media. Defense-in-depth for removable media attacks.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"
Set-ItemProperty -Path $path -Name "NoAutorun" -Value 1 -Type DWord -Force
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1091](https://attack.mitre.org/techniques/T1091/) | Replication Through Removable Media |
