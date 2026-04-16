---
id: WIN-NET-001
name: Disable Web Proxy Auto-Discovery (WPAD)
category: [Security, Network, Credential Protection]
risk_level: High
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 23H2"
---

# Disable Web Proxy Auto-Discovery (WPAD)

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Wpad` | `WpadOverride` | `1` | REG_DWORD |
| `HKLM\SYSTEM\CurrentControlSet\Services\WinHttpAutoProxySvc` | `Start` | `4` | REG_DWORD |

## Description

WPAD allows attackers on the local network to serve a malicious PAC file via rogue DHCP/DNS or LLMNR/NBT-NS responses, routing all HTTP/HTTPS traffic through an attacker proxy. Disabling it removes this attack vector entirely.

## Impact

- Environments using legitimate WPAD must reconfigure to explicit proxy settings first

## PowerShell

```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\WinHttpAutoProxySvc" `
  -Name "Start" -Value 4 -Type DWord -Force

$iePath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Wpad"
if (!(Test-Path $iePath)) { New-Item -Path $iePath -Force }
Set-ItemProperty -Path $iePath -Name "WpadOverride" -Value 1 -Type DWord -Force

Write-Output "WPAD disabled. Reboot required."
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1557](https://attack.mitre.org/techniques/T1557/) | Adversary-in-the-Middle |
