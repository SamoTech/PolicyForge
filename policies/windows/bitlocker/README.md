# BitLocker & Disk Encryption

Complete enterprise deployment and hardening of BitLocker Full Volume Encryption — from TPM configuration and pre-boot authentication to DMA attack prevention, removable drive policies, hibernation security, and fleet-wide compliance monitoring.

> **Key insight**: BitLocker is only as strong as its configuration. TPM-only (no PIN) on a laptop = drive unlocks automatically on boot = stolen device ≈ no encryption. The difference between a 10-minute data breach and an uncrackable drive is entirely in this policy set.

---

## Policy Index

| ID | Policy | Category | Risk |
|---|---|---|---|
| [BL-001](BL-001.md) | Require TPM + PIN Pre-Boot Authentication | Pre-Boot Auth | 🔴 Critical |
| [BL-002](BL-002.md) | Encryption Algorithm: XTS-AES 256-bit | Encryption Strength | 🔴 Critical |
| [BL-003](BL-003.md) | Recovery Key Management (AD DS / Entra ID) | Recovery | 🔴 Critical |
| [BL-004](BL-004.md) | Encrypt Fixed Data Drives | Fixed Drives | 🟠 High |
| [BL-005](BL-005.md) | BitLocker To Go (Removable Drives) | Removable | 🔴 Critical |
| [BL-006](BL-006.md) | Disable S3 Sleep / Hibernation Security | Sleep State | 🔴 Critical |
| [BL-007](BL-007.md) | Network Unlock (Corporate Desktops) | Network Unlock | 🟡 Medium |
| [BL-008](BL-008.md) | Server BitLocker Deployment | Server | 🟠 High |
| [BL-009](BL-009.md) | DMA Protection & Kernel DMA Hardening | Physical Attack | 🔴 Critical |
| [BL-010](BL-010.md) | USB Startup Key (No-TPM Systems) | Startup Key | 🟡 Medium |
| [BL-011](BL-011.md) | TPM PCR Validation (Evil Maid Defense) | PCR Config | 🔴 Critical |
| [BL-012](BL-012.md) | Monitor & Alert on BitLocker Suspension | Policy Enforcement | 🟠 High |
| [BL-013](BL-013.md) | Fleet-Wide Compliance Monitoring | Monitoring | 🟠 High |

---

## Attack → Policy Mapping

| Physical Attack | Method | Policies That Stop It |
|---|---|---|
| Stolen laptop (no PIN) | Boot normally, TPM auto-unlocks | BL-001 (require PIN) |
| Cold boot attack | Freeze RAM, extract FVEK | BL-006 (disable S3), BL-009 (DMA) |
| DMA via Thunderbolt | PCILeech, inception | BL-006, BL-009 |
| Evil Maid (bootloader mod) | Modified MBR captures PIN | BL-011 (PCR 4 validation) |
| Disk extraction (second drive) | Mount unencrypted data volume | BL-004 (encrypt all fixed drives) |
| Lost/stolen USB drive | Read unencrypted USB | BL-005 (BitLocker To Go) |
| BitLocker suspension abuse | FVEK in cleartext on disk | BL-012 (monitor suspension) |
| Recovery key exposure | Key stored with device | BL-003 (AD-only storage) |

---

## Deployment Checklist

```
Pre-deployment:
  ✅ TPM 2.0 present and enabled in BIOS
  ✅ Secure Boot enabled (UEFI)
  ✅ AD schema updated (for recovery key backup)
  ✅ Recovery key backup policy tested
  ✅ Helpdesk trained on recovery key retrieval

Laptops:
  ✅ BL-001: TPM + PIN (6+ char)
  ✅ BL-002: XTS-AES 256
  ✅ BL-003: Recovery key to AD/Entra
  ✅ BL-006: Disable S3 sleep
  ✅ BL-009: DMA protection
  ✅ BL-011: PCR 0, 2, 4, 11 validation

Desktops (corporate network):
  ✅ BL-001 or BL-007 (Network Unlock)
  ✅ BL-002: XTS-AES 256
  ✅ BL-003: Recovery key to AD
  ✅ BL-004: Fixed data drives

Removable media:
  ✅ BL-005: BitLocker To Go mandatory

Servers:
  ✅ BL-008: TPM-only + Network Unlock
  ✅ BL-003: Recovery key to AD

Monitoring:
  ✅ BL-012: Alert on suspension (Event 24588)
  ✅ BL-013: Weekly compliance report
```

---

## Related Policies

- [LSO-005](../local-security-options/LSO-005.md) — Cached credentials (disk extraction context)
- [LSO-010](../local-security-options/LSO-010.md) — Clear pagefile (complements disk encryption)
- [URA-007](../user-rights/URA-007.md) — SeBackupPrivilege (SAM extraction threat)
- [WDA-007](../defender/WDA-007.md) — Controlled Folder Access (ransomware)
