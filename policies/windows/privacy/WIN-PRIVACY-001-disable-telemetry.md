---
id: WIN-PRIVACY-001
name: Disable Windows Telemetry
category: [Privacy, Security, Compliance]
risk_level: Medium
applies_to:
  - Windows 10 (all versions)
  - Windows 11 (all versions)
  - Windows Server 2019+
test_status: "✅ Tested on Windows 10 22H2 and Windows 11 24H2"
---

# Disable Windows Telemetry

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Data Collection and Preview Builds
                    └── Allow Telemetry
```

## Registry

| Key | Value |
|---|---|
| **Path** | `HKLM\\Software\\Policies\\Microsoft\\Windows\\DataCollection` |
| **Value Name** | `AllowTelemetry` |
| **Data** | `0` |
| **Type** | `REG_DWORD` |

## Description

Controls the volume of diagnostic and telemetry data sent from the device to Microsoft. When set to `0` (Security level), only security-related data is transmitted. This is the lowest possible setting and is only available on Enterprise and Server editions. On Home/Pro editions, the minimum effective value is `1` (Basic).

## Impact

- May disable some cloud-based diagnostic features (e.g., Device Health portal in Intune)
- Reduces Microsoft's visibility into device health
- Can affect Windows Update compatibility reporting
- Windows Error Reporting (WER) behavior may change

## Use Cases

- ✅ High-privacy environments: law firms, medical/healthcare, financial institutions
- ✅ Air-gapped or semi-isolated systems
- ✅ GDPR / compliance-driven deployments
- ✅ Government and defense networks

## Translations

### Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry
Data Type: Integer
Value: 0
```

### PowerShell

```powershell
Set-ItemProperty -Path "HKLM:\\Software\\Policies\\Microsoft\\Windows\\DataCollection" `
  -Name "AllowTelemetry" -Value 0 -Type DWord -Force

# Verify
Get-ItemProperty -Path "HKLM:\\Software\\Policies\\Microsoft\\Windows\\DataCollection" `
  -Name "AllowTelemetry" | Select-Object AllowTelemetry
```

### Registry Export (.reg)

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\Software\\Policies\\Microsoft\\Windows\\DataCollection]
"AllowTelemetry"=dword:00000000
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1119](https://attack.mitre.org/techniques/T1119/) | Automated Collection — reducing data exfiltration surface |

## Notes

- **Enterprise/Education/Server only**: Value `0` is only honored on these editions. On Home/Pro, minimum is `1`.
- Combine with `DisableEnterpriseAuthProxy` for comprehensive telemetry lockdown.
- [Microsoft docs](https://docs.microsoft.com/en-us/windows/privacy/configure-windows-diagnostic-data-in-your-organization)
