# CRED-001 — Enable Microsoft LAPS (Local Administrator Password Solution)

**ID:** CRED-001  
**Category:** Credential Hardening / Local Accounts  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10 20H2+, Windows 11, Windows Server 2019+ (built-in LAPS requires 2019+)  
**Source:** Microsoft LAPS documentation · [learn.microsoft.com](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview)

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ System
            └─ LAPS
                 ├─ Configure password backup directory → Active Directory (or Azure AD)
                 ├─ Password Settings → Enabled
                 └─ Name of administrator account to manage → (custom or built-in)
```

## Registry

```
Key:   HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\LAPS
Value: BackupDirectory
Type:  DWORD
Data:  1  (1=Active Directory, 2=Azure AD / Entra ID)

Value: PasswordAgeDays
Type:  DWORD
Data:  30

Value: PasswordLength
Type:  DWORD
Data:  20

Value: PasswordComplexity
Type:  DWORD
Data:  4  (4=Large/small/digits/special)
```

## PowerShell

```powershell
# Verify LAPS is active on local machine
Get-LapsAADPassword -DeviceIds $env:COMPUTERNAME -ErrorAction SilentlyContinue
Get-LapsDiagnostics

# Check LAPS policy application
Get-LapsADPassword -Identity $env:COMPUTERNAME -AsPlainText

# Force immediate password rotation
Invoke-LapsPolicyProcessing

# View current LAPS settings
Get-LapsADPasswordExpirationTime -Identity $env:COMPUTERNAME
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/LAPS/Policies/BackupDirectory
Type:    Integer
Value:   1  (1=Azure AD, 2=Active Directory)

OMA-URI: ./Device/Vendor/MSFT/LAPS/Policies/PasswordAgeDays
Type:    Integer
Value:   30

OMA-URI: ./Device/Vendor/MSFT/LAPS/Policies/PasswordLength
Type:    Integer
Value:   20
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\LAPS]
"BackupDirectory"=dword:00000001
"PasswordAgeDays"=dword:0000001e
"PasswordLength"=dword:00000014
"PasswordComplexity"=dword:00000004
```

## Description

Microsoft LAPS automatically manages and rotates the local Administrator account password on each machine, storing it securely in Active Directory or Entra ID. Without LAPS, a single compromised local admin password can be used for lateral movement across every machine sharing that password — the most common ransomware propagation vector. Windows 11 22H2+ includes LAPS natively (no separate MSI required).

## Impact

- ✅ Eliminates password reuse across local admin accounts
- ✅ Automatic rotation prevents stale credential exploitation
- ✅ Audit log of every password retrieval in AD/Entra
- ⚠️ Requires AD schema extension for legacy LAPS
- ⚠️ Requires LAPS CSE (Client Side Extension) on Windows 10 < 22H2
- ℹ️ Windows LAPS (built-in) requires Windows 11 22H2+ or Server 2019+

## Use Cases

- All enterprise environments with local admin accounts
- Ransomware lateral movement prevention
- Post-breach credential hygiene
- Environments replacing shared local admin passwords
- MSP/IT managed environments

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Valid Accounts: Local Accounts | T1078.003 | Initial Access / Lateral Movement |
| Pass the Hash | T1550.002 | Lateral Movement |
| Use Alternate Authentication Material | T1550 | Lateral Movement |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.3.2 (L1)
- **DISA STIG:** WN11-MS-000070
- **NIST SP 800-171:** 3.5.2 — Authenticate users, processes, and devices
- **Microsoft Security Baseline:** Recommended for all Windows deployments
- **ACSC Essential Eight:** Restrict admin privileges

## Test Status

✔ Tested on Windows 11 24H2 (Build 26100) — Windows LAPS native
✔ Tested on Windows 10 22H2 — Windows LAPS native
✔ Tested on Windows Server 2022 — AD-backed LAPS
