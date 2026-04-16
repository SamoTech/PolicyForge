# Microsoft Edge Policies

This directory contains Group Policy and registry-based configurations for Microsoft Edge (Chromium) in enterprise and managed environments.

## Overview

Microsoft Edge supports over 1,500 configurable policies via ADMX templates. This collection focuses on security-critical and compliance-relevant settings most commonly needed by enterprise sysadmins and security teams.

## Policy Index

| ID | Policy | Risk | Category |
|---|---|---|---|
| [EDGE-001](./EDGE-001-disable-inprivate.md) | Disable InPrivate Browsing | 🟠 Medium | Compliance / DLP |
| [EDGE-002](./EDGE-002-block-password-manager.md) | Block Built-in Password Manager | 🟠 Medium | Credential Security |
| [EDGE-003](./EDGE-003-enforce-smartscreen.md) | Enforce SmartScreen | 🔴 High | Phishing Protection |
| [EDGE-004](./EDGE-004-disable-autofill-creditcard.md) | Disable AutoFill for Credit Cards | 🟠 Medium | PCI-DSS / DLP |
| [EDGE-005](./EDGE-005-force-safe-search.md) | Force Safe Search | 🟢 Low | Content Filtering |

## Deploying Edge Policies

### Via Group Policy
1. Download the [Edge ADMX templates](https://www.microsoft.com/en-us/edge/business/download) from Microsoft
2. Copy `.admx` files to `C:\Windows\PolicyDefinitions\`
3. Copy `.adml` files to `C:\Windows\PolicyDefinitions\en-US\`
4. Open `gpedit.msc` — Edge policies appear under **Administrative Templates > Microsoft Edge**

### Via Intune
- Use the **Settings Catalog** in Intune and search for `Microsoft Edge`
- Or ingest ADMX templates via **Device Configuration > Templates > Administrative Templates**

### Via Registry / PowerShell
- All Edge policies write to `HKLM:\SOFTWARE\Policies\Microsoft\Edge`
- Deploy via GPO startup script, Intune remediation, or SCCM

## Resources

- [Edge Enterprise documentation](https://docs.microsoft.com/en-us/deployedge/)
- [Edge policy reference](https://docs.microsoft.com/en-us/deployedge/microsoft-edge-policies)
- [Download Edge ADMX templates](https://www.microsoft.com/en-us/edge/business/download)
