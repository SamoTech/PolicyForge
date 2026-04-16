---
id: WIN-SECURITY-003
name: Disable LLMNR Protocol
category: [Security, Network, Credential Protection]
risk_level: High
applies_to: [Windows Vista+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable LLMNR Protocol

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Network
              └── DNS Client
                    └── Turn off Multicast Name Resolution
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\Software\Policies\Microsoft\Windows NT\DNSClient` | `EnableMulticast` | `0` | REG_DWORD |

## Description

Link-Local Multicast Name Resolution (LLMNR) is abused by attackers using **Responder** to capture NTLMv2 hashes when a host sends an unanswered LLMNR query. Disabling it forces clients to use DNS exclusively.

## Impact

- Hosts without DNS entries can no longer be resolved via multicast
- No impact in properly configured enterprise DNS environments

## Use Cases

- ✅ Any environment running Active Directory
- ✅ Zero-trust network hardening
- ✅ Compliance: CIS Level 1

## Translations

### Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/MSSLegacy/AllowLLMNR
Data Type: Integer
Value: 0
```

### PowerShell

```powershell
$path = "HKLM:\Software\Policies\Microsoft\Windows NT\DNSClient"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "EnableMulticast" -Value 0 -Type DWord -Force
Write-Output "LLMNR disabled."
```

### Registry Export (.reg)

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows NT\DNSClient]
"EnableMulticast"=dword:00000000
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1557.001](https://attack.mitre.org/techniques/T1557/001/) | LLMNR/NBT-NS Poisoning and SMB Relay |

## Compliance References

- **CIS Benchmark**: Windows 10/11 Level 1, Control 18.5.4.2
- **DISA STIG**: WN10-CC-000035
- **NIST SP 800-53**: SC-20, SC-21
