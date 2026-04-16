# AUDIT-010 — Network Activity & Firewall Connection Auditing

**ID:** AUDIT-010  
**Category:** Audit Policy / Network Monitoring  
**Risk Level:** 🟡 Medium  
**OS:** Windows 10+, Windows 11  
**Source:** CIS Benchmark · NSA Best Practices

---

## auditpol Commands

```powershell
# Network auditing subcategories
auditpol /set /subcategory:"Filtering Platform Connection"       /failure:enable
auditpol /set /subcategory:"Filtering Platform Packet Drop"     /failure:enable
auditpol /set /subcategory:"Other Object Access Events"          /success:enable
auditpol /set /subcategory:"Detailed File Share"                  /failure:enable
auditpol /set /subcategory:"File Share"                          /success:enable /failure:enable
```

## Critical Event IDs — Network & File Share

| Event ID | Description | Alert On |
|---|---|---|
| **5140** | Network share accessed | Access to C$, ADMIN$ shares |
| **5142** | Network share added | Always alert |
| **5144** | Network share deleted | Always alert |
| **5145** | Network share object access checked | Bulk access = ransomware |
| **5152** | Packet blocked by WFP | Bulk blocks = port scan |
| **5154** | Listening port opened | New listening ports |
| **5156** | Network connection allowed | Outbound to unusual destinations |
| **5157** | Network connection blocked | |
| **5158** | Local port bound | New port binding |

## PowerShell — Detect Admin Share Access

```powershell
# Alert: Admin share access (lateral movement indicator)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=5140} -MaxEvents 100 |
    Where-Object { $_.Properties[6].Value -match 'C\$|ADMIN\$|IPC\$' } |
    ForEach-Object {
        [PSCustomObject]@{
            Time      = $_.TimeCreated
            ShareName = $_.Properties[6].Value
            SourceIP  = $_.Properties[4].Value
            User      = $_.Properties[1].Value
        }
    }
```

## Description

Network share access auditing (5140/5145) detects lateral movement via SMB. Attackers using PsExec, Cobalt Strike, or manual SMB enumeration access admin shares (C$, ADMIN$) — Event 5140 logs every share access with source IP and username. Bulk 5145 events (thousands of file access checks in seconds) indicate ransomware staging for encryption. Filtering Platform events (5152-5158) provide network connection visibility without a full network monitoring solution.

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 17.6.x (L2)
- **DISA STIG:** WN11-AU-000095

## Test Status

✔ Tested on Windows 11 24H2
