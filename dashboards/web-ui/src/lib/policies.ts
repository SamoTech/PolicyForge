export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Policy {
  id:             string;
  name:           string;
  category:       string | string[];
  risk_level:     RiskLevel;
  mitre:          string[];
  registry_path:  string;
  registry_value: string;
  oma_uri:        string;
  powershell:     string;
  raw:            string;          // full searchable blob
  description:    string;
  compliance:     string[];
  applies_to:     string;
}

export const POLICIES: Policy[] = [
  {
    id: 'WIN-SECURITY-001',
    name: 'Disable AutoRun / AutoPlay',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1091', 'T1204.002'],
    registry_path: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer',
    registry_value: 'NoDriveTypeAutoRun = 255 (REG_DWORD)\nNoAutorun = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Autoplay/TurnOffAutoPlay\nData Type: Integer — Value: 255',
    powershell: `$p="HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name NoDriveTypeAutoRun -Value 255 -Type DWord -Force
Set-ItemProperty -Path $p -Name NoAutorun -Value 1 -Type DWord -Force`,
    description: 'Prevents AutoRun/AutoPlay from executing programs when removable media is inserted. Mitigates Conficker-style USB worm propagation.',
    compliance: ['CIS L1 18.9.8.1', 'DISA STIG WN10-CC-000052', 'NIST SI-3 MP-7'],
    applies_to: 'Windows 7+ / Server 2008+',
    raw: 'autorun autoplay usb removable media conficker worm NoDriveTypeAutoRun',
  },
  {
    id: 'WIN-SECURITY-002',
    name: 'Disable SMBv1',
    category: 'Windows Security',
    risk_level: 'Critical',
    mitre: ['T1210', 'T1486'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanServer\\Parameters',
    registry_value: 'SMB1 = 0 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Connectivity/ProhibitInstallationAndConfigurationOfNetworkBridge',
    powershell: `Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart`,
    description: 'Disables the legacy SMBv1 protocol exploited by EternalBlue (WannaCry, NotPetya). Mandatory on all modern Windows deployments.',
    compliance: ['CIS L1 18.3.1', 'MS Security Baseline', 'NIST SC-8'],
    applies_to: 'Windows 8.1+ / Server 2012+',
    raw: 'SMB SMBv1 EternalBlue WannaCry NotPetya LanmanServer ransomware',
  },
  {
    id: 'WIN-SECURITY-003',
    name: 'Disable LLMNR',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1557.001'],
    registry_path: 'HKLM\\Software\\Policies\\Microsoft\\Windows NT\\DNSClient',
    registry_value: 'EnableMulticast = 0 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/ADMX_DnsClient/DNS_AllowFQDNNetBiosQueries',
    powershell: `$p="HKLM:\\Software\\Policies\\Microsoft\\Windows NT\\DNSClient"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name EnableMulticast -Value 0 -Type DWord -Force`,
    description: 'Disables Link-Local Multicast Name Resolution, preventing LLMNR poisoning attacks used by Responder to steal NTLM credentials.',
    compliance: ['CIS L1 18.5.4.2', 'NIST IA-5'],
    applies_to: 'Windows Vista+ / Server 2008+',
    raw: 'LLMNR multicast DNS poisoning Responder NTLM credential relay',
  },
  {
    id: 'WIN-SECURITY-004',
    name: 'Disable NBT-NS',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1557.001'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\NetBT\\Parameters\\Interfaces\\*',
    registry_value: 'NetbiosOptions = 2 (REG_DWORD)',
    oma_uri: 'No direct OMA-URI — configure via PowerShell Intune script',
    powershell: `$nics = Get-ChildItem "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\NetBT\\Parameters\\Interfaces"
foreach($nic in $nics){
  Set-ItemProperty -Path $nic.PSPath -Name NetbiosOptions -Value 2 -Type DWord -Force
}`,
    description: 'Disables NetBIOS Name Service on all network adapters to prevent NBT-NS poisoning. Companion control to LLMNR disable.',
    compliance: ['CIS L1', 'NIST IA-5'],
    applies_to: 'Windows XP+ / Server 2003+',
    raw: 'NetBIOS NBT-NS poisoning Responder NTLM relay NetbiosOptions',
  },
  {
    id: 'WIN-SECURITY-005',
    name: 'Enable Windows Firewall (All Profiles)',
    category: 'Windows Security',
    risk_level: 'Critical',
    mitre: ['T1562.004'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\SharedAccess\\Parameters\\FirewallPolicy\\*',
    registry_value: 'EnableFirewall = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Firewall/MdmStore/DomainProfile/EnableFirewall\nValue: true',
    powershell: `Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultInboundAction Block`,
    description: 'Ensures Windows Firewall is enabled across Domain, Private, and Public profiles with default-deny inbound. Prevents lateral movement and external reach-in.',
    compliance: ['CIS L1 9.1.1–9.3.1', 'DISA STIG WN10-NE-000024', 'NIST SC-7'],
    applies_to: 'Windows 7+ / Server 2008+',
    raw: 'firewall inbound block domain private public profile lateral movement',
  },
  {
    id: 'WIN-SECURITY-006',
    name: 'Enable Credential Guard',
    category: 'Windows Security',
    risk_level: 'Critical',
    mitre: ['T1003.001'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard',
    registry_value: 'EnableVirtualizationBasedSecurity = 1\nRequirePlatformSecurityFeatures = 1\nLsaCfgFlags = 1',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/DeviceGuard/EnableVirtualizationBasedSecurity\nValue: 1',
    powershell: `$p="HKLM:\\SYSTEM\\CurrentControlSet\\Control\\DeviceGuard"
Set-ItemProperty -Path $p -Name EnableVirtualizationBasedSecurity -Value 1 -Type DWord
Set-ItemProperty -Path $p -Name RequirePlatformSecurityFeatures -Value 1 -Type DWord
Set-ItemProperty -Path $p -Name "LsaCfgFlags" -Value 1 -Type DWord`,
    description: 'Isolates LSASS in a Hyper-V protected container, making credential theft via Mimikatz impossible without breaking VBS. Critical for privileged endpoints.',
    compliance: ['CIS L2', 'MS Security Baseline', 'NIST SI-7'],
    applies_to: 'Windows 10 1607+ Enterprise / Server 2016+',
    raw: 'Credential Guard VBS LSASS Mimikatz Hyper-V virtualization DeviceGuard',
  },
  {
    id: 'WIN-SECURITY-007',
    name: 'Disable WDigest Authentication',
    category: 'Windows Security',
    risk_level: 'Critical',
    mitre: ['T1003.001'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\WDigest',
    registry_value: 'UseLogonCredential = 0 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/ADMX_Kerberos/WDigestAuthentication\nValue: Disabled',
    powershell: `$p="HKLM:\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\WDigest"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name UseLogonCredential -Value 0 -Type DWord -Force`,
    description: 'Prevents WDigest from caching plaintext passwords in LSASS memory. A top Mimikatz target — disabling removes cleartext passwords from memory.',
    compliance: ['CIS L1 18.3.7', 'MS Security Baseline'],
    applies_to: 'Windows 7+ (KB2871997) / Server 2008 R2+',
    raw: 'WDigest plaintext password LSASS Mimikatz sekurlsa logonpasswords cleartext',
  },
  {
    id: 'WIN-SECURITY-008',
    name: 'Enable PowerShell Script Block Logging',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1059.001'],
    registry_path: 'HKLM\\Software\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging',
    registry_value: 'EnableScriptBlockLogging = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/ADMX_PowerShellExecutionPolicy/EnableScriptBlockLogging\nValue: Enabled',
    powershell: `$p="HKLM:\\Software\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name EnableScriptBlockLogging -Value 1 -Type DWord -Force`,
    description: 'Logs all PowerShell script block executions to Event Log (Event ID 4104), including obfuscated and decoded payloads. Critical for detecting PS-based attacks.',
    compliance: ['CIS L1 18.9.95.1', 'NIST AU-2 AU-12'],
    applies_to: 'Windows 10+ / Server 2016+ / PowerShell 5+',
    raw: 'PowerShell script block logging 4104 obfuscation encoded payload SIEM',
  },
  {
    id: 'WIN-SECURITY-009',
    name: 'Audit Process Creation (Event 4688)',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1059', 'T1106'],
    registry_path: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\Audit',
    registry_value: 'ProcessCreationIncludeCmdLine_Enabled = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Audit/DetailedTracking_AuditProcessCreation',
    powershell: `AuditPol /set /subcategory:"Process Creation" /success:enable /failure:enable
$p="HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System\\Audit"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name ProcessCreationIncludeCmdLine_Enabled -Value 1 -Type DWord`,
    description: 'Enables process creation auditing with full command line logging. Provides visibility into every process spawned — essential for threat hunting and SIEM detections.',
    compliance: ['CIS L1 17.3.2', 'NIST AU-12'],
    applies_to: 'Windows 7+ / Server 2008+',
    raw: 'process creation 4688 command line audit AuditPol SIEM threat hunting',
  },
  {
    id: 'WIN-SECURITY-010',
    name: 'Disable Guest Account',
    category: 'Windows Security',
    risk_level: 'Medium',
    mitre: ['T1078.003'],
    registry_path: 'Managed via Security Policy (secpol.msc)',
    registry_value: 'N/A — use Net user or PowerShell',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/Accounts_LimitLocalAccountUseOfBlankPasswordsToConsoleLogonOnly',
    powershell: `Disable-LocalUser -Name "Guest"`,
    description: 'Disables the built-in Guest account to prevent unauthenticated local access. Guest accounts are a trivial entry point for attackers on misconfigured systems.',
    compliance: ['CIS L1 2.3.1.2', 'DISA STIG WN10-SO-000020'],
    applies_to: 'All Windows versions',
    raw: 'guest account unauthenticated local access anonymous',
  },
  {
    id: 'WIN-SECURITY-011',
    name: 'Account Lockout Policy',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1110.001'],
    registry_path: 'Managed via Security Policy (secpol.msc)',
    registry_value: 'LockoutBadCount = 5\nLockoutDuration = 15 min\nResetLockoutCount = 15 min',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/DeviceLock/MaxDevicePasswordFailedAttempts\nValue: 5',
    powershell: `net accounts /lockoutthreshold:5 /lockoutduration:15 /lockoutwindow:15`,
    description: 'Configures account lockout after 5 failed login attempts, protecting against brute-force password attacks on local and domain accounts.',
    compliance: ['CIS L1 1.2.1–1.2.3', 'NIST AC-7'],
    applies_to: 'All Windows versions',
    raw: 'lockout brute force password spray threshold duration failed attempts',
  },
  {
    id: 'WIN-SECURITY-012',
    name: 'Enable LSA Protection (RunAsPPL)',
    category: 'Windows Security',
    risk_level: 'Critical',
    mitre: ['T1003.001'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa',
    registry_value: 'RunAsPPL = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/Lsa_RestrictRemoteSAMClientCommunication',
    powershell: `$p="HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa"
Set-ItemProperty -Path $p -Name RunAsPPL -Value 1 -Type DWord -Force`,
    description: 'Enables LSA Protected Process Light, preventing untrusted processes from reading LSASS memory. Directly blocks Mimikatz sekurlsa module.',
    compliance: ['CIS L2', 'MS Security Baseline', 'NIST IA-5'],
    applies_to: 'Windows 8.1+ / Server 2012 R2+',
    raw: 'LSA PPL Protected Process Light LSASS Mimikatz RunAsPPL credential dump',
  },
  {
    id: 'WIN-SECURITY-013',
    name: 'RDP — Enforce Network Level Authentication',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1021.001'],
    registry_path: 'HKLM\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp',
    registry_value: 'UserAuthentication = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/RemoteDesktopServices/ClientConnectionEncryptionLevel\nValue: 3',
    powershell: `$p="HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp"
Set-ItemProperty -Path $p -Name UserAuthentication -Value 1 -Type DWord -Force`,
    description: 'Requires NLA before the RDP session is established, preventing unauthenticated access to the login screen. Mitigates BlueKeep-style pre-auth RDP exploitation.',
    compliance: ['CIS L1 18.9.59.2.2', 'DISA STIG WN10-CC-000068'],
    applies_to: 'Windows Vista+ / Server 2008+',
    raw: 'RDP NLA Network Level Authentication BlueKeep remote desktop pre-auth',
  },
  {
    id: 'WIN-SECURITY-016',
    name: 'UAC — Admin Approval Mode',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1548.002'],
    registry_path: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    registry_value: 'EnableLUA = 1\nConsentPromptBehaviorAdmin = 2',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/LocalPoliciesSecurityOptions/UserAccountControl_BehaviorOfTheElevationPromptForAdministrators\nValue: 2',
    powershell: `$p="HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System"
Set-ItemProperty -Path $p -Name EnableLUA -Value 1 -Type DWord
Set-ItemProperty -Path $p -Name ConsentPromptBehaviorAdmin -Value 2 -Type DWord`,
    description: 'Enables UAC Admin Approval Mode requiring explicit consent for privileged operations. Prevents silent privilege escalation by malware running as standard users.',
    compliance: ['CIS L1 2.3.17.1', 'NIST AC-6'],
    applies_to: 'Windows Vista+ / Server 2008+',
    raw: 'UAC user account control privilege escalation elevation consent prompt LUA',
  },
  {
    id: 'WIN-SECURITY-017',
    name: 'Disable Print Spooler (Non-Print Servers)',
    category: 'Windows Security',
    risk_level: 'Critical',
    mitre: ['T1547.012', 'T1068'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Spooler',
    registry_value: 'Start = 4 (Disabled)',
    oma_uri: 'No direct OMA-URI — deploy via PowerShell Intune script',
    powershell: `Stop-Service -Name Spooler -Force
Set-Service -Name Spooler -StartupType Disabled`,
    description: 'Disables the Print Spooler service on non-print servers to patch PrintNightmare (CVE-2021-1675). Critical for Domain Controllers.',
    compliance: ['MS Security Baseline', 'CISA Alert AA21-200A'],
    applies_to: 'Windows XP+ / Server 2003+',
    raw: 'PrintNightmare CVE-2021-1675 Print Spooler spoolsv domain controller',
  },
  {
    id: 'WIN-SECURITY-019',
    name: 'Protect Event Log (Restrict Access)',
    category: 'Windows Security',
    risk_level: 'High',
    mitre: ['T1070.001'],
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\EventLog\\Security',
    registry_value: 'RestrictGuestAccess = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/EventLogService/SpecifyMaximumFileSizeSecurityLog\nValue: 196608',
    powershell: `Limit-EventLog -LogName Security -MaximumSize 200MB
wevtutil sl Security /ca:"O:BAG:SYD:(A;;0xf0007;;;SY)(A;;0x7;;;BA)"`,
    description: 'Restricts event log access to Administrators and SYSTEM only, and enforces minimum log size. Prevents attackers from clearing logs to cover tracks.',
    compliance: ['CIS L1 18.9.26.1', 'NIST AU-9'],
    applies_to: 'All Windows versions',
    raw: 'event log Security clear wevtutil restrict guest access audit log tampering',
  },
  {
    id: 'DEF-001',
    name: 'Enable Real-Time Protection',
    category: 'Microsoft Defender',
    risk_level: 'Critical',
    mitre: ['T1562.001'],
    registry_path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection',
    registry_value: 'DisableRealtimeMonitoring = 0 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Defender/AllowRealtimeMonitoring\nValue: 1',
    powershell: `Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -DisableBehaviorMonitoring $false`,
    description: 'Enforces Defender real-time protection via policy, preventing local admins from disabling it. Attackers routinely disable AV as their first action post-compromise.',
    compliance: ['CIS L1 18.9.45.3.1', 'MS Security Baseline'],
    applies_to: 'Windows 10+ / Server 2016+',
    raw: 'Defender real-time protection antivirus disable tamper AV',
  },
  {
    id: 'DEF-002',
    name: 'Enable Cloud-Delivered Protection',
    category: 'Microsoft Defender',
    risk_level: 'High',
    mitre: ['T1562.001'],
    registry_path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet',
    registry_value: 'SpynetReporting = 2\nSubmitSamplesConsent = 1',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Defender/AllowCloudProtection\nValue: 1',
    powershell: `Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples`,
    description: 'Enables cloud-delivered protection (MAPS) for near-zero-second response to new malware. Cloud lookups identify unknown files in milliseconds.',
    compliance: ['CIS L2', 'MS Security Baseline'],
    applies_to: 'Windows 10+ / Server 2016+',
    raw: 'Defender cloud MAPS protection signature update zero-day SpyNet',
  },
  {
    id: 'DEF-005',
    name: 'Configure Attack Surface Reduction Rules',
    category: 'Microsoft Defender',
    risk_level: 'Critical',
    mitre: ['T1059.001', 'T1566.001', 'T1204.002'],
    registry_path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Windows Defender Exploit Guard\\ASR\\Rules',
    registry_value: '[GUID] = 1 (Block mode)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Defender/AttackSurfaceReductionRules',
    powershell: `$rules = @(
  "d4f940ab-401b-4efc-aadc-ad5f3c50688a",
  "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b3",
  "be9ba2d9-53ea-4cdc-84e5-9b1eeee46550",
  "5beb7efe-fd9a-4556-801d-275e5ffc04cc"
)
foreach($r in $rules){
  Add-MpPreference -AttackSurfaceReductionRules_Ids $r -AttackSurfaceReductionRules_Actions Enabled
}`,
    description: 'Enables key ASR rules to block Office macro child processes, LSASS credential dumping, obfuscated script execution, and malicious email attachments.',
    compliance: ['MS Security Baseline', 'CISA', 'NIST SI-3'],
    applies_to: 'Windows 10 1703+ / Server 2019+',
    raw: 'ASR attack surface reduction Office macro LSASS obfuscation email attachment block',
  },
  {
    id: 'DEF-006',
    name: 'Enable Controlled Folder Access',
    category: 'Microsoft Defender',
    risk_level: 'High',
    mitre: ['T1486'],
    registry_path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Windows Defender Exploit Guard\\Controlled Folder Access',
    registry_value: 'EnableControlledFolderAccess = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Defender/EnableControlledFolderAccess\nValue: 1',
    powershell: `Set-MpPreference -EnableControlledFolderAccess Enabled`,
    description: 'Enables Controlled Folder Access to prevent ransomware from encrypting files in protected folders (Documents, Desktop, Pictures).',
    compliance: ['MS Security Baseline', 'NIST SI-3'],
    applies_to: 'Windows 10 1709+ / Server 2019+',
    raw: 'ransomware controlled folder access encrypt Documents Desktop Pictures CFA',
  },
  {
    id: 'DEF-008',
    name: 'Enable Tamper Protection',
    category: 'Microsoft Defender',
    risk_level: 'Critical',
    mitre: ['T1562.001'],
    registry_path: 'HKLM\\SOFTWARE\\Microsoft\\Windows Defender',
    registry_value: 'TamperProtection = 5 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Defender/TamperProtection\nValue: 1',
    powershell: `# Must be managed via Intune or Security Center
Set-MpPreference -TamperProtection Enabled`,
    description: 'Prevents local changes to Defender settings including disabling real-time protection and ASR rules. Blocks attacker technique of disabling AV before payload.',
    compliance: ['MS Security Baseline', 'CIS L2'],
    applies_to: 'Windows 10 1903+ / Server 2019+',
    raw: 'tamper protection Defender disable AV antivirus bypass payload',
  },
  {
    id: 'EDGE-001',
    name: 'Block Potentially Unwanted Apps (PUA)',
    category: 'Microsoft Edge',
    risk_level: 'Medium',
    mitre: ['T1204.002'],
    registry_path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge',
    registry_value: 'PreventSmartScreenPromptOverride = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Browser/PreventSmartScreenPromptOverride\nValue: 1',
    powershell: `$p="HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name PreventSmartScreenPromptOverride -Value 1 -Type DWord`,
    description: 'Prevents users from bypassing SmartScreen warnings for PUA downloads. Enforces the SmartScreen block so users cannot click through with "Run Anyway".',
    compliance: ['CIS Edge L1', 'NIST SI-3'],
    applies_to: 'Microsoft Edge (Chromium) 80+',
    raw: 'PUA potentially unwanted application SmartScreen Edge bypass run anyway',
  },
  {
    id: 'EDGE-003',
    name: 'Enable SmartScreen Filter',
    category: 'Microsoft Edge',
    risk_level: 'High',
    mitre: ['T1566.002', 'T1204.001'],
    registry_path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge',
    registry_value: 'SmartScreenEnabled = 1 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/Browser/AllowSmartScreen\nValue: 1',
    powershell: `$p="HKLM:\\SOFTWARE\\Policies\\Microsoft\\Edge"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name SmartScreenEnabled -Value 1 -Type DWord`,
    description: 'Enforces Microsoft Defender SmartScreen in Edge to block known phishing URLs, malware sites, and malicious downloads.',
    compliance: ['CIS Edge L1', 'NIST SI-3'],
    applies_to: 'Microsoft Edge (Chromium) 77+',
    raw: 'SmartScreen Edge phishing malware download block URL filter',
  },
  {
    id: 'OFFICE-001',
    name: 'Block Macros from Internet-Originated Files',
    category: 'Microsoft Office',
    risk_level: 'Critical',
    mitre: ['T1566.001', 'T1204.002'],
    registry_path: 'HKCU\\Software\\Policies\\Microsoft\\Office\\16.0\\[App]\\Security',
    registry_value: 'BlockContentExecutionFromInternet = 1 (REG_DWORD)',
    oma_uri: 'Deploy via Office ADMX policy or Intune Office CSP',
    powershell: `$apps = @("Excel","Word","PowerPoint","Access")
foreach($app in $apps){
  $p="HKCU:\\Software\\Policies\\Microsoft\\Office\\16.0\\$app\\Security"
  if(!(Test-Path $p)){New-Item -Path $p -Force}
  Set-ItemProperty -Path $p -Name BlockContentExecutionFromInternet -Value 1 -Type DWord
}`,
    description: 'Blocks macro execution in Office documents received from the internet (Mark-of-the-Web). Alone blocks Emotet, QakBot, and most phishing macro delivery chains.',
    compliance: ['CIS Office L1', 'MS Security Baseline', 'CISA'],
    applies_to: 'Microsoft Office 2016+ / Microsoft 365',
    raw: 'Office macro internet MotW Mark-of-the-Web Emotet QakBot phishing Excel Word',
  },
  {
    id: 'OFFICE-002',
    name: 'Disable VBA Macro Execution Entirely',
    category: 'Microsoft Office',
    risk_level: 'Critical',
    mitre: ['T1566.001', 'T1059.005'],
    registry_path: 'HKCU\\Software\\Policies\\Microsoft\\Office\\16.0\\[App]\\Security',
    registry_value: 'VBAWarnings = 4 (REG_DWORD)\n(4 = Disable all macros without notification)',
    oma_uri: 'Deploy via Office ADMX policy or Intune Office CSP',
    powershell: `$apps = @("Excel","Word","PowerPoint","Access","Outlook")
foreach($app in $apps){
  $p="HKCU:\\Software\\Policies\\Microsoft\\Office\\16.0\\$app\\Security"
  if(!(Test-Path $p)){New-Item -Path $p -Force}
  Set-ItemProperty -Path $p -Name VBAWarnings -Value 4 -Type DWord
}`,
    description: 'Sets VBAWarnings = 4 across all Office apps, silently disabling all macros. Appropriate for environments where macros are not operationally required.',
    compliance: ['CIS Office L2', 'DISA STIG', 'NIST SI-3'],
    applies_to: 'Microsoft Office 2013+ / Microsoft 365',
    raw: 'VBA macro disable Office Excel Word VBAWarnings 4 silent block',
  },
  {
    id: 'WIN-PRIVACY-001',
    name: 'Disable Telemetry (Set to Security Level)',
    category: 'Windows Privacy',
    risk_level: 'Medium',
    mitre: ['T1119'],
    registry_path: 'HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection',
    registry_value: 'AllowTelemetry = 0 (REG_DWORD)',
    oma_uri: './Device/Vendor/MSFT/Policy/Config/System/AllowTelemetry\nValue: 0',
    powershell: `$p="HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection"
if(!(Test-Path $p)){New-Item -Path $p -Force}
Set-ItemProperty -Path $p -Name AllowTelemetry -Value 0 -Type DWord`,
    description: 'Restricts Windows telemetry to Security level (0), minimising data sent to Microsoft. Reduces outbound data collection and satisfies GDPR data minimisation.',
    compliance: ['CIS L2 18.9.16.1', 'GDPR Article 5'],
    applies_to: 'Windows 10+ Enterprise / Server 2016+',
    raw: 'telemetry diagnostic data GDPR privacy DataCollection AllowTelemetry 0',
  },
  {
    id: 'WIN-NETWORK-001',
    name: 'Disable WPAD (Web Proxy Auto-Discovery)',
    category: 'Windows Network',
    risk_level: 'High',
    mitre: ['T1557'],
    registry_path: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
    registry_value: 'AutoDetect = 0 (REG_DWORD)',
    oma_uri: 'No direct OMA-URI — configure via PowerShell Intune script',
    powershell: `$p="HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"
Set-ItemProperty -Path $p -Name AutoDetect -Value 0 -Type DWord
netsh winhttp set proxy proxy-server="direct://" bypass-list="<local>"`,
    description: 'Disables automatic proxy discovery to prevent WPAD hijacking, where an attacker responds to WPAD queries to intercept all browser traffic.',
    compliance: ['CIS L1', 'NIST SC-8'],
    applies_to: 'Windows 7+ / Server 2008+',
    raw: 'WPAD proxy auto-discovery hijack man-in-the-middle MITM browser traffic AutoDetect',
  },
];

export const CATEGORIES = [...new Set(
  POLICIES.flatMap(p => Array.isArray(p.category) ? p.category : [p.category])
)].sort();

export const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];