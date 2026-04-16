---
id: WIN-SECURITY-004
name: Disable NetBIOS over TCP/IP (NBT-NS)
category: [Security, Network, Protocol Hardening]
risk_level: High
risk_emoji: 🔴
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 24H2"
---

# Disable NetBIOS over TCP/IP (NBT-NS)

> 🔴 **Risk Level: High** — NBT-NS is abused by Responder and similar tools for credential capture via LLMNR/NBT-NS poisoning attacks.

## Policy Path

```
Computer Configuration
  └── Windows Settings
        └── Security Settings
              └── (No native GPO — use Registry or PowerShell below)
```

> **Note:** NBT-NS must be disabled per-NIC. Use a startup script or PowerShell GPO preference to apply at scale.

## Registry

| Key | Value | Data | Type |
|---|---|---|---|
| `HKLM\SYSTEM\CurrentControlSet\Services\NetBT\Parameters\Interfaces\Tcpip_{GUID}` | `NetbiosOptions` | `2` | REG_DWORD |

**Values:**
- `0` = Default (DHCP-controlled)
- `1` = Enable NetBIOS over TCP/IP
- `2` = **Disable NetBIOS over TCP/IP** ✅

## Description

NetBIOS Name Service (NBT-NS) is a legacy broadcast name resolution protocol. When a DNS lookup fails, Windows falls back to NBT-NS, broadcasting a query on the local subnet. Attackers use tools like Responder to poison these broadcasts and capture NTLMv2 hashes for offline cracking or relay attacks. Disabling NBT-NS forces proper DNS resolution and eliminates this attack vector.

## PowerShell

```powershell
# Disable NBT-NS on all active network adapters
$adapters = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled = True"
foreach ($adapter in $adapters) {
    $adapter.SetTcpipNetbios(2) | Out-Null
    Write-Output "Disabled NBT-NS on: $($adapter.Description)"
}

# Verify
Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled = True" |
    Select-Object Description, TcpipNetbiosOptions
```

## Intune CSP

| Setting | Value |
|---|---|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Connectivity/DisableNetBIOS` |
| Data Type | Integer |
| Value | `1` |

## Impact

- ✅ Eliminates NBT-NS poisoning attack vector (Responder, Inveigh)
- ✅ Prevents NTLMv2 hash capture via broadcast spoofing
- ✅ Forces clean DNS resolution across all adapters
- ⚠️ May break legacy NetBIOS-dependent applications
- ⚠️ Requires DNS to be properly configured — fallback to NBT-NS is removed
- ℹ️ Pair with LLMNR disable (WIN-SECURITY-003) for full name resolution hardening

## Use Cases

- **Red team defense** — blocks Responder/Inveigh hash capture on internal networks
- **SOC / incident response** — baseline check after any suspected internal compromise
- **Enterprise hardening** — pair with WIN-SECURITY-003 (LLMNR disable) for complete coverage
- **Active Directory environments** — enforce DNS-only name resolution for predictable behavior
- **Zero trust networks** — remove all legacy broadcast protocols from the attack surface

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1557.001](https://attack.mitre.org/techniques/T1557/001/) | Adversary-in-the-Middle: LLMNR/NBT-NS Poisoning |
| [T1187](https://attack.mitre.org/techniques/T1187/) | Forced Authentication |
| [T1110](https://attack.mitre.org/techniques/T1110/) | Brute Force (captured hashes) |

## Compliance References

- **CIS Benchmark**: Level 1, Control 9.4.2
- **DISA STIG**: WN10-CC-000035
- **NIST SP 800-171**: 3.13.7

## Test Status

✅ Tested on Windows 10 22H2, Windows 11 24H2
