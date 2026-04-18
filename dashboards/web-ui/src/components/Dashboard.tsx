'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import type { Policy } from '@/lib/policies';
import PolicyCard from './PolicyCard';
import PolicyModal from './PolicyModal';

const RISK_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const RISK_LEVELS = ['critical', 'high', 'medium', 'low'];

const RISK_COLORS: Record<string, string> = {
  critical: 'var(--risk-critical-bar)',
  high:     'var(--risk-high-bar)',
  medium:   'var(--risk-medium-bar)',
  low:      'var(--risk-low-bar)',
};

export default function Dashboard({ policies }: { policies: Policy[] }) {
  const [query, setQuery]       = useState('');
  const [riskFilter, setRisk]   = useState<string[]>([]);
  const [catFilter, setCat]     = useState<string[]>([]);
  const [selected, setSelected] = useState<Policy | null>(null);
  const [theme, setTheme]       = useState<'light' | 'dark'>('light');
  const [viewMode, setView]     = useState<'grid' | 'list'>('grid');
  // navOpen starts false (safe for SSR); useEffect sets real value after mount
  const [navOpen, setNavOpen]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    policies.forEach((p) => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      cats.forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [policies]);

  // Theme — runs only on client
  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(dark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Nav + mobile breakpoint — single source of truth, purely in useEffect
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = (mobile: boolean) => {
      setIsMobile(mobile);
      setNavOpen(!mobile); // desktop → open by default; mobile → closed
    };
    apply(mq.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault(); searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (selected) { setSelected(null); return; }
        if (isMobile && navOpen) setNavOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, isMobile, navOpen]);

  const fuse = useMemo(() => new Fuse(policies, {
    keys: [
      { name: 'id',             weight: 0.35 },
      { name: 'name',           weight: 0.30 },
      { name: 'registry_path',  weight: 0.10 },
      { name: 'registry_value', weight: 0.10 },
      { name: 'oma_uri',        weight: 0.08 },
      { name: 'raw',            weight: 0.07 },
    ],
    threshold: 0.35,
    includeScore: true,
  }), [policies]);

  const results = useMemo(() => {
    let list: Policy[] = query.trim() ? fuse.search(query).map((r) => r.item) : [...policies];
    if (riskFilter.length > 0) list = list.filter((p) => riskFilter.includes(p.risk_level.toLowerCase()));
    if (catFilter.length > 0) list = list.filter((p) => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      return cats.some((c) => catFilter.includes(c));
    });
    if (!query.trim()) list.sort((a, b) =>
      (RISK_ORDER[a.risk_level.toLowerCase()] ?? 9) - (RISK_ORDER[b.risk_level.toLowerCase()] ?? 9));
    return list;
  }, [query, riskFilter, catFilter, fuse, policies]);

  const toggleRisk = useCallback((r: string) =>
    setRisk((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r]), []);
  const toggleCat = useCallback((c: string) =>
    setCat((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]), []);
  const clearFilters = () => { setQuery(''); setRisk([]); setCat([]); };

  const [copied, setCopied] = useState<string | null>(null);
  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key); setTimeout(() => setCopied(null), 1800);
    });
  }, []);

  const statsCount = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    policies.forEach((p) => { const r = p.risk_level.toLowerCase(); if (r in counts) counts[r]++; });
    return counts;
  }, [policies]);

  const hasFilters = query || riskFilter.length > 0 || catFilter.length > 0;

  // Close nav when a filter is picked on mobile
  const handleNavAction = useCallback((fn: () => void) => {
    fn();
    if (isMobile) setNavOpen(false);
  }, [isMobile]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ── TOP BAR ── */}
      <header style={{
        height: 'var(--header-h)',
        background: 'var(--primary)',
        display: 'flex', alignItems: 'center',
        padding: '0 var(--space-4)',
        gap: 'var(--space-3)',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: 'var(--shadow-4)',
      }}>
        <button
          onClick={() => setNavOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M2 4h14M2 9h14M2 14h14"/>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect width="10" height="10" fill="#f25022"/>
            <rect x="12" width="10" height="10" fill="#7fba00"/>
            <rect y="12" width="10" height="10" fill="#00a4ef"/>
            <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
          </svg>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 'var(--text-base)', letterSpacing: '-0.01em' }}>
            PolicyForge
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.3)', flexShrink: 0 }} />

        <div style={{ flex: '1 1 400px', maxWidth: 560, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.7)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search policies, registry keys, OMA-URIs… (press / to focus)"
            style={{
              width: '100%', paddingLeft: 32, paddingRight: query ? 32 : 10,
              paddingBlock: 6,
              background: 'rgba(255,255,255,.18)',
              border: '1px solid rgba(255,255,255,.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              color: 'white',
              transition: 'background var(--transition), border-color var(--transition)',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.7)', padding: 2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.15)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {(['grid', 'list'] as const).map((m) => (
              <button key={m} onClick={() => setView(m)} aria-pressed={viewMode === m}
                aria-label={`${m} view`}
                style={{
                  padding: '5px 8px',
                  background: viewMode === m ? 'rgba(255,255,255,.25)' : 'transparent',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {m === 'grid'
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 3h12M1 7h12M1 11h12"/></svg>
                }
              </button>
            ))}
          </div>

          <button onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 'var(--radius-sm)' }}>
            {theme === 'dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-4)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
        height: 40, overflowX: 'auto',
      }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>
          <strong style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{policies.length}</strong> policies loaded
        </span>
        {RISK_LEVELS.map((r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLORS[r], flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{r}</span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', minWidth: 18 }}>{statsCount[r] ?? 0}</span>
          </div>
        ))}
        {hasFilters && (
          <button onClick={clearFilters}
            style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 500, padding: '2px var(--space-2)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
            Clear filters
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>

        {/* Mobile backdrop — only rendered after mount when isMobile is known */}
        {isMobile && navOpen && (
          <div
            role="presentation"
            onClick={() => setNavOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,.45)',
              zIndex: 39,
              backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* ── LEFT NAV ── */}
        {navOpen && (
          <nav
            aria-label="Filters"
            style={{
              width: 'var(--nav-width)', flexShrink: 0,
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              padding: 'var(--space-4) 0',
              // Desktop: sticky in flow. Mobile: fixed overlay.
              position: isMobile ? 'fixed' : 'sticky',
              left: 0,
              top: isMobile ? 0 : 'calc(var(--header-h) + 40px)',
              height: isMobile ? '100dvh' : 'calc(100dvh - var(--header-h) - 40px)',
              paddingTop: isMobile ? 'calc(var(--header-h) + var(--space-4))' : 'var(--space-4)',
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
              zIndex: 40,
              boxShadow: isMobile ? 'var(--shadow-3)' : 'none',
              transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <NavSection label="Risk Level">
              {RISK_LEVELS.map((r) => (
                <NavItem
                  key={r}
                  label={r}
                  count={statsCount[r] ?? 0}
                  active={riskFilter.includes(r)}
                  onClick={() => handleNavAction(() => toggleRisk(r))}
                  dot={RISK_COLORS[r]}
                />
              ))}
            </NavSection>

            <NavSection label="Category">
              {allCategories.map((c) => (
                <NavItem
                  key={c}
                  label={c}
                  count={policies.filter((p) => {
                    const cats = Array.isArray(p.category) ? p.category : [p.category];
                    return cats.includes(c);
                  }).length}
                  active={catFilter.includes(c)}
                  onClick={() => handleNavAction(() => toggleCat(c))}
                />
              ))}
            </NavSection>

            <div style={{ marginTop: 'auto', padding: 'var(--space-4) var(--space-4) 0', borderTop: '1px solid var(--border)' }}>
              <a
                href="https://github.com/SamoTech/PolicyForge"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)', color: 'var(--text-faint)',
                  textDecoration: 'none', padding: 'var(--space-2) var(--space-3)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                SamoTech/PolicyForge
              </a>
            </div>
          </nav>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: 'var(--space-5) var(--space-6)', overflowX: 'hidden', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {results.length === policies.length
                ? `Showing all ${policies.length} policies`
                : `${results.length} of ${policies.length} results`}
              {query && <> for <strong style={{ color: 'var(--text)' }}>&ldquo;{query}&rdquo;</strong></>}
            </span>
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
                style={{ margin: '0 auto var(--space-4)', color: 'var(--text-faint)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', color: 'var(--text)' }}>No policies found</p>
              <p style={{ fontSize: 'var(--text-sm)' }}>Try adjusting your search terms or clearing the filters.</p>
              {hasFilters && (
                <button onClick={clearFilters}
                  style={{ marginTop: 'var(--space-4)', padding: 'var(--space-2) var(--space-4)', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  Clear all filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
              gap: 'var(--space-3)',
            }}>
              {results.map((p) => (
                <PolicyCard key={p.id} policy={p} copiedKey={copied} onCopy={copyToClipboard} onOpen={() => setSelected(p)} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {results.map((p) => (
                <PolicyListRow key={p.id} policy={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
          )}
        </main>
      </div>

      {selected && (
        <PolicyModal policy={selected} copiedKey={copied} onCopy={copyToClipboard} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 'var(--text-xs)', fontWeight: 600,
        color: 'var(--text-faint)', textTransform: 'uppercase',
        letterSpacing: '.07em', padding: 'var(--space-2) var(--space-4)',
        marginBottom: 'var(--space-1)',
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function NavItem({ label, count, active, onClick, dot }: {
  label: string; count: number; active: boolean; onClick: () => void; dot?: string;
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
      padding: '6px var(--space-4)',
      background: active ? 'var(--primary-light)' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      fontSize: 'var(--text-sm)',
      fontWeight: active ? 600 : 400,
      textAlign: 'left',
      textTransform: 'capitalize',
      transition: 'background var(--transition), color var(--transition)',
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? dot : 'var(--text-faint)', flexShrink: 0, display: 'inline-block' }} />}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 'var(--text-xs)', color: active ? 'var(--primary)' : 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
    </button>
  );
}

function PolicyListRow({ policy, onOpen }: { policy: Policy; onOpen: () => void }) {
  const cats = Array.isArray(policy.category) ? policy.category : [policy.category];
  return (
    <button onClick={onOpen} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      textAlign: 'left',
      transition: 'box-shadow var(--transition), background var(--transition), border-color var(--transition)',
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'var(--shadow-4)';
        el.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'none';
        el.style.borderColor = 'var(--border)';
      }}
    >
      <code style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600, flexShrink: 0, minWidth: 140 }}>{policy.id}</code>
      <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{policy.name}</span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>{cats[0]}</span>
      <RiskBadge risk={policy.risk_level} />
    </button>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  const key = risk.toLowerCase();
  return (
    <span style={{
      fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 8px',
      borderRadius: 'var(--radius-sm)', textTransform: 'capitalize', flexShrink: 0,
      background: `var(--risk-${key}-bg, var(--surface-offset))`,
      color: `var(--risk-${key}-txt, var(--text-muted))`,
    }}>
      {risk}
    </span>
  );
}
