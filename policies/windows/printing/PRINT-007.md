# PRINT-007 — Disable Web-Based Printing (Internet Printing)

**ID:** PRINT-007  
**Category:** Printing / Attack Surface Reduction  
**Risk Level:** 🟡 Low  
**OS:** Windows XP+, Windows 11, Windows Server 2003+  
**Source:** CIS Benchmark Windows 11 v3.0 · Microsoft Security Baseline

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ System
            └─ Internet Communication Management
                 └─ Internet Communication settings
                      └─ Turn off Internet download for Web publishing and online ordering wizards
                           └─ Enabled

; Also:
Computer Configuration
  └─ Administrative Templates
       └─ Printers
            └─ Turn off Windows Internet printing
                 └─ Enabled
```

## Registry

```
Key:   HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Printers
Value: DisableWebPrinting
Type:  DWORD
Data:  1

Key:   HKLM\SOFTWARE\Policies\Microsoft\Windows\Internet Connection Wizard
Value: ExitOnMSICW
Type:  DWORD
Data:  1
```

## PowerShell

```powershell
# Disable web-based printing
$printerPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\Printers"
If (-not (Test-Path $printerPath)) { New-Item -Path $printerPath -Force }
Set-ItemProperty -Path $printerPath -Name "DisableWebPrinting" -Value 1 -Type DWord

# Verify
Get-ItemProperty -Path $printerPath -Name DisableWebPrinting
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Printers/TurnOffWindowsInternetPrinting
Type:    Integer
Value:   1
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Printers]
"DisableWebPrinting"=dword:00000001
```

## Description

Disables the Windows Internet Printing Protocol (IPP over HTTP/HTTPS) which allows printing to internet-connected printers. Reduces attack surface by preventing outbound HTTP printing connections and eliminating a browser-accessible print management interface that has historically had vulnerabilities.

## Impact

- ✅ Eliminates HTTP/HTTPS printing attack surface
- ✅ Reduces outbound printing-related network connections
- ⚠️ Users cannot print to internet/cloud printers via IPP
- ℹ️ Most enterprise environments use print servers, not web printing

## Use Cases

- Enterprise environments using internal print servers
- High-security environments with strict outbound filtering
- Environments with no legitimate need for internet printing

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation of Remote Services | T1210 | Lateral Movement |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.7.7 (L2)
- **DISA STIG:** WN11-CC-000295

## Test Status

✔ Tested on Windows 11 24H2
