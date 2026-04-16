# WDAC-004 — WDAC Publisher-Based Supplemental Policies

**ID:** WDAC-004  
**Category:** WDAC / Supplemental Policies / Publisher Rules  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10 1903+, Windows 11  
**Source:** Microsoft WDAC Documentation

---

## PowerShell

```powershell
# Create a supplemental policy for a specific application (e.g., Google Chrome)
# Step 1: Scan the application folder
New-CIPolicy -ScanPath "C:\Program Files\Google\Chrome\Application" `
             -Level Publisher `
             -Fallback Hash `
             -FilePath "C:\WDACPolicies\Supplemental_Chrome.xml" `
             -UserPEs

# Step 2: Convert to supplemental (attach to base policy)
$basePolicyId = "{your-base-policy-GUID}"
Set-CIPolicyVersion -FilePath "C:\WDACPolicies\Supplemental_Chrome.xml" -Version "10.0.0.0"
[xml]$supp = Get-Content "C:\WDACPolicies\Supplemental_Chrome.xml"
$supp.SiPolicy.PolicyType = "Supplemental Policy"
$supp.SiPolicy.BasePolicyID = $basePolicyId
$supp.Save("C:\WDACPolicies\Supplemental_Chrome.xml")

# Step 3: Compile supplemental
ConvertFrom-CIPolicy -XmlFilePath "C:\WDACPolicies\Supplemental_Chrome.xml" `
                     -BinaryFilePath "C:\WDACPolicies\Supplemental_Chrome.p7b"

# Step 4: Deploy supplemental policy
$suppDest = "$env:WINDIR\System32\CodeIntegrity\CiPolicies\Active"
Copy-Item "C:\WDACPolicies\Supplemental_Chrome.p7b" -Destination $suppDest

# Verify all active policies
citool.exe --list-policies
```

## Base + Supplemental Architecture

```
Base Policy (DefaultWindows / AllowMicrosoft)
  └─ Supplemental: Google Chrome
  └─ Supplemental: Adobe Reader DC
  └─ Supplemental: Custom Internal Tools
  └─ Supplemental: SCCM Managed Installer
```

## Description

Supplemental policies extend a base WDAC policy without modifying it. This architecture allows a centrally managed base policy (maintained by security team) to be extended by app owners or local admins with scoped supplemental policies. Supplemental policies can be deployed, updated, and removed independently — making WDAC practical in large enterprises where thousands of applications need coverage.

## Impact

- ✅ Modular policy architecture — update app-specific rules without touching base
- ✅ Allows delegation: app team manages their supplemental policy
- ✅ Supplementals can be scoped to specific OUs/devices in Intune
- ⚠️ Requires Windows 10 1903+ for multiple active policies
- ℹ️ Use `citool.exe --list-policies` to audit all active base + supplemental policies

## Compliance References

- **Microsoft Security Baseline:** Multiple policy deployment model
- **ACSC Essential Eight:** Supplemental policy pattern for managed environments

## Test Status

✔ Tested on Windows 11 24H2 with Base + 3 supplemental policies active simultaneously
