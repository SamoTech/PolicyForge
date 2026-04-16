---
id: WIN-SECURITY-006
name: Enable Windows Defender Credential Guard
category: [Security, Credential Protection, Virtualization]
risk_level: High
applies_to: [Windows 10 Enterprise 1607+, Windows 11 Enterprise, Windows Server 2016+]
test_status: "✅ Tested on Windows 11 24H2 Enterprise, Server 2022"
---

# Enable Windows Defender Credential Guard

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── System
              └── Device Guard
                    └── Turn On Virtualization Based Security
                          └── Credential Guard Configuration: Enabled with UEFI lock
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\DeviceGuard` | `EnableVirtualizationBasedSecurity` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows\DeviceGuard` | `LsaCfgFlags` | `1` | REG_DWORD |

> `LsaCfgFlags`: 0 = Disabled, 1 = Enabled with UEFI lock, 2 = Enabled without lock

## Description

Credential Guard uses Virtualization Based Security (VBS) to isolate LSA secrets in a protected container inaccessible to the OS kernel. Directly prevents **Pass-the-Hash**, **Pass-the-Ticket**, and **mimikatz**-style credential extraction.

## Impact

- Requires UEFI Secure Boot + TPM 2.0 recommended
- Not available on Home/Pro editions
- Cannot be easily disabled once enabled with UEFI lock

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeviceGuard"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "EnableVirtualizationBasedSecurity" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $path -Name "LsaCfgFlags" -Value 1 -Type DWord -Force

Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard |
  Select-Object SecurityServicesRunning, VirtualizationBasedSecurityStatus
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/DeviceGuard/EnableVirtualizationBasedSecurity
Value: 1

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/DeviceGuard/LsaCfgFlags
Value: 1
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | OS Credential Dumping: LSASS Memory |
| [T1550.002](https://attack.mitre.org/techniques/T1550/002/) | Pass the Hash |
| [T1558](https://attack.mitre.org/techniques/T1558/) | Steal or Forge Kerberos Tickets |

## Compliance References

- **DISA STIG**: WN10-00-000070
- **CIS Benchmark**: Level 2, Control 18.8.5.1
- **CMMC**: AC.2.006, IA.3.083
