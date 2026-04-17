# Windows Firewall (Advanced Security)

Complete enterprise hardening of Windows Defender Firewall with Advanced Security — from profile defaults and logging to lateral movement prevention, IPsec domain isolation, authenticated bypass, and GPO merge control.

> **Key insight**: The Windows Firewall is the last line of defense before a network packet reaches a vulnerable service. The difference between EternalBlue spreading across your network and being stopped at each host is entirely in these 13 policies.

---

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [FW-001](FW-001.md) | Enable All Profiles + Fail-Secure Defaults | Profile Enforcement | 🔴 Critical |
| [FW-002](FW-002.md) | Firewall Logging (All Profiles) | Logging | 🟠 High |
| [FW-003](FW-003.md) | Stealth Mode + Unicast Response Block | Stealth | 🟠 High |
| [FW-004](FW-004.md) | Block LLMNR & NetBIOS (Poisoning Defense) | Lateral Movement | 🔴 Critical |
| [FW-005](FW-005.md) | Block Inbound RDP from Internet | Remote Access | 🔴 Critical |
| [FW-006](FW-006.md) | Block Inbound SMB + Lateral Movement | SMB Restriction | 🔴 Critical |
| [FW-007](FW-007.md) | IPsec Connection Security (Domain Isolation) | IPsec | 🟠 High |
| [FW-008](FW-008.md) | Outbound Allowlist Baseline | Outbound Control | 🟠 High |
| [FW-009](FW-009.md) | Block DNS Tunneling + DoH Enforcement | DNS Security | 🟠 High |
| [FW-010](FW-010.md) | Restrict WinRM & Remote Management | Remote Management | 🔴 Critical |
| [FW-011](FW-011.md) | Authenticated Firewall Bypass (Admin Use) | Auth Bypass | 🟡 Medium |
| [FW-012](FW-012.md) | GPO Merge Policy (Disable Local Rule Merge) | GPO Enforcement | 🟠 High |
| [FW-013](FW-013.md) | Block Malware & Lateral Movement Ports | Malware Defense | 🔴 Critical |

---

## Attack → Policy Mapping

| Attack | Tools | Stopped By |
|---|---|---|
| LLMNR/NBT-NS poisoning | Responder | FW-004 |
| EternalBlue / WannaCry | MS17-010 exploit | FW-006 |
| RDP brute force / exploits | Hydra, BlueKeep | FW-005 |
| WinRM lateral movement | Invoke-Command, Evil-WinRM | FW-010, FW-013 |
| Metasploit Meterpreter | Port 4444 handler | FW-013 |
| DNS tunneling C2 | iodine, dnscat2 | FW-009 |
| Firewall rule bypass | netsh advfirewall | FW-012 |
| Network host discovery | nmap, masscan | FW-003 |
| Unauthenticated domain access | Rogue machines | FW-007 (IPsec) |
| SMB lateral movement (ransomware) | PsExec, BlackMatter | FW-006, FW-013 |

---

## Layered Defense Summary

```
Layer 1 — Perimeter (not covered here): Edge firewall/UTM
Layer 2 — Host firewall (this batch):
  FW-001: Enable all profiles, fail-secure
  FW-005/006: Block RDP/SMB from internet
  FW-004: Block LLMNR/NetBIOS poisoning
Layer 3 — Lateral movement prevention:
  FW-006: Restrict SMB to file servers only
  FW-010: Restrict WinRM to management subnet
  FW-013: Block known-bad ports
Layer 4 — Enforcement integrity:
  FW-012: GPO merge disabled (local rules cannot override GPO)
Layer 5 — Visibility:
  FW-002: Log all drops and connections → SIEM
```

---

## Related Policies

- [LSO-002](../local-security-options/LSO-002.md) — NTLM restriction (pairs with FW-004)
- [LSO-004](../local-security-options/LSO-004.md) — SMB signing (pairs with FW-006)
- [ACC-006](../account-policies/ACC-006.md) — Account lockout (pairs with FW-005 RDP)
- [WDA-006](../defender/WDA-006.md) — Network Protection (URL/IP blocking layer)
- [AUDIT-005](../audit/AUDIT-005.md) — Audit Filtering Platform (Event 5156/5157)
