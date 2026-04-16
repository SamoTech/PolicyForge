# CRED-007 — Enable Protected Users Security Group

**ID:** CRED-007  
**Category:** Credential Hardening / Kerberos / Active Directory  
**Risk Level:** 🟠 Medium  
**OS:** Windows 8.1+, Windows 11 — requires Windows Server 2012 R2+ DC  
**Source:** Microsoft Docs — Protected Users Security Group · [learn.microsoft.com](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/protected-users-security-group)

---

## Policy Path

```
This is an Active Directory group membership change, not a GPO setting.
Active Directory Users and Computers:
  └─ Domain Root
       └─ Users
            └─ Protected Users (built-in group)
                 └─ Add: privileged accounts, admin accounts, service accounts (with caution)
```

## Registry

```
; No registry setting — enforced via AD group membership.
; DC enforces restrictions automatically when user is member of Protected Users.
```

## PowerShell

```powershell
# Add a user to Protected Users group
Add-ADGroupMember -Identity "Protected Users" -Members "AdminUser"

# Add all members of Domain Admins to Protected Users
$domainAdmins = Get-ADGroupMember -Identity "Domain Admins"
foreach ($admin in $domainAdmins) {
    Add-ADGroupMember -Identity "Protected Users" -Members $admin.SamAccountName
    Write-Host "Added $($admin.SamAccountName) to Protected Users"
}

# List current Protected Users members
Get-ADGroupMember -Identity "Protected Users" | Select Name, SamAccountName, objectClass

# Check if a user is in Protected Users
(Get-ADUser -Identity "AdminUser" -Properties MemberOf).MemberOf -match "Protected Users"
```

## Intune CSP

```
; Not applicable — AD group membership only.
; For Entra ID / hybrid, use Privileged Identity Management (PIM) instead.
```

## Description

Members of the **Protected Users** security group receive automatic authentication protections enforced by the Domain Controller:
- NTLM authentication is **blocked** (Kerberos required)
- DES and RC4 Kerberos encryption is **blocked** (AES required)
- Kerberos credential delegation is **blocked**
- Kerberos TGT lifetime is **capped at 4 hours** (not 10 hours default)
- No credential caching on the local machine (no offline logon)

This makes privileged accounts dramatically harder to compromise via Pass-the-Hash, Pass-the-Ticket, or Kerberoasting.

## Impact

- ✅ Blocks NTLM for protected accounts (forces Kerberos)
- ✅ Prevents TGT theft/reuse beyond 4 hours
- ✅ Blocks Kerberos delegation abuse
- ⚠️ Breaks offline logon for affected accounts (no credential caching)
- ⚠️ Breaks services using NTLM explicitly — do NOT add service accounts without testing
- ⚠️ Breaks delegation-dependent features (some RDP scenarios, legacy apps)

## Use Cases

- All Domain Admin / Tier-0 accounts
- Enterprise Admin accounts
- Schema Admin accounts
- High-value named admin accounts

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Pass the Hash | T1550.002 | Lateral Movement |
| Pass the Ticket | T1550.003 | Lateral Movement |
| Steal or Forge Kerberos Tickets | T1558 | Credential Access |
| Kerberoasting | T1558.003 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows Server 2022 v2.0 — recommended for privileged accounts
- **Microsoft Security Baseline:** Recommended for all Tier-0 accounts
- **NIST SP 800-171:** 3.5.3 — Use multifactor authentication
- **ACSC Essential Eight:** Restrict admin privileges

## Test Status

✔ Tested on Windows Server 2022 DC
✔ Verified NTLM blocked for Protected Users members
✔ Verified TGT 4-hour expiry enforced
