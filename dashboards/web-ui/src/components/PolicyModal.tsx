'use client';

import { useEffect, useState } from 'react';
import type { Policy } from '@/lib/policies';

interface Props {
  policy: Policy;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onClose: () => void;
}

type Tab = 'overview' | 'registry' | 'powershell' | 'raw';

export default function PolicyModal({ policy, copiedKey, onCopy, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'overview',   label: 'Overview',   show: true },
    { id: 'registry',   label: 'Registry',   show: !!(policy.registry_path || policy.oma_uri) },
    { id: 'powershell', label: 'PowerShell', show: !!policy.powershell },
    { id: 'raw',        label: 'Raw',        show: true },
  ].filter((t) => t.show);

  const riskKey = policy.risk_level.toLowerCase();

  return (
    <div
      role="dialog" aria-modal="true" aria-label={`Policy: ${policy.id}`}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(2px)' }}
      />

      {/* Panel — slides in from right */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-64)',
        width: '100%', maxWidth: 680,
        height: '100dvh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideIn 180ms cubic-bezier(0.1, 0.9, 0.2, 1)',
      }}>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(48px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Panel header */}
        <div style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
          background: 'var(--surface)',
          borderTop: `3px solid var(--risk-${riskKey}-bar, var(--primary))`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
              <code style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700,
                color: 'var(--primary)', background: 'var(--primary-light)',
                padding: '3px 9px', borderRadius: 'var(--radius-sm)',
              }}>
                {policy.id}
              </code>
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, padding: '3px 9px',
                borderRadius: 'var(--radius-sm)', textTransform: 'capitalize',
                background: `var(--risk-${riskKey}-bg)`, color: `var(--risk-${riskKey}-txt)`,
              }}>
                {policy.risk_level}
              </span>
              {policy.test_status?.includes('✅') && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', fontWeight: 500 }}>✅ Tested</span>
              )}
            </div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, lineHeight: 1.3, color: 'var(--text)', margin: 0 }}>
              {policy.name}
            </h2>
          </div>
          <button
            onClick={onClose} aria-label="Close panel"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 'var(--radius-sm)', flexShrink: 0,
              border: '1px solid var(--border)', color: 'var(--text-muted)',
              background: 'var(--surface-offset)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border)',
          padding: '0 var(--space-5)', background: 'var(--surface)',
          overflowX: 'auto',
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -1, flexShrink: 0, whiteSpace: 'nowrap',
                background: 'transparent',
                transition: 'color var(--transition)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)' }}>

          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
              }}>
                <MetaCard label="Risk Level" value={policy.risk_level} capitalize />
                <MetaCard label="Category" value={Array.isArray(policy.category) ? policy.category.join(', ') : policy.category} />
                {policy.applies_to && <MetaCard label="Applies To" value={(policy.applies_to as string[]).join(', ')} />}
                {policy.mitre && (
                  <MetaCard label="MITRE ATT&CK" value={
                    <a href={`https://attack.mitre.org/techniques/${policy.mitre}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      {policy.mitre} ↗
                    </a>
                  } />
                )}
                {policy.test_status && <MetaCard label="Test Status" value={policy.test_status} />}
                {policy.dir && <MetaCard label="Source Path" value={policy.dir} mono />}
              </div>

              <a
                href={`https://github.com/SamoTech/PolicyForge/blob/main/policies/${policy.slug}.md`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--primary)', color: 'white',
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                  fontWeight: 500, textDecoration: 'none', alignSelf: 'flex-start',
                  transition: 'background var(--transition)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                View on GitHub
              </a>
            </div>
          )}

          {tab === 'registry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {policy.registry_path && (
                <CopyBlock
                  label="Registry Path"
                  value={`${policy.registry_path}\\${policy.registry_value}`}
                  copyKey={`modal-reg-${policy.id}`}
                  copiedKey={copiedKey} onCopy={onCopy}
                />
              )}
              {policy.registry_value && (
                <CopyBlock label="Value Name" value={policy.registry_value}
                  copyKey={`modal-rv-${policy.id}`} copiedKey={copiedKey} onCopy={onCopy} />
              )}
              {policy.registry_data && (
                <CopyBlock label="Value Data" value={policy.registry_data}
                  copyKey={`modal-rd-${policy.id}`} copiedKey={copiedKey} onCopy={onCopy} />
              )}
              {policy.oma_uri && (
                <CopyBlock label="OMA-URI" value={policy.oma_uri}
                  copyKey={`modal-oma-${policy.id}`} copiedKey={copiedKey} onCopy={onCopy} />
              )}
            </div>
          )}

          {tab === 'powershell' && policy.powershell && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <CopyIconButton
                  value={policy.powershell}
                  copyKey={`modal-ps-${policy.id}`}
                  copiedKey={copiedKey} onCopy={onCopy}
                  label="Copy PowerShell"
                />
              </div>
              <pre style={{
                background: '#1e1e1e', color: '#d4d4d4',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {policy.powershell}
              </pre>
            </div>
          )}

          {tab === 'raw' && (
            <pre style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)', lineHeight: 1.7,
              background: 'var(--surface-offset)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              overflowX: 'auto',
            }}>
              {policy.raw.replace(/^---[\s\S]+?---\n/, '')}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value, capitalize, mono }: {
  label: string;
  value: React.ReactNode;
  capitalize?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--surface-offset)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
    }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{
        fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)',
        textTransform: capitalize ? 'capitalize' : 'none',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value}
      </div>
    </div>
  );
}

function CopyBlock({ label, value, copyKey, copiedKey, onCopy }: {
  label: string; value: string; copyKey: string;
  copiedKey: string | null; onCopy: (v: string, k: string) => void;
}) {
  return (
    <div style={{
      background: 'var(--surface-offset)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
    }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <code style={{
          flex: 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value}
        </code>
        <CopyIconButton value={value} copyKey={copyKey} copiedKey={copiedKey} onCopy={onCopy} label={`Copy ${label}`} />
      </div>
    </div>
  );
}

function CopyIconButton({ value, copyKey, copiedKey, onCopy, label }: {
  value: string; copyKey: string; copiedKey: string | null;
  onCopy: (v: string, k: string) => void; label: string;
}) {
  return (
    <button
      onClick={() => onCopy(value, copyKey)}
      aria-label={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 'var(--radius-sm)', flexShrink: 0,
        background: copiedKey === copyKey ? 'var(--primary-light)' : 'var(--surface-card)',
        color: copiedKey === copyKey ? 'var(--primary)' : 'var(--text-faint)',
        border: '1px solid var(--border)',
        transition: 'background var(--transition), color var(--transition)',
        fontSize: 'var(--text-xs)',
      }}
    >
      {copiedKey === copyKey
        ? '✓'
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
      }
    </button>
  );
}
