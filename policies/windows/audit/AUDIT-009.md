# AUDIT-009 — System Event Auditing (Security Log Cleared)

**ID:** AUDIT-009  
**Category:** Audit Policy / Log Integrity  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark · Microsoft Security Baseline

---

## auditpol Commands

```powershell
# System subcategories
auditpol /set /subcategory:"Security System Extension" /success:enable
auditpol /set /subcategory:"System Integrity"          /success:enable /failure:enable
auditpol /set /subcategory:"IPsec Driver"              /failure:enable
auditpol /set /subcategory:"Other System Events"       /success:enable /failure:enable
auditpol /set /subcategory:"Security State Change"     /success:enable
```

## Critical Event IDs — System & Log Integrity

| Event ID | Description | Alert Level |
|---|---|---|
| **1102** | **Security audit log cleared** | 🔴 CRITICAL — always alert |
| **4608** | Windows starting up | Baseline |
| **4616** | System time changed | 🔴 Alert — log timestamp manipulation |
| **4621** | Administrator recovered system from CrashOnAuditFail | 🔴 Critical |
| **4697** | **Service installed in the system** | 🔴 Always alert |
| **7045** | **New service installed** (System log) | 🔴 Always alert |
| **4698** | Scheduled task created | 🔴 Always alert |
| **4702** | Scheduled task modified | 🔴 Always alert |
| **104** | System event log cleared (System log) | 🔴 Alert |

## PowerShell — Detect Log Clearing

```powershell
# Alert on Security log cleared (Event 1102)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=1102} -MaxEvents 10 |
    Select TimeCreated,
           @{N='ClearedBy';E={$_.Properties[1].Value}},
           Message

# Alert on new service installed (Event 7045)
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7045} -MaxEvents 50 |
    ForEach-Object {
        [PSCustomObject]@{
            Time        = $_.TimeCreated
            ServiceName = $_.Properties[0].Value
            ImagePath   = $_.Properties[1].Value
            StartType   = $_.Properties[2].Value
            Account     = $_.Properties[4].Value
        }
    } | Sort Time -Descending
```

## Description

Event 1102 (Security log cleared) is the single highest-priority event in Windows security monitoring. Attackers clear event logs after gaining access to remove evidence of their activity. This event itself cannot be suppressed — even clearing the log generates this event. Event 7045 (new service installed) is a primary persistence mechanism indicator: both legitimate software and malware install Windows services. Any unexpected service installation should trigger investigation.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.9.x (L1)
- **DISA STIG:** WN11-AU-000100

## Test Status

✔ Tested on Windows 11 24H2
