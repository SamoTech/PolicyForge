# 🔄 PolicyForge Policy Diff Tracker

Automatically detect **new**, **deprecated**, and **changed** policies between Windows versions by comparing ADMX snapshots or pre-built JSON exports.

## Quick Start

```bash
# 1. Scan a Windows 10 PolicyDefinitions directory
python policy_diff.py --scan-admx "C:\Windows\PolicyDefinitions" --out snapshots/win10.json

# 2. Copy the script to a Windows 11 machine and scan
python policy_diff.py --scan-admx "C:\Windows\PolicyDefinitions" --out snapshots/win11.json

# 3. Compare the two snapshots
python policy_diff.py --compare snapshots/win10.json snapshots/win11.json \
  --labels "Windows-10-22H2" "Windows-11-24H2"
```

## Output

Every diff run generates two files in `./diff-output/`:

| File | Contents |
|---|---|
| `diff-<label>-<timestamp>.json` | Full machine-readable diff with all policy metadata |
| `diff-<label>-<timestamp>.md` | Human-readable Markdown summary table |

## What It Detects

| Change Type | Example |
|---|---|
| ✅ **Added** | New `AllowOptionalContent` policy in Windows 11 24H2 |
| ❌ **Removed** | Deprecated `DisableHomeGroup` (removed in Windows 10 1803) |
| 🔄 **Changed** | `registry_key` path changed between builds |
| ⬜ **Unchanged** | Same ID, same registry path, same scope |

## Pre-Built Snapshots

Pre-scanned snapshots for major Windows versions will be added to `snapshots/` as the project grows. Community contributions of ADMX scans from different Windows builds are welcome — see [CONTRIBUTING.md](../../CONTRIBUTING.md).
