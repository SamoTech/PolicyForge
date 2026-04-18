'use client';

import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { RISK_LEVELS, type Policy, type RiskLevel } from '@/lib/policies';
import PolicyCard from '@/components/PolicyCard';
import PolicyModal from '@/components/PolicyModal';
import StatsBar from '@/components/StatsBar';

export default function PolicyList({
  policies,
  categories,
}: {
  policies:   Policy[];
  categories: string[];
}) {
  const fuse = useMemo(
    () =>
      new Fuse(policies, {
        keys: [
          { name: 'id',             weight: 0.35 },
          { name: 'name',           weight: 0.30 },
          { name: 'description',    weight: 0.15 },
          { name: 'registry_path',  weight: 0.08 },
          { name: 'registry_value', weight: 0.05 },
          { name: 'oma_uri',        weight: 0.04 },
          { name: 'raw',            weight: 0.03 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [policies],
  );

  const [query, setQuery]       = useState('');
  const [catFilter, setCat]     = useState('All');
  const [riskFilter, setRisk]   = useState('All');
  const [selected, setSelected] = useState<Policy | null>(null);

  const results = useMemo(() => {
    let list = query.trim() ? fuse.search(query).map(r => r.item) : policies;
    if (catFilter  !== 'All') list = list.filter(p => p.category === catFilter);
    if (riskFilter !== 'All') list = list.filter(p => p.risk_level === riskFilter);
    return list;
  }, [query, catFilter, riskFilter, fuse, policies]);

  const close = useCallback(() => setSelected(null), []);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(13,13,15,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: 'var(--space-3) var(--space-6)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}>
          {/* Logo */}
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-label="PolicyForge logo">
              <rect width="10" height="10" fill="#f25022"/>
              <rect x="12" width="10" height="10" fill="#7fba00"/>
              <rect y="12" width="10" height="10" fill="#00a4ef"/>
              <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
            </svg>
            <span style={{ fontWeight:700, fontSize:'var(--text-sm)', color:'var(--text)', letterSpacing:'-0.01em' }}>
              PolicyForge
            </span>
          </a>

          {/* Search */}
          <div style={{ flex:1, minWidth:200, position:'relative' }}>
            <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-faint)' }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Search policies, registry, MITRE, OMA-URI…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width:'100%', paddingLeft:32, paddingRight:12,
                paddingTop:'var(--space-2)', paddingBottom:'var(--space-2)',
                background:'var(--surface-2)', border:'1px solid var(--border)',
                borderRadius:'var(--radius-md)', color:'var(--text)',
                fontSize:'var(--text-sm)', outline:'none',
                transition:'border-color 0.18s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Filters */}
          <Select value={catFilter}  onChange={setCat}  options={['All', ...categories]} label="Category" />
          <Select value={riskFilter} onChange={setRisk} options={['All', ...RISK_LEVELS]} label="Risk" />

          {/* Source link */}
          <a href="https://github.com/SamoTech/PolicyForge" target="_blank" rel="noopener noreferrer"
            style={{
              display:'flex', alignItems:'center', gap:6, fontSize:'var(--text-xs)',
              color:'var(--text-muted)', textDecoration:'none', flexShrink:0,
              padding:'var(--space-2) var(--space-3)',
              border:'1px solid var(--border)', borderRadius:'var(--radius-md)',
              transition:'border-color 0.18s, color 0.18s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border-hover)'; (e.currentTarget as HTMLElement).style.color='var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text-muted)'; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </a>
        </div>
      </header>

      <StatsBar policies={policies} shown={results.length} />

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'var(--space-6)' }}>
        {results.length === 0 ? (
          <div style={{ textAlign:'center', padding:'var(--space-12) 0', color:'var(--text-muted)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ margin:'0 auto var(--space-4)', color:'var(--text-faint)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p style={{ fontSize:'var(--text-base)', fontWeight:500, color:'var(--text-muted)' }}>No policies match your search</p>
            <p style={{ fontSize:'var(--text-sm)', color:'var(--text-faint)', marginTop:'var(--space-1)' }}>
              Try a registry path, MITRE technique ID, or policy name
            </p>
          </div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
            gap:'var(--space-4)',
          }}>
            {results.map((p, i) => (
              <PolicyCard key={p.id} policy={p} index={i} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}
      </main>

      {selected && <PolicyModal policy={selected} onClose={close} />}
    </>
  );
}

function Select({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void; options: string[]; label: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      aria-label={label}
      style={{
        padding:'var(--space-2) var(--space-3)',
        background:'var(--surface-2)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-md)', color:'var(--text)',
        fontSize:'var(--text-xs)', cursor:'pointer', outline:'none',
      }}>
      {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label}` : o}</option>)}
    </select>
  );
}
