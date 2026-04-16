# CRED-002 — Disable WDigest Authentication (Plaintext Credentials in Memory)

**ID:** CRED-002  
**Category:** Credential Hardening / LSASS Protection  
**Risk Level:** 🔴 Critical  
**OS:** Windows XP+, Windows 11, Windows Server 2003+  
**Source:** Microsoft Security Advisory 2871997 · Windows 11 Security Baseline 2026

---

## Policy Path

```
No native ADMX path — configured via registry or Security Baseline GPO.
Computer Configuration
  └─ Preferences
       └─ Windows Settings
            └─ Registry
                 └─ HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest
```

## Registry

```
Key:   HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest
Value: UseLogonCredential
Type:  DWORD
Data:  0  (0=disabled, 1=enabled/vulnerable)
```

## PowerShell

```powershell
# Disable WDigest (prevent plaintext passwords in LSASS memory)
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"
Set-ItemProperty -Path $path -Name "UseLogonCredential" -Value 0 -Type DWord

# Verify
Get-ItemProperty -Path $path -Name UseLogonCredential
# Expected: UseLogonCredential = 0

# Check if mimikatz could extract plaintext (test)
# If WDigest is disabled, sekurlsa::wdigest returns empty
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/CredentialsDelegation/DisableWDigest
Type:    Integer
Value:   1

# Or via Custom OMA-URI (registry-based):
OMA-URI: ./Device/Vendor/MSFT/Registry/HKLM/SYSTEM/CurrentControlSet/Control/SecurityProviders/WDigest/UseLogonCredential
Type:    Integer
Value:   0
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest]
"UseLogonCredential"=dword:00000000
```

## Description

WDigest is a legacy HTTP authentication protocol that caches plaintext (reversible) user passwords in LSASS memory. Tools like **Mimikatz** (`sekurlsa::wdigest`) trivially extract these credentials from memory. WDigest is disabled by default since Windows 8.1 / Server 2012 R2, but can be re-enabled by attackers or misconfigured GPOs. This policy explicitly sets the disable flag to prevent re-enablement.

## Impact

- ✅ Eliminates plaintext credential extraction from LSASS memory
- ✅ Breaks Mimikatz `sekurlsa::wdigest` credential dumping
- ✅ Zero functional impact on modern authentication flows
- ⚠️ Some legacy IIS/HTTP digest authentication scenarios may break
- ℹ️ Already default-off on Windows 8.1+; this policy prevents re-enablement

## Use Cases

- All Windows environments (zero-risk hardening on modern OS)
- Post-incident credential hygiene
- Environments with active threat hunting for credential dumping
- Defense against Mimikatz and credential harvesting tools

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| OS Credential Dumping: LSASS Memory | T1003.001 | Credential Access |
| OS Credential Dumping | T1003 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.3.7 (L1)
- **DISA STIG:** WN11-CC-000025
- **NIST SP 800-171:** 3.5.10 — Store and transmit only cryptographically-protected passwords
- **Microsoft Advisory:** KB2871997 (original WDigest disable guidance)

## Test Status

✔ Tested on Windows 11 24H2 (Build 26100)
✔ Tested on Windows 10 22H2
✔ Verified with Mimikatz 2.2.0 — wdigest returns empty with UseLogonCredential=0
