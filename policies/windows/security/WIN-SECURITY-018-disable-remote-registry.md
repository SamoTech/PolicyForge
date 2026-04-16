# WIN-SECURITY-018 — Disable Remote Registry Service

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-018 |
| **Category** | Attack Surface Reduction |
| **Risk Level** | 🟠 High |
| **OS** | Windows 10, 11, Server 2016+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L1 — 5.36 |
| **DISA STIG** | WN10-00-000105 |

---

## Policy Path

```
Computer Configuration > Windows Settings > Security Settings
> System Services > Remote Registry > Startup: Disabled
```

## Registry

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\RemoteRegistry]
"Start"=dword:00000004
```

## PowerShell

```powershell
# Disable Remote Registry
Stop-Service -Name RemoteRegistry -Force
Set-Service -Name RemoteRegistry -StartupType Disabled

# Verify
Get-Service RemoteRegistry | Select-Object Name, Status, StartType

# Restrict registry access via ACL (defence in depth)
$acl = Get-Acl 'HKLM:\SYSTEM\CurrentControlSet\Services'
$acl | Format-List
```

## Intune CSP (OMA-URI)

```
# Deploy via Intune Remediation Script:
# Stop-Service -Name RemoteRegistry -Force
# Set-Service -Name RemoteRegistry -StartupType Disabled
```

## Description

The Remote Registry service allows remote users to modify registry settings on this computer. It is a common target for lateral movement and reconnaissance — attackers use it to read credentials, enumerate installed software, and modify autorun keys remotely.

## Impact

- ✅ Eliminates remote registry access attack vector
- ✅ Blocks many post-exploitation reconnaissance scripts
- ⚠️ Breaks remote management tools that rely on remote registry (e.g., older SCCM features, some monitoring agents)
- ⚠️ Group Policy itself does **not** require Remote Registry — safe to disable in GPO-managed environments

## Use Cases

- All workstations and servers not using legacy remote management tools
- Post-incident hardening
- SOC/IR team: Remote Registry being **enabled** is a threat indicator on workstations

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| Query Registry | T1012 | Attackers use remote registry to enumerate system config |
| Modify Registry | T1112 | Remote registry used to persist via Run keys |
| Lateral Movement | TA0008 | Remote registry is a lateral movement enabler |

## References

- [CIS Benchmark — Disable Remote Registry](https://www.cisecurity.org/cis-benchmarks)
- [Microsoft Remote Registry Service](https://learn.microsoft.com/en-us/windows/win32/sysinfo/registry)
