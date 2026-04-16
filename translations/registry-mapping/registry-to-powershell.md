# 🗂️ Registry → PowerShell Translation Reference

Every critical registry path used in PolicyForge policies, with the equivalent PowerShell `Set-ItemProperty` command and verification snippet.

---

## Quick Reference Format

```
Registry: HKLM\Path\To\Key → ValueName = Data (Type)
PowerShell: Set-ItemProperty -Path "HKLM:\Path\To\Key" -Name "ValueName" -Value Data -Type DWord -Force
Verify:     Get-ItemProperty -Path "HKLM:\Path\To\Key" -Name "ValueName"
```

---

## 🛡️ Defender Settings

### Real-Time Protection
```powershell
# Enable (DisableRealtimeMonitoring = 0 means ENABLED)
$p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "DisableRealtimeMonitoring" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $p -Name "DisableBehaviorMonitoring" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $p -Name "DisableOnAccessProtection" -Value 0 -Type DWord -Force

# Verify
Get-MpComputerStatus | Select RealTimeProtectionEnabled, BehaviorMonitorEnabled
```

### Cloud Protection
```powershell
$p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "SpynetReporting"      -Value 2 -Type DWord -Force  # Advanced MAPS
Set-ItemProperty -Path $p -Name "SubmitSamplesConsent" -Value 1 -Type DWord -Force  # Safe samples
```

### Network Protection
```powershell
$p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Network Protection"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "EnableNetworkProtection" -Value 1 -Type DWord -Force  # 1=Block, 2=Audit
```

### Controlled Folder Access
```powershell
$p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Windows Defender Exploit Guard\Controlled Folder Access"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "EnableControlledFolderAccess" -Value 1 -Type DWord -Force
```

---

## 🔐 Credential & Authentication

### Disable WDigest
```powershell
$p = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"
Set-ItemProperty -Path $p -Name "UseLogonCredential" -Value 0 -Type DWord -Force
# Verify: should return 0
(Get-ItemProperty $p).UseLogonCredential
```

### NTLMv2 Only (LM Auth Level)
```powershell
$p = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $p -Name "LmCompatibilityLevel" -Value 5 -Type DWord -Force
# 5 = Send NTLMv2 only, refuse LM & NTLM
```

### LSA Protection (RunAsPPL)
```powershell
$p = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $p -Name "RunAsPPL" -Value 1 -Type DWord -Force
Write-Output "Reboot required for LSA PPL to take effect."
```

### Disable Anonymous SAM Enumeration
```powershell
$p = "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"
Set-ItemProperty -Path $p -Name "RestrictAnonymousSAM" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $p -Name "RestrictAnonymous"    -Value 1 -Type DWord -Force
```

---

## 🌐 Network Settings

### Disable LLMNR
```powershell
$p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "EnableMulticast" -Value 0 -Type DWord -Force
```

### Disable NetBIOS over TCP/IP
```powershell
# Apply to all network adapters
$adapters = Get-WmiObject Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled }
foreach ($adapter in $adapters) {
    $adapter.SetTcpipNetbios(2)  # 2 = Disable NetBIOS over TCP/IP
}
```

### Disable Print Spooler (PrintNightmare)
```powershell
Stop-Service -Name Spooler -Force
Set-Service  -Name Spooler -StartupType Disabled
# Verify
Get-Service Spooler | Select Status, StartType
```

---

## 🔒 Privacy

### Disable Telemetry
```powershell
$p = "HKLM:\Software\Policies\Microsoft\Windows\DataCollection"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "AllowTelemetry" -Value 0 -Type DWord -Force
```

### Disable Cortana
```powershell
$p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
if (!(Test-Path $p)) { New-Item -Path $p -Force }
Set-ItemProperty -Path $p -Name "AllowCortana" -Value 0 -Type DWord -Force
```

---

## 🔍 Verify All Critical Settings (Bulk Check)

```powershell
# PolicyForge Quick Health Check
# Run as Administrator

$checks = @(
    @{ Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection"; Name="DisableRealtimeMonitoring"; ExpectedValue=0; PolicyId="DEF-001" },
    @{ Path="HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet"; Name="SpynetReporting"; ExpectedValue=2; PolicyId="DEF-002" },
    @{ Path="HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest"; Name="UseLogonCredential"; ExpectedValue=0; PolicyId="WIN-SECURITY-006" },
    @{ Path="HKLM:\SYSTEM\CurrentControlSet\Control\Lsa"; Name="LmCompatibilityLevel"; ExpectedValue=5; PolicyId="WIN-SECURITY-007" },
    @{ Path="HKLM:\Software\Policies\Microsoft\Windows\DataCollection"; Name="AllowTelemetry"; ExpectedValue=0; PolicyId="WIN-PRIVACY-001" }
)

Write-Host "`n=== PolicyForge Health Check ==="  -ForegroundColor Cyan

foreach ($check in $checks) {
    try {
        $val = Get-ItemPropertyValue -Path $check.Path -Name $check.Name -ErrorAction Stop
        $status = if ($val -eq $check.ExpectedValue) { "PASS" } else { "FAIL" }
        $color  = if ($status -eq "PASS") { "Green" } else { "Red" }
        Write-Host "[$status] $($check.PolicyId): $($check.Name) = $val (expected $($check.ExpectedValue))" -ForegroundColor $color
    } catch {
        Write-Host "[MISS] $($check.PolicyId): $($check.Name) not set" -ForegroundColor Yellow
    }
}
```
