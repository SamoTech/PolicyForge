---
id: "WIN-CATEGORY-XXX"
name: ""
category: []
risk_level: "Low | Medium | High | Critical"
applies_to: []
test_status: ""
---

# Policy Name Here

## Policy Path

```
Computer Configuration (or User Configuration)
  └── Administrative Templates
        └── [Category]
              └── [Subcategory]
                    └── Policy Name
```

## Registry

| Key | Value |
|---|---|
| **Path** | `HKLM\\...` |
| **Value Name** | `` |
| **Data** | `` |
| **Type** | `REG_DWORD` |

## Description

<!-- What does this policy do? Why does it exist? Plain language, 2-4 sentences. -->

## Impact

- <!-- What breaks or changes when this is enabled/disabled? -->
- <!-- Any dependencies or related features affected? -->

## Use Cases

- ✅ <!-- When would you enable this? -->
- ✅ <!-- What environments benefit? -->

## Translations

### Intune CSP (OMA-URI)

```
OMA-URI: 
Data Type: Integer
Value: 
```

### PowerShell

```powershell
# Apply policy
Set-ItemProperty -Path "" -Name "" -Value  -Type DWord -Force
```

### Registry Export (.reg)

```reg
Windows Registry Editor Version 5.00

[HKEY_...]
""=dword:
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [TXXXX](https://attack.mitre.org/techniques/TXXXX/) | ... |

## Compliance References

- **CIS Benchmark**: 
- **DISA STIG**: 
- **NIST SP 800-53**: 

## Notes

<!-- Any additional notes, caveats, or links to official docs. -->
