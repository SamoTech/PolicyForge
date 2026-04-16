# PolicyForge Web UI

> 🔜 **Planned for Phase 3 (Q3 2026)** — Next.js policy search dashboard

The PolicyForge Web UI will be the missing interface layer that makes all 1,000+ policies searchable, filterable, and actionable in a browser.

## Vision

```
Search: "disable telemetry"

┌─────────────────────────────────────────────────────────────────┐
│ WIN-PRIVACY-001 — Disable Windows Telemetry          ● Medium  │
│ HKLM\Software\Policies\Microsoft\Windows\DataCollection        │
│ AllowTelemetry = 0                                             │
│                                                                │
│ [📋 Copy Registry]  [⚙️ Copy PowerShell]  [☁️ Copy Intune CSP] │
└─────────────────────────────────────────────────────────────────┘
```

## Planned Features

### Core
- **Google-like search** across all policy names, descriptions, registry paths
- **Filter by**: OS version, risk level (Low / Medium / High / Critical), use case, compliance standard
- **One-click copy** for Registry, PowerShell, and Intune OMA-URI formats
- **Policy conflict detector** — warns when two selected policies contradict each other

### Advanced
- **MITRE ATT&CK filter** — show all policies that defend against a specific technique
- **Compliance view** — CIS Level 1/2, DISA STIG, NIST 800-53 checklists
- **Diff viewer** — compare policy values between Windows versions
- **Template builder** — pick policies and export as PowerShell script or GPO backup

### Phase 4 (AI)
- Natural language query: *"Harden 50 SMB endpoints against ransomware"*
- Auto-generate GPO pack from environment description
- Policy simulator: *"What breaks if I enable this?"*

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| Styling | Tailwind CSS v4 |
| Search | Fuse.js (client-side) → Algolia (Phase 4) |
| Data source | Markdown files parsed at build time (MDX) |
| Deployment | Vercel |
| Database (Phase 4) | Supabase |

## Want to Help Build It?

The web UI is the highest-impact contribution you can make to PolicyForge. If you're a Next.js developer, open an issue tagged `phase-3` and `web-ui` to get involved.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the **Web Builder** badge.
