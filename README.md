# 🔥 PolicyForge — Master Microsoft Group Policy Like Never Before

> Stop guessing what policies do. Start **engineering** Windows environments with precision.

[![Stars](https://img.shields.io/github/stars/SamoTech/PolicyForge?style=flat-square)](https://github.com/SamoTech/PolicyForge)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Windows](https://img.shields.io/badge/Platform-Windows-blue.svg?style=flat-square)](policies/windows/)

**PolicyForge** is the most advanced open-source platform for IT professionals, sysadmins, and security engineers who work with Microsoft Group Policy (GPO), Intune (MDM/CSP), and Windows configuration at scale.

---

## 🧠 Why PolicyForge Exists

Microsoft's ecosystem is **fragmented**:
- **ADMX files** → unreadable at scale
- **Group Policy Editor** → zero real-world context
- **Intune/CSP** → completely different language
- **Security baselines** → rigid, incomplete, and undocumented

The result? Admins copy configs blindly without understanding what they're deploying.

**PolicyForge is the missing operating manual for Windows environments.**

---

## 🚀 Features

| Feature | Status |
|---|---|
| 10,000+ policies indexed with context | 🔄 In Progress |
| Real-world use-case mapping (enterprise, SMB, red team) | ✅ Available |
| Pre-built deployment templates (baseline → hardening → kiosk) | ✅ Available |
| GPO ↔ Intune ↔ Registry ↔ PowerShell translation engine | ✅ Available |
| ADMX auto-parser & doc generator | ✅ Available |
| Policy diff tracker (Win10 vs Win11 vs Server) | 🔄 In Progress |
| Web UI dashboard | 🔄 Planned |
| AI policy recommendation engine | 🔄 Planned |

---

## 📂 Repository Structure

```
PolicyForge/
│
├── 📁 policies/
│   ├── windows/          # Windows OS policies
│   ├── edge/             # Microsoft Edge policies
│   ├── defender/         # Windows Defender / Antivirus
│   ├── office/           # Microsoft Office 365
│   └── server/           # Windows Server roles
│
├── 📁 templates/
│   ├── security-baselines/    # CIS, DISA STIG-aligned baselines
│   ├── performance/           # High-performance workstation configs
│   ├── kiosk-mode/            # Locked-down kiosk deployments
│   ├── gaming-optimization/   # Gaming PC optimization pack
│   ├── enterprise-hardening/  # Enterprise endpoint hardening
│   └── redteam-evasion/       # ⚠️ Research: attacker-abused misconfigs
│
├── 📁 translations/
│   ├── gpo-to-intune/         # Group Policy → Intune CSP mappings
│   ├── registry-mapping/      # Registry key ↔ ADMX mapping tables
│   └── powershell/            # PowerShell equivalents for all policies
│
├── 📁 automation/
│   ├── admx-parser/           # ADMX → Markdown doc generator
│   ├── policy-diff/           # Compare policies across OS versions
│   └── auto-doc-generator/    # Bulk documentation automation
│
├── 📁 dashboards/
│   └── web-ui/                # Searchable policy browser (Next.js)
│
├── POLICY_SCHEMA.json         # Canonical schema for all policy entries
├── CONTRIBUTING.md            # How to contribute
└── README.md
```

---

## 🧪 Example Use Cases

- **Harden Windows endpoints against ransomware** → use `templates/enterprise-hardening/`
- **Optimize systems for low-bandwidth environments** → use `templates/performance/`
- **Build kiosk / lockdown environments** → use `templates/kiosk-mode/`
- **Disable telemetry fully (tested configs)** → search `policies/windows/privacy/`
- **GPO → Intune migration** → use `translations/gpo-to-intune/`
- **Red team research** → use `templates/redteam-evasion/` ⚠️

---

## 📋 Policy Entry Format

Every policy follows a strict schema defined in [`POLICY_SCHEMA.json`](POLICY_SCHEMA.json). Example:

```yaml
Policy Name: Disable Windows Telemetry
Registry: HKLM\Software\Policies\Microsoft\Windows\DataCollection > AllowTelemetry = 0
Intune CSP: ./Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry
Risk Level: Medium
Test Status: ✅ Tested on Windows 11 24H2
```

See [`policies/_TEMPLATE.md`](policies/_TEMPLATE.md) for the full template.

---

## ⚙️ Automation

```bash
# Parse ADMX files → generate Markdown docs
cd automation/admx-parser
python admx_parser.py --input /path/to/PolicyDefinitions --output ../../policies/windows/

# Compare policies across Windows versions
cd automation/policy-diff
python policy_diff.py --old win10 --new win11 --output ./reports/
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions welcome:
- 📝 New policy explanations
- 🛠️ Templates and deployment packs
- 🔄 GPO ↔ Intune translation mappings
- 🔐 Security research and MITRE ATT&CK mappings

### 🏆 Hall of Fame
- 🥇 Core Contributor, 🎯 Policy Hunter, 🧠 Zero-Day Config Finder badges for top contributors

---

## 📊 Roadmap

- [x] Repository scaffold and schema
- [x] First 3 high-value policies
- [x] Security baseline template
- [x] ADMX parser automation script
- [ ] 500+ policies (Week 1)
- [ ] Full GPO ↔ Intune translation engine (Week 2)
- [ ] Contributor system live (Week 2)
- [ ] Web UI (Phase 4)
- [ ] AI recommendation engine (Phase 4)

---

## ⚠️ Disclaimer

The `templates/redteam-evasion/` directory contains research-grade configurations for **defensive research and education only**.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>PolicyForge</strong> — The missing operating manual for Windows environments.<br/>
  Built by the community, for the community.
</p>
