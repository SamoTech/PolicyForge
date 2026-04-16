# Windows Defender Antivirus Deep Configuration

Complete enterprise hardening of Windows Defender Antivirus — from real-time protection and cloud intelligence to ransomware-specific controls, exploit protection, and SIEM integration.

> **Key principle**: Defender is not just "AV" — it’s a full endpoint protection platform when fully configured. Most enterprises run it at 20% of its capability.

---

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [WDA-001](WDA-001.md) | Real-Time Protection (All Components) | Core AV | 🔴 Critical |
| [WDA-002](WDA-002.md) | Cloud-Delivered Protection + MAPS + Block at First Sight | Cloud Intel | 🔴 Critical |
| [WDA-003](WDA-003.md) | Tamper Protection | AV Integrity | 🔴 Critical |
| [WDA-004](WDA-004.md) | Exclusion Hardening (Anti-Exclusion) | Exclusion Control | 🔴 Critical |
| [WDA-005](WDA-005.md) | PUA Blocking | Unwanted Software | 🟠 Medium |
| [WDA-006](WDA-006.md) | Network Protection (All-Process C2 Block) | Network | 🔴 Critical |
| [WDA-007](WDA-007.md) | Controlled Folder Access (Anti-Ransomware) | Ransomware | 🟠 High |
| [WDA-008](WDA-008.md) | Attack Surface Reduction — Full Rule Set | ASR | 🔴 Critical |
| [WDA-009](WDA-009.md) | Scan Schedule & Configuration | Scanning | 🟡 Low |
| [WDA-010](WDA-010.md) | Exploit Protection (DEP/ASLR/CFG/SEHOP) | Exploit Mitig. | 🔴 Critical |
| [WDA-011](WDA-011.md) | Signature Update Frequency | Signatures | 🟠 Medium |
| [WDA-012](WDA-012.md) | IOAV + Download + Archive + Email Scanning | Download | 🔴 Critical |
| [WDA-013](WDA-013.md) | Server Role Exclusions (Justified Only) | Server Config | 🟠 Medium |
| [WDA-014](WDA-014.md) | Reporting + SIEM Integration | Monitoring | 🟠 Medium |

---

## Deployment Priority

```
Day 1 — Non-negotiable:
  WDA-001  Real-time protection (all components)
  WDA-003  Tamper Protection
  WDA-004  Exclusion hardening
  WDA-012  Download/archive/email scanning

Week 1 — Cloud + Advanced:
  WDA-002  Cloud protection + Block at First Sight
  WDA-006  Network Protection (Audit first)
  WDA-010  Exploit Protection
  WDA-008  ASR Rules (Audit first, enforce Week 2)

Week 2 — Ransomware + Intelligence:
  WDA-007  Controlled Folder Access (Audit → Block)
  WDA-005  PUA Protection
  WDA-011  Signature update frequency
  WDA-014  SIEM/reporting integration

Server-specific:
  WDA-009  Scan schedule
  WDA-013  Server role exclusions
```

---

## MITRE ATT&CK Coverage

| Technique | ID | Policies |
|---|---|---|
| Disable Security Tools | T1562.001 | WDA-003, WDA-004 |
| Malicious File | T1204.002 | WDA-001, WDA-012 |
| LSASS Dump | T1003.001 | WDA-008 |
| Ransomware | T1486 | WDA-007, WDA-008 |
| C2 over HTTP | T1071 | WDA-006 |
| Phishing | T1566 | WDA-002, WDA-006 |
| Exploit Client | T1203 | WDA-010 |
| PUA/Cryptominer | T1496 | WDA-005 |
| WMI Persistence | T1546.003 | WDA-008 |
| Process Injection | T1055 | WDA-010 |

---

## One-Shot PowerShell Baseline

```powershell
# PolicyForge — Windows Defender Full Baseline
# Run as Administrator

Write-Host "Applying PolicyForge Defender Baseline..." -ForegroundColor Cyan

# Real-Time Protection
Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -DisableBehaviorMonitoring $false
Set-MpPreference -DisableOnAccessProtection $false
Set-MpPreference -DisableIOAVProtection $false

# Cloud Protection
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendSafeSamples
Set-MpPreference -CloudBlockLevel High
Set-MpPreference -CloudExtendedTimeout 50
Set-MpPreference -DisableBlockAtFirstSeen $false

# PUA
Set-MpPreference -PUAProtection Enabled

# Network Protection
Set-MpPreference -EnableNetworkProtection Enabled

# CFA (start audit)
Set-MpPreference -EnableControlledFolderAccess AuditMode

# Scan config
Set-MpPreference -ScanParameters FullScan
Set-MpPreference -ScanScheduleDay Sunday
Set-MpPreference -ScanScheduleTime 02:00
Set-MpPreference -DisableArchiveScanning $false
Set-MpPreference -DisableEmailScanning $false

# Signature updates every 4 hours
Set-MpPreference -SignatureUpdateInterval 4

Write-Host "[DONE] Defender baseline applied." -ForegroundColor Green
Write-Host "[ACTION REQUIRED] Enable Tamper Protection via Intune/MDE or Windows Security Center."
Write-Host "[ACTION REQUIRED] Run ASR rules in Audit mode for 7 days before enforcing."
Write-Host "[ACTION REQUIRED] Switch CFA from AuditMode to Enabled after allowlist review."

# Print status
Get-MpComputerStatus | Select AMRunningMode, RealTimeProtectionEnabled,
    BehaviorMonitorEnabled, IsTamperProtected, AntispywareEnabled
```

---

## Related Policies

- [AUDIT-014](../audit/AUDIT-014.md) — 40 Critical Event IDs (includes Defender events)
- [URA-001](../user-rights/URA-001.md) — SeDebugPrivilege (Mimikatz prevention)
- [WDAC-001](../wdac/WDAC-001.md) — Code Integrity (complements Defender)
- [EDGE-001](../../edge/EDGE-001.md) — SmartScreen (browser-layer protection)
