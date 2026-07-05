import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Calendar, Users, AlertCircle, Megaphone, Clock, MapPin,
  Zap, TrendingUp, RefreshCw, ArrowRight, ShieldAlert, Radio, Vote,
  Star, Phone, CheckCircle2, XCircle, AlertTriangle, Newspaper
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

const C = {
  panel: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#f0f4ff',
  muted: '#8899bb',
  accent: '#00d4aa',
  accent2: '#1e88e5',
  error: '#ff5555',
  warning: '#ffa726',
  success: '#00c864',
  info: '#64b5f6',
};

const tokens = {
  panel: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20 } as React.CSSProperties,
  label: { fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 } as React.CSSProperties,
  btnPrimary: { background: 'linear-gradient(135deg, #00d4aa, #1e88e5)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#060b18', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
};

interface CommandData {
  grievances: { total: number; pending: number; urgent: number };
  media: { total_24h: number; negative_24h: number; positive_24h: number };
  projects: { total: number; active: number; stalled: number };
  whatsapp: { total_24h: number; urgent_24h: number };
  booths: { total: number; avg_strength: number; weak: number };
  darshan: { today: number; pending_approvals: number };
  today: {
    events: { id: number; title: string; location: string; start_date: string; start_time: string }[];
    appointments: { id: number; title: string; location: string; appointment_date: string; appointment_time: string }[];
  };
  latest_mentions: { id: number; headline: string; source: string; sentiment: string; published_at: string; url: string }[];
}

