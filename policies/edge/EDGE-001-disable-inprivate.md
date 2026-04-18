# EDGE-001 — Disable InPrivate Browsing

**ID:** EDGE-001  
**Category:** Microsoft Edge / Privacy Controls  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Policy Path

`Computer Configuration > Administrative Templates > Microsoft Edge > InPrivate mode availability`

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  InPrivateModeAvailability = 1
  (0 = available, 1 = disabled, 2 = forced)
```

## PowerShell

```powershell
# Disable InPrivate browsing
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
if (-not (Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "InPrivateModeAvailability" -Value 1 -Type DWord -Force

# Verify
Get-ItemProperty $path | Select InPrivateModeAvailability
```

## Description

Disables InPrivate browsing mode in Microsoft Edge. InPrivate mode bypasses browser history, cookies, and caching, which can be exploited to evade DLP controls, conduct unauthorized research, or exfiltrate data without leaving local traces.

## Impact

Users will be unable to open InPrivate windows. All browsing sessions will be recorded in the browser history and subject to corporate monitoring and DLP policies. This may affect legitimate privacy use cases but is appropriate in regulated or high-security environments.

## Use Cases

- Prevent users from bypassing web content filters via InPrivate sessions
- Enforce DLP policy coverage across all browsing activity
- Support compliance in environments subject to HIPAA, PCI-DSS, or GDPR audit requirements
- Reduce risk of data exfiltration via unmonitored browser sessions

## MITRE ATT&CK

- **T1048** — Exfiltration Over Alternative Protocol
- **T1567** — Exfiltration Over Web Service

## Intune CSP

`./Device/Vendor/MSFT/Policy/Config/Browser/AllowInPrivate`  
Value: `0` (block)

## References

- [CIS Microsoft Edge Benchmark v3.0](https://www.cisecurity.org/benchmark/microsoft_edge)
- [Microsoft Edge security baseline](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-security-baseline)
- [InPrivateModeAvailability policy](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies#inprivatemodeavailability)

## Metadata

| Field | Value |
|---|---|
| Version | 1.1 |
| Last Updated | 2026-04-18 |
| Author | PolicyForge |
| Status | Active |
