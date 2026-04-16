# AUDIT-012 — Windows Event Forwarding to SIEM

**ID:** AUDIT-012  
**Category:** Audit Policy / SIEM / Centralized Logging  
**Risk Level:** 🟡 Medium  
**OS:** Windows 10+, Windows 11, Windows Server 2016+  
**Source:** NSA/CISA WEF Guidance · Microsoft Documentation

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Endpoints (WEF Sources)                                        │
│  Windows Endpoints → Windows Event Collector (WEC Server)       │
│                    → Forwarded Events Log                       │
│                    → SIEM (Splunk / Elastic / Sentinel / QRadar) │
└─────────────────────────────────────────────────────────────────┘
```

## Policy Path (Source-Initiated Subscription)

```
Computer Configuration
  └─ Administrative Templates
       └─ Windows Components
            └─ Event Forwarding
                 └─ Configure target Subscription Manager
                      └─ Enabled
                           └─ SubscriptionManagers:
                                Server=http://wec-server.domain.local:5985/wsman/SubscriptionManager/WEC,Refresh=60
```

## Setup Commands (WEC Server)

```powershell
# On WEC Server: enable Windows Event Collector service
wecutil qc /q

# Create a subscription (collect Security events from all endpoints)
wecutil cs "C:\PolicyForge\wef-subscription.xml"

# List active subscriptions
wecutil es

# Check subscription status
wecutil gr "PolicyForge-Security-Events"
```

## WEF Subscription XML Template

```xml
<!-- Save as wef-subscription.xml -->
<Subscription xmlns="http://schemas.microsoft.com/2006/03/windows/events/subscription">
  <SubscriptionId>PolicyForge-Security</SubscriptionId>
  <SubscriptionType>SourceInitiated</SubscriptionType>
  <Description>PolicyForge Security Event Collection</Description>
  <Enabled>true</Enabled>
  <Uri>http://schemas.microsoft.com/wbem/wsman/1/windows/EventLog</Uri>
  <ConfigurationMode>MinLatency</ConfigurationMode>
  <Query>
    <![CDATA[
    <QueryList>
      <Query Id="0">
        <Select Path="Security">*[System[EventID=
          1102 or 4624 or 4625 or 4648 or 4672 or 4688 or 4697 or
          4698 or 4702 or 4719 or 4720 or 4726 or 4728 or 4732 or
          4740 or 4768 or 4771 or 5140 or 7045
        ]]</Select>
        <Select Path="System">*[System[EventID=7045 or 104]]</Select>
        <Select Path="Microsoft-Windows-PowerShell/Operational">
          *[System[EventID=4104]]
        </Select>
      </Query>
    </QueryList>
    ]]>
  </Query>
  <AllowedSourceDomainComputers>O:NSG:NSD:(A;;GA;;;DC)(A;;GA;;;NS)</AllowedSourceDomainComputers>
</Subscription>
```

## Description

Windows Event Forwarding (WEF) centralizes security events from all endpoints to a Windows Event Collector server, which feeds into a SIEM. Without centralized logging, investigating a breach requires connecting to each endpoint individually — slow, incomplete, and subject to log tampering on compromised machines. The NSA/CISA WEF guidance recommends forwarding a curated list of ~20 high-value event IDs covering all critical detection categories rather than forwarding all events (which creates unmanageable volume).

## Impact

- ✅ Centralized security event collection from entire fleet
- ✅ Events preserved even if endpoint logs are cleared
- ✅ SIEM correlation across multiple endpoints
- ⚠️ WEC server becomes a high-value target — harden it
- ⚠️ Network bandwidth for event forwarding: plan capacity

## Test Status

✔ Tested with WEC on Windows Server 2022 → Elastic SIEM
