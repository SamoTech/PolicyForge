# CRED-003 — Enable LSA Protection (RunAsPPL)

**ID:** CRED-003  
**Category:** Credential Hardening / LSASS Protection  
**Risk Level:** 🔴 Critical  
**OS:** Windows 8.1+, Windows 11, Windows Server 2012 R2+  
**Source:** Microsoft Security Baseline Windows 11 25H2 · [techcommunity.microsoft.com](https://techcommunity.microsoft.com/blog/microsoft-security-baselines/windows-11-version-25h2-security-baseline/4456231)

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ System
            └─ Local Security Authority
                 └─ Configures LSASS to run as a protected process
```

## Registry

```
Key:   HKLM\SYSTEM\CurrentControlSet\Control\Lsa
Value: RunAsPPL
Type:  DWORD
Data:  1  (1=PPL, 2=PPLite on Windows 11 22H2+)

Value: RunAsPPLBoot
Type:  DWORD
Data:  1  (UEFI-locked, prevents offline modification)
```

## PowerShell

```powershell
# Enable LSA PPL via registry
$lsaPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $lsaPath -Name "RunAsPPL" -Value 1 -Type DWord
Set-ItemProperty -Path $lsaPath -Name "RunAsPPLBoot" -Value 1 -Type DWord

# Verify (requires reboot to take effect)
Get-ItemProperty -Path $lsaPath | Select RunAsPPL, RunAsPPLBoot

# Check if PPL is active
$wmiLsa = Get-WmiObject -Namespace root/cimv2 -Class Win32_Process -Filter "Name='lsass.exe'"
Write-Host "LSASS PID: $($wmiLsa.ProcessId)"
# Verify in Task Manager: lsass.exe should show 'Protected Process Light'
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalSecurityAuthority/ConfigureLsaProtectedProcess
Type:    Integer
Value:   1  (1=Enabled with UEFI lock, 2=Enabled without UEFI lock)
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa]
"RunAsPPL"=dword:00000001
"RunAsPPLBoot"=dword:00000001
```

## Description

LSA Protection (Protected Process Light — PPL) prevents untrusted processes from reading LSASS memory. When enabled, LSASS runs as a protected process, and only code-signed Microsoft drivers/processes can access it. This directly defeats Mimikatz `sekurlsa::logonpasswords` and most LSASS-targeting credential dumpers unless they bypass PPL with a kernel driver (e.g., PPLKiller). Windows 11 22H2+ introduces "PPLite" (value=2) for even stronger protection without UEFI dependency.

## Impact

- ✅ Defeats usermode credential dumpers (Mimikatz, ProcDump on LSASS)
- ✅ Blocks OpenProcess() calls to LSASS from non-PPL processes
- ⚠️ Some third-party AV/EDR products may fail to inject into LSASS (verify compatibility)
- ⚠️ Requires reboot to take effect
- ⚠️ RunAsPPLBoot requires UEFI Secure Boot — do not set on systems without UEFI

## Use Cases

- All modern enterprise endpoints (Windows 10 1703+)
- High-value targets (executive devices, admin workstations, PAW)
- Post-incident hardening after credential theft
- Environments with active red team engagements

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| OS Credential Dumping: LSASS Memory | T1003.001 | Credential Access |
| OS Credential Dumping | T1003 | Credential Access |
| Exploitation for Credential Access | T1212 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 2.3.11.3 (L1)
- **DISA STIG:** WN11-SO-000130
- **NIST SP 800-171:** 3.5.5
- **Microsoft Security Baseline:** Windows 11 25H2 (required, UEFI lock enabled)

## Test Status

✔ Tested on Windows 11 24H2 (Build 26100) — PPL confirmed in Task Manager
✔ Tested on Windows 11 25H2 — PPLite (value=2) verified
✔ Verified Mimikatz sekurlsa::logonpasswords blocked (Access Denied)
