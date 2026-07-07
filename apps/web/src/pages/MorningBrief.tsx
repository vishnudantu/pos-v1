import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, RefreshCw, Clock, Sparkles, CheckCircle2, AlertTriangle,
  TrendingUp, Zap, Activity, AlertCircle, Pencil, Save, X,
  MessageSquarePlus, ChevronRight, Calendar
} from 'lucide-react';
import { api } from '../lib/api';
import { T, AIPanel, Loading, getToken } from '../components/ui/ModuleLayout';
import { useAuth } from '../lib/auth';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';

interface Brief {
  id: string;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

const SECTION_MAP = [
  { key: ['SITUATION'], icon: Activity, color: '#00d4aa', title: 'Situation' },
  { key: ['TOP 3', 'ACTION'], icon: CheckCircle2, color: '#42a5f5', title: 'Actions Today' },
  { key: ['WATCH'], icon: AlertTriangle, color: '#ffa726', title: 'Watch' },
  { key: ['SENTIMENT'], icon: TrendingUp, color: '#ab47bc', title: 'Sentiment' },
];

function parseContent(raw: string) {
  const sections: { title: string; content: string; icon: any; color: string }[] = [];
  let current: { title: string; lines: string[]; icon: any; color: string } | null = null;
  for (const line of raw.split('\n')) {
    const clean = line.replace(/\*\*/g, '').trim();
    if (!clean) continue;
    const match = SECTION_MAP.find(s => s.key.some(k => clean.toUpperCase().startsWith(k)));
    if (match) {
      if (current) sections.push({ ...current, content: current.lines.join('\n') });
      current = { title: match.title, lines: [], icon: match.icon, color: match.color };
    } else if (current) {
      current.lines.push(clean.replace(/^[-•·]\s*/, ''));
    }
  }
  if (current) sections.push({ ...current, content: current.lines.join('\n') });
  return sections.length ? sections : [{ title: 'Intelligence Brief', content: raw, icon: Sparkles, color: '#00d4aa' }];
}

function formatBriefDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function MorningBrief() {
  const { activePolitician } = useAuth() as any;
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [active, setActive] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [notes, setNotes] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list('ai_briefings', { order: 'created_at', dir: 'DESC', limit: '20' });
      const list = (data as Brief[]) || [];
      setBriefs(list);
      if (list.length) {
        const target = active?.id ? list.find(b => b.id === active.id) || list[0] : list[0];
        setActive(target);
        setEditedContent(target.content || '');
        setNotes(target.summary || '');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load briefings');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const r = await fetch('/api/briefing/ai-generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      await r.json();
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to generate brief');
    } finally {
      setGenerating(false);
    }
  }

  async function saveBrief() {
    if (!active) return;
    setSaving(true);
    setError(null);
    try {
      await api.update('ai_briefings', active.id, {
        content: editedContent,
        summary: notes,
      });
      setActive({ ...active, content: editedContent, summary: notes });
      setBriefs(prev => prev.map(b => b.id === active.id ? { ...b, content: editedContent, summary: notes } : b));
      setEditMode(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to save brief');
    } finally {
      setSaving(false);
    }
  }

  function selectBrief(b: Brief) {
    setActive(b);
    setEditedContent(b.content || '');
    setNotes(b.summary || '');
    setEditMode(false);
  }

  useEffect(() => { load(); }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const todayBrief = briefs.find(b => new Date(b.created_at).toDateString() === new Date().toDateString());
  const isTodayActive = active ? new Date(active.created_at).toDateString() === new Date().toDateString() : false;

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Left: Main brief */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className="nethra-glass p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-nethra bg-gradient-to-br from-nethra-amber to-nethra-teal flex items-center justify-center flex-shrink-0">
              <Sun size={24} className="text-surface-DEFAULT" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-content-DEFAULT font-display">{greet}</h1>
              <p className="text-sm text-content-secondary">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={load} loading={loading} disabled={loading}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={generate} loading={generating} disabled={generating}>
              <Sparkles size={14} /> {generating ? 'Briefing...' : 'Brief Me'}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="nethra-glass p-4 border-l-4 border-l-nethra-red bg-nethra-red/5">
            <div className="flex items-center gap-2 text-nethra-red text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          </div>
        )}

