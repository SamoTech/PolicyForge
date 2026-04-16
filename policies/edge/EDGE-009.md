# EDGE-009 — Configure Enterprise New Tab Page & Homepage Lock

**ID:** EDGE-009  
**Category:** Microsoft Edge / Enterprise Configuration  
**Risk Level:** 🟡 Low  
**OS:** Windows 10+, Windows 11  
**Source:** Microsoft Enterprise Documentation

---

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  HomepageLocation              = "https://intranet.company.com"
  HomepageIsNewTabPage          = 0
  NewTabPageLocation            = "https://intranet.company.com"
  NewTabPageContentEnabled      = 0    (disable Edge news feed on NTP)
  NewTabPageBingChatEnabled     = 0    (disable Bing AI on NTP)
  NewTabPageSearchBoxEnabled    = 0    (disable Bing search on NTP)
  ShowHomeButton                = 1
  HomeButtonEnabled             = 1
  RestoreOnStartup              = 4    (4=open specific URLs on startup)

HKLM\SOFTWARE\Policies\Microsoft\Edge\RestoreOnStartupURLs
  1 = "https://intranet.company.com"
```

## Description

Sets the corporate intranet as the default homepage and new tab page, disables the Bing news feed and Bing AI chat on the new tab page. This ensures users start every browser session at a known corporate resource, and eliminates consumer-oriented content (news articles, weather, Bing promotions) from the enterprise browser experience. The news feed also generates outbound requests to CDNs that may trigger security monitoring false positives.

## Impact

- ✅ Consistent enterprise start experience
- ✅ Eliminates news/content feed outbound requests
- ✅ Reduces distractions from consumer content
- ℹ️ Combine with EDGE-008 to fully neutralize consumer features

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
