# CRED-006 — Restrict NTLM: Block Outbound NTLM to Remote Servers

**ID:** CRED-006  
**Category:** Credential Hardening / NTLM Restriction  
**Risk Level:** 🔴 Critical  
**OS:** Windows 7+, Windows 11, Windows Server 2008+  
**Source:** Microsoft Security Baseline Windows 11 25H2 · CIS Windows 11 v3.0

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Local Policies
                 └─ Security Options
                      └─ Network security: Restrict NTLM: Outbound NTLM traffic to remote servers
                           └─ Deny all
```

## Registry

```
Key:   HKLM\SYSTEM\CurrentControlSet\Control\Lsa\MSV1_0
Value: RestrictSendingNTLMTraffic
Type:  DWORD
Data:  2  (0=Allow all, 1=Audit, 2=Deny all)
```

## PowerShell

```powershell
# Restrict outbound NTLM (Deny all)
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa\MSV1_0"
If (-not (Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "RestrictSendingNTLMTraffic" -Value 2 -Type DWord

# Step 1: Set to 1 (Audit) and review Event ID 8001 in Applications and Services Logs\Microsoft\Windows\NTLM
# Step 2: Once audit is clean, set to 2 (Deny all)

# Verify
Get-ItemProperty -Path $path -Name RestrictSendingNTLMTraffic
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkSecurity_RestrictNTLM_OutgoingNTLMTrafficToRemoteServers
Type:    Integer
Value:   2
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\MSV1_0]
"RestrictSendingNTLMTraffic"=dword:00000002
```

## Description

Prevents Windows from sending NTLM authentication to remote servers. This eliminates the ability for attackers to coerce NTLM authentication (via responder, PrinterBug, PetitPotam, etc.) to a rogue server where the hash can be captured and cracked or relayed. Use Audit mode (value=1) first to identify legitimate NTLM dependencies before enforcing Deny.

## Impact

- ✅ Breaks NTLM relay and hash capture attacks requiring coerced authentication
- ✅ Defeats Responder, PetitPotam, PrinterBug, and DFSCoerce
- ⚠️ Breaks applications that explicitly require NTLM (old ERP, some network scanners)
- ⚠️ MUST audit first (value=1) before enforcing (value=2) — do not skip audit phase

## Use Cases

- Environments eliminating NTLM in favor of Kerberos
- Post-PetitPotam/NTLM relay incident hardening
- High-security domains with modern application stacks

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Forced Authentication | T1187 | Credential Access |
| Adversary-in-the-Middle | T1557 | Credential Access |
| NTLM Relay | T1557.002 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 2.3.11.9 (L2)
- **DISA STIG:** WN11-SO-000220
- **Microsoft Security Baseline:** Windows 11 25H2 (recommended)

## Test Status

✔ Tested on Windows 11 24H2 — Audit mode (Event ID 8001 verified)
⬜ Enforce mode — requires application compatibility audit first
