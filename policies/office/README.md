# Microsoft Office Policies

This directory contains Group Policy, registry, and Intune configurations for Microsoft Office (2016, 2019, Microsoft 365 Apps) security hardening.

## Overview

Microsoft Office is the #1 target for initial access in enterprise environments. Macro-enabled documents, OLE objects, and Protected View bypasses account for the majority of phishing-delivered malware. This collection focuses on the highest-impact Office security controls.

## Policy Index

| ID | Policy | Risk | Category |
|---|---|---|---|
| [OFFICE-001](./OFFICE-001-disable-vba-macros.md) | Disable VBA Macros by Default | 🔴 High | Macro Security |
| [OFFICE-002](./OFFICE-002-block-macros-from-internet.md) | Block Macros from Internet Files | 🔴 Critical | Phishing Defense |
| [OFFICE-003](./OFFICE-003-trusted-locations-only.md) | Restrict Macros to Trusted Locations | 🔴 High | Zero-Trust Macros |
| [OFFICE-004](./OFFICE-004-enforce-protected-view.md) | Enforce Protected View | 🔴 High | Sandbox / Exploit Prevention |
| [OFFICE-005](./OFFICE-005-block-ole-objects.md) | Block OLE Object Execution | 🔴 Critical | OLE / APT Defense |

## Deploying Office Policies

### Via Group Policy (ADMX)
1. Download [Office ADMX templates](https://www.microsoft.com/en-us/download/details.aspx?id=49030) from Microsoft
2. Copy `.admx` files to `C:\Windows\PolicyDefinitions\`
3. Copy `.adml` files to `C:\Windows\PolicyDefinitions\en-US\`
4. Open `gpedit.msc` — Office policies appear under **Administrative Templates > Microsoft Office 2016**

### Via Intune
- **Settings Catalog**: Search for "Microsoft Office" or "Microsoft Word"
- **ADMX Ingestion**: Upload Office ADMX to Intune for full policy coverage
- **Remediation Scripts**: Deploy registry-based settings (PackagerActivation, blockcontentexecutionfrominternet) via PowerShell remediation

### Via PowerShell (Standalone)
```powershell
# Quick apply: macro baseline for all Office apps
$apps = @("word", "excel", "powerpoint")
$basePath = "HKCU:\SOFTWARE\Policies\Microsoft\Office\16.0"

foreach ($app in $apps) {
    $path = "$basePath\$app\security"
    If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
    Set-ItemProperty -Path $path -Name "VBAWarnings" -Value 2 -Type DWord
    Set-ItemProperty -Path $path -Name "blockcontentexecutionfrominternet" -Value 1 -Type DWord
}
Write-Output "Office macro baseline applied."
```

## Resources

- [Office ADMX templates download](https://www.microsoft.com/en-us/download/details.aspx?id=49030)
- [Microsoft 365 Apps Security Baseline](https://docs.microsoft.com/en-us/deployoffice/overview-of-security-settings)
- [CIS Microsoft Office Benchmarks](https://www.cisecurity.org/benchmark/microsoft_office)
- [DISA Office STIGs](https://public.cyber.mil/stigs/downloads/)
