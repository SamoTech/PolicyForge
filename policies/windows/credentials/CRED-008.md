# CRED-008 — Disable Credential Caching (DomainCachedCredentials)

**ID:** CRED-008  
**Category:** Credential Hardening / Cached Credentials  
**Risk Level:** 🟠 Medium  
**OS:** Windows XP+, Windows 11, Windows Server 2003+  
**Source:** Microsoft Security Baseline · CIS Windows 11 v3.0

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Local Policies
                 └─ Security Options
                      └─ Interactive logon: Number of previous logons to cache (in case domain controller is not available)
                           └─ Value: 0
```

## Registry

```
Key:   HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
Value: CachedLogonsCount
Type:  String (REG_SZ)
Data:  0  (0=disable caching, default=10)
```

## PowerShell

```powershell
# Set cached logon count to 0 (disable caching)
$winlogonPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
Set-ItemProperty -Path $winlogonPath -Name "CachedLogonsCount" -Value "0" -Type String

# Verify
Get-ItemProperty -Path $winlogonPath -Name CachedLogonsCount
# Expected: CachedLogonsCount = 0
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/InteractiveLogon_NumberOfPreviousLogonsToCache
Type:    Integer
Value:   0
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]
"CachedLogonsCount"="0"
```

## Description

By default, Windows caches the last 10 domain logon credentials (as DCC2/MSCACHEv2 hashes) to allow offline logon when the DC is unavailable. These cached credentials are stored in the SAM hive and can be extracted with SYSTEM privileges and cracked offline. Setting the count to 0 eliminates this attack surface at the cost of requiring DC connectivity for logon.

## Impact

- ✅ Eliminates DCC2 hash extraction and offline cracking
- ✅ Removes credential persistence on compromised endpoints
- ⚠️ Users CANNOT log on if DC is unreachable (laptops on travel, branch offices)
- ⚠️ Set to 1-4 for laptop users who travel to maintain usability
- ℹ️ Consider setting to 1 for managed laptops as a compromise

## Use Cases

- Always-connected desktops and workstations
- Servers that never operate offline
- Highly privileged admin workstations
- Kiosk / shared workstations

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| OS Credential Dumping: Cached Domain Credentials | T1003.005 | Credential Access |
| Brute Force: Password Cracking | T1110.002 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 2.3.7.6 (L2)
- **DISA STIG:** WN11-SO-000020
- **NIST SP 800-171:** 3.5.10

## Test Status

✔ Tested on Windows 11 24H2
✔ Verified DCC2 extraction fails when count=0
