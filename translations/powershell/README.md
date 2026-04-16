# PowerShell Policy Translation

This directory bridges Group Policy configurations with PowerShell equivalents — for environments without domain join, for scripted deployments, and for validation/auditing.

## Why PowerShell Translations Matter

| Scenario | Why PS is Needed |
|---|---|
| **Workgroup machines** | No GPO, must use registry/PS directly |
| **Azure AD-joined devices** | Group Policy doesn't apply; use PS + Intune |
| **Automated provisioning** | Packer, Ansible, DSC, WinGet — all use PS |
| **Compliance auditing** | PS scripts can verify GPO state and report |
| **Quick testing** | Apply a single policy without a full GPO link |

## Directory Structure

```
translations/powershell/
├── apply/          # Scripts that apply policy settings
│   ├── security.ps1
│   ├── privacy.ps1
│   └── network.ps1
├── audit/          # Scripts that verify/report current policy state
│   ├── security-audit.ps1
│   └── compliance-report.ps1
└── dsc/            # PowerShell DSC configurations
    └── SecurityBaseline.ps1
```

## Apply Scripts (Coming in Phase 3)

### `apply/security.ps1`
Bulk-applies all PolicyForge security policies via registry:
```powershell
# Preview:
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' -Name 'LmCompatibilityLevel' -Value 5
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' -Name 'DisableRestrictedAdmin' -Value 0
# ... 40+ security settings
```

### `audit/compliance-report.ps1`
Generates a full HTML compliance report against PolicyForge baselines:
```powershell
# Output: PolicyForge-Compliance-Report-2026-04-16.html
# Checks: 50+ registry values
# Exports: CSV + HTML with PASS/FAIL/MISSING per policy
```

## Relationship to Other Translation Files

| File | Coverage |
|---|---|
| [`translations/gpo-to-intune/`](../gpo-to-intune/) | GPO → Intune OMA-URI (for MDM) |
| [`translations/registry-mapping/`](../registry-mapping/) | Registry ↔ PowerShell quick reference |
| **This directory** | Full PowerShell apply + audit scripts |

## Want to Contribute?

PS translation contributions are the most practical for sysadmins. See [CONTRIBUTING.md](../../CONTRIBUTING.md) and earn the **Script Master** badge.
