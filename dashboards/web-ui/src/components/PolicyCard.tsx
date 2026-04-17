'use client';

import type { Policy } from '@/lib/policies';
import { RiskBadge } from './Dashboard';

interface Props {
  policy: Policy;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onOpen: () => void;
}

export default function PolicyCard({ policy, copiedKey, onCopy, onOpen }: Props) {
  const riskKey = policy.risk_level.toLowerCase();
  const riskBar = `var(--risk-${riskKey}-bar, var(--primary))`;
  const cats = Array.isArray(policy.category) ? policy.category : [policy.category];

  return (
    <article
      onClick={onOpen}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${riskBar}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'box-shadow var(--transition), border-color var(--transition)',
        boxShadow: 'var(--shadow-2)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-8)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-2)';
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <code style={{
          fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)',
          color: 'var(--primary)', fontWeight: 600,
          background: 'var(--primary-light)', padding: '2px 7px',
          borderRadius: 'var(--radius-sm)', flexShrink: 0,
        }}>
          {policy.id}
        </code>
        <RiskBadge risk={policy.risk_level} />
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.35,
        color: 'var(--text)', margin: 0,
      }}>
        {policy.name}
      </h2>

      {/* Category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
        {cats.slice(0, 3).map((c) => (
          <span key={c} style={{
            fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
            background: 'var(--surface-offset)', padding: '2px 8px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
          }}>{c}</span>
        ))}
      </div>

      {/* Registry row */}
      {policy.registry_path && (
        <div style={{
          background: 'var(--surface-offset)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)',
        }}>
          <code style={{
            fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)', flex: 1, minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {policy.registry_value} = {policy.registry_data}
          </code>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(`${policy.registry_path}\\${policy.registry_value}`, `reg-${policy.id}`); }}
            title="Copy registry path" aria-label="Copy registry path"
            style={{
              padding: '3px 6px', borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: copiedKey === `reg-${policy.id}` ? 'var(--primary-light)' : 'var(--surface-card)',
              color: copiedKey === `reg-${policy.id}` ? 'var(--primary)' : 'var(--text-faint)',
              border: '1px solid var(--border)', fontSize: 'var(--text-xs)',
              transition: 'background var(--transition), color var(--transition)',
            }}
          >
            {copiedKey === `reg-${policy.id}` ? '✓' : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {policy.mitre && (
            <a
              href={`https://attack.mitre.org/techniques/${policy.mitre}`}
              target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
            >
              {policy.mitre}
            </a>
          )}
          {policy.test_status?.includes('✅') && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)' }}>✅ Tested</span>
          )}
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          Details
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h6M5 2l3 3-3 3"/></svg>
        </span>
      </div>
    </article>
  );
}
