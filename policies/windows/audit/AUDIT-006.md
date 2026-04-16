# AUDIT-006 — Account Management Auditing

**ID:** AUDIT-006  
**Category:** Audit Policy / Identity Management  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11, Windows Server 2016+  
**Source:** CIS Benchmark · DISA STIG · Microsoft Security Baseline

---

## auditpol Commands

```powershell
# Account Management subcategories
auditpol /set /subcategory:"User Account Management"    /success:enable /failure:enable
auditpol /set /subcategory:"Security Group Management"  /success:enable /failure:enable
auditpol /set /subcategory:"Computer Account Management" /success:enable /failure:enable
auditpol /set /subcategory:"Other Account Management Events" /success:enable
```

## Critical Event IDs — Account Management

| Event ID | Description | Alert Level |
|---|---|---|
| **4720** | User account created | 🔴 Always alert |
| **4722** | User account enabled | 🔴 Alert if unexpected |
| **4723** | Password change attempt | 🟡 Monitor |
| **4724** | Password reset (admin) | 🔴 Always alert |
| **4725** | User account disabled | 🟡 Monitor |
| **4726** | **User account deleted** | 🔴 Always alert |
| **4728** | Member added to global security group | 🔴 Alert — esp. Domain Admins |
| **4732** | Member added to local security group | 🔴 Alert — esp. Administrators |
| **4735** | Security group changed | 🟡 Monitor |
| **4756** | Member added to universal security group | 🔴 Alert |
| **4767** | User account unlocked | 🟡 Monitor |
| **4781** | Account name changed | 🔴 Alert |

## PowerShell — Monitor Privileged Group Changes

```powershell
# Alert: any addition to Domain Admins or local Administrators
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=@(4728,4732,4756)} -MaxEvents 100 |
    ForEach-Object {
        [PSCustomObject]@{
            Time      = $_.TimeCreated
            EventId   = $_.Id
            AddedUser = $_.Properties[0].Value
            Group     = $_.Properties[2].Value
            ByUser    = $_.Properties[4].Value
        }
    } | Where-Object { $_.Group -match 'Administrators|Domain Admins|Enterprise Admins' } |
    Sort Time -Descending

# Alert: new user accounts created outside business hours
Get-WinEvent -FilterHashtable @{
    LogName='Security'; Id=4720
    StartTime=(Get-Date).AddDays(-7)
} | Where-Object { $_.TimeCreated.Hour -notin (8..18) }
```

## Description

Account management auditing tracks every change to user accounts and security groups. The most critical events are group membership changes to privileged groups (4728/4732) — attackers who gain admin access often add their own accounts or backdoor accounts to Domain Admins. Account creation outside business hours (4720) is a strong persistence indicator. Password resets by admins (4724) targeting service accounts indicate credential harvesting.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.2.x (L1)
- **DISA STIG:** WN11-AU-000015 through WN11-AU-000025
- **NIST 800-53:** AC-2, AU-2

## Test Status

✔ Tested on Windows 11 24H2 + Windows Server 2022 AD
