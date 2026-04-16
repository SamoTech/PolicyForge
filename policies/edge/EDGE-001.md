# EDGE-001 — Enable Microsoft Defender SmartScreen

**ID:** EDGE-001  
**Category:** Microsoft Edge / SmartScreen / Phishing Protection  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Microsoft Edge
            ├─ Configure Microsoft Defender SmartScreen: Enabled
            ├─ Prevent bypassing Microsoft Defender SmartScreen prompts for sites: Enabled
            └─ Prevent bypassing Microsoft Defender SmartScreen warnings for downloads: Enabled
```

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  SmartScreenEnabled                            = 1
  SmartScreenPuaEnabled                         = 1   (block PUA downloads)
  PreventSmartScreenPromptOverride              = 1   (no bypass for sites)
  PreventSmartScreenPromptOverrideForFiles      = 1   (no bypass for downloads)
  SmartScreenAllowListDomains                   = []  (enterprise allow-list)
```

## PowerShell

```powershell
# Verify SmartScreen settings
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
Get-ItemProperty $edgePath | Select SmartScreenEnabled, PreventSmartScreenPromptOverride,
    PreventSmartScreenPromptOverrideForFiles, SmartScreenPuaEnabled

# Check if Edge policy is being applied via GPO
Get-GPResultantSetOfPolicy -ReportType Html -Path "C:\PolicyForge\edge-gpo-report.html"
```

## Description

SmartScreen checks URLs against Microsoft's threat intelligence database, blocking known phishing sites, malware distribution sites, and PUA (Potentially Unwanted Application) downloads. The "prevent bypass" settings are critical — without them, users can click through SmartScreen warnings, defeating the protection. Enabling `SmartScreenPuaEnabled` extends protection to adware, cryptominers, and bundled unwanted software that don't qualify as traditional malware.

## Impact

- ✅ Blocks access to known phishing and malware sites
- ✅ Blocks PUA downloads (cryptominers, adware, bundled junk)
- ✅ No user bypass allowed
- ⚠️ May block legitimate but newly-registered domains (SmartScreen reputation lag)
- ℹ️ Use SmartScreenAllowListDomains for trusted internal domains

## MITRE ATT&CK Coverage

T1566 (Phishing), T1189 (Drive-by Compromise), T1204.002 (Malicious File)

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.1, 2.2, 2.3 (L1)
- **Microsoft Security Baseline:** Edge 131+
- **DISA STIG:** EDGE-00-000001

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
