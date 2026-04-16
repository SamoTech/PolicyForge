---
id: OFFICE-003
name: Restrict Macro Execution to Trusted Locations Only
category: [Office, Macro Security, Zero Trust]
risk_level: High
risk_emoji: 🔴
applies_to: [Office 2016+, Microsoft 365 Apps, Windows 10, Windows 11]
test_status: "✅ Tested on Microsoft 365 Apps v2402, Windows 10 22H2"
---

# Restrict Macro Execution to Trusted Locations Only

> 🔴 **Risk Level: High** — Allowing macros only from IT-defined Trusted Locations creates a whitelist-based control: macros run only from approved network shares or local paths, not from arbitrary document locations.

## Policy Path

```
User Configuration
  └── Administrative Templates
        └── Microsoft Word 2016 (and Excel, PowerPoint)
              └── Word Options
                    └── Security
                          └── Trust Center
                                ├── Trusted Locations: Allow Trusted Locations on the network → Enabled
                                └── Disable all trusted locations → Disabled (to keep IT-defined locations active)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security\trusted locations\location1` | `Path` | `\\fileserver\trusted-macros` | REG_SZ |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security\trusted locations\location1` | `AllowSubFolders` | `1` | REG_DWORD |
| `HKCU\SOFTWARE\Policies\Microsoft\Office\16.0\word\security\trusted locations` | `AllNetworkLocations` | `1` | REG_DWORD |

> Repeat for `excel`, `powerpoint` with equivalent paths.

## Description

Trusted Locations are file system paths (local or UNC) where Office will run macros without security warnings. Configuring these via policy allows IT to define an allowlist of approved macro sources — typically controlled network shares or local paths managed by the IT team. Any macro-enabled document opened from outside these paths is subject to standard macro blocking (see OFFICE-001 and OFFICE-002). This is the most mature macro control architecture: combine with digital signing (OFFICE-001 `VBAWarnings=3`) for defense-in-depth.

## PowerShell

```powershell
$apps = @("word", "excel", "powerpoint")
$trustedPath = "\\\\fileserver\\trusted-macros"  # Replace with your actual trusted path
$basePath = "HKCU:\SOFTWARE\Policies\Microsoft\Office\16.0"

foreach ($app in $apps) {
    $locPath = "$basePath\$app\security\trusted locations\location1"
    If (-not (Test-Path $locPath)) { New-Item -Path $locPath -Force | Out-Null }
    Set-ItemProperty -Path $locPath -Name "Path" -Value $trustedPath -Type String
    Set-ItemProperty -Path $locPath -Name "AllowSubFolders" -Value 1 -Type DWord
    Set-ItemProperty -Path $locPath -Name "Date" -Value (Get-Date -Format "yyyy-MM-dd") -Type String
    
    # Allow network trusted locations
    $secPath = "$basePath\$app\security\trusted locations"
    Set-ItemProperty -Path $secPath -Name "AllNetworkLocations" -Value 1 -Type DWord
    Write-Output "Trusted location set for $app"
}
```

## Intune CSP

| Setting | Value |
|---|---|
| Deploy via | Intune ADMX ingestion (Office ADMX) |
| Setting path | Trusted Locations (per application) in Security > Trust Center |
| Note | Define location1 through location20 as needed |

## Impact

- ✅ Macros only run from IT-controlled paths — whitelist model
- ✅ All other macro sources blocked regardless of document content
- ✅ Supports UNC network paths for centralized macro distribution
- ⚠️ Requires IT to manage and maintain the trusted location list
- ⚠️ Network trusted locations require `AllNetworkLocations=1` — ensure UNC path is ACL-controlled
- ⚠️ Users cannot add their own trusted locations when policy is applied
- ℹ️ Combine with VBAWarnings=3 (digitally signed only) for maximum control

## Use Cases

- **Mature macro governance** — only IT-approved macro files from controlled shares run
- **Finance / operations** — permit legitimate business macros while blocking all others
- **Zero-trust documents** — no ad-hoc macro execution from Downloads or Desktop
- **Macro developer workflow** — devs work in trusted location; production macros deployed centrally
- **Audit trail** — centralized macro store enables versioning and change tracking

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1059.005](https://attack.mitre.org/techniques/T1059/005/) | Command and Scripting: Visual Basic |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |
| [T1574](https://attack.mitre.org/techniques/T1574/) | Hijack Execution Flow (rogue file in trusted path) |

## Compliance References

- **CIS Microsoft Office Benchmark**: Level 2, Control 2.4
- **NIST SP 800-53**: CM-7 (Least Functionality), SI-3
- **ISO 27001**: A.12.6 (Technical Vulnerability Management)

## Test Status

✅ Tested on Microsoft 365 Apps v2402, Windows 10 22H2
