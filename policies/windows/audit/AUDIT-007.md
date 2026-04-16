# AUDIT-007 — Policy Change Auditing

**ID:** AUDIT-007  
**Category:** Audit Policy / Configuration Change Detection  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark · DISA STIG

---

## auditpol Commands

```powershell
# Policy Change subcategories
auditpol /set /subcategory:"Audit Policy Change"            /success:enable /failure:enable
auditpol /set /subcategory:"Authentication Policy Change"   /success:enable
auditpol /set /subcategory:"Authorization Policy Change"    /success:enable
auditpol /set /subcategory:"Filtering Platform Policy Change" /failure:enable
auditpol /set /subcategory:"MPSSVC Rule-Level Policy Change" /success:enable /failure:enable
```

## Critical Event IDs — Policy Changes

| Event ID | Description | Alert On |
|---|---|---|
| **4713** | Kerberos policy changed | Always alert |
| **4715** | Audit policy on object changed | Always alert |
| **4719** | **System audit policy changed** | 🔴 Always alert — attacker covering tracks |
| **4739** | Domain policy changed | Always alert |
| **4817** | Auditing settings changed on object | Alert |
| **4902** | Per-user audit policy table created | Alert |
| **4904** | Security event source registered | Alert |
| **4905** | Security event source unregistered | 🔴 Alert — log tampering |
| **4906** | CrashOnAuditFail value changed | 🔴 Critical — disabling auditing |
| **4944** | Firewall policy active on start | Baseline check |
| **4946** | Firewall exception list changed | Monitor |
| **4947** | Firewall exception list modified | Monitor |
| **4950** | Firewall setting changed | Monitor |

## Description

Policy change auditing detects attackers modifying security configurations to cover their tracks or weaken defenses. Event 4719 (audit policy changed) is critical: sophisticated attackers disable audit logging before performing malicious actions. Event 4906 (CrashOnAuditFail changed) indicates an attempt to disable audit enforcement. Firewall change events (4944-4950) detect malware or attackers opening firewall holes. These events should trigger immediate SOC investigation.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.7.x (L1)
- **DISA STIG:** WN11-AU-000080

## Test Status

✔ Tested on Windows 11 24H2
