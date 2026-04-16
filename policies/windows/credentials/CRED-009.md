# CRED-009 — Enforce Kerberos AES Encryption (Disable RC4/DES)

**ID:** CRED-009  
**Category:** Credential Hardening / Kerberos  
**Risk Level:** 🔴 Critical  
**OS:** Windows 7+, Windows 11, Windows Server 2008+  
**Source:** Microsoft Security Advisory KB5021131 · Windows 11 Security Baseline 2026 · [osmachine.com](https://osmachine.com/public/index.php/blog/windows-11-security-baseline-hardening-guide)

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Local Policies
                 └─ Security Options
                      └─ Network security: Configure encryption types allowed for Kerberos
                           └─ Enable: AES128_HMAC_SHA1, AES256_HMAC_SHA1, Future encryption types
                           └─ Disable: DES_CBC_CRC, DES_CBC_MD5, RC4_HMAC_MD5
```

## Registry

```
Key:   HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters
Value: SupportedEncryptionTypes
Type:  DWORD
Data:  2147483640  (AES128 + AES256 + Future = 0x7FFFFFF8)

; To include only AES256:
; Data: 8  (0x8 = AES256_HMAC_SHA1 only)
```

## PowerShell

```powershell
# Set Kerberos to AES-only (disable RC4 and DES)
$kerbPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters"
If (-not (Test-Path $kerbPath)) { New-Item -Path $kerbPath -Force }
Set-ItemProperty -Path $kerbPath -Name "SupportedEncryptionTypes" -Value 2147483640 -Type DWord

# 2147483640 = AES128 + AES256 + Future
# 24 = AES128 + AES256 only (no future types)
# 8 = AES256 only (most restrictive)

# Verify
Get-ItemProperty -Path $kerbPath -Name SupportedEncryptionTypes

# Check current Kerberos tickets (should show AES256-CTS)
klist
```

## Intune CSP

```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkSecurity_ConfigureEncryptionTypesAllowedForKerberos
Type:    Integer
Value:   2147483640
```

## .REG Export

```reg
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters]
"SupportedEncryptionTypes"=dword:7ffffff8
```

## Description

RC4 (ARCFOUR) and DES are cryptographically broken encryption algorithms. Kerberoasting attacks specifically target service accounts using RC4-encrypted TGS tickets — offline cracking of RC4 Kerberos tickets is feasible in hours with modern hardware. Forcing AES-only Kerberos encryption closes the Kerberoasting attack vector for AES-keyed accounts. This setting also addresses CVE-2022-37966 and the broader KB5021131 Kerberos PAC security updates.

## Impact

- ✅ Closes Kerberoasting attack vector (RC4 ticket cracking)
- ✅ Eliminates DES Kerberos encryption (trivially broken)
- ✅ Required for compliance with FIPS 140-2/3
- ⚠️ Breaks authentication for service accounts without AES keys (run `klist` and audit first)
- ⚠️ Requires all domain accounts to have AES keys set (run `Set-ADUser -KerberosEncryptionType AES256`)
- ⚠️ Breaks trusts with legacy domains using RC4-only

## Use Cases

- All environments targeting Kerberoasting prevention
- Domains with modern application stacks (Server 2016+)
- FIPS 140-2/3 compliance requirements
- Post-Kerberoasting incident hardening

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Kerberoasting | T1558.003 | Credential Access |
| Steal or Forge Kerberos Tickets: Golden Ticket | T1558.001 | Credential Access |
| Steal or Forge Kerberos Tickets: Silver Ticket | T1558.002 | Credential Access |

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 2.3.11.10 (L2)
- **DISA STIG:** WN11-SO-000230
- **NIST SP 800-171:** 3.13.10 — Employ FIPS-validated cryptography
- **FIPS 140-2:** Required
- **CVE Reference:** CVE-2022-37966, KB5021131

## Test Status

✔ Tested on Windows 11 24H2 (klist shows AES256-CTS)
✔ Tested on Windows Server 2022 DC
✔ Verified Kerberoasting tool (Rubeus) returns empty/AES-only tickets
