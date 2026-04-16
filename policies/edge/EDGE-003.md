# EDGE-003 — Disable Built-in Password Manager

**ID:** EDGE-003  
**Category:** Microsoft Edge / Credential Security  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Microsoft Edge
            ├─ Enable saving passwords to the password manager: Disabled
            └─ Password manager
                 └─ Configure the list of domains for which the
                    password manager UI is disabled: Enabled → *
```

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  PasswordManagerEnabled = 0    (0=disable, 1=enable)
  PasswordRevealEnabled  = 0    (disable password reveal button)
```

## Description

Edge's built-in password manager stores credentials in the user's browser profile, which is protected by DPAPI (user session key). While this is reasonable for home users, enterprise environments should use a dedicated enterprise password manager (1Password, Keeper, Bitwarden for Business, CyberArk). Browser-stored credentials are accessible to:

- **Malware** with user-level access (DPAPI decryption in user context)
- **`edge://settings/passwords`** — visible to anyone with physical access
- **Browser profile theft** — copy `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data`
- **InfoStealer malware** — Redline, Vidar, Raccoon specifically target browser credential stores

## Password Manager Threat Model

| Threat | Browser PM | Enterprise PM |
|---|---|---|
| Infostealer malware | 🔴 Vulnerable | 🟢 Protected (separate process) |
| Physical access | 🔴 Visible in settings | 🟢 Requires master password |
| Profile backup theft | 🔴 Vulnerable | 🟢 Encrypted vault |
| IT visibility | 🔴 None | 🟢 Admin console |
| MFA for vault access | 🔴 No | 🟢 Yes |
| Zero-knowledge encryption | 🔴 No | 🟢 Yes (most enterprise PMs) |

## Impact

- ✅ Eliminates infostealer credential theft via browser store
- ✅ Forces use of enterprise password manager (better security + IT visibility)
- ⚠️ Users lose convenience of browser autofill — communicate alternatives
- ℹ️ Deploy enterprise PM before enforcing this policy

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.6 (L1)
- **Microsoft Security Baseline:** Edge 131+
- **DISA STIG:** EDGE-00-000020

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
