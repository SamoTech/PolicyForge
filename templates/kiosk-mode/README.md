# 🖥️ Kiosk Mode Lockdown Template

> **Target**: Public terminals, reception kiosks, digital signage, shared workstations | **Risk**: High (aggressively restrictive) | **Reversible**: Yes via GPO removal

This template creates a fully locked-down Windows environment where users can only interact with a designated application (browser, POS system, etc.) and cannot access the underlying OS, settings, or file system.

---

## ⚠️ Prerequisites

- Use a **dedicated local account** for kiosk users (not a domain account)
- Test on a physical machine (some UI restrictions don't apply in VMs)
- Have a **separate admin account** that is NOT subject to these policies
- Apply policies to an OU containing only kiosk machines

---

## 🏗️ Architecture

```
Kiosk Machine
├── Admin Account (excluded from kiosk GPO)
│     └── Full OS access for maintenance
└── KioskUser Account (restricted by GPO)
      └── Can only run: [designated app]
            └── No Task Manager, no Explorer, no Control Panel
```

---

## 🔒 Core Lockdown Policies

### 1. Assigned Access (Single-App Kiosk) — Windows 10/11 Pro+

The cleanest native kiosk mode — restricts a local account to a single UWP or browser app.

```powershell
# Configure single-app kiosk via Assigned Access
# Replace 'KioskUser' and the app AUMID with your values

$xml = @"
<?xml version="1.0" encoding="utf-8"?>
<AssignedAccessConfiguration xmlns="http://schemas.microsoft.com/AssignedAccess/2017/config">
  <Profiles>
    <Profile Id="{9A2A490F-10F6-4764-974A-43B19E722C23}">
      <AllAppsList>
        <AllowedApps>
          <App AppUserModelId="Microsoft.MicrosoftEdge.Stable_8wekyb3d8bbwe!App" />
        </AllowedApps>
      </AllAppsList>
      <StartLayout>...</StartLayout>
      <Taskbar ShowTaskbar="false"/>
    </Profile>
  </Profiles>
  <Configs>
    <Config>
      <Account>KioskUser</Account>
      <DefaultProfile Id="{9A2A490F-10F6-4764-974A-43B19E722C23}"/>
    </Config>
  </Configs>
</AssignedAccessConfiguration>
"@

Set-AssignedAccess -ConfigurationXml $xml
```

---

### 2. Shell Replacement (Explorer-less Kiosk)

Replaces Windows Explorer with a custom application as the shell — prevents access to the desktop, Start menu, and taskbar entirely.

```
Registry Path: HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
Value: Shell
Data: C:\KioskApp\kiosk.exe  (replace with your app path)
Type: REG_SZ
```

```powershell
# Apply shell replacement for kiosk user via Group Policy Preferences
# (Apply to KioskUser only via GPP Item-Level Targeting)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" `
  -Name "Shell" -Value "C:\KioskApp\kiosk.exe" -Type String -Force
```

---

### 3. Disable Task Manager

```
HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System
Value: DisableTaskMgr = 1 (REG_DWORD)
```

**GPO Path**:
```
User Configuration → Administrative Templates → System → Ctrl+Alt+Del Options
→ Remove Task Manager → Enabled
```

---

### 4. Disable Access to Control Panel and Settings

**GPO Path**:
```
User Configuration → Administrative Templates → Control Panel
→ Prohibit access to Control Panel and PC settings → Enabled
```

---

### 5. Disable Right-Click on Desktop

```
User Configuration → Administrative Templates → Desktop
→ Prohibit User from manually redirecting Profile Folders → Enabled

HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer
Value: NoViewContextMenu = 1
```

---

### 6. Disable USB Storage (Kiosk)

```powershell
# Block USB storage devices
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\USBSTOR" `
  -Name "Start" -Value 4 -Type DWord -Force
Write-Output "USB storage disabled."
```

**GPO Path**:
```
Computer Configuration → Administrative Templates → System → Removable Storage Access
→ All Removable Storage classes: Deny all access → Enabled
```

---

### 7. Auto-Logon for Kiosk Account

```powershell
# Configure auto-logon (use only on physically secure kiosk machines)
$path = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
Set-ItemProperty -Path $path -Name "AutoAdminLogon" -Value "1" -Type String -Force
Set-ItemProperty -Path $path -Name "DefaultUserName" -Value "KioskUser" -Type String -Force
Set-ItemProperty -Path $path -Name "DefaultPassword" -Value "" -Type String -Force
# For non-empty passwords, consider using Autologon.exe from Sysinternals
```

---

### 8. Configure Screen Timeout and Lock Behavior

```powershell
# Set display off after 10 minutes, no screensaver (kiosk resets via app)
powercfg /change monitor-timeout-ac 10
powercfg /change monitor-timeout-dc 10

# Disable lock screen (kiosk should restart app, not lock)
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization"
if (!(Test-Path $path)) { New-Item -Path $path -Force }
Set-ItemProperty -Path $path -Name "NoLockScreen" -Value 1 -Type DWord -Force
```

---

### 9. Disable Shutdown from UI (Kiosk Users)

```
User Configuration → Administrative Templates → Start Menu and Taskbar
→ Remove and prevent access to the Shut Down, Restart, Sleep, and Hibernate commands → Enabled
```

---

## 🌐 Browser Kiosk (Edge InPrivate Kiosk Mode)

For web-based kiosk deployments, Microsoft Edge has a built-in kiosk mode:

```powershell
# Launch Edge in kiosk mode (Public browsing - InPrivate, no history retained)
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --kiosk https://your-kiosk-url.com `
  --edge-kiosk-type=public-browsing `
  --kiosk-idle-timeout-minutes=5
```

| Kiosk Type | Flag | Behavior |
|---|---|---|
| Digital Signage | `--edge-kiosk-type=fullscreen` | Full screen, no navigation UI |
| Public Browsing | `--edge-kiosk-type=public-browsing` | InPrivate, limited navigation |

---

## 📋 Full Policy Checklist

- [ ] Dedicated local KioskUser account created
- [ ] Auto-logon configured
- [ ] Assigned Access or Shell Replacement applied
- [ ] Task Manager disabled
- [ ] Control Panel / Settings access disabled
- [ ] USB storage blocked
- [ ] Desktop right-click disabled
- [ ] Shutdown from UI disabled
- [ ] Screen timeout configured
- [ ] Tested with a full reboot cycle
- [ ] Admin account verified to retain full access
