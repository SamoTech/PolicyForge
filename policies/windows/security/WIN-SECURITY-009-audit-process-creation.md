---
id: WIN-SECURITY-009
name: Enable Audit Process Creation
category: [Security, Auditing, Logging]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows Vista+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable Audit Process Creation

> 🟠 **Risk Level: Medium** — Process creation auditing is foundational for detecting living-off-the-land attacks, lateral movement, and persistence mechanisms. Without it, attackers operate invisibly.

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Advanced Audit Policy Configuration
                    └── Detailed Tracking
                          └── Audit Process Creation → Success
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Control\Lsa` | `SCENoApplyLegacyAuditPolicy` | `1` | REG_DWORD |

> Apply via `auditpol` command (see PowerShell section) — the registry key alone is insufficient.

## Description

Audit Process Creation logs Event ID 4688 whenever a new process starts on the system, including the process name, executable path, parent process, and (with command line auditing enabled) the full command line arguments. This is one of the most valuable event sources for detecting malware execution, lateral movement tools, credential dumping utilities, and persistence mechanisms. Pair with command line inclusion for maximum forensic value.

## PowerShell

```powershell
# Enable Process Creation auditing
auditpol /set /subcategory:"Process Creation" /success:enable /failure:enable

# Enable command line capture in process creation events
$path = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "ProcessCreationIncludeCmdLine_Enabled" -Value 1 -Type DWord

# Verify
auditpol /get /subcategory:"Process Creation"
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation` |
| Data Type | Integer |
| Value | `1` (Success) or `3` (Success+Failure) |

## Impact

- ✅ Event ID 4688 logs every process launch with parent/child relationship
- ✅ Enables detection of LOLBins (living off the land binaries): `cmd.exe`, `wscript.exe`, `mshta.exe`
- ✅ Full command line logging reveals malicious arguments and encoded payloads
- ⚠️ High-volume systems generate significant event log traffic — size logs appropriately
- ⚠️ Command line logging may capture sensitive data (passwords passed as arguments)
- ℹ️ Combine with Sysmon Event ID 1 for richer process telemetry

## Use Cases

- **Threat hunting** — hunt for `powershell -enc`, `certutil -urlcache`, `mshta http://` patterns
- **Incident response** — reconstruct full process execution chain during forensic investigation
- **SOC alerting** — forward Event 4688 to SIEM for real-time detection rules
- **Malware analysis** — track all child processes spawned by suspicious parent processes
- **Compliance** — required by NIST, DISA STIG, and CIS for privileged activity monitoring

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1059](https://attack.mitre.org/techniques/T1059/) | Command and Scripting Interpreter |
| [T1218](https://attack.mitre.org/techniques/T1218/) | System Binary Proxy Execution (LOLBins) |
| [T1547](https://attack.mitre.org/techniques/T1547/) | Boot or Logon Autostart Execution |
| [T1204](https://attack.mitre.org/techniques/T1204/) | User Execution |

## Compliance References

- **CIS Benchmark**: Level 1, Control 17.2.1
- **DISA STIG**: WN10-AU-000500
- **NIST SP 800-53**: AU-12
- **MS Security Baseline**: Included in all Windows 10/11 and Server baselines

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
