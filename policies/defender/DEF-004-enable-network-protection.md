---
id: DEF-004
name: Enable Network Protection
category: [Defender, Network, Endpoint Protection]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows 10 1709+, Windows 11, Windows Server 2019+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Enable Network Protection

> 🔴 **Risk Level: High** — Network Protection blocks connections to malicious domains and IPs at the kernel level, stopping C2 callbacks and malware downloads before they complete.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Microsoft Defender Exploit Guard
                          └── Network Protection
                                └── Prevent users and apps from accessing dangerous websites → Enabled (Block)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Network Protection` | `EnableNetworkProtection` | `1` | REG_DWORD |

**Values:** `0` = Disabled, `1` = **Block** ✅, `2` = Audit mode

## Description

Network Protection extends Microsoft Defender SmartScreen to the OS level, blocking outbound connections to malicious hosts, phishing domains, exploit-hosting URLs, and known C2 infrastructure. It works at the Windows Filtering Platform (WFP) layer, intercepting connections before they reach the application. This is a critical control for stopping malware C2 callbacks, drive-by downloads, and credential phishing attempts on enterprise endpoints.

## PowerShell

```powershell
# Enable Network Protection in Block mode
Set-MpPreference -EnableNetworkProtection Enabled

# Or via registry
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Network Protection"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "EnableNetworkProtection" -Value 1 -Type DWord

# Verify
Get-MpPreference | Select-Object EnableNetworkProtection
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Defender/EnableNetworkProtection` |
| Data Type | Integer |
| Value | `1` (Block) |

## Impact

- ✅ Blocks C2 callbacks, malware downloads, and phishing domains at kernel level
- ✅ Protects all processes, not just browser traffic
- ✅ Audit mode available (`Value=2`) for testing before full enforcement
- ⚠️ May block legitimate sites if SmartScreen reputation data is incorrect
- ⚠️ Requires Microsoft Defender Antivirus to be the active AV solution
- ℹ️ Deploy in Audit mode first, review logs, then switch to Block

## Use Cases

- **C2 callback blocking** — stops malware from phoning home after initial execution
- **Phishing domain blocking** — protects users accessing links outside the browser
- **Ransomware containment** — blocks exfiltration and encryption key exchange
- **Remote worker endpoints** — critical protection when not behind corporate proxy
- **Staged rollout** — use Audit mode first to identify false positives before blocking

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1071](https://attack.mitre.org/techniques/T1071/) | Application Layer Protocol (C2) |
| [T1566](https://attack.mitre.org/techniques/T1566/) | Phishing |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.5
- **DISA STIG**: WN10-00-000025
- **NIST SP 800-53**: SC-7, SI-3

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
