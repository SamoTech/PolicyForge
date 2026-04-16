# EDGE-005 — Disable Telemetry & Data Collection

**ID:** EDGE-005  
**Category:** Microsoft Edge / Privacy  
**Risk Level:** 🟡 Low  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · GDPR Compliance

---

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Edge
  MetricsReportingEnabled           = 0    (disable usage/crash reporting)
  PersonalizationReportingEnabled   = 0    (disable personalization data)
  UserFeedbackAllowed               = 0    (disable user feedback sending)
  DiagnosticData                    = 0    (off: no diagnostic data)
  EdgeCollectTextAndImagesForSuperResolution = 0
  EdgeFollowEnabled                 = 0    (disable Edge Follow feature)
  EdgeShoppingAssistantEnabled      = 0    (disable shopping suggestions)
  ShowMicrosoftRewards              = 0
  SpotlightExperiencesAndRecommendationsEnabled = 0
```

## PowerShell

```powershell
# Apply all Edge privacy settings
$edgePolicies = @{
  MetricsReportingEnabled         = 0
  PersonalizationReportingEnabled = 0
  UserFeedbackAllowed             = 0
  EdgeShoppingAssistantEnabled    = 0
  ShowMicrosoftRewards            = 0
}

$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
$edgePolicies.GetEnumerator() | ForEach-Object {
    Set-ItemProperty -Path $path -Name $_.Key -Value $_.Value
}
```

## Description

Disables Edge's telemetry collection, usage reporting, personalization data sharing, and non-essential cloud features. In GDPR-regulated environments (EU companies, data processors), disabling browser telemetry reduces the scope of personal data processing. Shopping assistant and Rewards features are consumer-oriented distractions that have no place in enterprise environments and represent unnecessary outbound data flows.

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.8, 2.9 (L2)
- **GDPR:** Article 25 (Data protection by design)

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
