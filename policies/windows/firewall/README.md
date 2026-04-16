# Windows Firewall & Network Hardening Policies

Complete Windows Firewall deployment guide covering all three profiles (Domain/Private/Public), lateral movement prevention, outbound C2 blocking, IPSec isolation, and enterprise GPO deployment.

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [FW-001](FW-001.md) | Enable Firewall — All Profiles | Baseline | 🔴 Critical |
| [FW-002](FW-002.md) | Enable Logging (Drop + Allow) | Visibility | 🟠 Medium |
| [FW-003](FW-003.md) | Block Inbound SMB (Port 445) | Lateral Movement | 🔴 Critical |
| [FW-004](FW-004.md) | Block Inbound RDP (Port 3389) | Remote Access | 🔴 Critical |
| [FW-005](FW-005.md) | Stealth Mode — Prevent Host Discovery | Recon Prevention | 🟠 Medium |
| [FW-006](FW-006.md) | Block WinRM (5985/5986) on Workstations | Lateral Movement | 🔴 Critical |
| [FW-007](FW-007.md) | Restrict RPC/DCOM (Port 135) | Lateral Movement | 🔴 Critical |
| [FW-008](FW-008.md) | Block Outbound Malicious Ports | C2 Prevention | 🔴 Critical |
| [FW-009](FW-009.md) | Block Lateral Movement (W2W) | Zero Trust | 🔴 Critical |
| [FW-010](FW-010.md) | IPSec Connection Security Rules | Domain Isolation | 🟠 Medium |
| [FW-011](FW-011.md) | Disable Local Rule Merging | Policy Integrity | 🟠 Medium |
| [FW-012](FW-012.md) | Block mDNS + NetBIOS Inbound | LLMNR Poisoning | 🟠 Medium |
| [FW-013](FW-013.md) | GPO Deployment Guide + Full Checklist | Deployment | 🟠 Medium |

---

## Deployment Priority Order

```
Priority 1 (Deploy Day 1):
  FW-001 → FW-002 → FW-011  (baseline + logging + policy integrity)

Priority 2 (Deploy Week 1):
  FW-003 → FW-004 → FW-006 → FW-007  (block inbound attack vectors)

Priority 3 (Deploy Week 2):
  FW-009 → FW-012 → FW-005  (lateral movement + recon prevention)

Priority 4 (Advanced):
  FW-008 → FW-010  (outbound control + IPSec isolation)
```

## Quick Port Block Reference

| Port | Protocol | Block On | Policy |
|---|---|---|---|
| 23 | TCP | All (outbound) | FW-008 |
| 25 | TCP | Workstations (outbound) | FW-008 |
| 135 | TCP | Workstations (inbound) | FW-007 |
| 137/138 | UDP | All (inbound) | FW-012 |
| 139 | TCP | All (inbound) | FW-012 |
| 445 | TCP | Workstations (inbound) | FW-003 |
| 3389 | TCP | Public (inbound) | FW-004 |
| 5353 | UDP | Public (inbound) | FW-012 |
| 5985/5986 | TCP | Workstations (inbound) | FW-006 |
| 6660-6669 | TCP | All (outbound) | FW-008 |

## MITRE ATT&CK Coverage

| Technique | ID | Policies |
|---|---|---|
| SMB Lateral Movement | T1021.002 | FW-003, FW-009 |
| RDP Lateral Movement | T1021.001 | FW-004, FW-009 |
| WinRM Lateral Movement | T1021.006 | FW-006, FW-009 |
| LLMNR/NBT-NS Poisoning | T1557.001 | FW-012 |
| Network Discovery | T1046 | FW-005 |
| Non-Standard Port C2 | T1571 | FW-008 |
| Exploitation of Remote Services | T1210 | FW-003, FW-007 |

## Related Policies

- [PRINT-003](../printing/PRINT-003.md) — Block Spooler RPC (complements FW-007)
- [SMB-001–008](../smb/) — SMB hardening (complements FW-003)
- [CRED-003–009](../credentials/) — Credential protection (complements FW-004)
- [ASR-008](../asr/ASR-008.md) — Block PSExec/WMI (complements FW-007, FW-009)
