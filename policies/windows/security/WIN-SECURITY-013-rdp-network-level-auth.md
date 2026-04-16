# WIN-SECURITY-013 — Require NLA for Remote Desktop

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-013 |
| **Category** | Remote Access |
| **Risk Level** | 🔴 Critical |
| **OS** | Windows 10, 11, Server 2016+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L1 — 18.10.56.2.2 |
| **DISA STIG** | WN10-CC-000070 |

---

## Policy Path

```
Computer Configuration > Administrative Templates
> Windows Components > Remote Desktop Services
> Remote Desktop Session Host > Security
> Require user authentication for remote connections by using NLA
```

## Registry

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp]
"UserAuthentication"=dword:00000001

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services]
"UserAuthentication"=dword:00000001
"SecurityLayer"=dword:00000002
```

## PowerShell

```powershell
# Enable NLA
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' `
  -Name 'UserAuthentication' -Value 1

Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services' `
  -Name 'UserAuthentication' -Value 1

# Set encryption level to High
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services' `
  -Name 'MinEncryptionLevel' -Value 3

# Verify
(Get-WmiObject -Class Win32_TSGeneralSetting -Namespace root\cimv2\terminalservices).UserAuthenticationRequired
```

## Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/RequireSecureRPCCommunication
Data Type: Integer
Value: 1

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/ClientConnectionEncryptionLevel
Data Type: Integer
Value: 3
```

## Description

Network Level Authentication (NLA) requires users to authenticate **before** a full RDP session is established. Without NLA, the Windows login screen is exposed to unauthenticated network attackers, enabling brute-force and BlueKeep-style pre-auth vulnerabilities.

## Impact

- ✅ Eliminates pre-authentication RDP attack surface
- ✅ Blocks BlueKeep (CVE-2019-0708) exploitation vector
- ✅ Reduces RDP memory exposure to unauthenticated clients
- ⚠️ Older RDP clients (pre-Vista) cannot connect — not a concern in modern environments
- ⚠️ Some legacy embedded systems may not support NLA

## Use Cases

- All internet-exposed RDP endpoints (critical)
- Jump servers / bastion hosts
- Domain controllers with RDP enabled
- Any system in a PCI-DSS, HIPAA, or SOC 2 scope

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| Remote Services: Remote Desktop Protocol | T1021.001 | NLA enforces auth before session — limits exposure |
| Exploit Public-Facing Application | T1190 | Mitigates pre-auth RDP exploits (BlueKeep, DejaBlue) |
| Brute Force | T1110 | NLA reduces brute-force surface to credential exchange only |

## References

- [CVE-2019-0708 BlueKeep](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2019-0708)
- [Microsoft NLA Documentation](https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/clients/remote-desktop-allow-access)
