---
id: DEF-010
name: Enable PUA (Potentially Unwanted Application) Protection
category: [Defender, Endpoint Protection, Compliance]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 10 2004+, Windows 11, Windows Server 2019+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable PUA (Potentially Unwanted Application) Protection

> 🟠 **Risk Level: Medium** — PUA protection blocks adware, cryptominers, browser hijackers, and bundled software that degrades endpoint security posture without being classified as outright malware.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Configure detection for potentially unwanted applications → Enabled (Block)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender` | `PUAProtection` | `1` | REG_DWORD |

**Values:** `0` = Disabled, `1` = **Block** ✅, `2` = Audit mode

## Description

Potentially Unwanted Application (PUA) protection detects and blocks software that, while not strictly malicious, degrades security posture, harvests user data, installs unwanted browser extensions, or bundles additional software without clear consent. Common PUA categories include: adware, download managers with bundled installs, browser modifiers, cryptocurrency miners, and remote administration tools used without authorization. Enabling Block mode prevents installation; Audit mode logs detections without blocking.

## PowerShell

```powershell
# Enable PUA protection in Block mode
Set-MpPreference -PUAProtection Enabled

# Or via registry
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender"
Set-ItemProperty -Path $path -Name "PUAProtection" -Value 1 -Type DWord

# Verify
Get-MpPreference | Select-Object PUAProtection

# View PUA detections
Get-MpThreatDetection | Where-Object { $_.Resources -match "PUA" } | Select-Object ThreatName, Resources
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Defender/PUAProtection` |
| Data Type | Integer |
| Value | `1` (Block) |

## Impact

- ✅ Blocks adware, cryptominers, and browser hijackers at install time
- ✅ Prevents unauthorized remote admin tools from being installed silently
- ✅ Audit mode available for testing before enforcement
- ⚠️ Some legitimate freeware may be flagged as PUA — review detections before blocking
- ⚠️ Overly strict in consumer environments with mixed personal/work software
- ℹ️ Use Exclusions to allow specific PUA-flagged tools needed for business operations

## Use Cases

- **Managed endpoints** — prevent employees from installing adware-bundled software
- **Education environments** — block cryptominers and browser hijackers on student devices
- **Compliance** — PUA blocking is required by CIS Level 1 for all managed endpoints
- **Help desk reduction** — fewer support tickets from adware-infected machines
- **Kiosk / lockdown** — block any unauthorized software install regardless of malware classification

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1176](https://attack.mitre.org/techniques/T1176/) | Browser Extensions |
| [T1496](https://attack.mitre.org/techniques/T1496/) | Resource Hijacking (cryptominers) |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.11
- **DISA STIG**: WN10-00-000045
- **NIST SP 800-53**: SI-3

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
