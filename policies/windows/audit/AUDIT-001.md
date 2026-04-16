# AUDIT-001 — Enable Advanced Audit Policy (Replace Legacy)

**ID:** AUDIT-001  
**Category:** Audit Policy / Baseline  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11, Windows Server 2016+  
**Source:** Microsoft Security Baseline · CIS Benchmark Windows 11 v3.0

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Local Policies
                 └─ Security Options
                      └─ Audit: Force audit policy subcategory settings to override
                           audit policy category settings
                           └─ Enabled
```

## Registry

```
HKLM\SYSTEM\CurrentControlSet\Control\Lsa
  SCENoApplyLegacyAuditPolicy = 1    (1=use advanced subcategory policy)
```

## PowerShell / auditpol

```powershell
# Force advanced audit policy over legacy
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" `
    -Name "SCENoApplyLegacyAuditPolicy" -Value 1

# Check current advanced audit policy state
auditpol /get /category:*

# Export current policy to file
auditpol /backup /file:"C:\PolicyForge\audit-policy-backup.csv"

# Import a pre-configured policy
auditpol /restore /file:"C:\PolicyForge\audit-policy-baseline.csv"

# Enable a specific subcategory (example: Logon events)
auditpol /set /subcategory:"Logon" /success:enable /failure:enable

# View all subcategories with current settings
auditpol /get /category:* | Format-Table -AutoSize
```

## Advanced vs. Legacy Audit Policy

| Feature | Legacy (9 categories) | Advanced (53 subcategories) |
|---|---|---|
| Granularity | Coarse | Fine-grained |
| Subcategory control | No | Yes |
| GPO path | Security Settings > Local Policies | Advanced Audit Policy Configuration |
| Recommended | ❌ No | ✅ Yes |

## Description

Windows has two audit policy systems: the legacy 9-category system and the Advanced Audit Policy with 53 granular subcategories. This policy forces Windows to use the advanced system, ignoring any legacy settings. Advanced audit policy is the foundation for all other AUDIT-* policies — without this enabled, subcategory settings have no effect. Every enterprise environment should have this enabled as the first audit configuration step.

## Impact

- ✅ Enables granular 53-subcategory audit control
- ✅ Legacy and advanced policies no longer conflict
- ⚠️ Legacy audit settings (under Local Policies > Audit Policy) are completely ignored
- ℹ️ Backup current policy before switching with `auditpol /backup`

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.1.1 (L1)
- **DISA STIG:** WN11-SO-000030
- **Microsoft Security Baseline:** Windows 11 24H2

## Test Status

✔ Tested on Windows 11 24H2
