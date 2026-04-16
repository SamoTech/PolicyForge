# EDGE-004 — Disable Edge Sync (No Cloud Sync of Browser Data)

**ID:** EDGE-004  
**Category:** Microsoft Edge / Data Leakage Prevention  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Microsoft Edge
            ├─ Do not sync browser data: Enabled
            └─ Configure the list of types that are excluded from synchronization:
                 Enabled → passwords, autofill, history, tabs, extensions
```

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  SyncDisabled           = 1    (disable all sync)
  RoamingProfileSupportEnabled = 0

; Or granular: disable specific sync types
HKLM\SOFTWARE\Policies\Microsoft\Edge\SyncTypesListDisabled
  1 = "passwords"
  2 = "autofill"
  3 = "history"
  4 = "tabs"
  5 = "extensions"
  6 = "settings"
```

## Description

Edge Sync uploads browsing data (history, passwords, extensions, open tabs, settings) to Microsoft's cloud using the user's Microsoft account. In enterprise environments, this creates data leakage risk: corporate browsing history, intranet URLs, and saved credentials may sync to personal devices or personal Microsoft accounts. Disabling sync ensures corporate browser data stays on corporate devices under IT control. Pair with `BrowserSignin = 0` (disable personal account sign-in) for full data boundary enforcement.

## Impact

- ✅ Corporate browsing data doesn't leave managed devices
- ✅ Prevents personal account sign-in from syncing corporate data
- ⚠️ Users lose cross-device sync (expected and acceptable in enterprise)
- ℹ️ Enterprise profiles via Entra ID/Azure AD provide managed sync if needed

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.7 (L1)

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
