# Changelog

All notable changes to PolicyForge are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

- Edge browser policies (`policies/edge/`)
- Windows Server-specific policies (`policies/server/`)
- Web UI dashboard — Next.js policy search (Phase 3)

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
- `policies/defender/DEF-001` through `DEF-010` — 10 Microsoft Defender policies (real-time protection, cloud, behavioral, ASR, CFA, network protection, tamper, scan schedule, PUA, exclusions)
- `templates/gaming-optimization/README.md` — GPU scheduling, core parking, Nagle's algorithm, game priority
- `templates/kiosk-mode/README.md` — Assigned Access, shell replacement, USB block, Edge kiosk flags

---

## [2.1] — 2026-04-16

### Added
- 20 Windows policies across three new directories:
  - `policies/windows/security/` — WIN-SECURITY-003 to WIN-SECURITY-019 (WDigest, LLMNR, LSA PPL, Firewall, NLA, UAC, Script Block Logging, SMBv1, Print Spooler, NTLMv2, SAM enumeration, lockout, audit)
  - `policies/windows/network/` — WIN-NET-001 (WPAD)
  - `policies/windows/privacy/` — WIN-PRIVACY-002 (Cortana), WIN-PRIVACY-003 (OneDrive)

---

## [2.0] — 2026-04-16 — Logo & Roadmap

### Added
- `assets/banner.svg` and `assets/logo.svg`
- Phase 1–5 roadmap in README
- Web UI section placeholder

---

## [1.0] — 2026-04-16 — Initial Release

### Added
- Full repository structure (`policies/`, `templates/`, `translations/`, `automation/`, `dashboards/`)
- `README.md` — star-magnet intro with features, use cases, badges
- `POLICY_SCHEMA.json` — standardized JSON schema for all policy entries
- `CONTRIBUTING.md` — contribution guide with gamification (badges, leaderboard)
- `LICENSE` — MIT
- `policies/_TEMPLATE.md` — contributor copy-paste template
- `policies/windows/security/WIN-SECURITY-001` — Disable AutoRun
- `policies/windows/security/WIN-SECURITY-002` — Disable SMBv1
- `policies/windows/privacy/WIN-PRIVACY-001` — Disable Telemetry
- `templates/security-baselines/README.md` — baseline pack with CIS/STIG coverage
- `automation/admx-parser/admx_parser.py` — ADMX → Markdown batch generator
- `.github/ISSUE_TEMPLATE/new-policy.md` and `correction.md`
- `.github/pull_request_template.md`
