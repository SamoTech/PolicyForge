# WDAC-002 — Generate WDAC Policy from Audit Events

**ID:** WDAC-002  
**Category:** WDAC / Policy Generation / Audit-to-Enforce  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10 1903+, Windows 11  
**Source:** Microsoft WDAC Documentation

---

## Event IDs to Monitor

| Event ID | Log | Meaning |
|---|---|---|
| 3076 | CodeIntegrity/Operational | Would have been blocked (Audit mode) |
| 3077 | CodeIntegrity/Operational | Was blocked (Enforce mode) |
| 3089 | CodeIntegrity/Operational | Signature information for blocked file |
| 3099 | CodeIntegrity/Operational | Policy activated |

```
Log Path: Applications and Services Logs > Microsoft > Windows > CodeIntegrity > Operational
```

## PowerShell — Scan Audit Events and Generate Policy

```powershell
# Step 1: Collect audit events into policy supplement
New-CIPolicy -Audit -Level Publisher -Fallback Hash `
             -FilePath "C:\WDACPolicies\AuditEventPolicy.xml" `
             -UserPEs  # Include user-mode PE files

# Step 2: Merge audit-generated rules into base policy
$basePolicyPath  = "C:\WDACPolicies\MyPolicy_Audit.xml"
$auditPolicyPath = "C:\WDACPolicies\AuditEventPolicy.xml"
$mergedPath      = "C:\WDACPolicies\MyPolicy_Merged.xml"

Merge-CIPolicy -PolicyPaths $basePolicyPath, $auditPolicyPath `
               -OutputFilePath $mergedPath

# Step 3: Review merged policy before deploying
[xml](Get-Content $mergedPath) | Select-Xml "//Allow" | Select -ExpandProperty Node

# Step 4: Compile merged policy
ConvertFrom-CIPolicy -XmlFilePath $mergedPath `
                     -BinaryFilePath "C:\WDACPolicies\SIPolicy_Merged.p7b"

# Step 5: Test before enforce — still in Audit mode
# Change rule option 3 (Audit Mode) to enforce:
Set-RuleOption -FilePath $mergedPath -Option 3 -Delete  # Removes audit mode = enforces
ConvertFrom-CIPolicy -XmlFilePath $mergedPath -BinaryFilePath "C:\WDACPolicies\SIPolicy_Enforce.p7b"
```

## Description

After running in Audit mode, WDAC generates Event 3076 for every file that would have been blocked. This workflow converts those audit events into actual allow rules, merges them with the base policy, and prepares an enforcement-ready policy. This is the core "audit → learn → enforce" cycle that makes WDAC deployable in production without mass application breakage.

## Audit → Enforce Workflow

```
Week 1-4:  Deploy Audit policy → collect Event 3076
Week 5:    Run New-CIPolicy -Audit to extract events → review
Week 5-6:  Merge with base policy → deploy merged Audit policy
Week 7-8:  No new 3076 events = ready to enforce
Week 9:    Switch to Enforce mode (remove Option 3)
Ongoing:   Monitor Event 3077 for unexpected blocks → update supplemental policy
```

## Impact

- ✅ Converts audit findings into precise allow rules
- ✅ Minimizes false positives before enforcement
- ⚠️ Audit events can be very high volume on busy endpoints
- ℹ️ Use Level=Publisher with Fallback=Hash for best rule durability

## Test Status

✔ Tested on Windows 11 24H2
✔ New-CIPolicy -Audit successfully generates supplemental policy from events
