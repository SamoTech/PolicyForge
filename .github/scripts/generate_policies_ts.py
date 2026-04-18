#!/usr/bin/env python3
"""PolicyForge — Auto-generator: policies/**/*.md → policies.ts

Parses every Markdown policy file and emits a fully typed TypeScript
array at dashboards/web-ui/src/lib/policies.ts.

Usage:
  python .github/scripts/generate_policies_ts.py
"""
import re
import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

CATEGORY_MAP = {
    'edge':    'Microsoft Edge',
    'defender': 'Microsoft Defender',
    'office':  'Microsoft Office',
    'server':  'Windows Server',
    'windows': 'Windows Security',
}

SUBDIR_CATEGORY_MAP = {
    'account-policies':      'Windows Security',
    'applocker':             'Windows Security',
    'asr':                   'Microsoft Defender',
    'audit':                 'Windows Security',
    'bitlocker':             'Windows Security',
    'credentials':           'Windows Security',
    'defender':              'Microsoft Defender',
    'firewall':              'Windows Security',
    'local-security-options':'Windows Security',
    'network':               'Windows Network',
    'printing':              'Windows Security',
    'privacy':               'Windows Privacy',
    'security':              'Windows Security',
    'smb':                   'Windows Security',
    'update':                'Windows Security',
    'user-rights':           'Windows Security',
    'wdac':                  'Windows Security',
}

RISK_EMOJI = {
    '\U0001f534': 'Critical',   # 🔴
    '\U0001f7e0': 'High',       # 🟠
    '\U0001f7e1': 'Medium',     # 🟡
    '\U0001f7e2': 'Low',        # 🟢
}


def extract_section(content: str, heading: str) -> str:
    """Extract text between ## heading and the next ## heading."""
    pattern = rf'##\s+{re.escape(heading)}\s*\n([\s\S]*?)(?=\n##\s|\Z)'
    m = re.search(pattern, content, re.IGNORECASE)
    return m.group(1).strip() if m else ''


def extract_code_block(section: str) -> str:
    """Pull first fenced code block out of a section."""
    m = re.search(r'```[\w]*\n([\s\S]*?)```', section)
    return m.group(1).strip() if m else section.strip()


def extract_id(content: str, filename: str) -> str:
    """Try **ID:** field first, fall back to filename stem."""
    m = re.search(r'\*\*ID:\*\*\s*([A-Z0-9\-]+)', content)
    if m:
        return m.group(1).strip()
    # derive from filename: EDGE-006.md → EDGE-006, EDGE-001-disable-inprivate.md → EDGE-001
    stem = Path(filename).stem
    parts = stem.split('-')
    # grab up to the numeric part
    id_parts = []
    for p in parts:
        id_parts.append(p)
        if p.isdigit() or re.match(r'^\d{3}$', p):
            break
    return '-'.join(id_parts).upper()


