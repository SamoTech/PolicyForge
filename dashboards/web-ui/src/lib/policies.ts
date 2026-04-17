// Fetches ALL policy markdown files from the PolicyForge GitHub repo at build time.
// Recursively scans every subdirectory under /policies — picks up new dirs automatically.

export interface Policy {
  id: string;
  name: string;
  title?: string;
  category: string | string[];
  risk_level: string;
  applies_to?: string[];
  mitre?: string;
  test_status?: string;
  raw: string;
  slug: string;
  registry_path?: string;
  registry_value?: string;
  registry_data?: string;
  oma_uri?: string;
  powershell?: string;
  /** Source directory path e.g. policies/windows/security */
  dir?: string;
}

const GITHUB_API = 'https://api.github.com/repos/SamoTech/PolicyForge/contents';
const RAW_BASE   = 'https://raw.githubusercontent.com/SamoTech/PolicyForge/main';

const baseHeaders = (): Record<string, string> =>
  process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};

/** Recursively collect all .md file paths under a given repo path */
async function scanDir(path: string): Promise<string[]> {
  try {
    const res = await fetch(`${GITHUB_API}/${path}`, { headers: baseHeaders() });
    if (!res.ok) return [];
    const entries = await res.json() as { name: string; type: string; path: string }[];
    const results: string[] = [];
    await Promise.all(entries.map(async (entry) => {
      if (entry.type === 'file' && entry.name.endsWith('.md')
          && !entry.name.startsWith('_') && entry.name !== 'README.md') {
        results.push(entry.path);
      } else if (entry.type === 'dir') {
        const sub = await scanDir(entry.path);
        results.push(...sub);
      }
    }));
    return results;
  } catch {
    return [];
  }
}

function extractFrontmatter(raw: string): Record<string, string | string[]> {
  const match = raw.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};
  const fm: Record<string, string | string[]> = {};
  const lines = match[1].split('\n');
  let currentKey = '';
  const arr: string[] = [];
  let inArray = false;

  for (const line of lines) {
    const kv = line.match(/^(\w[\w_-]*):\s*(.*)/);
    if (kv) {
      if (inArray && currentKey) { fm[currentKey] = arr.slice(); arr.length = 0; inArray = false; }
      currentKey = kv[1];
      const val = kv[2].trim();
      if (val === '' || val === '[]') {
        inArray = false;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        fm[currentKey] = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        fm[currentKey] = val.replace(/^["']|["']$/g, '');
        inArray = false;
      }
    } else if (line.match(/^\s+-\s+(.+)/)) {
      const item = line.match(/^\s+-\s+(.+)/)![1].trim();
      arr.push(item);
      inArray = true;
      if (currentKey) fm[currentKey] = arr.slice();
    }
  }
  return fm;
}

function extractRegistryRow(raw: string): { path?: string; value?: string; data?: string } {
  const rowMatch = raw.match(/\|\s*`(HKLM[^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`/);
  if (rowMatch) return { path: rowMatch[1].replace(/\\\\/g, '\\'), value: rowMatch[2], data: rowMatch[3] };
  return {};
}

function extractOmaUri(raw: string): string | undefined {
  const m = raw.match(/OMA-URI:\s*(\.\/(Device|User)\/Vendor\/[^\n`\s]+)/);
  return m ? m[1] : undefined;
}

function extractPowershell(raw: string): string | undefined {
  const m = raw.match(/```powershell\n([\s\S]+?)```/);
  return m ? m[1].trim() : undefined;
}

function inferName(path: string, fm: Record<string, string | string[]>): string {
  if (fm.name && typeof fm.name === 'string') return fm.name;
  if (fm.title && typeof fm.title === 'string') return fm.title;
  const filename = path.split('/').pop()!.replace(/\.md$/, '');
  return filename.replace(/^[A-Z]+-[A-Z]+-\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferRisk(fm: Record<string, string | string[]>, raw: string): string {
  if (fm.risk_level && typeof fm.risk_level === 'string') return fm.risk_level;
  if (fm.risk && typeof fm.risk === 'string') return fm.risk;
  const lower = raw.toLowerCase();
  if (lower.includes('🔴 critical') || lower.includes('risk level:** critical')) return 'critical';
  if (lower.includes('risk level:** high') || lower.includes('🟠 high')) return 'high';
  if (lower.includes('risk level:** medium')) return 'medium';
  return 'medium';
}

const DIR_CATEGORY_MAP: Record<string, string> = {
  security:  'Security',
  bitlocker: 'BitLocker',
  applocker: 'AppLocker',
  asr:       'Attack Surface Reduction',
  defender:  'Defender',
  privacy:   'Privacy',
  network:   'Network',
  logging:   'Logging',
  edge:      'Edge',
  office:    'Office',
  server:    'Server',
  windows:   'Windows',
};

function inferCategory(fm: Record<string, string | string[]>, filePath: string): string | string[] {
  if (fm.category) return fm.category;
  const parts = filePath.split('/');
  const dir = parts[parts.length - 2];
  return DIR_CATEGORY_MAP[dir] ?? 'General';
}

export async function getAllPolicies(): Promise<Policy[]> {
  // Scan the entire policies/ tree recursively
  const allPaths = await scanDir('policies');

  const policies: Policy[] = [];

  await Promise.all(
    allPaths.map(async (filePath) => {
      try {
        const res = await fetch(`${RAW_BASE}/${filePath}`);
        if (!res.ok) return;
        const raw = await res.text();
        const fm  = extractFrontmatter(raw);
        const reg = extractRegistryRow(raw);
        const parts = filePath.split('/');
        const dir = parts.slice(0, -1).join('/');

        policies.push({
          id:            String(fm.id ?? filePath.split('/').pop()!.replace('.md', '').toUpperCase()),
          name:          inferName(filePath, fm),
          title:         fm.title as string | undefined,
          category:      inferCategory(fm, filePath),
          risk_level:    inferRisk(fm, raw),
          applies_to:    fm.applies_to as string[] | undefined,
          mitre:         fm.mitre as string | undefined,
          test_status:   fm.test_status as string | undefined,
          raw,
          slug:          filePath.replace(/^\.?\/?(policies\/)?/, '').replace(/\.md$/, ''),
          registry_path:  reg.path,
          registry_value: reg.value,
          registry_data:  reg.data,
          oma_uri:        extractOmaUri(raw),
          powershell:     extractPowershell(raw),
          dir,
        });
      } catch { /* skip */ }
    })
  );

  const RISK_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return policies.sort((a, b) => {
    const rd = (RISK_ORDER[a.risk_level.toLowerCase()] ?? 9) - (RISK_ORDER[b.risk_level.toLowerCase()] ?? 9);
    return rd !== 0 ? rd : a.id.localeCompare(b.id);
  });
}
