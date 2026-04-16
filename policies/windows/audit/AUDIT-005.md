# AUDIT-005 — Object Access & File System Auditing

**ID:** AUDIT-005  
**Category:** Audit Policy / Object Access  
**Risk Level:** 🟡 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark · Microsoft Security Baseline

---

## Policy Path

```
Computer Configuration
  └─ Advanced Audit Policy Configuration
       └─ Object Access
            ├─ Audit File System:              Success + Failure (sensitive paths only)
            ├─ Audit Registry:                 Success + Failure
            ├─ Audit SAM:                      Failure
            ├─ Audit Removable Storage:        Success + Failure
            └─ Audit Kernel Object:            Failure
```

## auditpol Commands

```powershell
# Enable object access auditing
auditpol /set /subcategory:"File System" /success:enable /failure:enable
auditpol /set /subcategory:"Registry" /failure:enable
auditpol /set /subcategory:"SAM" /failure:enable
auditpol /set /subcategory:"Removable Storage" /success:enable /failure:enable

# Set SACL on sensitive folder (enable auditing on the object itself)
# This step is REQUIRED — auditpol alone doesn't enable per-file logging
$acl = Get-Acl "C:\SensitiveData"
$auditRule = New-Object System.Security.AccessControl.FileSystemAuditRule(
    "Everyone", "ReadData,WriteData,Delete", "ContainerInherit,ObjectInherit",
    "None", "Success,Failure")
$acl.AddAuditRule($auditRule)
Set-Acl "C:\SensitiveData" $acl
```

## Critical Event IDs — Object Access

| Event ID | Description | Alert On |
|---|---|---|
| **4656** | Handle to object requested | Failed access to sensitive files |
| **4660** | Object deleted | SAM/credential store deletion |
| **4663** | Object access attempt | Bulk file reads (ransomware staging) |
| **4698** | Scheduled task created | Always alert |
| **4699** | Scheduled task deleted | Always alert |
| **4702** | Scheduled task updated | Always alert |
| **4657** | Registry value modified | HKLM\SAM, Run keys, AppInit |

## ⚠️ Important: Two-Step Process

```
Step 1: auditpol — enables the audit subcategory globally
Step 2: SACL — sets the audit rule on the specific file/folder/registry key

BOTH steps are required. auditpol without SACL = no events logged.
SACL without auditpol = no events logged.
```

## Description

Object access auditing logs access to files, registry keys, and other securable objects — but only for objects that have a System Access Control List (SACL) configured. Apply SACLs selectively to high-value targets: credential stores, sensitive data folders, critical registry keys (Run keys, SAM, LSA secrets). Auditing everything generates enormous log volume; auditing selectively provides high signal-to-noise detection.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.6.x (L1)
- **DISA STIG:** WN11-AU-000075

## Test Status

✔ Tested on Windows 11 24H2
