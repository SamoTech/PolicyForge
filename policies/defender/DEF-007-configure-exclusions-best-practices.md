---
id: DEF-007
name: Defender Exclusions — Best Practices and Dangerous Anti-Patterns
category: [Defender, Configuration, Security Risk]
risk_level: Critical
applies_to: [Windows 10, Windows 11, Windows Server 2016+]
test_status: "✅ General guidance — not a configurable policy"
---

# Defender Exclusions — Best Practices

## Description

Defender exclusions are the **single most exploited Defender misconfiguration** in real-world attacks. Attackers who gain initial access routinely check for exclusions and drop payloads into excluded paths. This document covers what to exclude (legitimate cases), what never to exclude, and how to audit existing exclusions.

## ❌ Never Exclude

| Path / Type | Why It's Dangerous |
|---|---|
| Entire drives (`C:\`) | Blanket exclusion of the system drive is a complete Defender bypass |
| `%TEMP%`, `%TMP%` | Primary malware staging area |
| `%APPDATA%` | Common persistence and dropper location |
| `C:\Windows\Temp` | Frequently used by malware and exploit tools |
| Script extensions (`.ps1`, `.bat`, `.vbs`) | Excludes the most common attacker file types |
| `C:\Users\` (entire profile) | Covers almost all user-writable paths malware uses |

## ✅ Legitimate Exclusion Scenarios

| Scenario | Correct Exclusion Type | Example |
|---|---|---|
| SQL Server database files | File extension on specific path | `D:\SQLData\*.mdf`, `*.ldf` |
| Anti-virus exclusion folder (AV-AV conflict) | Specific process path | `C:\Program Files\OtherAV\scanner.exe` |
| Build server (false positive on compiled code) | Specific folder path with tight scope | `D:\BuildOutput\bin\` |
| WSUS / SCCM content folder | Specific folder only | `C:\Windows\SoftwareDistribution\` |

## Audit Existing Exclusions

```powershell
# List all current Defender exclusions
$prefs = Get-MpPreference

Write-Output "=== Path Exclusions ==="
$prefs.ExclusionPath | ForEach-Object { Write-Output $_ }

Write-Output "=== Extension Exclusions ==="
$prefs.ExclusionExtension | ForEach-Object { Write-Output $_ }

Write-Output "=== Process Exclusions ==="
$prefs.ExclusionProcess | ForEach-Object { Write-Output $_ }
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |
| [T1036](https://attack.mitre.org/techniques/T1036/) | Masquerading (placing payloads in excluded paths) |
