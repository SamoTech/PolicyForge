---
id: WIN-PRIVACY-003
name: Disable OneDrive Automatic Sync
category: [Privacy, Data Protection, Compliance]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 8.1+, Windows 10, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable OneDrive Automatic Sync

> 🟠 **Risk Level: Medium** — Uncontrolled OneDrive sync can silently exfiltrate sensitive documents to Microsoft cloud storage, violating data residency and compliance requirements.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── OneDrive
                    └── Prevent the usage of OneDrive for file storage → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\OneDrive` | `DisableFileSyncNGSC` | `1` | REG_DWORD |

## Description

Prevents OneDrive from syncing files to Microsoft cloud storage. In environments handling sensitive data (HIPAA, PCI-DSS, legal privilege), uncontrolled cloud sync can constitute a compliance violation or data breach. This policy disables both the OneDrive client integration and prevents users from re-enabling it. Note: this disables personal OneDrive; SharePoint/OneDrive for Business sync is controlled separately via `DisableLibrariesDefaultSaveToSkyDrive`.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\OneDrive"
if (!(Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "DisableFileSyncNGSC" -Value 1 -Type DWord -Force
Write-Output "OneDrive file sync disabled."

# Verify
Get-ItemProperty -Path $path -Name "DisableFileSyncNGSC"
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/System/DisableOneDriveFileSync` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Prevents sensitive documents from syncing to personal Microsoft cloud storage
- ✅ Enforces data residency — files stay within controlled on-premise or managed storage
- ✅ Reduces exfiltration risk for insider threat scenarios
- ⚠️ Users lose access to personal OneDrive sync — must use approved alternatives
- ⚠️ Does not affect SharePoint / OneDrive for Business (requires separate policy)
- ⚠️ Files already synced to cloud are NOT deleted by this policy
- ℹ️ Combine with Known Folder Move (KFM) policy to redirect Desktop/Documents to SharePoint instead

## Use Cases

- **Healthcare (HIPAA)** — PHI must not leave controlled, audited storage systems
- **Legal firms** — privileged documents must remain on-premise or in approved DMS
- **Financial services (PCI-DSS, SOX)** — regulated data must stay within compliance boundary
- **Government / classified** — data residency mandates prohibit public cloud storage
- **Insider threat programs** — prevent mass document exfiltration via personal cloud sync

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1567.002](https://attack.mitre.org/techniques/T1567/002/) | Exfiltration to Cloud Storage |
| [T1048](https://attack.mitre.org/techniques/T1048/) | Exfiltration Over Alternative Protocol |
| [T1052](https://attack.mitre.org/techniques/T1052/) | Exfiltration Over Physical Medium (OneDrive as staging) |

## Compliance References

- **CIS Benchmark**: Level 2, Control 18.9.61.1
- **HIPAA**: 45 CFR §164.312 — Data storage and transmission controls
- **PCI-DSS**: Requirement 7 — Restrict access to cardholder data
- **NIST SP 800-53**: AC-20, SC-28

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
