# CRED-004 — Enable Windows Defender Credential Guard

**ID:** CRED-004  
**Category:** Credential Hardening / Virtualization-Based Security  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10 Enterprise 1511+, Windows 11 Enterprise, Windows Server 2016+  
**Source:** Microsoft Security Baseline Windows 11 25H2 · [learn.microsoft.com/credential-guard](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/)

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ System
            └─ Device Guard
                 └─ Turn On Virtualization Based Security
                      └─ Credential Guard Configuration: Enabled with UEFI lock
```

## Registry

```
Key:   HKLM\SOFTWARE\Policies\Microsoft\Windows\DeviceGuard
Value: EnableVirtualizationBasedSecurity
Type:  DWORD
Data:  1

Value: RequirePlatformSecurityFeatures
Type:  DWORD
Data:  3  (1=Secure Boot, 2=DMA protection, 3=both)

Value: LsaCfgFlags
Type:  DWORD
Data:  1  (1=enabled with UEFI lock, 2=enabled without lock)
```

## PowerShell

```powershell
# Check VBS / Credential Guard status
Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root/Microsoft/Windows/DeviceGuard |
    Select SecurityServicesRunning, SecurityServicesConfigured, VirtualizationBasedSecurityStatus

# SecurityServicesRunning: 1=Credential Guard, 2=HVCI
# VirtualizationBasedSecurityStatus: 2=Running

# Check via msinfo32 (GUI)
Start-Process msinfo32 -Wait
# Navigate to: System Summary > Virtualization-based security
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/DeviceGuard/EnableVirtualizationBasedSecurity
Type:    Integer
Value:   1

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/DeviceGuard/LsaCfgFlags
Type:    Integer
Value:   1
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\DeviceGuard]
"EnableVirtualizationBasedSecurity"=dword:00000001
"RequirePlatformSecurityFeatures"=dword:00000003
"LsaCfgFlags"=dword:00000001
```

## Description

Credential Guard uses Virtualization-Based Security (VBS) to isolate NTLM password hashes, Kerberos Ticket Granting Tickets, and application credentials in a Hyper-V protected container. Even with SYSTEM-level access, attackers cannot extract these credentials — they exist only in the secure world (VSM). This defeats Pass-the-Hash, Pass-the-Ticket, and Overpass-the-Hash attacks. Enabled by default on new Windows 11 Enterprise devices meeting hardware requirements.

## Impact

- ✅ Defeats Pass-the-Hash using NTLM hashes
- ✅ Defeats Pass-the-Ticket (Kerberos TGT isolation)
- ✅ Protects domain credentials even against SYSTEM-level attackers
- ⚠️ Requires UEFI, Secure Boot, 64-bit CPU with virtualization extensions
- ⚠️ Incompatible with some nested virtualization scenarios (VMware Workstation)
- ⚠️ Some third-party credential providers may not function
- ⚠️ Digest and NTLMv1 authentication is blocked when enabled

## Use Cases

- Enterprise endpoints with domain-joined accounts
- Privileged Access Workstations (PAW)
- Tier-0 admin devices
- Environments with high-value domain accounts

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Pass the Hash | T1550.002 | Lateral Movement |
| Pass the Ticket | T1550.003 | Lateral Movement |
| OS Credential Dumping: LSASS | T1003.001 | Credential Access |
| Steal or Forge Kerberos Tickets | T1558 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.9.20.1 (L2 + BitLocker)
- **DISA STIG:** WN11-CC-000190
- **NIST SP 800-171:** 3.5.5, 3.13.16
- **Microsoft Security Baseline:** Windows 11 25H2 (default on qualifying hardware)

## Test Status

✔ Tested on Windows 11 24H2 Enterprise (Build 26100) — VBS confirmed running
✔ Verified Mimikatz sekurlsa::logonpasswords returns hashes as 0000... (protected)
✔ Tested on Windows Server 2022 (Datacenter edition)
