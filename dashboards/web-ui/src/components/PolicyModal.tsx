"use client";

import { useEffect } from 'react';
import type { Policy } from '@/lib/policies';

interface Props {
  policy: Policy;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onClose: () => void;
}

export default function PolicyModal({ policy, copiedKey, onCopy, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Policy details: ${policy.id}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%', maxWidth: 760,
        maxHeight: '90dvh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        }}>
          <code style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 700,
            color: 'var(--primary)', background: 'var(--primary-light)',
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
          }}>
            {policy.id}
          </code>
          <h2 style={{ flex: 1, fontSize: 'var(--text-lg)', fontWeight: 600, lineHeight: 1.3, minWidth: 0 }}>
            {policy.name}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', color: 'var(--text-muted)',
              flexShrink: 0, transition: 'background var(--transition)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {policy.registry_path && policy.registry_value && (
              <CopyBlock
                label="Registry Path"
                value={`${policy.registry_path}\\${policy.registry_value}`}
                copyKey={`modal-reg-${policy.id}`}
                copiedKey={copiedKey}
                onCopy={onCopy}
              />
            )}
            {policy.oma_uri && (
              <CopyBlock
                label="OMA-URI"
                value={policy.oma_uri}
                copyKey={`modal-oma-${policy.id}`}
                copiedKey={copiedKey}
                onCopy={onCopy}
              />
            )}
          </div>

          {policy.powershell && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  PowerShell
                </span>
                <CopyIconButton
                  value={policy.powershell}
                  copyKey={`modal-ps-${policy.id}`}
                  copiedKey={copiedKey}
                  onCopy={onCopy}
                  label="Copy PowerShell"
                />
              </div>
              <pre style={{
                background: 'var(--surface-offset)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                color: 'var(--text)', overflowX: 'auto', lineHeight: 1.7,
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {policy.powershell}
              </pre>
            </div>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
          }}>
            <MetaItem label="Risk Level" value={policy.risk_level} />
            <MetaItem label="Category" value={Array.isArray(policy.category) ? policy.category.join(', ') : policy.category} />
            {policy.mitre && (
              <MetaItem
                label="MITRE ATT&CK"
                value={
                  <a href={`https://attack.mitre.org/techniques/${policy.mitre}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                    {policy.mitre} \u2197
                  </a>
                }
              />
            )}
            {policy.test_status && <MetaItem label="Test Status" value={policy.test_status} />}
            {policy.applies_to && (
              <MetaItem label="Applies To" value={(policy.applies_to as string[]).join(', ')} />
            )}
          </div>

          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 'var(--space-3)' }}>
              Full Policy
            </div>
            <div style={{
              fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
              maxHeight: 320, overflowY: 'auto',
            }}>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {policy.raw.replace(/^---[\s\S]+?---\n/, '')}
              </pre>
            </div>
          </div>

          <a
            href={`https://github.com/SamoTech/PolicyForge/blob/main/policies/${policy.slug}.md`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            View source on GitHub
          </a>
        </div>
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
      flex: '1 1 260px',
      background: 'var(--surface-offset)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)',
    }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
        background: copiedKey === copyKey ? 'var(--primary-light)' : 'var(--surface-2)',
        color: copiedKey === copyKey ? 'var(--primary)' : 'var(--text-faint)',
        border: '1px solid var(--border)',
        transition: 'background var(--transition), color var(--transition)',
        fontSize: 'var(--text-xs)',
      }}
    >
      {copiedKey === copyKey
        ? '\u2713'
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
      }
    </button>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface-offset)', border: '1px solid var(--divider)',
      borderRadius: 'var(--radius-md)', padding: 'var(--space-3)',
    }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>
        {value}
      </div>
    </div>
  );
}
