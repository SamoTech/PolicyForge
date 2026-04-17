'use client';
import { type Policy } from '@/lib/policies';

const RISK_COLOR: Record<string, string> = {
  Critical: 'var(--critical)',
  High:     'var(--high)',
  Medium:   'var(--medium)',
  Low:      'var(--low)',
};
const CAT_ICON: Record<string, string> = {
  'Windows Security':   '🛡️',
  'Microsoft Defender': '🔵',
  'Microsoft Edge':     '🌐',
  'Microsoft Office':   '📄',
  'Windows Privacy':    '🔒',
  'Windows Network':    '🔌',
};

export default function PolicyCard({ policy, index, onClick }: {
  policy: Policy; index: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="fade-up"
      style={{
        animationDelay: `${Math.min(index * 30, 300)}ms`,
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border-hover)';
        el.style.boxShadow = 'var(--shadow-2)';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'var(--space-3)', gap:'var(--space-2)' }}>
        <span style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--text-faint)', fontFamily:'monospace', letterSpacing:'0.04em' }}>
          {policy.id}
        </span>
        <span style={{
          fontSize:'var(--text-xs)', fontWeight:700, padding:'2px 8px',
          borderRadius:'var(--radius-full)',
          background: `${RISK_COLOR[policy.risk]}20`,
          color: RISK_COLOR[policy.risk],
          border: `1px solid ${RISK_COLOR[policy.risk]}40`,
          whiteSpace:'nowrap', flexShrink:0,
        }}>
          {policy.risk}
        </span>
      </div>

      {/* Name */}
      <h3 style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text)', marginBottom:'var(--space-2)', lineHeight:1.35 }}>
        {policy.name}
      </h3>

      {/* Description */}
      <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', lineHeight:1.55, marginBottom:'var(--space-4)',
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {policy.description}
      </p>

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'var(--space-2)' }}>
        <span style={{ fontSize:'var(--text-xs)', color:'var(--text-faint)' }}>
          {CAT_ICON[policy.category] ?? '📋'} {policy.category}
        </span>
        <div style={{ display:'flex', gap:'var(--space-1)', flexWrap:'wrap' }}>
          {policy.mitre.slice(0,2).map(t => (
            <span key={t} style={{
              fontSize: 10, padding:'1px 6px',
              background:'rgba(0,120,212,0.12)', color:'var(--primary)',
              border:'1px solid rgba(0,120,212,0.2)',
              borderRadius:'var(--radius-sm)', fontFamily:'monospace', fontWeight:600,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </button>
  );
}