---
id: WIN-SECURITY-014
name: Disable AutoPlay for Removable Media
category: [Security, Endpoint, Physical Security]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable AutoPlay for Removable Media

> 🔴 **Risk Level: High** — AutoPlay on removable media enables USB-based malware deployment without user interaction. A physically-dropped USB can compromise an endpoint automatically.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── AutoPlay Policies
                    └── Turn off AutoPlay → Enabled
                          └── Turn off AutoPlay on: All Drives
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer` | `NoDriveTypeAutoRun` | `255` | REG_DWORD |
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer` | `NoAutorun` | `1` | REG_DWORD |

**NoDriveTypeAutoRun values:**
- `0xFF` (255) = Disable AutoPlay on all drive types ✅
- `0x91` (145) = Disable on removable and network drives
- `0x04` = Removable drives only

## Description

AutoPlay automatically executes content when removable media (USB drives, optical discs, memory cards) is connected. This feature was exploited by Stuxnet (2010) and is routinely used in USB drop attacks where an attacker leaves malware-loaded drives in public areas. Even without AutoRun exploitation, AutoPlay presents a UI that social-engineers users into executing malicious content. Setting `NoDriveTypeAutoRun = 255` disables all AutoPlay across all drive types.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"

If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }

Set-ItemProperty -Path $path -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord
Set-ItemProperty -Path $path -Name "NoAutorun" -Value 1 -Type DWord

Write-Output "AutoPlay disabled on all drive types."

# Verify
Get-ItemProperty -Path $path | Select-Object NoDriveTypeAutoRun, NoAutorun
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Autoplay/TurnOffAutoPlay` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Eliminates USB drop attack auto-execution vector
- ✅ Blocks Stuxnet-style AutoRun exploitation
- ✅ Prevents AutoPlay UI from social-engineering users
- ✅ No performance impact — purely a UI/execution behavior change
- ⚠️ Users must manually browse USB content via File Explorer
- ℹ️ Pair with WIN-SECURITY-001 (Disable AutoRun) for complete USB policy coverage

## Use Cases

- **Physical security hardening** — critical in environments where USB drops are a realistic threat
- **Classified / air-gapped environments** — USB media control is mandatory
- **Kiosk / public terminal security** — prevent any connected media from auto-executing
- **Manufacturing / OT environments** — USB attacks are a primary ICS/SCADA compromise vector
- **USB drop attack defense** — pairs with USB storage restriction policies

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1091](https://attack.mitre.org/techniques/T1091/) | Replication Through Removable Media |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |
| [T1025](https://attack.mitre.org/techniques/T1025/) | Data from Removable Media |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.9.8.2
- **DISA STIG**: WN10-CC-000180
- **NIST SP 800-171**: 3.8.7
- **PCI-DSS**: Requirement 9.9

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
