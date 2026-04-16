# Audit Policy & Event Logging Policies

Complete Windows audit policy configuration covering all 7 advanced audit categories, PowerShell logging, centralized event forwarding, log sizing, deception detection, and the 40 most critical Windows event IDs for SOC teams.

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [AUDIT-001](AUDIT-001.md) | Enable Advanced Audit Policy | Baseline | 🔴 Critical |
| [AUDIT-002](AUDIT-002.md) | Authentication & Logon Auditing | Detection | 🔴 Critical |
| [AUDIT-003](AUDIT-003.md) | Process Creation + Command Line | Detection | 🔴 Critical |
| [AUDIT-004](AUDIT-004.md) | PowerShell Script Block Logging | Detection | 🔴 Critical |
| [AUDIT-005](AUDIT-005.md) | Object Access & File System | Detection | 🟡 Medium |
| [AUDIT-006](AUDIT-006.md) | Account Management Auditing | Identity | 🔴 Critical |
| [AUDIT-007](AUDIT-007.md) | Policy Change Auditing | Config Detection | 🔴 Critical |
| [AUDIT-008](AUDIT-008.md) | Privilege Use Auditing | Escalation | 🟡 Medium |
| [AUDIT-009](AUDIT-009.md) | System Events + Log Cleared | Log Integrity | 🔴 Critical |
| [AUDIT-010](AUDIT-010.md) | Network & Share Auditing | Lateral Movement | 🟡 Medium |
| [AUDIT-011](AUDIT-011.md) | Event Log Size Configuration | Retention | 🟡 Medium |
| [AUDIT-012](AUDIT-012.md) | Windows Event Forwarding (SIEM) | Centralization | 🟡 Medium |
| [AUDIT-013](AUDIT-013.md) | Honeypot Account Detection | Deception | 🟡 Medium |
| [AUDIT-014](AUDIT-014.md) | 40 Critical Event IDs Reference | SOC Reference | 🟡 Medium |

---

## Deployment Order

```
Step 1 — Foundation:
  AUDIT-001  (enable advanced audit policy — MUST BE FIRST)

Step 2 — Critical Detection:
  AUDIT-002 → AUDIT-003 → AUDIT-004 → AUDIT-006 → AUDIT-009

Step 3 — Retention & Forwarding:
  AUDIT-011 → AUDIT-012  (size logs BEFORE enabling full auditing)

Step 4 — Depth:
  AUDIT-005 → AUDIT-007 → AUDIT-008 → AUDIT-010

Step 5 — Advanced:
  AUDIT-013 → AUDIT-014  (deception + SOC reference)
```

## MITRE ATT&CK Coverage Map

| Tactic | Technique | Event IDs | Policy |
|---|---|---|---|
| Initial Access | T1566 (Phishing) | 4688 (Office→shell) | AUDIT-003 |
| Execution | T1059.001 (PowerShell) | 4104 | AUDIT-004 |
| Persistence | T1053 (Scheduled Task) | 4698, 4702 | AUDIT-009 |
| Persistence | T1543 (Service) | 4697, 7045 | AUDIT-009 |
| Privilege Escalation | T1068 | 4673, 4674 | AUDIT-008 |
| Defense Evasion | T1070.001 (Clear Logs) | 1102, 104 | AUDIT-009 |
| Credential Access | T1003 (Credential Dump) | 4673 (SeDebug) | AUDIT-008 |
| Discovery | T1087 (Account Discovery) | 4625 (honeypot) | AUDIT-013 |
| Lateral Movement | T1021.001 (RDP) | 4624 Type 10 | AUDIT-002 |
| Lateral Movement | T1021.002 (SMB) | 5140 | AUDIT-010 |
| Lateral Movement | T1021.006 (WinRM) | 4624 Type 3 | AUDIT-002 |
| Command & Control | T1059 | 4104, 4688 | AUDIT-003/004 |

## Advanced Audit Policy — All Subcategories Baseline

```
# Run this to apply the complete PolicyForge audit baseline:

# Account Logon
auditpol /set /subcategory:"Credential Validation"              /success:enable /failure:enable
auditpol /set /subcategory:"Kerberos Authentication Service"    /success:enable /failure:enable
auditpol /set /subcategory:"Kerberos Service Ticket Operations" /success:enable /failure:enable

# Account Management
auditpol /set /subcategory:"User Account Management"           /success:enable /failure:enable
auditpol /set /subcategory:"Security Group Management"         /success:enable /failure:enable
auditpol /set /subcategory:"Computer Account Management"       /success:enable /failure:enable

# Logon/Logoff
auditpol /set /subcategory:"Logon"                             /success:enable /failure:enable
auditpol /set /subcategory:"Logoff"                            /success:enable
auditpol /set /subcategory:"Account Lockout"                   /failure:enable
auditpol /set /subcategory:"Special Logon"                     /success:enable

# Object Access
auditpol /set /subcategory:"File System"                       /success:enable /failure:enable
auditpol /set /subcategory:"Registry"                         /failure:enable
auditpol /set /subcategory:"SAM"                               /failure:enable
auditpol /set /subcategory:"Removable Storage"                 /success:enable /failure:enable
auditpol /set /subcategory:"File Share"                        /success:enable /failure:enable
auditpol /set /subcategory:"Filtering Platform Connection"      /failure:enable

# Policy Change
auditpol /set /subcategory:"Audit Policy Change"               /success:enable /failure:enable
auditpol /set /subcategory:"Authentication Policy Change"      /success:enable
auditpol /set /subcategory:"MPSSVC Rule-Level Policy Change"   /success:enable /failure:enable

# Privilege Use
auditpol /set /subcategory:"Sensitive Privilege Use"           /success:enable /failure:enable

# Detailed Tracking
auditpol /set /subcategory:"Process Creation"                  /success:enable
auditpol /set /subcategory:"Process Termination"               /success:enable

# System
auditpol /set /subcategory:"Security System Extension"         /success:enable
auditpol /set /subcategory:"System Integrity"                  /success:enable /failure:enable
auditpol /set /subcategory:"Security State Change"             /success:enable
auditpol /set /subcategory:"Other System Events"               /success:enable /failure:enable
```

## Related Policies

- [FW-002](../firewall/FW-002.md) — Firewall logging (complements AUDIT-010)
- [AUDIT-004](AUDIT-004.md) — PowerShell logging (complements AUDIT-003)
- [WU-012](../update/WU-012.md) — WU compliance audit (uses event log queries)
