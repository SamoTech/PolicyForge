# Local Security Options

Complete hardening of Windows Local Security Options — UAC, NTLM, LAN Manager hash, SMB signing, credential caching, anonymous access, secure channel, LDAP signing, and miscellaneous critical options.

> **Key insight**: Local Security Options are the most diverse and most audited GPO section. Each setting addresses a specific attack class. These policies are the difference between a machine that's exploitable in minutes and one that stops common attack chains cold.

---

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [LSO-001](LSO-001.md) | UAC: Admin Approval Mode + Secure Desktop | UAC | 🔴 Critical |
| [LSO-002](LSO-002.md) | NTLM Authentication Level (NTLMv2 only) | NTLM | 🔴 Critical |
| [LSO-003](LSO-003.md) | Disable LAN Manager Hash Storage | Credential Storage | 🔴 Critical |
| [LSO-004](LSO-004.md) | SMB Signing (Client + Server) | SMB | 🔴 Critical |
| [LSO-005](LSO-005.md) | Limit Cached Logon Credentials (4) | Credential Caching | 🔴 Critical |
| [LSO-006](LSO-006.md) | Logon Warnings, Last Username, CTRL+ALT+DEL | Interactive Logon | 🟡 Medium |
| [LSO-007](LSO-007.md) | Disable Anonymous Enumeration | Anonymous Access | 🔴 Critical |
| [LSO-008](LSO-008.md) | Secure Channel + Domain Member Security | Domain Security | 🔴 Critical |
| [LSO-009](LSO-009.md) | CD/Floppy Access + Printer Driver Install | Device Access | 🟡 Medium |
| [LSO-010](LSO-010.md) | Clear Pagefile at Shutdown | Memory Security | 🟡 Medium |
| [LSO-011](LSO-011.md) | Strengthen System Object Permissions | Object Security | 🟠 High |
| [LSO-012](LSO-012.md) | LDAP Client Signing | LDAP Security | 🔴 Critical |
| [LSO-013](LSO-013.md) | Force Audit Subcategory Settings | Audit Integrity | 🟠 High |
| [LSO-014](LSO-014.md) | Miscellaneous Critical Options | Misc | 🟠 High |

---

## Attack → Policy Mapping

| Attack | Tools | Policies That Stop It |
|---|---|---|
| UAC bypass | CMSTPLUA, fodhelper, EventViewer | LSO-001 |
| NTLM relay | ntlmrelayx, Responder | LSO-002, LSO-004, LSO-012 |
| LM hash cracking | Hashcat mode 3000 | LSO-003 |
| SMB relay / MitM | ntlmrelayx, PetitPotam | LSO-004 |
| Cached credential dump | secretsdump, cachedump | LSO-005 |
| Fake logon screen | Custom malware | LSO-006 (CTRL+ALT+DEL) |
| Anonymous user enum | enum4linux, rpcclient | LSO-007 |
| Zerologon / Netlogon MitM | CVE-2020-1472 tools | LSO-008 |
| PrintNightmare | CVE-2021-34527 PoC | LSO-009 |
| Pagefile forensics | Volatility, strings | LSO-010 |
| LDAP relay / DCSync | ntlmrelayx LDAP | LSO-012 |

---

## Critical Registry Baseline

```powershell
# PolicyForge LSO Baseline — Apply as Administrator

$lsa = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"

# NTLM: NTLMv2 only
Set-ItemProperty $lsa -Name "LmCompatibilityLevel"      -Value 5
Set-ItemProperty $lsa -Name "NoLMHash"                  -Value 1
Set-ItemProperty $lsa -Name "RestrictAnonymous"         -Value 1
Set-ItemProperty $lsa -Name "RestrictAnonymousSAM"      -Value 1
Set-ItemProperty $lsa -Name "EveryoneIncludesAnonymous" -Value 0
Set-ItemProperty $lsa -Name "SCENoApplyLegacyAuditPolicy" -Value 1

# UAC
$uac = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"
Set-ItemProperty $uac -Name "EnableLUA"                   -Value 1
Set-ItemProperty $uac -Name "FilterAdministratorToken"    -Value 1
Set-ItemProperty $uac -Name "ConsentPromptBehaviorAdmin"  -Value 1
Set-ItemProperty $uac -Name "ConsentPromptBehaviorUser"   -Value 0
Set-ItemProperty $uac -Name "PromptOnSecureDesktop"       -Value 1
Set-ItemProperty $uac -Name "DontDisplayLastUserName"     -Value 1
Set-ItemProperty $uac -Name "DisableCAD"                  -Value 0
Set-ItemProperty $uac -Name "ShutdownWithoutLogon"        -Value 0

# SMB Signing
Set-SmbServerConfiguration -RequireSecuritySignature $true -EnableSecuritySignature $true -Force
Set-SmbClientConfiguration -RequireSecuritySignature $true -EnableSecuritySignature $true -Force

# Cached credentials
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" `
    -Name "CachedLogonsCount" -Value "4"

# Clear pagefile
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" `
    -Name "ClearPageFileAtShutdown" -Value 1

Write-Host "[DONE] LSO Baseline applied. Reboot required for some settings." -ForegroundColor Green
```

---

## Related Policies

- [ACC-009](../account-policies/ACC-009.md) — LAPS (pairs with LSO-005 credential caching)
- [URA-004](../user-rights/URA-004.md) — Deny network logon for local accounts
- [AUDIT-001–014](../audit/) — Advanced audit policies (pairs with LSO-013)
- [WDA-006](../defender/WDA-006.md) — Network Protection (complements NTLM restrictions)
- [FW-001](../firewall/FW-001.md) — Firewall (blocks LLMNR/NBT-NS poisoning vectors)
