# User Rights Assignment (URA) Policies

Complete enterprise hardening of Windows User Rights Assignment — the most dangerous and most overlooked attack surface in Windows privilege escalation.

> **Why URA matters**: Most EDR and AV solutions focus on process behavior and file signatures. User Rights Assignment abuse is **privilege escalation without malware** — attackers use built-in Windows mechanisms to elevate. These policies close the door at the OS level.

---

## Policy Index

| ID | Policy | Privilege | Risk |
|---|---|---|---|
| [URA-001](URA-001.md) | Deny SeDebugPrivilege to Non-Admins | SeDebugPrivilege | 🔴 Critical |
| [URA-002](URA-002.md) | Restrict Act as Part of OS | SeTcbPrivilege | 🔴 Critical |
| [URA-003](URA-003.md) | Restrict Create Token Object | SeCreateTokenPrivilege | 🔴 Critical |
| [URA-004](URA-004.md) | Restrict Network Logon Rights | SeNetworkLogonRight | 🔴 Critical |
| [URA-005](URA-005.md) | Restrict Local Logon Rights | SeInteractiveLogonRight | 🟠 High |
| [URA-006](URA-006.md) | Restrict RDP Logon Rights | SeRemoteInteractiveLogonRight | 🔴 Critical |
| [URA-007](URA-007.md) | Restrict Backup/Restore Privileges | SeBackupPrivilege / SeRestorePrivilege | 🟠 High |
| [URA-008](URA-008.md) | Restrict Take Ownership | SeTakeOwnershipPrivilege | 🟠 High |
| [URA-009](URA-009.md) | Restrict Load/Unload Device Drivers | SeLoadDriverPrivilege | 🔴 Critical |
| [URA-010](URA-010.md) | Deny Batch/Service Logon for Guests | SeDenyBatchLogonRight | 🟠 High |
| [URA-011](URA-011.md) | Restrict Anonymous SID/Name Access | Anonymous Access | 🟠 High |
| [URA-012](URA-012.md) | Restrict Manage Security Log | SeSecurityPrivilege | 🟠 High |
| [URA-013](URA-013.md) | Restrict Impersonation Privilege | SeImpersonatePrivilege | 🔴 Critical |

---

## Privilege → Attack Tool Matrix

| Privilege | Abused By | Technique |
|---|---|---|
| SeDebugPrivilege | Mimikatz, ProcDump, WinPmem | LSASS dump, token theft |
| SeTcbPrivilege | Custom token factories | OS-level impersonation |
| SeCreateTokenPrivilege | Token forgers | Arbitrary token creation |
| SeBackupPrivilege | secretsdump, reg.exe | SAM/SYSTEM hive extraction |
| SeLoadDriverPrivilege | BYOVD attacks, rootkits | Kernel-level EDR bypass |
| SeImpersonatePrivilege | JuicyPotato, PrintSpoofer | Low service → SYSTEM |
| SeTakeOwnershipPrivilege | Custom scripts | ACL bypass, file overwrite |
| SeSecurityPrivilege | wevtutil, custom tools | Evidence destruction |

---

## Complete URA Baseline (secedit Template)

Save as `PolicyForge-URA-Baseline.inf` and apply via `secedit /configure`:

```ini
[Unicode]
Unicode=yes
[Version]
signature="$CHICAGO$"
Revision=1
[Privilege Rights]
; === CRITICAL: Empty = no accounts ===
SeTcbPrivilege            =
SeCreateTokenPrivilege    =

; === Admins only ===
SeDebugPrivilege          = *S-1-5-32-544
SeBackupPrivilege         = *S-1-5-32-544
SeRestorePrivilege        = *S-1-5-32-544
SeLoadDriverPrivilege     = *S-1-5-32-544
SeTakeOwnershipPrivilege  = *S-1-5-32-544
SeSecurityPrivilege       = *S-1-5-32-544

; === Logon Rights ===
SeNetworkLogonRight            = *S-1-5-32-544,*S-1-5-32-555
SeInteractiveLogonRight        = *S-1-5-32-544,*S-1-5-32-545
SeRemoteInteractiveLogonRight  = *S-1-5-32-544,*S-1-5-32-555

; === Deny Policies ===
SeDenyNetworkLogonRight          = *S-1-5-32-546,*S-1-5-113,*S-1-5-114
SeDenyInteractiveLogonRight      = *S-1-5-32-546
SeDenyRemoteInteractiveLogonRight = *S-1-5-32-546,*S-1-5-113
SeDenyBatchLogonRight            = *S-1-5-32-546
SeDenyServiceLogonRight          = *S-1-5-32-546

; === Service Impersonation ===
SeImpersonatePrivilege = *S-1-5-32-544,*S-1-5-19,*S-1-5-20,*S-1-5-6
```

```powershell
# Apply the baseline
Secedit /configure /db C:\Windows\security\database\PolicyForge-URA.sdb `
    /cfg C:\PolicyForge\PolicyForge-URA-Baseline.inf /quiet

# Verify
Secedit /export /cfg C:\PolicyForge\URA-verify.inf /quiet
Select-String "SeDebugPrivilege|SeTcbPrivilege|SeImpersonatePrivilege|SeDenyNetworkLogonRight" `
    C:\PolicyForge\URA-verify.inf
```

---

## MITRE ATT&CK Coverage

| Technique | ID | Policies |
|---|---|---|
| LSASS Memory Dump | T1003.001 | URA-001 |
| Token Impersonation | T1134 | URA-001, URA-002, URA-003, URA-013 |
| Pass the Hash | T1550.002 | URA-004, URA-006 |
| RDP Lateral Movement | T1021.001 | URA-006 |
| SAM Database Dump | T1003.002 | URA-007 |
| BYOVD / Rootkit | T1014 | URA-009 |
| Privilege Escalation (Potato) | T1068 | URA-013 |
| Log Tampering | T1070.001 | URA-012 |
| Anonymous Enumeration | T1087.001 | URA-011 |

---

## Related Policies

- [AUDIT-001–014](../audit/) — Audit Policy (log all privilege use)
- [CRED-003](../credentials/CRED-003.md) — Credential Guard (protect LSASS)
- [WDAC-001](../wdac/WDAC-001.md) — Block malicious driver loading
- [FW-008](../firewall/FW-008.md) — Block lateral movement ports
