---
id: EDGE-005
name: Force Safe Search in Microsoft Edge
category: [Edge, Content Filtering, Compliance]
risk_level: Low
risk_emoji: 🟢
applies_to: [Windows 10, Windows 11, Microsoft Edge 77+]
test_status: "✅ Tested on Edge 124, Windows 10 22H2, Windows 11 24H2"
---

# Force Safe Search in Microsoft Edge

> 🟢 **Risk Level: Low** — Forcing Safe Search prevents explicit and potentially harmful content from appearing in Bing search results on managed devices. Essential for education, kiosk, and family-safe deployments.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Microsoft Edge
              └── Configure search suggestions in address bar → Disabled

# Safe Search for Bing is enforced via registry / Intune CSP below
# No direct GPO setting; use ForceBingSafeSearch registry key
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `ForceBingSafeSearch` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `ForceGoogleSafeSearch` | `1` | REG_DWORD |

**ForceBingSafeSearch values:** `0` = Off, `1` = **Moderate** ✅, `2` = Strict

## Description

`ForceBingSafeSearch` appends the `safeSearch=strict` or `safeSearch=moderate` parameter to all Bing queries regardless of user settings. `ForceGoogleSafeSearch` does the same for Google searches. These registry values cannot be overridden by users when set via GPO/Intune. Use `value=2` (Strict) for education or kiosk environments; `value=1` (Moderate) for general enterprise use. Note: this only affects Bing and Google — additional web filtering is recommended for full content control.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }

# Moderate safe search (1) for enterprise, Strict (2) for education/kiosk
Set-ItemProperty -Path $path -Name "ForceBingSafeSearch" -Value 1 -Type DWord
Set-ItemProperty -Path $path -Name "ForceGoogleSafeSearch" -Value 1 -Type DWord

# Verify
Get-ItemProperty -Path $path | Select-Object Force*SafeSearch
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI (Bing) | `./Device/Vendor/MSFT/Policy/Config/Browser/AllowSearchSuggestionsinAddressBar` |
| OMA-URI (Safe Search) | Configure via Edge ADMX ingestion in Intune |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Filters explicit and harmful content from Bing and Google search results
- ✅ User cannot override — setting is enforced at policy level
- ✅ Essential for shared/kiosk and education devices
- ⚠️ Moderate mode may still show some borderline content — use Strict (2) for education
- ⚠️ Only applies to Bing and Google — other search engines unaffected
- ℹ️ Combine with DNS-based content filtering (e.g., Cisco Umbrella) for comprehensive coverage

## Use Cases

- **Education environments** — mandatory safe search on student devices (CIPA compliance)
- **Kiosk / public-access devices** — prevent inappropriate content in shared environments
- **Guest Wi-Fi** — enforce safe search on all guest devices via Intune or GPO
- **Corporate devices** — basic content filtering layer before web proxy enforcement
- **Parental control deployments** — supplementary control on family/BYOD managed devices

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Phishing: Spearphishing Link (search result poisoning) |
| [T1608.006](https://attack.mitre.org/techniques/T1608/006/) | Stage Capabilities: SEO Poisoning |

## Compliance References

- **CIPA** (Children’s Internet Protection Act): Required for schools receiving E-rate funding
- **CIS Microsoft Edge Benchmark**: Level 1
- **NIST SP 800-53**: AC-20 (Use of External Information Systems)

## Test Status

✅ Tested on Microsoft Edge 124, Windows 10 22H2, Windows 11 24H2
