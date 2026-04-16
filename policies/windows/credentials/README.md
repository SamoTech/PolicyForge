# Credential Hardening Policies

This directory contains Group Policy and configuration controls targeting **credential theft, dumping, and authentication downgrade** attacks — the most common lateral movement vectors in Windows environments.

## Policy Index

| ID | Policy | Risk | Kills |
|---|---|---|---|
| [CRED-001](CRED-001.md) | Enable Microsoft LAPS | 🔴 Critical | Password reuse / lateral movement |
| [CRED-002](CRED-002.md) | Disable WDigest (plaintext memory) | 🔴 Critical | Mimikatz wdigest |
| [CRED-003](CRED-003.md) | Enable LSA Protection (PPL) | 🔴 Critical | Mimikatz, ProcDump |
| [CRED-004](CRED-004.md) | Enable Credential Guard (VBS) | 🔴 Critical | Pass-the-Hash, Pass-the-Ticket |
| [CRED-005](CRED-005.md) | Block NTLMv1 / LM Authentication | 🔴 Critical | LM/NTLM relay + cracking |
| [CRED-006](CRED-006.md) | Restrict Outbound NTLM | 🔴 Critical | Responder, PetitPotam, PrinterBug |
| [CRED-007](CRED-007.md) | Protected Users Security Group | 🟠 Medium | PtH, PtT, Kerberoasting |
| [CRED-008](CRED-008.md) | Disable Credential Caching (DCC2) | 🟠 Medium | Offline hash cracking |
| [CRED-009](CRED-009.md) | Enforce Kerberos AES (disable RC4/DES) | 🔴 Critical | Kerberoasting |

## Layered Defense Stack

Deploy in this order for maximum effect with minimum disruption:

```
Layer 1 — Quick Wins (zero risk, deploy immediately)
  ├─ CRED-002  Disable WDigest
  ├─ CRED-005  Block NTLMv1
  └─ CRED-001  Enable LAPS

Layer 2 — High Impact (low risk, test in pilot)
  ├─ CRED-003  LSA PPL
  ├─ CRED-004  Credential Guard
  └─ CRED-009  Kerberos AES-only

Layer 3 — Requires Audit Phase First
  ├─ CRED-006  Block outbound NTLM (audit→enforce)
  ├─ CRED-007  Protected Users group (audit accounts first)
  └─ CRED-008  Disable credential caching (laptop impact)
```

## Related Policies

- [SMB-003](../smb/SMB-003.md) — SMB Signing (prevents NTLM relay over SMB)
- [NET-003](../network/NET-003.md) — Disable LLMNR (eliminates hash capture trigger)
- [NET-002](../network/NET-002.md) — Disable NetBIOS (eliminates NBT-NS poisoning)
