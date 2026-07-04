import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, RefreshCw, Copy, CheckCheck, Save, Trash2,
  FileText, Mic2, Newspaper, Users, Zap, MessageSquare, Search,
  BookOpen, Star, ChevronRight, X, Download
} from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/ModuleLayout';
import AnimatedCard from '../components/ui/AnimatedCard';

// ── Inline responsive hook (critical project rule) ──
import { useState as _useStateW, useEffect as _useEffectW } from 'react';
function useW() {
  const [_w, _setW] = _useStateW(typeof window !== 'undefined' ? window.innerWidth : 1440);
  _useEffectW(() => { const _fn = () => _setW(window.innerWidth); window.addEventListener('resize', _fn); return () => window.removeEventListener('resize', _fn); }, []);
  return _w;
}
const isMob = (_w: number) => _w < 640;

import { useAuth } from '../lib/auth';

interface GeneratedContent {
  id: string;
  content_type: string;
  prompt: string;
  content: string;
  is_saved: boolean;
  created_at: string;
}

interface ContentType {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  desc: string;
  placeholder: string;
}

const CONTENT_TYPES: ContentType[] = [
  { id: 'speech', label: 'Speech Writer', icon: Mic2, color: '#00d4aa', desc: 'Generate powerful speeches for any occasion', placeholder: 'e.g. Write an Independence Day speech focusing on infrastructure development in my constituency...' },
  { id: 'press_release', label: 'Press Release', icon: Newspaper, color: '#1e88e5', desc: 'Professional press releases for media', placeholder: 'e.g. Write a press release about the inauguration of a new hospital...' },
  { id: 'talking_points', label: 'Talking Points', icon: Zap, color: '#ff9800', desc: 'Crisp key messages for interviews & debates', placeholder: 'e.g. Generate talking points defending the government\'s agricultural policy...' },
  { id: 'social_post', label: 'Social Media', icon: Users, color: '#e91e63', desc: 'Engaging content for all social platforms', placeholder: 'e.g. Create posts celebrating 100 new homes under PMAY...' },
  { id: 'grievance_reply', label: 'Grievance Reply', icon: FileText, color: '#9c27b0', desc: 'Empathetic official constituent responses', placeholder: 'e.g. Draft a reply to a farmer about irrigation water supply...' },
  { id: 'briefing', label: 'Political Briefing', icon: BookOpen, color: '#4caf50', desc: 'Comprehensive intelligence briefings', placeholder: 'e.g. Brief me on opposition strategy ahead of by-elections...' },
  { id: 'analysis', label: 'Strategic Analysis', icon: MessageSquare, color: '#00bcd4', desc: 'Deep political analysis and strategy', placeholder: 'e.g. Analyze the political impact of the new reservation policy...' },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(CONTENT_TYPES.map(t => [t.id, t.label]));

function formatContent(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f0f4ff">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<div style="font-weight:700;color:#f0f4ff;font-size:15px;margin:12px 0 6px;font-family:Space Grotesk,sans-serif">$1</div>')
    .replace(/^[-•]\s+(.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;padding-left:4px"><span style="color:#00d4aa;flex-shrink:0;margin-top:2px">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function AIStudio() {
  const w = useW();
  const { activePolitician } = useAuth();
  const [activeType, setActiveType] = useState('speech');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [savedItems, setSavedItems] = useState<GeneratedContent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'generate' | 'library'>('generate');
  const abortRef = useRef<AbortController | null>(null);

  const primaryColor = activePolitician?.color_primary || '#00d4aa';
  const secondaryColor = activePolitician?.color_secondary || '#1e88e5';
  const currentType = CONTENT_TYPES.find(t => t.id === activeType) || CONTENT_TYPES[0];

  const fetchHistory = useCallback(async () => {
    if (!activePolitician?.id) return;
    setLoadingHistory(true);
    try {
      const data = await api.list('ai_generated_content', { order: 'created_at', dir: 'DESC', limit: '50' }) as GeneratedContent[];
      setSavedItems(data.filter(item => item.is_saved));
    } catch (e) {
      console.error('[ai-studio] history load failed', e);
    }
    setLoadingHistory(false);
  }, [activePolitician?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function generate() {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setOutput('');
    setError('');
    setCurrentContentId(null);

    const context = activePolitician ? {
      name: activePolitician.full_name,
      party: activePolitician.party || undefined,
      constituency: activePolitician.constituency_name || undefined,
      state: activePolitician.state || undefined,
      designation: activePolitician.designation || undefined,
    } : undefined;

    try {
      const token = localStorage.getItem('nethra_token');
      if (!token) throw new Error('Not authenticated. Please log in again.');

      abortRef.current = new AbortController();

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          politician_context: context,
          mode: activeType,
          politician_id: activePolitician?.id,
          save_content: false,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`AI request failed (${response.status}): ${errText || response.statusText}`);
      }

      if (!response.body) throw new Error('AI response stream is not available.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setOutput(full);
      }

      if (full && activePolitician?.id) {
        const created = await api.create('ai_generated_content', {
          politician_id: activePolitician.id,
          content_type: activeType,
          prompt: prompt.slice(0, 500),
          content: full,
          is_saved: false,
        }) as GeneratedContent;
        if (created?.id) setCurrentContentId(created.id);
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e.name !== 'AbortError') {
        const message = e.message || 'Unknown error';
        setError(message);
        setOutput(`**AI Error**\n\n${message}\n\nPlease check:\n• Your network connection\n• That the AI service is running\n• Browser console for details`);
      }
    }
    setGenerating(false);
  }

  async function saveContent() {
    if (!currentContentId) return;
    setSaving(true);
    try {
      await api.update('ai_generated_content', currentContentId, { is_saved: true });
      await fetchHistory();
    } catch (e) {
      console.error('[ai-studio] save failed', e);
    }
    setSaving(false);
  }

  async function deleteContent(id: string) {
    try {
      await api.remove('ai_generated_content', id);
      setSavedItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error('[ai-studio] delete failed', e);
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadItem(item: GeneratedContent) {
    setOutput(item.content);
    setActiveType(item.content_type);
    setPrompt(item.prompt);
    setCurrentContentId(item.id);
    setError('');
    if (isMob(w)) setMobileTab('generate');
  }

  const filteredHistory = savedItems.filter(item => {
    const matchType = filterType === 'all' || item.content_type === filterType;
    const matchSearch = !searchQuery ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const MobileTabs = () => (
    <div className="flex sm:hidden mb-4 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
      <button onClick={() => setMobileTab('generate')} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: mobileTab === 'generate' ? 'rgba(0,212,170,0.15)' : 'transparent', color: mobileTab === 'generate' ? '#00d4aa' : '#8899bb' }}>Generate</button>
      <button onClick={() => setMobileTab('library')} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: mobileTab === 'library' ? 'rgba(0,212,170,0.15)' : 'transparent', color: mobileTab === 'library' ? '#00d4aa' : '#8899bb' }}>Library</button>
    </div>
  );

  const TypeSelector = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide snap-x">
      {CONTENT_TYPES.map(type => {
        const Icon = type.icon;
        const isActive = activeType === type.id;
        return (
          <motion.button
            key={type.id}
            onClick={() => { setActiveType(type.id); setOutput(''); setCurrentContentId(null); setPrompt(''); setError(''); }}
            className="snap-start flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all flex-shrink-0"
            style={{ background: isActive ? `${type.color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? type.color + '40' : 'rgba(255,255,255,0.08)'}`, color: isActive ? type.color : '#8899bb' }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon size={14} />
            <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}>{type.label}</span>
          </motion.button>
        );
      })}
    </div>
  );

  const LibraryPanel = () => (
    <AnimatedCard className="flex flex-col h-full overflow-hidden" hover={false}>
      <div className="p-3 sm:p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <BookOpen size={14} style={{ color: primaryColor }} />
          <span className="font-semibold text-sm text-content">Saved Library</span>
        </div>
        <span className="text-xs text-content-secondary">{savedItems.length} items</span>
      </div>

      <div className="p-3 space-y-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07]">
          <Search size={12} className="text-content-secondary" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search saved content..." className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-content placeholder:text-content-tertiary" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-white/[0.05] border border-white/[0.07] text-content-secondary outline-none" style={{ colorScheme: 'dark' }}>
          <option value="all">All Types</option>
          {CONTENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="py-8 text-center text-content-secondary text-xs sm:text-sm">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-10 text-center px-4">
            <Star size={28} className="mx-auto mb-2 opacity-20 text-content-secondary" />
            <p className="text-xs sm:text-sm text-content-secondary">
              {savedItems.length === 0 ? 'No saved content yet. Generate and save content to build your library.' : 'No results match your filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filteredHistory.map(item => {
              const typeInfo = CONTENT_TYPES.find(t => t.id === item.content_type);
              const Icon = typeInfo?.icon || FileText;
              return (
                <div key={item.id} className="p-3 hover:bg-white/[0.02] transition-all group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon size={12} style={{ color: typeInfo?.color || '#8899bb', flexShrink: 0, marginTop: 2 }} />
                      <div className="min-w-0">
                        <div className="truncate text-xs sm:text-sm text-content font-medium">{item.prompt.slice(0, 60)}{item.prompt.length > 60 ? '...' : ''}</div>
                        <div className="text-[10px] sm:text-xs text-content-secondary mt-1">{TYPE_LABELS[item.content_type]} • {new Date(item.created_at).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteContent(item.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 text-nethra-red bg-nethra-red/10">
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <button onClick={() => loadItem(item)} className="mt-2 w-full text-left px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 bg-white/[0.04] text-content-secondary text-[10px] sm:text-xs hover:text-content">
                    <ChevronRight size={11} /> View & Edit
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AnimatedCard>
  );

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-5 pb-20 sm:pb-0">
      <PageHeader title="AI Studio" subtitle="Generate speeches, briefings, social content and political intelligence" />
      <MobileTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5" style={{ flex: 1, minHeight: 0 }}>
        <div className={`lg:col-span-2 flex flex-col gap-4 ${isMob(w) && mobileTab === 'library' ? 'hidden' : 'flex'}`}>
          <AnimatedCard hover={false}>
            <div className="p-3 sm:p-4">
              <TypeSelector />
            </div>
          </AnimatedCard>

          <AnimatedCard className="flex flex-col flex-1 min-h-[420px] sm:min-h-[520px]" hover={false}>
            <div className="p-3 sm:p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <currentType.icon size={14} style={{ color: currentType.color }} />
                <span className="font-semibold text-sm text-content">{currentType.label}</span>
                <span className="text-xs text-content-secondary hidden sm:inline">— {currentType.desc}</span>
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); }}
                  placeholder={currentType.placeholder}
                  rows={isMob(w) ? 3 : 4}
                  className="w-full px-4 py-3 rounded-xl resize-none bg-white/[0.05] border border-white/10 text-content placeholder:text-content-tertiary text-sm outline-none focus:border-nethra-teal/50 transition-colors"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                  <span className="text-[10px] sm:text-xs text-content-tertiary">
                    {activePolitician ? `Context: ${activePolitician.full_name} • ${activePolitician.constituency_name}` : ''} • Cmd/Ctrl+Enter to generate
                  </span>
                  <motion.button
                    onClick={generating ? () => abortRef.current?.abort() : generate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm w-full sm:w-auto"
                    style={{ background: generating ? 'rgba(255,85,85,0.15)' : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: generating ? '#ff7777' : '#060b18', border: generating ? '1px solid rgba(255,85,85,0.3)' : 'none' }}
                  >
                    {generating ? <><X size={13} /> Stop</> : <><Sparkles size={13} /> Generate</>}
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="flex-1 relative p-3 sm:p-4 overflow-auto" style={{ minHeight: 200 }}>
              {!output && !generating && (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${currentType.color}15`, border: `1px solid ${currentType.color}25` }}>
                    <currentType.icon size={22} style={{ color: currentType.color }} />
                  </div>
                  <p className="text-xs sm:text-sm text-content-secondary max-w-[280px]">
                    Describe what you need above and click Generate. AI will create content tailored to {activePolitician?.full_name || 'your'} profile.
                  </p>
                </div>
              )}

              {(output || generating) && (
                <div>
                  <div className="text-sm sm:text-base text-content-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: output ? formatContent(output) : '' }} />
                  {generating && !error && (
                    <div className="flex gap-1 mt-3">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {output && !generating && (
              <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={copyOutput} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all bg-white/[0.06] text-content-secondary text-xs hover:text-content">
                  {copied ? <><CheckCheck size={13} className="text-nethra-teal" /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
                <button onClick={downloadOutput} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all bg-white/[0.06] text-content-secondary text-xs hover:text-content">
                  <Download size={13} /> Download
                </button>
                <button onClick={saveContent} disabled={saving || !currentContentId} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all ml-auto text-xs" style={{ background: `${primaryColor}15`, border: `1px solid ${primaryColor}30`, color: primaryColor, opacity: !currentContentId ? 0.5 : 1 }}>
                  {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}{saving ? 'Saving...' : 'Save to Library'}
                </button>
                <button onClick={() => { setOutput(''); setCurrentContentId(null); setError(''); }} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-content-secondary hover:text-content">
                  <X size={14} />
                </button>
              </div>
            )}
          </AnimatedCard>
        </div>

        <div className={`${isMob(w) && mobileTab === 'generate' ? 'hidden' : 'flex'} lg:flex flex-col min-h-[300px]`}>
          <LibraryPanel />
        </div>
      </div>
    </div>
  );
}
