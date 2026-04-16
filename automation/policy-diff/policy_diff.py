#!/usr/bin/env python3
"""
PolicyForge — Policy Diff Tracker
Compares Group Policy / registry settings across Windows versions,
detects new policies, deprecated ones, and value changes.

Usage:
  python policy_diff.py --baseline win10-22h2 --target win11-24h2
  python policy_diff.py --scan-admx "C:\\Windows\\PolicyDefinitions" --out ./output
  python policy_diff.py --compare file1.json file2.json
"""

import argparse
import json
import os
import sys
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional

try:
    import xml.etree.ElementTree as ET
except ImportError:
    print("ERROR: xml.etree.ElementTree not found (should be in stdlib).")
    sys.exit(1)

# ── Constants ──────────────────────────────────────────────────────────────────

NS = {
    'pol': 'http://www.microsoft.com/GroupPolicy/PolicyDefinitions',
    'res': 'http://www.microsoft.com/GroupPolicy/PolicyDefinitions/Resources',
}

OUTPUT_DIR = Path("./diff-output")

# ── ADMX Scanner ───────────────────────────────────────────────────────────────

def scan_admx_directory(admx_dir: str) -> dict:
    """
    Recursively parse all .admx files in a directory.
    Returns a dict keyed by policy ID with metadata.
    """
    admx_path = Path(admx_dir)
    if not admx_path.exists():
        print(f"[ERROR] Directory not found: {admx_dir}")
        sys.exit(1)

    policies = {}
    admx_files = list(admx_path.glob("**/*.admx"))
    print(f"[INFO] Found {len(admx_files)} ADMX files in {admx_dir}")

    for admx_file in admx_files:
        try:
            tree = ET.parse(admx_file)
            root = tree.getroot()
            file_policies = _extract_policies_from_admx(root, admx_file.name)
            policies.update(file_policies)
            print(f"  [+] {admx_file.name}: {len(file_policies)} policies")
        except ET.ParseError as e:
            print(f"  [!] Parse error in {admx_file.name}: {e}")

    print(f"[INFO] Total policies extracted: {len(policies)}")
    return policies


def _extract_policies_from_admx(root: ET.Element, source_file: str) -> dict:
    """Extract policy definitions from a parsed ADMX root element."""
    policies = {}

    # Handle both namespaced and non-namespaced ADMX files
    ns_prefix = ''
    if root.tag.startswith('{'):
        ns_prefix = root.tag.split('}')[0] + '}'

    for policy in root.iter(f"{ns_prefix}policy"):
        policy_id = policy.get('name', '')
        if not policy_id:
            continue

        # Extract registry info
        registry_key = policy.get('key', '')
        value_name = policy.get('valueName', '')

        # Extract supported OS info
        supported = policy.find(f"{ns_prefix}supportedOn")
        supported_ref = supported.get('ref', '') if supported is not None else ''

        # Extract parent category
        parent_cat = policy.find(f"{ns_prefix}parentCategory")
        category_ref = parent_cat.get('ref', '') if parent_cat is not None else ''

        # Determine scope
        scope = 'unknown'
        if 'machine' in policy.get('class', '').lower():
            scope = 'computer'
        elif 'user' in policy.get('class', '').lower():
            scope = 'user'
        elif policy.get('class', '') == 'Both':
            scope = 'both'

        # Hash for change detection
        content_hash = hashlib.md5(
            f"{registry_key}{value_name}{scope}".encode()
        ).hexdigest()[:8]

        policies[policy_id] = {
            'id': policy_id,
            'source_file': source_file,
            'registry_key': registry_key,
            'value_name': value_name,
            'scope': scope,
            'category': category_ref,
            'supported_on': supported_ref,
            'hash': content_hash,
        }

    return policies


# ── Diff Engine ────────────────────────────────────────────────────────────────

def diff_policy_sets(baseline: dict, target: dict, baseline_label: str, target_label: str) -> dict:
    """
    Compare two policy sets and return a structured diff report.
    """
    baseline_ids = set(baseline.keys())
    target_ids = set(target.keys())

    added = target_ids - baseline_ids
    removed = baseline_ids - target_ids
    common = baseline_ids & target_ids

    changed = {}
    unchanged = {}

    for pid in common:
        b = baseline[pid]
        t = target[pid]
        changes = {}

        for field in ('registry_key', 'value_name', 'scope', 'supported_on'):
            if b.get(field) != t.get(field):
                changes[field] = {'from': b.get(field), 'to': t.get(field)}

        if changes:
            changed[pid] = {
                'policy': t,
                'changes': changes,
            }
        else:
            unchanged[pid] = t

    report = {
        'metadata': {
            'baseline': baseline_label,
            'target': target_label,
            'generated_at': datetime.utcnow().isoformat() + 'Z',
            'baseline_count': len(baseline),
            'target_count': len(target),
        },
        'summary': {
            'added': len(added),
            'removed': len(removed),
            'changed': len(changed),
            'unchanged': len(unchanged),
        },
        'added': {pid: target[pid] for pid in added},
        'removed': {pid: baseline[pid] for pid in removed},
        'changed': changed,
    }

    return report


