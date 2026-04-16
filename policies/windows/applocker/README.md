# AppLocker Policies

AppLocker is an application allowlisting solution available in Windows 10/11 Enterprise and Education editions. It controls which executables, scripts, MSI packages, DLLs, and Store apps can run.

## Policy Index

| ID | Policy | Collection | Risk |
|---|---|---|---|
| [AL-001](AL-001.md) | Enable Application Identity Service | Prerequisite | 🟠 Medium |
| [AL-002](AL-002.md) | Default Executable Allow Rules | Exe | 🔴 Critical |
| [AL-003](AL-003.md) | Script Rules (Block user-path scripts) | Script | 🔴 Critical |
| [AL-004](AL-004.md) | Publisher-First Rule Strategy | All | 🟠 Medium |
| [AL-005](AL-005.md) | Windows Installer Rules | MSI | 🔴 Critical |
| [AL-006](AL-006.md) | Packaged App (MSIX/Store) Rules | AppX | 🟠 Medium |
| [AL-007](AL-007.md) | DLL Rules (Advanced — deploy last) | DLL | 🔴 Critical |

---

## Deployment Order

```
Step 1 → Enable AppIDSvc (AL-001)                 ← Without this, nothing enforces
Step 2 → Create Default Exe Rules (AL-002)        ← Audit mode first
Step 3 → Create Script Rules (AL-003)             ← Audit mode
Step 4 → Create MSI Rules (AL-005)                ← Audit mode
Step 5 → Create Packaged App Rules (AL-006)       ← Required if Exe rules enforced
Step 6 → Add Publisher Rules (AL-004)             ← Replace path rules where possible
Step 7 → 14-30 days audit → review Event 8003     ← Fix false positives
Step 8 → Switch to Enforce Rules (not Audit Only)
Step 9 → Add DLL Rules only after step 8 is stable (AL-007)
```

## Rule Type Decision Tree

```
Is the file digitally signed?
  YES → Use Publisher Rule (AL-004)    ← Always prefer this
  NO  → Is the path admin-only writable?
         YES → Use Path Rule
         NO  → Use Hash Rule           ← Last resort
```

## Audit → Enforce Event Quick Reference

| Collection | Audit Event | Block Event | Log |
|---|---|---|---|
| EXE/DLL | 8003 | 8004 | AppLocker/EXE and DLL |
| Scripts | 8005 | 8006 | AppLocker/Script and Interpreted |
| MSI | 8007 | 8008 | AppLocker/MSI and Script |
| Packaged Apps | 8020 | 8021 | AppLocker/Packaged app-Execution |

```powershell
# One-liner to see all AppLocker audit violations:
Get-WinEvent -LogName @(
    'Microsoft-Windows-AppLocker/EXE and DLL',
    'Microsoft-Windows-AppLocker/Script and Interpreted',
    'Microsoft-Windows-AppLocker/MSI and Script',
    'Microsoft-Windows-AppLocker/Packaged app-Execution'
) | Where-Object { $_.Id -in @(8003, 8005, 8007, 8021) } |
  Sort TimeCreated -Descending |
  Select TimeCreated, Id, @{N='File';E={$_.Properties[1].Value}} |
  Format-Table -AutoSize
```

## Related Policies

- [WDAC-001–004](../wdac/) — Stronger kernel-level enforcement complement
- [ASR-006](../asr/ASR-006.md) — Block JS/VBS launchers (complements AL-003)
- [ASR-003](../asr/ASR-003.md) — Block Office child processes (complements AL-002)
