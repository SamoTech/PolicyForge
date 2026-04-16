---
id: WIN-NET-001
name: Disable Web Proxy Auto-Discovery (WPAD)
category: [Security, Network, Credential Protection]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 23H2"
---

# Disable Web Proxy Auto-Discovery (WPAD)

> 🔴 **Risk Level: High** — WPAD is a classic network-level MitM vector. Attackers on the local network can serve a rogue PAC file via DHCP/DNS/LLMNR poisoning, proxying all HTTP/HTTPS traffic through attacker infrastructure.

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── Windows Firewall / Internet Settings

# Also via registry (no direct GPO setting for WPAD disable — use registry path below)
# Recommended: deploy via GPO Computer Startup Script or Intune remediation script
```

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Wpad` | `WpadOverride` | `1` | REG_DWORD |
| `HKLM\SYSTEM\CurrentControlSet\Services\WinHttpAutoProxySvc` | `Start` | `4` | REG_DWORD |

**WinHttpAutoProxySvc Start values:** `2` = Automatic, `3` = Manual, `4` = **Disabled** ✅

## Description

WPAD (Web Proxy Auto-Discovery) allows Windows to automatically locate a proxy configuration (PAC) file via DHCP option 252 or DNS lookup for `wpad.<domain>`. Attackers on the local network can respond to LLMNR/NBT-NS/DHCP queries with a malicious PAC file, routing all HTTP and HTTPS traffic (including authenticated requests and credentials) through an attacker-controlled proxy. This is a well-documented MitM technique used in internal network penetration tests and real-world attacks. Disabling the `WinHttpAutoProxySvc` service and setting `WpadOverride=1` fully eliminates this vector.

## PowerShell

```powershell
# Disable WinHTTP AutoProxy service
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\WinHttpAutoProxySvc" `
  -Name "Start" -Value 4 -Type DWord -Force

# Override WPAD in Internet Settings
$iePath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Wpad"
if (!(Test-Path $iePath)) { New-Item -Path $iePath -Force | Out-Null }
Set-ItemProperty -Path $iePath -Name "WpadOverride" -Value 1 -Type DWord -Force

# Stop and disable the service immediately
Stop-Service WinHttpAutoProxySvc -Force -ErrorAction SilentlyContinue
Set-Service WinHttpAutoProxySvc -StartupType Disabled

Write-Output "WPAD disabled. Reboot recommended to fully apply."

# Verify
Get-Service WinHttpAutoProxySvc | Select-Object Name, Status, StartType
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/NetworkProxy/SetProxyServer` |
| Note | Deploy registry fix via Intune Remediation Script targeting `WinHttpAutoProxySvc` |

## Impact

- ✅ Eliminates WPAD-based MitM proxy injection attack vector
- ✅ Stops LLMNR/DHCP/DNS WPAD poisoning from routing traffic through rogue proxies
- ✅ Prevents credential capture via proxied NTLM authentication
- ⚠️ Environments relying on legitimate WPAD must migrate to explicit proxy configuration first
- ⚠️ `WpadOverride` is a per-user setting — apply via login script or GPO user preference for all users
- ℹ️ Combine with LLMNR/NBT-NS disable (WIN-NET-002) for full name resolution hardening

## Use Cases

- **Internal network hardening** — standard control in any enterprise security baseline
- **Penetration test defense** — WPAD is routinely used in internal red team operations
- **Remote worker endpoints** — WPAD on untrusted networks (hotels, coffee shops) is especially dangerous
- **Credential protection** — stops NTLM credential capture via rogue PAC file proxying
- **SOC / incident response** — check WPAD status when investigating suspected MitM incidents

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1557](https://attack.mitre.org/techniques/T1557/) | Adversary-in-the-Middle |
| [T1557.001](https://attack.mitre.org/techniques/T1557/001/) | LLMNR/NBT-NS Poisoning and SMB Relay |
| [T1040](https://attack.mitre.org/techniques/T1040/) | Network Sniffing (via proxied traffic) |

## Compliance References

- **CIS Benchmark**: Level 1, Control 18.5.21.1
- **DISA STIG**: WN10-CC-000038
- **NIST SP 800-53**: SC-7, IA-5
- **NSA Cybersecurity Advisory**: Windows 10 hardening guidance

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 23H2