# ── Report Generators ──────────────────────────────────────────────────────────

def report_to_markdown(report: dict) -> str:
    """Convert a diff report to a Markdown summary."""
    meta = report['metadata']
    summary = report['summary']
    lines = []

    lines.append(f"# PolicyForge Diff Report")
    lines.append(f"")
    lines.append(f"| Field | Value |")
    lines.append(f"|---|---|")
    lines.append(f"| Baseline | `{meta['baseline']}` ({meta['baseline_count']} policies) |")
    lines.append(f"| Target | `{meta['target']}` ({meta['target_count']} policies) |")
    lines.append(f"| Generated | {meta['generated_at']} |")
    lines.append(f"")
    lines.append(f"## Summary")
    lines.append(f"")
    lines.append(f"| Change Type | Count |")
    lines.append(f"|---|---|")
    lines.append(f"| ✅ Added (new in target) | **{summary['added']}** |")
    lines.append(f"| ❌ Removed (deprecated) | **{summary['removed']}** |")
    lines.append(f"| 🔄 Changed | **{summary['changed']}** |")
    lines.append(f"| ⬜ Unchanged | **{summary['unchanged']}** |")
    lines.append(f"")

    if report['added']:
        lines.append(f"## ✅ New Policies ({len(report['added'])})")
        lines.append(f"")
        lines.append(f"| Policy ID | Registry Key | Scope |")
        lines.append(f"|---|---|---|")
        for pid, p in sorted(report['added'].items()):
            lines.append(f"| `{pid}` | `{p['registry_key']}` | {p['scope']} |")
        lines.append(f"")

    if report['removed']:
        lines.append(f"## ❌ Deprecated Policies ({len(report['removed'])})")
        lines.append(f"")
        lines.append(f"| Policy ID | Registry Key | Source File |")
        lines.append(f"|---|---|---|")
        for pid, p in sorted(report['removed'].items()):
            lines.append(f"| `{pid}` | `{p['registry_key']}` | {p['source_file']} |")
        lines.append(f"")

    if report['changed']:
        lines.append(f"## 🔄 Changed Policies ({len(report['changed'])})")
        lines.append(f"")
        for pid, entry in sorted(report['changed'].items()):
            lines.append(f"### `{pid}`")
            for field, delta in entry['changes'].items():
                lines.append(f"- **{field}**: `{delta['from']}` → `{delta['to']}`")
            lines.append(f"")

    return "\n".join(lines)


def save_report(report: dict, out_dir: Path, label: str):
    """Save report as JSON and Markdown."""
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    slug = label.replace(' ', '-').lower()

    json_path = out_dir / f"diff-{slug}-{timestamp}.json"
    md_path = out_dir / f"diff-{slug}-{timestamp}.md"

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(report_to_markdown(report))

    print(f"[OUT] JSON: {json_path}")
    print(f"[OUT] Markdown: {md_path}")


# ── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='PolicyForge Policy Diff Tracker',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scan two ADMX dirs and diff them
  python policy_diff.py --scan-admx C:\\Win10\\PolicyDefinitions --out ./win10.json
  python policy_diff.py --scan-admx C:\\Win11\\PolicyDefinitions --out ./win11.json
  python policy_diff.py --compare ./win10.json ./win11.json --labels win10 win11

  # Quick diff from pre-exported JSON snapshots
  python policy_diff.py --compare snapshots/win10-22h2.json snapshots/win11-24h2.json
"""
    )

    parser.add_argument('--scan-admx', metavar='DIR',
                        help='Scan an ADMX directory and export a policy JSON snapshot')
    parser.add_argument('--out', metavar='FILE',
                        help='Output path for --scan-admx snapshot (default: ./snapshot.json)')
    parser.add_argument('--compare', nargs=2, metavar=('BASELINE', 'TARGET'),
                        help='Compare two JSON policy snapshots')
    parser.add_argument('--labels', nargs=2, metavar=('BASELINE_LABEL', 'TARGET_LABEL'),
                        default=['baseline', 'target'],
                        help='Labels for baseline and target (used in report)')
    parser.add_argument('--report-dir', metavar='DIR', default='./diff-output',
                        help='Directory to save diff reports (default: ./diff-output)')

    args = parser.parse_args()

    if args.scan_admx:
        policies = scan_admx_directory(args.scan_admx)
        out_path = Path(args.out) if args.out else Path('./snapshot.json')
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(policies, f, indent=2)
        print(f"[OUT] Snapshot saved: {out_path} ({len(policies)} policies)")

    elif args.compare:
        baseline_path, target_path = args.compare
        with open(baseline_path, encoding='utf-8') as f:
            baseline = json.load(f)
        with open(target_path, encoding='utf-8') as f:
            target = json.load(f)

        baseline_label, target_label = args.labels
        report = diff_policy_sets(baseline, target, baseline_label, target_label)

        print(f"\n{'='*60}")
        print(report_to_markdown(report))
        print(f"{'='*60}\n")

        save_report(report, Path(args.report_dir), f"{baseline_label}-vs-{target_label}")

    else:
        parser.print_help()


if __name__ == '__main__':
    main()
