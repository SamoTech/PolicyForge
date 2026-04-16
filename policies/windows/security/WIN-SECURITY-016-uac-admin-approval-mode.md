# WIN-SECURITY-016 — UAC Admin Approval Mode

## Metadata

| Field | Value |
|---|---|
| **ID** | WIN-SECURITY-016 |
| **Category** | Privilege Control |
| **Risk Level** | 🔴 Critical |
| **OS** | Windows Vista+, Windows 10, 11, Server 2008+ |
| **Test Status** | ✅ Tested on Windows 11 24H2 |
| **CIS Benchmark** | CIS L1 — 2.3.17.1, 2.3.17.6 |
| **DISA STIG** | WN10-SO-000250, WN10-SO-000255 |

---

## Policy Path

```
Computer Configuration > Windows Settings > Security Settings
> Local Policies > Security Options
> User Account Control: Run all administrators in Admin Approval Mode
```

## Registry

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System]
; Enable UAC Admin Approval Mode
"EnableLUA"=dword:00000001

; Prompt behavior for admins: Prompt for credentials on secure desktop
"ConsentPromptBehaviorAdmin"=dword:00000001

; Prompt behavior for standard users: Prompt for credentials
"ConsentPromptBehaviorUser"=dword:00000003

; Enable secure desktop for elevation prompt
"PromptOnSecureDesktop"=dword:00000001

; Detect application installations and prompt
"EnableInstallerDetection"=dword:00000001
```

## PowerShell

```powershell
$uacPath = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'

Set-ItemProperty -Path $uacPath -Name 'EnableLUA'                      -Value 1
Set-ItemProperty -Path $uacPath -Name 'ConsentPromptBehaviorAdmin'     -Value 1
Set-ItemProperty -Path $uacPath -Name 'ConsentPromptBehaviorUser'      -Value 3
Set-ItemProperty -Path $uacPath -Name 'PromptOnSecureDesktop'          -Value 1
Set-ItemProperty -Path $uacPath -Name 'EnableInstallerDetection'       -Value 1

# Verify
Get-ItemProperty $uacPath | Select-Object EnableLUA, ConsentPromptBehaviorAdmin, PromptOnSecureDesktop
```

## Intune CSP (OMA-URI)

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_RunAllAdministratorsInAdminApprovalMode
Data Type: Integer
Value: 1

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_BehaviorOfTheElevationPromptForAdministrators
Data Type: Integer
Value: 1

OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_SwitchToTheSecureDesktopWhenPromptingForElevation
Data Type: Integer
Value: 1
```

## Description

User Account Control (UAC) Admin Approval Mode ensures that even administrators run with standard user privileges by default. Elevation to full admin rights requires explicit consent via a secure desktop prompt, preventing silent privilege escalation by malware.

## Impact

- ✅ Prevents silent privilege escalation by malware
- ✅ Secure desktop prompt blocks overlay/clickjacking attacks
- ✅ Core defense against UAC bypass techniques
- ⚠️ Administrators will see more elevation prompts — acceptable trade-off
- ⚠️ Disabling UAC (`EnableLUA=0`) removes ALL Windows app security boundaries — never do this

## Use Cases

- All endpoints (universal — never disable UAC)
- Privileged Access Workstations (set `ConsentPromptBehaviorAdmin=1` — credentials, not just consent)
- Highly regulated environments — pair with Application Control (Windows Defender WDAC)

## MITRE ATT&CK

| Technique | ID | Description |
|---|---|---|
| Abuse Elevation Control Mechanism: Bypass UAC | T1548.002 | UAC Admin Approval Mode is the primary defense |
| Privilege Escalation | TA0004 | UAC limits blast radius of standard-user compromise |

## References

- [Microsoft UAC Architecture](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/)
- [CIS UAC Guidance](https://www.cisecurity.org/cis-benchmarks)
