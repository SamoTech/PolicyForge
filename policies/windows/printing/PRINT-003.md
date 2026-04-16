# PRINT-003 — Disable Print Spooler Remote RPC Connections

**ID:** PRINT-003  
**Category:** Printing / RPC Hardening  
**Risk Level:** 🔴 Critical  
**OS:** Windows Vista+, Windows 11, Windows Server 2008+  
**Source:** Microsoft PrintNightmare mitigation · CVE-2021-34527 workaround · Windows 11 24H2 ADMX

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Printers
            └─ Allow Print Spooler to accept client connections
                 └─ Disabled
```

## Registry

```
Key:   HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Printers
Value: RegisterSpoolerRemoteRpcEndPoint
Type:  DWORD
Data:  2  (1=enabled, 2=disabled)
```

## PowerShell

```powershell
# Disable Spooler remote RPC endpoint
$printerPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\Printers"
If (-not (Test-Path $printerPath)) { New-Item -Path $printerPath -Force }
Set-ItemProperty -Path $printerPath -Name "RegisterSpoolerRemoteRpcEndPoint" -Value 2 -Type DWord

# Restart Spooler to apply
Restart-Service Spooler -Force

# Verify — remote print connections should now fail
Get-ItemProperty -Path $printerPath -Name RegisterSpoolerRemoteRpcEndPoint
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Printers/ConfigurePrintSpoolerToAcceptClientConnections
Type:    Integer
Value:   2
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Printers]
"RegisterSpoolerRemoteRpcEndPoint"=dword:00000002
```

## Description

This policy blocks the Print Spooler from accepting inbound remote RPC connections, while still allowing the machine to use local printing. This is the recommended middle-ground mitigation for workstations that need local printing but should not accept print jobs from remote clients — it blocks the network-facing PrintNightmare exploitation vector while preserving local print functionality. Combined with PRINT-001 (disable Spooler) for servers/DCs, this covers both scenarios.

## Impact

- ✅ Blocks remote exploitation of Print Spooler RPC (PrintNightmare network vector)
- ✅ Blocks PrinterBug / SpoolSample NTLM coercion via RPC
- ✅ Local printing continues to function normally
- ⚠️ Machine cannot act as a print server (share printers to other clients)
- ⚠️ Remote print queue management tools may fail

## Use Cases

- Workstations that need local printing but not remote print sharing
- Member servers that are not print servers
- High-security endpoints where PRINT-001 (full disable) is too restrictive

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation for Privilege Escalation | T1068 | Privilege Escalation |
| Forced Authentication | T1187 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.7.3 (L1)
- **DISA STIG:** WN11-CC-000315
- **Microsoft Advisory:** CVE-2021-34527 workaround option 2

## Test Status

✔ Tested on Windows 11 24H2 — local printing works, remote RPC blocked
✔ Tested on Windows 10 22H2
✔ Verified SpoolSample.exe fails (Access Denied on RPC endpoint)
