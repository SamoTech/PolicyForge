# 🔴 Red Team Evasion & Offensive Policy Research

> ⚠️ **AUTHORIZED USE ONLY** — This content is for security professionals conducting authorized penetration tests, red team exercises, and defensive research. Misuse violates computer crime laws (CFAA, Computer Misuse Act, etc.). By using this material, you confirm you have explicit written authorization.

This template documents **Windows Group Policy misconfigurations that attackers exploit** and the corresponding **defensive mitigations**. Understanding the offensive perspective is essential for building effective defenses.

---

## 🎯 Purpose

This section exists to:
1. Help **defenders** understand what attackers look for
2. Help **red teamers** validate detection coverage
3. Document **real-world attack paths** through policy misconfigurations
4. Map every finding to a **MITRE ATT&CK technique** and a **PolicyForge fix**

---

## 🔍 Phase 1: Reconnaissance via Policy

### What Attackers Check First

After gaining initial foothold (any user context), attackers enumerate policy state:

```powershell
# What an attacker runs immediately after gaining access:

# 1. Check if Defender is disabled/configured weakly
Get-MpComputerStatus | Select AMServiceEnabled, RealTimeProtectionEnabled, IsTamperProtected

# 2. Find Defender exclusions (gold mine for payload staging)
(Get-MpPreference).ExclusionPath
(Get-MpPreference).ExclusionExtension

# 3. Check PowerShell execution policy
Get-ExecutionPolicy -List

# 4. Check if WDigest is enabled (cleartext creds in memory)
(Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest").UseLogonCredential

# 5. Check LLMNR (for poisoning via Responder)
(Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -ErrorAction SilentlyContinue).EnableMulticast

# 6. Check UAC level
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System").EnableLUA
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System").ConsentPromptBehaviorAdmin
```

---

## 🔴 Attack Path 1: LLMNR/NBT-NS Poisoning

