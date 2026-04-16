# AUDIT-013 — Honeypot Account Detection (Deception-Based Detection)

**ID:** AUDIT-013  
**Category:** Audit Policy / Deception / Early Warning  
**Risk Level:** 🟡 Medium  
**OS:** Windows 10+, Windows 11, Active Directory  
**Source:** Security Research · SANS Blue Team

---

## Concept

```
Honeypot Account Strategy:

Create a fake privileged account that:
  - Has a tempting name ("svc_backup", "old_admin", "sa")
  - Is DISABLED (cannot be used for actual logon)
  - Has no legitimate users
  - Is monitored with MAXIMUM audit sensitivity
  - Triggers IMMEDIATE alert on ANY access attempt

Any logon attempt = 100% signal, 0% noise.
An attacker enumerating accounts WILL try this account.
```

## Setup Script

```powershell
#Requires -RunAsAdministrator
# Create a disabled honeypot account with tempting name
$honeyPassword = ConvertTo-SecureString "HoneyP0t-$(Get-Random)!" -AsPlainText -Force
New-LocalUser -Name "svc_backup" `
              -Password $honeyPassword `
              -Description "" `
              -AccountNeverExpires `
              -PasswordNeverExpires

# Disable immediately — no real user should ever log in
Disable-LocalUser -Name "svc_backup"

# Add to local Administrators (makes it more tempting to attackers)
# CAUTION: This is intentional for the trap — account is disabled and cannot log in
Add-LocalGroupMember -Group "Administrators" -Member "svc_backup"

# Set audit on this account: alert on ANY logon attempt
# Use Event 4625 filtering on target username "svc_backup"
Write-Host "Honeypot account 'svc_backup' created and disabled."
Write-Host "Monitor Event ID 4625 with TargetUserName = 'svc_backup' for attacker enumeration."
```

## Monitoring Script

```powershell
# Alert immediately on any access attempt to honeypot account
$honeyAccounts = @("svc_backup", "old_admin", "sa", "administrator2")

Get-WinEvent -FilterHashtable @{
    LogName='Security'
    Id=@(4625, 4624, 4648, 4768, 4771)
    StartTime=(Get-Date).AddHours(-1)
} | ForEach-Object {
    $targetUser = $_.Properties[5].Value
    if ($targetUser -in $honeyAccounts) {
        [PSCustomObject]@{
            Time      = $_.TimeCreated
            EventId   = $_.Id
            HoneyUser = $targetUser
            SourceIP  = $_.Properties[19].Value
            LogonType = $_.Properties[10].Value
        }
    }
} | Sort Time -Descending
```

## Honey File Strategy

```powershell
# Create honey files with appealing names on network shares
# Any access = immediate alert (use AUDIT-005 File SACL)
$honeyFiles = @(
    "C:\Shares\Finance\passwords.xlsx",
    "C:\Shares\IT\network-diagram.pdf",
    "C:\Shares\HR\salary-2026.xlsx"
)

$honeyFiles | ForEach-Object {
    # Create empty file
    New-Item -Path $_ -ItemType File -Force | Out-Null
    
    # Set SACL for access auditing
    $acl = Get-Acl $_
    $auditRule = New-Object System.Security.AccessControl.FileSystemAuditRule(
        "Everyone", "ReadData", "None", "None", "Success,Failure")
    $acl.AddAuditRule($auditRule)
    Set-Acl $_ $acl
    Write-Host "Honey file created: $_"
}
```

## Description

Deception-based detection using honeypot accounts and honey files provides near-zero false positive detection for active attackers. A disabled service account named "svc_backup" in the Administrators group is irresistible to an attacker enumerating credentials or lateral movement targets. Any Event 4625/4771 targeting this account is definitively malicious — no legitimate process ever needs this account. This technique works because attackers enumerate accounts from AD/SAM before attempting authentication.

## MITRE ATT&CK Coverage

T1087 (Account Discovery), T1110 (Brute Force), T1078 (Valid Accounts)

## Test Status

✔ Tested in AD lab — honeypot account triggers correctly
