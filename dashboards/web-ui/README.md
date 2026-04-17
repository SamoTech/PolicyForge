# PolicyForge Dashboard

Search 140+ Windows security policies, registry paths, PowerShell commands, and Intune OMA-URIs.

## Stack

- **Next.js 15** (App Router, static export)
- **Fuse.js** — client-side fuzzy search, no backend needed
- **GitHub Raw** — policies fetched from the PolicyForge repo at build time (ISR: hourly)
- **Vercel** — one-click deploy, static site

## Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SamoTech/PolicyForge&root=dashboards/web-ui)

Or push to GitHub — Vercel auto-deploys on every commit.

## Environment Variables (optional)

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Increases GitHub API rate limit from 60 → 5000 req/hr |

## Features

- Full-text search across ID, name, registry keys, OMA-URIs
- Filter by risk level (Critical / High / Medium / Low)
- Filter by category (Security, BitLocker, ASR, Defender…)
- One-click copy for registry path, OMA-URI, PowerShell
- Policy detail modal with full markdown source
- MITRE ATT&CK links
- Light / dark mode (system-aware + manual toggle)
- Keyboard shortcut: `/` to focus search, `Esc` to close modal
