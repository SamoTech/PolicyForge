---
id: OFFICE-001
name: Disable VBA Macros by Default in Office Applications
category: [Office, Macro Security, Endpoint Protection]
risk_level: High
risk_emoji: 🔴
applies_to: [Office 2016, Office 2019, Microsoft 365 Apps, Windows 10, Windows 11]
test_status: "✅ Tested on Microsoft 365 Apps v2402, Windows 10 22H2, Windows 11 24H2"
---

# Disable VBA Macros by Default in Office Applications

> 🔴 **Risk Level: High** — VBA macros are the #1 delivery mechanism for malware in phishing campaigns. Disabling by default eliminates the most common initial access vector for ransomware and banking trojans.

## Policy Path

```
User Configuration
  └── Administrative Templates
        └── Microsoft Office 2016
              └── Security Settings
                    └── VBA Macro Notification Settings
                          ├── Word → Disable all with notification (value: 2)
                          ├── Excel → Disable all with notification (value: 2)
                          ├── PowerPoint → Disable all with notification (value: 2)
                          └── Outlook → Disable all (value: 4)
```

## Registry

| Key | Value | Data | Description |
|---|---|---|---|
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security` | `VBAWarnings` | `2` | Word: disable with notification |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\excel\security` | `VBAWarnings` | `2` | Excel: disable with notification |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\powerpoint\security` | `VBAWarnings` | `2` | PowerPoint: disable with notification |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\outlook\security` | `Level` | `4` | Outlook: disable all |

**VBAWarnings values:** `1` = Enable all (⚠️ dangerous), `2` = **Disable with notification** ✅, `3` = Disable except digitally signed, `4` = Disable all without notification

## Description

VBA (Visual Basic for Applications) macros embedded in Word, Excel, and PowerPoint documents are the most common malware delivery mechanism in phishing campaigns. Attackers embed macro droppers that download and execute second-stage payloads (Emotet, QakBot, ransomware loaders) when the user clicks "Enable Content." Setting `VBAWarnings=2` disables macros by default but shows a notification bar, allowing users to enable macros for legitimate trusted documents. This is the recommended enterprise baseline setting.

## PowerShell

```powershell
# Apply macro disable policy for all Office apps (run as user or via GPO logon script)
$officeApps = @("word", "excel", "powerpoint")
$basePath = "HKCU:\SOFTWARE\Policies\Microsoft\Office\16.0"

foreach ($app in $officeApps) {
    $path = "$basePath\$app\security"
    If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
    Set-ItemProperty -Path $path -Name "VBAWarnings" -Value 2 -Type DWord
    Write-Output "Set VBAWarnings=2 for $app"
}

# Outlook - disable all macros
$outlookPath = "$basePath\outlook\security"
If (-not (Test-Path $outlookPath)) { New-Item -Path $outlookPath -Force | Out-Null }
Set-ItemProperty -Path $outlookPath -Name "Level" -Value 4 -Type DWord

# Verify
foreach ($app in $officeApps) {
    $val = Get-ItemProperty -Path "$basePath\$app\security" -Name "VBAWarnings" -EA SilentlyContinue
    Write-Output "$app VBAWarnings: $($val.VBAWarnings)"
}
```

## Intune CSP

| Setting | Value |
|---|---|
| Deploy via | Intune ADMX ingestion (Office ADMX templates) |
| Template | Microsoft 365 Apps for Enterprise ADMX |
| Setting path | User Config > Office 2016 > Security Settings > VBA Macro Notification Settings |

## Impact

- ✅ Eliminates the #1 malware delivery vector in phishing campaigns
- ✅ Users see notification bar for blocked macros — can escalate to IT if legitimate
- ✅ Applies to Word, Excel, PowerPoint, and Outlook independently
- ⚠️ Breaks workflows that depend on unsigned macros — audit before enforcing
- ⚠️ Digitally signed macros from trusted publishers still run — configure trusted publisher list
- ℹ️ Use `VBAWarnings=3` if environment has digitally signed macro workflows

## Use Cases

- **Enterprise baseline** — mandatory on all managed endpoints; single highest-impact Office control
- **Ransomware defense** — blocks Emotet, QakBot, and most phishing macro droppers
- **Phishing resistance** — users cannot enable macros from emailed documents by default
- **Compliance** — required by CIS, DISA STIG, and Microsoft Security Baseline
- **Post-incident hardening** — immediate remediation after macro-based malware incident

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Phishing: Spearphishing Attachment |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |
| [T1059.005](https://attack.mitre.org/techniques/T1059/005/) | Command and Scripting: Visual Basic |

## Compliance References

- **CIS Microsoft Office Benchmark**: Level 1, Control 2.1 (all Office apps)
- **DISA STIG**: DTOO104 — Office VBA macro warnings
- **NIST SP 800-53**: SI-3, SC-18
- **Microsoft Security Baseline**: Microsoft 365 Apps for Enterprise

## Test Status

✅ Tested on Microsoft 365 Apps v2402, Windows 10 22H2, Windows 11 24H2
