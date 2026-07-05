import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, CheckCircle2, XCircle, Loader2, Trash2, Phone, CreditCard,
  User, MapPin, Calendar, Send, RefreshCw, ChevronDown, ChevronUp,
  AlertTriangle, Users, Building2, Vote, Tag
} from 'lucide-react';
import { useAuth } from '../lib/auth';

// ── Responsive width hook ─────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

// ── Types ─────────────────────────────────────────────────────────
interface Pilgrim {
  id: string;
  full_name: string;
  aadhaar: string;
  phone: string;
  age: string;
  gender: string;
  darshan_type: string;
  mandal: string;
  village: string;
  town: string;
  assembly_segment: string;
  voter_id: string;
  party_connection: string;
  referral_name: string;
  is_constituency_voter: boolean | null;
  occupation: string;
  notes: string;
  validation: 'idle' | 'checking' | 'valid' | 'invalid' | 'error';
  validation_msg: string;
  aadhaar_last4: string;
}

interface Quota {
  used: number;
  remaining: number;
  max: number;
  date: string;
  can_book: boolean;
}

interface PilgrimRecord {
  id: number;
  full_name: string;
  phone: string;
  aadhaar_last4: string;
  darshan_type: string;
  mandal?: string;
  village?: string;
  party_connection?: string;
  sms_sent: number;
  booking_id?: number;
  booking_ref?: string;
  status?: string;
  letter_date?: string;
}

interface ApprovalForm {
  contact_person: string;
  contact_phone: string;
  pickup_point: string;
  shrine_contacts: string;
}

// ── Constants ─────────────────────────────────────────────────────
const DARSHAN_TYPES = ['SSD Darshan', 'VIP Break Darshan', 'Special Entry Darshan', 'Arjitha Seva'];
const GENDERS = ['Male', 'Female', 'Other'];
const PARTY_CONNECTIONS = [
  { value: 'party_worker', label: 'Party Worker' },
  { value: 'voter', label: 'Voter / Supporter' },
  { value: 'general_public', label: 'General Public' },
  { value: 'referred', label: 'Referred by Karyakarta' },
];

const mkPilgrim = (): Pilgrim => ({
  id: Math.random().toString(36).slice(2),
  full_name: '',
  aadhaar: '',
  phone: '',
  age: '',
  gender: 'Male',
  darshan_type: 'SSD Darshan',
  mandal: '',
  village: '',
  town: '',
  assembly_segment: '',
  voter_id: '',
  party_connection: 'voter',
  referral_name: '',
  is_constituency_voter: null,
  occupation: '',
  notes: '',
  validation: 'idle',
  validation_msg: '',
  aadhaar_last4: '',
});

const fmtAadhaar = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 12);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8)}`;
};

// ── Premium design tokens ─────────────────────────────────────────
const C = {
  bg: '#060b18',
  panel: 'rgba(255,255,255,0.04)',
  panelHover: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.12)',
  text: '#f0f4ff',
  muted: '#8899bb',
  accent: '#00d4aa',
  accent2: '#1e88e5',
  success: '#00c864',
  error: '#ff5555',
  warning: '#ffa726',
  info: '#64b5f6',
};

const radius = 16;

const tokens = {
  panel: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: radius,
    padding: 18,
  } as React.CSSProperties,
  panelSuccess: {
    background: 'rgba(0,212,170,0.04)',
    border: '1px solid rgba(0,212,170,0.25)',
    borderRadius: radius,
    padding: 18,
  } as React.CSSProperties,
  panelError: {
    background: 'rgba(255,85,85,0.06)',
    border: '1px solid rgba(255,85,85,0.18)',
    borderRadius: radius,
    padding: 18,
  } as React.CSSProperties,
  label: {
    fontSize: 10,
    fontWeight: 700,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    display: 'block',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '10px 12px',
    color: C.text,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s, background .2s',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 9,
    fontWeight: 800,
    color: C.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as React.CSSProperties,
  btnPrimary: {
    background: 'linear-gradient(135deg, #00d4aa, #1e88e5)',
    border: 'none',
    borderRadius: 10,
    padding: '10px 18px',
    color: '#060b18',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  } as React.CSSProperties,
  btnSecondary: {
    padding: '10px 14px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${C.border}`,
    color: C.muted,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  } as React.CSSProperties,
};

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  border: `1px solid ${active ? 'rgba(0,212,170,0.35)' : C.border}`,
  background: active ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)',
  color: active ? C.accent : C.muted,
  transition: 'all .15s ease',
});

