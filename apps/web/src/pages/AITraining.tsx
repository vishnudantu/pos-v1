import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, User, Palette, Ban, BookOpen, FileText, Eye, Plus, Trash2, Save,
  Loader2, CheckCircle2, AlertTriangle, Send, Sparkles
} from 'lucide-react';
import { useAuth } from '../lib/auth';

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
};

const radius = 16;

const tokens = {
  panel: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: radius, padding: 20 } as React.CSSProperties,
  label: { fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 } as React.CSSProperties,
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  textarea: { width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' } as React.CSSProperties,
  btnPrimary: { background: 'linear-gradient(135deg, #00d4aa, #1e88e5)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#060b18', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  btnSecondary: { padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
  btnDanger: { padding: '8px 14px', borderRadius: 10, background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)', color: C.error, fontSize: 12, fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
};

interface TrainingRule {
  id: number;
  politician_id: number;
  rule_type: 'identity' | 'style' | 'avoid' | 'example' | 'template';
  title: string | null;
  content: string;
  is_active: number;
  created_at: string;
}

const TABS = [
  { id: 'identity', label: 'Identity', icon: User, color: '#64b5f6', desc: 'Name, designation, constituency facts the AI must remember.' },
  { id: 'style', label: 'Style & Tone', icon: Palette, color: '#00d4aa', desc: 'How the AI should write for this politician.' },
  { id: 'avoid', label: 'Avoid', icon: Ban, color: '#ff5555', desc: 'Words, phrases, or spellings the AI must never use.' },
  { id: 'example', label: 'Good Examples', icon: BookOpen, color: '#ffa726', desc: 'Outputs the AI should match in tone and quality.' },
  { id: 'template', label: 'Templates', icon: FileText, color: '#ab47bc', desc: 'Reusable prompt templates.' },
  { id: 'preview', label: 'Live Preview', icon: Eye, color: '#00c864', desc: 'Test prompt with current training injected.' },
];

export default function AITraining() {
  const { user, activePolitician, getToken } = useAuth();
  const politicianId = user?.politician_id || activePolitician?.id || null;
  const isSuperAdmin = user?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState<string>('identity');
  const [rules, setRules] = useState<TrainingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{ rule_type: string; title: string; content: string }>({
    rule_type: 'identity',
    title: '',
    content: '',
  });

  const [previewPrompt, setPreviewPrompt] = useState('');
  const [previewOutput, setPreviewOutput] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const apiHeaders = async () => {
    let token = '';
    try { token = (await getToken?.()) || ''; } catch {}
    if (!token) token = localStorage.getItem('nethra_token') || '';
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchRules = async () => {
    if (!politicianId) { setLoading(false); return; }
    setLoading(true);
    try {
      const h = await apiHeaders();
      const r = await fetch(`/api/ai-training/${politicianId}`, { headers: h });
      if (!r.ok) throw new Error('Failed to load rules');
      const d = await r.json();
      setRules(d.rules || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, [politicianId]);

  const filteredRules = useMemo(() => rules.filter((r) => r.rule_type === activeTab), [rules, activeTab]);

  async function saveRule() {
    if (!politicianId || !form.content.trim()) return;
    setSaving(true);
    try {
      const h = await apiHeaders();
      const r = await fetch(`/api/ai-training/${politicianId}`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ rule_type: activeTab, title: form.title.trim() || null, content: form.content.trim() }),
      });
      if (!r.ok) throw new Error('Save failed');
      setForm({ ...form, title: '', content: '' });
      await fetchRules();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  }

  async function deleteRule(id: number) {
    if (!politicianId) return;
    if (!confirm('Delete this rule?')) return;
    try {
      const h = await apiHeaders();
      await fetch(`/api/ai-training/${politicianId}/${id}`, { method: 'DELETE', headers: h });
      await fetchRules();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function toggleRule(id: number, current: number) {
    if (!politicianId) return;
    try {
      const h = await apiHeaders();
      await fetch(`/api/ai-training/${politicianId}/${id}`, {
        method: 'PUT',
        headers: h,
        body: JSON.stringify({ is_active: !current }),
      });
      await fetchRules();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function runPreview() {
    if (!politicianId || !previewPrompt.trim()) return;
    setPreviewLoading(true);
    setPreviewOutput('');
    try {
      const h = await apiHeaders();
      const r = await fetch(`/api/ai-training/${politicianId}/preview`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ prompt: previewPrompt.trim(), endpoint: 'general', maxTokens: 800 }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Preview failed');
      setPreviewOutput(d.output || '');
    } catch (e: any) {
      setPreviewOutput(`Error: ${e.message}`);
    }
    setPreviewLoading(false);
  }

  if (!politicianId) {
    return (
      <div style={{ ...tokens.panel, textAlign: 'center', padding: 40 }}>
        <AlertTriangle size={40} style={{ color: C.warning, margin: '0 auto 12px' }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>No politician selected</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Switch to a politician profile to configure AI training.</div>
      </div>
    );
  }

  return (
    <div style={{ color: C.text }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ ...tokens.panel, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain size={22} style={{ color: C.accent }} /> AI Training Center
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            Teach the AI how to write for {isSuperAdmin ? 'this politician' : 'you'}.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && <Loader2 size={16} style={{ color: C.muted, animation: 'spin 1s linear infinite' }} />}
          <span style={{ fontSize: 11, color: C.muted }}>{rules.length} rules trained</span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)', color: C.error, fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Sidebar tabs */}
        <div style={{ ...tokens.panel, display: 'flex', flexDirection: 'column', gap: 6, height: 'fit-content' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? 'rgba(0,212,170,0.12)' : 'transparent',
                  color: active ? C.accent : C.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12,
                  fontWeight: active ? 800 : 600,
                }}
              >
                <Icon size={14} style={{ color: tab.color }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main panel */}
        <div style={{ ...tokens.panel, minHeight: 400 }}>
          {activeTab === 'preview' ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>Live Preview</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Test any prompt with current training injected.</div>
              <label style={tokens.label}>Prompt</label>
              <textarea value={previewPrompt} onChange={(e) => setPreviewPrompt(e.target.value)} placeholder="e.g. Write a 2-minute speech about Amalapuram development..." style={tokens.textarea} />
              <div style={{ display: 'flex', gap: 10, margin: '12px 0' }}>
                <button onClick={runPreview} disabled={previewLoading || !previewPrompt.trim()} style={{ ...tokens.btnPrimary }}>
                  {previewLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Send size={14} /> Run Preview</>}
                </button>
                <button onClick={() => setPreviewOutput('')} style={tokens.btnSecondary}>Clear</button>
              </div>
              {previewOutput && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 12, padding: 14, marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>AI Output</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{previewOutput}</div>
                </motion.div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {(() => {
                  const tab = TABS.find((t) => t.id === activeTab)!;
                  const Icon = tab.icon;
                  return <Icon size={18} style={{ color: tab.color }} />;
                })()}
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{TABS.find((t) => t.id === activeTab)?.label}</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>{TABS.find((t) => t.id === activeTab)?.desc}</div>

              {/* Add rule form */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 18 }}>
                <label style={tokens.label}>Title / Label (optional)</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Strict name spelling" style={tokens.input} />
                <div style={{ marginTop: 10 }}>
                  <label style={tokens.label}>Rule Content *</label>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={
                    activeTab === 'identity' ? 'e.g. Always refer to me as Ganti Harish Madhur, MP from Amalapuram (TDP).' :
                    activeTab === 'style' ? 'e.g. Use emotional, simple Telugu-English mix. Short sentences. End with Jai Telugu Desam.' :
                    activeTab === 'avoid' ? 'e.g. Never spell my surname as Madhav. Never use words like regime, regime change.' :
                    activeTab === 'example' ? 'Paste a good AI output here...' :
                    'e.g. Press Release: [Issue], [What happened], [My quote], [Call to action].'
                  } style={tokens.textarea} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={saveRule} disabled={saving || !form.content.trim()} style={tokens.btnPrimary}>
                    {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Plus size={14} /> Add Rule</>}
                  </button>
                </div>
              </div>

              {/* Rules list */}
              {filteredRules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: C.muted, fontSize: 12 }}>
                  <Sparkles size={28} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                  No {activeTab} rules yet. Add one above.
                </div>
              ) : (
                filteredRules.map((rule) => (
                  <motion.div key={rule.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: rule.is_active ? C.text : C.muted }}>
                          {rule.title || TABS.find((t) => t.id === rule.rule_type)?.label}
                          {!rule.is_active && <span style={{ marginLeft: 8, fontSize: 9, color: C.warning, background: 'rgba(255,167,38,0.12)', padding: '2px 6px', borderRadius: 4 }}>Paused</span>}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{rule.content}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => toggleRule(rule.id, rule.is_active)} style={tokens.btnSecondary} title={rule.is_active ? 'Pause' : 'Activate'}>
                          {rule.is_active ? 'Pause' : 'Activate'}
                        </button>
                        <button onClick={() => deleteRule(rule.id)} style={tokens.btnDanger} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
