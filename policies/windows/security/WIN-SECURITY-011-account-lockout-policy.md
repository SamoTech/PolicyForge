# WIN-SECURITY-011 — Account Lockout Policy

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-011 |
| **Category** | Account Security |
| **Risk Level** | 🟠 High |
| **OS** | Windows 10, 11, Server 2016+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L1 — 1.2.1, 1.2.2, 1.2.3 |
| **DISA STIG** | WN10-AC-000005, WN10-AC-000010 |

---

## Policy Path

```
Computer Configuration > Windows Settings > Security Settings
> Account Policies > Account Lockout Policy
```

## Recommended Values

| Setting | Recommended Value | CIS Minimum |
|---|---|---|
| Account lockout threshold | 5 invalid attempts | ≤ 5 |
| Account lockout duration | 15 minutes | ≥ 15 min |
| Reset account lockout counter after | 15 minutes | ≥ 15 min |

## Registry

```
HKLM\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters
```

> Account lockout is managed by SAM, not a simple registry key.
> Use secedit, Group Policy, or PowerShell.

## PowerShell

```powershell
# Configure lockout policy
net accounts /lockoutthreshold:5
net accounts /lockoutduration:15
net accounts /lockoutwindow:15

# Verify current settings
net accounts

# Fine-grained password policy (domain)
New-ADFineGrainedPasswordPolicy -Name "LockoutPolicy" `
  -LockoutThreshold 5 `
  -LockoutDuration "00:15:00" `
  -LockoutObservationWindow "00:15:00" `
  -Precedence 10
```

## Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/AccountPolicies/LockoutBadCount
Data Type: Integer
Value: 5

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/AccountPolicies/LockoutDuration
Data Type: Integer
Value: 15
```

## Description

Account lockout policies limit brute-force attacks against local and domain accounts by temporarily locking accounts after a defined number of failed authentication attempts.

## Impact

- ⚠️ Users who forget passwords may lock themselves out — plan helpdesk procedures
- ⚠️ Threshold too low (1–3) can enable denial-of-service by intentionally locking accounts
- ✅ 5 attempts balances security and usability
- ✅ 15-minute duration is self-healing — no admin intervention needed for most lockouts

## Use Cases

- All enterprise environments (universal baseline)
- Remote Desktop / VPN-exposed systems (critical)
- HIPAA, PCI-DSS, SOC 2 compliance
- Protecting service accounts from brute-force

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| Brute Force: Password Spraying | T1110.003 | Lockout policy directly mitigates spraying attacks |
| Brute Force: Password Guessing | T1110.001 | Limits per-account guessing attempts |

## References

- [CIS Windows 11 Benchmark — Account Lockout](https://www.cisecurity.org/cis-benchmarks)
- [Microsoft Lockout Policy Guide](https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/account-lockout-policy)
