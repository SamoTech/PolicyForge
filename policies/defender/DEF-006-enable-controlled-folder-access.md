---
id: DEF-006
name: Enable Controlled Folder Access (Ransomware Protection)
category: [Defender, Ransomware Protection, CFA]
risk_level: Medium
applies_to: [Windows 10 1709+, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Controlled Folder Access

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Microsoft Defender Exploit Guard
                          └── Controlled Folder Access
                                └── Configure Controlled folder access → Enabled (Block mode)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Controlled Folder Access` | `EnableControlledFolderAccess` | `1` | REG_DWORD |

> Values: 0 = Disabled, 1 = Block, 2 = Audit

## Description

Controlled Folder Access (CFA) prevents unauthorized processes from modifying files in protected folders (Documents, Desktop, Pictures, etc.). It is Microsoft's primary **ransomware containment** control — even if ransomware executes, it cannot encrypt files in protected folders without being on the allowlist. Deploy in Audit mode first to identify legitimate apps that need allowlisting.

## Protected Folders (Default)

- `%USERPROFILE%\Documents`
- `%USERPROFILE%\Desktop`
- `%USERPROFILE%\Pictures`
- `%USERPROFILE%\Music`
- `%USERPROFILE%\Videos`
- `%PUBLIC%\Documents`

## PowerShell

```powershell
# Audit mode first
Set-MpPreference -EnableControlledFolderAccess AuditMode

# After reviewing Event ID 1124 (audit) and allowlisting apps:
# Set-MpPreference -EnableControlledFolderAccess Enabled

# Add legitimate app to allowlist
# Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Program Files\MyApp\app.exe"

Get-MpPreference | Select EnableControlledFolderAccess
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/EnableControlledFolderAccess
Data Type: Integer
Value: 1 (Block) | 2 (Audit)
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact (Ransomware) |
