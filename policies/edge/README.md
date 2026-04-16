# Microsoft Edge Policies

> 🔜 **Coming in Phase 3** — Edge browser Group Policy documentation

This directory will contain Group Policy and MDM CSP documentation for:

## Planned Coverage

| Category | Example Policies |
|---|---|
| **Security** | SmartScreen enforcement, HTTPS-Only mode, certificate management |
| **Privacy** | Telemetry, sync settings, search engine lockdown |
| **Enterprise** | Managed favorites, homepage enforcement, extension allowlist |
| **Kiosk** | InPrivate kiosk mode, idle timeout, navigation restrictions |
| **Performance** | Sleeping tabs, startup boost, memory saver |

## Policy ID Format

Edge policies will follow the schema: `EDGE-[CATEGORY]-[NUMBER]`

Examples:
- `EDGE-SEC-001` — Enable SmartScreen
- `EDGE-PRIV-001` — Disable Edge telemetry
- `EDGE-ENT-001` — Configure managed favorites

## Want to Contribute?

Edge has 500+ ADMX-configurable policies. Community contributions are open now.
See [CONTRIBUTING.md](../../CONTRIBUTING.md) to get started and earn the **Edge Explorer** badge.

## ADMX Source

Microsoft publishes Edge ADMX templates at:
- [Edge for Business — Policy documentation](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies)
- [Edge ADMX download](https://www.microsoft.com/en-us/edge/business/download)
