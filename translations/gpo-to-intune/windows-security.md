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
| 25 | Disable WDigest Auth | `Windows Components > Credential Delegation` | `UseLogonCredential=0` | `./Device/Vendor/MSFT/Policy/Config/MSSLegacy/WDigestAuthentication` | `0` | Integer |

---

## 🌐 Network Security

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 26 | Windows Firewall — Domain ON | `Windows Settings > Security Settings > Windows Firewall` | `EnableFirewall=1` | `./Device/Vendor/MSFT/Policy/Config/Firewall/EnableFirewall` | `true` | Boolean |
| 27 | Windows Firewall — Private ON | `Windows Settings > Security Settings > Windows Firewall` | `EnableFirewall=1` | `./Device/Vendor/MSFT/Firewall/MdmStore/PrivateProfile/EnableFirewall` | `true` | Boolean |
| 28 | Windows Firewall — Public ON | `Windows Settings > Security Settings > Windows Firewall` | `EnableFirewall=1` | `./Device/Vendor/MSFT/Firewall/MdmStore/PublicProfile/EnableFirewall` | `true` | Boolean |
| 29 | Block Inbound by Default (Public) | `Windows Firewall > Public Profile` | `DefaultInboundAction=1` | `./Device/Vendor/MSFT/Firewall/MdmStore/PublicProfile/DefaultInboundAction` | `1` | Integer |
| 30 | Disable LLMNR | `Windows Components > DNS Client` | `EnableMulticast=0` | Not directly available via CSP — use PowerShell Remediation script or Intune Settings Catalog > DNS Client > Turn off Multicast Name Resolution | — | — |
| 31 | Disable NetBIOS over TCP/IP | `Network > TCP/IP Settings` | `NetbiosOptions=2` | Not directly available — use PowerShell via Remediation script | — | — |
| 32 | Require NLA for RDP | `Windows Components > Remote Desktop Services > RDS Session Host > Security` | `UserAuthentication=1` | `./Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/RequireSecureRPCCommunication` | `1` | Integer |
| 33 | Disable RDP (if not needed) | `Windows Components > Remote Desktop Services` | `fDenyTSConnections=1` | `./Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/AllowRemoteDesktopService` | `0` | Integer |
| 34 | Disable SMBv1 | `Windows Components > LanmanServer` | `SMB1=0` (Features) | Not via CSP — use PowerShell Remediation: `Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol` | — | — |

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
| 41 | PowerShell Execution Policy | `Windows Components > Windows PowerShell` | `ExecutionPolicy=RemoteSigned` | Not available via CSP — use Intune PowerShell Remediation script or Settings Catalog > Windows PowerShell > Turn on Script Execution | — | — |
| 42 | Enable Script Block Logging | `Windows Components > Windows PowerShell` | `EnableScriptBlockLogging=1` | `./Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/EnableScriptBlockLogging` | `<enabled/>` | String |
| 43 | Enable Module Logging | `Windows Components > Windows PowerShell` | `EnableModuleLogging=1` | `./Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/TurnOnModuleLogging` | `<enabled/>` | String |
| 44 | Enable Transcription | `Windows Components > Windows PowerShell` | `EnableTranscripting=1` | `./Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/EnableTranscripting` | `<enabled/>` | String |

---

## 📊 Audit & Logging

| # | Policy Name | GPO Path | Registry Key | OMA-URI | Value | Type |
|---|---|---|---|---|---|---|
| 45 | Audit Process Creation | `Computer Configuration > Windows Settings > Security Settings > Advanced Audit` | `ProcessCreationIncludeCmdLine_Enabled=1` | `./Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation` | `3` | Integer |
| 46 | Audit Logon Events | `Computer Configuration > Windows Settings > Security Settings > Advanced Audit` | N/A (auditpol) | `./Device/Vendor/MSFT/Policy/Config/Audit/AccountLogon_AuditCredentialValidation` | `3` | Integer |
| 47 | Audit Object Access | `Computer Configuration > Windows Settings > Security Settings > Advanced Audit` | N/A (auditpol) | `./Device/Vendor/MSFT/Policy/Config/Audit/ObjectAccess_AuditFileSystem` | `3` | Integer |
| 48 | Audit Policy Changes | `Computer Configuration > Windows Settings > Security Settings > Advanced Audit` | N/A (auditpol) | `./Device/Vendor/MSFT/Policy/Config/Audit/PolicyChange_AuditAuditPolicyChange` | `3` | Integer |
| 49 | Event Log — Security Max Size | `Computer Configuration > Windows Settings > Security Settings > Event Log` | `MaxSize=196608` | `./Device/Vendor/MSFT/Policy/Config/EventLogService/SpecifyMaximumFileSizeSecurityLog` | `196608` | Integer |
| 50 | Event Log — Application Max Size | `Computer Configuration > Windows Settings > Security Settings > Event Log` | `MaxSize=32768` | `./Device/Vendor/MSFT/Policy/Config/EventLogService/SpecifyMaximumFileSizeApplicationLog` | `32768` | Integer |
