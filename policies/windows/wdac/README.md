# WDAC (Windows Defender Application Control) Policies

WDAC (now **App Control for Business**) provides kernel-level application control that cannot be bypassed by local administrators. Unlike AppLocker, WDAC is available on all Windows 10/11 editions.

## Policy Index

| ID | Policy | Phase | Risk |
|---|---|---|---|
| [WDAC-001](WDAC-001.md) | Deploy Base Policy in Audit Mode | Phase 1 | 🔴 Critical |
| [WDAC-002](WDAC-002.md) | Generate Policy from Audit Events | Phase 2 | 🟠 Medium |
| [WDAC-003](WDAC-003.md) | Managed Installer Integration | Phase 3 | 🟠 Medium |
| [WDAC-004](WDAC-004.md) | Publisher-Based Supplemental Policies | Phase 3 | 🟠 Medium |

---

## AppLocker vs WDAC — When to Use Which

| Scenario | Use AppLocker | Use WDAC |
|---|---|---|
| Quick deployment needed | ✅ | ❌ (complex) |
| Standard managed endpoints | ✅ | ✅ |
| High-security / zero-trust | ❌ | ✅ |
| Prevent admin bypass | ❌ | ✅ |
| All Windows editions | ❌ | ✅ |
| Driver/kernel-mode control | ❌ | ✅ |
| ACSC Essential Eight Level 3 | ❌ | ✅ |

## Full Deployment Timeline

```
Phase 1: Audit (Weeks 1–4)
  └─ Deploy DefaultWindows_Audit.xml base policy
  └─ Collect Event 3076 violations
  └─ No user impact

Phase 2: Policy Refinement (Weeks 5–8)
  └─ Run New-CIPolicy -Audit (WDAC-002)
  └─ Review and approve allow rules
  └─ Merge into updated audit policy
  └─ Deploy merged policy — still audit

Phase 3: Supplemental + Managed Installer (Weeks 7–10)
  └─ Configure SCCM/Intune as Managed Installer (WDAC-003)
  └─ Build app-specific supplemental policies (WDAC-004)
  └─ Deploy supplementals alongside base

Phase 4: Enforcement (Week 11+)
  └─ Remove Audit Mode option (Option 3 deleted)
  └─ Deploy enforce-mode binary
  └─ Monitor Event 3077 (blocks in enforce)
  └─ Rapid supplemental update process for new app deployments
```

## WDAC Event Quick Reference

| Event | Log | Meaning |
|---|---|---|
| 3076 | CodeIntegrity/Operational | Would block (Audit mode) |
| 3077 | CodeIntegrity/Operational | Was blocked (Enforce mode) |
| 3089 | CodeIntegrity/Operational | Signature info for blocked file |
| 3099 | CodeIntegrity/Operational | Policy loaded/activated |

```powershell
# Live WDAC audit monitor:
Get-WinEvent -LogName 'Microsoft-Windows-CodeIntegrity/Operational' |
    Where-Object { $_.Id -eq 3076 } |
    Select TimeCreated, @{N='File';E={$_.Properties[1].Value}} |
    Sort TimeCreated -Descending
```

## Related Policies

- [AL-001–007](../applocker/) — AppLocker (simpler, use alongside or instead)
- [ASR-001](../asr/ASR-001.md) — Block BYOVD drivers (complements WDAC kernel protection)
- [BL-011](../bitlocker/BL-011.md) — Secure Boot (WDAC prerequisite for full boot chain trust)
