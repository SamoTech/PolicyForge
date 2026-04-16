---
id: OFFICE-002
name: Block Macros from Internet-Originated Office Files
category: [Office, Macro Security, Phishing Defense]
risk_level: Critical
risk_emoji: 🔴
applies_to: [Office 2016+, Microsoft 365 Apps v2203+, Windows 10, Windows 11]
test_status: "✅ Tested on Microsoft 365 Apps v2402, Windows 11 24H2"
---

# Block Macros from Internet-Originated Office Files

> 🔴 **Risk Level: Critical** — This is the single most impactful macro security control available. Microsoft enabled this by default in 2022 (M365 Apps v2203+). Ensuring it is enforced via policy prevents it from being disabled by users or reversed by attackers.

## Policy Path

```
User Configuration
  └── Administrative Templates
        └── Microsoft Office 2016
              └── Security Settings
                    └── Block macros from running in Office files from the Internet → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\excel\security` | `blockcontentexecutionfrominternet` | `1` | REG_DWORD |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security` | `blockcontentexecutionfrominternet` | `1` | REG_DWORD |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\powerpoint\security` | `blockcontentexecutionfrominternet` | `1` | REG_DWORD |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\access\security` | `blockcontentexecutionfrominternet` | `1` | REG_DWORD |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\visio\security` | `blockcontentexecutionfrominternet` | `1` | REG_DWORD |

## Description

When a file is downloaded from the internet (email, browser, Teams), Windows marks it with the "Mark of the Web" (MOTW) Zone Identifier flag (`Zone.Identifier: 3`). This policy blocks all macro execution in any Office file carrying a Zone 3 (Internet) or Zone 4 (Restricted Sites) MOTW tag. Unlike `VBAWarnings`, there is no user-clickable bypass — the macro is hard-blocked and the user sees a security notice without an "Enable Content" option. This was made default in M365 Apps v2203 (April 2022) but must be enforced via policy to prevent reversal.

## PowerShell

```powershell
$apps = @("excel", "word", "powerpoint", "access", "visio")
$basePath = "HKCU:\SOFTWARE\Policies\Microsoft\Office\16.0"

foreach ($app in $apps) {
    $path = "$basePath\$app\security"
    If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
    Set-ItemProperty -Path $path -Name "blockcontentexecutionfrominternet" -Value 1 -Type DWord
    Write-Output "Blocked internet macros for $app"
}

# Verify Mark of the Web on a test file
# Get-Item .\test.docx -Stream * | Where-Object Stream -eq 'Zone.Identifier'
```

## Intune CSP

| Setting | Value |
|---|---|
| Deploy via | Intune ADMX ingestion (Office ADMX) |
| Setting | Block macros from running in Office files from the Internet |
| Applies to | Word, Excel, PowerPoint, Access, Visio |

## Impact

- ✅ Hard-blocks all macros in downloaded Office files — no user bypass option
- ✅ No notification bar "Enable Content" button shown — removes social engineering path
- ✅ Covers email attachments, browser downloads, and Teams file transfers
- ⚠️ Files shared via UNC paths or copied from removable media may not carry MOTW
- ⚠️ Unblocking requires IT to remove Zone.Identifier stream or move file to Trusted Location
- ℹ️ Combine with OFFICE-001 for defense-in-depth against non-MOTW macro files

## Use Cases

- **Phishing defense** — blocks 95%+ of email-delivered macro malware (Emotet, QakBot, etc.)
- **Zero-trust document policy** — no macros from external sources, ever
- **Regulatory compliance** — hardened macro policy required by CIS, DISA, and NIST baselines
- **Post-incident** — immediate enforcement after macro-based ransomware incident
- **M365 version enforcement** — ensure Microsoft's 2022 default change is policy-locked

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Phishing: Spearphishing Attachment |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |
| [T1059.005](https://attack.mitre.org/techniques/T1059/005/) | Command and Scripting: Visual Basic |
| [T1553.006](https://attack.mitre.org/techniques/T1553/006/) | Subvert Trust Controls: Code Signing (MOTW bypass) |

## Compliance References

- **CIS Microsoft Office Benchmark**: Level 1, Control 2.2
- **DISA STIG**: DTOO110 — Block internet macros
- **NIST SP 800-53**: SI-3, SI-16
- **Microsoft Security Baseline**: Microsoft 365 Apps for Enterprise 2022+

## Test Status

✅ Tested on Microsoft 365 Apps v2402, Windows 11 24H2
