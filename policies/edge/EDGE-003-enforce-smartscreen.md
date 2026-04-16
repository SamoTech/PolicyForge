---
id: EDGE-003
name: Enforce Microsoft Defender SmartScreen in Edge
category: [Edge, Security, Phishing Protection]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows 10, Windows 11, Microsoft Edge 77+]
test_status: "✅ Tested on Edge 124, Windows 10 22H2, Windows 11 24H2"
---

# Enforce Microsoft Defender SmartScreen in Edge

> 🔴 **Risk Level: High** — SmartScreen blocks known phishing domains, malicious downloads, and exploit-hosting URLs. Disabling it removes a critical first line of defense against web-based attacks.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Microsoft Edge
              └── SmartScreen settings
                    ├── Configure Microsoft Defender SmartScreen → Enabled
                    └── Prevent bypassing Microsoft Defender SmartScreen prompts for sites → Enabled
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `SmartScreenEnabled` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `SmartScreenPuaEnabled` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `PreventSmartScreenPromptOverride` | `1` | REG_DWORD |
| `HKLM\SOFTWARE\Policies\Microsoft\Edge` | `PreventSmartScreenPromptOverrideForFiles` | `1` | REG_DWORD |

## Description

Microsoft Defender SmartScreen in Edge checks visited URLs and downloaded files against Microsoft's threat intelligence database of known malicious sites, phishing pages, and malware distribution points. The `PreventSmartScreen*` policies remove the user’s ability to bypass SmartScreen warnings, ensuring that even a socially engineered user cannot proceed to a blocked site. `SmartScreenPuaEnabled` extends protection to PUA downloads.

## PowerShell

```powershell
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }

$settings = @{
    SmartScreenEnabled                        = 1
    SmartScreenPuaEnabled                     = 1
    PreventSmartScreenPromptOverride          = 1
    PreventSmartScreenPromptOverrideForFiles  = 1
}

foreach ($key in $settings.Keys) {
    Set-ItemProperty -Path $path -Name $key -Value $settings[$key] -Type DWord
}

# Verify
Get-ItemProperty -Path $path | Select-Object SmartScreen*, PreventSmartScreen*
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI (Enable) | `./Device/Vendor/MSFT/Policy/Config/Browser/AllowSmartScreen` |
| OMA-URI (No bypass) | `./Device/Vendor/MSFT/Policy/Config/Browser/PreventSmartScreenPromptOverride` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Blocks known phishing domains, malware distribution URLs, and exploit kits
- ✅ Prevents users from bypassing SmartScreen warnings (critical for social engineering defense)
- ✅ PUA download blocking removes adware/cryptominer download vectors
- ⚠️ Rare false-positive blocks on legitimate sites with poor reputation scores
- ℹ️ SmartScreen telemetry requires internet connectivity to Microsoft cloud

## Use Cases

- **Enterprise baseline** — mandatory on all managed endpoints; first line of web defense
- **Phishing defense** — blocks credential harvesting pages before user interaction
- **Ransomware delivery** — stops drive-by download sites used in ransomware campaigns
- **Social engineering resistance** — `PreventOverride` stops users being talked past warnings
- **Compliance** — CIS Level 1 mandatory control for managed Edge deployments

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Phishing: Spearphishing Link |
| [T1189](https://attack.mitre.org/techniques/T1189/) | Drive-by Compromise |
| [T1204.001](https://attack.mitre.org/techniques/T1204/001/) | User Execution: Malicious Link |

## Compliance References

- **CIS Microsoft Edge Benchmark**: Level 1, Controls 2.8–2.10
- **DISA STIG**: EDGE-00-000001
- **NIST SP 800-53**: SI-3, SC-44

## Test Status

✅ Tested on Microsoft Edge 124, Windows 10 22H2, Windows 11 24H2
