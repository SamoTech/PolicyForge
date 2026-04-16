# PRINT-002 — Restrict Point and Print to Approved Servers Only

**ID:** PRINT-002  
**Category:** Printing / Point-and-Print Hardening  
**Risk Level:** 🔴 Critical  
**OS:** Windows XP+, Windows 11, Windows Server 2003+  
**Source:** Microsoft KB5005010 · PrintNightmare mitigation guidance · [support.microsoft.com](https://support.microsoft.com/en-us/topic/kb5005010-5d745a8e-a82e-45c8-b9c7-46d8d4c51a93)

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Printers
            └─ Point and Print Restrictions
                 ├─ Enabled
                 ├─ Users can only point and print to these servers: \\printserver.domain.com
                 ├─ Security Prompts: Show warning and elevation prompt (both options)
                 └─ Check: When installing drivers for a new connection: Show warning and elevation prompt
```

## Registry

```
Key:   HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Printers\PointAndPrint
Value: Restricted
Type:  DWORD
Data:  1

Value: TrustedServers
Type:  DWORD
Data:  1

Value: ServerList
Type:  REG_SZ
Data:  printserver1.domain.com;printserver2.domain.com

Value: NoWarningNoElevationOnInstall
Type:  DWORD
Data:  0  (must be 0 per KB5005010)

Value: UpdatePromptSettings
Type:  DWORD
Data:  0  (must be 0 per KB5005010)
```

## PowerShell

```powershell
# Configure Point and Print restrictions
$pnpPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\Printers\PointAndPrint"
If (-not (Test-Path $pnpPath)) { New-Item -Path $pnpPath -Force }

Set-ItemProperty -Path $pnpPath -Name "Restricted" -Value 1 -Type DWord
Set-ItemProperty -Path $pnpPath -Name "TrustedServers" -Value 1 -Type DWord
Set-ItemProperty -Path $pnpPath -Name "ServerList" -Value "printserver.domain.com" -Type String
Set-ItemProperty -Path $pnpPath -Name "NoWarningNoElevationOnInstall" -Value 0 -Type DWord
Set-ItemProperty -Path $pnpPath -Name "UpdatePromptSettings" -Value 0 -Type DWord

# Verify
Get-ItemProperty -Path $pnpPath
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Printers/PointAndPrintRestrictions
Type:    String
Value:   <enabled/><data id="PointAndPrint_TrustedServers_Chk" value="true"/><data id="PointAndPrint_TrustedServers_Edit" value="printserver.domain.com"/>
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Printers\PointAndPrint]
"Restricted"=dword:00000001
"TrustedServers"=dword:00000001
"ServerList"="printserver.domain.com"
"NoWarningNoElevationOnInstall"=dword:00000000
"UpdatePromptSettings"=dword:00000000
```

## Description

Point and Print allows users to install printer drivers from a print server without admin rights. PrintNightmare exploited this to load malicious DLLs as SYSTEM. KB5005010 (August 2021) changed the default behavior to require elevation for driver installation, but explicit GPO configuration is required to restrict which servers are trusted and ensure elevation prompts appear. Setting `NoWarningNoElevationOnInstall=0` is mandatory — setting it to 1 re-opens the PrintNightmare vector.

## Impact

- ✅ Restricts driver installation to approved print servers only
- ✅ Requires elevation for driver install/update (breaks silent malicious DLL loading)
- ✅ Mitigates PrintNightmare exploitation via Point and Print
- ⚠️ Users cannot add printers from unapproved servers without admin intervention
- ⚠️ Requires maintaining the approved server list as infrastructure changes

## Use Cases

- Environments with managed print servers
- Workstations where Spooler cannot be fully disabled (PRINT-001)
- Hybrid environments where printing is required on some machines

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation for Privilege Escalation | T1068 | Privilege Escalation |
| Hijack Execution Flow: DLL Side-Loading | T1574.002 | Persistence |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.7.1 (L1)
- **DISA STIG:** WN11-CC-000310
- **Microsoft KB:** KB5005010 (mandatory Point and Print hardening)

## Test Status

✔ Tested on Windows 11 24H2
✔ Tested on Windows 10 22H2
✔ Verified elevation prompt appears for driver install from untrusted server
