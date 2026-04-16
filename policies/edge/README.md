# Microsoft Edge Security Policies

Complete enterprise Edge security configuration covering SmartScreen, extension control, credential protection, protocol hardening, AI/data leakage prevention, phishing protection, and legacy IE mode control.

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [EDGE-001](EDGE-001.md) | Enable SmartScreen (No Bypass) | Phishing/Malware | 🔴 Critical |
| [EDGE-002](EDGE-002.md) | Block All Extensions (Allowlist) | Extension Control | 🔴 Critical |
| [EDGE-003](EDGE-003.md) | Disable Built-in Password Manager | Credential Security | 🟠 Medium |
| [EDGE-004](EDGE-004.md) | Disable Edge Sync | Data Leakage | 🟠 Medium |
| [EDGE-005](EDGE-005.md) | Disable Telemetry & Data Collection | Privacy | 🟡 Low |
| [EDGE-006](EDGE-006.md) | Force HTTPS + Block Insecure Protocols | Protocol Security | 🔴 Critical |
| [EDGE-007](EDGE-007.md) | Enable Site Isolation | Spectre/Sandbox | 🔴 Critical |
| [EDGE-008](EDGE-008.md) | Disable Edge AI / Copilot | AI Data Leakage | 🟠 Medium |
| [EDGE-009](EDGE-009.md) | Enterprise Homepage & NTP Lock | Configuration | 🟡 Low |
| [EDGE-010](EDGE-010.md) | Block Dangerous File Downloads | Download Control | 🔴 Critical |
| [EDGE-011](EDGE-011.md) | Disable Personal Profile & Guest Mode | Profile Control | 🟠 Medium |
| [EDGE-012](EDGE-012.md) | Enhanced Phishing Protection | Anti-Phishing | 🔴 Critical |
| [EDGE-013](EDGE-013.md) | Enterprise Site List & IE Mode Control | Legacy | 🟠 Medium |

---

## Deployment Priority Order

```
Priority 1 (Deploy Day 1 — Critical Security):
  EDGE-001  SmartScreen (no bypass)
  EDGE-006  Force HTTPS + TLS 1.2 minimum
  EDGE-007  Site Isolation
  EDGE-010  Block dangerous downloads
  EDGE-012  Enhanced Phishing Protection

Priority 2 (Deploy Week 1 — Control):
  EDGE-002  Block all extensions (allowlist model)
  EDGE-003  Disable password manager
  EDGE-011  Disable personal profile + guest mode

Priority 3 (Deploy Week 2 — Hardening):
  EDGE-004  Disable sync
  EDGE-008  Disable AI/Copilot
  EDGE-013  IE mode control

Priority 4 (Polish):
  EDGE-005  Disable telemetry
  EDGE-009  Enterprise homepage/NTP
```

## MITRE ATT&CK Coverage

| Technique | ID | Policies |
|---|---|---|
| Phishing | T1566 | EDGE-001, EDGE-012 |
| Drive-by Compromise | T1189 | EDGE-001, EDGE-007 |
| Malicious File Download | T1204.002 | EDGE-001, EDGE-010 |
| Credentials from Browser | T1555.003 | EDGE-003, EDGE-012 |
| MITM / Protocol Downgrade | T1557 | EDGE-006 |
| Browser Extensions as C2 | T1176 | EDGE-002 |
| Unsanctioned Tool Use | T1608 | EDGE-011 |

## Complete Registry Baseline (One-Shot Apply)

```powershell
# PolicyForge Edge Security Baseline — apply all critical settings
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }

$settings = @{
    # SmartScreen
    SmartScreenEnabled                       = 1
    SmartScreenPuaEnabled                    = 1
    PreventSmartScreenPromptOverride         = 1
    PreventSmartScreenPromptOverrideForFiles = 1
    # Protocol
    AutomaticHttpsDefault                    = 2
    SSLVersionMin                            = "tls1.2"
    SSLErrorOverrideAllowed                  = 0
    HTTPSOnlyMode                            = 1
    # Downloads
    DownloadRestrictions                     = 2
    SafeBrowsingProtectionLevel              = 2
    # Credentials
    PasswordManagerEnabled                   = 0
    PasswordRevealEnabled                    = 0
    # Sync & Profile
    SyncDisabled                             = 1
    BrowserSignin                            = 0
    GuestModeEnabled                         = 0
    BrowserAddProfileEnabled                 = 0
    # AI / Privacy
    HubsSidebarEnabled                       = 0
    CopilotCDPPageContext                    = 0
    MetricsReportingEnabled                  = 0
    EdgeShoppingAssistantEnabled             = 0
    ShowMicrosoftRewards                     = 0
    # Sandbox
    SitePerProcess                           = 1
    RendererCodeIntegrityEnabled             = 1
    # IE Mode
    InternetExplorerIntegrationLevel         = 0
    SendIntranetToInternetExplorer           = 0
}

$settings.GetEnumerator() | ForEach-Object {
    Set-ItemProperty -Path $path -Name $_.Key -Value $_.Value -Force
}
Write-Host "PolicyForge Edge baseline applied." -ForegroundColor Green

# Verify
Get-ItemProperty $path | Select SmartScreenEnabled, AutomaticHttpsDefault,
    PasswordManagerEnabled, SyncDisabled, SitePerProcess, GuestModeEnabled
```

## Extension Blocklist Quick Setup

```powershell
# Block all extensions
$blockPath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallBlocklist"
New-Item -Path $blockPath -Force | Out-Null
Set-ItemProperty -Path $blockPath -Name "1" -Value "*"

# Allow uBlock Origin (example)
$allowPath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallAllowlist"
New-Item -Path $allowPath -Force | Out-Null
Set-ItemProperty -Path $allowPath -Name "1" -Value "odfafepnkmbhccpbejgmiehpchacaeak"
```

## Related Policies

- [AUDIT-004](../audit/AUDIT-004.md) — PowerShell logging (complements EDGE browser execution)
- [FW-008](../firewall/FW-008.md) — Block outbound malicious ports
- [CRED-003](../credentials/CRED-003.md) — Credential protection (complements EDGE-003/012)
