---
id: WIN-PRIVACY-001
name: Disable Windows Telemetry
category: [Privacy, Security, Compliance]
risk_level: Medium
risk_emoji: 🟠
applies_to: [Windows 10 (all editions), Windows 11 (all editions), Windows Server 2019+]
test_status: "✅ Tested on Windows 10 22H2 and Windows 11 24H2"
---

# Disable Windows Telemetry

> 🟠 **Risk Level: Medium** — Setting telemetry to 0 disables non-essential diagnostic data collection. On Enterprise/Server editions this is fully honored. On Home/Pro the minimum effective value is 1 (Basic).

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Data Collection and Preview Builds
                    └── Allow Telemetry → 0 (Security)
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\Software\Policies\Microsoft\Windows\DataCollection` | `AllowTelemetry` | `0` | REG_DWORD |

**AllowTelemetry values:** `0` = Security (Enterprise/Server only), `1` = Basic, `2` = Enhanced, `3` = Full

## Description

Controls the volume of diagnostic and telemetry data sent from the device to Microsoft. When set to `0` (Security level), only minimal security-related data is transmitted — this is the lowest possible setting and is only honored on Windows Enterprise, Education, and Server editions. On Home and Pro editions, the minimum effective value is `1` (Basic). This policy should be combined with `DisableEnterpriseAuthProxy` and `DoNotShowFeedbackNotifications` for a comprehensive telemetry lockdown.

## PowerShell

```powershell
$path = "HKLM:\Software\Policies\Microsoft\Windows\DataCollection"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "AllowTelemetry" -Value 0 -Type DWord -Force

# Disable Connected User Experiences and Telemetry service
Stop-Service -Name "DiagTrack" -Force -ErrorAction SilentlyContinue
Set-Service -Name "DiagTrack" -StartupType Disabled

# Verify
Get-ItemProperty -Path $path -Name "AllowTelemetry" | Select-Object AllowTelemetry
Get-Service -Name "DiagTrack" | Select-Object Name, Status, StartType
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry` |
| Data Type | Integer |
| Value | `0` |
| Note | Enterprise/Education/Server only — Home/Pro floors at `1` |

**Via Settings Catalog:** Device Configuration → Settings Catalog → Search "Allow Telemetry" → Set to **Security**

## Impact

- ✅ Minimizes diagnostic data sent to Microsoft — privacy and compliance benefit
- ✅ Reduces attack surface from telemetry pipeline data exposure
- ✅ Required for GDPR, HIPAA, and government compliance in many jurisdictions
- ⚠️ May disable Device Health portal reporting in Intune/MDE
- ⚠️ Windows Update compatibility telemetry reduced — may delay update readiness signals
- ⚠️ Windows Error Reporting (WER) behavior changes — crash dumps not forwarded to Microsoft
- ℹ️ Home/Pro: value `0` is silently upgraded to `1` by Windows; use `1` for these editions

## Use Cases

- **High-privacy environments** — law firms, medical/healthcare, financial institutions requiring data minimization
- **Air-gapped / semi-isolated systems** — prevent any outbound diagnostic traffic
- **GDPR compliance** — data minimization principle; personal data not transmitted without consent
- **Government and defense networks** — strict data sovereignty requirements
- **Regulated industries** — HIPAA, SOX, PCI-DSS environments requiring explicit data control

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1119](https://attack.mitre.org/techniques/T1119/) | Automated Collection — reducing telemetry data as exfiltration surface |
| [T1020](https://attack.mitre.org/techniques/T1020/) | Automated Exfiltration — telemetry pipeline as a data egress path |

## Compliance References

- **CIS Windows Benchmark**: Level 2, Control 18.9.13.1 (Allow Telemetry)
- **DISA STIG**: WN10-CC-000205 — Telemetry must be configured to the lowest level
- **NIST SP 800-53**: SI-12 (Information Management and Retention), AU-3
- **GDPR**: Article 5(1)(c) — Data minimization principle
- **Microsoft Security Baseline**: Windows 10/11 Security Baseline

## Registry Export (.reg)

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows\DataCollection]
"AllowTelemetry"=dword:00000000
```

## Test Status

✅ Tested on Windows 10 22H2 (Enterprise) and Windows 11 24H2 (Enterprise)

> **Note:** On Home/Pro editions, set `AllowTelemetry=1` (Basic) as the minimum achievable value.