**MITRE**: [T1557.001](https://attack.mitre.org/techniques/T1557/001/) — Adversary-in-the-Middle: LLMNR/NBT-NS Poisoning

### Attack Flow

```
Victim PC → resolves non-existent hostname
         → broadcasts LLMNR query (UDP 5355)
         → Attacker (Responder) answers first
         → Victim sends NTLMv2 hash to attacker
         → Attacker cracks hash offline (Hashcat, John)
         → Attacker now has domain credentials
```

### Detection

```
Event ID 4648 — Logon with explicit credentials to unexpected host
Event ID 4624 — Type 3 (Network) logon from unexpected source IP
Network: UDP 5355 traffic NOT destined to domain controller
```

### ✅ PolicyForge Fix

Policies: `WIN-SECURITY-012` (Disable LLMNR), `WIN-SECURITY-013` (Disable NetBIOS)

```powershell
# Disable LLMNR
$p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "EnableMulticast" -Value 0 -Type DWord -Force
```

---

## 🔴 Attack Path 2: LSASS Credential Dump (Mimikatz)

**MITRE**: [T1003.001](https://attack.mitre.org/techniques/T1003/001/) — OS Credential Dumping: LSASS Memory

### Attack Flow

```
Attacker (local admin) →
  Task Manager → Create dump of lsass.exe
  OR: mimikatz # privilege::debug
               # sekurlsa::logonpasswords
  → Extracts plaintext passwords (if WDigest on)
    or NTLMv2 hashes (for pass-the-hash)
```

### Prerequisites for Attacker Success

| Condition | Attacker Advantage |
|---|---|
| WDigest enabled | Plaintext passwords in memory |
| LSA PPL disabled | LSASS dumpable by any local admin |
| Credential Guard off | No virtualization-based isolation |
| Tamper Protection off | Defender can be disabled first |

### ✅ PolicyForge Fix

Policies: `WIN-SECURITY-006` (WDigest), `WIN-SECURITY-008` (LSA PPL), `DEF-008` (Tamper Protection)

```powershell
# Disable WDigest
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest" `
  -Name "UseLogonCredential" -Value 0 -Type DWord -Force

# Enable LSASS PPL
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" `
  -Name "RunAsPPL" -Value 1 -Type DWord -Force
```

---

## 🔴 Attack Path 3: Defender Exclusion Abuse

**MITRE**: [T1562.001](https://attack.mitre.org/techniques/T1562/001/) — Impair Defenses

### Attack Flow

```
Attacker gains local admin →
  Queries Defender exclusions via PowerShell (no admin needed!)
  Finds excluded path: C:\Temp\Build\*
  Drops payload into excluded path
  Payload executes without Defender detection
  Lateral movement begins
```

> **Critical**: Reading Defender exclusions does NOT require admin rights on default Windows configurations. Any user can run `(Get-MpPreference).ExclusionPath`.

### Detection

```
Event ID 5007 — Microsoft Defender configuration changed
Event ID 1116 — Malware detected (even in exclusion zones, sometimes)
SIEM alert: Process in excluded path spawning cmd.exe / powershell.exe
```

### ✅ PolicyForge Fix

Policy: `DEF-007` (Exclusion Best Practices)

- Audit exclusions quarterly using the DEF-007 PowerShell script
- Restrict exclusion visibility: `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender` → `DisableLocalAdminMerge = 1`
- Never exclude `%TEMP%`, `%APPDATA%`, or script extensions

---

## 🔴 Attack Path 4: PrintNightmare (Spooler Abuse)

**MITRE**: [T1547.012](https://attack.mitre.org/techniques/T1547/012/) — Print Processors

### Attack Flow

```
CVE-2021-1675 / CVE-2021-34527:
Attacker (low-privilege remote) →
  Calls RpcAddPrinterDriverEx() to load a malicious DLL
  Windows Print Spooler loads DLL as SYSTEM
  Attacker achieves SYSTEM code execution
  Full domain compromise possible from any network
```

### ✅ PolicyForge Fix

Policy: `WIN-SECURITY-015` (Disable Print Spooler on non-print servers)

```powershell
Stop-Service Spooler -Force
Set-Service Spooler -StartupType Disabled
```

---

## 🔴 Attack Path 5: GPO Misconfiguration — Over-Permissioned OUs

**MITRE**: [T1484.001](https://attack.mitre.org/techniques/T1484/001/) — Domain Policy Modification: Group Policy

### Attack Flow

```
Attacker compromises account with GPO write access →
  Creates malicious GPO (e.g., immediate scheduled task)
  Links to Domain Controllers or sensitive OUs
  Scheduled task runs as SYSTEM on all linked machines
  Full domain compromise
```

### Detection & Prevention

```powershell
# Audit GPO permissions — find accounts with unexpected write access
Get-GPO -All | ForEach-Object {
    $gpo = $_
    $gpo.GetSecurityInfo() | Where-Object {
        $_.Permission -match 'GpoEditDeleteModifySecurity' -and
        $_.Trustee.Name -notmatch 'Domain Admins|Enterprise Admins|SYSTEM'
    } | ForEach-Object {
        [PSCustomObject]@{
            GPO = $gpo.DisplayName
            Trustee = $_.Trustee.Name
            Permission = $_.Permission
        }
    }
} | Format-Table -AutoSize
```

---

## 📋 Red Team Checklist (Authorized Use)

Use this checklist during authorized engagements to validate defensive coverage:

```
□ LLMNR disabled? → Test: Run Responder on network segment
□ NBT-NS disabled? → Test: nbtstat -n on victim
□ WDigest off? → Test: mimikatz sekurlsa::logonpasswords (no plaintext)
□ LSA PPL on? → Test: procdump64 -ma lsass.exe (should fail)
□ Defender exclusions minimal? → Test: (Get-MpPreference).ExclusionPath
□ ASR blocking Office macros? → Test: EICAR macro in Word doc
□ Network Protection blocking C2? → Test: curl to known malicious domain
□ Print Spooler disabled? → Test: Impacket PrintNightmare PoC
□ LSASS dump blocked? → Test: Task Manager > Create Dump (should fail)
□ PowerShell logging on? → Test: Check Event 4104 after PS execution
```

---

## 🗺️ MITRE ATT&CK Coverage Map

| Tactic | Technique | Attack Path | PolicyForge Fix |
|---|---|---|---|
| Credential Access | T1003.001 LSASS Dump | Path 2 | WIN-SECURITY-006, 008; DEF-008 |
| Credential Access | T1557.001 LLMNR Poisoning | Path 1 | WIN-SECURITY-012, 013 |
| Defense Evasion | T1562.001 Disable Defender | Path 3 | DEF-007, DEF-008 |
| Execution | T1547.012 PrintNightmare | Path 4 | WIN-SECURITY-015 |
| Persistence | T1484.001 GPO Modification | Path 5 | GPO Permission Audit |
| Discovery | T1087 Account Discovery | (LLMNR recon) | WIN-SECURITY-012 |
| Lateral Movement | T1550 Pass-the-Hash | Enabled by WDigest | WIN-SECURITY-006 |
