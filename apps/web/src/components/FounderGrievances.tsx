import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type GrievanceData = {
  total_open: number;
  total_sla_breaches: number;
  category_summary: Array<{ category: string; count: number; open_count: number | string }>;
  district_heatmap: Array<{ district: string; total: number; open_count: number | string }>;
  sla_breaches: Array<any>;
  top_unresolved: Array<any>;
};

function SummaryBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
    </div>
  );
}

export default function FounderGrievances({ isMob }: { isMob: boolean }) {
  const [data, setData] = useState<GrievanceData | null>(null);

  useEffect(() => {
    api.get('/api/founder-v2/grievances').then((res: any) => setData(res));
  }, []);

  if (!data) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8899bb' }}>Loading grievance command center...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
        <SummaryBox label="Total Open" value={data.total_open} color="#ffa726" />
        <SummaryBox label="SLA Breaches" value={data.total_sla_breaches} color={data.total_sla_breaches ? '#ff5555' : '#00c864'} />
        <SummaryBox label="Categories" value={data.category_summary?.length || 0} color="#42a5f5" />
        <SummaryBox label="Districts Affected" value={data.district_heatmap?.length || 0} color="#ab47bc" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', marginBottom: 12 }}>By Category</div>
          {(data.category_summary || []).map((c) => (
            <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 12, color: '#8899bb' }}>{c.category || 'Uncategorized'}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: Number(c.open_count) > 0 ? '#ffa726' : '#00c864' }}>{c.open_count || 0} open / {c.count} total</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', marginBottom: 12 }}>District Heatmap</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {(data.district_heatmap || []).slice(0, 12).map((d) => (
              <div key={d.district} style={{ background: Number(d.open_count) > 5 ? 'rgba(255,85,85,0.12)' : Number(d.open_count) > 0 ? 'rgba(255,167,38,0.12)' : 'rgba(0,200,100,0.12)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#8899bb' }}>{d.district}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: Number(d.open_count) > 0 ? '#ff7777' : '#00c864' }}>{d.open_count}</div>
                <div style={{ fontSize: 10, color: '#8899bb' }}>{d.total} total</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.sla_breaches?.length > 0 && (
        <div style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ff7777', marginBottom: 12 }}>⚠ SLA Breaches (&gt;14 days)</div>
          {data.sla_breaches.map((g: any) => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,85,85,0.1)' }}>
              <div>
                <div style={{ fontSize: 12, color: '#f0f4ff', fontWeight: 700 }}>{g.subject || 'Untitled grievance'}</div>
                <div style={{ fontSize: 11, color: '#ffaaaa' }}>{g.politician_name} · {g.district} · {g.days_open} days open</div>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,85,85,0.2)', color: '#ff7777', fontSize: 10, fontWeight: 800 }}>{g.status}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', marginBottom: 12 }}>Top Unresolved Grievances</div>
        {(data.top_unresolved || []).map((g: any) => (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: 12, color: '#f0f4ff', fontWeight: 700 }}>{g.subject || 'Untitled grievance'}</div>
              <div style={{ fontSize: 11, color: '#8899bb' }}>{g.politician_name} · {g.district} · {g.category || 'No category'} · {g.days_open} days</div>
            </div>
            <span style={{ padding: '3px 8px', borderRadius: 6, background: g.priority === 'High' ? 'rgba(255,85,85,0.15)' : 'rgba(255,167,38,0.12)', color: g.priority === 'High' ? '#ff7777' : '#ffa726', fontSize: 10, fontWeight: 800 }}>{g.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
