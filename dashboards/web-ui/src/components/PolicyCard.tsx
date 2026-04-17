'use client';

import { type Policy } from '@/lib/policies';

const RISK_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  Critical: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', label: 'Critical' },
  High:     { bg: 'rgba(249,115,22,0.12)', color: '#f97316', label: 'High'     },
  Medium:   { bg: 'rgba(234,179,8,0.12)',  color: '#eab308', label: 'Medium'   },
  Low:      { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', label: 'Low'      },
};

export default function PolicyCard({
  policy, index, onClick, onOpen, copiedKey, onCopy,
}: {
  policy: Policy;
  index?: number;
  onClick?: () => void;
  onOpen?: () => void;
  copiedKey?: string | null;
  onCopy?: (text: string, key: string) => void;
}) {
  const handleClick = onOpen ?? onClick ?? (() => {});
  const rs = RISK_STYLES[policy.risk_level] ?? RISK_STYLES['Low'];

  return (
    <button
      onClick={handleClick}
      className="fade-up"
      style={{
        animationDelay: `${Math.min((index ?? 0) * 30, 300)}ms`,
        textAlign: 'left',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        cursor: 'pointer',
        transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border-hover)';
        el.style.boxShadow = 'var(--shadow-2)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 600,
          color: 'var(--primary)', letterSpacing: '0.04em',
          fontFamily: 'monospace',
        }}>
          {policy.id}
        </span>
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 600,
          background: rs.bg, color: rs.color,
          padding: '2px 8px', borderRadius: 'var(--radius-full)',
          flexShrink: 0,
        }}>
          {rs.label}
        </span>
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: 'var(--text-sm)', fontWeight: 600,
        color: 'var(--text)', lineHeight: 1.35,
      }}>
        {policy.name}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
        lineHeight: 1.6, display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {policy.description}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-1)' }}>
        {/* Category pill */}
        <span style={{
          fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)',
          padding: '2px 8px', borderRadius: 'var(--radius-full)',
        }}>
          {Array.isArray(policy.category) ? policy.category[0] : policy.category}
        </span>

        {/* MITRE badges */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {policy.mitre.slice(0, 2).map(t => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 600,
              color: '#3b82f6',
              background: 'rgba(59,130,246,0.1)',
              padding: '2px 6px', borderRadius: 'var(--radius-full)',
              fontFamily: 'monospace',
            }}>
              {t}
            </span>
          ))}
          {policy.mitre.length > 2 && (
            <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
              +{policy.mitre.length - 2}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
