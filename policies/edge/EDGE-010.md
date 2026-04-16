# EDGE-010 — Block Dangerous File Downloads

**ID:** EDGE-010  
**Category:** Microsoft Edge / Download Control  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  DownloadRestrictions          = 2    (0=no restrict, 1=block dangerous, 2=block dangerous+unverified, 3=block all)
  SafeBrowsingProtectionLevel   = 2    (2=enhanced protection)
  ExternalProtocolDialogShowAlwaysOpenCheckbox = 0   (no "always open" for external protocols)
  AutoOpenAllowedForURLs        = []   (no auto-open from any URL)
  AutoOpenFileTypes             = []   (no auto-open file types)
```

## DownloadRestrictions Values

| Value | Behavior | Recommended For |
|---|---|---|
| 0 | No restrictions | Home users |
| **1** | **Block malicious downloads** | **Minimum enterprise** |
| **2** | **Block malicious + unverified** | **Recommended enterprise** |
| 3 | Block all downloads | High-security kiosks |
| 4 | Block dangerous + uncommon + unwanted | High-security standard users |

## Description

Controls what types of files Edge will download. `DownloadRestrictions = 2` blocks both SmartScreen-flagged malicious downloads AND downloads from URLs with no reputation (unverified publishers/sources). Disabling `AutoOpenFileTypes` prevents Edge from automatically opening downloaded files without user confirmation — a common malware delivery mechanism where `.exe`, `.msi`, or `.hta` files auto-execute after download.

## File Types to Consider Blocking

```
High Risk (always block):
  .exe, .msi, .bat, .cmd, .vbs, .js, .jse, .wsf, .wsh
  .hta, .pif, .scr, .com, .cpl, .reg

Medium Risk (block for non-IT users):
  .ps1, .psm1, .psd1 (PowerShell)
  .dll, .sys (driver/library)
  .iso, .img (disk images — can contain malware)

Low Risk (monitor):
  .docm, .xlsm, .pptm (macro-enabled Office)
  .pdf (can contain JS exploits)
```

## MITRE ATT&CK Coverage

T1204.002 (Malicious File), T1566.001 (Spearphishing Attachment)

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.13 (L1)
- **DISA STIG:** EDGE-00-000030

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
