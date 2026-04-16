# WIN-SECURITY-012 — Enable LSA Protection (PPL)

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-012 |
| **Category** | Credential Protection |
| **Risk Level** | 🔴 Critical |
| **OS** | Windows 8.1+, Server 2012 R2+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L1 — 18.3.1 |
| **DISA STIG** | WN10-SO-000155 |

---

## Policy Path

```
Computer Configuration > Administrative Templates > MS Security Guide
> WDigest Authentication (disabling protects against credential harvesting)
```

## Registry

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa]
"RunAsPPL"=dword:00000002
```

> Value 2 = PPL (Protected Process Light) on Windows 11 22H2+
> Value 1 = PPL on older systems

## PowerShell

```powershell
# Enable LSA PPL
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' `
  -Name 'RunAsPPL' -Value 2 -Type DWord

# Add UEFI variable for Secure Boot enforcement (optional, strongest protection)
# Requires admin + reboot
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' `
  -Name 'RunAsPPLBoot' -Value 2 -Type DWord

# Verify
Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' | Select-Object RunAsPPL
```

## Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/MSSecurityGuide/EnableStructuredExceptionHandlingOverwriteProtection
Data Type: Integer
Value: 1

# LSA PPL via Custom OMA-URI:
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/RestrictingPublicSA
Data Type: Integer
Value: 2
```

## Description

LSA Protection runs the LSASS process as a Protected Process Light (PPL), preventing non-PPL processes (including administrator-level processes) from reading LSASS memory. This directly blocks Mimikatz-style credential dumping.

## Impact

- ✅ Blocks Mimikatz `sekurlsa::logonpasswords` (most common attack)
- ✅ Prevents LSASS memory dump via Task Manager, ProcDump
- ⚠️ May break **unsigned third-party security software** that hooks LSASS
- ⚠️ Some legacy smart card middleware may be incompatible — test before deployment
- 🔁 Requires **reboot** to take effect

## Use Cases

- All enterprise endpoints — highest priority credential protection
- Domain controllers (combine with Protected Users security group)
- Privileged Access Workstations (PAWs)
- Post-incident hardening after credential theft

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| OS Credential Dumping: LSASS Memory | T1003.001 | Direct mitigation — PPL blocks LSASS reads |
| Credential Access | T1555 | Reduces credential availability to attackers |

## References

- [Microsoft: Configuring Additional LSA Protection](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/configuring-additional-lsa-protection)
- [Mimikatz vs LSA PPL](https://blog.gentilkiwi.com/mimikatz)
