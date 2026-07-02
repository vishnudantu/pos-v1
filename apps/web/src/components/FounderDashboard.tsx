import { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../lib/api';
import {
  Activity, AlertTriangle, Award, BarChart3, Briefcase,
  Calendar, Cpu, Globe, LayoutDashboard, MapPin,
  Megaphone, RefreshCw, Shield, TrendingUp, Users, Zap
} from 'lucide-react';

type DashboardData = {
  metrics: {
    total_politicians: number;
    total_mps: number;
    total_mlas: number;
    total_users: number;
    active_users: number;
    total_grievances: number;
    open_grievances: number;
    total_projects: number;
    active_projects: number;
    total_events: number;
    upcoming_events: number;
    total_media_mentions: number;
    negative_mentions_24h: number;
    avg_sentiment: number | string;
    high_threats: number;
    voice_reports_30d: number;
    briefings_7d: number;
    unread_notifications: number;
  };
  live_count: number;
  politicians: PoliticianHealth[];
  top_performers: PoliticianHealth[];
  risk_watch: PoliticianHealth[];
  activity_feed: ActivityItem[];
  state_map: { by_state: StateRow[]; by_district: DistrictRow[] };
  party_summary: PartyRow[];
};

type PoliticianHealth = {
  id: number;
  full_name: string;
  display_name?: string;
  photo_url?: string;
  party: string;
  designation: string;
  constituency_name?: string;
  district?: string;
  state?: string;
  performance: number;
  winning: number;
  riskScore: number;
  health: 'Healthy' | 'Watch' | 'Critical';
  status: 'Live' | 'Offline';
  open_grievances: number;
  active_projects: number;
  upcoming_events: number;
  negative_mentions_30d: number;
  high_threats_30d: number;
  sentiment_avg?: number;
};

type ActivityItem = {
  type: string;
  label: string;
  detail: string;
  time: string;
  politician_name?: string;
  source?: string;
  sentiment?: string;
  threat_level?: number;
  activity_type?: string;
};

type StateRow = { state: string; count: number; mps: number; mlas: number };
type DistrictRow = { state: string; district: string; count: number };
type PartyRow = { party: string; total: number; mps: number; mlas: number };

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function healthColor(health: string) {
  if (health === 'Critical') return '#ff5555';
  if (health === 'Watch') return '#ffa726';
  return '#00c864';
}

export default function FounderDashboard({ onPoliticianClick }: { onPoliticianClick?: (id: number) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'overview' | 'performers' | 'risk' | 'activity' | 'map' | 'grievances'>('overview');
  const [grievanceData, setGrievanceData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const w = useWindowWidth();
  const isMob = w < 640;

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    if (!data) setLoading(true);
    try {
      const res = await api.get('/api/founder-v2/dashboard');
      setData(res as DashboardData);
      setLastUpdated(new Date());
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    }
    setIsRefreshing(false);
    setLoading(false);
  }, [data]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    async function loadGrievances() {
      if (tab !== 'grievances') return;
      try {
        const res = await api.get('/api/founder-v2/grievances');
        setGrievanceData(res);
      } catch (e) {
        console.error('Grievances load failed', e);
      }
    }
    loadGrievances();
  }, [tab]);

  const filteredPoliticians = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data.politicians;
    return data.politicians.filter(p =>
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.constituency_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#8899bb' }}>
        <Zap size={20} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} /> Loading command center...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.3)', borderRadius: 12, color: '#ff7777' }}>
        <AlertTriangle size={18} style={{ marginRight: 8, display: 'inline' }} />
        {error}
      </div>
    );
  }

  if (!data) return null;

      {/* LIVE STATUS BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(0,200,100,0.12)', border: '1px solid rgba(0,200,100,0.25)', borderRadius: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00c864', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#00c864', textTransform: 'uppercase', letterSpacing: 0.8 }}>Live</span>
          </div>
          <span style={{ fontSize: 11, color: '#8899bb' }}>
            Updated {formatTimeAgo(lastUpdated.toISOString())}
          </span>
        </div>
        <button
          onClick={fetchData}
          disabled={isRefreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d0d8ee', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

  const m = data.metrics;

  const pulseCards = [
    { label: 'Politicians', value: m.total_politicians, sub: `${data.live_count} live`, accent: '#00d4aa', icon: Users },
    { label: 'MPs / MLAs', value: `${m.total_mps}/${m.total_mlas}`, sub: 'national / state', accent: '#42a5f5', icon: MapPin },
    { label: 'Performance', value: `${Math.round(data.politicians.reduce((s, p) => s + p.performance, 0) / Math.max(data.politicians.length, 1))}`, sub: 'avg score', accent: '#ab47bc', icon: BarChart3 },
    { label: 'Winning Index', value: `${Math.round(data.politicians.reduce((s, p) => s + p.winning, 0) / Math.max(data.politicians.length, 1))}`, sub: 'platform avg', accent: '#26c6da', icon: TrendingUp },
    { label: 'Grievances', value: m.open_grievances, sub: 'open cases', accent: m.open_grievances > 10 ? '#ff7777' : '#ffa726', icon: Megaphone },
    { label: 'Threats', value: m.high_threats, sub: 'high priority', accent: m.high_threats > 0 ? '#ff5555' : '#00c864', icon: Shield },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* PULSE METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMob ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 12 }}>
        {pulseCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${Math.min(100, Math.max(10, Number(String(card.value).split('/')[0]) * 4))}%`, background: card.accent, borderRadius: '0 2px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={14} color={card.accent} />
                <span style={{ fontSize: 10, color: '#8899bb', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>{card.label}</span>
              </div>
              <div style={{ fontSize: isMob ? 20 : 26, fontWeight: 900, color: card.accent, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 10, color: '#8899bb', marginTop: 4 }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* SECONDARY STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMob ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Active Projects', value: m.active_projects, icon: Briefcase, color: '#42a5f5' },
          { label: 'Upcoming Events', value: m.upcoming_events, icon: Calendar, color: '#ab47bc' },
          { label: 'Media Mentions', value: m.total_media_mentions, icon: Megaphone, color: '#26c6da' },
          { label: 'Avg Sentiment', value: `${m.avg_sentiment}`, icon: Activity, color: '#00c864' },
          { label: 'Voice Reports', value: m.voice_reports_30d, icon: Cpu, color: '#ffa726' },
          { label: 'AI Briefings', value: m.briefings_7d, icon: LayoutDashboard, color: '#7e57c2' },
          { label: 'Unread Alerts', value: m.unread_notifications, icon: AlertTriangle, color: m.unread_notifications ? '#ff5555' : '#00c864' },
          { label: 'Active Users', value: m.active_users, icon: Users, color: '#00d4aa' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <s.icon size={16} color={s.color} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#f0f4ff' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#8899bb' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Overview', icon: LayoutDashboard },
          { key: 'performers', label: 'Top Performers', icon: Award },
          { key: 'risk', label: 'Risk Watch', icon: AlertTriangle },
          { key: 'activity', label: 'Activity Feed', icon: Activity },
          { key: 'map', label: 'State Map', icon: Globe },
          { key: 'grievances', label: 'Grievances', icon: Megaphone },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none',
                background: active ? 'rgba(0,212,170,0.15)' : 'transparent',
                color: active ? '#00d4aa' : '#8899bb', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* SEARCH */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px' }}>
        <span style={{ color: '#8899bb' }}>🔎</span>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search politicians by name, constituency, or district..."
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#f0f4ff', fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* TAB CONTENT */}
      {tab === 'overview' && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: -8 }}>All Politicians</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            {filteredPoliticians.map(p => (
              <PoliticianCard key={p.id} p={p} onClick={() => onPoliticianClick?.(p.id)} />
            ))}
          </div>
        </>
      )}

      {tab === 'performers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {data.top_performers.map((p, i) => (
            <LeaderRow key={p.id} p={p} rank={i + 1} />
          ))}
        </div>
      )}

      {tab === 'risk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {data.risk_watch.length ? data.risk_watch.map(p => (
            <RiskRow key={p.id} p={p} />
          )) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#8899bb', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
              <Shield size={32} style={{ margin: '0 auto 12px', color: '#00c864' }} />
              All politicians are in healthy status. No risks detected.
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          {data.activity_feed.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < data.activity_feed.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: activityColor(item.type), marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#f0f4ff', fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#8899bb', marginTop: 2 }}>{item.detail}</div>
                {item.politician_name && <div style={{ fontSize: 11, color: '#00d4aa', marginTop: 2 }}>via {item.politician_name}</div>}
              </div>
              <div style={{ fontSize: 11, color: '#8899bb', whiteSpace: 'nowrap' }}>{formatTimeAgo(item.time)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'map' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: 12 }}>State: {data.state_map.by_state[0]?.state}</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
            {data.state_map.by_district.map(d => (
              <div key={`${d.state}-${d.district}`} style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#00d4aa' }}>{d.district}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#f0f4ff' }}>{d.count}</div>
                <div style={{ fontSize: 11, color: '#8899bb' }}>politicians</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, fontSize: 14, fontWeight: 700, color: '#f0f4ff' }}>Party Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
            {data.party_summary.map(p => (
              <div key={p.party} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>{p.party}</div>
                <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4 }}>{p.mps} MPs · {p.mlas} MLAs · {p.total} Total</div>
              </div>
            ))}
          </div>
        </div>
      {tab === 'grievances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!grievanceData ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8899bb' }}>Loading grievance command center...</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
                <SummaryBox label="Total Open" value={grievanceData.total_open} color="#ffa726" />
                <SummaryBox label="SLA Breaches" value={grievanceData.total_sla_breaches} color={grievanceData.total_sla_breaches ? '#ff5555' : '#00c864'} />
                <SummaryBox label="Categories" value={grievanceData.category_summary?.length || 0} color="#42a5f5" />
                <SummaryBox label="Districts Affected" value={grievanceData.district_heatmap?.length || 0} color="#ab47bc" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', marginBottom: 12 }}>By Category</div>
                  {(grievanceData.category_summary || []).map((c: any) => (
                    <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 12, color: '#8899bb' }}>{c.category || 'Uncategorized'}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.open_count > 0 ? '#ffa726' : '#00c864' }}>{c.open_count || 0} open / {c.count} total</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', marginBottom: 12 }}>District Heatmap</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                    {(grievanceData.district_heatmap || []).slice(0, 12).map((d: any) => (
                      <div key={d.district} style={{ background: d.open_count > 5 ? 'rgba(255,85,85,0.12)' : d.open_count > 0 ? 'rgba(255,167,38,0.12)' : 'rgba(0,200,100,0.12)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#8899bb' }}>{d.district}</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: d.open_count > 0 ? '#ff7777' : '#00c864' }}>{d.open_count}</div>
                        <div style={{ fontSize: 10, color: '#8899bb' }}>{d.total} total</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {grievanceData.sla_breaches?.length > 0 && (
                <div style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ff7777', marginBottom: 12 }}>⚠ SLA Breaches (>14 days)</div>
                  {grievanceData.sla_breaches.map((g: any) => (
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
                {(grievanceData.top_unresolved || []).map((g: any) => (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#f0f4ff', fontWeight: 700 }}>{g.subject || 'Untitled grievance'}</div>
                      <div style={{ fontSize: 11, color: '#8899bb' }}>{g.politician_name} · {g.district} · {g.category || 'No category'} · {g.days_open} days</div>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: 6, background: g.priority === 'High' ? 'rgba(255,85,85,0.15)' : 'rgba(255,167,38,0.12)', color: g.priority === 'High' ? '#ff7777' : '#ffa726', fontSize: 10, fontWeight: 800 }}>{g.priority}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PoliticianCard({ p, onClick }: { p: PoliticianHealth; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease' }} onMouseEnter={(e) => onClick && (e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)')} onMouseLeave={(e) => onClick && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: healthColor(p.health) }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f4ff' }}>{p.full_name}</div>
          <div style={{ fontSize: 11, color: '#8899bb', marginTop: 2 }}>{p.designation} · {p.constituency_name} · {p.district}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ padding: '3px 8px', borderRadius: 6, background: p.status === 'Live' ? 'rgba(0,200,100,0.15)' : 'rgba(255,85,85,0.15)', color: p.status === 'Live' ? '#00c864' : '#ff7777', fontSize: 10, fontWeight: 800 }}>{p.status}</span>
          <span style={{ padding: '3px 8px', borderRadius: 6, background: p.health === 'Healthy' ? 'rgba(0,200,100,0.12)' : p.health === 'Watch' ? 'rgba(255,167,38,0.12)' : 'rgba(255,85,85,0.12)', color: healthColor(p.health), fontSize: 10, fontWeight: 800 }}>{p.health}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Performance', value: p.performance, color: '#42a5f5' },
          { label: 'Winning', value: p.winning, color: '#ab47bc' },
          { label: 'Risk', value: p.riskScore, color: healthColor(p.health) },
          { label: 'Sentiment', value: p.sentiment_avg ?? 50, color: '#00c864' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#8899bb', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#8899bb' }}>
        <span>⚠ {p.open_grievances} grievances</span>
        <span>📁 {p.active_projects} projects</span>
        <span>📅 {p.upcoming_events} events</span>
        <span>👁 {p.negative_mentions_30d} neg media</span>
        </div>
        {onClick && <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{ fontSize: 11, color: '#00d4aa', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}>View Profile →</button>}
      </div>
    </div>
  );
}

function LeaderRow({ p, rank }: { p: PoliticianHealth; rank: number }) {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#00d4aa', '#42a5f5', '#ab47bc'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: colors[rank - 1] || '#00d4aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#060b18' }}>{rank}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f4ff' }}>{p.full_name}</div>
        <div style={{ fontSize: 11, color: '#8899bb' }}>{p.constituency_name} · {p.district}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#00d4aa' }}>{p.performance}</div>
        <div style={{ fontSize: 10, color: '#8899bb' }}>Performance</div>
      </div>
      <div style={{ textAlign: 'right', marginLeft: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#ab47bc' }}>{p.winning}</div>
        <div style={{ fontSize: 10, color: '#8899bb' }}>Winning</div>
      </div>
    </div>
  );
}

function RiskRow({ p }: { p: PoliticianHealth }) {
  return (
    <div style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.25)', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#ff7777' }}>{p.full_name}</div>
          <div style={{ fontSize: 11, color: '#8899bb' }}>{p.constituency_name} · {p.district}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#ff5555' }}>{p.riskScore}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: '#ffaaaa' }}>
        <span>{p.open_grievances} open grievances</span>
        <span>{p.negative_mentions_30d} negative mentions</span>
        <span>{p.high_threats_30d} high threats</span>
      </div>
    </div>
  );
}

function activityColor(type: string) {
  if (type === 'login') return '#42a5f5';
  if (type === 'audit') return '#ab47bc';
  if (type === 'media') return '#26c6da';
  if (type === 'opposition') return '#ff5555';
  return '#00d4aa';
}

function SummaryBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
    </div>
  );
}
