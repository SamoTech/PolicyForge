# EDGE-006 — Force HTTPS & Block Insecure Protocols

**ID:** EDGE-006  
**Category:** Microsoft Edge / Protocol Security  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  AutomaticHttpsDefault             = 2    (0=off, 1=opt-in, 2=always force HTTPS)
  SSLVersionMin                     = "tls1.2"  (minimum TLS 1.2)
  SSLErrorOverrideAllowed           = 0    (no SSL error bypass)
  SSLErrorOverrideAllowedForOrigins = []   (no per-origin bypass)
  InsecureContentAllowedForUrls     = []   (no mixed content allowed)
  InsecureContentBlockedForUrls     = ["*"] (block mixed content on all sites)
  AllowDeletingBrowserHistory       = 0
  HTTPSOnlyMode                     = 1
```

## PowerShell

```powershell
# Apply HTTPS enforcement settings
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
$settings = @{
    AutomaticHttpsDefault   = 2
    SSLVersionMin           = "tls1.2"
    SSLErrorOverrideAllowed = 0
    HTTPSOnlyMode           = 1
}
$settings.GetEnumerator() | ForEach-Object {
    Set-ItemProperty -Path $path -Name $_.Key -Value $_.Value -Force
}

# Verify
Get-ItemProperty $path | Select AutomaticHttpsDefault, SSLVersionMin, SSLErrorOverrideAllowed
```

## Description

Forces Edge to upgrade HTTP connections to HTTPS automatically and blocks SSL/TLS errors from being bypassed. Without this, users can:
- Visit HTTP sites where credentials/data are transmitted in cleartext
- Click through SSL certificate errors on malicious MITM sites
- Load mixed content (HTTP resources on HTTPS pages)

Setting `SSLVersionMin = tls1.2` ensures TLS 1.0 and 1.1 (deprecated, vulnerable to BEAST/POODLE) cannot be negotiated. Setting `SSLErrorOverrideAllowed = 0` prevents users from bypassing certificate warnings, which attackers use in MITM attacks.

## TLS Version Reference

| Version | Status | Vulnerabilities |
|---|---|---|
| SSL 3.0 | 🔴 Broken | POODLE |
| TLS 1.0 | 🔴 Deprecated | BEAST, POODLE |
| TLS 1.1 | 🔴 Deprecated | Limited cipher suite |
| **TLS 1.2** | ✅ Minimum | None known if configured correctly |
| TLS 1.3 | ✅ Preferred | None known |

## MITRE ATT&CK Coverage

T1557 (Adversary-in-the-Middle), T1040 (Network Sniffing)

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.10, 2.11 (L1)
- **DISA STIG:** EDGE-00-000025
- **NIST 800-52:** TLS implementation guidelines

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
✔ HTTP URLs auto-upgraded to HTTPS
✔ TLS 1.0/1.1 connections rejected
