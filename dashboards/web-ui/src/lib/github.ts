// Server-only — never import this in 'use client' components.
import type { Policy, RiskLevel } from './policies';

const OWNER  = 'SamoTech';
const REPO   = 'PolicyForge';
const BRANCH = 'main';
const BASE   = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

// ── Category maps ────────────────────────────────────────────────────────────
const TOP_CAT: Record<string, string> = {
  edge:     'Microsoft Edge',
  defender: 'Microsoft Defender',
  office:   'Microsoft Office',
  server:   'Windows Server',
  windows:  'Windows Security',
};

const SUB_CAT: Record<string, string> = {
  'account-policies':       'Windows Security',
  'applocker':              'Windows Security',
  'asr':                    'Microsoft Defender',
  'audit':                  'Windows Security',
  'bitlocker':              'Windows Security',
  'credentials':            'Windows Security',
  'defender':               'Microsoft Defender',
  'firewall':               'Windows Firewall',
  'local-security-options': 'Windows Security',
  'network':                'Windows Network',
  'printing':               'Windows Security',
  'privacy':                'Windows Privacy',
  'security':               'Windows Security',
  'smb':                    'Windows Security',
  'update':                 'Windows Security',
  'user-rights':            'Windows Security',
  'wdac':                   'Windows Security',
};

const RISK_EMOJI: Record<string, RiskLevel> = {
  '\u{1F534}': 'Critical',
  '\u{1F7E0}': 'High',
  '\u{1F7E1}': 'Medium',
  '\u{1F7E2}': 'Low',
};

// ── GitHub API helpers ───────────────────────────────────────────────────────
const ghHeaders = (): HeadersInit => ({
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
});

interface GhEntry {
  type: 'file' | 'dir';
  name: string;
  path: string;
  download_url: string | null;
  html_url: string;
}

async function listDir(path: string): Promise<GhEntry[]> {
  const url = `${BASE}/${path}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: ghHeaders(),
    next: { revalidate: 300 }, // ISR: re-fetch every 5 min
  });
  if (!res.ok) return [];
  return res.json();
}

async function fetchRaw(downloadUrl: string): Promise<string> {
  const res = await fetch(downloadUrl, { next: { revalidate: 300 } });
  if (!res.ok) return '';
  return res.text();
}

// ── Collect all .md file entries under policies/ ─────────────────────────────
async function collectMdFiles(path: string): Promise<GhEntry[]> {
  const entries = await listDir(path);
  const files: GhEntry[] = [];
  await Promise.all(
    entries.map(async (e) => {
      if (e.type === 'dir') {
        const nested = await collectMdFiles(e.path);
        files.push(...nested);
      } else if (
        e.type === 'file' &&
        e.name.endsWith('.md') &&
        e.name !== 'README.md' &&
        e.name !== '_TEMPLATE.md'
      ) {
        files.push(e);
      }
    }),
  );
  return files;
}

// ── Parsing helpers ──────────────────────────────────────────────────────────
function extractSection(content: string, heading: string): string {
  const re = new RegExp(
    `##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|\\Z)`,
    'i',
  );
  return content.match(re)?.[1]?.trim() ?? '';
}

function extractCodeBlock(section: string): string {
  return section.match(/```[\w]*\n([\s\S]*?)```/)?.[1]?.trim() ?? section.trim();
}

function extractId(content: string, filename: string): string {
  const m = content.match(/\*\*ID:\*\*\s*([A-Z0-9\-]+)/);
  if (m) return m[1].trim();
  const stem = filename.replace(/\.md$/, '');
  const parts = stem.split('-');
  const idParts: string[] = [];
  for (const p of parts) {
    idParts.push(p);
    if (/^\d{3}$/.test(p)) break;
  }
  return idParts.join('-').toUpperCase();
}

