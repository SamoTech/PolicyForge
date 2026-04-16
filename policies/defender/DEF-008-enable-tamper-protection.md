---
id: DEF-008
name: Enable Tamper Protection
category: [Defender, Security Hardening, Endpoint Protection]
risk_level: Critical
risk_emoji: 🔴
applies_to: [Windows 10 1903+, Windows 11, Windows Server 2019+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable Tamper Protection

> 🔴 **Risk Level: Critical** — Without Tamper Protection, attackers and malware can disable Defender via registry edits or PowerShell. Tamper Protection locks Defender settings so only Microsoft cloud services can modify them.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Turn off Microsoft Defender Antivirus → Disabled
```

> **Note:** Tamper Protection is primarily managed via Windows Security Center or Microsoft Defender for Endpoint portal. GPO can enforce the Defender-on setting; full Tamper Protection lock requires MDE or Windows Security Center.

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Microsoft\Windows Defender` | `TamperProtection` | `5` | REG_DWORD |

**Values:** `0` = Disabled, `4` = Not configured, `5` = **Enabled** ✅

> Note: This registry key is protected by Tamper Protection itself. Direct registry edits are blocked once enabled. Use Windows Security Center or MDE portal to manage.

## Description

Tamper Protection prevents unauthorized changes to Microsoft Defender Antivirus settings by locking the security configuration via a kernel-level protection mechanism. When enabled, registry modifications, Group Policy overrides, PowerShell commands, and third-party applications cannot disable real-time protection, cloud-delivered protection, behavior monitoring, or other core Defender features. Changes can only be made through the Windows Security app, Microsoft Defender for Endpoint, or Microsoft Intune.

## PowerShell

```powershell
# Check current Tamper Protection status
Get-MpComputerStatus | Select-Object IsTamperProtected

# Enable via Windows Security (no PowerShell method when TP is off)
# Must use Windows Security Center UI or MDE portal
# Script to verify and alert if disabled:
if (-not (Get-MpComputerStatus).IsTamperProtected) {
    Write-Warning "ALERT: Tamper Protection is DISABLED on this endpoint!"
    # Trigger remediation or alert via SIEM
}
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/WindowsDefenderApplicationGuard/Settings/TamperProtection` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Prevents malware and attackers from disabling Defender via registry/PowerShell
- ✅ Locks all Defender security settings against unauthorized modification
- ✅ Audit trail: attempts to modify protected settings are logged
- ⚠️ Administrators cannot change Defender settings via GPO while TP is enabled
- ⚠️ Requires Windows Security Center or MDE portal for configuration changes
- ℹ️ Temporary disable requires Windows Security app or MDE portal — no remote registry method

## Use Cases

- **Pre-execution malware resistance** — ransomware commonly disables AV before encrypting
- **Privileged access workstations** — lock Defender on admin machines against insider threats
- **Managed device baseline** — enforce via MDE/Intune across all enrolled endpoints
- **Incident response** — verify Tamper Protection status as first step in investigation
- **Compliance** — required by CIS Level 1 and Microsoft Security Baseline

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |
| [T1089](https://attack.mitre.org/techniques/T1089/) | Disabling Security Tools |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.10
- **DISA STIG**: WN10-00-000040
- **NIST SP 800-53**: SI-3, SI-7
- **Microsoft Security Baseline**: Windows 10/11

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
