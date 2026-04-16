# 🔄 GPO → Intune Translation: Windows Security

This file maps the 50 most critical Windows security Group Policy settings to their Intune MDM CSP equivalents. Use this as a migration reference when moving from on-premises GPO management to cloud-native Intune.

> **Format**: Each entry shows the GPO path → Registry → Intune OMA-URI → recommended value

---

## How to Use This File

1. Find the policy by name or category
2. Copy the **OMA-URI** and **Value** into Intune: *Devices → Configuration → Create → Custom*
3. Set Data Type to match the column (Integer, String, Boolean)
4. Test on a pilot group before broad deployment

---

## 🔐 Account & Authentication

| # | Policy Name | GPO Path | Registry Value | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 1 | Minimum Password Length | `Security Settings > Account Policies > Password Policy` | N/A (SAM) | `./Device/Vendor/MSFT/Policy/Config/DeviceLock/MinDevicePasswordLength` | `12` | Integer |
| 2 | Password Complexity | `Security Settings > Account Policies > Password Policy` | N/A (SAM) | `./Device/Vendor/MSFT/Policy/Config/DeviceLock/AlphanumericDevicePasswordRequired` | `1` | Integer |
| 3 | Maximum Password Age | `Security Settings > Account Policies > Password Policy` | N/A (SAM) | `./Device/Vendor/MSFT/Policy/Config/DeviceLock/DevicePasswordExpiration` | `90` | Integer |
| 4 | Account Lockout Threshold | `Security Settings > Account Policies > Lockout Policy` | N/A (SAM) | `./Device/Vendor/MSFT/Policy/Config/DeviceLock/MaxDevicePasswordFailedAttempts` | `5` | Integer |
| 5 | Account Lockout Duration | `Security Settings > Account Policies > Lockout Policy` | N/A (SAM) | `./Device/Vendor/MSFT/Policy/Config/DeviceLock/DevicePasswordHistory` | `24` | Integer |
| 6 | Rename Administrator Account | `Security Settings > Local Policies > Security Options` | `HKLM\SAM` | Not available via MDM CSP — use local script or Endpoint Privilege Mgmt | — | — |
| 7 | Disable Guest Account | `Security Settings > Local Policies > Security Options` | `HKLM\SAM` | `./Device/Vendor/MSFT/Accounts/Users/Guest/Password` | Disable via script | — |

---

## 🛡️ Microsoft Defender

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 8 | Enable Real-Time Protection | `Windows Components > Defender AV > Real-Time Protection` | `DisableRealtimeMonitoring=0` | `./Device/Vendor/MSFT/Policy/Config/Defender/AllowRealtimeMonitoring` | `1` | Integer |
| 9 | Enable Cloud Protection (MAPS) | `Windows Components > Defender AV > MAPS` | `SpynetReporting=2` | `./Device/Vendor/MSFT/Policy/Config/Defender/AllowCloudProtection` | `1` | Integer |
| 10 | Cloud Block Level | `Windows Components > Defender AV > MpEngine` | `MpCloudBlockLevel=2` | `./Device/Vendor/MSFT/Policy/Config/Defender/CloudBlockLevel` | `2` | Integer |
| 11 | Enable Behavior Monitoring | `Windows Components > Defender AV > Real-Time Protection` | `DisableBehaviorMonitoring=0` | `./Device/Vendor/MSFT/Policy/Config/Defender/AllowBehaviorMonitoring` | `1` | Integer |
| 12 | Enable Network Protection | `Windows Components > Defender > Network Protection` | `EnableNetworkProtection=1` | `./Device/Vendor/MSFT/Policy/Config/Defender/EnableNetworkProtection` | `1` | Integer |
| 13 | Enable PUA Protection | `Windows Components > Defender AV` | `PUAProtection=1` | `./Device/Vendor/MSFT/Policy/Config/Defender/PUAProtection` | `1` | Integer |
| 14 | Controlled Folder Access | `Windows Components > Defender > Exploit Guard > CFA` | `EnableControlledFolderAccess=1` | `./Device/Vendor/MSFT/Policy/Config/Defender/EnableControlledFolderAccess` | `1` | Integer |
| 15 | Scheduled Scan Day | `Windows Components > Defender AV > Scan` | `ScheduleDay=4` | `./Device/Vendor/MSFT/Policy/Config/Defender/ScheduleScanDay` | `4` | Integer |
| 16 | Scheduled Scan Time | `Windows Components > Defender AV > Scan` | `ScheduleTime=120` | `./Device/Vendor/MSFT/Policy/Config/Defender/ScheduleScanTime` | `120` | Integer |
| 17 | Submit Sample Consent | `Windows Components > Defender AV > MAPS` | `SubmitSamplesConsent=1` | `./Device/Vendor/MSFT/Policy/Config/Defender/SubmitSamplesConsent` | `1` | Integer |

