# Printer & Spooler Security Policies

This directory covers Group Policy controls targeting the **Windows Print Spooler** — the most persistently exploited Windows service in recent history (PrintNightmare, PrinterBug, CVE-2021-34527, CVE-2021-1675).

## Threat Overview

| CVE / Exploit | Technique | Year | Spooler Component |
|---|---|---|---|
| CVE-2021-1675 | LPE via driver install | 2021 | SpoolSS RPC |
| CVE-2021-34527 (PrintNightmare) | RCE + LPE | 2021 | Point and Print |
| SpoolSample / PrinterBug | NTLM coercion | 2019 | MS-RPRN RPC |
| CVE-2022-21999 (SpoolFool) | LPE | 2022 | CreateDirectoryA |
| CVE-2022-38028 | LPE (APT28 - Operation Forest Blizzard) | 2022 | MSKSSRV.SYS |

## Policy Index

| ID | Policy | Risk | Action |
|---|---|---|---|
| [PRINT-001](PRINT-001.md) | Disable Print Spooler Service | 🔴 Critical | Disable on DCs/servers |
| [PRINT-002](PRINT-002.md) | Restrict Point and Print to Approved Servers | 🔴 Critical | Configure allowlist |
| [PRINT-003](PRINT-003.md) | Disable Remote Spooler RPC | 🔴 Critical | Block network exposure |
| [PRINT-004](PRINT-004.md) | Block Non-Admin Driver Install | 🟠 Medium | Restrict elevation |
| [PRINT-005](PRINT-005.md) | Enable Spooler Sandbox Mode | 🟠 Medium | Isolate drivers |
| [PRINT-006](PRINT-006.md) | Firewall Block Remote Spooler RPC | 🟠 Medium | Network layer block |
| [PRINT-007](PRINT-007.md) | Disable Web/Internet Printing | 🟡 Low | Reduce attack surface |
| [PRINT-008](PRINT-008.md) | Audit Printer Driver Events | 🟡 Low | Detection/monitoring |

## Deployment Decision Tree

```
Does the machine need printing?
├─ NO → PRINT-001 (disable Spooler) + PRINT-006 (firewall)
└─ YES
     └─ Does it share printers to other clients?
          ├─ NO (workstation, local only)
          │    └─ PRINT-003 + PRINT-002 + PRINT-004 + PRINT-005 + PRINT-008
          └─ YES (print server)
               └─ PRINT-002 + PRINT-004 + PRINT-005 + PRINT-006 + PRINT-008
```

## Related Policies

- [NET-004](../network/NET-004.md) — Windows Defender Firewall (prerequisite for PRINT-006)
- [CRED-006](../credentials/CRED-006.md) — Restrict Outbound NTLM (blocks PrinterBug coercion)
