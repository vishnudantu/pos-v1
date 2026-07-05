import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Search, RefreshCw, Trash2, Plus, Rss, Globe, MapPin, Radio, Loader2,
  AlertTriangle, CheckCircle2, XCircle, Eye, Filter
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
  success: '#00c864',
  warning: '#ffa726',
};

const tokens = {
  panel: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 } as React.CSSProperties,
  label: { fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 } as React.CSSProperties,
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  btnPrimary: { background: 'linear-gradient(135deg, #00d4aa, #1e88e5)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#060b18', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  btnSecondary: { padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
  pill: (active: boolean, color: string): React.CSSProperties => ({
    padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
    border: `1px solid ${active ? color : C.border}`,
    background: active ? `${color}15` : 'rgba(255,255,255,0.04)',
    color: active ? color : C.muted,
  }),
};

interface Keyword { id: number; keyword: string; keyword_type: string; is_active: number; }
interface Feed { id: number; feed_name: string; feed_url: string; feed_type: string; language: string; is_active: number; last_status: string; last_scanned_at: string; items_fetched: number; last_error: string | null; }
interface Mention { id: number; headline: string; source: string; summary: string; published_at: string; sentiment: string; url: string; }

export default function OmniScan() {
  const { user, activePolitician } = useAuth();
  const politicianId = user?.politician_id || activePolitician?.id || null;

  const [tab, setTab] = useState<'scan' | 'feeds' | 'keywords'>('scan');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [newKeyword, setNewKeyword] = useState('');
  const [keywordType, setKeywordType] = useState('politician');

  const [newFeed, setNewFeed] = useState({ feed_name: '', feed_url: '', feed_type: 'state', language: 'telugu' });
  const [feedFilter, setFeedFilter] = useState<'all' | 'national' | 'state' | 'local' | 'international'>('all');

  const fetchAll = async () => {
    if (!politicianId) return;
    setLoading(true);
    try {
      const [k, f, m] = await Promise.all([
        api.get('/api/keywords').then(r => r.keywords || []),
        api.get('/api/rss-feeds').then(r => r.feeds || []),
        api.list('media_mentions', { order: 'published_at', dir: 'DESC', limit: '50' }),
      ]);
      setKeywords(k);
      setFeeds(f);
      setMentions(m);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [politicianId]);

  async function addKeyword() {
    if (!newKeyword.trim()) return;
    try {
      await api.post('/api/keywords', { keyword: newKeyword.trim(), keyword_type: keywordType });
      setNewKeyword('');
      await fetchAll();
    } catch (e: any) { setError(e.message); }
  }

  async function deleteKeyword(id: number) {
    if (!confirm('Delete keyword?')) return;
    try { await api.delete(`/api/keywords/${id}`); await fetchAll(); } catch (e: any) { setError(e.message); }
  }

  async function toggleKeyword(id: number, current: number) {
    try { await api.patch(`/api/keywords/${id}/toggle`, { is_active: !current }); await fetchAll(); } catch (e: any) { setError(e.message); }
  }

  async function addFeed() {
    if (!newFeed.feed_name.trim() || !newFeed.feed_url.trim()) return;
    try {
      await api.post('/api/rss-feeds', newFeed);
      setNewFeed({ feed_name: '', feed_url: '', feed_type: 'state', language: 'telugu' });
      await fetchAll();
    } catch (e: any) { setError(e.message); }
  }

  async function deleteFeed(id: number) {
    if (!confirm('Delete feed?')) return;
    try { await api.delete(`/api/rss-feeds/${id}`); await fetchAll(); } catch (e: any) { setError(e.message); }
  }

  async function toggleFeed(id: number, current: number) {
    try { await api.patch(`/api/rss-feeds/${id}/toggle`, { is_active: !current }); await fetchAll(); } catch (e: any) { setError(e.message); }
  }

  async function runScan(feedType: string | null = null) {
    setScanning(true);
    setScanResult(null);
    setError('');
    try {
      const result = await api.post('/api/omniscan', { feed_type: feedType });
      setScanResult(result);
      await fetchAll();
    } catch (e: any) { setError(e.message); }
    setScanning(false);
  }

  if (!politicianId) {
    return (
      <div style={{ ...tokens.panel, textAlign: 'center', padding: 40 }}>
        <AlertTriangle size={40} style={{ color: C.warning, margin: '0 auto 12px' }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>No politician selected</div>
      </div>
    );
  }

  const filteredFeeds = feedFilter === 'all' ? feeds : feeds.filter(f => f.feed_type === feedFilter);
  const activeKeywords = keywords.filter(k => k.is_active).length;
  const activeFeeds = feeds.filter(f => f.is_active).length;

  return (
    <div style={{ color: C.text }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ ...tokens.panel, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #00d4aa, #1e88e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} color="#060b18" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>OmniScan</div>
            <div style={{ fontSize: 12, color: C.muted }}>{activeFeeds} active feeds · {activeKeywords} active keywords · {mentions.length} mentions</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['scan', 'feeds', 'keywords'].map(t => (
            <button key={t} onClick={() => setTab(t as any)} style={tokens.pill(tab === t, t === 'scan' ? C.accent : t === 'feeds' ? C.accent2 : '#ab47bc')}>
              {t === 'scan' ? <Search size={12} style={{ display: 'inline', marginRight: 4 }} /> : t === 'feeds' ? <Rss size={12} style={{ display: 'inline', marginRight: 4 }} /> : <Filter size={12} style={{ display: 'inline', marginRight: 4 }} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)', color: C.error, fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {tab === 'scan' && (
        <>
          {/* Scan controls */}
          <div style={{ ...tokens.panel, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={16} color={C.accent} /> Scan RSS Feeds
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={() => runScan(null)} disabled={scanning} style={{ ...tokens.btnPrimary }}>
                {scanning ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Scanning...</> : <><RefreshCw size={14} /> Scan All Feeds</>}
              </button>
              <button onClick={() => runScan('national')} disabled={scanning} style={tokens.btnSecondary}><Globe size={14} /> National</button>
              <button onClick={() => runScan('state')} disabled={scanning} style={tokens.btnSecondary}><MapPin size={14} /> State/Regional</button>
            </div>
            {scanResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Scan Complete</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{scanResult.feeds_scanned}</div><div style={{ fontSize: 10, color: C.muted }}>Feeds</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: C.success }}>{scanResult.success}</div><div style={{ fontSize: 10, color: C.muted }}>Success</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: C.error }}>{scanResult.failed}</div><div style={{ fontSize: 10, color: C.muted }}>Failed</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{scanResult.total_matched}</div><div style={{ fontSize: 10, color: C.muted }}>Matches</div></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mentions list */}
          <div style={tokens.panel}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={16} color={C.accent2} /> Latest Mentions
            </div>
            {mentions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: C.muted }}>
                <Rss size={28} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                <div style={{ fontSize: 12 }}>No mentions yet. Run a scan.</div>
              </div>
            ) : (
              mentions.map((m) => (
                <div key={m.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.headline}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{m.source} · {new Date(m.published_at).toLocaleDateString()}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.4 }}>{m.summary?.slice(0, 200)}...</div>
                    </div>
                    <a href={m.url} target="_blank" rel="noreferrer" style={{ color: C.accent2, fontSize: 12, whiteSpace: 'nowrap' }}>Open →</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'keywords' && (
        <div style={tokens.panel}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Keywords to Monitor</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <select value={keywordType} onChange={e => setKeywordType(e.target.value)} style={{ ...tokens.input, width: 'auto', minWidth: 140 }}>
              <option value="politician">Politician</option>
              <option value="party">Party</option>
              <option value="issue">Issue</option>
              <option value="opponent">Opponent</option>
              <option value="scheme">Scheme</option>
            </select>
            <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()} placeholder="Add keyword..." style={{ ...tokens.input, flex: 1, minWidth: 150 }} />
            <button onClick={addKeyword} style={tokens.btnPrimary}><Plus size={14} /> Add</button>
          </div>
          {keywords.length === 0 ? <div style={{ color: C.muted, textAlign: 'center', padding: 20 }}>No keywords yet</div> : (
            keywords.map(k => (
              <div key={k.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 13, color: k.is_active ? C.text : C.muted, fontWeight: 600 }}>{k.keyword}</div>
                  <div style={{ fontSize: 10, color: C.accent, marginTop: 2 }}>{k.keyword_type}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleKeyword(k.id, k.is_active)} style={tokens.btnSecondary}>{k.is_active ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => deleteKeyword(k.id)} style={{ ...tokens.btnSecondary, color: C.error, borderColor: 'rgba(255,85,85,0.2)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'feeds' && (
        <div style={tokens.panel}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>RSS Feed Sources</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={newFeed.feed_name} onChange={e => setNewFeed({ ...newFeed, feed_name: e.target.value })} placeholder="Feed name" style={{ ...tokens.input, flex: 1, minWidth: 120 }} />
            <input value={newFeed.feed_url} onChange={e => setNewFeed({ ...newFeed, feed_url: e.target.value })} placeholder="Feed URL" style={{ ...tokens.input, flex: 2, minWidth: 200 }} />
            <select value={newFeed.feed_type} onChange={e => setNewFeed({ ...newFeed, feed_type: e.target.value })} style={{ ...tokens.input, width: 'auto', minWidth: 100 }}>
              <option value="national">National</option>
              <option value="state">State</option>
              <option value="local">Local</option>
              <option value="international">International</option>
            </select>
            <button onClick={addFeed} style={tokens.btnPrimary}><Plus size={14} /> Add</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {['all', 'national', 'state', 'local', 'international'].map(f => (
              <button key={f} onClick={() => setFeedFilter(f as any)} style={tokens.pill(feedFilter === f, f === 'national' ? C.accent2 : f === 'state' ? '#ab47bc' : f === 'local' ? C.warning : C.muted)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {filteredFeeds.length === 0 ? <div style={{ color: C.muted, textAlign: 'center', padding: 20 }}>No feeds in this category</div> : (
            filteredFeeds.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: f.is_active ? C.text : C.muted, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {f.feed_name}
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: f.feed_type === 'national' ? 'rgba(30,136,229,0.15)' : 'rgba(171,71,188,0.15)', color: f.feed_type === 'national' ? C.accent2 : '#ab47bc' }}>{f.feed_type}</span>
                    {f.last_status === 'success' && <CheckCircle2 size={12} color={C.success} />}
                    {f.last_status === 'failed' && <XCircle size={12} color={C.error} />}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.feed_url}</div>
                  {f.last_scanned_at && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Last scan: {new Date(f.last_scanned_at).toLocaleString()} · {f.items_fetched} items</div>}
                  {f.last_error && <div style={{ fontSize: 10, color: C.error, marginTop: 2 }}>{f.last_error}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggleFeed(f.id, f.is_active)} style={tokens.btnSecondary}>{f.is_active ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => deleteFeed(f.id)} style={{ ...tokens.btnSecondary, color: C.error, borderColor: 'rgba(255,85,85,0.2)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
