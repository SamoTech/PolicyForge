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
  <img src="https://img.shields.io/badge/policies-80%2B-brightgreen?style=flat-square" alt="80+ Policies"/>
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Active"/>
  <img src="https://img.shields.io/badge/MITRE%20ATT%26CK-mapped-red?style=flat-square" alt="MITRE"/>
  <img src="https://img.shields.io/badge/schema-v1.0-purple?style=flat-square" alt="Schema v1.0"/>
  <a href="https://ms-gpo.vercel.app"><img src="https://img.shields.io/badge/Web%20UI-live-brightgreen?style=flat-square" alt="Web UI Live"/></a>
</p>

---

## 🚀 What Is PolicyForge?

PolicyForge is an open-source intelligence platform for **Microsoft Group Policy, ADMX, MDM CSP, and Intune**. It bridges the gap between:

- 📄 Raw ADMX files that are unreadable at scale
- 🖥️ Group Policy Editor that provides zero context
- ☁️ Intune with its completely different language (CSP)
- 🔒 Security baselines that are rigid and undocumented

**PolicyForge is not documentation. It is infrastructure for IT decision-making.**

> 🌐 **Live Web UI:** [ms-gpo.vercel.app](https://ms-gpo.vercel.app) — Search policies, filter by risk level & category, view MITRE ATT&CK mappings, registry paths, PowerShell commands, and Intune OMA-URIs in one place.

---

## 🔥 Features

| Feature | Status |
|---|---|
| 80+ policies indexed with context, impact & use cases | ✅ Live |
| MITRE ATT&CK mapping for every security policy | ✅ Live |
| GPO → Intune OMA-URI translations | ✅ Live |
| Registry ↔ PowerShell reference | ✅ Live |
| ADMX auto-parser (batch-generates Markdown) | ✅ Live |
| Policy Diff Tracker (Windows 10 vs 11 vs Server) | ✅ Live |
| PowerShell translation engine (GPO → Intune CSV) | ✅ Live |
| Enterprise hardening template (CIS L2 / STIG) | ✅ Live |
| Gaming optimization template | ✅ Live |
| Kiosk / lockdown template | ✅ Live |
| Red team evasion research (MITRE-mapped) | ✅ Live |
| Microsoft Edge security policies (EDGE-001→013) | ✅ Live |
| Microsoft Office macro security policies (OFFICE-001→005) | ✅ Live |
| **Web UI policy search dashboard** | ✅ **Live — [ms-gpo.vercel.app](https://ms-gpo.vercel.app)** |
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
   ├── 80+ policies across Windows Security, Privacy, Defender, Edge, Office, Account Policies
   ├── GPO → Intune OMA-URI translation mappings
   ├── PowerShell translation engine (GPO → Intune CSV export)
   ├── Policy Diff Tracker (automation/policy-diff/)
   ├── Registry ↔ PowerShell bulk reference
   ├── Templates: Enterprise Hardening, Gaming, Kiosk, Red Team
   └── Post-deployment verification scripts

✅ Phase 3 — Web UI (Complete)
   ├── Next.js search dashboard → https://ms-gpo.vercel.app
   ├── Filter by: category (Defender, Edge, Office, Network, Privacy, Security)
   ├── Filter by: risk level (Critical, High, Medium, Low)
   ├── Real-time search across policies, registry, MITRE, OMA-URI
   └── Policy cards with MITRE ATT&CK tags, risk badges, category labels

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
│   ├── windows/security/         # 19 hardening policies (WIN-SECURITY-001→019)
│   ├── windows/privacy/          # 3 privacy policies (WIN-PRIVACY-001→003)
│   ├── windows/network/          # Network isolation policies
│   ├── windows/account-policies/ # 13 account policies (ACC-001→013)
│   ├── windows/applocker/        # AppLocker policies
│   ├── windows/audit/            # Audit policies
│   ├── windows/bitlocker/        # BitLocker policies
│   ├── windows/credentials/      # Credential protection policies
│   ├── windows/firewall/         # Windows Firewall policies
│   ├── windows/smb/              # SMB hardening policies
│   ├── windows/update/           # Windows Update policies
│   ├── windows/user-rights/      # User Rights Assignment policies
│   ├── windows/wdac/             # Windows Defender App Control policies
│   ├── defender/                 # 10 Defender policies (DEF-001→DEF-010)
│   ├── edge/                     # 13 Edge browser policies (EDGE-001→EDGE-013)
│   ├── office/                   # 5 Office macro policies (OFFICE-001→OFFICE-005)
│   └── server/                   # Windows Server policies (Phase 3)
│
├── 📁 templates/
│   ├── security-baselines/   # Enterprise baseline (CIS L2 / STIG)
│   ├── enterprise-hardening/ # 5-layer hardening + verify.ps1
│   ├── gaming-optimization/  # Performance tuning for gaming PCs
│   ├── kiosk-mode/           # Full lockdown + assigned access
│   └── redteam-evasion/      # Offensive research (authorized use)
│
├── 📁 translations/
│   ├── gpo-to-intune/        # GPO → OMA-URI mappings + PS engine
│   └── registry-mapping/     # Registry ↔ PowerShell reference
│
├── 📁 automation/
│   ├── admx-parser/          # ADMX → Markdown generator
│   └── policy-diff/          # Windows version diff tracker
│
├── 📁 dashboards/
│   └── web-ui/               # Phase 3 — Next.js (Live: ms-gpo.vercel.app)
│
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── POLICY_SCHEMA.json
└── LICENSE
```

---

## 🗂️ Policy Index

| Category | Count | Directory |
|---|---|---|
| Windows Security | 19 | `policies/windows/security/` |
| Windows Account Policies | 13 | `policies/windows/account-policies/` |
| Microsoft Edge | 13 | `policies/edge/` |
| Microsoft Defender | 10 | `policies/defender/` |
| Microsoft Office | 5 | `policies/office/` |
| Windows Privacy | 3 | `policies/windows/privacy/` |
| Windows Firewall, SMB, AppLocker, BitLocker, Audit, Update, User Rights, WDAC, Network, Credentials | 10+ | `policies/windows/*/` |
| **Total** | **80+** | |

---

## 🧪 Example Use Cases

| Goal | PolicyForge Resource |
|---|---|
| Harden endpoints against ransomware | `templates/enterprise-hardening/` + `policies/defender/DEF-006` |
| Block macro malware (Emotet/QakBot) | `policies/office/OFFICE-001` + `policies/office/OFFICE-002` |
| Migrate GPO to Intune | `translations/gpo-to-intune/windows-security.md` |
| Block LLMNR poisoning attacks | `policies/windows/security/WIN-SECURITY-003` |
| Enforce Edge SmartScreen for all users | `policies/edge/EDGE-003` |
| Lock down a kiosk / POS terminal | `templates/kiosk-mode/` |
| Find policies deprecated in Windows 11 | `automation/policy-diff/policy_diff.py` |
| Optimize a gaming PC via GPO | `templates/gaming-optimization/` |
| Validate hardening post-deployment | `templates/enterprise-hardening/verify.ps1` |
| **Search & explore all policies visually** | **[ms-gpo.vercel.app](https://ms-gpo.vercel.app)** |

---

## ⚡ Quick Start

### Explore Policies via Web UI

Visit **[ms-gpo.vercel.app](https://ms-gpo.vercel.app)** to search all policies by name, registry path, MITRE technique, or OMA-URI. Filter by category and risk level instantly — no setup required.

### Explore a Policy (CLI)

```bash
# Browse policies by category
ls policies/defender/
ls policies/windows/security/
ls policies/edge/
ls policies/office/

# Every policy file includes: registry path, PowerShell, Intune CSP, MITRE mapping
cat policies/office/OFFICE-002-block-macros-from-internet.md
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

### Verify Hardening Deployment

```powershell
# Run as Administrator after applying enterprise hardening
.\templates\enterprise-hardening\verify.ps1
# Outputs PASS/FAIL/MISSING for 13 critical controls
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
  <a href="https://ms-gpo.vercel.app">🌐 Try the Live Web UI</a> &nbsp;·&nbsp;
  <a href="https://github.com/SamoTech/PolicyForge">⭐ Star this repo if it helps you</a>
</p>
