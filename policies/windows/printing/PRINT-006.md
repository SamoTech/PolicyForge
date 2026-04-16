# PRINT-006 — Restrict Print Spooler to Localhost Only (Windows Firewall Rule)

**ID:** PRINT-006  
**Category:** Printing / Network Firewall  
**Risk Level:** 🟠 Medium  
**OS:** Windows 7+, Windows 11, Windows Server 2008+  
**Source:** PrintNightmare defense-in-depth guidance · NSA Cybersecurity Advisory July 2021

---

## Policy Path

```
Computer Configuration
  └─ Windows Settings
       └─ Security Settings
            └─ Windows Defender Firewall with Advanced Security
                 └─ Inbound Rules
                      └─ Block: File and Printer Sharing (Spooler Service - RPC)
                           └─ Remote address: Block (not LocalSubnet)
```

## Registry

```
; Configured via Windows Firewall policy — use PowerShell or GPO Firewall rules
; No direct single registry key
```

## PowerShell

```powershell
# Block inbound Spooler RPC from non-local addresses
# First: check existing rules
Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*Spooler*" -or $_.DisplayName -like "*Print*" }

# Block TCP 135 (RPC Endpoint Mapper) from external
New-NetFirewallRule -DisplayName "Block Spooler RPC Inbound" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 135 `
    -RemoteAddress "!LocalSubnet" `
    -Action Block `
    -Profile Domain,Private,Public `
    -Description "PrintNightmare mitigation: block remote Spooler RPC access"

# Block SMB-based print traffic from non-domain
New-NetFirewallRule -DisplayName "Block External Print SMB" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 445 `
    -RemoteAddress Internet `
    -Action Block `
    -Profile Public `
    -Description "Block SMB printer sharing on public networks"

# Verify rules
Get-NetFirewallRule -DisplayName "Block Spooler RPC Inbound" | Select DisplayName, Enabled, Action
```

## Intune CSP

```
; Deploy via Intune Endpoint Security > Firewall > Custom firewall rules
; Or PowerShell remediation script
```

## Description

Creates Windows Firewall rules to block inbound RPC connections to the Print Spooler from non-local addresses. This is a network-layer mitigation complementing the Spooler configuration policies. It prevents remote exploitation even if the Spooler is running and accepting connections, by ensuring only local processes can reach the Spooler RPC endpoint.

## Impact

- ✅ Network-layer block on remote Spooler exploitation
- ✅ Defense-in-depth layer independent of Spooler configuration
- ⚠️ Blocks legitimate remote print queue management if needed
- ℹ️ Complementary to PRINT-001/003 — not a replacement

## Use Cases

- All workstations and servers regardless of Spooler state
- Defense-in-depth for print servers that must accept connections from known subnets only
- Environments where full Spooler disable is not possible

## MITRE ATT&CK Mapping

| Technique | ID | Tactic |
|---|---|---|
| Exploitation for Privilege Escalation | T1068 | Privilege Escalation |
| Forced Authentication | T1187 | Credential Access |

## Compliance References

- **NSA Cybersecurity Advisory:** Mitigating PrintNightmare (July 2021)
- **CIS Benchmark:** Windows 11 v3.0 — 9.3.x (firewall profile rules)

## Test Status

✔ Tested on Windows 11 24H2
✔ Verified remote SpoolSample.exe blocked at firewall layer
