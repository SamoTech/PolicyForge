# Security Baselines Template

This template provides a curated baseline of Windows security policies aligned with CIS Benchmarks, DISA STIG, and Microsoft Security Baseline recommendations.

## Policies Included

| ID | Policy | Risk | Status |
|---|---|---|---|
| WIN-SECURITY-001 | Disable AutoRun / AutoPlay | Critical | ✅ |
| WIN-SECURITY-002 | Disable SMBv1 Protocol | Critical | ✅ |
| WIN-PRIVACY-001 | Disable Windows Telemetry | Medium | ✅ |
| WIN-SECURITY-006 | Enable Windows Defender Credential Guard | High | 🔄 |
| WIN-SECURITY-003 | Disable LLMNR Protocol | Critical | 🔄 |
| WIN-SECURITY-005 | Enable Windows Firewall (all profiles) | High | 🔄 |
| WIN-SECURITY-013 | Require NLA for RDP | Critical | 🔄 |
| WIN-SECURITY-007 | Disable WDigest Authentication | Critical | 🔄 |
| WIN-SECURITY-009 | Audit Process Creation | High | 🔄 |

## Usage

1. Review each policy in `policies/windows/` before deployment
2. Run `deploy.ps1` to apply all settings
3. Run `verify.ps1` to confirm settings applied correctly
4. Run `rollback.ps1` to revert if needed

## Compliance References

- [CIS Microsoft Windows Benchmarks](https://www.cisecurity.org/benchmark/microsoft_windows_desktop)
- [DISA STIG Viewer](https://public.cyber.mil/stigs/)
- [Microsoft Security Compliance Toolkit](https://www.microsoft.com/en-us/download/details.aspx?id=55319)
