# WIN-SECURITY-017 — Disable Print Spooler (Non-Print Servers)

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-017 |
| **Category** | Attack Surface Reduction |
| **Risk Level** | 🔴 Critical |
| **OS** | Windows 10, 11, Server 2016+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L2 — 5.29 |
| **DISA STIG** | WN10-00-000175 (Servers) |

---

## Policy Path

```
Computer Configuration > Windows Settings > Security Settings
> System Services > Print Spooler > Startup: Disabled
```

## Registry

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Spooler]
"Start"=dword:00000004
```

> Start values: 2=Automatic, 3=Manual, 4=Disabled

## PowerShell

```powershell
# Disable Print Spooler
Stop-Service -Name Spooler -Force
Set-Service -Name Spooler -StartupType Disabled

# Verify
Get-Service Spooler | Select-Object Name, Status, StartType

# Block remote printing (if you need local printing but not remote)
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\Printers' `
  -Name 'RegisterSpoolerRemoteRpcEndPoint' -Value 2
```

## Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Connectivity/DisallowNetworkConnectivityActiveTests
Data Type: Integer
Value: 1

# Direct service disable via PowerShell script in Intune:
# Remediation script: Stop-Service Spooler -Force; Set-Service Spooler -StartupType Disabled
```

## Description

The Windows Print Spooler service (Spooler) is responsible for managing print jobs. It has a long history of critical vulnerabilities including PrintNightmare (CVE-2021-34527) and SpoolFool (CVE-2022-21999). On non-print servers and workstations that don't print, it should be disabled entirely.

## Impact

- ✅ Full mitigation of PrintNightmare and related Spooler CVEs
- ✅ Eliminates a persistent lateral movement vector on servers
- ❌ **Breaks local and network printing** — only apply to servers and workstations that don't print
- ⚠️ Alternative for workstations that print: block *remote* Spooler RPC instead

## Use Cases

- **Domain Controllers** — never need Print Spooler (critical to disable)
- **File/Application servers** without printing role
- **Admin workstations / PAWs** — no printing needed
- Workstations: consider blocking remote RPC instead of full disable

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| Exploit Public-Facing Application | T1190 | PrintNightmare exploits Spooler RPC endpoint |
| Exploitation for Privilege Escalation | T1068 | SpoolFool, PrintNightmare local PE via Spooler |
| Lateral Movement via Print Spooler | T1021 | Spooler used for lateral movement in NTLM relay chains |

## CVEs Mitigated

| CVE | Name | CVSS |
|---|---|---|
| CVE-2021-34527 | PrintNightmare | 8.8 |
| CVE-2021-1675 | Windows Print Spooler RCE | 7.8 |
| CVE-2022-21999 | SpoolFool LPE | 7.8 |
| CVE-2022-38028 | Windows Print Spooler EoP | 7.8 |

## References

- [PrintNightmare Advisory](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-34527)
- [Microsoft Guidance on Print Spooler](https://learn.microsoft.com/en-us/troubleshoot/windows-server/printing/spooler-service-not-started)
