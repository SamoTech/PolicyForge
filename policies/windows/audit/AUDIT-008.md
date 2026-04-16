# AUDIT-008 — Privilege Use Auditing

**ID:** AUDIT-008  
**Category:** Audit Policy / Privilege Escalation Detection  
**Risk Level:** 🟡 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark · DISA STIG

---

## auditpol Commands

```powershell
# Privilege Use — Sensitive Privileges Only (not all — too noisy)
auditpol /set /subcategory:"Sensitive Privilege Use"  /success:enable /failure:enable
auditpol /set /subcategory:"Non Sensitive Privilege Use" /failure:enable
# Note: enabling Success on Non Sensitive creates enormous log volume
```

## Critical Event IDs — Privilege Use

| Event ID | Description | Alert On |
|---|---|---|
| **4673** | Privileged service called | SeDebugPrivilege, SeTcbPrivilege |
| **4674** | Operation attempted on privileged object | Failures |
| **4985** | State of transaction changed | Unusual state changes |

## Sensitive Privileges to Alert On

```
SeDebugPrivilege       — Debug programs. Used by mimikatz, process injection
SeTcbPrivilege         — Act as OS. Used for token manipulation
SeLoadDriverPrivilege  — Load kernel drivers. Used for rootkits
SeBackupPrivilege      — Backup files. Used to read SAM/SYSTEM hive
SeRestorePrivilege     — Restore files. Used for persistence
SeTakeOwnershipPrivilege — Take file ownership. Used for privilege escalation
SeImpersonatePrivilege — Impersonate after auth. Potato exploits
```

## Description

Privilege use auditing logs when sensitive Windows privileges are invoked. SeDebugPrivilege is used by credential dumping tools (Mimikatz) to access LSASS memory. SeBackupPrivilege is abused to read the SAM and SYSTEM registry hives for offline hash extraction. Auditing sensitive privilege use provides early warning for these techniques before credential theft completes. Limit to sensitive privileges only — non-sensitive privilege use creates excessive log noise.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.8.x (L1)
- **DISA STIG:** WN11-AU-000090

## Test Status

✔ Tested on Windows 11 24H2
