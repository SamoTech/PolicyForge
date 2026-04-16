---
id: DEF-005
name: Configure Attack Surface Reduction (ASR) Rules
category: [Defender, Attack Surface Reduction, Critical Hardening]
risk_level: High
applies_to: [Windows 10 1709+, Windows 11, Windows Server 2019+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Configure Attack Surface Reduction (ASR) Rules

## Policy Path

```
Computer Configuration
  └── Administrative Templates
        └── Windows Components
              └── Microsoft Defender Antivirus
                    └── Microsoft Defender Exploit Guard
                          └── Attack Surface Reduction
                                └── Configure Attack Surface Reduction rules → Enabled
```

## Description

ASR rules are targeted behavioral controls that block specific attacker techniques regardless of malware signature. Each rule targets a distinct attack vector. These are among the most effective controls for stopping ransomware and fileless attacks — Microsoft reports ASR blocks millions of attack attempts daily across enterprise environments.

## Critical ASR Rules (Enable in Block Mode)

| Rule Name | GUID | Blocks |
|---|---|---|
| Block Office apps from creating child processes | `D4F940AB-401B-4EFC-AADC-AD5F3C50688A` | Malicious macros spawning cmd/PowerShell |
| Block credential stealing from LSASS | `9E6C4E1F-7D60-472F-BA1A-A39EF669E4B0` | Mimikatz-style LSASS access |
| Block Office macros from Win32 API calls | `92E97FA1-2EDF-4476-BDD6-9DD0B4DDDC7B` | Macro-based shellcode injection |
| Block executable content from email/webmail | `BE9BA2D9-53EA-4CDC-84E5-9B1EEEE46550` | Email-delivered malware |
| Block JavaScript/VBScript launching executables | `D3E037E1-3EB8-44C8-A917-57927947596D` | Script-based dropper attacks |
| Block process creations from PSExec and WMI | `D1E49AAC-8F56-4280-B9BA-993A6D` | Lateral movement tools |
| Block untrusted/unsigned processes from USB | `B2B3F03D-6A65-4F7B-A9C7-1C7EF74A9BA4` | Removable media malware |
| Block Office apps from injecting into processes | `75668C1F-73B5-4CF0-BB93-3ECF5CB7CC84` | Process injection from macros |

## Deployment Strategy

```powershell
# Step 1: Audit mode for all rules (recommended 2 weeks)
$rules = @(
    "D4F940AB-401B-4EFC-AADC-AD5F3C50688A",
    "9E6C4E1F-7D60-472F-BA1A-A39EF669E4B0",
    "92E97FA1-2EDF-4476-BDD6-9DD0B4DDDC7B",
    "BE9BA2D9-53EA-4CDC-84E5-9B1EEEE46550",
    "D3E037E1-3EB8-44C8-A917-57927947596D",
    "B2B3F03D-6A65-4F7B-A9C7-1C7EF74A9BA4"
)

foreach ($rule in $rules) {
    Add-MpPreference -AttackSurfaceReductionRules_Ids $rule `
                     -AttackSurfaceReductionRules_Actions AuditMode
}

# Step 2: After review, switch to Block
# foreach ($rule in $rules) {
#     Add-MpPreference -AttackSurfaceReductionRules_Ids $rule `
#                      -AttackSurfaceReductionRules_Actions Enabled
# }

# Verify
Get-MpPreference | Select AttackSurfaceReductionRules_Ids, AttackSurfaceReductionRules_Actions
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Defender/AttackSurfaceReductionRules
Data Type: String
Value: <GUID>=<state>|<GUID>=<state>  (1=Block, 2=Audit)
```

## MITRE ATT&CK Mapping

| Technique | Rule |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Phishing: Spearphishing Attachment — Email executable content rule |
| [T1055](https://attack.mitre.org/techniques/T1055/) | Process Injection — Office injection rule |
| [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | LSASS Credential Dump — LSASS protection rule |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 18.9.47.11.x
- **DISA STIG**: WN10-00-000015
- **NIST SP 800-53**: SI-3, SI-16
