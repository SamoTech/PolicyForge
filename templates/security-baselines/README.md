# Enterprise Security Baseline — PolicyForge

> **Target**: Enterprise Windows 10/11 Endpoints  
> **Profile**: CIS Benchmark Level 1 + Extended Privacy Controls

---

## Overview

This baseline template applies a comprehensive set of Group Policy settings for hardened enterprise Windows endpoints. It combines:

- **CIS Benchmark Level 1** controls for Windows 10/11
- **Extended privacy controls** (telemetry, diagnostics)
- **Ransomware prevention** essentials (SMBv1, AutoRun, macro controls)

---

## Policies Included

| ID | Policy | Risk | Status |
|---|---|---|---|
| WIN-SECURITY-001 | Disable AutoRun / AutoPlay | High | ✅ |
| WIN-SECURITY-002 | Disable SMBv1 Protocol | Critical | ✅ |
| WIN-PRIVACY-001 | Disable Windows Telemetry | Medium | ✅ |
| WIN-SECURITY-003 | Enable Windows Defender Credential Guard | High | 🔄 |
| WIN-SECURITY-004 | Disable LLMNR Protocol | Medium | 🔄 |
| WIN-SECURITY-005 | Enable Windows Firewall (all profiles) | High | 🔄 |
| WIN-SECURITY-006 | Disable Remote Desktop (if not needed) | High | 🔄 |
| WIN-SECURITY-007 | Enable Audit Process Creation | Low | 🔄 |

---

## Deployment

### Option 1: PowerShell

```powershell
# Run as Administrator
cd PolicyForge\templates\security-baselines
.\deploy.ps1 -Profile Enterprise -DryRun $false
```

### Option 2: GPO Backup Import

```
1. Open Group Policy Management Console (GPMC)
2. Right-click target OU > "Import Settings..."
3. Browse to: templates/security-baselines/gpo-backup/
4. Select "Enterprise-Baseline" and follow the wizard
```

### Option 3: Intune

Import `intune-baseline.json` via:  
**Intune Portal > Endpoint Security > Security Baselines > Import**

---

## Tested On

- ✅ Windows 10 22H2 (Enterprise)
- ✅ Windows 11 23H2 (Enterprise)
- ✅ Windows 11 24H2 (Enterprise)
- 🔄 Windows Server 2022

---

## Compliance Coverage

| Framework | Coverage |
|---|---|
| CIS Benchmark Level 1 | ~65% |
| NIST SP 800-53 | ~40% |
| DISA STIG | ~50% |
| ISO 27001 | ~35% |
