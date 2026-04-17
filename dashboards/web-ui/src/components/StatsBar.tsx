import { POLICIES } from '@/lib/policies';

const RISK_COLORS: Record<string, string> = {
  Critical: 'var(--critical)',
  High:     'var(--high)',
  Medium:   'var(--medium)',
  Low:      'var(--low)',
};

export default function StatsBar({ total, shown }: { total: number; shown: number }) {
  const counts = ['Critical','High','Medium','Low'].map(r => ({
    r, count: POLICIES.filter(p => p.risk_level === r).length,
  }));

  return (
    <div style={{
      borderBottom:'1px solid var(--border)',
      background:'var(--surface)',
    }}>
      <div style={{
        maxWidth:1200, margin:'0 auto',
        padding:'var(--space-3) var(--space-6)',
        display:'flex', alignItems:'center', gap:'var(--space-6)',
        flexWrap:'wrap',
      }}>
        <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
          <strong style={{ color:'var(--text)', fontVariantNumeric:'tabular-nums' }}>{shown}</strong>
          {shown !== total && <span> of <strong style={{ color:'var(--text)' }}>{total}</strong></span>} policies
        </span>

        <div style={{ display:'flex', gap:'var(--space-4)', flexWrap:'wrap' }}>
          {counts.map(({ r, count }) => (
            <span key={r} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background: RISK_COLORS[r], display:'inline-block', flexShrink:0 }} />
              {r}
              <strong style={{ color:'var(--text)', fontVariantNumeric:'tabular-nums' }}>{count}</strong>
            </span>
          ))}
        </div>

        <span style={{ marginLeft:'auto', fontSize:'var(--text-xs)', color:'var(--text-faint)' }}>
          Phase 3 Web UI · MIT License
        </span>
      </div>
    </div>
  );
}
