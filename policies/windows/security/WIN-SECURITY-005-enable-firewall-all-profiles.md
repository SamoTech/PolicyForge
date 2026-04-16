---
id: WIN-SECURITY-005
name: Enable Windows Firewall on All Profiles
category: [Security, Network, Baseline]
risk_level: Critical
applies_to: [Windows Vista+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable Windows Firewall on All Profiles

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Windows Defender Firewall with Advanced Security
                    ├── Domain Profile  → Firewall state: On
                    ├── Private Profile → Firewall state: On
                    └── Public Profile  → Firewall state: On
```

## Registry

| Profile | Key | Value | Data |
|---|---|---|---|
| Domain | `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\DomainProfile` | `EnableFirewall` | `1` |
| Private | `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\StandardProfile` | `EnableFirewall` | `1` |
| Public | `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\PublicProfile` | `EnableFirewall` | `1` |

## Description

Ensures Windows Defender Firewall is active on all three network profiles. A disabled firewall exposes all open ports directly to the network. Non-negotiable baseline control.

## PowerShell

```powershell
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True
Get-NetFirewallProfile | Select Name, Enabled
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Firewall/MdmStore/DomainProfile/EnableFirewall
Data Type: Boolean / Value: true

OMA-URI: ./Device/Vendor/MSFT/Firewall/MdmStore/PrivateProfile/EnableFirewall
Data Type: Boolean / Value: true

OMA-URI: ./Device/Vendor/MSFT/Firewall/MdmStore/PublicProfile/EnableFirewall
Data Type: Boolean / Value: true
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.004](https://attack.mitre.org/techniques/T1562/004/) | Impair Defenses: Disable or Modify System Firewall |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 9.1.1, 9.2.1, 9.3.1
- **DISA STIG**: WN10-NE-000025, WN10-NE-000030, WN10-NE-000035
- **NIST SP 800-53**: SC-7, CA-3
