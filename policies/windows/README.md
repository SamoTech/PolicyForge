# Windows Policies Index

Complete index of all documented Windows Group Policy settings in PolicyForge.

## Security Policies (`security/`) — 19 Policies

| ID | Policy | Risk | MITRE |
|---|---|---|---|
| [WIN-SECURITY-001](security/WIN-SECURITY-001-disable-autorun.md) | Disable AutoRun / AutoPlay | 🔴 Critical | T1091 |
| [WIN-SECURITY-002](security/WIN-SECURITY-002-disable-smbv1.md) | Disable SMBv1 | 🔴 Critical | T1210 |
| [WIN-SECURITY-003](security/WIN-SECURITY-003-disable-llmnr.md) | Disable LLMNR | 🔴 Critical | T1557.001 |
| [WIN-SECURITY-004](security/WIN-SECURITY-004-disable-nbt-ns.md) | Disable NBT-NS | 🔴 Critical | T1557.001 |
| [WIN-SECURITY-005](security/WIN-SECURITY-005-enable-firewall-all-profiles.md) | Enable Windows Firewall | 🟠 High | T1562.004 |
| [WIN-SECURITY-006](security/WIN-SECURITY-006-enable-credential-guard.md) | Enable Credential Guard | 🔴 Critical | T1003.001 |
| [WIN-SECURITY-007](security/WIN-SECURITY-007-disable-wdigest.md) | Disable WDigest | 🔴 Critical | T1003.001 |
| [WIN-SECURITY-008](security/WIN-SECURITY-008-enable-ps-scriptblock-logging.md) | Enable PS ScriptBlock Logging | 🟠 High | T1059.001 |
| [WIN-SECURITY-009](security/WIN-SECURITY-009-audit-process-creation.md) | Audit Process Creation | 🟠 High | T1059 |
| [WIN-SECURITY-010](security/WIN-SECURITY-010-disable-guest-account.md) | Disable Guest Account | 🟠 High | T1078.003 |
| [WIN-SECURITY-011](security/WIN-SECURITY-011-account-lockout-policy.md) | Account Lockout Policy | 🟠 High | T1110.003 |
| [WIN-SECURITY-012](security/WIN-SECURITY-012-enable-lsa-protection.md) | Enable LSA Protection (PPL) | 🔴 Critical | T1003.001 |
| [WIN-SECURITY-013](security/WIN-SECURITY-013-rdp-network-level-auth.md) | Require NLA for RDP | 🔴 Critical | T1021.001 |
| [WIN-SECURITY-014](security/WIN-SECURITY-014-disable-autoplay-removable.md) | Disable AutoPlay Removable | 🟠 High | T1091 |
| [WIN-SECURITY-015](security/WIN-SECURITY-015-restrict-anonymous-enumeration.md) | Restrict Anonymous Enumeration | 🟠 High | T1087 |
| [WIN-SECURITY-016](security/WIN-SECURITY-016-uac-admin-approval-mode.md) | UAC Admin Approval Mode | 🔴 Critical | T1548.002 |
| [WIN-SECURITY-017](security/WIN-SECURITY-017-disable-print-spooler.md) | Disable Print Spooler | 🔴 Critical | T1068 |
| [WIN-SECURITY-018](security/WIN-SECURITY-018-disable-remote-registry.md) | Disable Remote Registry | 🟠 High | T1112 |
| [WIN-SECURITY-019](security/WIN-SECURITY-019-protect-event-log.md) | Protect Event Logs | 🟠 High | T1070.001 |

## Privacy Policies (`privacy/`) — 3 Policies

| ID | Policy | Risk |
|---|---|---|
| [WIN-PRIVACY-001](privacy/WIN-PRIVACY-001-disable-telemetry.md) | Disable Windows Telemetry | 🟡 Medium |
| [WIN-PRIVACY-002](privacy/WIN-PRIVACY-002-disable-cortana.md) | Disable Cortana | 🟡 Medium |
| [WIN-PRIVACY-003](privacy/WIN-PRIVACY-003-disable-onedrive.md) | Disable OneDrive | 🟡 Medium |

## Network Policies (`network/`) — 1 Policy

| ID | Policy | Risk |
|---|---|---|
| [WIN-NET-001](network/WIN-NET-001-disable-wpad.md) | Disable WPAD Auto-Detection | 🔴 Critical |

## Stats

- **Total policies:** 23
- **Critical risk:** 8
- **High risk:** 12
- **Medium risk:** 3
- **MITRE techniques covered:** 16
- **CIS controls mapped:** 19
