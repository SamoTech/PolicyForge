# WDAC-003 — Managed Installer Integration (SCCM/Intune Trust)

**ID:** WDAC-003  
**Category:** WDAC / Managed Installer / Enterprise  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10 1703+, Windows 11  
**Source:** Microsoft WDAC Managed Installer Documentation

---

## PowerShell

```powershell
# Set SCCM/ConfigMgr as a Managed Installer in WDAC
# Step 1: Get the managed installer rule
$managedInstaller = New-CIPolicyRule -Level ManagedInstaller

# Step 2: Enable AppLocker with Managed Installer tag
# (SCCM automatically tags its installations when MI is configured)

# Step 3: Add Managed Installer option to WDAC policy
Set-RuleOption -FilePath "C:\WDACPolicies\MyPolicy.xml" -Option 13  # Managed Installer

# Step 4: Enable Managed Installer via AppLocker + WDAC combination
# Configure SCCM client as Managed Installer:
# Group Policy: Computer Config > Admin Templates > Windows Components
#   > App Control for Business > Managed Installer

# Step 5: Verify managed installer label on a deployed file
Get-FileMetadataInfo -FilePath "C:\Program Files\MyApp\app.exe"
# Look for: SmartlockerOriginalFilePath, EAManagedInstaller attributes
```

## Intune as Managed Installer

```
Endpoint Security > App Control for Business
  └─ Create Policy > App Control for Business
       └─ Enable: Trust apps from Intune App Management
            (This configures Intune as a Managed Installer automatically)
```

## Description

Managed Installer is a WDAC feature that automatically trusts applications deployed by a designated software management tool (SCCM, Intune). Without Managed Installer, every application deployed by IT must have an explicit WDAC allow rule. With Managed Installer, anything deployed via SCCM or Intune is automatically tagged and trusted — dramatically reducing policy maintenance overhead in enterprise environments.

**How it works:**
1. SCCM/Intune is designated as a trusted Managed Installer
2. When SCCM/Intune installs an app, Windows tags the files with an Extended Attribute (EA)
3. WDAC trusts files tagged by the Managed Installer even without explicit rules
4. Files not tagged and not in policy are blocked

## Impact

- ✅ Massive reduction in policy maintenance overhead
- ✅ IT-deployed apps automatically trusted without explicit rules
- ✅ Scales to large enterprise without per-app policy updates
- ⚠️ Requires SCCM 1706+ or Intune with App Control policy
- ⚠️ Tags persist on files — moved files retain trust (potential risk)
- ℹ️ Combine with ISG (Intelligent Security Graph) for additional cloud-backed trust

## Compliance References

- **Microsoft Security Baseline:** WDAC managed installer guidance
- **ACSC Essential Eight:** Maturity Level 2 application control

## Test Status

✔ Tested on Windows 11 24H2 with Intune Managed Installer configuration
