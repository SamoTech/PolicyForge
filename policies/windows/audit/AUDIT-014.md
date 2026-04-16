# AUDIT-014 — The 40 Critical Windows Event IDs (SOC Reference)

**ID:** AUDIT-014  
**Category:** Audit Policy / SOC Reference  
**Risk Level:** 🟡 Medium  
**OS:** Windows 10+, Windows 11, Windows Server  
**Source:** PolicyForge SOC Reference · NSA/CISA · Microsoft

---

## Category 1: Authentication & Credential Events

| Event ID | Log | Description | Priority | Policy |
|---|---|---|---|---|
| 4624 | Security | Successful logon | Monitor | AUDIT-002 |
| 4625 | Security | Failed logon | 🔴 Alert on bulk | AUDIT-002 |
| 4634 | Security | Account logoff | Monitor | AUDIT-002 |
| 4648 | Security | Logon with explicit credentials | 🔴 Always alert | AUDIT-002 |
| 4672 | Security | Special privilege logon | Monitor | AUDIT-002 |
| 4740 | Security | Account locked out | 🔴 Bulk = spray | AUDIT-002 |
| 4768 | Security | Kerberos TGT requested | Alert on failures | AUDIT-002 |
| 4769 | Security | Kerberos service ticket | Alert RC4 encryption | AUDIT-002 |
| 4771 | Security | Kerberos pre-auth failed | Alert on bulk | AUDIT-002 |
| 4776 | Security | NTLM auth attempt | Alert in modern env | AUDIT-002 |

## Category 2: Account Management Events

| Event ID | Log | Description | Priority | Policy |
|---|---|---|---|---|
| 4720 | Security | User account created | 🔴 Always | AUDIT-006 |
| 4724 | Security | Password reset by admin | 🔴 Always | AUDIT-006 |
| 4726 | Security | User account deleted | 🔴 Always | AUDIT-006 |
| 4728 | Security | Member added to global group | 🔴 Domain Admins | AUDIT-006 |
| 4732 | Security | Member added to local group | 🔴 Administrators | AUDIT-006 |
| 4756 | Security | Member added to universal group | 🔴 EA/SA groups | AUDIT-006 |

## Category 3: Process & Execution Events

| Event ID | Log | Description | Priority | Policy |
|---|---|---|---|---|
| 4688 | Security | Process created | 🔴 Office→shell | AUDIT-003 |
| 4689 | Security | Process exited | Monitor | AUDIT-003 |
| 4104 | PS/Operational | PowerShell script block | 🔴 Encoded/IEX | AUDIT-004 |

## Category 4: Persistence & Service Events

| Event ID | Log | Description | Priority | Policy |
|---|---|---|---|---|
| 4697 | Security | Service installed | 🔴 Always | AUDIT-009 |
| 4698 | Security | Scheduled task created | 🔴 Always | AUDIT-009 |
| 4702 | Security | Scheduled task modified | 🔴 Always | AUDIT-009 |
| 7045 | System | New service installed | 🔴 Always | AUDIT-009 |
| 4657 | Security | Registry value modified | Run keys, AppInit | AUDIT-005 |

## Category 5: Network & Lateral Movement

| Event ID | Log | Description | Priority | Policy |
|---|---|---|---|---|
| 5140 | Security | Network share accessed | 🔴 Admin shares | AUDIT-010 |
| 5145 | Security | Share object access check | Bulk = ransomware | AUDIT-010 |
| 5156 | Security | Network connection allowed | Unusual outbound | AUDIT-010 |
| 5158 | Security | Port bound | New listeners | AUDIT-010 |

## Category 6: Log Integrity & Policy Changes

| Event ID | Log | Description | Priority | Policy |
|---|---|---|---|---|
| 1102 | Security | Security log cleared | 🔴 CRITICAL | AUDIT-009 |
| 104 | System | System log cleared | 🔴 CRITICAL | AUDIT-009 |
| 4719 | Security | Audit policy changed | 🔴 Always | AUDIT-007 |
| 4905 | Security | Event source unregistered | 🔴 Log tamper | AUDIT-007 |
| 4616 | Security | System time changed | 🔴 Alert | AUDIT-007 |

## Category 7: Object Access & Privilege

| Event ID | Log | Description | Priority | Policy |
|---|---|---|---|---|
| 4663 | Security | Object access attempt | Bulk reads | AUDIT-005 |
| 4673 | Security | Privileged service called | SeDebugPriv | AUDIT-008 |
| 4674 | Security | Privileged operation attempted | Failures | AUDIT-008 |
| 4906 | Security | CrashOnAuditFail changed | 🔴 Critical | AUDIT-007 |

## Quick SIEM Alert Priority Matrix

```
🔴 IMMEDIATE ALERT (P1 — 15-minute SLA):
   1102, 4719, 7045, 4697, 4698, 4728 (to privileged groups)

🟠 HIGH ALERT (P2 — 1-hour SLA):
   4625 (>10 failures/5min), 4648, 4720, 4726, 4769 (RC4)

🟡 MEDIUM ALERT (P3 — 4-hour SLA):
   4624 (after hours, unusual LogonType), 5140 (admin shares),
   4104 (encoded PS), 4688 (suspicious parent-child)

🟢 LOW / INFORMATION (P4 — daily review):
   4624 (normal business hours), 4634, 4634, 4688 (normal)
```

## Test Status

✔ Reference validated against Windows 11 24H2 + Windows Server 2022
