# AUDIT-003 — Process Creation & Command Line Auditing

**ID:** AUDIT-003  
**Category:** Audit Policy / Process Tracking  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** NSA/CISA · Microsoft Security Baseline · SANS

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Advanced Audit Policy Configuration
                 └─ Detailed Tracking
                      ├─ Audit Process Creation:    Success
                      └─ Audit Process Termination: Success

  └─ Administrative Templates
       └─ System
            └─ Audit Process Creation
                 └─ Include command line in process creation events: Enabled
```

## auditpol + Registry

```powershell
# Enable process creation auditing
auditpol /set /subcategory:"Process Creation" /success:enable
auditpol /set /subcategory:"Process Termination" /success:enable

# Enable command line logging in event 4688
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" `
    -Name "ProcessCreationIncludeCmdLine_Enabled" -Value 1 -Force
```

## Critical Event IDs — Process

| Event ID | Description | Alert On |
|---|---|---|
| **4688** | New process created | cmd.exe/powershell.exe spawned by Office apps |
| **4689** | Process exited | — |
| **4696** | Primary token assigned to process | Privilege escalation |

## High-Value Process Combinations to Alert On

```
# Malicious parent-child process relationships:
winword.exe     → cmd.exe, powershell.exe, wscript.exe
excel.exe       → cmd.exe, powershell.exe, mshta.exe
outlook.exe     → powershell.exe, wscript.exe, cscript.exe
browser.exe     → powershell.exe, cmd.exe
powershell.exe  → net.exe, whoami.exe, ipconfig.exe (recon)
cmd.exe         → certutil.exe, bitsadmin.exe (download cradles)
```

## PowerShell — Hunt for Suspicious Processes

```powershell
# Get all process creation events with command lines
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4688} -MaxEvents 200 |
    ForEach-Object {
        [PSCustomObject]@{
            Time       = $_.TimeCreated
            Process    = $_.Properties[5].Value   # New Process Name
            CommandLine = $_.Properties[8].Value  # Command Line (requires cmdline auditing)
            ParentPID  = $_.Properties[7].Value   # Creator Process ID
            User       = $_.Properties[1].Value
        }
    } | Where-Object { $_.Process -match 'powershell|cmd|wscript|cscript|mshta' } |
    Sort Time -Descending

# Alert: Office spawning shells
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4688} -MaxEvents 1000 |
    Where-Object { $_.Properties[8].Value -match 'powershell|cmd' -and
                   $_.Properties[13].Value -match 'WINWORD|EXCEL|OUTLOOK' }
```

## Description

Process creation auditing with command line logging (Event 4688) is the single most powerful endpoint detection capability after EDR. Every process launch is logged with its full command line, enabling detection of: malware execution, LOLBin abuse (certutil, bitsadmin, mshta), Office macro shells, PowerShell download cradles, and lateral movement tools (psexec, wmiexec). The command line field reveals attacker intent that process name alone cannot.

## Impact

- ✅ Full process execution visibility including command lines
- ✅ Detects LOLBin abuse, macro execution, download cradles
- ⚠️ Log volume increases significantly — size security log accordingly (AUDIT-013)
- ⚠️ Command lines may contain sensitive data (passwords in CLI args)

## MITRE ATT&CK Coverage

T1059 (Command & Scripting), T1218 (LOLBins), T1566.001 (Phishing → Macro), T1105 (Ingress Transfer)

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.3.1, 17.3.2 (L1)
- **DISA STIG:** WN11-AU-000040, WN11-CC-000066

## Test Status

✔ Tested on Windows 11 24H2
✔ Command line visible in Event 4688