        {/* Generating */}
        {generating && <AIPanel loading title="Generating your morning brief..." />}

        {/* Active brief */}
        {!generating && active && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-nethra-teal" />
                <span className="text-xs uppercase tracking-wider font-bold text-nethra-teal">
                  AI Intelligence Brief
                </span>
                {isTodayActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-nethra-teal/15 text-nethra-teal font-semibold">
                    Today
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-content-tertiary text-xs">
                <Clock size={12} />
                {new Date(active.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Brief sections */}
            {editMode ? (
              <div className="space-y-4">
                <Textarea
                  label="Edit Brief Content"
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                  rows={20}
                  helper="Edit the AI-generated brief directly. Changes will be saved."
                />
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setEditMode(false); setEditedContent(active.content || ''); }}>
                    <X size={14} /> Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={saveBrief} loading={saving}>
                    <Save size={14} /> Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {parseContent(active.content).map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="nethra-glass p-4 sm:p-5"
                      style={{ borderLeft: `3px solid ${s.color}` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-nethra-sm flex items-center justify-center" style={{ background: `${s.color}18` }}>
                          <Icon size={14} style={{ color: s.color }} />
                        </div>
                        <span className="text-xs uppercase tracking-wider font-bold" style={{ color: s.color }}>
                          {s.title}
                        </span>
                      </div>
                      <p className="text-sm text-content-DEFAULT leading-relaxed whitespace-pre-line">
                        {s.content}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Politician notes */}
            <div className="nethra-glass p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquarePlus size={16} className="text-nethra-blue" />
                <span className="text-xs uppercase tracking-wider font-bold text-content-secondary">
                  Your Notes
                </span>
              </div>
              <Textarea
                placeholder="Add your personal observations, talking points, or actions to take..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                helper="These notes are private to you and saved with this brief."
              />
              <div className="mt-3 flex justify-end">
                <Button variant="primary" size="sm" onClick={saveBrief} loading={saving}>
                  <Save size={14} /> Save Notes
                </Button>
              </div>
            </div>

            {/* Edit toggle */}
            {!editMode && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                  <Pencil size={14} /> Edit Brief
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!generating && !loading && !active && (
          <div className="nethra-glass p-12 text-center">
            <Zap size={40} className="text-content-tertiary mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-content-DEFAULT mb-2">No briefs yet</h3>
            <p className="text-sm text-content-secondary mb-6">Generate your first AI intelligence brief</p>
            <Button variant="primary" size="md" onClick={generate} loading={generating}>
              <Sparkles size={16} /> Brief Me
            </Button>
          </div>
        )}

        {loading && !active && <Loading text="Loading intelligence brief..." />}
      </div>

      {/* Right: History */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
        <div className="nethra-glass p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-nethra-teal" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-secondary">
              Brief History
            </h3>
          </div>

          {briefs.length === 0 && !loading && (
            <p className="text-xs text-content-tertiary text-center py-4">No previous briefs</p>
          )}

          <div className="space-y-2">
            {briefs.map(b => {
              const selected = active?.id === b.id;
              const isToday = new Date(b.created_at).toDateString() === new Date().toDateString();
              return (
                <button
                  key={b.id}
                  onClick={() => selectBrief(b)}
                  className={`w-full text-left p-3 rounded-nethra-sm border transition-all duration-200 group ${
                    selected
                      ? 'bg-surface-card border-border-strong'
                      : 'bg-transparent border-transparent hover:bg-surface-card-hover'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${selected ? 'text-nethra-teal' : 'text-content-DEFAULT group-hover:text-content-DEFAULT'}`}>
                      {isToday ? 'Today' : formatBriefDate(b.created_at)}
                    </span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-nethra-teal" />}
                  </div>
                  <p className="text-[11px] text-content-tertiary mt-1 truncate">
                    {b.title || 'Morning Brief'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's status */}
        <div className="nethra-glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-nethra-blue" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-content-secondary">
              Today
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-content-secondary">
              <span>Brief generated</span>
              <span className={todayBrief ? 'text-nethra-teal font-semibold' : 'text-content-tertiary'}>
                {todayBrief ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between text-content-secondary">
              <span>Total briefs</span>
              <span className="text-content-DEFAULT font-semibold">{briefs.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
