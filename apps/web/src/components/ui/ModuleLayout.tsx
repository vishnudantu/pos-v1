import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, X, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

// ── Responsive hook (inline only — never import from shared file) ──
import { useState as _useStateW, useEffect as _useEffectW } from 'react';
export function useW() {
  const [_w, _setW] = _useStateW(typeof window !== 'undefined' ? window.innerWidth : 1440);
  _useEffectW(() => { const _fn = () => _setW(window.innerWidth); window.addEventListener('resize', _fn); return () => window.removeEventListener('resize', _fn); }, []);
  return _w;
}
export const isMob = (_w: number) => _w < 640;
export const isTab = (_w: number) => _w >= 640 && _w < 1024;

// ── Design tokens ──────────────────────────────────────────────────
export const T = {
  card: { background: 'var(--nethra-card)', border: '1px solid var(--nethra-border)', borderRadius: 'var(--nethra-radius)' } as React.CSSProperties,
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--nethra-radius-sm)', padding: '11px 14px', color: '#f0f4ff', fontSize: 14, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 700, color: '#8899bb', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 } as React.CSSProperties,
  primary: { background: 'linear-gradient(135deg,var(--nethra-teal),var(--nethra-blue))', border: 'none', borderRadius: 'var(--nethra-radius-sm)', padding: '11px 20px', color: '#060b18', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', justifyContent: 'center' } as React.CSSProperties,
  ghost: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--nethra-radius-sm)', padding: '10px 16px', color: '#f0f4ff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' } as React.CSSProperties,
  ai: { background: 'linear-gradient(135deg,rgba(0,212,170,0.08),rgba(30,136,229,0.05))', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 'var(--nethra-radius)', padding: 16 } as React.CSSProperties,
  pill: (on: boolean) => ({ padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: on ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${on ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.08)'}`, color: on ? '#00d4aa' : '#8899bb' }) as React.CSSProperties,
};

export const getToken = () => localStorage.getItem('nethra_token') || '';
export const authHeaders = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

export function FadeIn({ children, delay = 0, className = '', direction = 'up' }: { children: ReactNode; delay?: number; className?: string; direction?: 'up' | 'down' | 'left' | 'right' | 'none' }) {
  const dist = direction === 'none' ? 0 : 18;
  const y = direction === 'up' ? dist : direction === 'down' ? -dist : 0;
  const x = direction === 'left' ? dist : direction === 'right' ? -dist : 0;
  return (
    <motion.div initial={{ opacity: 0, y, x }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export function Card({ children, className = '', hover = true, onClick }: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <motion.div onClick={onClick} className={`nethra-glass overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`} style={hover ? { transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' } : undefined} whileHover={hover ? { y: -2, borderColor: 'rgba(255,255,255,0.14)' } : undefined} whileTap={onClick ? { scale: 0.99 } : undefined}>
      {children}
    </motion.div>
  );
}

export function Stat({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon: any }) {
  return (
    <Card className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={19} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: '#8899bb', marginTop: 2 }}>{label}</div>
      </div>
    </Card>
  );
}

export function AIPanel({ title, content, onClose, loading, endpoint, politicianId, error }: { title?: string; content?: string; onClose?: () => void; loading?: boolean; endpoint?: string; politicianId?: number; error?: string }) {
  const [fed, setFed] = useState<'positive' | 'negative' | null>(null);
  const [saving, setSaving] = useState(false);

  async function sendFeedback(type: 'positive' | 'negative') {
    if (!content || !endpoint) return;
    setSaving(true);
    try {
      await fetch('/api/ai-training/feedback', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ endpoint, ai_output: content, feedback: type, politician_id: politicianId }) });
      setFed(type);
    } catch (_) {}
    setSaving(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={T.ai}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: loading ? 0 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {error ? <AlertCircle size={13} style={{ color: '#ff7777' }} /> : <Sparkles size={13} style={{ color: loading ? '#8899bb' : '#00d4aa' }} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: loading ? '#8899bb' : error ? '#ff7777' : '#00d4aa', textTransform: 'uppercase', letterSpacing: 0.8 }}>{loading ? 'AI Thinking...' : error ? 'AI Error' : (title || 'AI Analysis')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!loading && content && endpoint && !fed && !error && (
            <>
              <button onClick={() => sendFeedback('positive')} disabled={saving} style={{ background: 'none', border: 'none', color: '#8899bb', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }} title="This output is good — train AI"><ThumbsUp size={11} /></button>
              <button onClick={() => sendFeedback('negative')} disabled={saving} style={{ background: 'none', border: 'none', color: '#8899bb', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }} title="This output needs improvement"><ThumbsDown size={11} /></button>
            </>
          )}
          {fed && <span style={{ fontSize: 10, color: fed === 'positive' ? '#00c864' : '#ff7777', display: 'flex', alignItems: 'center', gap: 3 }}>{fed === 'positive' ? <><ThumbsUp size={10} /> Saved</> : <><ThumbsDown size={10} /> Noted</>}</span>}
          {onClose && !loading && <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8899bb', cursor: 'pointer', padding: 0, marginLeft: 2 }}><X size={13} /></button>}
        </div>
      </div>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          <Loader2 size={16} style={{ color: '#00d4aa', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#8899bb' }}>Analysing your constituency data...</span>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: error ? '#ff9999' : '#d0d8ee', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>{error || content}</p>
      )}
    </motion.div>
  );
}

export function Empty({ icon: Icon, title, sub, action, onAction }: { icon: any; title: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <Card className="px-6 py-12 sm:py-16 text-center">
      <Icon size={36} style={{ color: '#8899bb', opacity: 0.25, margin: '0 auto 14px', display: 'block' }} />
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: '#8899bb', marginBottom: action ? 18 : 0 }}>{sub}</div>}
      {action && onAction && <button onClick={onAction} style={{ ...T.primary, margin: '0 auto', display: 'inline-flex' }}>{action}</button>}
    </Card>
  );
}

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: '#8899bb' }}>
      <Loader2 size={26} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px', display: 'block', color: '#00d4aa' }} />
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

export function Modal({ onClose, title, children, maxW = 520 }: { onClose: () => void; title: string; children: ReactNode; maxW?: number }) {
  const w = useW();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,11,24,0.88)', display: 'flex', alignItems: isMob(w) ? 'flex-end' : 'center', justifyContent: 'center', padding: isMob(w) ? 0 : 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={isMob(w) ? { y: '100%' } : { scale: 0.94, opacity: 0 }} animate={isMob(w) ? { y: 0 } : { scale: 1, opacity: 1 }} exit={isMob(w) ? { y: '100%' } : { scale: 0.94, opacity: 0 }}
        style={{ background: '#0d1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: isMob(w) ? '20px 20px 0 0' : 20, padding: isMob(w) ? '20px 16px' : 24, width: '100%', maxWidth: isMob(w) ? '100%' : maxW, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff', fontFamily: 'Space Grotesk' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8899bb' }}><X size={16} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <FadeIn className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold nethra-gradient-text font-display">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-content-secondary mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </FadeIn>
  );
}
