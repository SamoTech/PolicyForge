<!-- PolicyForge Banner -->
<p align="center">
  <img src="https://raw.githubusercontent.com/SamoTech/PolicyForge/main/assets/banner.svg" alt="PolicyForge Banner" width="900"/>
</p>

<h1 align="center">PolicyForge</h1>
<p align="center">
  <strong>The Ultimate Microsoft Group Policy Intelligence Platform</strong><br/>
  Stop guessing what policies do. Start engineering Windows environments with precision.
</p>

<p align="center">
  <a href="https://github.com/SamoTech/PolicyForge/stargazers"><img src="https://img.shields.io/github/stars/SamoTech/PolicyForge?style=flat-square&color=gold" alt="Stars"/></a>
  <a href="https://github.com/SamoTech/PolicyForge/graphs/contributors"><img src="https://img.shields.io/github/contributors/SamoTech/PolicyForge?style=flat-square&color=teal" alt="Contributors"/></a>
  <a href="https://github.com/SamoTech/PolicyForge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"/></a>
  <img src="https://img.shields.io/badge/policies-50%2B-brightgreen?style=flat-square" alt="50+ Policies"/>
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Active"/>
  <img src="https://img.shields.io/badge/MITRE%20ATT%26CK-mapped-red?style=flat-square" alt="MITRE"/>
</p>

---

## 🚀 What Is PolicyForge?

PolicyForge is an open-source intelligence platform for **Microsoft Group Policy, ADMX, MDM CSP, and Intune**. It bridges the gap between:

- 📄 Raw ADMX files that are unreadable at scale
- 🖥️ Group Policy Editor that provides zero context
- ☁️ Intune with its completely different language (CSP)
- 🔒 Security baselines that are rigid and undocumented

**PolicyForge is not documentation. It is infrastructure for IT decision-making.**

---

## 🔥 Features

| Feature | Status |
|---|---|
| 50+ policies indexed with context, impact & use cases | ✅ Live |
| MITRE ATT&CK mapping for every security policy | ✅ Live |
| 50 GPO → Intune OMA-URI translations | ✅ Live |
| Registry ↔ PowerShell reference | ✅ Live |
| ADMX auto-parser (batch-generates Markdown) | ✅ Live |
| Policy Diff Tracker (Windows 10 vs 11 vs Server) | ✅ Live |
| PowerShell translation engine (GPO → Intune CSV) | ✅ Live |
| Enterprise hardening template (CIS L2 / STIG) | ✅ Live |
| Gaming optimization template | ✅ Live |
| Kiosk / lockdown template | ✅ Live |
| Red team evasion research (MITRE-mapped) | ✅ Live |
| Web UI policy search dashboard | 🔜 Phase 3 |
| AI policy recommendation engine | 🔜 Phase 4 |

---

## 🗺️ Roadmap

```
✅ Phase 1 — Foundation (Complete)
   ├── Repository structure
   ├── POLICY_SCHEMA.json (standardized schema)
   ├── 3 seed policies with full MITRE/CSP/Registry mapping
   └── ADMX parser engine (automation/admx-parser/)

✅ Phase 2 — Scale (Complete)
   ├── 50+ policies across Windows Security, Privacy, Defender
   ├── 50 GPO → Intune OMA-URI translation mappings
   ├── PowerShell translation engine (GPO → Intune CSV export)
   ├── Policy Diff Tracker (automation/policy-diff/)
   ├── Registry ↔ PowerShell bulk reference
   ├── Templates: Enterprise Hardening, Gaming, Kiosk, Red Team
   └── Post-deployment verification scripts

🔜 Phase 3 — Web UI (Q3 2026)
   ├── Next.js search dashboard
   ├── Filter by: OS version, risk level, use case, compliance
   ├── Policy conflict detector
   └── Live ADMX diff feed (auto-updates with Windows releases)

🔜 Phase 4 — AI Layer (Q4 2026)
   ├── Natural language policy query: "Harden 50 SMB endpoints"
   ├── Auto-generate GPO pack from environment description
   ├── Policy simulator: "What happens if I enable this?"
   └── Conflict prediction engine

🔜 Phase 5 — SaaS (2027)
   ├── PolicyForge Cloud: web dashboard + API
   ├── Tenant-aware policy recommendations
   ├── Compliance reporter (CIS, DISA STIG, NIST 800-53)
   └── MDE / Defender for Business integration
```

---

## 📁 Repository Structure

