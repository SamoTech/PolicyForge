# EDGE-008 — Disable Edge AI Features (Copilot / Bing AI) in Enterprise

**ID:** EDGE-008  
**Category:** Microsoft Edge / AI / Data Leakage Prevention  
**Risk Level:** 🟠 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** Enterprise Security Best Practice

---

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  HubsSidebarEnabled              = 0    (disable sidebar including Copilot)
  EdgeOpenInSidebarEnabled        = 0
  CopilotCDPPageContext           = 0    (disable page context sent to Copilot)
  CopilotPageContext              = 0    (disable page context for signed-out)
  DiscoverPageContextEnabled      = 0
  SearchSuggestEnabled            = 0    (disable search suggestions in address bar)
  ShowAcrobatSubscriptionButton   = 0
  ShowOfficeShortcutInTabCard     = 0
  EdgeEnhanceImagesEnabled        = 0    (disable AI image enhancement)
  EdgeFollowEnabled               = 0
```

## Description

Edge's Copilot integration and AI sidebar send page content to Microsoft's cloud for processing. In enterprise environments, this means sensitive internal documents, intranet pages, and confidential data viewed in the browser may be transmitted to external AI services. Disabling `CopilotCDPPageContext` is particularly important — it prevents the current page's content from being automatically sent to Copilot, which could leak confidential business data. Organizations with data residency requirements or handling regulated data (PII, PHI, financial) should disable these features until their data governance frameworks explicitly approve AI-assisted browser features.

## Data Leakage Risk Matrix

| Feature | Data Sent | Risk |
|---|---|---|
| Copilot sidebar + page context | Full page HTML | 🔴 High |
| Search suggestions | Typed URLs/queries | 🟠 Medium |
| AI image enhancement | Images from pages | 🟠 Medium |
| Shopping assistant | Product URLs | 🟡 Low |

## Impact

- ✅ Page content not sent to external AI services
- ✅ Satisfies data residency and confidentiality requirements
- ⚠️ Removes AI productivity features — communicate with users
- ℹ️ Enterprise Copilot via M365 Copilot has separate data handling and may be acceptable

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
