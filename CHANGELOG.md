# Changelog

All notable changes to PolicyForge are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

- Windows Server policies (`policies/server/`) — RDP, LDAP, Kerberos, NTLMv2, SMB signing
- `translations/registry-mapping/` — Registry ↔ ADMX ↔ CSP cross-reference
- `translations/powershell/` — bulk PowerShell hardening scripts
- Web UI dashboard — Next.js policy search (Phase 3)
- `automation/auto-doc-generator/` — ADMX → Markdown pipeline
- `automation/policy-diff/` — Windows version diff tracker

---

## [2.9] — 2026-04-16 — Office Macro Security Pack

### Added
- `policies/office/OFFICE-001` — Disable VBA Macros by Default (High)
- `policies/office/OFFICE-002` — Block Macros from Internet-Originated Files (Critical)
- `policies/office/OFFICE-003` — Restrict Macro Execution to Trusted Locations Only (High)
- `policies/office/OFFICE-004` — Enforce Protected View for All Office Files (High)
- `policies/office/OFFICE-005` — Block OLE Object Execution in Office Documents (Critical)
- `policies/office/README.md` — Office policy index with deployment instructions

### Coverage
- All 5 policies include: Policy Path, Registry, Description, PowerShell, Intune CSP, Impact, Use Cases, MITRE ATT&CK, Compliance References, Test Status
- MITRE coverage: T1566.001, T1204.002, T1059.005, T1553.006, T1559.001
- Compliance: CIS Office Benchmark, DISA STIG, NIST SP 800-53, PCI-DSS, Microsoft Security Baseline

---

## [2.8D] — 2026-04-16 — Edge Browser Security Pack

### Added
- `policies/edge/EDGE-001` — Disable InPrivate Browsing (Medium)
- `policies/edge/EDGE-002` — Block Built-in Password Manager (Medium)
- `policies/edge/EDGE-003` — Enforce Microsoft Defender SmartScreen (High)
- `policies/edge/EDGE-004` — Disable AutoFill for Credit Cards (Medium)
- `policies/edge/EDGE-005` — Force Safe Search (Low)
- `policies/edge/README.md` — Edge policy index with ADMX deployment guide

### Coverage
- MITRE coverage: T1564.003, T1048, T1555.003, T1539, T1566.002, T1189, T1608.006
- Compliance: CIS Edge Benchmark, DISA STIG, PCI-DSS, CIPA, NIST SP 800-53

---

## [2.8C] — 2026-04-16 — Full Audit Pass

### Fixed
- All WIN-SECURITY files audited and confirmed schema-compliant
- All required sections present: Policy Path, Registry, Description, PowerShell, Intune CSP, Impact, Use Cases, MITRE ATT&CK, Compliance References, Test Status

---

## [2.5] — 2026-04-16

### Added
- `SECURITY.md` — responsible disclosure policy and offensive content guidelines
- `CHANGELOG.md` — this file
- Placeholder READMEs for `policies/edge/`, `policies/server/`, `dashboards/web-ui/`
- `automation/admx-parser/requirements.txt`

### Fixed
- Empty folder navigation — all planned directories now have placeholder READMEs

---

## [2.4] — 2026-04-16

### Added
- `templates/enterprise-hardening/README.md` — 5-layer enterprise hardening pack (CIS L2 / DISA STIG)
- `templates/enterprise-hardening/verify.ps1` — post-deployment verification (13 controls, PASS/FAIL/MISSING)
- `templates/redteam-evasion/README.md` — 5 MITRE-mapped attack paths with defensive fixes
- Updated `README.md` with full Phase 1–5 roadmap, feature table, quick-start commands, use-case table

---

## [2.3] — 2026-04-16

### Added
- `automation/policy-diff/policy_diff.py` — CLI diff engine for comparing ADMX snapshots across Windows versions
- `automation/policy-diff/README.md` and `requirements.txt`
- `translations/gpo-to-intune/windows-security.md` — 50 GPO → Intune OMA-URI mappings across 6 categories
- `translations/gpo-to-intune/translation-engine.ps1` — PowerShell engine that scans live registry and exports Intune-ready CSV
- `translations/registry-mapping/registry-to-powershell.md` — bulk registry ↔ PowerShell reference with health-check script

---

## [2.2] — 2026-04-16

### Added
- `policies/defender/DEF-001` through `DEF-010` — 10 Microsoft Defender policies
- `templates/gaming-optimization/README.md`
- `templates/kiosk-mode/README.md`

---

## [2.1] — 2026-04-16

### Added
- 20 Windows policies across `policies/windows/security/`, `network/`, `privacy/`

---

## [2.0] — 2026-04-16 — Logo & Roadmap

### Added
- `assets/banner.svg` and `assets/logo.svg`
- Phase 1–5 roadmap in README

---

## [1.0] — 2026-04-16 — Initial Release

### Added
- Full repository structure
- `README.md`, `POLICY_SCHEMA.json`, `CONTRIBUTING.md`, `LICENSE`
- `policies/_TEMPLATE.md`
- `policies/windows/security/WIN-SECURITY-001` — Disable AutoRun
- `policies/windows/security/WIN-SECURITY-002` — Disable SMBv1
- `policies/windows/privacy/WIN-PRIVACY-001` — Disable Telemetry
- `templates/security-baselines/README.md`
- `automation/admx-parser/admx_parser.py`
- `.github/` issue templates and PR template
