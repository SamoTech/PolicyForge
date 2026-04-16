# SMB Hardening Policies

This directory contains Group Policy controls specifically targeting **Server Message Block (SMB)** protocol security.

SMB is the most commonly abused protocol in Windows lateral movement and ransomware campaigns. These policies form a complete SMB hardening stack.

## Policy Index

| ID | Policy | Risk | OS Minimum |
|---|---|---|---|
| [SMB-001](SMB-001.md) | Require SMB Encryption | 🔴 Critical | Windows 10 21H2 |
| [SMB-002](SMB-002.md) | Disable SMB Compression | 🟠 Medium | Windows 10 20H1 |
| [SMB-003](SMB-003.md) | Enable SMB Signing (Client) | 🔴 Critical | Windows 7 |
| [SMB-004](SMB-004.md) | Enable SMB Signing (Server) | 🔴 Critical | Windows Server 2008 |
| [SMB-005](SMB-005.md) | Enforce Minimum SMB Dialect (3.x) | 🟠 Medium | Windows 11 24H2 |

## Recommended Deployment Order

1. **SMB-003 + SMB-004** — Enable signing first (lowest risk, highest impact)
2. **SMB-001** — Add encryption (test with pilot group)
3. **SMB-002** — Disable compression (low risk)
4. **SMB-005** — Enforce dialect minimum (verify no legacy servers first)

## Related Policies

- [WIN-SECURITY-002](../WIN-SECURITY-002.md) — Disable SMBv1 (prerequisite)
- [NET-002](../network/NET-002.md) — Disable NetBIOS
- [NET-003](../network/NET-003.md) — Disable LLMNR
