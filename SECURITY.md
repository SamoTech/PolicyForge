# Security Policy

## Responsible Use

PolicyForge contains documentation of Windows Group Policy configurations, including a [Red Team Evasion](templates/redteam-evasion/) section that documents attack paths through policy misconfigurations.

This content exists **exclusively** to help defenders understand attacker techniques and validate their detection coverage. All offensive content:
- Is paired with a direct defensive mitigation
- Is mapped to a MITRE ATT&CK technique
- Requires **explicit written authorization** to use in any environment

Misuse of this material may violate the Computer Fraud and Abuse Act (CFAA), the Computer Misuse Act (UK), or equivalent laws in your jurisdiction.

---

## Reporting a Vulnerability

If you discover a security vulnerability in PolicyForge's automation scripts or tooling:

1. **Do NOT open a public GitHub issue**
2. Email: **security@samotech.dev** (or open a [GitHub Security Advisory](https://github.com/SamoTech/PolicyForge/security/advisories/new))
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

We will acknowledge receipt within **48 hours** and aim to release a fix within **14 days** for critical issues.

---

## Reporting Incorrect Policy Guidance

If a policy entry contains incorrect registry values, wrong CSP mappings, or guidance that could cause harm if followed:

1. Open a [GitHub Issue](https://github.com/SamoTech/PolicyForge/issues/new?template=correction.md) using the **Correction** template
2. Label it `security-correction` and `high-priority`
3. We treat incorrect security guidance as a critical issue

---

## Scope

| In Scope | Out of Scope |
|---|---|
| Bugs in `admx_parser.py`, `policy_diff.py`, `translation-engine.ps1`, `verify.ps1` | Vulnerabilities in Windows itself |
| Incorrect/dangerous policy values in policy docs | Third-party tools referenced in docs |
| XSS/injection in future web UI (Phase 3) | Social engineering attacks |

---

## Policy on Offensive Content

PolicyForge will **not** publish:
- Zero-day exploits or unpatched vulnerabilities
- Complete attack toolchains (only technique awareness)
- Content without a corresponding defensive fix
- Anything targeting specific organizations or individuals

Content that crosses these lines will be removed immediately upon report.
