# Microsoft Defender Policies Index

Complete index of all documented Microsoft Defender Antivirus / Defender for Endpoint policies.

## Defender Policies (`defender/`) — 10 Policies

| ID | Policy | Risk | Category |
|---|---|---|---|
| [DEF-001](DEF-001-enable-realtime-protection.md) | Enable Real-Time Protection | 🔴 Critical | Core Protection |
| [DEF-002](DEF-002-enable-cloud-protection.md) | Enable Cloud-Delivered Protection | 🟠 High | Cloud |
| [DEF-003](DEF-003-enable-behavioral-monitoring.md) | Enable Behavioral Monitoring | 🔴 Critical | Behavioral |
| [DEF-004](DEF-004-attack-surface-reduction-rules.md) | Attack Surface Reduction Rules | 🔴 Critical | ASR |
| [DEF-005](DEF-005-controlled-folder-access.md) | Controlled Folder Access | 🟠 High | Ransomware |
| [DEF-006](DEF-006-network-protection.md) | Network Protection | 🟠 High | Network |
| [DEF-007](DEF-007-tamper-protection.md) | Enable Tamper Protection | 🔴 Critical | Integrity |
| [DEF-008](DEF-008-scan-schedule.md) | Configure Scan Schedule | 🟡 Medium | Maintenance |
| [DEF-009](DEF-009-pua-protection.md) | PUA / PUP Protection | 🟡 Medium | Adware |
| [DEF-010](DEF-010-exclusions-hardening.md) | Exclusions Hardening | 🔴 Critical | Configuration |

## MITRE ATT&CK Coverage

| Policy | Techniques Mitigated |
|---|---|
| DEF-001 Real-Time Protection | T1204, T1566, T1059 |
| DEF-003 Behavioral Monitoring | T1055, T1059, T1547 |
| DEF-004 ASR Rules | T1566.001, T1059.005, T1218 |
| DEF-005 CFA | T1486 (Ransomware) |
| DEF-006 Network Protection | T1071, T1048 |
| DEF-007 Tamper Protection | T1562.001 |
| DEF-010 Exclusions | T1562.001 (Defender exclusion abuse) |

## Deployment Priority

```
Priority 1 (Deploy Immediately):
  DEF-001, DEF-003, DEF-007, DEF-010

Priority 2 (Deploy After Testing):
  DEF-004 (ASR — audit mode first), DEF-005 (CFA — audit mode first), DEF-006

Priority 3 (Operational Tuning):
  DEF-002, DEF-008, DEF-009
```

## Stats

- **Total policies:** 10
- **Critical risk:** 4
- **High risk:** 3
- **Medium risk:** 2
- **MITRE techniques covered:** 14
