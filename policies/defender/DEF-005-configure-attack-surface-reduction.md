---
id: DEF-005
name: Configure Attack Surface Reduction (ASR) Rules
category: [Defender, ASR, Endpoint Protection]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows 10 1709+, Windows 11, Windows Server 2019+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Configure Attack Surface Reduction (ASR) Rules

> 🔴 **Risk Level: High** — ASR rules are the most granular attack surface controls in Windows. Each rule blocks a specific attacker technique. Deploy in Audit mode first, then enforce.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Microsoft Defender Exploit Guard
                          └── Attack Surface Reduction
                                └── Configure Attack Surface Reduction rules → Enabled
```

## Registry

| Key | GUID | Value | Description |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\ASR\Rules` | `BE9BA2D9-...` | `1` | Block executable content from email |
| | `D4F940AB-...` | `1` | Block Office apps from creating child processes |
| | `3B576869-...` | `1` | Block Office apps from creating executable content |
| | `75668C1F-...` | `1` | Block Office apps from injecting into other processes |
| | `D3E037E1-...` | `1` | Block JavaScript/VBScript from launching downloaded executables |
| | `5BEB7EFE-...` | `1` | Block execution of potentially obfuscated scripts |
| | `92E97FA1-...` | `1` | Block Win32 API calls from Office macros |
| | `01443614-...` | `1` | Block executable files unless they meet a prevalence criterion |

**Rule values:** `0` = Disabled, `1` = Block ✅, `2` = Audit mode

## Description

Attack Surface Reduction rules are granular behavioral controls that block specific attacker techniques at the kernel level. Each rule targets a distinct attack vector: email-delivered executables, Office macro abuse, script obfuscation, process injection, and more. ASR rules work independently of signatures and are effective against zero-days and LOLBin abuse. Microsoft recommends deploying in Audit mode first (value `2`) to identify false positives before switching to Block (`1`).

## PowerShell

```powershell
# Enable recommended ASR rules in Block mode
$rules = @(
    "BE9BA2D9-53EA-4CDC-84E5-9B1EEEE46550",  # Block executable content from email
    "D4F940AB-401B-4EFC-AADC-AD5F3C50688A",  # Block Office child processes
    "3B576869-A4EC-4529-8536-B80A7769E899",  # Block Office executable content
    "75668C1F-73B5-4CF0-BB93-3ECF5CB7CC84",  # Block Office process injection
    "D3E037E1-3EB8-44C8-A917-57927947596D",  # Block JS/VBS launching executables
    "5BEB7EFE-FD9A-4556-801D-275E5FFC04CC",  # Block obfuscated scripts
    "92E97FA1-70C8-4F4A-AFBA-EA27C6C5B8C5",  # Block Win32 API from Office macros
    "01443614-CD74-433A-B99E-2ECDC07BFC25"   # Block untrusted executables
)

foreach ($rule in $rules) {
    Add-MpPreference -AttackSurfaceReductionRules_Ids $rule -AttackSurfaceReductionRules_Actions Enabled
}

# Verify
Get-MpPreference | Select-Object AttackSurfaceReductionRules_Ids, AttackSurfaceReductionRules_Actions
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Defender/AttackSurfaceReductionRules` |
| Data Type | String |
| Value | `GUID=1\|GUID=1\|...` (pipe-separated rule=action pairs) |

## Impact

- ✅ Blocks Office macro abuse, email payload execution, script obfuscation at kernel level
- ✅ Effective against zero-days — no signature dependency
- ✅ Each rule is independently controllable — surgical enforcement possible
- ⚠️ High false-positive risk in environments with heavy macro/script use
- ⚠️ Must deploy in Audit mode first and review Event ID 1121/1122 logs
- ⚠️ Some rules incompatible with specific LOB applications — test per-application

## Use Cases

- **Phishing defense** — blocks email attachment execution patterns used in 90%+ of ransomware campaigns
- **Macro abuse prevention** — Office document macros blocked from spawning cmd/powershell
- **Red team simulation** — test ASR rules against your own tooling before deployment
- **Staged enterprise rollout** — Audit → Warn → Block progression per rule
- **CIS/DISA compliance** — ASR rules map directly to multiple benchmark controls

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Phishing: Spearphishing Attachment |
| [T1059.005](https://attack.mitre.org/techniques/T1059/005/) | Command and Scripting: Visual Basic |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |
| [T1055](https://attack.mitre.org/techniques/T1055/) | Process Injection |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 8.6–8.8
- **DISA STIG**: WN10-00-000030
- **NIST SP 800-53**: SI-3, SI-16
- **Microsoft Security Baseline**: Windows 10/11 — ASR rules included

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
