# EDGE-013 — Enterprise Site List & Legacy IE Mode Control

**ID:** EDGE-013  
**Category:** Microsoft Edge / Enterprise Compatibility / Legacy Control  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** Microsoft Enterprise Documentation

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Microsoft Edge
            ├─ Configure the Enterprise Mode Site List: Enabled
            │    └─ URL: http://sitelist-server/sites.xml
            ├─ Send all intranet sites to Internet Explorer: Disabled
            ├─ Show the Reload in Internet Explorer mode button: Disabled
            └─ Configure Internet Explorer integration:
                 Enabled → Internet Explorer mode disabled
```

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  InternetExplorerIntegrationLevel  = 0    (0=not configured/disabled, 1=IE mode)
  InternetExplorerIntegrationSiteList = "http://sitelist.domain.local/sites.xml"
  SendIntranetToInternetExplorer    = 0    (don't redirect intranet to IE)
  ShowReloadInIeModeButton          = 0    (hide IE mode reload button)
  InternetExplorerIntegrationTestingAllowed = 0
```

## Description

Internet Explorer mode in Edge renders sites using the legacy Trident engine, which has a significantly larger attack surface than Edge's modern Chromium renderer. IE mode should be:

- **Disabled entirely** if your organization has no IE-dependent legacy applications
- **Restricted to a controlled site list** if IE mode is absolutely required for specific legacy apps

The site list is an XML file hosted on an internal server that specifies which URLs open in IE mode vs. Edge mode. Never use "Send all intranet sites to IE" — this opens the entire intranet in the legacy Trident engine.

## IE Mode Site List XML Example

```xml
<!-- sites.xml — Enterprise Mode Site List -->
<site-list version="1">
  <created-by>
    <tool>PolicyForge</tool>
    <version>1.0</version>
    <date-created>2026-04-17</date-created>
  </created-by>
  <!-- Only add sites that REQUIRE IE mode -->
  <site url="legacy-erp.company.local">
    <compat-mode>Default</compat-mode>
    <open-in>IE11</open-in>
  </site>
  <!-- All other sites: Edge mode -->
</site-list>
```

## Impact

- ✅ Minimizes exposure to legacy Trident engine vulnerabilities
- ✅ IE mode restricted to explicit allowlist
- ✅ Users cannot manually trigger IE mode on arbitrary sites
- ⚠️ Legacy apps requiring IE mode still require testing and XML maintenance
- ℹ️ Microsoft ended IE11 support in June 2022 — migrate legacy apps

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.16 (L1)
- **Microsoft:** IE11 retirement — June 15, 2022

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
