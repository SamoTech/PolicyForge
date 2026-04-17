# Account Policies

Complete enterprise hardening of Windows Account Policies — password controls, lockout defenses, Kerberos encryption, LAPS deployment, fine-grained policies, and privileged account management.

> **Key insight**: Account policy misconfiguration is the #1 enabler of credential-based attacks. Weak passwords + no lockout + shared local admin = complete lateral movement across any fleet.

---

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [ACC-001](ACC-001.md) | Password History (24) | Password Policy | 🟠 High |
| [ACC-002](ACC-002.md) | Maximum Password Age | Password Policy | 🟠 High |
| [ACC-003](ACC-003.md) | Minimum Password Age (1 day) | Password Policy | 🟡 Medium |
| [ACC-004](ACC-004.md) | Minimum Password Length (14+) | Password Policy | 🔴 Critical |
| [ACC-005](ACC-005.md) | Complexity + No Reversible Encryption | Password Policy | 🟠 High |
| [ACC-006](ACC-006.md) | Account Lockout Threshold (5) | Lockout Policy | 🔴 Critical |
| [ACC-007](ACC-007.md) | Lockout Duration & Reset Counter (15 min) | Lockout Policy | 🟠 High |
| [ACC-008](ACC-008.md) | Kerberos Policy Hardening | Kerberos Policy | 🔴 Critical |
| [ACC-009](ACC-009.md) | Windows LAPS Deployment & Hardening | Local Admin | 🔴 Critical |
| [ACC-010](ACC-010.md) | Fine-Grained Password Policies (PSOs) | FGPP | 🟠 High |
| [ACC-011](ACC-011.md) | Privileged Account Hardening | Admin Accounts | 🔴 Critical |
| [ACC-012](ACC-012.md) | Disable RC4 / Enforce AES Kerberos | Kerberos Crypto | 🔴 Critical |
| [ACC-013](ACC-013.md) | Account Policy Event Monitoring | Monitoring | 🟠 High |

---

## Attack → Policy Mapping

| Attack | Technique | Policies That Stop It |
|---|---|---|
| Password brute force | T1110 | ACC-006, ACC-007 |
| Password spray | T1110.003 | ACC-006, ACC-007, ACC-013 |
| Pass-the-Hash lateral movement | T1550.002 | ACC-009 (LAPS) |
| Kerberoasting | T1558.003 | ACC-008, ACC-012 |
| Credential stuffing (reuse) | T1078 | ACC-001, ACC-004 |
| Default account abuse | T1078.001 | ACC-011 |
| RC4 downgrade attack | T1600.001 | ACC-012 |
| Shadow admin persistence | T1098 | ACC-011, ACC-013 |

---

## Password Policy Baseline (secedit)

```ini
[Unicode]
Unicode=yes
[System Access]
PasswordHistorySize   = 24
MaximumPasswordAge    = 365
MinimumPasswordAge    = 1
MinimumPasswordLength = 14
PasswordComplexity    = 1
ClearTextPassword     = 0
LockoutBadCount       = 5
LockoutDuration       = 15
ResetLockoutCount     = 15
EnableAdminAccount    = 0
EnableGuestAccount    = 0

[Kerberos Policy]
MaxTicketAge       = 10
MaxServiceAge      = 600
MaxRenewAge        = 7
MaxClockSkew       = 5
TicketValidateClient = 1
```

```powershell
# Apply account policy baseline
Secedit /configure /db C:\Windows\security\database\PolicyForge-ACC.sdb `
    /cfg C:\PolicyForge\PolicyForge-ACC-Baseline.inf /quiet

# Verify
net accounts
Get-ADDefaultDomainPasswordPolicy
```

---

## LAPS Quick Deploy Checklist

```
✅ Step 1: Update AD schema    → Update-LapsADSchema
✅ Step 2: Grant permissions   → Set-LapsADComputerSelfPermission
✅ Step 3: Deploy GPO/Intune   → Password length=15, complexity=4, age=30
✅ Step 4: Enable post-auth    → PostAuthenticationActions = 3
✅ Step 5: Enable encryption   → ADPasswordEncryptionEnabled = 1
✅ Step 6: Verify              → Get-LapsADPassword -Identity "PC01"
✅ Step 7: Test rotation       → Reset-LapsPassword; verify new password
✅ Step 8: Pair with URA-004   → Deny local account network logon
```

---

## Related Policies

- [URA-004](../user-rights/URA-004.md) — Deny network logon for local accounts (pairs with LAPS)
- [URA-005](../user-rights/URA-005.md) — Restrict interactive logon for service accounts
- [AUDIT-009](../audit/AUDIT-009.md) — Audit account management events
- [WDA-008](../defender/WDA-008.md) — ASR rules: LSASS protection
