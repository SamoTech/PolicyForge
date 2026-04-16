---
id: EDGE-004
name: Disable AutoFill for Credit Cards in Edge
category: [Edge, Data Protection, Compliance]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 10, Windows 11, Microsoft Edge 77+]
test_status: "✅ Tested on Edge 124, Windows 11 24H2"
---

# Disable AutoFill for Credit Cards in Edge

> 🟠 **Risk Level: Medium** — Edge AutoFill stores payment card data locally. On managed enterprise devices, payment cards should never be stored in browser profiles. This data is extractable by malware with user-level access.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Microsoft Edge
              └── Enable AutoFill for credit cards → Disabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `AutofillCreditCardEnabled` | `0` | REG_DWORD |

## Description

Edge AutoFill for credit cards stores payment card numbers, expiration dates, and CVV values in the browser’s local profile database (`Web Data` SQLite file in the user profile). This data is accessible to any process running as the user, and malware routinely targets browser payment data stores. On enterprise devices, payment cards should not be stored in browser profiles; disable this feature and ensure users understand corporate device payment policies.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "AutofillCreditCardEnabled" -Value 0 -Type DWord

# Also disable address autofill for full coverage
Set-ItemProperty -Path $path -Name "AutofillAddressEnabled" -Value 0 -Type DWord

# Verify
Get-ItemProperty -Path $path | Select-Object Autofill*
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Browser/AllowAutofill` |
| Data Type | Integer |
| Value | `0` |

## Impact

- ✅ Eliminates browser-stored payment card data as a malware extraction target
- ✅ Prevents users saving personal payment cards on corporate devices
- ✅ Reduces PCI-DSS scope on managed endpoints
- ⚠️ Users must enter payment details manually for any legitimate corporate purchasing
- ℹ️ Existing stored cards are not deleted — users must clear manually or via policy

## Use Cases

- **PCI-DSS environments** — reduce cardholder data exposure on managed endpoints
- **Corporate device policy** — no personal payment data on company hardware
- **Malware hardening** — remove browser payment store as infostealer target
- **BYOD / high-risk user** — enforce on devices accessing corporate finance systems
- **Post-breach hardening** — disable payment stores after infostealer malware incident

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Password Stores: Credentials from Web Browsers |
| [T1005](https://attack.mitre.org/techniques/T1005/) | Data from Local System |

## Compliance References

- **CIS Microsoft Edge Benchmark**: Level 1, Control 2.3
- **PCI-DSS**: Requirement 3.3 (Sensitive data storage)
- **NIST SP 800-53**: SC-28 (Protection of Information at Rest)

## Test Status

✅ Tested on Microsoft Edge 124, Windows 11 24H2
