# Contributing to PolicyForge

First off — **thank you**. PolicyForge is only as powerful as the community behind it.

---

## 🎯 What You Can Contribute

| Type | Description | Impact |
|---|---|---|
| 📝 Policy Explanation | Add or improve a policy's description, impact, or use cases | ⭐⭐⭐ |
| 🛠️ Template | New deployment template (baseline, hardening, kiosk, etc.) | ⭐⭐⭐⭐ |
| 🔄 Translation | GPO ↔ Intune CSP mapping, Registry ↔ ADMX, PowerShell equivalent | ⭐⭐⭐⭐ |
| 🧪 Test Result | Verified behavior on a specific Windows/Server version | ⭐⭐ |
| 🔐 Security Research | Attacker-abused misconfigs, MITRE ATT&CK mappings | ⭐⭐⭐⭐⭐ |
| 🤖 Automation | Parser improvements, diff tools, doc generators | ⭐⭐⭐⭐ |
| 🐛 Correction | Fix inaccurate registry paths, wrong CSP URIs, outdated info | ⭐⭐ |

---

## 📋 Policy Contribution Guidelines

All policy entries **must** follow the [`POLICY_SCHEMA.json`](POLICY_SCHEMA.json) format.

### Step-by-Step

1. **Fork** this repository
2. **Create a branch**: `git checkout -b policy/win-privacy-telemetry`
3. **Add your file** under the correct category:
   - `policies/windows/privacy/` — Windows privacy settings
   - `policies/windows/security/` — Security hardening
   - `policies/windows/network/` — Network policies
   - `policies/defender/` — Windows Defender / AV
   - `policies/edge/` — Microsoft Edge
   - `policies/office/` — Microsoft 365 / Office
   - `policies/server/` — Windows Server
4. **Use the template** at `policies/_TEMPLATE.md`
5. **Submit a Pull Request** with:
   - Title: `[Policy] Disable Windows Telemetry`
   - Windows version tested on
   - Any caveats or edge cases

### Quality Checklist

- [ ] Registry path is accurate and verified
- [ ] Intune CSP OMA-URI sourced from official Microsoft docs
- [ ] PowerShell command runs without error
- [ ] Risk level is appropriate and justified
- [ ] At least one real-world use case is provided
- [ ] Impact section mentions potential breakage

---

## 🛠️ Template Contribution Guidelines

Each template folder must contain:

```
templates/enterprise-hardening/
├── README.md        # What it does, target environment
├── gpo-backup/      # Exported GPO backup (XML)
├── registry.reg     # Registry export
├── deploy.ps1       # PowerShell deployment script
└── policies.md      # List of all policies applied with rationale
```

---

## 🔐 Security Research Guidelines

> ⚠️ Contributions to `templates/redteam-evasion/` are strictly for defensive research.

- Document **what the misconfiguration is** and **how it's abused**
- Always include **the defensive mitigation**
- Reference the MITRE ATT&CK technique ID
- Include a `DISCLAIMER.md` in the subfolder

---

## 🏆 Contributor Badges

| Badge | Criteria |
|---|---|
| 🥇 Core Contributor | 10+ merged policy entries |
| 🎯 Policy Hunter | First to document a new or undocumented policy |
| 🧠 Zero-Day Config Finder | Security research with CVE/MITRE reference |
| 🛠️ Template Architect | Template used by 10+ contributors |
| 🤖 Automation Builder | Merged automation script or tool improvement |

---

*PolicyForge is built by the community, for the community.*
