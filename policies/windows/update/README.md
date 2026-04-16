# Windows Update & Patch Management Policies

Complete enterprise Windows Update management covering WSUS configuration, deferral rings, driver control, delivery optimization, compliance enforcement, and audit tooling.

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [WU-001](WU-001.md) | Configure Automatic Updates | Baseline | 🟡 Medium |
| [WU-002](WU-002.md) | Configure WSUS Server | WSUS | 🟡 Medium |
| [WU-003](WU-003.md) | Defer Feature Updates | Version Control | 🟡 Medium |
| [WU-004](WU-004.md) | Defer Quality Updates | Patch Rings | 🟡 Medium |
| [WU-005](WU-005.md) | Configure Active Hours | User Experience | 🟢 Low |
| [WU-006](WU-006.md) | Disable Driver Updates via WU | Driver Control | 🟡 Medium |
| [WU-007](WU-007.md) | Configure Delivery Optimization | Bandwidth | 🟢 Low |
| [WU-008](WU-008.md) | Disable Update Notifications | User Control | 🟢 Low |
| [WU-009](WU-009.md) | Configure Update Deadlines | Enforcement | 🟡 Medium |
| [WU-010](WU-010.md) | Enable Microsoft Update | Product Coverage | 🟡 Medium |
| [WU-011](WU-011.md) | Disable WU on Metered Connections | Bandwidth | 🟢 Low |
| [WU-012](WU-012.md) | Compliance Audit Script | Audit | 🟢 Low |

---

## Deployment Priority Order

```
Priority 1 (Configure First):
  WU-001 → WU-002  (auto-update baseline + WSUS targeting)

Priority 2 (Ring Strategy):
  WU-003 → WU-004 → WU-009  (deferral + deadline enforcement)

Priority 3 (Quality of Life):
  WU-005 → WU-006 → WU-007 → WU-008  (active hours, drivers, DO, notifications)

Priority 4 (Coverage + Compliance):
  WU-010 → WU-011 → WU-012  (MS Update, metered, audit)
```

## Update Ring Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Ring 1 — PILOT (1-5% of devices)                       │
│  Quality Defer: 0 days │ Feature Defer: 0 days           │
│  Purpose: Catch bad patches before fleet rollout         │
├─────────────────────────────────────────────────────────┤
│  Ring 2 — EARLY ADOPTER (10-20% of devices)             │
│  Quality Defer: 3 days │ Feature Defer: 7 days           │
│  Purpose: Broader validation, IT-savvy users             │
├─────────────────────────────────────────────────────────┤
│  Ring 3 — STANDARD (60-70% of devices)                  │
│  Quality Defer: 7 days │ Feature Defer: 30 days          │
│  Purpose: Main fleet — default policy                    │
├─────────────────────────────────────────────────────────┤
│  Ring 4 — CRITICAL SYSTEMS (10-15% of devices)          │
│  Quality Defer: 14 days │ Feature Defer: 60 days         │
│  Purpose: Servers, kiosks, production workstations       │
└─────────────────────────────────────────────────────────┘
```

## Patch Tuesday Timeline (Monthly Cycle)

```
Patch Tuesday (2nd Tuesday):  Microsoft releases updates
Day +0:   Ring 1 (Pilot) installs — IT monitors for issues
Day +3:   Ring 2 (Early) installs — 15 days before deadline
Day +7:   Ring 3 (Standard) installs — 7 days before deadline
Day +14:  Ring 4 (Critical) installs
Day +9 from each ring start: DEADLINE — forced install + restart
```

## Windows 11 Support Lifecycle Quick Reference

| Version | Release | Enterprise EOL | Action |
|---|---|---|---|
| 21H2 | Oct 2021 | Oct 2024 | ⛔ Upgrade immediately |
| 22H2 | Sep 2022 | Oct 2025 | ⚠️ Upgrade before Oct 2025 |
| 23H2 | Oct 2023 | Nov 2026 | ✅ Supported |
| 24H2 | Oct 2024 | Oct 2027 | ✅ Latest — target version |

## WSUS Architecture Options

| Option | Best For | Complexity |
|---|---|---|
| Single WSUS | < 500 devices | Low |
| Upstream + Replica WSUS | Multi-site enterprise | Medium |
| SCCM + WSUS | > 1000 devices | High |
| Intune (cloud-managed) | Modern management | Medium |
| Windows Update for Business | Cloud-joined only | Low |

## Related Policies

- [BL-001–009](../bitlocker/) — BitLocker (complements WU: encrypt before patching)
- [ASR-001–014](../asr/) — ASR rules (active while updates are pending)
- [FW-001–013](../firewall/) — Firewall (protects during patch window)
