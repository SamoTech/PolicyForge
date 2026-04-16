# 🎮 Gaming Optimization Template

> **Target**: Home / enthusiast gaming PCs | **Risk**: Low | **Reversible**: Yes (restore points recommended)

This template applies Group Policy and registry settings that improve gaming performance by reducing background service overhead, optimizing scheduling, disabling power-saving throttling, and eliminating gaming-hostile telemetry. These settings are designed for **dedicated gaming machines** or dual-boot scenarios — review before applying to a shared enterprise workstation.

---

## ⚠️ Prerequisites

- Create a **System Restore Point** before applying
- Test on a non-production machine first
- Some settings require a **reboot** to take effect

---

## 🚀 Performance Settings

### 1. High Performance Power Plan

```powershell
# Set High Performance power plan
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Or create Ultimate Performance plan (Windows 10 1803+)
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61

# Verify
powercfg /getactivescheme
```

**GPO Path**:
```
Computer Configuration → Administrative Templates → System → Power Management
→ Active Power Plan → High Performance
```

---

### 2. Disable CPU Core Parking

Core parking puts CPU cores into deep sleep states during low-load periods — causing latency spikes when a game suddenly demands burst performance.

```powershell
# Disable core parking (sets minimum processor state to 100%)
$guid = (powercfg /getactivescheme).Split()[3]
powercfg /setacvalueindex $guid SUB_PROCESSOR CPMINCORES 100
powercfg /setdcvalueindex $guid SUB_PROCESSOR CPMINCORES 100
powercfg /setactive $guid
```

---

### 3. Game Mode

```powershell
# Enable Windows Game Mode
$path = "HKCU:\Software\Microsoft\GameBar"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "AllowAutoGameMode" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $path -Name "AutoGameModeEnabled" -Value 1 -Type DWord -Force
```

**GPO Path**:
```
Computer Configuration → Administrative Templates → Windows Components → Game Explorer
→ Turn off downloading of game information → Disabled (allow game info)
```

---

### 4. GPU Scheduling (Hardware Accelerated)

Reduces input latency by allowing the GPU to manage its own memory more efficiently.

```powershell
# Enable Hardware-Accelerated GPU Scheduling (HAGS) — requires WDDM 2.7+ driver
$path = "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers"
Set-ItemProperty -Path $path -Name "HwSchMode" -Value 2 -Type DWord -Force
Write-Output "HAGS enabled. Reboot required."
```

> **Note**: Requires Windows 10 2004+ and a compatible GPU driver (NVIDIA 451.48+, AMD 20.5.1+)

---

## 🔇 Disable Gaming-Hostile Background Services

```powershell
# Disable SysMain (Superfetch) - can cause HDD/SSD stuttering during gaming
Stop-Service -Name SysMain -Force
Set-Service -Name SysMain -StartupType Disabled

# Disable Windows Search indexing during gaming (optional - hurts system search)
# Stop-Service -Name WSearch -Force
# Set-Service -Name WSearch -StartupType Disabled

# Disable Xbox Game Bar overlay if not used
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\GameDVR"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "AllowGameDVR" -Value 0 -Type DWord -Force
```

---

## 🌐 Network Optimization for Gaming

```powershell
# Disable Nagle's Algorithm (reduces TCP latency at cost of some bandwidth efficiency)
$nicPath = "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces"
Get-ChildItem $nicPath | ForEach-Object {
    Set-ItemProperty -Path $_.PSPath -Name "TcpAckFrequency" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $_.PSPath -Name "TCPNoDelay" -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
}

# Set Network Throttling Index to max (disable multimedia throttling)
$path = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile"
Set-ItemProperty -Path $path -Name "NetworkThrottlingIndex" -Value 0xffffffff -Type DWord -Force
```

---

## 🎮 Game-Specific Scheduling Priority

```powershell
# Set Games scheduling category to highest priority
$path = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "Affinity" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $path -Name "Background Only" -Value "False" -Type String -Force
Set-ItemProperty -Path $path -Name "Clock Rate" -Value 10000 -Type DWord -Force
Set-ItemProperty -Path $path -Name "GPU Priority" -Value 8 -Type DWord -Force
Set-ItemProperty -Path $path -Name "Priority" -Value 6 -Type DWord -Force
Set-ItemProperty -Path $path -Name "Scheduling Category" -Value "High" -Type String -Force
Set-ItemProperty -Path $path -Name "SFIO Priority" -Value "High" -Type String -Force
```

---

## 🔁 Restore Defaults

```powershell
# Restore Balanced power plan
powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e

# Re-enable SysMain
Set-Service -Name SysMain -StartupType Automatic
Start-Service -Name SysMain

# Re-enable Game DVR
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\GameDVR"
Set-ItemProperty -Path $path -Name "AllowGameDVR" -Value 1 -Type DWord -Force
```

---

## 📊 Expected Performance Impact

| Setting | Typical Impact |
|---|---|
| High Performance power plan | 5–15% CPU boost in burst workloads |
| GPU Scheduling (HAGS) | 1–5ms input latency reduction |
| Disable core parking | Eliminates micro-stutter on multicore games |
| Disable Nagle's Algorithm | Reduces online game ping by 5–20ms |
| Game scheduling priority | More consistent frame pacing |

> Results vary by hardware, game engine, and configuration. Always benchmark before/after.