export default function Dashboard() {
  const { activePolitician, user } = useAuth();
  const [data, setData] = useState<CommandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/command');
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 60000); // refresh every minute
    return () => clearInterval(t);
  }, []);

  if (loading && !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(0,212,170,0.2)', borderTopColor: C.accent, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: C.muted, fontSize: 13 }}>Loading command dashboard...</p>
        </div>
      </div>
    );
  }

  const d = data || {
    grievances: { total: 0, pending: 0, urgent: 0 },
    media: { total_24h: 0, negative_24h: 0, positive_24h: 0 },
    projects: { total: 0, active: 0, stalled: 0 },
    whatsapp: { total_24h: 0, urgent_24h: 0 },
    booths: { total: 0, avg_strength: 0, weak: 0 },
    darshan: { today: 0, pending_approvals: 0 },
    today: { events: [], appointments: [] },
    latest_mentions: [],
  };

  return (
    <div style={{ color: C.text, minHeight: '100vh', paddingBottom: 40 }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ ...tokens.panel, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{greeting}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>
            {activePolitician?.display_name || activePolitician?.full_name || 'Dashboard'}
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {activePolitician?.designation} • {activePolitician?.constituency_name} {activePolitician?.state ? `, ${activePolitician.state}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={fetchData} disabled={loading} style={{ ...tokens.btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />} Refresh
          </button>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #00d4aa, #1e88e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#060b18', fontSize: 16 }}>
            {(activePolitician?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)', color: C.error, fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Top stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
        <StatCard icon={MessageSquare} label="Pending Grievances" value={d.grievances.pending} sub={d.grievances.urgent > 0 ? `${d.grievances.urgent} urgent` : undefined} color={C.warning} />
        <StatCard icon={Megaphone} label="Media Mentions (24h)" value={d.media.total_24h} sub={d.media.negative_24h > 0 ? `${d.media.negative_24h} negative` : `${d.media.positive_24h} positive`} color={C.info} />
        <StatCard icon={TrendingUp} label="Active Projects" value={d.projects.active} sub={d.projects.stalled > 0 ? `${d.projects.stalled} stalled` : undefined} color={C.success} />
        <StatCard icon={Vote} label="Sensitive Booths" value={d.booths.high_sensitive} sub={d.booths.medium_sensitive > 0 ? `${d.booths.medium_sensitive} medium` : undefined} color={C.accent2} />
        <StatCard icon={Phone} label="WhatsApp (24h)" value={d.whatsapp.total_24h} sub={d.whatsapp.urgent_24h > 0 ? `${d.whatsapp.urgent_24h} urgent` : undefined} color="#ab47bc" />
        <StatCard icon={Star} label="Darshan Today" value={d.darshan.today} sub={d.darshan.pending_approvals > 0 ? `${d.darshan.pending_approvals} pending` : undefined} color="#ff7043" />
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Today's schedule */}
        <div style={tokens.panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color={C.accent} /> Today's Schedule
            </div>
            <span style={{ fontSize: 11, color: C.muted }}>{new Date().toLocaleDateString('en-IN')}</span>
          </div>

          {d.today.events.length === 0 && d.today.appointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: C.muted, fontSize: 12 }}>No events or appointments today</div>
          )}

          {[...d.today.events, ...d.today.appointments].slice(0, 5).map((item: any, i) => {
            const isEvent = 'start_time' in item;
            return (
              <motion.div key={item.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 42, textAlign: 'center', padding: '6px 0', borderRadius: 8, background: 'rgba(0,212,170,0.08)', color: C.accent, fontSize: 11, fontWeight: 700 }}>
                  {isEvent ? item.start_time?.slice(0, 5) || 'All day' : item.appointment_time?.slice(0, 5) || 'TBD'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <MapPin size={10} /> {item.location || 'Location TBD'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Priority alerts */}
        <div style={tokens.panel}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={16} color={C.error} /> Priority Alerts
          </div>

          {d.grievances.urgent === 0 && d.media.negative_24h === 0 && d.whatsapp.urgent_24h === 0 && d.projects.stalled === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12, background: 'rgba(0,200,100,0.06)', border: '1px solid rgba(0,200,100,0.15)' }}>
              <CheckCircle2 size={20} color={C.success} />
              <div style={{ fontSize: 13, color: C.text }}>All systems clear. No urgent alerts.</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.grievances.urgent > 0 && (
              <AlertRow icon={AlertCircle} color={C.error} title={`${d.grievances.urgent} Urgent Grievance${d.grievances.urgent !== 1 ? 's' : ''}`} subtitle="Require immediate attention" />
            )}
            {d.media.negative_24h > 0 && (
              <AlertRow icon={Newspaper} color={C.warning} title={`${d.media.negative_24h} Negative Mention${d.media.negative_24h !== 1 ? 's' : ''}`} subtitle="In last 24 hours" />
            )}
            {d.whatsapp.urgent_24h > 0 && (
              <AlertRow icon={Phone} color="#ab47bc" title={`${d.whatsapp.urgent_24h} Urgent WhatsApp Message${d.whatsapp.urgent_24h !== 1 ? 's' : ''}`} subtitle="High urgency score" />
            )}
            {d.projects.stalled > 0 && (
              <AlertRow icon={TrendingUp} color={C.info} title={`${d.projects.stalled} Stalled Project${d.projects.stalled !== 1 ? 's' : ''}`} subtitle="Need follow-up" />
            )}
          </div>
        </div>
      </div>

      {/* Latest media mentions */}
      <div style={tokens.panel}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={16} color={C.accent2} /> Latest Media Mentions
          </div>
          <button onClick={() => {}} style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>View All →</button>
        </div>

        {d.latest_mentions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: C.muted, fontSize: 12 }}>No media mentions yet. Run OmniScan.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {d.latest_mentions.map((m, i) => (
              <motion.div key={m.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.accent2 }}>{m.source}</span>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                    background: m.sentiment === 'Positive' ? 'rgba(0,200,100,0.15)' : m.sentiment === 'Negative' ? 'rgba(255,85,85,0.15)' : 'rgba(100,181,246,0.15)',
                    color: m.sentiment === 'Positive' ? C.success : m.sentiment === 'Negative' ? C.error : C.info }}>
                    {m.sentiment || 'Neutral'}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 8 }}>{m.headline}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: C.muted }}>{new Date(m.published_at).toLocaleString('en-IN')}</span>
                  <a href={m.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.accent2 }}>Read →</a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any, label: string, value: string | number, sub?: string, color: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} style={{ ...tokens.panel, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>{value}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color, marginTop: 4, fontWeight: 700 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

function AlertRow({ icon: Icon, color, title, subtitle }: { icon: any, color: string, title: string, subtitle: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: `${color}10`, border: `1px solid ${color}30` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{subtitle}</div>
      </div>
      <ArrowRight size={16} color={color} />
    </div>
  );
}
