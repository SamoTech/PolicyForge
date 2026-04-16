# AUDIT-011 — Windows Event Log Size Configuration

**ID:** AUDIT-011  
**Category:** Audit Policy / Log Retention  
**Risk Level:** 🟡 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Windows 11 v3.0 · DISA STIG

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Windows Components
            └─ Event Log Service
                 ├─ Application: Maximum Log Size: 32,768 KB (32 MB)
                 ├─ Security:    Maximum Log Size: 196,608 KB (192 MB)
                 ├─ System:      Maximum Log Size: 32,768 KB (32 MB)
                 └─ Setup:       Maximum Log Size: 32,768 KB (32 MB)
```

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Windows\EventLog\Application
  MaxSize = 0x8000    (32768 KB = 32 MB)

HKLM\SOFTWARE\Policies\Microsoft\Windows\EventLog\Security
  MaxSize = 0x30000   (196608 KB = 192 MB)

HKLM\SOFTWARE\Policies\Microsoft\Windows\EventLog\System
  MaxSize = 0x8000    (32768 KB = 32 MB)

; Retention behavior (all logs)
  Retention = "0"     ("0" = overwrite as needed)
```

## PowerShell

```powershell
# Set Security log to 192 MB (recommended minimum)
Limit-EventLog -LogName Security -MaximumSize 196608KB

# Set other logs to 32 MB
Limit-EventLog -LogName Application, System, Setup -MaximumSize 32768KB

# Set retention: overwrite as needed (not manual clear required)
Limit-EventLog -LogName Security, Application, System -RetentionDays 0

# Check current log sizes and fill level
Get-WinEvent -ListLog * | Where-Object { $_.LogName -in @('Security','Application','System') } |
    Select LogName,
           @{N='MaxMB';E={[math]::Round($_.MaximumSizeInBytes/1MB,1)}},
           @{N='CurrentMB';E={[math]::Round($_.FileSize/1MB,1)}},
           @{N='FillPct';E={[math]::Round($_.FileSize/$_.MaximumSizeInBytes*100,1)}}

# Enable Operational logs for PowerShell and AppLocker
wevtutil set-log "Microsoft-Windows-PowerShell/Operational" /enabled:true /maxsize:51200000
wevtutil set-log "Microsoft-Windows-AppLocker/EXE and DLL" /enabled:true /maxsize:51200000
```

## Recommended Log Sizes by Role

| Role | Security Log | Application | System | PS/Operational |
|---|---|---|---|---|
| Workstation | 192 MB | 32 MB | 32 MB | 50 MB |
| Member Server | 512 MB | 64 MB | 64 MB | 100 MB |
| Domain Controller | 1 GB+ | 128 MB | 128 MB | 200 MB |
| Critical Server | 2 GB | 256 MB | 256 MB | 500 MB |

## Description

The default Security event log size (20 MB) is dangerously small — on active systems with full auditing enabled, it fills within hours and begins overwriting old events. This destroys forensic evidence. The CIS Benchmark minimum of 196 MB for the Security log provides roughly 7-30 days of retention depending on activity level. For enterprise environments, 192 MB should be the absolute minimum, with forwarding to a SIEM for longer retention.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.9.26.x (L1)
- **DISA STIG:** WN11-AU-000500, WN11-AU-000505, WN11-AU-000510

## Test Status

✔ Tested on Windows 11 24H2
