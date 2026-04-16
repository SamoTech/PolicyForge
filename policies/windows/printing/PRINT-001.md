# PRINT-001 — Disable Windows Print Spooler Service (Where Not Needed)

**ID:** PRINT-001  
**Category:** Printing / Spooler Hardening  
**Risk Level:** 🔴 Critical  
**OS:** Windows XP+, Windows 11, Windows Server 2003+  
**Source:** Microsoft Security Advisory CVE-2021-34527 (PrintNightmare) · [msrc.microsoft.com](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-34527)

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ System Services
                 └─ Print Spooler → Disabled
```

## Registry

```
Key:   HKLM\SYSTEM\CurrentControlSet\Services\Spooler
Value: Start
Type:  DWORD
Data:  4  (2=Auto, 3=Manual, 4=Disabled)
```

## PowerShell

```powershell
# Disable Print Spooler service immediately and at startup
Stop-Service -Name Spooler -Force
Set-Service -Name Spooler -StartupType Disabled

# Verify
Get-Service -Name Spooler | Select Name, Status, StartType

# Check if any processes still depend on spooler
Get-WmiObject Win32_DependentService | Where-Object { $_.Antecedent -like "*Spooler*" }
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/SystemServices/ConfigureSpoolerServiceStartupMode
Type:    Integer
Value:   4  (4=Disabled)

# Or via PowerShell remediation script in Intune
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Spooler]
"Start"=dword:00000004
```

## Description

The Windows Print Spooler service (spoolsv.exe) was the target of **PrintNightmare** (CVE-2021-34527) and **PrinterBug** (SpoolSample), two critical vulnerabilities enabling remote code execution and NTLM coercion. Disabling the Spooler on machines that do not need printing (Domain Controllers, servers, admin workstations) is the definitive mitigation. Microsoft explicitly recommends disabling the Spooler on all Domain Controllers.

## Impact

- ✅ Fully mitigates PrintNightmare (CVE-2021-34527, CVE-2021-1675)
- ✅ Eliminates PrinterBug NTLM coercion vector
- ✅ Removes attack surface from future spooler vulnerabilities
- ⚠️ Machine cannot print (local or network) while Spooler is disabled
- ⚠️ Breaks Fax service if enabled
- ℹ️ Apply to: Domain Controllers, servers, admin workstations, kiosk devices

## Use Cases

- All Domain Controllers (Microsoft explicit recommendation)
- Servers without printing requirements
- Admin/PAW workstations
- Kiosk / lockdown devices
- Any machine that has never printed

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation for Privilege Escalation | T1068 | Privilege Escalation |
| Forced Authentication | T1187 | Credential Access |
| Remote Services | T1021 | Lateral Movement |

## Compliance References

- **CIS Benchmark:** Windows Server 2022 v2.0 — 5.29 (L1 for DCs)
- **DISA STIG:** WN22-MS-000070
- **Microsoft Advisory:** CVE-2021-34527 — disable Spooler on DCs
- **NSA Guidance:** Mitigating PrintNightmare (July 2021)

## Test Status

✔ Tested on Windows Server 2022 (DC role) — Spooler disabled, no printing impact
✔ Tested on Windows 11 24H2 admin workstation
✔ Verified PrintNightmare PoC fails when Spooler disabled
