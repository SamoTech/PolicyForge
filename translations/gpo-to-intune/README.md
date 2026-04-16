# GPO → Intune (MDM CSP) Translation Engine

This directory contains mapping tables for translating Group Policy (ADMX-backed) settings to their Intune MDM CSP equivalents.

---

## Structure

```
gpo-to-intune/
├── README.md
├── windows-security.md      # Security policy mappings
├── windows-privacy.md       # Privacy/telemetry mappings
├── windows-network.md       # Network policy mappings
├── edge-policies.md         # Edge browser mappings
└── office-365.md            # Office 365 / M365 mappings
```

---

## Format

Each mapping entry includes:

| Field | Description |
|---|---|
| Policy Name | Human-readable GPO name |
| GPO Path | Full Administrative Templates path |
| Registry | HKLM/HKCU key and value |
| OMA-URI | Intune CSP path |
| Data Type | Integer, String, Boolean |
| Enabled Value | Value when policy is enabled |
| Disabled Value | Value when policy is disabled |
| Notes | Migration caveats or differences |

---

## Why This Matters

Microsoft's GPO and Intune CSP use **completely different naming conventions** and value semantics for equivalent settings. This engine provides a definitive reference for organizations migrating from on-premises Group Policy to cloud-first Intune management.

---

## Example

| GPO Path | OMA-URI | Enabled Value | Notes |
|---|---|---|---|
| `...\Data Collection\Allow Telemetry` | `./Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry` | `0` | Enterprise/Server only for value 0 |
| `...\AutoPlay Policies\Turn off AutoPlay` | `./Device/Vendor/MSFT/Policy/Config/Autoplay/TurnOffAutoPlay` | `255` | |
| `...\Windows Defender\Turn off Windows Defender` | `./Device/Vendor/MSFT/Policy/Config/Defender/AllowAntivirus` | `0` | |
