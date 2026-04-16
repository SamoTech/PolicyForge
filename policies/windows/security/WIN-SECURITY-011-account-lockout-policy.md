---
id: WIN-SECURITY-011
name: Configure Account Lockout Policy
category: [Security, Account Management, Brute Force Prevention]
risk_level: Medium
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2, Server 2022"
---

# Configure Account Lockout Policy

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Account Policies
                    └── Account Lockout Policy
```

## Recommended Values

| Setting | Recommended | Notes |
|---|---|---|
| Lockout threshold | 5 invalid attempts | CIS recommends ≤5 |
| Lockout duration | 15 minutes | 0 = admin unlock for high-security |
| Reset counter after | 15 minutes | Must be ≤ lockout duration |

## Description

Prevents brute-force and password spray attacks by locking accounts after repeated failures. Five attempts balances security against operational disruption from typos.

## PowerShell

```powershell
net accounts /lockoutthreshold:5
net accounts /lockoutduration:15
net accounts /lockoutwindow:15
net accounts
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1110.003](https://attack.mitre.org/techniques/T1110/003/) | Brute Force: Password Spraying |
| [T1110.001](https://attack.mitre.org/techniques/T1110/001/) | Brute Force: Password Guessing |

## Compliance References

- **CIS Benchmark**: Level 1, Controls 1.2.1–1.2.3
- **PCI-DSS**: Requirement 8.1.6
- **NIST SP 800-53**: AC-7
