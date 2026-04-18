# CLAUDE.md

This file provides guidance to Claude Code when working on PolicyForge.

## Project Overview

PolicyForge is an open-source library of **Windows Group Policy security baselines** —
structured Markdown policy files with frontmatter metadata, PowerShell snippets, registry
tables, MITRE ATT&CK mappings, and compliance references. The companion Next.js web app
(`/web`) renders these into a searchable, filterable policy browser.

---

## Repository Structure

```
PolicyForge/
├── policies/
│   ├── defender/        # Microsoft Defender Antivirus policies (DEF-XXX)
│   ├── edge/            # Microsoft Edge policies (EDGE-XXX)
│   ├── office/          # Microsoft Office policies (OFFICE-XXX)
│   ├── server/          # Windows Server policies (SRV-XXX) — in progress
│   └── windows/         # Windows OS policies (WIN-XXX) — in progress
├── web/                 # Next.js frontend (app router)
│   ├── app/
│   │   ├── page.tsx     # Policy browser homepage
│   │   └── policy/[id]/ # Individual policy detail page
│   └── lib/
│       └── policies.ts  # Central policy data index — MUST stay in sync with /policies/
├── templates/           # Blank policy template files
├── automation/          # Scripts for validation and sync
├── POLICY_SCHEMA.json   # JSON Schema for frontmatter validation
├── CONTRIBUTING.md      # How to write new policies
└── CLAUDE.md            # This file
```

---

## Policy File Rules

Every file in `policies/<category>/` MUST follow this exact frontmatter schema:

```yaml
---
id: DEF-001                          # Unique ID: PREFIX-NNN
name: Full Policy Name               # Human-readable name
category: [Tag1, Tag2, Tag3]         # Array of category tags
risk_level: High                     # Critical | High | Medium | Low
risk_emoji: 🔴                       # 🔴 Critical/High | 🟠 Medium | 🟢 Low
applies_to: [Windows 10, Windows 11] # Affected platforms
test_status: "✅ Tested on ..."      # Test coverage note
---
```

**Every policy body MUST contain all of these sections (in order):**

1. `## Policy Path` — GPO tree path in a code block
2. `## Registry` — registry key/value table
3. `## Description` — 2–4 sentence explanation
4. `## PowerShell` — working PowerShell enforcement + verify snippet
5. `## Intune CSP` — OMA-URI table for Intune deployment
6. `## Impact` — ✅/⚠️/ℹ️ bullet list
7. `## Use Cases` — 5 bullet use case examples
8. `## MITRE ATT&CK Mapping` — table with technique IDs and links
9. `## Compliance References` — CIS, DISA STIG, NIST SP 800-53, etc.
10. `## Test Status` — tested platforms

**File naming convention:** `PREFIX-NNN-kebab-case-name.md`
Examples: `DEF-005-enable-cloud-protection.md`, `EDGE-003-disable-sync.md`

**ID prefixes by category:**

| Prefix | Category |
|--------|----------|
| `DEF-` | `policies/defender/` |
| `EDGE-` | `policies/edge/` |
| `OFFICE-` | `policies/office/` |
| `SRV-` | `policies/server/` |
| `WIN-` | `policies/windows/` |

---

## Web App (`/web`)

The frontend is **Next.js 14+ with App Router** and TypeScript.

- `lib/policies.ts` — the central data index. **Every time a new policy `.md` file is added,
  a matching entry MUST be added to `policies.ts`.** The two must always stay in sync.
- `app/page.tsx` — renders the policy browser with filter/search UI
- `app/policy/[id]/page.tsx` — renders the individual policy detail page

When adding new policies, always update `lib/policies.ts` in the same commit.

---

## Skill Map

| File(s) | Guidance |
|---------|---------|
| `policies/**/*.md` | Follow the 10-section schema above exactly |
| `web/lib/policies.ts` | Keep in sync with all `.md` files in `/policies/` |
| `POLICY_SCHEMA.json` | Source of truth for frontmatter field validation |
| `CONTRIBUTING.md` | Reference before writing any new policy |
| `templates/` | Use blank templates as starting points |

---

## Validation Checklist

Before committing any new policy file, verify:

- [ ] Frontmatter has all 7 required fields (`id`, `name`, `category`, `risk_level`, `risk_emoji`, `applies_to`, `test_status`)
- [ ] `id` follows the correct prefix for its folder
- [ ] All 10 body sections are present
- [ ] PowerShell block includes both enforcement AND verification commands
- [ ] Registry table has Key, Value, Data, and Type columns
- [ ] MITRE ATT&CK links use `https://attack.mitre.org/techniques/TXXXX/` format
- [ ] Corresponding entry added to `web/lib/policies.ts`
- [ ] File name matches `PREFIX-NNN-kebab-case-name.md` format

---

## Common Commands

```bash
# Web app dev server
cd web && npm run dev

# Type check
cd web && npm run type-check

# Build
cd web && npm run build
```

---

## Do Not

- Do **not** create policy files without all 10 required sections
- Do **not** update `policies.ts` without the matching `.md` file (or vice versa)
- Do **not** use a `risk_level` that doesn't match the `risk_emoji` (🔴 = Critical/High, 🟠 = Medium, 🟢 = Low)
- Do **not** invent MITRE technique IDs — verify at [attack.mitre.org](https://attack.mitre.org)
- Do **not** add policies to `policies/server/` or `policies/windows/` until those categories are formally launched
