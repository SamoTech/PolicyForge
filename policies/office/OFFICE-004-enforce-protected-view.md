---
id: OFFICE-004
name: Enforce Protected View for All Office Files
category: [Office, Sandbox, Exploit Prevention]
risk_level: High
risk_emoji: 🔴
applies_to: [Office 2013+, Microsoft 365 Apps, Windows 10, Windows 11]
test_status: "✅ Tested on Microsoft 365 Apps v2402, Windows 10 22H2, Windows 11 24H2"
---

# Enforce Protected View for All Office Files

> 🔴 **Risk Level: High** — Protected View opens Office files in a sandboxed read-only container, preventing exploits from accessing the system even if a malicious document carries a zero-day exploit.

## Policy Path

```
User Configuration
  └── Administrative Templates
        └── Microsoft Word 2016 (Excel, PowerPoint)
              └── Word Options
                    └── Security
                          └── Trust Center
                                └── Protected View
                                      ├── Do not open files from the Internet in Protected View → Disabled
                                      ├── Do not open files in unsafe locations in Protected View → Disabled
                                      └── Turn off Protected View for attachments opened from Outlook → Disabled
```

> **Logic:** These are "disable" policies. Setting them to **Disabled** (in GPO) means Protected View **remains ON**. Setting to Enabled = Protected View OFF (dangerous).

## Registry

| Key | Value | Data | Type | Meaning |
|---|---|---|---|---|
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security\protectedview` | `DisableInternetFilesInPV` | `0` | REG_DWORD | PV ON for internet files ✅ |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security\protectedview` | `DisableUnsafeLocationsInPV` | `0` | REG_DWORD | PV ON for unsafe locations ✅ |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security\protectedview` | `DisableAttachmentsInPV` | `0` | REG_DWORD | PV ON for Outlook attachments ✅ |

> Repeat for `excel` and `powerpoint`.

## Description

Protected View (PV) is Office's built-in sandbox. Files opened in PV run in a restricted AppContainer process that cannot write to the file system, launch child processes, or access network resources. This contains zero-day exploits in Office documents — even if an attacker's shellcode executes, it cannot escape the sandbox. Protected View applies to internet-sourced files, files from unsafe locations, and Outlook attachments. Users see a yellow notification bar and must click "Enable Editing" to exit PV. Ensuring these are NOT disabled via policy is the correct configuration.

## PowerShell

```powershell
$apps = @("word", "excel", "powerpoint")
$basePath = "HKCU:\SOFTWARE\Policies\Microsoft\Office\16.0"

foreach ($app in $apps) {
    $pvPath = "$basePath\$app\security\protectedview"
    If (-not (Test-Path $pvPath)) { New-Item -Path $pvPath -Force | Out-Null }
    
    # Value 0 = DO NOT disable = Protected View is ENABLED
    Set-ItemProperty -Path $pvPath -Name "DisableInternetFilesInPV" -Value 0 -Type DWord
    Set-ItemProperty -Path $pvPath -Name "DisableUnsafeLocationsInPV" -Value 0 -Type DWord
    Set-ItemProperty -Path $pvPath -Name "DisableAttachmentsInPV" -Value 0 -Type DWord
    Write-Output "Protected View enforced for $app"
}

# Verify
foreach ($app in $apps) {
    $pv = Get-ItemProperty "$basePath\$app\security\protectedview" -EA SilentlyContinue
    Write-Output "$app PV: Internet=$($pv.DisableInternetFilesInPV) Unsafe=$($pv.DisableUnsafeLocationsInPV) Attachments=$($pv.DisableAttachmentsInPV)"
}
```

## Intune CSP

| Setting | Value |
|---|---|
| Deploy via | Intune ADMX ingestion (Office ADMX) |
| Setting path | Protected View settings per Office application |
| Value | Ensure all three DisablePV settings = Disabled (0) |

## Impact

- ✅ Sandboxes all internet/email Office files — zero-day exploits cannot escape the container
- ✅ Covers all three attack paths: internet, unsafe locations, Outlook attachments
- ✅ User can exit PV by clicking "Enable Editing" — preserves usability
- ⚠️ Some automated document processing workflows may break if they expect full file access
- ⚠️ Users may habitually click "Enable Editing" without reading — combine with security awareness training
- ℹ️ Protected View does NOT block macros — combine with OFFICE-001 and OFFICE-002

## Use Cases

- **Zero-day exploit containment** — primary defense against Office document exploit chains
- **Email attachment safety** — Outlook attachments sandboxed before any content executes
- **Enterprise baseline** — CIS Level 1 mandatory; should be in every org's Office baseline
- **High-risk user protection** — executives and finance who receive external documents regularly
- **Defense-in-depth** — layer with macro controls (OFFICE-001/002) for full document security

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Phishing: Spearphishing Attachment |
| [T1203](https://attack.mitre.org/techniques/T1203/) | Exploitation for Client Execution |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |

## Compliance References

- **CIS Microsoft Office Benchmark**: Level 1, Control 2.6
- **DISA STIG**: DTOO122 — Protected View internet files
- **NIST SP 800-53**: SI-3, SI-16
- **Microsoft Security Baseline**: Microsoft 365 Apps for Enterprise

## Test Status

✅ Tested on Microsoft 365 Apps v2402, Windows 10 22H2, Windows 11 24H2
