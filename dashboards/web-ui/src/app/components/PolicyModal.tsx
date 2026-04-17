'use client';
import { useEffect, useCallback, useState } from 'react';
import { type Policy } from '@/lib/policies';

const RISK_COLOR: Record<string, string> = {
  Critical: 'var(--critical)',
  High:     'var(--high)',
  Medium:   'var(--medium)',
  Low:      'var(--low)',
};

type Tab = 'overview' | 'registry' | 'powershell' | 'intune';

export default function PolicyModal({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',   label: 'Overview'   },
    { key: 'registry',   label: 'Registry'   },
    { key: 'powershell', label: 'PowerShell' },
    { key: 'intune',     label: 'Intune OMA' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:'fixed', inset:0, zIndex:100,
        background:'rgba(0,0,0,0.7)',
        backdropFilter:'blur(4px)',
        WebkitBackdropFilter:'blur(4px)',
      }} />

      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-label={policy.name} style={{
        position:'fixed', top:'50%', left:'50%', zIndex:101,
        transform:'translate(-50%,-50%)',
        width:'min(720px, 95vw)', maxHeight:'90dvh',
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-xl)', boxShadow:'var(--shadow-3)',
        display:'flex', flexDirection:'column',
        animation:'fadeUp 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{ padding:'var(--space-5) var(--space-6)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'var(--space-3)' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', marginBottom:'var(--space-2)' }}>
                <span style={{ fontSize:'var(--text-xs)', fontFamily:'monospace', fontWeight:700, color:'var(--text-faint)' }}>{policy.id}</span>
                <span style={{
                  fontSize:'var(--text-xs)', fontWeight:700, padding:'2px 8px',
                  borderRadius:'var(--radius-full)',
                  background:`${RISK_COLOR[policy.risk]}20`,
                  color: RISK_COLOR[policy.risk],
                  border:`1px solid ${RISK_COLOR[policy.risk]}40`,
                }}>{policy.risk}</span>
              </div>
              <h2 style={{ fontSize:'var(--text-lg)', fontWeight:700, color:'var(--text)', lineHeight:1.2 }}>{policy.name}</h2>
            </div>
            <button onClick={onClose} aria-label="Close"
              style={{ padding:6, borderRadius:'var(--radius-md)', background:'transparent',
                border:'1px solid var(--border)', color:'var(--text-muted)', cursor:'pointer', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* MITRE tags */}
          <div style={{ display:'flex', gap:'var(--space-2)', marginTop:'var(--space-3)', flexWrap:'wrap' }}>
            {policy.mitre.map(t => (
              <a key={t} href={`https://attack.mitre.org/techniques/${t.replace('.','/')}/`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:11, padding:'2px 8px',
                  background:'rgba(0,120,212,0.12)', color:'var(--primary)',
                  border:'1px solid rgba(0,120,212,0.25)',
                  borderRadius:'var(--radius-sm)', textDecoration:'none', fontFamily:'monospace', fontWeight:600 }}>
                {t} ↗
              </a>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:2, padding:'var(--space-3) var(--space-6) 0', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                padding:'var(--space-2) var(--space-4)',
                fontSize:'var(--text-xs)', fontWeight:600, cursor:'pointer',
                background:'transparent', border:'none',
                borderBottom: tab === key ? `2px solid var(--primary)` : '2px solid transparent',
                color: tab === key ? 'var(--text)' : 'var(--text-muted)',
                marginBottom:-1, transition:'color 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding:'var(--space-5) var(--space-6)', overflowY:'auto', flex:1 }}>

          {tab === 'overview' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
              <Section title="Description">
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', lineHeight:1.65 }}>{policy.description}</p>
              </Section>
              <Section title="Applies To">
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>{policy.appliesTo}</p>
              </Section>
              <Section title="Compliance References">
                <div style={{ display:'flex', gap:'var(--space-2)', flexWrap:'wrap' }}>
                  {policy.compliance.map(c => (
                    <span key={c} style={{ fontSize:'var(--text-xs)', padding:'3px 10px',
                      background:'var(--surface-2)', border:'1px solid var(--border)',
                      borderRadius:'var(--radius-full)', color:'var(--text-muted)' }}>{c}</span>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {tab === 'registry' && (
            <CodeBlock label="Registry" code={policy.registry} onCopy={() => copy(policy.registry, 'registry')} copied={copied === 'registry'} />
          )}

          {tab === 'powershell' && (
            <CodeBlock label="PowerShell" code={policy.powershell} onCopy={() => copy(policy.powershell, 'ps')} copied={copied === 'ps'} />
          )}

          {tab === 'intune' && (
            <CodeBlock label="Intune OMA-URI" code={policy.oma} onCopy={() => copy(policy.oma, 'oma')} copied={copied === 'oma'} />
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{ fontSize:'var(--text-xs)', fontWeight:700, color:'var(--text-faint)',
        textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'var(--space-2)' }}>{title}</h4>
      {children}
    </div>
  );
}

function CodeBlock({ label, code, onCopy, copied }: {
  label: string; code: string; onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-2)' }}>
        <span style={{ fontSize:'var(--text-xs)', color:'var(--text-faint)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</span>
        <button onClick={onCopy}
          style={{ fontSize:'var(--text-xs)', padding:'3px 10px',
            background: copied ? 'rgba(34,197,94,0.15)' : 'var(--surface-2)',
            border:`1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
            color: copied ? 'var(--low)' : 'var(--text-muted)',
            borderRadius:'var(--radius-sm)', cursor:'pointer', transition:'all 0.2s',
            display:'flex', alignItems:'center', gap:4 }}>
          {copied
            ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
            : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
          }
        </button>
      </div>
      <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{code}</pre>
    </div>
  );
}