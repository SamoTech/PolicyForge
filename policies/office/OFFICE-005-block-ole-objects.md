---
id: OFFICE-005
name: Block OLE Object Execution in Office Documents
category: [Office, OLE Security, Exploit Prevention]
risk_level: Critical
risk_emoji: 🔴
applies_to: [Office 2016+, Microsoft 365 Apps, Windows 10, Windows 11]
test_status: "✅ Tested on Microsoft 365 Apps v2402, Windows 11 24H2"
---

# Block OLE Object Execution in Office Documents

> 🔴 **Risk Level: Critical** — OLE objects embedded in Office documents can execute arbitrary payloads when activated. This technique bypasses macro controls and is actively exploited in targeted attacks.

## Policy Path

```
User Configuration
  └── Administrative Templates
        └── Microsoft Excel 2016 (Word, PowerPoint)
              └── Excel Options
                    └── Security
                          └── Do not open files from the Internet in Protected View → Disabled

# OLE activation is controlled via registry (no direct GPO setting in standard ADMX):
# Set PackagerActivation via registry below
```

## Registry

| Key | Value | Data | Type | Applies to |
|---|---|---|---|---|
| `HKCU\SOFTWARE\Microsoft\Office\16.0\excel\security` | `PackagerActivation` | `0` | REG_DWORD | Excel |
| `HKCU\SOFTWARE\Microsoft\Office\16.0\word\security` | `PackagerActivation` | `0` | REG_DWORD | Word |
| `HKCU\SOFTWARE\Microsoft\Office\16.0\powerpoint\security` | `PackagerActivation` | `0` | REG_DWORD | PowerPoint |
| `HKCU\SOFTWARE\Microsoft\Office\16.0\publisher\security` | `PackagerActivation` | `0` | REG_DWORD | Publisher |

**PackagerActivation values:** `0` = **Block all** ✅, `1` = Prompt user, `2` = Allow all (⚠️ dangerous)

## Description

OLE (Object Linking and Embedding) allows Office documents to embed and execute external objects — executables, scripts, Flash objects, and other file types. Attackers abuse OLE to embed malicious executables disguised as icons or images inside documents. When a user double-clicks the embedded object, the payload executes outside of macro controls. The `PackagerActivation=0` registry key blocks all OLE package activations, preventing any embedded executable from running. This is separate from macro controls and addresses a distinct attack vector.

## PowerShell

```powershell
$apps = @("excel", "word", "powerpoint", "publisher")
$basePath = "HKCU:\SOFTWARE\Microsoft\Office\16.0"

foreach ($app in $apps) {
    $path = "$basePath\$app\security"
    If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
    Set-ItemProperty -Path $path -Name "PackagerActivation" -Value 0 -Type DWord
    Write-Output "OLE package activation blocked for $app"
}

# Verify
foreach ($app in $apps) {
    $val = Get-ItemProperty "$basePath\$app\security" -Name PackagerActivation -EA SilentlyContinue
    Write-Output "$app PackagerActivation: $($val.PackagerActivation)"
}
```

## Intune CSP

| Setting | Value |
|---|---|
| Deploy via | Intune Remediation Script or ADMX ingestion |
| Registry path | `HKCU\SOFTWARE\Microsoft\Office\16.0\<app>\security` |
| Value | `PackagerActivation = 0` |
| Note | Requires user context deployment (HKCU) |

## Impact

- ✅ Blocks OLE package execution — closes the non-macro document execution vector
- ✅ Embedded executables, scripts, and packaged objects cannot activate
- ✅ Independent of macro settings — addresses separate attack path
- ⚠️ May break legitimate OLE workflows (embedded PDFs, CAD files that launch viewers)
- ⚠️ Users cannot double-click embedded objects to open them with the associated application
- ℹ️ Test with finance and operations teams who commonly use embedded objects in templates

## Use Cases

- **Targeted attack defense** — blocks OLE-based payload delivery used in APT campaigns
- **Phishing hardening** — combined with macro controls (OFFICE-001/002), eliminates most document delivery vectors
- **Compliance** — required in high-security environments alongside macro disable policies
- **Post-breach hardening** — immediate control after OLE-based malware incident
- **Defense-in-depth** — stack with Protected View (OFFICE-004) and macro blocks for full coverage

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1559.001](https://attack.mitre.org/techniques/T1559/001/) | Inter-Process Communication: Component Object Model |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Phishing: Spearphishing Attachment |

## Compliance References

- **CIS Microsoft Office Benchmark**: Level 1, Control 2.8
- **DISA STIG**: DTOO126 — OLE object activation
- **NIST SP 800-53**: SI-3, CM-7
- **NSA Cybersecurity Advisory**: Office hardening guidance

## Test Status

✅ Tested on Microsoft 365 Apps v2402, Windows 11 24H2
