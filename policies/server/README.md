# Windows Server Policies

> 🔜 **Coming in Phase 3** — Windows Server-specific Group Policy documentation

This directory will contain policies specific to Windows Server environments, including Domain Controllers, member servers, and server core configurations.

## Planned Coverage

| Category | Example Policies |
|---|---|
| **Domain Controller Hardening** | LDAP signing, secure channel, DC firewall rules |
| **Active Directory** | Kerberos settings, fine-grained password policies, PAM |
| **IIS / Web Server** | TLS configuration, HTTP Strict Transport Security |
| **RDS / Remote Desktop** | Session limits, NLA enforcement, clipboard restrictions |
| **DNS Server** | DNS over HTTPS, cache poisoning protection, response rate limiting |
| **Certificate Services** | CA policies, certificate templates, auto-enrollment |
| **Hyper-V** | VM isolation, live migration security |

## Policy ID Format

Server policies will follow: `SRV-[CATEGORY]-[NUMBER]`

Examples:
- `SRV-DC-001` — Require LDAP Signing on Domain Controllers
- `SRV-AD-001` — Kerberos ticket lifetime
- `SRV-RDS-001` — Require NLA for Remote Desktop

## Critical Server-Specific Policies (Priority Queue)

| Policy | Why Critical |
|---|---|
| Require LDAP channel binding + signing | Prevents LDAP relay attacks (CVE-2017-8563) |
| Disable NTLM on DCs | Eliminates pass-the-hash on domain controllers |
| Enable Protected Users security group | Prevents credential caching for privileged accounts |
| Disable Print Spooler on DCs | PrintNightmare mitigation (critical on DCs) |
| Configure SMB encryption | Encrypts lateral movement traffic |

## Want to Contribute?

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Server contributions earn the **Domain Master** badge.
