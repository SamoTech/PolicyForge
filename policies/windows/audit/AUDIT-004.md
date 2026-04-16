# AUDIT-004 — PowerShell Script Block Logging

**ID:** AUDIT-004  
**Category:** Audit Policy / PowerShell / Detection  
**Risk Level:** 🔴 Critical  
**OS:** Windows 10+, Windows 11  
**Source:** NSA/CISA · Microsoft · SANS

---

## Policy Path

```
Computer Configuration
  └─ Administrative Templates
       └─ Windows Components
            └─ Windows PowerShell
                 ├─ Turn on PowerShell Script Block Logging:    Enabled
                 │    └─ Log script block invocation start/stop: Enabled
                 ├─ Turn on PowerShell Transcription:           Enabled
                 │    ├─ Transcript output directory: \\server\PSTranscripts\
                 │    └─ Include invocation headers: Enabled
                 └─ Turn on Module Logging:                     Enabled
                      └─ Module names: *    (all modules)
```

## Registry

```
HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging
  EnableScriptBlockLogging         = 1
  EnableScriptBlockInvocationLogging = 1

HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\Transcription
  EnableTranscripting              = 1
  EnableInvocationHeader           = 1
  OutputDirectory                  = "\\\\logserver\\PSTranscripts"

HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ModuleLogging
  EnableModuleLogging              = 1
  ; ModuleNames key: Add "*" value to log all modules
```

## PowerShell — Enable via Script

```powershell
# Enable Script Block Logging
$sbPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
New-Item -Path $sbPath -Force | Out-Null
Set-ItemProperty -Path $sbPath -Name "EnableScriptBlockLogging" -Value 1
Set-ItemProperty -Path $sbPath -Name "EnableScriptBlockInvocationLogging" -Value 1

# Enable Module Logging (log all modules)
$mlPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ModuleLogging"
New-Item -Path $mlPath -Force | Out-Null
Set-ItemProperty -Path $mlPath -Name "EnableModuleLogging" -Value 1
New-Item -Path "$mlPath\ModuleNames" -Force | Out-Null
Set-ItemProperty -Path "$mlPath\ModuleNames" -Name "*" -Value "*"

# Read script block logs
Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational" |
    Where-Object { $_.Id -eq 4104 } |
    Select TimeCreated,
           @{N='ScriptBlock';E={$_.Properties[2].Value}},
           @{N='Path';E={$_.Properties[4].Value}} |
    Sort TimeCreated -Descending
```

## Critical PowerShell Event IDs

| Event ID | Log | Description | Alert On |
|---|---|---|---|
| **4103** | PS/Operational | Module logging output | All module invocations |
| **4104** | PS/Operational | **Script block content** | Encoded commands, download cradles |
| **4105** | PS/Operational | Script block start | — |
| **4106** | PS/Operational | Script block stop | — |

## Suspicious PowerShell Patterns to Alert On

```powershell
# Hunt: Encoded commands (obfuscation indicator)
Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational" |
    Where-Object { $_.Id -eq 4104 -and
                   $_.Properties[2].Value -match 'EncodedCommand|frombase64|iex|invoke-expression|downloadstring|webclient' } |
    Select TimeCreated, @{N='Block';E={$_.Properties[2].Value[0..200]}} |
    Sort TimeCreated -Descending
```

## Description

PowerShell Script Block Logging (Event 4104) captures the actual content of every PowerShell script block executed on the system, including dynamically generated code and decoded obfuscated payloads. This is the single most effective control for detecting PowerShell-based attacks — when an attacker runs an obfuscated download cradle, PowerShell deobfuscates it before execution, and Script Block Logging captures the deobfuscated version. Combined with AMSI, this closes the obfuscation evasion gap.

## Impact

- ✅ Captures deobfuscated PowerShell code — closes obfuscation gap
- ✅ Detects download cradles, AMSI bypasses, credential dumping scripts
- ⚠️ High log volume on systems with heavy PS automation
- ⚠️ Transcripts may capture sensitive data (passwords passed to PS)

## MITRE ATT&CK Coverage

T1059.001 (PowerShell), T1027 (Obfuscation), T1140 (Deobfuscation), T1552 (Credentials in Scripts)

## Compliance References

- **CIS Benchmark:** Windows 11 v3.0 — 18.9.95.1, 18.9.95.2, 18.9.95.3 (L1)
- **DISA STIG:** WN11-CC-000326, WN11-CC-000327

## Test Status

✔ Tested on Windows 11 24H2 / PowerShell 5.1
✔ Event 4104 captured obfuscated IEX payload
