# EDGE-002 — Block All Extensions (Allowlist Model)

**ID:** EDGE-002  
**Category:** Microsoft Edge / Extension Control  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark Edge v3.0 · Microsoft Security Baseline

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Microsoft Edge
            └─ Extensions
                 ├─ Control which extensions cannot be installed: Enabled
                 │    └─ Extension IDs to block: *    (block ALL)
                 ├─ Allow specific extensions to be installed: Enabled
                 │    └─ [list approved extension IDs]
                 └─ Configure extension management settings: Enabled
```

## Registry

```
; Block all extensions by default
HKLM\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallBlocklist
  1 = "*"

; Allow specific extensions (replace with your approved IDs)
HKLM\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallAllowlist
  1 = "odfafepnkmbhccpbejgmiehpchacaeak"  ; uBlock Origin
  2 = "eimadpbcbfnmbkopoojfekhnkhdbieeh"  ; Dark Reader
  3 = "mdjildafknihdffpkfmmpnpoiajfjnjd"  ; Example corporate extension

; Force-install extensions silently
HKLM\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist
  1 = "odfafepnkmbhccpbejgmiehpchacaeak;https://edge.microsoft.com/extensionwebstorebase/v1/crx"
```

## PowerShell

```powershell
# List currently installed Edge extensions for a user
$extensionPath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Extensions"
Get-ChildItem $extensionPath -Directory | ForEach-Object {
    $manifestPath = Get-ChildItem $_.FullName -Filter "manifest.json" -Recurse | Select -First 1
    if ($manifestPath) {
        $manifest = Get-Content $manifestPath.FullName | ConvertFrom-Json
        [PSCustomObject]@{
            ID      = $_.Name
            Name    = $manifest.name
            Version = $manifest.version
        }
    }
}
```

## Enterprise Extension Allowlist Strategy

```
Step 1: Audit current extensions across fleet
        → Collect extension IDs from user profiles

Step 2: Categorize
        → Business-required (approve)
        → Nice-to-have (evaluate)
        → Unknown/personal (block)
        → High-risk (block explicitly)

Step 3: Build allowlist
        → Add approved IDs to ExtensionInstallAllowlist
        → Force-install required extensions via ExtensionInstallForcelist

Step 4: Deploy block-all (*) policy
        → Users see: "Extension blocked by your administrator"
```

## High-Risk Extensions to Explicitly Block

| Extension Type | Risk | Example |
|---|---|---|
| VPN / Proxy | Data exfiltration | Hola VPN, TunnelBear |
| Screen capture | Data theft | Nimbus, Awesome Screenshot |
| Clipboard managers | Credential theft | Various |
| Crypto wallets | Phishing target | MetaMask (unless required) |
| AI code assistants | IP leakage | Various |

## Impact

- ✅ No unauthorized extensions can be installed
- ✅ Force-installed extensions deploy silently to all users
- ✅ Eliminates entire class of browser-based malware
- ⚠️ User friction — all extension requests go through IT helpdesk
- ℹ️ Communicate policy before deployment to reduce support tickets

## Compliance References

- **CIS Benchmark:** Microsoft Edge v3.0 — 2.4, 2.5 (L1)
- **Microsoft Security Baseline:** Edge 131+

## Test Status

✔ Tested on Edge 131 / Windows 11 24H2
✔ Block-all (*) confirmed blocking Chrome Web Store extensions
