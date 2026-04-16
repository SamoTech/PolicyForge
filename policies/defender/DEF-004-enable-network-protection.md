---
id: DEF-004
name: Enable Network Protection
category: [Defender, Network, Attack Surface Reduction]
risk_level: Medium
applies_to: [Windows 10 1709+, Windows 11]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Enable Network Protection

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Microsoft Defender Exploit Guard
                          └── Network Protection
                                └── Prevent users and apps from accessing dangerous websites → Enabled (Block mode)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Network Protection` | `EnableNetworkProtection` | `1` | REG_DWORD |

> Values: 0 = Disabled, 1 = Block, 2 = Audit

## Description

Network Protection extends SmartScreen to the OS level, blocking outbound connections to known malicious IPs, domains, and URLs — including C2 infrastructure, phishing sites, and exploit kit domains. It works at the WFP (Windows Filtering Platform) layer, catching connections from any process, not just browsers. Start with Audit mode (`2`) to assess impact before switching to Block (`1`).

## Deployment Strategy

1. Deploy in **Audit mode** (`EnableNetworkProtection = 2`) for 1–2 weeks
2. Review Event ID 1125 (would-have-blocked) in Event Viewer
3. Add legitimate blocked URLs to exclusions
4. Switch to **Block mode** (`EnableNetworkProtection = 1`)

## PowerShell

```powershell
# Audit mode first
Set-MpPreference -EnableNetworkProtection AuditMode

# Switch to block after validation
# Set-MpPreference -EnableNetworkProtection Enabled

Get-MpPreference | Select EnableNetworkProtection
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/EnableNetworkProtection
Data Type: Integer
Value: 1 (Block) | 2 (Audit)
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1071](https://attack.mitre.org/techniques/T1071/) | Application Layer Protocol (C2) |
| [T1566](https://attack.mitre.org/techniques/T1566/) | Phishing |
