---
id: DEF-007
name: Configure Defender Exclusions — Best Practices
category: [Defender, Configuration, Security Hygiene]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Configure Defender Exclusions — Best Practices

> 🔴 **Risk Level: High** — Overly broad Defender exclusions are one of the most commonly abused misconfigurations in enterprise environments. Attackers plant payloads in excluded paths to bypass scanning entirely.

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Exclusions
                          ├── Path Exclusions
                          ├── Extension Exclusions
                          └── Process Exclusions
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Paths` | `<path>` | `0` | REG_SZ |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Extensions` | `.<ext>` | `0` | REG_SZ |
| `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Exclusions\Processes` | `<process.exe>` | `0` | REG_SZ |

> **Value `0`** = exclude. Any REG_SZ value present in these keys creates an exclusion.

## Description

Defender exclusions are necessary for some legitimate applications (SQL Server, backup agents, AV management consoles) but must be carefully scoped. Attackers enumerate exclusion paths using `Get-MpPreference` and stage payloads there to bypass detection. This policy documents the minimum-exclusion principle: exclude only specific executables or paths, never entire drives or extension classes like `.exe` or `.ps1`. Regularly audit all configured exclusions.

## PowerShell

```powershell
# View all current exclusions
Get-MpPreference | Select-Object ExclusionPath, ExclusionExtension, ExclusionProcess

# Add a specific process exclusion (preferred over path exclusion)
Add-MpPreference -ExclusionProcess "C:\Program Files\SQL Server\MSSQL\Binn\sqlservr.exe"

# Remove an overly broad path exclusion
Remove-MpPreference -ExclusionPath "C:\Temp"

# Audit: alert on dangerous extension exclusions
$ext = (Get-MpPreference).ExclusionExtension
if ($ext -match "exe|ps1|bat|cmd|vbs|js") {
    Write-Warning "DANGEROUS: Executable extension exclusion detected: $ext"
}
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI (Paths) | `./Device/Vendor/MSFT/Policy/Config/Defender/ExcludedPaths` |
| OMA-URI (Extensions) | `./Device/Vendor/MSFT/Policy/Config/Defender/ExcludedExtensions` |
| OMA-URI (Processes) | `./Device/Vendor/MSFT/Policy/Config/Defender/ExcludedProcesses` |
| Data Type | String |

## Impact

- ✅ Properly scoped exclusions reduce false positives without creating blind spots
- ⚠️ Broad path exclusions (`C:\Temp`, `C:\Windows\Temp`) are commonly abused by malware
- ⚠️ Extension exclusions for `.exe`, `.ps1`, `.bat` effectively disable scanning for those types
- ⚠️ Exclusions are readable by any local process via `Get-MpPreference` — treat as semi-public
- ℹ️ Prefer process exclusions over path exclusions for minimum-scope principle

## Use Cases

- **SQL Server / Exchange** — exclude specific database binaries, not entire data directories
- **Backup agents** — exclude backup process executables, not the backup destination path
- **Build systems** — exclude compiler/linker processes, not the entire source tree
- **Exclusion audit** — quarterly review of all configured exclusions for creep and abuse
- **Incident response** — check exclusions immediately when investigating suspected bypass

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |
| [T1036](https://attack.mitre.org/techniques/T1036/) | Masquerading (payload in excluded path) |
| [T1083](https://attack.mitre.org/techniques/T1083/) | File and Directory Discovery (enumerating exclusions) |

## Compliance References

- **CIS Benchmark**: Level 1, Control 8.9
- **DISA STIG**: WN10-00-000035
- **NIST SP 800-53**: SI-3

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2, Windows Server 2022
