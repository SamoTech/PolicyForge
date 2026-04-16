# WIN-SECURITY-019 — Protect Event Logs (Size + Retention + Permissions)

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-019 |
| **Category** | Audit & Logging |
| **Risk Level** | 🟠 High |
| **OS** | Windows 10, 11, Server 2016+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L1 — 18.9.26.1.1, 18.9.26.1.2 |
| **DISA STIG** | WN10-AU-000500, WN10-AU-000505, WN10-AU-000510 |

---

## Policy Paths

```
Computer Configuration > Administrative Templates
> Windows Components > Event Log Service > Application
> Specify the maximum log file size (KB): 32768

Computer Configuration > Administrative Templates
> Windows Components > Event Log Service > Security
> Specify the maximum log file size (KB): 196608

Computer Configuration > Administrative Templates
> Windows Components > Event Log Service > System
> Specify the maximum log file size (KB): 32768
```

## Registry

```reg
Windows Registry Editor Version 5.00

; Application Log — 32MB
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\EventLog\Application]
"MaxSize"=dword:00008000

; Security Log — 192MB (critical — high volume)
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\EventLog\Security]
"MaxSize"=dword:00030000
"Retention"=dword:00000000

; System Log — 32MB
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\EventLog\System]
"MaxSize"=dword:00008000
```

## PowerShell

```powershell
# Set log sizes
Limit-EventLog -LogName Application -MaximumSize 32MB
Limit-EventLog -LogName Security   -MaximumSize 196MB
Limit-EventLog -LogName System     -MaximumSize 32MB

# Set retention to overwrite as needed (no data loss)
Limit-EventLog -LogName Security -OverflowAction OverwriteAsNeeded

# Verify
Get-EventLog -List | Where-Object {$_.Log -in 'Application','Security','System'} |
  Select-Object Log, MaximumKilobytes, OverflowAction

# Protect logs from guest/anonymous access
$sd = "O:BAG:SYD:(A;;0x2;;;SY)(A;;0x2;;;BA)(A;;0x1;;;ER)"
wevtutil sl Security /ca:$sd
```

## Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/EventLogService/SpecifyMaximumFileSizeSecurityLog
Data Type: Integer
Value: 196608

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/EventLogService/SpecifyMaximumFileSizeApplicationLog
Data Type: Integer
Value: 32768

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/EventLogService/SpecifyMaximumFileSizeSystemLog
Data Type: Integer
Value: 32768
```

## Description

Insufficient event log sizes allow attackers to overwrite forensic evidence. Default Windows log sizes (20MB Security, 512KB Application) are far too small for enterprise environments and active Directory environments. Increasing sizes and protecting permissions ensures incident response teams have the data they need.

## Impact

- ✅ Preserves forensic evidence for incident response
- ✅ Meets SIEM data retention requirements
- ✅ Prevents log overwrite by high-volume events (authentication storms)
- ⚠️ Increased disk usage — minimal (~230MB total for all three logs)
- ⚠️ Very high-activity systems (DCs) may need even larger Security logs (512MB+)

## Use Cases

- All enterprise endpoints (universal)
- SIEM-connected environments — ensure sufficient local buffer before forwarding
- Domain Controllers — Security log should be 512MB+
- Incident Response readiness — standard pre-deployment hardening

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| Indicator Removal: Clear Windows Event Logs | T1070.001 | Large logs + permissions make clearing harder to hide |
| Impair Defenses: Disable Windows Event Logging | T1562.002 | Log size protection ensures continuity of evidence |

## References

- [CIS Benchmark — Event Log Settings](https://www.cisecurity.org/cis-benchmarks)
- [Microsoft Event Log Best Practices](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/wevtutil)
- [NSA Event Logging Guidance](https://media.defense.gov/2022/Jun/13/2003018530/-1/-1/0/CSI_EMBRACING_ZT_SECURITY_MODEL_UOO115131-22.PDF)
