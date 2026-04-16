# Microsoft Office / Microsoft 365 Policies

> 🔜 **Coming in Phase 3** — Office Group Policy and MDM CSP documentation

This directory will cover Group Policy settings for Microsoft Office apps (Word, Excel, PowerPoint, Outlook, Teams) and Microsoft 365 cloud services.

## Planned Coverage

| Category | Example Policies |
|---|---|
| **Macro Security** | Disable VBA macros, block macros from the internet, trusted locations |
| **Outlook / Exchange** | Autodiscover lockdown, S/MIME enforcement, junk filter, attachment block |
| **Teams** | Guest access, external federation, meeting recording, app permissions |
| **OneDrive** | Sync lockdown, known folder move enforcement, B2B sync block |
| **Excel / Word / PowerPoint** | Protected View enforcement, DDE disable, external content block |
| **Microsoft 365 Apps** | Update channel, telemetry level, connected experiences |

## Policy ID Format

Office policies follow: `OFF-[APP]-[NUMBER]`

Examples:
- `OFF-MAC-001` — Block VBA macros from internet origin
- `OFF-OLK-001` — Disable Outlook Autodiscover v1
- `OFF-TMS-001` — Disable Teams guest access
- `OFF-ODR-001` — Enforce OneDrive Known Folder Move

## Why Office Policies Matter

Office is the #1 initial access vector in enterprise breaches:
- **T1566.001** — Phishing with malicious Office attachments (macros)
- **T1059.005** — VBA macro execution
- **T1048** — Data exfiltration via OneDrive/SharePoint

Every policy here directly reduces attack surface on the Microsoft 365 stack.

## ADMX / Configuration Sources

- [Office ADMX templates download](https://www.microsoft.com/en-us/download/details.aspx?id=49030)
- [Microsoft 365 Apps admin center](https://config.office.com)
- [Teams admin center policies](https://admin.teams.microsoft.com)
- [Microsoft 365 Security baselines](https://learn.microsoft.com/en-us/microsoft-365/security/)

## Want to Contribute?

Office policies are highly requested by r/sysadmin. See [CONTRIBUTING.md](../../CONTRIBUTING.md) and earn the **M365 Defender** badge.
