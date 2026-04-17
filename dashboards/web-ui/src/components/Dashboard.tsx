"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import type { Policy } from '@/lib/policies';
import PolicyCard from './PolicyCard';
import PolicyModal from './PolicyModal';

const RISK_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const ALL_CATEGORIES = [
  'Security', 'BitLocker', 'AppLocker', 'Attack Surface Reduction',
  'Defender', 'Privacy', 'Network', 'Logging',
];

const RISK_LEVELS = ['critical', 'high', 'medium', 'low'];

export default function Dashboard({ policies }: { policies: Policy[] }) {
  const [query, setQuery]         = useState('');
  const [riskFilter, setRisk]     = useState<string[]>([]);
  const [catFilter, setCat]       = useState<string[]>([]);
  const [selected, setSelected]   = useState<Policy | null>(null);
  const [theme, setTheme]         = useState<'light' | 'dark'>('light');
  const [copied, setCopied]       = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(dark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
    let list: Policy[] = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : [...policies];

    if (riskFilter.length > 0) {
      list = list.filter((p) => riskFilter.includes(p.risk_level.toLowerCase()));
    }
    if (catFilter.length > 0) {
      list = list.filter((p) => {
        const cats = Array.isArray(p.category) ? p.category : [p.category];
        return cats.some((c) => catFilter.includes(c));
      });
    }

    if (!query.trim()) {
      list.sort((a, b) =>
        (RISK_ORDER[a.risk_level.toLowerCase()] ?? 9) -
        (RISK_ORDER[b.risk_level.toLowerCase()] ?? 9)
      );
    }

    return list;
  }, [query, riskFilter, catFilter, fuse, policies]);

  const toggleRisk = useCallback((r: string) =>
    setRisk((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]), []);

  const toggleCat = useCallback((c: string) =>
    setCat((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]), []);

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }, []);

  const clearFilters = () => { setQuery(''); setRisk([]); setCat([]); };

  const statsCount = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    policies.forEach((p) => {
      const r = p.risk_level.toLowerCase();
      if (r in counts) counts[r]++;
    });
    return counts;
  }, [policies]);

  const hasFilters = query || riskFilter.length > 0 || catFilter.length > 0;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--space-4) var(--space-8)',
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '0 0 auto' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="PolicyForge" role="img">
            <rect width="28" height="28" rx="7" fill="var(--primary)" />
            <path d="M7 8h14M7 14h9M7 20h11" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="21" cy="20" r="3.5" fill="white" opacity=".9"/>
            <path d="M21 18.5v1.5l1 1" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: '-0.01em' }}>
            PolicyForge
          </span>
          <span style={{
            fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
            padding: '2px var(--space-2)', background: 'var(--surface-offset)',
            borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
          }}>
            {policies.length} policies
          </span>
        </div>

        <div style={{ flex: '1 1 320px', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search policies, registry keys, OMA-URIs… (press / to focus)"
            style={{
              width: '100%', paddingLeft: 38, paddingRight: query ? 38 : 12,
              paddingBlock: 9,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              color: 'var(--text)', transition: 'border-color var(--transition)',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', padding: 2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', color: 'var(--text-muted)',
            background: 'var(--surface-2)', flexShrink: 0,
          }}>
          {theme === 'dark'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          padding: 'var(--space-6) var(--space-4)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-6)',
          position: 'sticky', top: 57, height: 'calc(100dvh - 57px)', overflowY: 'auto',
        }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 'var(--space-3)' }}>
              Risk Overview
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {RISK_LEVELS.map((r) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: riskColor(r) }} />
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', flex: 1 }}>{r}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{statsCount[r] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 'var(--space-3)' }}>
              Filter by Risk
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {RISK_LEVELS.map((r) => (
                <FilterChip key={r} label={r} active={riskFilter.includes(r)} onClick={() => toggleRisk(r)} color={riskColor(r)} />
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 'var(--space-3)' }}>
              Category
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {ALL_CATEGORIES.map((c) => (
                <FilterChip key={c} label={c} active={catFilter.includes(c)} onClick={() => toggleCat(c)} />
              ))}
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} style={{
              fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 500,
              padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)', background: 'var(--primary-light)',
              transition: 'opacity var(--transition)',
            }}>
              Clear all filters
            </button>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--divider)', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
            <a href="https://github.com/SamoTech/PolicyForge" target="_blank" rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              SamoTech/PolicyForge
            </a>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: 'var(--space-6) var(--space-8)', overflowX: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {results.length === policies.length
                ? `All ${policies.length} policies`
                : `${results.length} of ${policies.length} policies`}
              {query && <> matching <strong style={{ color: 'var(--text)' }}>"{query}"</strong></>}
            </span>
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-muted)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ margin: '0 auto var(--space-4)', opacity: .4 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>No policies found</p>
              <p style={{ fontSize: 'var(--text-sm)' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
              gap: 'var(--space-4)',
            }}>
              {results.map((p) => (
                <PolicyCard
                  key={p.id}
                  policy={p}
                  copiedKey={copied}
                  onCopy={copyToClipboard}
                  onOpen={() => setSelected(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selected && (
        <PolicyModal
          policy={selected}
          copiedKey={copied}
          onCopy={copyToClipboard}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function riskColor(r: string): string {
  const map: Record<string, string> = {
    critical: '#ef4444',
    high:     '#f97316',
    medium:   '#eab308',
    low:      '#22c55e',
  };
  return map[r.toLowerCase()] ?? '#94a3b8';
}

function FilterChip({ label, active, onClick, color }: {
  label: string; active: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: '5px var(--space-3)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-xs)',
        fontWeight: active ? 600 : 400,
        background: active ? 'var(--primary-light)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        border: `1px solid ${active ? 'var(--primary)' : 'transparent'}`,
        cursor: 'pointer',
        textAlign: 'left',
        textTransform: 'capitalize',
        transition: 'background var(--transition), color var(--transition)',
        width: '100%',
      }}
    >
      {color && <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? color : 'var(--text-faint)', flexShrink: 0 }} />}
      {label}
    </button>
  );
}
