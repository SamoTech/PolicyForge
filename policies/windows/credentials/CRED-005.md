# CRED-005 — Block NTLMv1 Authentication

**ID:** CRED-005  
**Category:** Credential Hardening / Authentication Protocols  
**Risk Level:** 🔴 Critical  
**OS:** Windows XP+, Windows 11, Windows Server 2003+  
**Source:** Microsoft Security Baseline Windows 11 · CIS Benchmark Windows 11 v3.0

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Local Policies
                 └─ Security Options
                      └─ Network security: LAN Manager authentication level
                           └─ Send NTLMv2 response only. Refuse LM & NTLM
```

## Registry

```
Key:   HKLM\SYSTEM\CurrentControlSet\Control\Lsa
Value: LmCompatibilityLevel
Type:  DWORD
Data:  5  (5=Send NTLMv2 only, refuse LM & NTLM)
```

## PowerShell

```powershell
# Set LAN Manager authentication level to NTLMv2 only
$lsaPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $lsaPath -Name "LmCompatibilityLevel" -Value 5 -Type DWord

# Verify
Get-ItemProperty -Path $lsaPath -Name LmCompatibilityLevel
# 5 = Send NTLMv2 response only. Refuse LM & NTLM
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkSecurity_LANManagerAuthenticationLevel
Type:    Integer
Value:   5
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa]
"LmCompatibilityLevel"=dword:00000005
```

## Description

NTLMv1 and LM (LAN Manager) hashes are cryptographically weak and can be cracked in seconds with modern hardware. Level 5 forces the OS to only send NTLMv2 responses and refuse incoming NTLMv1/LM authentication requests. This removes the ability to downgrade authentication to a weaker protocol and eliminates a large class of credential relay and cracking attacks.

## Impact

- ✅ Eliminates LM hash exposure (DES-based, trivially crackable)
- ✅ Eliminates NTLMv1 relay attacks
- ✅ Forces NTLMv2 minimum for all NTLM-based authentication
- ⚠️ Breaks authentication to Windows 9x / pre-NT 4 SP4 systems (irrelevant in 2025+)
- ⚠️ Some older NAS/print devices may require firmware update for NTLMv2

## Use Cases

- All enterprise environments (no legacy Windows 9x clients)
- Post-Active Directory security audit remediation
- Meeting CIS Level 1 baseline requirements

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| OS Credential Dumping | T1003 | Credential Access |
| Adversary-in-the-Middle | T1557 | Credential Access |
| Brute Force: Password Cracking | T1110.002 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 2.3.11.7 (L1)
- **DISA STIG:** WN11-SO-000200
- **NIST SP 800-171:** 3.5.10
- **PCI-DSS:** Requirement 6.3.3

## Test Status

✔ Tested on Windows 11 24H2
✔ Tested on Windows 10 22H2
✔ Tested on Windows Server 2022 DC
