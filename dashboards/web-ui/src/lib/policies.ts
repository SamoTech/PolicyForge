export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Policy {
  id: string;
  name: string;
  category: string;
  risk: RiskLevel;
  mitre: string[];
  registry: string;
  oma: string;
  powershell: string;
  description: string;
  compliance: string[];
  appliesTo: string;
}

export const POLICIES: Policy[] = [
  /* ── Windows Security ─────────────────────────────────────────── */
  {
    id: 'WIN-SECURITY-001',
    name: 'Disable AutoRun / AutoPlay',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1091', 'T1204.002'],
    registry: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer\nNoDriveTypeAutoRun = 255\nNoAutorun = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/Autoplay/TurnOffAutoPlay\nData Type: Integer — Value: 255',
    powershell: `$p="HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name NoDriveTypeAutoRun -Value 255 -Type DWord -Force
Set-ItemProperty -Path $p -Name NoAutorun -Value 1 -Type DWord -Force`,
    description: 'Prevents AutoRun/AutoPlay from executing programs when removable media is inserted. Mitigates Conficker-style USB worm propagation.',
    compliance: ['CIS L1 18.9.8.1', 'DISA STIG WN10-CC-000052', 'NIST SI-3 MP-7'],
    appliesTo: 'Windows 7+ / Server 2008+',
  },
  {
    id: 'WIN-SECURITY-002',
    name: 'Disable SMBv1',
    category: 'Windows Security',
    risk: 'Critical',
    mitre: ['T1210', 'T1486'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters\nSMB1 = 0 (REG_DWORD)',
    oma: './Device/Vendor/MSFT/Policy/Config/Connectivity/ProhibitInstallationAndConfigurationOfNetworkBridge',
    powershell: `Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart`,
    description: 'Disables the legacy SMBv1 protocol exploited by EternalBlue (WannaCry, NotPetya). Mandatory on all modern Windows deployments.',
    compliance: ['CIS L1 18.3.1', 'MS Security Baseline', 'NIST SC-8'],
    appliesTo: 'Windows 8.1+ / Server 2012+',
  },
  {
    id: 'WIN-SECURITY-003',
    name: 'Disable LLMNR',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1557.001'],
    registry: 'HKLM\\Software\\Policies\\Microsoft\\Windows NT\\DNSClient\nEnableMulticast = 0 (REG_DWORD)',
    oma: './Device/Vendor/MSFT/Policy/Config/ADMX_DnsClient/DNS_AllowFQDNNetBiosQueries',
    powershell: `$p="HKLM:\\Software\\Policies\\Microsoft\\Windows NT\\DNSClient"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name EnableMulticast -Value 0 -Type DWord -Force`,
    description: 'Disables Link-Local Multicast Name Resolution, preventing LLMNR poisoning attacks used by Responder to steal NTLM credentials.',
    compliance: ['CIS L1 18.5.4.2', 'NIST IA-5'],
    appliesTo: 'Windows Vista+ / Server 2008+',
  },
  {
    id: 'WIN-SECURITY-004',
    name: 'Disable NBT-NS',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1557.001'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\NetBT\\Parameters\\Interfaces\\*\nNetbiosOptions = 2 (REG_DWORD)',
    oma: 'No direct OMA-URI — configure via custom PowerShell script in Intune',
    powershell: `$nics = Get-ChildItem "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\NetBT\\Parameters\\Interfaces"
foreach($nic in $nics){
  Set-ItemProperty -Path $nic.PSPath -Name NetbiosOptions -Value 2 -Type DWord -Force
}`,
    description: 'Disables NetBIOS Name Service on all network adapters to prevent NBT-NS poisoning (Responder attacks). Companion control to LLMNR disable.',
    compliance: ['CIS L1', 'NIST IA-5'],
    appliesTo: 'Windows XP+ / Server 2003+',
  },
  {
    id: 'WIN-SECURITY-005',
    name: 'Enable Windows Firewall (All Profiles)',
    category: 'Windows Security',
    risk: 'Critical',
    mitre: ['T1562.004'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\SharedAccess\\Parameters\\FirewallPolicy\\*\nEnableFirewall = 1',
    oma: './Device/Vendor/MSFT/Firewall/MdmStore/DomainProfile/EnableFirewall\nData Type: Boolean — Value: true',
    powershell: `Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultInboundAction Block`,
    description: 'Ensures Windows Firewall is enabled across all profiles (Domain, Private, Public) with default-deny inbound. Prevents lateral movement and external reach-in.',
    compliance: ['CIS L1 9.1.1–9.3.1', 'DISA STIG WN10-NE-000024', 'NIST SC-7'],
    appliesTo: 'Windows 7+ / Server 2008+',
  },
  {
    id: 'WIN-SECURITY-006',
    name: 'Enable Credential Guard',
    category: 'Windows Security',
    risk: 'Critical',
    mitre: ['T1003.001'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard\nEnableVirtualizationBasedSecurity = 1\nRequirePlatformSecurityFeatures = 1\nHypervisorEnforcedCodeIntegrity = 2',
    oma: './Device/Vendor/MSFT/Policy/Config/DeviceGuard/EnableVirtualizationBasedSecurity\nValue: 1',
    powershell: `$p="HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard"
Set-ItemProperty -Path $p -Name EnableVirtualizationBasedSecurity -Value 1 -Type DWord
Set-ItemProperty -Path $p -Name RequirePlatformSecurityFeatures -Value 1 -Type DWord
Set-ItemProperty -Path $p -Name "LsaCfgFlags" -Value 1 -Type DWord`,
    description: 'Isolates LSASS in a Hyper-V protected container, making credential theft via Mimikatz impossible without breaking VBS. Critical for privileged endpoints.',
    compliance: ['CIS L2', 'MS Security Baseline', 'NIST SI-7'],
    appliesTo: 'Windows 10 1607+ (Enterprise) / Server 2016+',
  },
  {
    id: 'WIN-SECURITY-007',
    name: 'Disable WDigest Authentication',
    category: 'Windows Security',
    risk: 'Critical',
    mitre: ['T1003.001'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\WDigest\nUseLogonCredential = 0 (REG_DWORD)',
    oma: './Device/Vendor/MSFT/Policy/Config/ADMX_Kerberos/WDigestAuthentication\nValue: Disabled',
    powershell: `$p="HKLM:\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\WDigest"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name UseLogonCredential -Value 0 -Type DWord -Force`,
    description: 'Prevents WDigest from caching plaintext passwords in LSASS memory. A top Mimikatz target — disabling this removes cleartext passwords from memory.',
    compliance: ['CIS L1 18.3.7', 'MS Security Baseline'],
    appliesTo: 'Windows 7+ (KB2871997) / Server 2008 R2+',
  },
  {
    id: 'WIN-SECURITY-008',
    name: 'Enable PowerShell Script Block Logging',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1059.001'],
    registry: 'HKLM\\Software\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging\nEnableScriptBlockLogging = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/EnableScriptBlockLogging\nValue: Enabled',
    powershell: `$p="HKLM:\\Software\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name EnableScriptBlockLogging -Value 1 -Type DWord -Force`,
    description: 'Logs all PowerShell script block executions to Event Log (Event ID 4104), including obfuscated and decoded payloads. Critical for detecting PowerShell-based attacks.',
    compliance: ['CIS L1 18.9.95.1', 'NIST AU-2 AU-12'],
    appliesTo: 'Windows 10+ / Server 2016+ / PowerShell 5+',
  },
  {
    id: 'WIN-SECURITY-009',
    name: 'Audit Process Creation (Event 4688)',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1059', 'T1106'],
    registry: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\Audit\nProcessCreationIncludeCmdLine_Enabled = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation',
    powershell: `AuditPol /set /subcategory:"Process Creation" /success:enable /failure:enable
$p="HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\Audit"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name ProcessCreationIncludeCmdLine_Enabled -Value 1 -Type DWord`,
    description: 'Enables process creation auditing with full command line logging. Provides visibility into every process spawned — essential for threat hunting and SIEM detections.',
    compliance: ['CIS L1 17.3.2', 'NIST AU-12'],
    appliesTo: 'Windows 7+ / Server 2008+',
  },
  {
    id: 'WIN-SECURITY-010',
    name: 'Disable Guest Account',
    category: 'Windows Security',
    risk: 'Medium',
    mitre: ['T1078.003'],
    registry: 'Managed via Security Policy, not registry directly.\nNet user Guest /active:no',
    oma: './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/Accounts_LimitLocalAccountUseOfBlankPasswordsToConsoleLogonOnly',
    powershell: `Net user Guest /active:no
# Or via PowerShell:
Disable-LocalUser -Name "Guest"`,
    description: 'Disables the built-in Guest account to prevent unauthenticated local access. Guest accounts are a trivial entry point for attackers on mis-configured systems.',
    compliance: ['CIS L1 2.3.1.2', 'DISA STIG WN10-SO-000020'],
    appliesTo: 'All Windows versions',
  },
  {
    id: 'WIN-SECURITY-011',
    name: 'Account Lockout Policy',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1110.001'],
    registry: 'Managed via Security Policy (secpol.msc)\nLockout Threshold: 5 attempts\nLockout Duration: 15 min\nReset Counter: 15 min',
    oma: './Device/Vendor/MSFT/Policy/Config/DeviceLock/MaxDevicePasswordFailedAttempts\nValue: 5',
    powershell: `net accounts /lockoutthreshold:5 /lockoutduration:15 /lockoutwindow:15`,
    description: 'Configures account lockout after 5 failed login attempts, protecting against brute-force password attacks on local and domain accounts.',
    compliance: ['CIS L1 1.2.1–1.2.3', 'NIST AC-7'],
    appliesTo: 'All Windows versions',
  },
  {
    id: 'WIN-SECURITY-012',
    name: 'Enable LSA Protection (RunAsPPL)',
    category: 'Windows Security',
    risk: 'Critical',
    mitre: ['T1003.001'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\nRunAsPPL = 1 (REG_DWORD)',
    oma: './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/Lsa_RestrictRemoteSAMClientCommunication',
    powershell: `$p="HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa"
Set-ItemProperty -Path $p -Name RunAsPPL -Value 1 -Type DWord -Force`,
    description: 'Enables LSA Protected Process Light, preventing untrusted processes from reading LSASS memory. Directly blocks Mimikatz sekurlsa module from dumping credentials.',
    compliance: ['CIS L2', 'MS Security Baseline', 'NIST IA-5'],
    appliesTo: 'Windows 8.1+ / Server 2012 R2+',
  },
  {
    id: 'WIN-SECURITY-013',
    name: 'RDP — Enforce Network Level Authentication',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1021.001'],
    registry: 'HKLM\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp\nUserAuthentication = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/ClientConnectionEncryptionLevel\nValue: 3',
    powershell: `$p="HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp"
Set-ItemProperty -Path $p -Name UserAuthentication -Value 1 -Type DWord -Force`,
    description: 'Requires NLA before the RDP session is established, preventing unauthenticated access to the login screen. Mitigates BlueKeep-style pre-auth RDP exploitation.',
    compliance: ['CIS L1 18.9.59.2.2', 'DISA STIG WN10-CC-000068'],
    appliesTo: 'Windows Vista+ / Server 2008+',
  },
  {
    id: 'WIN-SECURITY-016',
    name: 'UAC — Admin Approval Mode',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1548.002'],
    registry: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\nEnableLUA = 1\nConsentPromptBehaviorAdmin = 2',
    oma: './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_BehaviorOfTheElevationPromptForAdministrators\nValue: 2',
    powershell: `$p="HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System"
Set-ItemProperty -Path $p -Name EnableLUA -Value 1 -Type DWord
Set-ItemProperty -Path $p -Name ConsentPromptBehaviorAdmin -Value 2 -Type DWord`,
    description: 'Enables UAC Admin Approval Mode, requiring explicit consent for privileged operations. Prevents silent privilege escalation by malware running as standard users.',
    compliance: ['CIS L1 2.3.17.1', 'NIST AC-6'],
    appliesTo: 'Windows Vista+ / Server 2008+',
  },
  {
    id: 'WIN-SECURITY-017',
    name: 'Disable Print Spooler (Non-Print Servers)',
    category: 'Windows Security',
    risk: 'Critical',
    mitre: ['T1547.012', 'T1068'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Spooler\nStart = 4 (Disabled)',
    oma: 'No direct OMA-URI — deploy via PowerShell Intune script',
    powershell: `Stop-Service -Name Spooler -Force
Set-Service -Name Spooler -StartupType Disabled`,
    description: 'Disables the Print Spooler service on non-print servers to patch PrintNightmare (CVE-2021-1675 / CVE-2021-34527). Critical for DCs and servers that do not need printing.',
    compliance: ['MS Security Baseline', 'CISA Alert AA21-200A'],
    appliesTo: 'Windows XP+ / Server 2003+',
  },
  {
    id: 'WIN-SECURITY-019',
    name: 'Protect Event Log (Restrict Access)',
    category: 'Windows Security',
    risk: 'High',
    mitre: ['T1070.001'],
    registry: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\EventLog\\Security\nRestrictGuestAccess = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/EventLogService/SpecifyMaximumFileSizeSecurityLog\nValue: 196608',
    powershell: `# Set Security log max size to 196 MB and restrict guest access
Limit-EventLog -LogName Security -MaximumSize 200MB
wevtutil sl Security /ca:"O:BAG:SYD:(A;;0xf0007;;;SY)(A;;0x7;;;BA)(A;;0x3;;;BO)(A;;0x5;;;SO)(A;;0x1;;;IU)(A;;0x3;;;SU)"`,
    description: 'Restricts event log access to Administrators and SYSTEM only, and enforces minimum log size. Prevents attackers from clearing logs to cover their tracks.',
    compliance: ['CIS L1 18.9.26.1', 'NIST AU-9'],
    appliesTo: 'All Windows versions',
  },

  /* ── Microsoft Defender ───────────────────────────────────────── */
  {
    id: 'DEF-001',
    name: 'Enable Real-Time Protection',
    category: 'Microsoft Defender',
    risk: 'Critical',
    mitre: ['T1562.001'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection\nDisableRealtimeMonitoring = 0',
    oma: './Device/Vendor/MSFT/Policy/Config/Defender/AllowRealtimeMonitoring\nValue: 1',
    powershell: `Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -DisableBehaviorMonitoring $false`,
    description: 'Enforces Defender real-time protection via policy, preventing local admins from disabling it. Attackers routinely disable AV as their first action post-compromise.',
    compliance: ['CIS L1 18.9.45.3.1', 'MS Security Baseline'],
    appliesTo: 'Windows 10+ / Server 2016+',
  },
  {
    id: 'DEF-002',
    name: 'Enable Cloud-Delivered Protection',
    category: 'Microsoft Defender',
    risk: 'High',
    mitre: ['T1562.001'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet\nSpynetReporting = 2\nSubmitSamplesConsent = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/Defender/AllowCloudProtection\nValue: 1',
    powershell: `Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples`,
    description: 'Enables cloud-delivered protection (MAPS) for near-zero-second response to new malware. Cloud lookups identify unknown files in milliseconds versus waiting for signature updates.',
    compliance: ['CIS L2', 'MS Security Baseline'],
    appliesTo: 'Windows 10+ / Server 2016+',
  },
  {
    id: 'DEF-003',
    name: 'Enable Behavior Monitoring',
    category: 'Microsoft Defender',
    risk: 'High',
    mitre: ['T1059', 'T1055'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection\nDisableBehaviorMonitoring = 0',
    oma: './Device/Vendor/MSFT/Policy/Config/Defender/AllowBehaviorMonitoring\nValue: 1',
    powershell: `Set-MpPreference -DisableBehaviorMonitoring $false`,
    description: 'Enables heuristic behavioral monitoring to detect fileless malware, process injection, and living-off-the-land techniques that signature scanning alone misses.',
    compliance: ['CIS L1', 'MS Security Baseline'],
    appliesTo: 'Windows 10+ / Server 2016+',
  },
  {
    id: 'DEF-005',
    name: 'Configure Attack Surface Reduction (ASR) Rules',
    category: 'Microsoft Defender',
    risk: 'Critical',
    mitre: ['T1059.001', 'T1566.001', 'T1204.002'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Windows Defender Exploit Guard\\ASR\\Rules\n[GUID] = 1 (Block mode)',
    oma: './Device/Vendor/MSFT/Policy/Config/Defender/AttackSurfaceReductionRules',
    powershell: `# Block Office macros, child processes, credential stealing, PS obfuscation
$rules = @(
  "d4f940ab-401b-4efc-aadc-ad5f3c50688a", # Block all Office apps from creating child processes
  "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b3", # Block credential stealing from LSASS
  "be9ba2d9-53ea-4cdc-84e5-9b1eeee46550", # Block executable content from email/webmail
  "5beb7efe-fd9a-4556-801d-275e5ffc04cc"  # Block execution of potentially obfuscated scripts
)
foreach($r in $rules){
  Add-MpPreference -AttackSurfaceReductionRules_Ids $r -AttackSurfaceReductionRules_Actions Enabled
}`,
    description: 'Enables key ASR rules to block Office macro child processes, LSASS credential dumping, obfuscated script execution, and malicious email attachments. Block mode for production.',
    compliance: ['MS Security Baseline', 'CISA', 'NIST SI-3'],
    appliesTo: 'Windows 10 1703+ / Server 2019+',
  },
  {
    id: 'DEF-006',
    name: 'Enable Controlled Folder Access',
    category: 'Microsoft Defender',
    risk: 'High',
    mitre: ['T1486'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Windows Defender Exploit Guard\\Controlled Folder Access\nEnableControlledFolderAccess = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/Defender/EnableControlledFolderAccess\nValue: 1',
    powershell: `Set-MpPreference -EnableControlledFolderAccess Enabled`,
    description: 'Enables Controlled Folder Access to prevent ransomware from encrypting files in protected folders (Documents, Desktop, Pictures). Primary defence against crypto-ransomware.',
    compliance: ['MS Security Baseline', 'NIST SI-3'],
    appliesTo: 'Windows 10 1709+ / Server 2019+',
  },
  {
    id: 'DEF-008',
    name: 'Enable Tamper Protection',
    category: 'Microsoft Defender',
    risk: 'Critical',
    mitre: ['T1562.001'],
    registry: 'HKLM\\SOFTWARE\\Microsoft\\Windows Defender\nTamperProtection = 5 (REG_DWORD)',
    oma: './Device/Vendor/MSFT/Policy/Config/Defender/TamperProtection\nValue: 1',
    powershell: `# Tamper Protection must be managed via Intune or Security Center
# Cannot be disabled via PowerShell when Tamper Protection is active
Set-MpPreference -TamperProtection Enabled`,
    description: 'Prevents local changes to Defender settings including disabling real-time protection, cloud protection, and ASR rules. Blocks a common attacker technique: disabling AV before deploying payload.',
    compliance: ['MS Security Baseline', 'CIS L2'],
    appliesTo: 'Windows 10 1903+ / Server 2019+',
  },

  /* ── Microsoft Edge ───────────────────────────────────────────── */
  {
    id: 'EDGE-001',
    name: 'Block Potentially Unwanted Apps (PUA)',
    category: 'Microsoft Edge',
    risk: 'Medium',
    mitre: ['T1204.002'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge\nPreventSmartScreenPromptOverride = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/Browser/PreventSmartScreenPromptOverride\nValue: 1',
    powershell: `$p="HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name PreventSmartScreenPromptOverride -Value 1 -Type DWord`,
    description: 'Prevents users from bypassing SmartScreen warnings for PUA downloads. Enforces the SmartScreen block so users cannot click through with "Run Anyway".',
    compliance: ['CIS Edge L1', 'NIST SI-3'],
    appliesTo: 'Microsoft Edge (Chromium) 80+',
  },
  {
    id: 'EDGE-003',
    name: 'Enable SmartScreen Filter',
    category: 'Microsoft Edge',
    risk: 'High',
    mitre: ['T1566.002', 'T1204.001'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge\nSmartScreenEnabled = 1',
    oma: './Device/Vendor/MSFT/Policy/Config/Browser/AllowSmartScreen\nValue: 1',
    powershell: `$p="HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name SmartScreenEnabled -Value 1 -Type DWord`,
    description: 'Enforces Microsoft Defender SmartScreen in Edge to block known phishing URLs, malware sites, and malicious downloads using Microsoft\'s threat intelligence.',
    compliance: ['CIS Edge L1', 'NIST SI-3'],
    appliesTo: 'Microsoft Edge (Chromium) 77+',
  },

  /* ── Microsoft Office ─────────────────────────────────────────── */
  {
    id: 'OFFICE-001',
    name: 'Block Macros from Internet-Originated Files',
    category: 'Microsoft Office',
    risk: 'Critical',
    mitre: ['T1566.001', 'T1204.002'],
    registry: 'HKCU\\Software\\Policies\\Microsoft\\Office\\16.0\\Excel\\Security\nBlockContentExecutionFromInternet = 1\n(Same path for Word, PowerPoint, Outlook)',
    oma: './User/Vendor/MSFT/Policy/Config/ADMX_UserExperienceVirtualization/MicrosoftOffice2016Word',
    powershell: `$apps = @("Excel","Word","PowerPoint","Access")
foreach($app in $apps){
  $p="HKCU:\\Software\\Policies\\Microsoft\\Office\\16.0\\$app\\Security"
  if(!(Test-Path $p)){New-Item -Path $p -Force}
  Set-ItemProperty -Path $p -Name BlockContentExecutionFromInternet -Value 1 -Type DWord
}`,
    description: 'Blocks macro execution in Office documents received from the internet (Mark-of-the-Web). This single policy alone blocks Emotet, QakBot, and most phishing malware delivery chains.',
    compliance: ['CIS Office L1', 'MS Security Baseline', 'CISA'],
    appliesTo: 'Microsoft Office 2016+ / Microsoft 365',
  },
  {
    id: 'OFFICE-002',
    name: 'Disable VBA Macro Execution Entirely',
    category: 'Microsoft Office',
    risk: 'Critical',
    mitre: ['T1566.001', 'T1059.005'],
    registry: 'HKCU\\Software\\Policies\\Microsoft\\Office\\16.0\\Excel\\Security\nVBAWarnings = 4\n(4 = Disable all macros without notification)',
    oma: 'Deploy via Office ADMX policy or Intune Office CSP',
    powershell: `$apps = @("Excel","Word","PowerPoint","Access","Outlook")
foreach($app in $apps){
  $p="HKCU:\\Software\\Policies\\Microsoft\\Office\\16.0\\$app\\Security"
  if(!(Test-Path $p)){New-Item -Path $p -Force}
  Set-ItemProperty -Path $p -Name VBAWarnings -Value 4 -Type DWord
}`,
    description: 'Sets VBAWarnings = 4 across all Office apps, silently disabling all macros without user prompt. Appropriate for environments where macros are not operationally required.',
    compliance: ['CIS Office L2', 'DISA STIG', 'NIST SI-3'],
    appliesTo: 'Microsoft Office 2013+ / Microsoft 365',
  },

  /* ── Windows Privacy ──────────────────────────────────────────── */
  {
    id: 'WIN-PRIVACY-001',
    name: 'Disable Telemetry (Set to Security Level)',
    category: 'Windows Privacy',
    risk: 'Medium',
    mitre: ['T1119'],
    registry: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection\nAllowTelemetry = 0 (Security / Enterprise only)',
    oma: './Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry\nValue: 0',
    powershell: `$p="HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name AllowTelemetry -Value 0 -Type DWord`,
    description: 'Restricts Windows telemetry to Security level (0), minimising data sent to Microsoft. Reduces the attack surface of outbound data collection and satisfies GDPR data minimisation requirements.',
    compliance: ['CIS L2 18.9.16.1', 'GDPR Article 5'],
    appliesTo: 'Windows 10+ Enterprise / Server 2016+',
  },

  /* ── Windows Network ──────────────────────────────────────────── */
  {
    id: 'WIN-NETWORK-001',
    name: 'Disable WPAD (Web Proxy Auto-Discovery)',
    category: 'Windows Network',
    risk: 'High',
    mitre: ['T1557'],
    registry: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\nAutoDetect = 0',
    oma: './Device/Vendor/MSFT/Policy/Config/Browser/PreventAccessToAboutFlagsInMicrosoftEdge',
    powershell: `$p="HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"
Set-ItemProperty -Path $p -Name AutoDetect -Value 0 -Type DWord
# Disable WinHTTP WPAD
netsh winhttp set proxy proxy-server="direct://" bypass-list="<local>"`,
    description: 'Disables automatic proxy discovery to prevent WPAD hijacking, a technique where an attacker responds to WPAD NBNS/DNS queries to intercept all browser traffic on the local network.',
    compliance: ['CIS L1', 'NIST SC-8'],
    appliesTo: 'Windows 7+ / Server 2008+',
  },
];

export const CATEGORIES = [...new Set(POLICIES.map(p => p.category))];
export const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];