---

## 🔒 System Security

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 18 | Disable AutoRun | `Windows Components > AutoPlay Policies` | `NoDriveTypeAutoRun=255` | `./Device/Vendor/MSFT/Policy/Config/Autoplay/DisallowAutoplayForNonVolumeDevices` | `<enabled/>` | String |
| 19 | Disable AutoPlay | `Windows Components > AutoPlay Policies` | `NoAutorun=1` | `./Device/Vendor/MSFT/Policy/Config/Autoplay/SetDefaultAutoRunBehavior` | `<enabled/><data...>` | String |
| 20 | UAC Admin Approval Mode | `Security Settings > Local Policies > Security Options` | `EnableLUA=1` | `./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_RunAllAdministratorsInAdminApprovalMode` | `1` | Integer |
| 21 | UAC Prompt Behavior (Admins) | `Security Settings > Local Policies > Security Options` | `ConsentPromptBehaviorAdmin=2` | `./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_BehaviorOfTheElevationPromptForAdministrators` | `2` | Integer |
| 22 | UAC Virtualize File/Reg Writes | `Security Settings > Local Policies > Security Options` | `EnableVirtualization=1` | `./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_VirtualizeFileAndRegistryWriteFailuresToPerUserLocations` | `1` | Integer |
| 23 | Disable Anonymous SAM Enum | `Security Settings > Local Policies > Security Options` | `RestrictAnonymousSAM=1` | `./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkAccess_DoNotAllowAnonymousEnumerationOfSAMAccounts` | `1` | Integer |
| 24 | LAN Manager Auth Level (NTLMv2) | `Security Settings > Local Policies > Security Options` | `LmCompatibilityLevel=5` | `./Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/NetworkSecurity_LANManagerAuthenticationLevel` | `5` | Integer |
| 25 | Disable WDigest Auth | `Windows Components > Credential Delegation` | `UseLogonCredential=0` | `./Device/Vendor/MSFT/Policy/Config/MSSLegacy/NetworkSecurity_DoNotStoreLANManagerHashValueOnNextPasswordChange` | `1` | Integer |

---

## 🌐 Network Security

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 26 | Windows Firewall — Domain ON | `Windows Settings > Security Settings > Windows Firewall` | `EnableFirewall=1` | `./Device/Vendor/MSFT/Policy/Config/Firewall/EnableFirewall` | `true` | Boolean |
| 27 | Windows Firewall — Private ON | `Windows Settings > Security Settings > Windows Firewall` | `EnableFirewall=1` | `./Device/Vendor/MSFT/Firewall/MdmStore/PrivateProfile/EnableFirewall` | `true` | Boolean |
| 28 | Windows Firewall — Public ON | `Windows Settings > Security Settings > Windows Firewall` | `EnableFirewall=1` | `./Device/Vendor/MSFT/Firewall/MdmStore/PublicProfile/EnableFirewall` | `true` | Boolean |
| 29 | Block Inbound by Default (Public) | `Windows Firewall > Public Profile` | `DefaultInboundAction=1` | `./Device/Vendor/MSFT/Firewall/MdmStore/PublicProfile/DefaultInboundAction` | `1` | Integer |
| 30 | Disable LLMNR | `Windows Components > DNS Client` | `EnableMulticast=0` | `./Device/Vendor/MSFT/Policy/Config/MSSLegacy/WDigestAuthentication` | — | — |
| 31 | Disable NetBIOS over TCP/IP | `Network > TCP/IP Settings` | `NetbiosOptions=2` | Not directly available — use PowerShell via Remediation script | — | — |
| 32 | Require NLA for RDP | `Windows Components > Remote Desktop Services > RDS Session Host > Security` | `UserAuthentication=1` | `./Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/RequireSecureRPCCommunication` | `1` | Integer |
| 33 | Disable RDP (if not needed) | `Windows Components > Remote Desktop Services` | `fDenyTSConnections=1` | `./Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/AllowRemoteDesktopService` | `0` | Integer |
| 34 | Disable SMBv1 | `Windows Components > LanmanServer` | `SMB1=0` (Features) | Not via CSP — use: `./Device/Vendor/MSFT/WindowsDefenderApplicationGuard/Settings/AllowWindowsDefenderApplicationGuard` or PowerShell Remediation | — | — |

---

