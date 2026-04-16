---
id: WIN-SECURITY-004
name: Disable NetBIOS Name Service (NBT-NS)
category: [Security, Network, Credential Protection]
risk_level: High
applies_to: [Windows XP+, Windows 10, Windows 11, Windows Server 2003+]
test_status: "✅ Tested on Windows 10 22H2, Windows 11 23H2"
---

# Disable NetBIOS Name Service (NBT-NS)

## Description

NBT-NS is abused alongside LLMNR by the Responder tool for hash capture and credential relay attacks. Must be disabled per-NIC. Always pair with `WIN-SECURITY-003`.

## PowerShell (All Adapters)

```powershell
$adapters = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled = TRUE"
foreach ($adapter in $adapters) {
    $adapter.SetTcpipNetbios(2) | Out-Null  # 2 = Disable NetBIOS over TCP/IP
    Write-Output "Disabled NetBIOS on: $($adapter.Description)"
}
Write-Output "Done. Reboot may be required."
```

## Registry (Per Adapter)

```
HKLM\SYSTEM\CurrentControlSet\services\NetBT\Parameters\Interfaces\Tcpip_{ADAPTER-GUID}
Value: NetbiosOptions = 2 (REG_DWORD)
```

## MITRE ATT&CK Mapping

| Technique | Description |
|---|---|
| [T1557.001](https://attack.mitre.org/techniques/T1557/001/) | LLMNR/NBT-NS Poisoning and SMB Relay |

## Compliance References

- **CIS Benchmark**: Windows 10/11 Level 1, Control 18.5.4.2
- **DISA STIG**: WN10-CC-000035

## Notes

- Always disable **both** LLMNR (`WIN-SECURITY-003`) and NBT-NS together.
- Verify with `nmap --script nbstat` after applying.
