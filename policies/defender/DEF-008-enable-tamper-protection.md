---
id: DEF-008
name: Enable Defender Tamper Protection
category: [Defender, Integrity, Baseline]
risk_level: High
applies_to: [Windows 10 1903+, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Defender Tamper Protection

## Description

Tamper Protection prevents unauthorized changes to Microsoft Defender settings — even by processes running as SYSTEM or local administrators. Without it, malware that gains admin access can trivially disable real-time protection, cloud protection, and behavior monitoring via registry writes or PowerShell. With Tamper Protection enabled, only the Windows Security app (and Intune/MDE management) can modify Defender settings.

## Registry

Tamper Protection cannot be reliably configured via registry alone on standalone machines — it must be enabled through the Windows Security UI or managed via Microsoft Defender for Endpoint (MDE) / Intune tenant attach.

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Microsoft\Windows Defender\Features` | `TamperProtection` | `5` | REG_DWORD |

> Values: 4 = Disabled, 5 = Enabled. Registry write is blocked when Tamper Protection is active (by design).

## Enable via PowerShell (requires MDE or Intune)

```powershell
# Check current status
Get-MpComputerStatus | Select IsTamperProtected, TamperProtectionSource

# Enable via Windows Security (interactive — no PS cmdlet for standalone)
# For Intune-managed devices: configure via Endpoint Security > Antivirus policy
```

## Enable via Windows Security UI

1. Open **Windows Security** → **Virus & threat protection**
2. Click **Manage settings** under Virus & threat protection settings
3. Toggle **Tamper Protection** to **On**

## Intune (MDE Tenant Attach)

```
Endpoint Security → Antivirus → Microsoft Defender Antivirus
Setting: Tamper Protection → Enabled
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.47.15
- **DISA STIG**: WN10-00-000015