## 🔏 Privacy & Telemetry

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 35 | Disable Telemetry | `Windows Components > Data Collection and Preview Builds` | `AllowTelemetry=0` | `./Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry` | `0` | Integer |
| 36 | Disable Cortana | `Windows Components > Search` | `AllowCortana=0` | `./Device/Vendor/MSFT/Policy/Config/Experience/AllowCortana` | `0` | Integer |
| 37 | Disable OneDrive | `Windows Components > OneDrive` | `DisableFileSyncNGSC=1` | `./Device/Vendor/MSFT/Policy/Config/Experience/DoNotSyncBrowserSetting` | — | — |
| 38 | Disable Consumer Features | `Windows Components > Cloud Content` | `DisableWindowsConsumerFeatures=1` | `./Device/Vendor/MSFT/Policy/Config/Experience/AllowWindowsConsumerFeatures` | `0` | Integer |
| 39 | Disable Location Services | `Windows Components > Location and Sensors` | `DisableLocation=1` | `./Device/Vendor/MSFT/Policy/Config/System/AllowLocation` | `0` | Integer |
| 40 | Disable App Telemetry | `Windows Components > Application Compatibility` | `AITEnable=0` | `./Device/Vendor/MSFT/Policy/Config/ApplicationManagement/AllowStore` | — | — |

---

## ⚙️ PowerShell & Script Security

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 41 | PowerShell Execution Policy | `Windows Components > Windows PowerShell` | `ExecutionPolicy=RemoteSigned` | `./Device/Vendor/MSFT/Policy/Config/Power/AllowHibernate` | Use PowerShell Remediation | — |
| 42 | Enable Script Block Logging | `Windows Components > Windows PowerShell` | `EnableScriptBlockLogging=1` | `./Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/EnableScriptBlockLogging` | `<enabled/>` | String |
| 43 | Enable Module Logging | `Windows Components > Windows PowerShell` | `EnableModuleLogging=1` | `./Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/ModuleLogging` | `<enabled/>` | String |
| 44 | Enable Transcription | `Windows Components > Windows PowerShell` | `EnableTranscripting=1` | `./Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/EnableTranscripting` | `<enabled/>` | String |

---

## 📋 Audit & Logging

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 45 | Audit Process Creation (Event 4688) | `Advanced Audit Policy > Detailed Tracking` | `ProcessCreationIncludeCmdLine_Enabled=1` | `./Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation` | `3` | Integer |
| 46 | Audit Logon Events | `Advanced Audit Policy > Logon/Logoff` | Audit policy | `./Device/Vendor/MSFT/Policy/Config/Audit/AccountLogon_AuditKerberosAuthenticationService` | `3` | Integer |
| 47 | Audit Account Lockout | `Advanced Audit Policy > Logon/Logoff` | Audit policy | `./Device/Vendor/MSFT/Policy/Config/Audit/AccountLogon_AuditKerberosServiceTicketOperations` | `3` | Integer |
| 48 | Security Log Max Size (196MB) | `Windows Settings > Security Settings > Event Log` | `MaxSize=200704` | `./Device/Vendor/MSFT/Policy/Config/EventLog/SpecifyMaximumFileSizeSecurityLog` | `204800` | Integer |
| 49 | Audit Privilege Use | `Advanced Audit Policy > Privilege Use` | Audit policy | `./Device/Vendor/MSFT/Policy/Config/Audit/PrivilegeUse_AuditSensitivePrivilegeUse` | `3` | Integer |
| 50 | Audit Object Access | `Advanced Audit Policy > Object Access` | Audit policy | `./Device/Vendor/MSFT/Policy/Config/Audit/ObjectAccess_AuditFileSystem` | `3` | Integer |

---

## Notes & Limitations

> **Audit values**: `0` = None, `1` = Success, `2` = Failure, `3` = Success + Failure

### Policies Without a Direct CSP Equivalent

Some GPO settings have no direct OMA-URI CSP mapping. For these, use Intune **Remediation Scripts** (PowerShell):

| Policy | Workaround |
|---|---|
| Disable SMBv1 | PowerShell Remediation: `Disable-WindowsOptionalFeature` |
| Disable NetBIOS over TCP/IP | PowerShell Remediation: WMI NIC configuration |
| Rename Administrator Account | PowerShell Remediation: `Rename-LocalUser` |
| LAN Manager hash storage | PowerShell Remediation: Registry write |

### Migration Workflow

```
1. Export current GPO settings via GPRESULT /H report.html
2. Map each setting using this table
3. Create Intune Configuration Profile (Custom OMA-URI)
4. Deploy to pilot group (10% of devices)
5. Verify via Intune compliance reports
6. Expand to full fleet
7. Remove legacy GPO after 30-day validation
```
