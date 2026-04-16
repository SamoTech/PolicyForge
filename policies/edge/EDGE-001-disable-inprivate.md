---
id: EDGE-001
name: Disable InPrivate Browsing in Microsoft Edge
category: [Edge, Compliance, Data Leakage Prevention]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 10, Windows 11, Microsoft Edge 77+]
test_status: "✅ Tested on Edge 124, Windows 10 22H2, Windows 11 24H2"
---

# Disable InPrivate Browsing in Microsoft Edge

> 🟠 **Risk Level: Medium** — InPrivate mode bypasses browser history, leaving no local forensic trail. In managed environments, it can be used to evade web filtering and DLP logging.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Microsoft Edge
              └── InPrivate mode availability → InPrivate mode disabled (value: 2)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `InPrivateModeAvailability` | `2` | REG_DWORD |

**Values:** `0` = Available (default), `1` = Forced, `2` = **Disabled** ✅

## Description

InPrivate browsing disables local history, cookies, and cache storage for the session. In enterprise environments with web content filtering and DLP solutions, InPrivate mode can allow users to access policy-blocked sites or download restricted content without generating browser history logs. Disabling it ensures all browsing activity is captured by monitoring solutions and proxy logs.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "InPrivateModeAvailability" -Value 2 -Type DWord

# Verify
Get-ItemProperty -Path $path -Name "InPrivateModeAvailability"
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Browser/AllowInPrivate` |
| Data Type | Integer |
| Value | `0` (Block) |

## Impact

- ✅ All browsing activity captured in proxy and monitoring logs
- ✅ Web filtering policies apply consistently across all sessions
- ✅ DLP solutions see full browser activity
- ⚠️ Legitimate privacy-conscious users lose session isolation capability
- ℹ️ Does not affect other browsers installed on the device (Chrome, Firefox)

## Use Cases

- **Regulated industries** — ensure all web activity is auditable (finance, healthcare, legal)
- **DLP enforcement** — prevent bypassing content inspection via InPrivate sessions
- **Kiosk / shared devices** — prevent users leaving persistent sessions while still logging activity
- **Insider threat programs** — maintain full web audit trail for high-risk users
- **CIS compliance** — required for Level 2 managed browser deployments

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1564.003](https://attack.mitre.org/techniques/T1564/003/) | Hide Artifacts: Hidden Window (evading browser logging) |
| [T1048](https://attack.mitre.org/techniques/T1048/) | Exfiltration Over Alternative Protocol |

## Compliance References

- **CIS Microsoft Edge Benchmark**: Level 2, Control 2.1
- **NIST SP 800-53**: AU-12 (Audit Record Generation)
- **ISO 27001**: A.12.4 (Logging and Monitoring)

## Test Status

✅ Tested on Microsoft Edge 124, Windows 10 22H2, Windows 11 24H2