const statusMeta = (p: Pilgrim) => {
  switch (p.validation) {
    case 'valid':
      return { icon: CheckCircle2, text: p.validation_msg || 'Eligible for Darshan ✓', color: C.accent, border: 'rgba(0,212,170,0.35)', bg: 'rgba(0,212,170,0.04)' };
    case 'invalid':
      return { icon: XCircle, text: p.validation_msg || 'Not eligible', color: C.error, border: 'rgba(255,85,85,0.35)', bg: 'rgba(255,85,85,0.04)' };
    case 'checking':
      return { icon: Loader2, text: 'Checking eligibility...', color: C.info, border: 'rgba(100,181,246,0.35)', bg: 'rgba(100,181,246,0.04)' };
    case 'error':
      return { icon: AlertTriangle, text: p.validation_msg || 'Check failed', color: C.warning, border: 'rgba(255,167,38,0.35)', bg: 'rgba(255,167,38,0.04)' };
    default:
      return { icon: null, text: '', color: C.muted, border: C.border, bg: 'transparent' };
  }
};

// ── Component ──────────────────────────────────────────────────────
export default function Darshan() {
  const { getToken } = useAuth();
  const w = useWindowWidth();
  const isMobile = w < 768;

  const [quota, setQuota] = useState<Quota>({ used: 0, remaining: 6, max: 6, date: '', can_book: true });
  const [groups, setGroups] = useState<{ ref: string; id: number; status: string; pilgrims: PilgrimRecord[] }[]>([]);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([mkPilgrim()]);
  const [visitDate, setVisitDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ref: string; count: number } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRef, setExpandedRef] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    contact_person: '',
    contact_phone: '',
    pickup_point: 'TTD Ticket Counter, Tirumala',
    shrine_contacts: '155257',
  });
  const [approving, setApproving] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState('');
  const [feed, setFeed] = useState<{ id: string; text: string; color: string }[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  const apiHeaders = async () => {
    let token = '';
    try {
      token = (await getToken?.()) || '';
    } catch {
      token = '';
    }
    if (!token) token = localStorage.getItem('nethra_token') || '';
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const pilgrimsRef = useRef<Pilgrim[]>([]);
  const up = (id: string, patch: Partial<Pilgrim>) =>
    setPilgrims((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      pilgrimsRef.current = next;
      return next;
    });

  useEffect(() => {
    pilgrimsRef.current = pilgrims;
  }, [pilgrims]);

  const addFeed = (id: string, text: string, color: string) =>
    setFeed((f) => [{ id: `${id}-${Date.now()}`, text, color }, ...f].slice(0, 12));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const h = await apiHeaders();
      const [qr, br] = await Promise.all([
        fetch(`/api/darshan/quota?date=${today}`, { headers: h }),
        fetch(`/api/darshan/bookings?date=${today}&limit=100`, { headers: h }),
      ]);
      if (qr.ok) {
        const q = await qr.json();
        setQuota({
          used: q.used ?? 0,
          remaining: q.remaining ?? 6,
          max: q.max ?? 6,
          date: q.date ?? today,
          can_book: q.can_book !== false,
        });
      }
      if (br.ok) {
        const raw = await br.json();
        const list: PilgrimRecord[] = Array.isArray(raw) ? raw : raw.bookings ?? [];
        const g: Record<string, { ref: string; id: number; status: string; pilgrims: PilgrimRecord[] }> = {};
        list.forEach((p) => {
          const ref = p.booking_ref || '';
          if (!ref) return;
          if (!g[ref]) g[ref] = { ref, id: p.booking_id ?? p.id, status: p.status ?? 'pending', pilgrims: [] };
          g[ref].pilgrims.push(p);
        });
        setGroups(Object.values(g).sort((a, b) => b.ref.localeCompare(a.ref)));
      }
    } catch {
      // keep existing state
    }
    setLoading(false);
  }, [today]);

  useEffect(() => {
    fetchAll();
    const t = new Date();
    t.setDate(t.getDate() + 1);
    setVisitDate(t.toISOString().slice(0, 10));
  }, [fetchAll]);

  async function validate(id: string) {
    const current = pilgrimsRef.current;
    const p = current.find((x) => x.id === id);
    if (!p || p.validation === 'checking') return;

    const ca = p.aadhaar.replace(/\s/g, '');
    const cp = p.phone.replace(/\D/g, '').slice(-10);
    if (ca.length !== 12 || cp.length !== 10) return;

    const idx = current.findIndex((x) => x.id === id) + 1;
    up(id, { validation: 'checking', validation_msg: '' });
    addFeed(id, `Checking Pilgrim ${idx}...`, C.info);

    try {
      const h = await apiHeaders();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const r = await fetch('/api/darshan/validate-pilgrim', {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ aadhaar: ca, phone: cp }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!r.ok) throw new Error(`Validation failed (${r.status})`);
      const d = await r.json();

      if (d.valid) {
        up(id, { validation: 'valid', validation_msg: 'Eligible for Darshan ✓', aadhaar_last4: ca.slice(-4) });
        addFeed(id, `Pilgrim ${idx}${p.full_name ? ' — ' + p.full_name : ''} ✓ Eligible`, C.accent);
      } else {
        const msg = d.reason === 'already_visited'
          ? `Visited ${d.last_visit} · Next: ${d.next_eligible}`
          : (d.message || 'Not eligible');
        up(id, { validation: 'invalid', validation_msg: msg });
        addFeed(id, `Pilgrim ${idx} ✗ ${msg}`, C.error);
      }
    } catch (err: any) {
      const msg = err.name === 'AbortError' ? 'Eligibility check timed out' : 'Network error — proceed with caution';
      up(id, { validation: 'error', validation_msg: msg });
      addFeed(id, `Pilgrim ${idx} — Check failed`, C.warning);
    }
  }

  function onAadhaar(id: string, v: string) {
    up(id, { aadhaar: fmtAadhaar(v), validation: 'idle', validation_msg: '', aadhaar_last4: '' });
  }

  function onAadhaarBlur(id: string) {
    const p = pilgrimsRef.current.find((x) => x.id === id);
    if (p && p.aadhaar.replace(/\s/g, '').length === 12 && p.phone.replace(/\D/g, '').length === 10) {
      validate(id);
    }
  }

  function onPhone(id: string, v: string) {
    const d = v.replace(/\D/g, '').slice(0, 10);
    up(id, { phone: d, validation: 'idle', validation_msg: '' });
    const currentAadhaar = pilgrimsRef.current.find((x) => x.id === id)?.aadhaar || '';
    if (currentAadhaar.replace(/\s/g, '').length === 12 && d.length === 10) {
      setTimeout(() => validate(id), 300);
    }
  }

  function setCount(n: number) {
    if (n < 1 || n > quota.remaining) return;
    setPilgrims((prev) =>
      n > prev.length
        ? [...prev, ...Array.from({ length: n - prev.length }, mkPilgrim)]
        : prev.slice(0, n)
    );
  }

  const hasInvalid = pilgrims.some((p) => p.validation === 'invalid');
  const hasChecking = pilgrims.some((p) => p.validation === 'checking');
  const allNamed = pilgrims.every((p) => p.full_name.trim().length > 1);
  const allAadhaarFilled = pilgrims.every((p) => p.aadhaar.replace(/\s/g, '').length === 12);
  const allPhoneFilled = pilgrims.every((p) => p.phone.length === 10);
  const allReady =
    pilgrims.length > 0 &&
    allNamed &&
    !hasInvalid &&
    !hasChecking &&
    !!visitDate;

  async function submit() {
    if (!allReady) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const h = await apiHeaders();
      const r = await fetch('/api/darshan/bookings', {
        method: 'POST',
        headers: h,
        body: JSON.stringify({
          visit_date: visitDate,
          pilgrims: pilgrims.map((p) => ({
            full_name: p.full_name.trim(),
            aadhaar: p.aadhaar.replace(/\s/g, ''),
            phone: p.phone,
            age: parseInt(p.age) || null,
            gender: p.gender,
            darshan_type: p.darshan_type,
            address: [p.village || p.town, p.mandal].filter(Boolean).join(', '),
            mandal: p.mandal || null,
            village: p.village || null,
            town: p.town || null,
            assembly_segment: p.assembly_segment || null,
            voter_id: p.voter_id || null,
            party_connection: p.party_connection,
            referral_name: p.referral_name || null,
            is_constituency_voter: p.is_constituency_voter,
            occupation: p.occupation || null,
            notes: p.notes || null,
          })),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || d.message || 'Booking failed');
      setSubmitResult({ ref: d.booking_ref, count: pilgrims.length });
      setPilgrims([mkPilgrim()]);
      setFeed([]);
      await fetchAll();
    } catch (e: any) {
      setSubmitError(e.message);
    }
    setSubmitting(false);
  }

  async function approve() {
    if (!selectedGroup) return;
    setApproving(true);
    try {
      const h = await apiHeaders();
      const r = await fetch(`/api/darshan/bookings/${selectedGroup.id}/approve`, {
        method: 'PUT',
        headers: h,
        body: JSON.stringify({ approved_by: 'Politician', ...approvalForm }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      setApprovalMsg(`✓ Approved ${selectedGroup.pilgrims.length} pilgrims. SMS sent.`);
      setSelectedGroup(null);
      await fetchAll();
      setTimeout(() => setApprovalMsg(''), 5000);
    } catch (e: any) {
      setApprovalMsg('Error: ' + e.message);
    }
    setApproving(false);
  }

  const pct = Math.min((quota.used / quota.max) * 100, 100);
  const qC = quota.remaining === 0 ? C.error : quota.remaining <= 2 ? C.warning : C.accent;
  const R = 50;
  const circ = 2 * Math.PI * R;

  const renderPilgrimCard = (p: Pilgrim, i: number) => {
    const meta = statusMeta(p);
    const Icon = meta.icon;

    return (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        style={{
          background: meta.bg,
          border: `1px solid ${meta.border}`,
          borderRadius: radius,
          padding: 18,
          marginBottom: 12,
          transition: 'border-color 0.3s',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 0.5 }}>PILGRIM {i + 1}</span>
            {Icon && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: meta.color, background: `${meta.color}15` }}>
                <Icon size={12} style={p.validation === 'checking' ? { animation: 'spin 1s linear infinite' } : undefined} />
                {meta.text}
              </span>
            )}
          </div>
          {pilgrims.length > 1 && (
            <button onClick={() => setPilgrims((prev) => prev.filter((x) => x.id !== p.id))} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 2 }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Identity */}
        <div style={tokens.sectionTitle}><User size={12} /> Identity</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={tokens.label}>Full Name (as on Aadhaar) *</label>
            <input value={p.full_name} onChange={(e) => up(p.id, { full_name: e.target.value })} placeholder="Full name" style={tokens.input} />
          </div>
          <div>
            <label style={tokens.label}><CreditCard size={10} style={{ display: 'inline', marginRight: 4 }} />Aadhaar *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={p.aadhaar}
                onChange={(e) => onAadhaar(p.id, e.target.value)}
                onBlur={() => onAadhaarBlur(p.id)}
                placeholder="0000 0000 0000"
                maxLength={14}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                style={{ ...tokens.input, fontFamily: 'monospace', letterSpacing: 1, flex: 1, minWidth: 0 }}
              />
              {p.aadhaar.replace(/\s/g, '').length === 12 && p.phone.length === 10 && p.validation !== 'valid' && (
                <button
                  onClick={() => validate(p.id)}
                  disabled={p.validation === 'checking'}
                  style={{ ...tokens.btnSecondary, color: C.accent, borderColor: 'rgba(0,212,170,0.25)', background: 'rgba(0,212,170,0.08)' }}
                >
                  {p.validation === 'checking' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Check'}
                </button>
              )}
            </div>
          </div>
          <div>
            <label style={tokens.label}><Phone size={10} style={{ display: 'inline', marginRight: 4 }} />Mobile *</label>
            <input value={p.phone} onChange={(e) => onPhone(p.id, e.target.value)} placeholder="10 digits" maxLength={10} type="tel" style={tokens.input} />
          </div>
          <div>
            <label style={tokens.label}>Age</label>
            <input value={p.age} onChange={(e) => up(p.id, { age: e.target.value })} placeholder="Age" type="number" min="1" max="120" style={tokens.input} />
          </div>
          <div>
            <label style={tokens.label}>Gender</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {GENDERS.map((g) => (
                <button key={g} onClick={() => up(p.id, { gender: g })} style={pillStyle(p.gender === g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={tokens.label}>Darshan Type *</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DARSHAN_TYPES.map((t) => (
                <button key={t} onClick={() => up(p.id, { darshan_type: t })} style={pillStyle(p.darshan_type === t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={tokens.label}>Occupation</label>
            <input value={p.occupation} onChange={(e) => up(p.id, { occupation: e.target.value })} placeholder="Farmer, Teacher..." style={tokens.input} />
          </div>
          <div>
            <label style={tokens.label}>Voter ID (optional)</label>
            <input value={p.voter_id} onChange={(e) => up(p.id, { voter_id: e.target.value.toUpperCase() })} placeholder="AP12345678" style={{ ...tokens.input, fontFamily: 'monospace' }} />
          </div>
        </div>

        {/* Location */}
        <div style={tokens.sectionTitle}><MapPin size={12} /> Location & Constituency</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={tokens.label}>Mandal *</label>
            <input value={p.mandal} onChange={(e) => up(p.id, { mandal: e.target.value })} placeholder="e.g. Kuppam" style={tokens.input} />
          </div>
          <div>
            <label style={tokens.label}>Village</label>
            <input value={p.village} onChange={(e) => up(p.id, { village: e.target.value })} placeholder="Village name" style={tokens.input} />
          </div>
          <div>
            <label style={tokens.label}>Nearest Town</label>
            <input value={p.town} onChange={(e) => up(p.id, { town: e.target.value })} placeholder="Town" style={tokens.input} />
          </div>
          <div>
            <label style={tokens.label}><Building2 size={10} style={{ display: 'inline', marginRight: 4 }} />Assembly Segment</label>
            <input value={p.assembly_segment} onChange={(e) => up(p.id, { assembly_segment: e.target.value })} placeholder="e.g. Kuppam" style={tokens.input} />
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ ...tokens.label, marginBottom: 0, flexShrink: 0 }}><Vote size={10} style={{ display: 'inline', marginRight: 4 }} />Registered voter in constituency?</label>
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }, { v: null, l: 'Unknown' }].map((o) => (
                <button key={String(o.v)} onClick={() => up(p.id, { is_constituency_voter: o.v })} style={pillStyle(p.is_constituency_voter === o.v)}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Political connection */}
        <div style={tokens.sectionTitle}><Tag size={12} /> Political Connection</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={tokens.label}>Relationship to Politician</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PARTY_CONNECTIONS.map((c) => (
                <button key={c.value} onClick={() => up(p.id, { party_connection: c.value })} style={pillStyle(p.party_connection === c.value)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          {p.party_connection === 'referred' && (
            <div style={{ gridColumn: '1/-1' }}>
              <label style={tokens.label}>Referred by (Karyakarta name)</label>
              <input value={p.referral_name} onChange={(e) => up(p.id, { referral_name: e.target.value })} placeholder="Referring party worker name" style={tokens.input} />
            </div>
          )}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={tokens.label}>Notes</label>
            <input value={p.notes} onChange={(e) => up(p.id, { notes: e.target.value })} placeholder="Any special remarks..." style={tokens.input} />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ color: C.text, minHeight: 'calc(100vh - 120px)' }}>
      <style>{`
        .darshan-native-input { color-scheme: dark; }
        .darshan-native-input::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.6; cursor: pointer; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1023px) {
          .darshan-layout { grid-template-columns: 1fr !important; }
          .darshan-col2, .darshan-col3 { display: none !important; }
        }
        @media (min-width: 1024px) and (max-width: 1439px) {
          .darshan-layout { grid-template-columns: 240px 1fr 280px !important; }
        }
        @media (min-width: 1440px) {
          .darshan-layout { grid-template-columns: 260px 1fr 300px !important; }
        }
      `}</style>

      <div className="darshan-layout" style={{ display: 'grid', gap: 16, alignItems: 'start' }}>
        {/* ── Column 1: Quota + History ── */}
        <div className="darshan-col1" style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <div style={{ ...tokens.panel, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Daily Quota</div>
            <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 10px' }}>
              <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="55" cy="55" r={R} fill="none" stroke={qC} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: qC }}>{quota.remaining}</div>
                <div style={{ fontSize: 9, color: C.muted }}>remaining</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{quota.used} of {quota.max} used today</div>
            {quota.remaining === 0 && (
              <div style={{ marginTop: 8, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)', fontSize: 10, color: '#ff7777' }}>Daily limit reached</div>
            )}
          </div>

          <div style={{ ...tokens.panel, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Today's Bookings</span>
              <button onClick={fetchAll} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                <RefreshCw size={14} />
              </button>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 11 }}>Loading...</div>
              ) : groups.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <Star size={22} style={{ color: C.muted, opacity: 0.25, margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 11, color: C.muted }}>No bookings today</div>
                </div>
              ) : (
                groups.map((g) => {
                  const isE = expandedRef === g.ref;
                  const sc = g.status === 'approved' ? C.success : C.warning;
                  return (
                    <div key={g.ref} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button onClick={() => setExpandedRef(isE ? null : g.ref)} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{g.ref}</div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{g.pilgrims.length} pilgrim{g.pilgrims.length !== 1 ? 's' : ''}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 100, fontWeight: 700, background: `${sc}20`, color: sc }}>{g.status === 'approved' ? 'Approved' : 'Pending'}</span>
                            {isE ? <ChevronUp size={14} style={{ color: C.muted }} /> : <ChevronDown size={14} style={{ color: C.muted }} />}
                          </div>
                        </div>
                      </button>
                      {isE && (
                        <div style={{ padding: '0 14px 10px' }}>
                          {g.pilgrims.map((p, i) => (
                            <div key={i} style={{ padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{p.full_name}</div>
                              <div style={{ fontSize: 10, color: C.muted }}>****{p.aadhaar_last4} · {p.darshan_type}{p.mandal ? ` · ${p.mandal}` : ''}</div>
                              <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                                {p.party_connection === 'party_worker' ? '🟢 Party Worker' : p.party_connection === 'voter' ? '🔵 Voter' : '⚪ Public'}
                                {p.sms_sent ? ' · ✓ SMS' : ''}
                              </div>
                            </div>
                          ))}
                          {g.status !== 'approved' && (
                            <button
                              onClick={() => { setSelectedGroup(g); setExpandedRef(null); }}
                              style={{ marginTop: 8, width: '100%', padding: '8px', borderRadius: 8, background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', color: C.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Approve & Send SMS →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Column 2: Booking Form ── */}
        <div className="darshan-col2" style={{ overflow: 'auto', paddingRight: 2 }}>
          {submitResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...tokens.panelSuccess, textAlign: 'center', marginBottom: 14 }}>
              <CheckCircle2 size={36} style={{ color: C.accent, margin: '0 auto 10px' }} />
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>Booking Submitted</div>
              <div style={{ fontSize: 12, color: C.accent, fontFamily: 'monospace', marginBottom: 6 }}>{submitResult.ref}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>{submitResult.count} pilgrim{submitResult.count !== 1 ? 's' : ''} · Awaiting approval</div>
              <button onClick={() => setSubmitResult(null)} style={tokens.btnPrimary}>Book More Pilgrims</button>
            </motion.div>
          ) : (
            <>
              <div style={{ ...tokens.panel, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>New Darshan Booking</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{quota.remaining} slot{quota.remaining !== 1 ? 's' : ''} available · Aadhaar verified</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => {
                      const dis = n > quota.remaining;
                      const sel = pilgrims.length === n;
                      return (
                        <button
                          key={n}
                          onClick={() => !dis && setCount(n)}
                          disabled={dis}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: dis ? 'not-allowed' : 'pointer',
                            background: sel ? 'linear-gradient(135deg,#00d4aa,#1e88e5)' : dis ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                            color: sel ? '#060b18' : dis ? 'rgba(136,153,187,0.25)' : C.text,
                            border: sel ? 'none' : `1px solid ${C.border}`,
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <label style={tokens.label}><Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />VISIT DATE *</label>
                <input
                  type="date"
                  value={visitDate}
                  min={today}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="darshan-native-input"
                  style={{ ...tokens.input, colorScheme: 'dark' }}
                />
              </div>

              {submitError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)', color: '#ff7777', fontSize: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} />
                  {submitError}
                </div>
              )}

              {pilgrims.map((p, i) => renderPilgrimCard(p, i))}

              <AnimatePresence>
                {pilgrims.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      ...tokens.panel,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: allReady ? '1px solid rgba(0,212,170,0.3)' : `1px solid ${C.border}`,
                      marginBottom: 24,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                        {pilgrims.filter((p) => p.validation === 'valid').length} of {pilgrims.length} verified
                      </div>
                      {!visitDate && <div style={{ fontSize: 10, color: C.warning, marginTop: 2 }}>Select visit date above</div>}
                      {hasInvalid && <div style={{ fontSize: 10, color: C.error, marginTop: 2 }}>Remove ineligible pilgrims first</div>}
                      {hasChecking && <div style={{ fontSize: 10, color: C.info, marginTop: 2 }}>Waiting for verification...</div>}
                      {!hasInvalid && !hasChecking && allNamed && visitDate && pilgrims.some((p) => p.validation === 'idle') && (
                        <div style={{ fontSize: 10, color: C.warning, marginTop: 2 }}>
                          {allAadhaarFilled && allPhoneFilled ? 'Click Check to verify eligibility' : 'Fill Aadhaar + Phone to verify'}
                        </div>
                      )}
                      {allReady && pilgrims.every((p) => p.validation === 'valid') && <div style={{ fontSize: 10, color: C.accent, marginTop: 2 }}>All pilgrims verified ✓</div>}
                    </div>
                    <button onClick={submit} disabled={!allReady || submitting || quota.remaining === 0} style={{ ...tokens.btnPrimary, opacity: !allReady || quota.remaining === 0 ? 0.4 : 1 }}>
                      {submitting ? (
                        <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Submitting...</>
                      ) : (
                        <><Send size={14} />Submit for Approval</>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* ── Column 3: Feed + Approval ── */}
        <div className="darshan-col3" style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          {approvalMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: approvalMsg.includes('Error') ? 'rgba(255,85,85,0.1)' : 'rgba(0,212,170,0.1)', border: `1px solid ${approvalMsg.includes('Error') ? 'rgba(255,85,85,0.2)' : 'rgba(0,212,170,0.2)'}`, color: approvalMsg.includes('Error') ? C.error : C.accent }}>
              {approvalMsg}
            </motion.div>
          )}

          {selectedGroup ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ ...tokens.panel, border: '1px solid rgba(0,212,170,0.2)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Approve Booking</div>
              <div style={{ fontSize: 10, color: C.accent, fontFamily: 'monospace', marginBottom: 12 }}>{selectedGroup.ref}</div>
              {selectedGroup.pilgrims.map((p, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                  <div style={{ color: C.text, fontWeight: 600 }}>{p.full_name}</div>
                  <div style={{ color: C.muted, fontSize: 10 }}>{p.darshan_type} · ****{p.aadhaar_last4}{p.mandal ? ` · ${p.mandal}` : ''}</div>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                {[{ k: 'contact_person', l: 'Contact Person *', ph: 'Name' }, { k: 'contact_phone', l: 'Contact Phone *', ph: '10-digit' }, { k: 'pickup_point', l: 'Pickup Point', ph: 'TTD office' }, { k: 'shrine_contacts', l: 'Helpline', ph: '155257' }].map(({ k, l, ph }) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <label style={tokens.label}>{l}</label>
                    <input value={(approvalForm as any)[k]} onChange={(e) => setApprovalForm((f) => ({ ...f, [k]: e.target.value }))} placeholder={ph} style={tokens.input} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => setSelectedGroup(null)} style={{ ...tokens.btnSecondary, flex: 1 }}>Cancel</button>
                  <button onClick={approve} disabled={approving || !approvalForm.contact_person} style={{ ...tokens.btnPrimary, flex: 2, opacity: approving ? 0.7 : 1 }}>
                    {approving ? (
                      <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Sending...</>
                    ) : (
                      <><Send size={14} />Approve & SMS</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <div style={tokens.panel}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Validation Feed</div>
                <div style={{ fontSize: 10, color: C.muted }}>Live Aadhaar eligibility checks</div>
              </div>
              <div style={{ ...tokens.panel, flex: 1 }}>
                {feed.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Users size={22} style={{ color: C.muted, opacity: 0.25, margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 10, color: C.muted }}>Enter Aadhaar + Phone to see results</div>
                  </div>
                ) : (
                  feed.map((f) => (
                    <motion.div key={f.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.color, flexShrink: 0, marginTop: 4 }} />
                      <span style={{ color: '#d0d8ee', lineHeight: 1.4 }}>{f.text}</span>
                    </motion.div>
                  ))
                )}
              </div>
              {groups.length > 0 && (() => {
                const all = groups.flatMap((g) => g.pilgrims);
                const workers = all.filter((p) => p.party_connection === 'party_worker').length;
                const voters = all.filter((p) => p.party_connection === 'voter').length;
                const mandals = [...new Set(all.map((p) => p.mandal).filter(Boolean))];
                return (
                  <div style={tokens.panel}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Today's Intel</div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                      <div style={{ background: 'rgba(0,200,100,0.06)', border: '1px solid rgba(0,200,100,0.12)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.success }}>{workers}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>Party workers</div>
                      </div>
                      <div style={{ background: 'rgba(30,136,229,0.06)', border: '1px solid rgba(30,136,229,0.12)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.info }}>{voters}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>Voters/supporters</div>
                      </div>
                      <div style={{ gridColumn: '1/-1', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>Mandals reached today</div>
                        <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{mandals.length > 0 ? mandals.join(', ') : '—'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
