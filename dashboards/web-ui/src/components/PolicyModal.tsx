'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Policy } from '@/lib/policies';

const RISK_COLOR: Record<string, string> = {
  Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e',
};

type Tab = 'registry' | 'powershell' | 'intune';

export default function PolicyModal({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  const [tab, setTab]       = useState<Tab>('registry');
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const tabContent: Record<Tab, string> = {
    registry:   policy.registry,
    powershell: policy.powershell,
    intune:     policy.oma,
  };

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(tabContent[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [tab, tabContent]);

  const riskColor = RISK_COLOR[policy.risk];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeUp 0.2s ease both',
        }}
      />

      {/* Modal */}
      <div
        role="dialog" aria-modal="true" aria-label={policy.name}
        style={{
          position: 'fixed', inset: 0, zIndex: 101,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-4)',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          pointerEvents: 'all',
          background: 'var(--surface)',
          border: '1px solid var(--border-hover)',
          borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: 680,
          maxHeight: '90dvh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-3)',
          animation: 'fadeUp 0.25s cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* Header */}
          <div style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                <code style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  {policy.id}
                </code>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: riskColor, background: `${riskColor}1a`, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  {policy.risk} Risk
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {policy.category}
                </span>
              </div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                {policy.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                color: 'var(--text-muted)', padding: 'var(--space-1)', borderRadius: 'var(--radius-md)',
                flexShrink: 0, lineHeight: 0,
                transition: 'color 0.18s, background 0.18s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-5) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Description */}
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {policy.description}
            </p>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <MetaBox label="Applies To" value={policy.appliesTo} />
              <MetaBox label="Compliance" value={policy.compliance.join(' · ')} mono />
            </div>

            {/* MITRE */}
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                MITRE ATT&CK
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {policy.mitre.map(t => (
                  <a
                    key={t}
                    href={`https://attack.mitre.org/techniques/${t.replace('.', '/')}/`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      color: '#3b82f6', background: 'rgba(59,130,246,0.1)',
                      padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      textDecoration: 'none', fontFamily: 'monospace',
                      border: '1px solid rgba(59,130,246,0.2)',
                      transition: 'background 0.18s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.1)'}
                  >
                    {t} ↗
                  </a>
                ))}
              </div>
            </div>

            {/* Code tabs */}
            <div>
              {/* Tab bar */}
              <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-2)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-1)' }}>
                {(['registry', 'powershell', 'intune'] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      padding: 'var(--space-1) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                      background: tab === t ? 'var(--primary-light)' : 'transparent',
                      transition: 'color 0.18s, background 0.18s',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t === 'intune' ? 'Intune OMA-URI' : t === 'powershell' ? 'PowerShell' : 'Registry'}
                  </button>
                ))}
              </div>

              {/* Code block */}
              <div style={{ position: 'relative' }}>
                <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.65 }}>
                  <code>{tabContent[tab]}</code>
                </pre>
                <button
                  onClick={copy}
                  style={{
                    position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)',
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    color: copied ? '#22c55e' : 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 10px',
                    transition: 'color 0.18s',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

function MetaBox({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: mono ? 'monospace' : undefined }}>
        {value}
      </p>
    </div>
  );
}