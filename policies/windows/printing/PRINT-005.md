# PRINT-005 — Enable Print Spooler Sandbox (Isolation Mode)

**ID:** PRINT-005  
**Category:** Printing / Spooler Isolation  
**Risk Level:** 🟠 Medium  
**OS:** Windows 11 22H2+ (KB5022913), Windows Server 2022 with updates  
**Source:** Windows 11 24H2 ADMX new settings · [4sysops.com](https://4sysops.com/archives/windows-11-24h2-group-policy-81-new-settings-for-smb-updates-printing-defender-and-more/)

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Printers
            └─ Configure Print Spooler Sandbox Mode
                 └─ Enabled → Printer Drivers are run in an isolated process
```

## Registry

```
Key:   HKLM\SYSTEM\CurrentControlSet\Control\Print
Value: SpoolerSeparation
Type:  DWORD
Data:  1  (0=no isolation, 1=isolation enabled)
```

## PowerShell

```powershell
# Enable Spooler sandbox/isolation
$printPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Print"
Set-ItemProperty -Path $printPath -Name "SpoolerSeparation" -Value 1 -Type DWord

# Restart Spooler to apply isolation
Restart-Service Spooler -Force

# Verify
Get-ItemProperty -Path $printPath -Name SpoolerSeparation
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Printers/ConfigureSpoolerSandboxMode
Type:    Integer
Value:   1
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Print]
"SpoolerSeparation"=dword:00000001
```

## Description

New in Windows 11 22H2 (KB5022913) and surfaced in the 24H2 ADMX templates — runs printer drivers in an isolated process separate from spoolsv.exe (SYSTEM). If a printer driver is exploited, the compromise is contained to the isolated process rather than escalating to SYSTEM. This is a defense-in-depth control complementing PRINT-001 through PRINT-004.

## Impact

- ✅ Contains printer driver exploits to isolated process (not SYSTEM)
- ✅ Defense-in-depth against future unknown spooler vulnerabilities
- ⚠️ Slight increase in memory usage per printer driver loaded
- ⚠️ Some legacy drivers may not function correctly in isolation mode
- ℹ️ Test with all installed printers before enforcing in production

## Use Cases

- Workstations that require printing and cannot disable the Spooler
- Environments with many printer drivers installed
- Defense-in-depth layering on top of PRINT-002/003/004

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation for Privilege Escalation | T1068 | Privilege Escalation |

## Compliance References

- **Microsoft Security Baseline:** Windows 11 24H2 (new recommended setting)
- **CIS Benchmark:** Windows 11 v3.0 (L2 — pending official mapping)

## Test Status

✔ Tested on Windows 11 24H2 (Build 26100) — isolation confirmed via Process Explorer
✔ Canon + HP drivers tested — functional
⬜ Legacy PCL5 drivers — compatibility validation pending
