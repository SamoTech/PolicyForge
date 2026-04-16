# EDGE-007 — Enable Site Isolation (Per-Site Process Model)

**ID:** EDGE-007  
**Category:** Microsoft Edge / Sandbox / Spectre Mitigation  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  SitePerProcess               = 1    (each site in its own process)
  IsolateOrigins               = "https://accounts.google.com,https://login.microsoftonline.com,https://login.live.com"
  RendererCodeIntegrityEnabled = 1    (block injections into renderer)
```

## Description

Site Isolation runs each website in a separate renderer process, preventing malicious cross-site attacks from accessing another site's data even after a Spectre-style speculative execution attack. Without site isolation, a malicious script on `evil.com` could potentially read data from `bank.com` open in another tab using Spectre side-channel attacks. `IsolateOrigins` adds an extra layer for specific high-value origins (login pages, banking portals) that should always have their own dedicated process.

## Impact

- ✅ Spectre/Meltdown side-channel attacks cannot read cross-origin data
- ✅ Compromised renderer process cannot access other sites' data
- ✅ Critical for shared systems (kiosks, RDS, VDI)
- ⚠️ Increased memory usage (~10% per extra site process)

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.12 (L1)
- **Microsoft Security Baseline:** Edge 131+
- **CVE Reference:** Spectre/Meltdown side-channel (memory isolation)

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
