# EDGE-011 — Disable Personal Profile & Guest Mode

**ID:** EDGE-011  
**Category:** Microsoft Edge / Profile Control / DLP  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  BrowserSignin                 = 0    (0=disable sign-in, 1=optional, 2=force sign-in)
  NonRemovableProfileEnabled    = 0
  GuestModeEnabled              = 0    (disable Guest browsing mode)
  BrowserAddProfileEnabled      = 0    (prevent adding new profiles)
  HideFirstRunExperience        = 1    (skip setup wizard)
  ImportBrowserDataOnStartup    = 0    (don't import other browser data)
```

## Description

Prevents users from signing into Edge with personal Microsoft accounts, disables Guest mode, and blocks creation of additional browser profiles. Without these controls:

- Users can sign in with personal accounts and sync corporate browsing data to personal devices
- Guest mode provides an unmanaged, policy-bypass browsing context
- Additional profiles can bypass corporate proxy/filtering settings
- Profile switching allows circumventing extension blocklists (EDGE-002)

Setting `BrowserSignin = 0` completely disables personal account sign-in. If your organization uses Entra ID (Azure AD) joined devices, consider `BrowserSignin = 2` (force sign-in with corporate account) instead.

## Profile Mode Comparison

| Mode | Policies Apply | Extensions Blocked | Sync Disabled |
|---|---|---|---|
| Corporate profile | ✅ Yes | ✅ Yes | ✅ Yes |
| Personal profile | ❌ No | ❌ No | ❌ No |
| Guest mode | ❌ No | ❌ No | N/A |
| InPrivate | ✅ Yes | Depends | N/A |

## Impact

- ✅ All browsing occurs under managed corporate profile
- ✅ No policy bypass via personal/guest profiles
- ✅ Eliminates personal-to-corporate data sync risk
- ⚠️ Users cannot use Edge for personal browsing on corporate devices

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.14, 2.15 (L1)
- **Microsoft Security Baseline:** Edge 131+

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
