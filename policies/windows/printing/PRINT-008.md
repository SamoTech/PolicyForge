# PRINT-008 — Audit Printer Driver Events (Event ID 307, 808, 316)

**ID:** PRINT-008  
**Category:** Printing / Detection & Monitoring  
**Risk Level:** 🟡 Low (Detection)  
**OS:** Windows Vista+, Windows 11, Windows Server 2008+  
**Source:** Microsoft Print Spooler event logging documentation

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Advanced Audit Policy Configuration
                 └─ Object Access
                      └─ Audit Other Object Access Events → Success and Failure
```

## Registry

```
; Enable Microsoft-Windows-PrintService/Operational log
Key:   HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WINEVT\Channels\Microsoft-Windows-PrintService/Operational
Value: Enabled
Type:  DWORD
Data:  1
```

## PowerShell

```powershell
# Enable Print Service Operational log
wevtutil sl "Microsoft-Windows-PrintService/Operational" /e:true

# Verify
wevtutil gl "Microsoft-Windows-PrintService/Operational" | Select-String "enabled"

# Query for suspicious print driver installs (Event ID 316 = driver added)
Get-WinEvent -LogName "Microsoft-Windows-PrintService/Operational" |
    Where-Object { $_.Id -in @(307, 316, 808) } |
    Select TimeCreated, Id, Message |
    Sort-Object TimeCreated -Descending |
    Select-Object -First 20

# Event ID reference:
# 307 = Document printed (includes user, printer, size)
# 316 = Printer driver added/installed
# 808 = Print Spooler failed to load a plug-in
# 4657 = Registry value modified (track Spooler reg changes)
```

## Intune CSP

```
; Enable via PowerShell script in Intune Remediations
; Or via GPO: Advanced Audit Policy > Object Access > Other Object Access Events
```

## Description

Enables the Microsoft-Windows-PrintService/Operational event log to capture printer driver installation, document printing, and spooler errors. Event ID 316 (driver added) is a critical detection signal for PrintNightmare exploitation attempts. This policy provides visibility without blocking functionality — essential for SIEM integration and threat hunting.

## Impact

- ✅ Provides visibility into printer driver installations (Event 316)
- ✅ Captures all print jobs with user/document metadata (Event 307)
- ✅ Detects spooler plugin load failures (Event 808) — potential exploit indicator
- ⚠️ Increases event log volume in high-print environments
- ℹ️ Forward to SIEM: alert on Event 316 from non-admin users immediately

## Use Cases

- SOC environments monitoring for PrintNightmare exploitation
- SIEM integration (Splunk, Sentinel, Elastic)
- Threat hunting in environments where Spooler cannot be disabled
- Compliance evidence collection

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Indicator Removal: Clear Windows Event Logs | T1070.001 | Defense Evasion |
| Exploitation for Privilege Escalation | T1068 | Privilege Escalation |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.7.x (Audit Object Access)
- **NIST SP 800-171:** 3.3.1 — Create and retain system audit logs
- **Microsoft Security Baseline:** Enable print service operational log

## Test Status

✔ Tested on Windows 11 24H2
✔ Event 316 fires on driver install — confirmed in SIEM
