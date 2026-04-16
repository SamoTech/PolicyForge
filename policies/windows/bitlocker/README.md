# BitLocker & Encryption Policies

Complete BitLocker deployment guide covering OS drives, fixed drives, removable drives, pre-boot authentication, recovery key management, and DMA attack prevention.

## Policy Index

| ID | Policy | Drive Type | Risk |
|---|---|---|---|
| [BL-001](BL-001.md) | Require BitLocker — XTS-AES 256 | OS Drive | 🔴 Critical |
| [BL-002](BL-002.md) | Require TPM 2.0 + PIN Pre-Boot Auth | OS Drive | 🔴 Critical |
| [BL-003](BL-003.md) | Set Minimum PIN Length (6+) | OS Drive | 🟠 Medium |
| [BL-004](BL-004.md) | Allow Alphanumeric Enhanced PINs | OS Drive | 🟠 Medium |
| [BL-005](BL-005.md) | Require BitLocker on Fixed Data Drives | Data Drive | 🔴 Critical |
| [BL-006](BL-006.md) | Require BitLocker on Removable Drives | USB/Removable | 🔴 Critical |
| [BL-007](BL-007.md) | Configure Network Unlock (Domain) | OS Drive | 🟠 Medium |
| [BL-008](BL-008.md) | Store Recovery Keys in AD / Entra ID | Recovery | 🔴 Critical |
| [BL-009](BL-009.md) | Disable BitLocker Management by Standard Users | All Drives | 🟠 Medium |
| [BL-010](BL-010.md) | Disable DMA When Screen is Locked | OS Drive | 🔴 Critical |
| [BL-011](BL-011.md) | Enable Secure Boot + TPM Platform Validation | OS Drive | 🔴 Critical |
| [BL-012](BL-012.md) | Disable Hardware Encryption (eDrive) — CVE-2018 | All Drives | 🔴 Critical |

---

## Deployment Tiers

### Tier 1 — Minimum Viable BitLocker (All Endpoints)

```powershell
# Step 1: Force software encryption (disable vulnerable eDrive)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\FVE" -Name "OSHardwareEncryption" -Value 0 -Type DWord
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\FVE" -Name "FDVHardwareEncryption" -Value 0 -Type DWord

# Step 2: Enable BitLocker on OS drive with XTS-AES 256 + Recovery Key
Enable-BitLocker -MountPoint "C:" `
                 -EncryptionMethod XtsAes256 `
                 -TpmProtector `
                 -RecoveryPasswordProtector

# Step 3: Backup recovery key to Entra ID
$protector = (Get-BitLockerVolume "C:").KeyProtector | Where-Object { $_.KeyProtectorType -eq "RecoveryPassword" }
BackupToAAD-BitLockerKeyProtector -MountPoint "C:" -KeyProtectorId $protector.KeyProtectorId
```

### Tier 2 — High Security (Laptop Fleet / Mobile Workers)

All Tier 1 policies, plus:
- BL-002: TPM + PIN (6+ digit minimum)
- BL-005: Encrypt fixed data drives
- BL-006: Require encrypted USB drives
- BL-010: Disable DMA when locked
- BL-011: Secure Boot validation

### Tier 3 — Maximum Security (Executive / High-Value Targets)

All Tier 2 policies, plus:
- BL-004: Alphanumeric enhanced PIN
- BL-009: Restrict BitLocker management to admins only
- Physical port blocking (USB, Thunderbolt) via device control policies
- Kernel DMA protection (IOMMU/VT-d) enabled in UEFI

---

## Compliance Matrix

| Policy | CIS L1 | CIS L2 | DISA STIG | NIST 800-111 | HIPAA |
|---|---|---|---|---|---|
| BL-001 | ✅ | ✅ | ✅ | ✅ | ✅ |
| BL-002 | ⬜ | ✅ | ✅ | ✅ | ⬜ |
| BL-003 | ✅ | ✅ | ✅ | ✅ | ⬜ |
| BL-004 | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| BL-005 | ✅ | ✅ | ✅ | ✅ | ✅ |
| BL-006 | ⬜ | ✅ | ✅ | ✅ | ✅ |
| BL-007 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| BL-008 | ✅ | ✅ | ✅ | ✅ | ✅ |
| BL-009 | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| BL-010 | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| BL-011 | ✅ | ✅ | ✅ | ✅ | ⬜ |
| BL-012 | ✅ | ✅ | ⬜ | ✅ | ⬜ |

---

## Attack Scenarios Mitigated

| Attack | Mitigation Policies |
|---|---|
| Stolen laptop — cold boot attack | BL-002 (PIN), BL-010 (DMA) |
| USB drive data exfiltration | BL-006 (USB encryption required) |
| Evil maid / bootkit | BL-002 (PIN), BL-011 (Secure Boot) |
| DMA attack via Thunderbolt | BL-010 (DMA lock) |
| Hardware eDrive bypass (CVE-2018) | BL-012 (force software encryption) |
| Lost recovery key | BL-008 (backup to AD/Entra ID) |
| User suspends BitLocker for malware | BL-009 (admin-only management) |
| Off-site server reboot (unattended) | BL-007 (Network Unlock) |
