# Attack Surface Reduction (ASR) Rules

ASR rules are built into **Microsoft Defender for Endpoint** and **Windows Defender** (no additional license required for basic rules). They block specific attacker behaviors at the OS level — independent of signatures.

## All 14 ASR Rules Index

| ID | Rule Name | GUID | Recommended Mode |
|---|---|---|---|
| [ASR-001](ASR-001.md) | Block Abuse of Exploited Vulnerable Signed Drivers | `56a863a9...` | Block |
| [ASR-002](ASR-002.md) | Block Adobe Reader Child Processes | `7674ba52...` | Block |
| [ASR-003](ASR-003.md) | Block Office Child Processes | `d4f940ab...` | Block |
| [ASR-004](ASR-004.md) | Block Office Executable Content | `3b576869...` | Block |
| [ASR-005](ASR-005.md) | Block Office Process Injection | `75668c1f...` | Block |
| [ASR-006](ASR-006.md) | Block JS/VBS Launching Downloaded Executables | `d3e037e1...` | Block |
| [ASR-007](ASR-007.md) | Block Obfuscated Script Execution | `5beb7efe...` | Audit→32 days→Block |
| [ASR-008](ASR-008.md) | Block PSExec and WMI Process Creation | `d1e49aac...` | Audit→30 days→Block |
| [ASR-009](ASR-009.md) | Block LSASS Credential Stealing | `9e6c4e1f...` | Block |
| [ASR-010](ASR-010.md) | Block Untrusted USB Process Execution | `b2b3f03d...` | Block |
| [ASR-011](ASR-011.md) | Block WMI Event Subscription Persistence | `e6db77e5...` | Block |
| [ASR-012](ASR-012.md) | Block Office Communication App Child Processes | `26190899...` | Block |
| [ASR-013](ASR-013.md) | Advanced Ransomware Protection | `c1db55ab...` | Block |
| [ASR-014](ASR-014.md) | Block Win32 API Calls from Office Macros | `92e97fa1...` | Audit→30 days→Block |

---

## Audit → Enforce Workflow

```
Step 1 — Deploy all rules in Audit mode (Actions = AuditMode)
Step 2 — Monitor Event IDs in Windows Event Viewer:
          Applications and Services Logs
            > Microsoft > Windows > Windows Defender
              > Operational
                  Event 1121 = ASR rule blocked (Block mode)
                  Event 1122 = ASR rule would have blocked (Audit mode)

Step 3 — Review 1122 events. Identify FPs:
          - Is the process legitimate?
          - Is the behavior expected?
          - Add exclusion if needed (path/process)

Step 4 — After 14-30 days with clean audit logs:
          Switch to Block mode rule by rule

Step 5 — Forward to SIEM: Event 1121 + 1122 → alert on unexpected blocks
```

## Deploy All 14 Rules in Audit Mode (PowerShell)

```powershell
$asrRules = @(
    "56a863a9-875e-4185-98a7-b882c64b5ce5",  # BYOVD drivers
    "7674ba52-37eb-4a4f-a9a1-f0f9a1619a2c",  # Adobe Reader child proc
    "d4f940ab-401b-4efc-aadc-ad5f3c50688a",  # Office child proc
    "3b576869-a4ec-4529-8536-b80a7769e899",  # Office executable content
    "75668c1f-73b5-4cf0-bb93-3ecf5cb7cc84",  # Office injection
    "d3e037e1-3eb8-44c8-a917-57927947596d",  # JS/VBS downloader
    "5beb7efe-fd9a-4556-801d-275e5ffc04cc",  # Obfuscated scripts
    "d1e49aac-8f56-4280-b9ba-993a6d77406c",  # PSExec/WMI
    "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b0",  # LSASS credential steal
    "b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4",  # Untrusted USB
    "e6db77e5-3df2-4cf1-b95a-636979351e5b",  # WMI persistence
    "26190899-1602-49e8-8b27-eb1d0a1ce869",  # Communication apps
    "c1db55ab-c21a-4637-bb3f-a12568109d35",  # Ransomware
    "92e97fa1-2153-4986-a477-cdbca06a68d0"   # Win32 API from macros
)

$asrActions = @($asrRules | ForEach-Object { "AuditMode" })

Add-MpPreference `
    -AttackSurfaceReductionRules_Ids $asrRules `
    -AttackSurfaceReductionRules_Actions $asrActions

Write-Host "All 14 ASR rules deployed in Audit mode" -ForegroundColor Green

# Verify
Get-MpPreference | Select AttackSurfaceReductionRules_Ids, AttackSurfaceReductionRules_Actions
```

## Deploy All 14 Rules in Block Mode (After Audit)

```powershell
$asrRules = @(
    "56a863a9-875e-4185-98a7-b882c64b5ce5",
    "7674ba52-37eb-4a4f-a9a1-f0f9a1619a2c",
    "d4f940ab-401b-4efc-aadc-ad5f3c50688a",
    "3b576869-a4ec-4529-8536-b80a7769e899",
    "75668c1f-73b5-4cf0-bb93-3ecf5cb7cc84",
    "d3e037e1-3eb8-44c8-a917-57927947596d",
    "5beb7efe-fd9a-4556-801d-275e5ffc04cc",
    "d1e49aac-8f56-4280-b9ba-993a6d77406c",
    "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b0",
    "b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4",
    "e6db77e5-3df2-4cf1-b95a-636979351e5b",
    "26190899-1602-49e8-8b27-eb1d0a1ce869",
    "c1db55ab-c21a-4637-bb3f-a12568109d35",
    "92e97fa1-2153-4986-a477-cdbca06a68d0"
)

$asrActions = @($asrRules | ForEach-Object { "Enabled" })

Add-MpPreference `
    -AttackSurfaceReductionRules_Ids $asrRules `
    -AttackSurfaceReductionRules_Actions $asrActions

Write-Host "All 14 ASR rules enforced in Block mode" -ForegroundColor Red
```

## Intune Profile — Deploy All Rules

```
Profile type: Endpoint Security > Attack Surface Reduction
Platform: Windows 10 and later

Attack Surface Reduction Rules:
  56a863a9-875e-4185-98a7-b882c64b5ce5 = Block
  7674ba52-37eb-4a4f-a9a1-f0f9a1619a2c = Block
  d4f940ab-401b-4efc-aadc-ad5f3c50688a = Block
  3b576869-a4ec-4529-8536-b80a7769e899 = Block
  75668c1f-73b5-4cf0-bb93-3ecf5cb7cc84 = Block
  d3e037e1-3eb8-44c8-a917-57927947596d = Block
  5beb7efe-fd9a-4556-801d-275e5ffc04cc = Block
  d1e49aac-8f56-4280-b9ba-993a6d77406c = Audit  <- leave on Audit for WMI/PSExec
  9e6c4e1f-7d60-472f-ba1a-a39ef669e4b0 = Block
  b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4 = Block
  e6db77e5-3df2-4cf1-b95a-636979351e5b = Block
  26190899-1602-49e8-8b27-eb1d0a1ce869 = Block
  c1db55ab-c21a-4637-bb3f-a12568109d35 = Block
  92e97fa1-2153-4986-a477-cdbca06a68d0 = Audit  <- leave on Audit for VBA environments
```

## Related Policies

- [DEF-001–010](../../defender/) — Microsoft Defender base configuration
- [CRED-003](../credentials/CRED-003.md) — LSA PPL (complements ASR-009)
- [CRED-009](../credentials/CRED-009.md) — Kerberos AES (complements ASR-009)
- [OFFICE-001–005](../../office/) — Office macro policies (complements ASR-003/004/014)
