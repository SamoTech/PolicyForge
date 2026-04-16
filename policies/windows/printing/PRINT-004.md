# PRINT-004 — Disable Print Driver Installation by Non-Admins

**ID:** PRINT-004  
**Category:** Printing / Driver Security  
**Risk Level:** 🟠 Medium  
**OS:** Windows XP+, Windows 11, Windows Server 2003+  
**Source:** Microsoft KB5005652 · CIS Benchmark Windows 11 v3.0

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Local Policies
                 └─ Security Options
                      └─ Devices: Prevent users from installing printer drivers
                           └─ Enabled
```

## Registry

```
Key:   HKLM\SYSTEM\CurrentControlSet\Control\Print\Providers\LanMan Print Services\Servers
Value: AddPrinterDrivers
Type:  DWORD
Data:  1  (1=admins only, 0=any user)
```

## PowerShell

```powershell
# Restrict printer driver installation to admins only
$printPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Print\Providers\LanMan Print Services\Servers"
If (-not (Test-Path $printPath)) { New-Item -Path $printPath -Force }
Set-ItemProperty -Path $printPath -Name "AddPrinterDrivers" -Value 1 -Type DWord

# Verify
Get-ItemProperty -Path $printPath -Name AddPrinterDrivers
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/Devices_PreventUsersFromInstallingPrinterDrivers
Type:    Integer
Value:   1
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Print\Providers\LanMan Print Services\Servers]
"AddPrinterDrivers"=dword:00000001
```

## Description

Prevents non-administrator users from installing printer drivers. Since printer drivers run in the Spooler process (SYSTEM context), malicious drivers can be used to execute arbitrary code as SYSTEM. This is a supporting control for PrintNightmare mitigation — even if an attacker reaches the Point and Print code path, they cannot install a driver without elevation.

## Impact

- ✅ Blocks non-admin users from loading malicious printer drivers
- ✅ Supporting control for PRINT-001 and PRINT-002
- ⚠️ Users cannot self-install new printers without IT assistance
- ℹ️ This is the default behavior since KB5005652 on Windows 10/11

## Use Cases

- All enterprise managed endpoints
- Environments with VDI / shared workstations
- Anywhere standard users should not install hardware drivers

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation for Privilege Escalation | T1068 | Privilege Escalation |
| Hijack Execution Flow: DLL Side-Loading | T1574.002 | Persistence |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 2.3.4.1 (L1)
- **DISA STIG:** WN11-SO-000075
- **Microsoft KB:** KB5005652

## Test Status

✔ Tested on Windows 11 24H2
✔ Verified standard user receives UAC elevation prompt for driver install
