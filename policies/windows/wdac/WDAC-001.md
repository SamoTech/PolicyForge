# WDAC-001 — Deploy WDAC Base Policy in Audit Mode

**ID:** WDAC-001  
**Category:** WDAC (Windows Defender Application Control) / Base Policy  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10 1903+, Windows 11, Windows Server 2016+  
**Source:** Microsoft WDAC Documentation · learn.microsoft.com/wdac

---

## Overview

WDAC (now called **App Control for Business**) is Microsoft's kernel-level application control solution. Unlike AppLocker (user-mode), WDAC operates at the kernel level and cannot be bypassed by local administrators. WDAC policies are enforced by the Windows kernel before any user-mode code runs.

**AppLocker vs WDAC:**

| Feature | AppLocker | WDAC |
|---|---|---|
| Enforcement level | User-mode | Kernel-mode |
| Admin bypass | Yes (local admin) | No |
| OS editions | Enterprise/Education | All editions (Win 10 1709+) |
| Policy format | XML (GPO) | Binary/XML (SIPolicy.p7b) |
| Management | GPO, Intune | GPO, Intune, MDM, script |
| Complexity | Medium | High |
| False positive risk | Medium | High |

---

## Starting from Example Base Policies

```powershell
# Microsoft-provided example policies location:
$examplePolicies = "$env:WINDIR\schemas\CodeIntegrity\ExamplePolicies"
Get-ChildItem $examplePolicies

# Recommended starting point:
# DefaultWindows_Audit.xml   — allows only Windows/signed MS code (audit mode)
# AllowMicrosoft_Audit.xml   — allows all Microsoft-signed code (broader, safer start)
```

## PowerShell — Create Audit Policy

```powershell
# Step 1: Copy example policy as starting point
$source = "$env:WINDIR\schemas\CodeIntegrity\ExamplePolicies\DefaultWindows_Audit.xml"
$dest   = "C:\WDACPolicies\MyPolicy_Audit.xml"
Copy-Item $source $dest

# Step 2: Set policy name and ID
[xml]$policy = Get-Content $dest
$policy.SiPolicy.PolicyID  = "{$(New-Guid)}"
$policy.SiPolicy.BasePolicyID = "{$(New-Guid)}"
$policy.Save($dest)

# Step 3: Compile to binary
ConvertFrom-CIPolicy -XmlFilePath $dest `
                     -BinaryFilePath "C:\WDACPolicies\SIPolicy.p7b"

# Step 4: Deploy (copies to CodeIntegrity directory)
Copy-Item "C:\WDACPolicies\SIPolicy.p7b" `
          -Destination "$env:WINDIR\System32\CodeIntegrity\SIPolicy.p7b"

# Step 5: Reboot to activate
Restart-Computer -Force
```

## Intune Deployment

```
Endpoint Security > App Control for Business
  └─ Create Policy
       ├─ Platform: Windows 10 and later
       ├─ Profile: App Control for Business
       └─ Options:
            ├─ App control policy enforcement: Audit only
            └─ Upload policy XML: [your policy file]
```

## Description

WDAC enforces code integrity at the kernel level — preventing any code not explicitly trusted by the policy from running. The audit mode deployment allows you to identify what would be blocked before enforcement, building a block list of violations that you can evaluate and either add to the allow list or confirm as legitimate blocks.

## Impact

- ✅ Kernel-level enforcement — cannot be bypassed by local admins
- ✅ Protects against driver-level attacks (BYOVD complement to ASR-001)
- ⚠️ Very high initial false positive rate — must run audit for 30+ days
- ⚠️ Complex to maintain — requires policy updates for every new application
- ℹ️ Use multiple policies (base + supplemental) for modularity

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation for Client Execution | T1203 | Execution |
| Signed Binary Proxy Execution | T1218 | Defense Evasion |
| BYOVD / Vulnerable Driver | T1068 | Privilege Escalation |

## Compliance References

- **Microsoft Security Baseline:** Windows 11 24H2 (Recommended)
- **ACSC Essential Eight:** Application control Maturity Level 2-3
- **NIST 800-53:** CM-7 Least Functionality
- **CIS Benchmark:** Windows 11 v3.0 — Advanced hardening

## Test Status

✔ Tested on Windows 11 24H2 with DefaultWindows_Audit.xml base
✔ Event 3076 fires for audit violations