def extract_name(content: str, filepath: Path) -> str:
    """Extract policy name from H1 heading."""
    m = re.search(r'^#\s+(?:[A-Z0-9\-]+\s+—\s+)?(.+)$', content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    # fall back to filename slug
    stem = filepath.stem
    parts = stem.split('-')
    # drop the ID prefix parts
    name_parts = []
    skip = True
    for p in parts:
        if skip and (p.isupper() or p.isdigit() or re.match(r'^\d{3}$', p)):
            continue
        skip = False
        name_parts.append(p.capitalize())
    return ' '.join(name_parts) if name_parts else stem


def extract_risk(content: str) -> str:
    for emoji, level in RISK_EMOJI.items():
        if emoji in content:
            return level
    m = re.search(r'\*\*Risk Level:\*\*\s*(?:[\U0001f534\U0001f7e0\U0001f7e1\U0001f7e2]\s*)?(Critical|High|Medium|Low)', content, re.IGNORECASE)
    if m:
        return m.group(1).capitalize()
    return 'Medium'


def extract_mitre(content: str) -> list:
    return re.findall(r'T\d{4}(?:\.\d{3})?', content)


def extract_registry_path(content: str) -> str:
    sec = extract_section(content, 'Registry')
    if not sec:
        return ''
    # grab first HKLM/HKCU/HKEY line
    m = re.search(r'(HK(?:LM|CU|EY_[A-Z_]+)\\[^\n`]+)', sec)
    return m.group(1).strip() if m else ''


def extract_registry_value(content: str) -> str:
    sec = extract_section(content, 'Registry')
    code = extract_code_block(sec)
    lines = [l for l in code.splitlines() if '=' in l and not l.strip().startswith('HK')]
    return '\n'.join(lines[:4]) if lines else ''


def extract_oma_uri(content: str) -> str:
    m = re.search(r'`(\./Device/Vendor/MSFT[^`]+)`', content)
    if m:
        return m.group(1).strip()
    m2 = re.search(r'(\./Device/Vendor/MSFT[^\n]+)', content)
    return m2.group(1).strip() if m2 else 'No direct OMA-URI'


def extract_powershell(content: str) -> str:
    sec = extract_section(content, 'PowerShell')
    return extract_code_block(sec)


def extract_description(content: str) -> str:
    sec = extract_section(content, 'Description')
    # strip any sub-headings
    clean = re.sub(r'###.*', '', sec).strip()
    # take first paragraph
    paras = [p.strip() for p in clean.split('\n\n') if p.strip()]
    return paras[0] if paras else ''


def extract_compliance(content: str) -> list:
    patterns = [
        r'CIS[\w\s\.\-]*?\d[\w\.\-]*',
        r'DISA STIG[\w\s\.\-]*',
        r'NIST[\s\w\.\-]+',
        r'GDPR[\s\w\.\-]+',
        r'CISA[\s\w\.\-]+',
        r'MS Security Baseline',
        r'PCI[\-\s]DSS',
    ]
    found = []
    for pat in patterns:
        for m in re.finditer(pat, content):
            val = m.group(0).strip().rstrip('.')
            if val not in found and len(val) < 60:
                found.append(val)
    return found[:6]


def derive_category(filepath: Path) -> str:
    parts = filepath.parts  # e.g. ('policies', 'edge', 'EDGE-001.md')
    if len(parts) >= 2:
        top = parts[1]  # 'edge', 'windows', 'defender', etc.
        if top in CATEGORY_MAP:
            if top == 'windows' and len(parts) >= 3:
                subdir = parts[2]
                return SUBDIR_CATEGORY_MAP.get(subdir, 'Windows Security')
            return CATEGORY_MAP[top]
    return 'Windows Security'


def escape_ts(s: str) -> str:
    """Escape a string for TypeScript template literal."""
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


def policy_to_ts(filepath: Path) -> str | None:
    """Parse a single .md file and return a TypeScript object literal."""
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        print(f'  WARN: cannot read {filepath}: {e}', file=sys.stderr)
        return None

    if not content.strip():
        return None

    pid         = escape_ts(extract_id(content, filepath.name))
    name        = escape_ts(extract_name(content, filepath))
    category    = escape_ts(derive_category(filepath))
    risk        = extract_risk(content)
    mitre       = extract_mitre(content)
    reg_path    = escape_ts(extract_registry_path(content))
    reg_val     = escape_ts(extract_registry_value(content))
    oma         = escape_ts(extract_oma_uri(content))
    ps          = escape_ts(extract_powershell(content))
    desc        = escape_ts(extract_description(content))
    compliance  = extract_compliance(content)
    applies_to  = 'Windows 10+ / Server 2016+'

    # raw searchable blob
    raw_parts = [pid, name, category] + mitre + [reg_path, reg_val, oma, desc]
    raw = escape_ts(' '.join(raw_parts)[:400])

    mitre_ts    = ', '.join(f"'{t}'" for t in mitre) if mitre else ''
    comply_ts   = ', '.join(f"'{escape_ts(c)}'" for c in compliance)

    return f"""  {{
    id:             '{pid}',
    name:           `{name}`,
    category:       '{category}',
    risk_level:     '{risk}',
    mitre:          [{mitre_ts}],
    registry_path:  `{reg_path}`,
    registry_value: `{reg_val}`,
    oma_uri:        `{oma}`,
    powershell:     `{ps}`,
    description:    `{desc}`,
    compliance:     [{comply_ts}],
    applies_to:     '{applies_to}',
    raw:            `{raw}`,
  }}"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    root = Path('.')
    md_files = sorted(
        f for f in root.glob('policies/**/*.md')
        if f.name not in ('README.md', '_TEMPLATE.md')
    )

    print(f'\n🔄 PolicyForge Generator')
    print(f'   Parsing {len(md_files)} policy files...\n')

    objects = []
    skipped = 0
    for filepath in md_files:
        obj = policy_to_ts(filepath)
        if obj:
            objects.append(obj)
            print(f'  ✅ {filepath.name}')
        else:
            skipped += 1
            print(f'  ⏭️  {filepath.name} (skipped — empty)')

    ts_content = """// AUTO-GENERATED by .github/scripts/generate_policies_ts.py
// Do NOT edit manually — re-run the generator or push to policies/** to update.

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
  raw:            string;
  description:    string;
  compliance:     string[];
  applies_to:     string;
}

export const POLICIES: Policy[] = [
""" + ',\n'.join(objects) + """\n];

export const CATEGORIES = [...new Set(
  POLICIES.flatMap(p => Array.isArray(p.category) ? p.category : [p.category])
)].sort();

export const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];
"""

    out_path = Path('dashboards/web-ui/src/lib/policies.ts')
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(ts_content, encoding='utf-8')

    print(f'\n{\'=\'*60}')
    print(f'  Policies generated : {len(objects)}')
    print(f'  Skipped (empty)    : {skipped}')
    print(f'  Output             : {out_path}')
    print(f'{\'=\'*60}\n')
    print(f'✅ policies.ts written successfully.')


if __name__ == '__main__':
    main()
