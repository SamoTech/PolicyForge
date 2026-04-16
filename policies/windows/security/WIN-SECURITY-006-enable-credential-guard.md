---
id: WIN-SECURITY-006
name: Enable Windows Defender Credential Guard
category: [Security, Credential Protection, Virtualization]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows 10 1607+, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 21H2+, Windows 11 24H2"
---

# Enable Windows Defender Credential Guard

> 🔴 **Risk Level: High** — Without Credential Guard, LSASS stores credentials in cleartext-accessible memory. Credential Guard isolates them in a hardware-backed secure enclave, blocking mimikatz-style attacks.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── System
              └── Device Guard
                    └── Turn On Virtualization Based Security
                          ├── Select Platform Security Level: Secure Boot and DMA Protection
                          └── Credential Guard Configuration: Enabled with UEFI lock
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard` | `EnableVirtualizationBasedSecurity` | `1` | REG_DWORD |
| `HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard` | `RequirePlatformSecurityFeatures` | `3` | REG_DWORD |
| `HKLM\SYSTEM\CurrentControlSet\Control\Lsa` | `LsaCfgFlags` | `1` | REG_DWORD |

## Description

Windows Defender Credential Guard uses Virtualization Based Security (VBS) to isolate credential secrets (NTLM hashes, Kerberos tickets) in a protected container inaccessible to the main OS kernel. This defeats pass-the-hash, pass-the-ticket, and credential dumping tools like Mimikatz that rely on reading LSASS memory. Requires UEFI Secure Boot and hardware virtualization support (Intel VT-x / AMD-V).

## PowerShell

```powershell
# Enable Credential Guard via registry
$dgPath = "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard"
$lsaPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"

Set-ItemProperty -Path $dgPath -Name "EnableVirtualizationBasedSecurity" -Value 1 -Type DWord
Set-ItemProperty -Path $dgPath -Name "RequirePlatformSecurityFeatures" -Value 3 -Type DWord
Set-ItemProperty -Path $lsaPath -Name "LsaCfgFlags" -Value 1 -Type DWord

Write-Output "Credential Guard enabled. Reboot required."

# Verify after reboot
Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard |
    Select-Object SecurityServicesRunning
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/DeviceGuard/EnableVirtualizationBasedSecurity` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Blocks pass-the-hash and pass-the-ticket attacks
- ✅ Defeats Mimikatz credential dumping from LSASS
- ✅ Protects Kerberos TGTs from extraction
- ⚠️ Requires hardware virtualization — incompatible with nested VMs on Hyper-V hosts
- ⚠️ Some older drivers may be incompatible with VBS — test before broad deployment
- ⚠️ UEFI lock (`LsaCfgFlags=1`) makes disabling require physical access to BIOS
- ℹ️ A reboot is required after enabling

## Use Cases

- **Active Directory environments** — critical protection against Kerberoasting and pass-the-hash
- **Privileged access workstations (PAWs)** — mandatory on admin workstations
- **Post-breach hardening** — deploy immediately after any credential theft incident
- **High-security environments** — financial, government, healthcare endpoints
- **Zero trust architecture** — device identity depends on uncorrupted credential chain

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | OS Credential Dumping: LSASS Memory |
| [T1550.002](https://attack.mitre.org/techniques/T1550/002/) | Use Alternate Authentication Material: Pass the Hash |
| [T1550.003](https://attack.mitre.org/techniques/T1550/003/) | Use Alternate Authentication Material: Pass the Ticket |

## Compliance References

- **CIS Benchmark**: Level 2, Control 18.8.5.5
- **DISA STIG**: WN10-00-000070
- **NIST SP 800-171**: 3.13.16
- **Microsoft Security Baseline**: Windows 11 — enabled by default on capable hardware

## Test Status

✅ Tested on Windows 10 21H2+, Windows 11 24H2