```
PolicyForge/
│
├── 📁 policies/
│   ├── windows/security/     # 17+ hardening policies (WIN-SECURITY-xxx)
│   ├── windows/privacy/      # Telemetry, Cortana, OneDrive
│   ├── windows/network/      # WPAD and network isolation
│   ├── defender/             # 10 Defender policies (DEF-001 → DEF-010)
│   ├── edge/                 # (Phase 3)
│   └── server/               # (Phase 3)
│
├── 📁 templates/
│   ├── security-baselines/   # Enterprise baseline (CIS L2 / STIG)
│   ├── enterprise-hardening/ # 5-layer hardening + verify.ps1
│   ├── gaming-optimization/  # Performance tuning for gaming PCs
│   ├── kiosk-mode/           # Full lockdown + assigned access
│   └── redteam-evasion/      # Offensive research (authorized use)
│
├── 📁 translations/
│   ├── gpo-to-intune/        # 50 GPO → OMA-URI mappings + PS engine
│   └── registry-mapping/     # Registry ↔ PowerShell reference
│
├── 📁 automation/
│   ├── admx-parser/          # ADMX → Markdown generator
│   └── policy-diff/          # Windows version diff tracker
│
├── 📁 dashboards/
│   └── web-ui/               # (Phase 3 — Next.js)
│
├── README.md
├── CONTRIBUTING.md
├── POLICY_SCHEMA.json
└── LICENSE
```

---

## 🧪 Example Use Cases

| Goal | PolicyForge Resource |
|---|---|
| Harden endpoints against ransomware | `templates/enterprise-hardening/` + `policies/defender/DEF-006` |
| Migrate GPO to Intune | `translations/gpo-to-intune/windows-security.md` + `translation-engine.ps1` |
| Block LLMNR poisoning attacks | `policies/windows/security/WIN-SECURITY-012` |
| Lock down a kiosk / POS terminal | `templates/kiosk-mode/` |
| Find policies deprecated in Windows 11 | `automation/policy-diff/policy_diff.py` |
| Understand what red teams look for | `templates/redteam-evasion/` |
| Optimize a gaming PC via GPO | `templates/gaming-optimization/` |
| Validate hardening post-deployment | `templates/enterprise-hardening/verify.ps1` |

---

## ⚡ Quick Start

### Explore a Policy

```bash
# Browse policies by category
ls policies/defender/
ls policies/windows/security/

# Every policy file includes: registry path, PowerShell, Intune CSP, MITRE mapping
cat policies/defender/DEF-005-configure-attack-surface-reduction.md
```

### Run the ADMX Parser

```bash
# Batch-generate Markdown from all ADMX files on your Windows machine
python automation/admx-parser/admx_parser.py \
  --admx-dir "C:\Windows\PolicyDefinitions" \
  --output-dir ./generated-policies
```

### Migrate GPO to Intune

```powershell
# Scan live registry and export Intune OMA-URI CSV
.\translations\gpo-to-intune\translation-engine.ps1 -OutputCsv .\intune-export.csv
# Then import CSV into: Intune > Devices > Configuration > Create > Custom
```

### Diff Windows Versions

```bash
# Snapshot Windows 10 policy definitions
python automation/policy-diff/policy_diff.py \
  --scan-admx "C:\Windows\PolicyDefinitions" --out snapshots/win10.json

# Compare against Windows 11 snapshot
python automation/policy-diff/policy_diff.py \
  --compare snapshots/win10.json snapshots/win11.json \
  --labels "Windows-10" "Windows-11"
```

### Verify Hardening Deployment

```powershell
# Run as Administrator after applying enterprise hardening
.\templates\enterprise-hardening\verify.ps1
# Outputs PASS/FAIL/MISSING for 13 critical controls
# Exports CSV report with timestamp
```

---

## 🤝 Contributing

PolicyForge grows through community intelligence. Every contribution makes the platform more valuable for the global sysadmin community.

**Ways to contribute:**
- 📝 Add a new policy explanation (copy `policies/_TEMPLATE.md`)
- 🔄 Submit a GPO → Intune mapping we're missing
- 🧪 Share a real-world deployment config
- 🔴 Document an attack path and its defensive fix
- 🌐 Translate policies for non-English documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines, badge rewards, and the contributor leaderboard.

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by the PolicyForge community<br/>
  <a href="https://github.com/SamoTech/PolicyForge">⭐ Star this repo if it helps you</a>
</p>
