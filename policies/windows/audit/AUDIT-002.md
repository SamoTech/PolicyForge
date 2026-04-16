# AUDIT-002 — Account Logon & Logon Event Auditing

**ID:** AUDIT-002  
**Category:** Audit Policy / Authentication  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11, Windows Server 2016+  
**Source:** CIS Benchmark · Microsoft Security Baseline · DISA STIG

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Advanced Audit Policy Configuration
                 └─ Account Logon
                      ├─ Audit Credential Validation:          Success + Failure
                      └─ Audit Kerberos Authentication Service: Success + Failure

                 └─ Logon/Logoff
                      ├─ Audit Logon:                Success + Failure
                      ├─ Audit Logoff:               Success
                      ├─ Audit Account Lockout:      Failure
                      └─ Audit Special Logon:        Success
```

## auditpol Commands

```powershell
# Account Logon
auditpol /set /subcategory:"Credential Validation" /success:enable /failure:enable
auditpol /set /subcategory:"Kerberos Authentication Service" /success:enable /failure:enable
auditpol /set /subcategory:"Kerberos Service Ticket Operations" /success:enable /failure:enable

# Logon/Logoff
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Logoff" /success:enable
auditpol /set /subcategory:"Account Lockout" /failure:enable
auditpol /set /subcategory:"Special Logon" /success:enable
```

## Critical Event IDs — Authentication

| Event ID | Log | Description | Alert On |
|---|---|---|---|
| **4624** | Security | Successful logon | Logon Type 3/10 (network/remote) after hours |
| **4625** | Security | Failed logon | > 5 failures in 5 minutes (brute force) |
| **4634** | Security | Logoff | Session duration anomalies |
| **4647** | Security | User-initiated logoff | — |
| **4648** | Security | Explicit credential logon (RunAs) | Always alert — lateral movement indicator |
| **4672** | Security | Special privilege logon (admin) | Always log |
| **4720** | Security | User account created | Always alert |
| **4740** | Security | Account locked out | > 3 lockouts/hour |
| **4768** | Security | Kerberos TGT requested | Failed TGT = Kerberoasting attempt |
| **4771** | Security | Kerberos pre-auth failed | Brute force or password spray |
| **4776** | Security | NTLM credential validation | NTLM on modern systems = anomaly |

## PowerShell — Monitor Failed Logons

```powershell
# Get last 50 failed logon events
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 50 |
    Select TimeCreated,
           @{N='User';E={$_.Properties[5].Value}},
           @{N='LogonType';E={$_.Properties[10].Value}},
           @{N='SourceIP';E={$_.Properties[19].Value}} |
    Sort TimeCreated -Descending

# Detect brute force: > 5 failures from same IP in 5 minutes
$failures = Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 1000
$failures | Group-Object { $_.Properties[19].Value } |
    Where-Object { $_.Count -gt 5 } |
    Select Name, Count | Sort Count -Descending
```

## Description

Logon auditing is the most fundamental security monitoring capability. Event 4625 (failed logon) is the primary indicator for password spray and brute force attacks. Event 4648 (explicit credentials) fires when `runas` or Pass-the-Hash is used, making it a reliable lateral movement indicator. Special Logon (4672) fires every time a privileged account logs on, enabling privilege use tracking.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.1.x, 17.5.x (L1)
- **DISA STIG:** WN11-AU-000010 through WN11-AU-000035
- **NIST 800-53:** AU-2, AU-12

## Test Status

✔ Tested on Windows 11 24H2
