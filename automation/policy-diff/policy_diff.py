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
from datetime import datetime, timezone

try:
    import xml.etree.ElementTree as ET
except ImportError:
    print("ERROR: xml.etree.ElementTree not found (should be in stdlib).")
    sys.exit(1)


def parse_admx_policies(admx_dir: str, source_label: str = '') -> dict:
    """
    Walk an ADMX directory and extract all policy definitions into a dict.
    Returns: {policy_id: {id, source_file, registry_key, value_name, scope, category, supported_on, hash}}
    """
    policies = {}
    admx_path = Path(admx_dir)

    if not admx_path.exists():
        print(f"ERROR: ADMX directory not found: {admx_dir}")
        return policies

    for admx_file in sorted(admx_path.glob('*.admx')):
        source_file = admx_file.name
        try:
            tree = ET.parse(admx_file)
            root = tree.getroot()
        except ET.ParseError as e:
            print(f"  [WARN] Skipping {source_file}: {e}")
            continue

        ns = {'gp': 'http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions'}

        for policy in root.findall('.//gp:policy', ns):
            policy_name = policy.get('name', '')
            if not policy_name:
                continue

            policy_id = f"{admx_file.stem}::{policy_name}"
            registry_key = policy.get('key', '')
            value_name = policy.get('valueName', '')
            class_type = policy.get('class', '')
            category_ref = policy.find('gp:parentCategory', ns)
            category = category_ref.get('ref', '') if category_ref is not None else ''
            supported_elem = policy.find('gp:supportedOn', ns)
            supported_ref = supported_elem.get('ref', '') if supported_elem is not None else ''

            scope = 'unknown'
            if 'machine' in class_type.lower():
                scope = 'computer'
            elif 'user' in class_type.lower():
                scope = 'user'
            elif class_type == 'Both':
                scope = 'both'

            content_hash = hashlib.sha256(
                f"{registry_key}{value_name}{scope}".encode()
            ).hexdigest()[:8]

            policies[policy_id] = {
                'id': policy_id,
                'source_file': source_file,
                'registry_key': registry_key,
                'value_name': value_name,
                'scope': scope,
                'category': category,
                'supported_on': supported_ref,
                'hash': content_hash,
            }

    return policies


def diff_policies(baseline: dict, target: dict) -> dict:
    """
    Compare two policy dicts and return added, removed, and changed policies.
    """
    baseline_ids = set(baseline.keys())
    target_ids = set(target.keys())

    added   = {k: target[k] for k in target_ids - baseline_ids}
    removed = {k: baseline[k] for k in baseline_ids - target_ids}
    changed = {}

    for k in baseline_ids & target_ids:
        if baseline[k]['hash'] != target[k]['hash']:
            changed[k] = {
                'before': baseline[k],
                'after': target[k],
            }

    return {'added': added, 'removed': removed, 'changed': changed}


def format_diff_report(diff: dict, baseline_label: str, target_label: str) -> dict:
    added   = list(diff['added'].values())
    removed = list(diff['removed'].values())
    changed = list(diff['changed'].values())

    return {
        'metadata': {
            'baseline': baseline_label,
            'target': target_label,
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'baseline_count': len(added) + len(removed),
            'target_count': len(added),
        },
        'summary': {
            'added': len(added),
            'removed': len(removed),
            'changed': len(changed),
        },
        'added': added,
        'removed': removed,
        'changed': changed,
    }


def main():
    parser = argparse.ArgumentParser(
        description='PolicyForge — Compare ADMX policy sets across Windows versions'
    )
    parser.add_argument('--baseline', help='Label for baseline ADMX directory')
    parser.add_argument('--target', help='Label for target ADMX directory')
    parser.add_argument('--baseline-dir', help='Path to baseline PolicyDefinitions')
    parser.add_argument('--target-dir', help='Path to target PolicyDefinitions')
    parser.add_argument('--compare', nargs=2, metavar=('FILE1', 'FILE2'),
                        help='Compare two previously exported JSON files')
    parser.add_argument('--out', default='./diff-output', help='Output directory')
    args = parser.parse_args()

    out_path = Path(args.out)
    out_path.mkdir(parents=True, exist_ok=True)

    if args.compare:
        with open(args.compare[0], encoding='utf-8') as f:
            baseline = json.load(f)
        with open(args.compare[1], encoding='utf-8') as f:
            target = json.load(f)
        baseline_label = args.baseline or args.compare[0]
        target_label   = args.target   or args.compare[1]
    elif args.baseline_dir and args.target_dir:
        print(f"Scanning baseline: {args.baseline_dir}")
        baseline = parse_admx_policies(args.baseline_dir, args.baseline or 'baseline')
        print(f"Scanning target:   {args.target_dir}")
        target = parse_admx_policies(args.target_dir, args.target or 'target')
        baseline_label = args.baseline or 'baseline'
        target_label   = args.target   or 'target'
    else:
        parser.print_help()
        sys.exit(0)

    diff   = diff_policies(baseline, target)
    report = format_diff_report(diff, baseline_label, target_label)

    out_file = out_path / f"diff-{baseline_label}-vs-{target_label}.json"
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\nDiff complete:")
    print(f"  Added  : {report['summary']['added']}")
    print(f"  Removed: {report['summary']['removed']}")
    print(f"  Changed: {report['summary']['changed']}")
    print(f"  Report : {out_file}")


if __name__ == '__main__':
    main()
