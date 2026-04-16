---
id: DEF-006
name: Enable Controlled Folder Access
category: [Defender, Ransomware Protection, Endpoint]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows 10 1709+, Windows 11, Windows Server 2019+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Controlled Folder Access

> 🔴 **Risk Level: High** — Controlled Folder Access is Microsoft's dedicated anti-ransomware feature. It blocks unauthorized processes from modifying protected folders, stopping encryption before it starts.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Microsoft Defender Exploit Guard
                          └── Controlled Folder Access
                                └── Configure Controlled folder access → Enabled (Block)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Controlled Folder Access` | `EnableControlledFolderAccess` | `1` | REG_DWORD |

**Values:** `0` = Disabled, `1` = **Block** ✅, `2` = Audit mode, `3` = Block disk modification only

## Description

Controlled Folder Access (CFA) protects user documents, Desktop, Downloads, and other configured folders from being modified by unauthorized processes. Only trusted applications (whitelisted by Microsoft or manually added) can write to protected paths. Ransomware attempting to encrypt files in these folders is blocked before the first file is modified. Deploy in Audit mode first to identify legitimate apps that need whitelisting.

## PowerShell

```powershell
# Enable Controlled Folder Access in Block mode
Set-MpPreference -EnableControlledFolderAccess Enabled

# Add allowed application
Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Tools\MyApp.exe"

# Add protected folder
Add-MpPreference -ControlledFolderAccessProtectedFolders "D:\CriticalData"

# Verify
Get-MpPreference | Select-Object EnableControlledFolderAccess, ControlledFolderAccessAllowedApplications
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Defender/EnableControlledFolderAccess` |
| Data Type | Integer |
| Value | `1` (Block) |

## Impact

- ✅ Blocks ransomware from encrypting files in protected folders
- ✅ Stops unauthorized writes from any process not in the allow-list
- ✅ Audit mode (value=2) available for pre-deployment testing
- ⚠️ High false-positive rate — many legitimate apps initially blocked
- ⚠️ Requires building an application allow-list before enforcement
- ℹ️ Review Event ID 1123 in Event Viewer to identify blocked apps needing whitelist

## Use Cases

- **Ransomware prevention** — primary use case; stops encryption before it begins
- **Document protection** — financial, legal, or sensitive documents in protected paths
- **Kiosk / locked-down endpoints** — only approved apps can modify any folder
- **Staged rollout** — Audit → Block progression with allow-list refinement
- **High-value user protection** — executives, finance, HR who are primary phishing targets

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact (Ransomware) |
| [T1565.001](https://attack.mitre.org/techniques/T1565/001/) | Data Manipulation: Stored Data |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.7
- **NIST SP 800-53**: SI-3, CP-9
- **Microsoft Security Baseline**: Windows 10/11

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
