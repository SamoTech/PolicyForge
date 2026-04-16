# WIN-SECURITY-010 — Disable Guest Account

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-010 |
| **Category** | Account Security |
| **Risk Level** | 🟠 High |
| **OS** | Windows 10, 11, Server 2016+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L1 — 2.3.1.2 |
| **DISA STIG** | WN10-SO-000005 |

---

## Policy Path

```
Computer Configuration > Windows Settings > Security Settings
> Local Policies > Security Options
> Accounts: Guest account status
```

## Registry

```
HKLM\SAM\SAM\Domains\Account\Users\000001F5
```

> Note: The Guest account (RID 501) cannot be disabled via a simple registry value.
> Use the Security Policy setting or PowerShell method below.

## PowerShell

```powershell
# Disable Guest account
Disable-LocalUser -Name "Guest"

# Rename Guest account (additional hardening)
Rename-LocalUser -Name "Guest" -NewName "_disabled_guest"

# Verify
Get-LocalUser -Name "Guest" | Select-Object Name, Enabled
```

## Group Policy (secedit)

```ini
; Security template — apply via secedit
[System Access]
EnableGuestAccount = 0
```

```powershell
# Apply via secedit
secedit /configure /db secedit.sdb /cfg guest-disable.inf /quiet
```

## Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/Accounts_EnableGuestAccountStatus
Data Type: Integer
Value: 0
```

## Description

The built-in Guest account provides unauthenticated access to the system with minimal privileges. While limited, it represents an unnecessary attack surface — especially in environments where physical access is possible or SMB null sessions are enabled.

## Impact

- ✅ No operational impact in domain environments
- ✅ No impact on named user accounts
- ⚠️ May affect legacy applications that use Guest for anonymous access (rare)
- ⚠️ Some network shares configured for Guest access will require reconfiguration

## Use Cases

- All enterprise endpoints (universal baseline)
- CIS Level 1 compliance
- PCI-DSS, HIPAA, ISO 27001 environments
- Pre-domain-join hardening scripts

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| Valid Accounts: Local Accounts | T1078.003 | Attackers use built-in accounts to avoid detection |
| Exploit Public-Facing Application | T1190 | Guest used for initial access in some scenarios |

## Equivalent REG File

```reg
; Guest account disable is not registry-configurable — use PowerShell or secedit
```

## References

- [CIS Benchmark for Windows 11](https://www.cisecurity.org/cis-benchmarks)
- [Microsoft Security Baseline](https://learn.microsoft.com/en-us/windows/security/)