function extractName(content: string, filename: string): string {
  const m = content.match(/^#\s+(?:[A-Z0-9\-]+\s+—\s+)?(.+)$/m);
  if (m) return m[1].trim();
  const stem = filename.replace(/\.md$/, '');
  const parts = stem.split('-');
  const nameParts: string[] = [];
  let skip = true;
  for (const p of parts) {
    if (skip && (p === p.toUpperCase() || /^\d+$/.test(p))) continue;
    skip = false;
    nameParts.push(p.charAt(0).toUpperCase() + p.slice(1));
  }
  return nameParts.length ? nameParts.join(' ') : stem;
}

function extractRisk(content: string): RiskLevel {
  for (const [emoji, level] of Object.entries(RISK_EMOJI)) {
    if (content.includes(emoji)) return level;
  }
  const m = content.match(/\*\*Risk Level:\*\*\s*[🔴🟠🟡🟢]?\s*(Critical|High|Medium|Low)/i);
  return (m?.[1] as RiskLevel) ?? 'Medium';
}

function extractMitre(content: string): string[] {
  return [...new Set(content.match(/T\d{4}(?:\.\d{3})?/g) ?? [])];
}

function extractRegistryPath(content: string): string {
  const sec = extractSection(content, 'Registry');
  return sec.match(/(HK(?:LM|CU|EY_[A-Z_]+)\\[^\n`]+)/)?.[1]?.trim() ?? '';
}

function extractRegistryValue(content: string): string {
  const sec = extractSection(content, 'Registry');
  const code = extractCodeBlock(sec);
  const lines = code.split('\n').filter(l => l.includes('=') && !l.trim().startsWith('HK'));
  return lines.slice(0, 4).join('\n');
}

function extractOmaUri(content: string): string {
  return (
    content.match(/`(\.\/Device\/Vendor\/MSFT[^`]+)`/)?.[1]?.trim() ??
    content.match(/(\.\/Device\/Vendor\/MSFT[^\n]+)/)?.[1]?.trim() ??
    'No direct OMA-URI'
  );
}

function extractPowershell(content: string): string {
  return extractCodeBlock(extractSection(content, 'PowerShell'));
}

function extractDescription(content: string): string {
  const sec = extractSection(content, 'Description');
  const clean = sec.replace(/###.*/g, '').trim();
  return clean.split(/\n\n/).find(p => p.trim()) ?? '';
}

function extractCompliance(content: string): string[] {
  const patterns = [
    /CIS[\w\s\.\-]*?\d[\w\.\-]*/g,
    /DISA STIG[\w\s\.\-]*/g,
    /NIST[\s\w\.\-]+/g,
    /GDPR[\s\w\.\-]+/g,
    /CISA[\s\w\.\-]+/g,
    /MS Security Baseline/g,
    /PCI[\-\s]DSS/g,
  ];
  const found: string[] = [];
  for (const re of patterns) {
    for (const m of content.matchAll(re)) {
      const v = m[0].trim().replace(/\.$/, '');
      if (!found.includes(v) && v.length < 60) found.push(v);
    }
  }
  return found.slice(0, 6);
}

function deriveCategory(filePath: string): string {
  // filePath like: policies/edge/EDGE-001.md
  //            or: policies/windows/firewall/WIN-xxx.md
  const parts = filePath.split('/');
  const top = parts[1];
  if (top === 'windows' && parts.length >= 4) {
    return SUB_CAT[parts[2]] ?? 'Windows Security';
  }
  return TOP_CAT[top] ?? 'Windows Security';
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchAllPolicies(): Promise<Policy[]> {
  const mdFiles = await collectMdFiles('policies');

  const policies = await Promise.all(
    mdFiles.map(async (entry): Promise<Policy | null> => {
      if (!entry.download_url) return null;
      const content = await fetchRaw(entry.download_url);
      if (!content.trim()) return null;

      const id          = extractId(content, entry.name);
      const name        = extractName(content, entry.name);
      const category    = deriveCategory(entry.path);
      const risk_level  = extractRisk(content);
      const mitre       = extractMitre(content);
      const reg_path    = extractRegistryPath(content);
      const reg_val     = extractRegistryValue(content);
      const oma         = extractOmaUri(content);
      const ps          = extractPowershell(content);
      const description = extractDescription(content);
      const compliance  = extractCompliance(content);
      const raw         = [id, name, category, ...mitre, reg_path, oma, description]
        .join(' ')
        .slice(0, 400);

      return {
        id,
        name,
        category,
        risk_level,
        mitre,
        registry_path:  reg_path,
        registry_value: reg_val,
        oma_uri:        oma,
        powershell:     ps,
        description,
        compliance,
        applies_to:     'Windows 10+ / Server 2016+',
        raw,
        source_url:     entry.html_url,
      };
    }),
  );

  return policies
    .filter((p): p is Policy => p !== null)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function getCategories(policies: Policy[]): Promise<string[]> {
  return [...new Set(policies.map(p => p.category))].sort();
}
