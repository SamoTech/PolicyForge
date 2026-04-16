---
id: WIN-SECURITY-005
name: Enable Windows Firewall on All Profiles
category: [Security, Network, Firewall]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows Vista+, Windows 10, Windows 11, Windows Server 2008+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable Windows Firewall on All Profiles

> 🔴 **Risk Level: High** — Disabling the Windows Firewall on any profile removes a core network protection layer and is a common misconfiguration exploited during lateral movement.

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Windows Defender Firewall with Advanced Security
                    ├── Domain Profile → Firewall State: On
                    ├── Private Profile → Firewall State: On
                    └── Public Profile → Firewall State: On
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\DomainProfile` | `EnableFirewall` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\PrivateProfile` | `EnableFirewall` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\PublicProfile` | `EnableFirewall` | `1` | REG_DWORD |

## Description

Windows Firewall with Advanced Security provides host-based packet filtering across three network profiles: Domain (corporate network), Private (home/trusted), and Public (untrusted). Ensuring all three profiles are enabled is a foundational security baseline that prevents unauthorized inbound connections, limits lateral movement, and provides a policy-managed enforcement point for network access control.

## PowerShell

```powershell
# Enable firewall on all profiles
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Verify
Get-NetFirewallProfile | Select-Object Name, Enabled
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI (Domain) | `./Vendor/MSFT/Firewall/MdmStore/DomainProfile/EnableFirewall` |
| OMA-URI (Private) | `./Vendor/MSFT/Firewall/MdmStore/PrivateProfile/EnableFirewall` |
| OMA-URI (Public) | `./Vendor/MSFT/Firewall/MdmStore/PublicProfile/EnableFirewall` |
| Data Type | Boolean |
| Value | `true` |

## Impact

- ✅ Blocks unauthorized inbound connections on all network types
- ✅ Limits lateral movement by requiring explicit firewall rules
- ✅ Provides policy-based enforcement point for network segmentation
- ⚠️ May block legitimate applications that rely on inbound connections without explicit rules
- ⚠️ Requires application exception rules to be pre-configured for business software
- ℹ️ Does not filter outbound traffic by default — add outbound rules for tighter control

## Use Cases

- **Enterprise baseline** — all domain endpoints must have firewall enabled on all profiles
- **Public Wi-Fi protection** — Public profile critical for laptop users outside the office
- **Ransomware containment** — limits spread by blocking SMB/RPC on unmanaged ports
- **Zero trust enforcement** — host firewall is the last line of defense after perimeter controls
- **Compliance** — required by CIS, DISA STIG, PCI-DSS, and most security frameworks

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.004](https://attack.mitre.org/techniques/T1562/004/) | Impair Defenses: Disable or Modify System Firewall |
| [T1021](https://attack.mitre.org/techniques/T1021/) | Remote Services |
| [T1570](https://attack.mitre.org/techniques/T1570/) | Lateral Tool Transfer |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 9.1.1, 9.2.1, 9.3.1
- **DISA STIG**: WN10-NE-000010 through WN10-NE-000030
- **NIST SP 800-53**: SC-7

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
