# EDGE-012 — Enable Enhanced Phishing Protection (Windows Defender Integration)

**ID:** EDGE-012  
**Category:** Microsoft Edge / Anti-Phishing / Credential Protection  
**Risk Level:** 🔴 Critical  
**OS:** Windows 11 22H2+  
**Source:** Microsoft Security Baseline · CIS Benchmark

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Windows Components
            └─ Windows Defender SmartScreen
                 └─ Enhanced Phishing Protection
                      ├─ Notify Malicious: Enabled
                      ├─ Notify Password Reuse: Enabled
                      ├─ Notify Unsafe App: Enabled
                      └─ Service Enabled: Enabled
```

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Windows\WTDS\Components
  NotifyMalicious         = 1    (warn if password typed on phishing site)
  NotifyPasswordReuse     = 1    (warn if corporate password reused on personal site)
  NotifyUnsafeApp         = 1    (warn if password typed into unsafe app like Notepad)
  ServiceEnabled          = 1    (enable enhanced phishing protection service)
```

## What Enhanced Phishing Protection Does

```
Scenario 1: User visits a phishing site that looks like Microsoft login
  → Enhanced PP detects password entry on phishing URL
  → Warning: "This site may be stealing your password"
  → Event logged to Security log for SOC visibility

Scenario 2: User types corporate password into Notepad
  → Enhanced PP detects corporate credential entry in unsafe app
  → Warning: "Don't store your work password in plain text"

Scenario 3: User reuses corporate password on Reddit/Facebook
  → Enhanced PP detects password reuse
  → Warning: "Your work password was entered on a non-work site"
```

## PowerShell — Check Enhanced Phishing Protection Status

```powershell
# Check Enhanced Phishing Protection registry settings
Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WTDS\Components" |
    Select NotifyMalicious, NotifyPasswordReuse, NotifyUnsafeApp, ServiceEnabled

# Check Windows Security Center status
Get-MpComputerStatus | Select SmartScreenEnabled
```

## Description

Enhanced Phishing Protection (part of Windows Defender, integrated with Edge) warns users when their corporate credentials are typed into phishing sites, insecure applications, or reused on personal sites. Unlike SmartScreen (which blocks known bad URLs), this feature monitors the actual act of credential entry — providing protection even against zero-day phishing sites not yet in SmartScreen's database. Events are logged to the Windows Security event log, enabling SIEM detection of credential compromise attempts.

## Impact

- ✅ Detects credential entry on phishing sites (including zero-day)
- ✅ Detects dangerous password reuse behavior
- ✅ Detects credentials stored in plaintext (Notepad, Word)
- ✅ Events logged for SIEM/SOC visibility
- ℹ️ Requires Windows 11 22H2+ and Edge

## MITRE ATT&CK Coverage

T1566 (Phishing), T1056.003 (GUI Input Capture), T1555.003 (Credentials from Browser)

## Compliance References

- **Microsoft Security Baseline:** Windows 11 24H2
- **CIS Benchmark:** Windows 11 v3.0 — 18.9.85.x

## Test Status

✔ Tested on Windows 11 24H2 + Edge 131
✔ Warning triggered on test phishing page
