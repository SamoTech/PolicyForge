---
id: DEF-003
name: Enable Behavior Monitoring
category: [Defender, Behavioral Detection, Endpoint Protection]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable Behavior Monitoring

> 🔴 **Risk Level: High** — Behavior monitoring detects threats based on actions rather than signatures — critical for catching fileless malware and zero-days that bypass traditional scanning.

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

Behavior monitoring analyzes running processes and system activity patterns to detect malicious behaviors regardless of whether a file signature is known. It catches fileless attacks, living-off-the-land techniques, and process injection patterns that evade signature-based detection. This is part of Defender's next-generation protection layer and complements real-time scanning (DEF-001).

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "DisableBehaviorMonitoring" -Value 0 -Type DWord

# Verify
Get-MpPreference | Select-Object DisableBehaviorMonitoring
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Defender/AllowBehaviorMonitoring` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Detects fileless malware, LOLBins, and process injection attacks
- ✅ Catches zero-days that bypass signature scanning
- ✅ Complements real-time protection with behavioral heuristics
- ⚠️ Slight CPU overhead on systems with high process creation rates
- ℹ️ Works best when combined with cloud-delivered protection (DEF-002)

## Use Cases

- **Fileless malware defense** — catches PowerShell, WMI, and macro-based attacks with no disk artifacts
- **Zero-day protection** — behavioral patterns detected before signatures are released
- **Ransomware pre-execution** — detects encryption behavior patterns before files are destroyed
- **LOLBin abuse detection** — flags unusual use of `certutil`, `mshta`, `wscript`, etc.
- **Enterprise baseline** — mandatory on all endpoints in any modern security baseline

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1059](https://attack.mitre.org/techniques/T1059/) | Command and Scripting Interpreter |
| [T1055](https://attack.mitre.org/techniques/T1055/) | Process Injection |
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.3
- **DISA STIG**: WN10-00-000022
- **NIST SP 800-53**: SI-3, SI-16

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
