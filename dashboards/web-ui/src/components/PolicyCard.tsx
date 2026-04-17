"use client";

import type { Policy } from '@/lib/policies';

interface Props {
  policy: Policy;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onOpen: () => void;
}

const RISK_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'var(--risk-critical-bg)', text: 'var(--risk-critical-txt)' },
  high:     { bg: 'var(--risk-high-bg)',     text: 'var(--risk-high-txt)' },
  medium:   { bg: 'var(--risk-medium-bg)',   text: 'var(--risk-medium-txt)' },
  low:      { bg: 'var(--risk-low-bg)',      text: 'var(--risk-low-txt)' },
};

export default function PolicyCard({ policy, copiedKey, onCopy, onOpen }: Props) {
  const riskKey = policy.risk_level.toLowerCase();
  const riskStyle = RISK_STYLES[riskKey] ?? { bg: 'var(--surface-offset)', text: 'var(--text-muted)' };
  const cats = Array.isArray(policy.category) ? policy.category : [policy.category];

  return (
    <article
      onClick={onOpen}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'box-shadow var(--transition), border-color var(--transition)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <code style={{
            fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)',
            color: 'var(--primary)', fontWeight: 600,
            background: 'var(--primary-light)', padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
          }}>
            {policy.id}
          </code>
        </div>
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 9px',
          borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '.04em',
          background: riskStyle.bg, color: riskStyle.text, flexShrink: 0,
        }}>
          {policy.risk_level}
        </span>
      </div>

      <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.3, color: 'var(--text)' }}>
        {policy.name}
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
        {cats.slice(0, 3).map((c) => (
          <span key={c} style={{
            fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
            background: 'var(--surface-offset)', padding: '2px 8px',
            borderRadius: 'var(--radius-full)', border: '1px solid var(--divider)',
          }}>{c}</span>
        ))}
      </div>

      {policy.registry_path && (
        <div style={{
          background: 'var(--surface-offset)',
          border: '1px solid var(--divider)',
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
            title="Copy registry path"
            aria-label="Copy registry path"
            style={{
              padding: '3px 6px', borderRadius: 'var(--radius-sm)',
              background: copiedKey === `reg-${policy.id}` ? 'var(--primary-light)' : 'var(--surface-2)',
              color: copiedKey === `reg-${policy.id}` ? 'var(--primary)' : 'var(--text-faint)',
              border: '1px solid var(--border)', flexShrink: 0, fontSize: 'var(--text-xs)',
              transition: 'background var(--transition), color var(--transition)',
            }}
          >
            {copiedKey === `reg-${policy.id}` ? '\u2713' : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {policy.mitre && (
            <a
              href={`https://attack.mitre.org/techniques/${policy.mitre}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
            >
              {policy.mitre}
            </a>
          )}
          {policy.test_status?.includes('\u2705') && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>✅ Tested</span>
          )}
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 500 }}>
          View details →
        </span>
      </div>
    </article>
  );
}
