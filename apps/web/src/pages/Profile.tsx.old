import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Building2, Award, BookOpen, Languages,
  Edit3, Save, X, Sparkles, TrendingUp, Users, Vote, Target, Activity,
  Globe, Twitter, Facebook, Instagram, Youtube, Copy, Check, Brain,
  Shield, Zap, BarChart3, Users as UsersIcon
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

import { useState as _useStateW, useEffect as _useEffectW } from 'react';
function useW() {
  const [_w, _setW] = _useStateW(typeof window !== 'undefined' ? window.innerWidth : 1440);
  _useEffectW(() => { const _fn = () => _setW(window.innerWidth); window.addEventListener('resize', _fn); return () => window.removeEventListener('resize', _fn); }, []);
  return _w;
}
const isMob = (_w: number) => _w < 640;

const T = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, backdropFilter: 'blur(20px)' } as React.CSSProperties,
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', color: '#f0f4ff', fontSize: 14, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  primary: (color: string) => ({ background: `linear-gradient(135deg,${color},${color}dd)`, border: 'none', borderRadius: 12, padding: '11px 20px', color: '#060b18', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: `0 8px 24px ${color}40` }) as React.CSSProperties,
  ghost: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', color: '#8899bb', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  ai: { background: 'linear-gradient(135deg,rgba(0,212,170,0.06),rgba(30,136,229,0.04))', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 16, padding: 20 } as React.CSSProperties,
};

interface Profile {
  id: string; full_name: string; display_name: string | null; party: string | null;
  designation: string | null; constituency_name: string | null; state: string | null;
  lok_sabha_seat: string | null; bio: string | null; education: string | null;
  languages: string | null; achievements: string | null; phone: string | null;
  email: string | null; website: string | null; twitter_handle: string | null;
  facebook_url: string | null; instagram_handle: string | null; youtube_channel: string | null;
  photo_url: string | null; color_primary: string | null; color_secondary: string | null;
  election_year: number | null; previous_terms: number | null; winning_margin: number | null;
  vote_count: number | null; total_votes_polled: number | null;
}

interface Stats {
  total_voters: number; population: number; area_sqkm: number; total_mandals: number;
  total_villages: number; total_booths: number; literacy_rate: number; sex_ratio: number;
}

export default function Profile() {
  const { activePolitician, userRole } = useAuth();
  const w = useW();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [autofillName, setAutofillName] = useState('');
  const [autofilling, setAutofilling] = useState(false);
  const [autofillMsg, setAutofillMsg] = useState('');
  const [copied, setCopied] = useState('');

  const isSuperAdmin = userRole?.role === 'super_admin';
  const primaryColor = profile?.color_primary || '#00d4aa';
  const secondaryColor = profile?.color_secondary || '#1e88e5';

  useEffect(() => { fetchProfile(); }, [activePolitician?.id]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const polId = activePolitician?.id || userRole?.politician_id;
      if (!polId) return;
      const [p, s] = await Promise.all([
        api.get(`/api/politician_profiles/${polId}`),
        api.get(`/api/constituency_profiles?politician_id=${polId}`).catch(() => [])
      ]);
      setProfile(p as Profile || null);
      setStats((s as any[])?.[0] || null);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleAutoFill() {
    if (!autofillName.trim()) return;
    setAutofilling(true);
    setAutofillMsg('');
    try {
      const data = await api.post('/api/politician-autofill', { name: autofillName, type: 'MP' });
      setProfile(prev => prev ? { ...prev, full_name: data.full_name || prev.full_name, party: data.party || prev.party, designation: data.designation || prev.designation, constituency_name: data.constituency_name || prev.constituency_name, state: data.state || prev.state, bio: data.bio || prev.bio, education: data.education || prev.education } : null);
      if (data.constituency_stats) setStats(data.constituency_stats as Stats);
      setAutofillMsg(`✓ Auto-filled (${data.confidence || 'high'} confidence)`);
    } catch (e: any) { setAutofillMsg(`⚠ ${e.message}`); }
    setAutofilling(false);
  }

  async function handleSave() {
    if (!profile) return;
    try {
      await api.put(`/api/politician_profiles/${profile.id}`, profile);
      setEditing(false);
      fetchProfile();
    } catch (e) { console.error(e); }
  }

  function copy(text: string, key: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  function fmt(num: number | null): string {
    if (!num) return '—';
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return `${num}`;
  }

  function parseArr(field: string | null): string[] {
    if (!field) return [];
    try { const p = JSON.parse(field); return Array.isArray(p) ? p : [field]; }
    catch { return [field]; }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060b18 0%, #0a1120 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${primaryColor}33`, borderTopColor: primaryColor, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060b18 0%, #0a1120 100%)', padding: isMob(w) ? 16 : 32 }}>
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: isMob(w) ? 24 : 32, fontWeight: 800, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>{profile?.full_name || 'Profile'}</h1>
            <p style={{ fontSize: 14, color: '#8899bb', margin: '6px 0 0' }}>{profile?.designation} {profile?.party && `• ${profile.party}`}</p>
          </div>
          {isSuperAdmin && !profile && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={autofillName} onChange={(e) => setAutofillName(e.target.value)} placeholder="Politician name" style={{ ...T.input, width: isMob(w) ? '100%' : 240 }} />
              <button onClick={handleAutoFill} disabled={autofilling} style={{ ...T.primary(primaryColor), opacity: autofilling ? 0.6 : 1 }}>
                {autofilling ? <div style={{ width: 16, height: 16, border: '2px solid #060b1833', borderTopColor: '#060b18', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Brain size={16} />}
                {autofilling ? '...' : 'AI Fill'}
              </button>
            </div>
          )}
          {autofillMsg && <div style={{ width: '100%', padding: '10px 14px', background: autofillMsg.includes('✓') ? 'rgba(0,212,170,0.1)' : 'rgba(255,85,85,0.1)', border: `1px solid ${autofillMsg.includes('✓') ? 'rgba(0,212,170,0.3)' : 'rgba(255,85,85,0.3)'}`, borderRadius: 12, fontSize: 12, color: autofillMsg.includes('✓') ? '#00d4aa' : '#ff5555' }}>{autofillMsg}</div>}
        </div>
      </motion.div>

      {profile && (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Hero Card */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ ...T.card, padding: isMob(w) ? 20 : 32, marginBottom: 24, background: `linear-gradient(135deg, rgba(${parseInt(primaryColor.slice(1,3),16)},${parseInt(primaryColor.slice(3,5),16)},${parseInt(primaryColor.slice(5,7),16)},0.08), rgba(255,255,255,0.02))` }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : 'auto 1fr', gap: 24, alignItems: 'center' }}>
              <div style={{ justifySelf: isMob(w) ? 'center' : 'start' }}>
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} style={{ width: isMob(w) ? 140 : 180, height: isMob(w) ? 140 : 180, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${primaryColor}40`, boxShadow: `0 20px 60px ${primaryColor}30` }} />
                ) : (
                  <div style={{ width: isMob(w) ? 140 : 180, height: isMob(w) ? 140 : 180, borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor}33, ${secondaryColor}33)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${primaryColor}40` }}>
                    <User size={isMob(w) ? 60 : 80} color={primaryColor} />
                  </div>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ padding: '6px 14px', background: `${primaryColor}22`, border: `1px solid ${primaryColor}44`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: primaryColor }}>{profile.designation}</span>
                  {profile.constituency_name && <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, fontSize: 12, color: '#8899bb' }}>{profile.constituency_name}</span>}
                  {profile.state && <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, fontSize: 12, color: '#8899bb' }}>{profile.state}</span>}
                </div>
                {profile.bio && <p style={{ fontSize: 14, color: '#aabbd0', lineHeight: 1.7, margin: '0 0 20px' }}>{profile.bio.slice(0, 200)}{profile.bio.length > 200 ? '...' : ''}</p>}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {profile.twitter_handle && <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noreferrer" style={{ ...T.ghost, padding: '8px 12px' }}><Twitter size={16} /></a>}
                  {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer" style={{ ...T.ghost, padding: '8px 12px' }}><Facebook size={16} /></a>}
                  {profile.instagram_handle && <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noreferrer" style={{ ...T.ghost, padding: '8px 12px' }}><Instagram size={16} /></a>}
                  {profile.youtube_channel && <a href={profile.youtube_channel} target="_blank" rel="noreferrer" style={{ ...T.ghost, padding: '8px 12px' }}><Youtube size={16} /></a>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ ...T.ghost, padding: '8px 12px' }}><Globe size={16} /></a>}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Election Metrics */}
          {(profile.winning_margin || profile.vote_count || profile.election_year) && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Winning Margin', value: fmt(profile.winning_margin), color: primaryColor, icon: Target },
                { label: 'Votes Received', value: fmt(profile.vote_count), color: secondaryColor, icon: Vote },
                { label: 'Vote Share', value: profile.vote_count && profile.total_votes_polled ? `${Math.round(profile.vote_count * 100 / profile.total_votes_polled)}%` : '—', color: '#a78bfa', icon: BarChart3 },
                { label: 'Election Year', value: profile.election_year || '—', color: '#ffa726', icon: Calendar },
              ].map((stat, i) => (
                <div key={i} style={{ ...T.card, padding: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}><stat.icon size={100} color={stat.color} /></div>
                  <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Constituency Stats */}
          {stats && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ ...T.card, padding: isMob(w) ? 20 : 32, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}><UsersIcon size={18} color={primaryColor} />Constituency Intelligence</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMob(w) ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Total Voters', value: fmt(stats.total_voters) },
                  { label: 'Population', value: fmt(stats.population) },
                  { label: 'Area', value: `${stats.area_sqkm || '—'} km²` },
                  { label: 'Mandals', value: stats.total_mandals || '—' },
                  { label: 'Villages', value: stats.total_villages || '—' },
                  { label: 'Polling Booths', value: fmt(stats.total_booths) },
                  { label: 'Literacy Rate', value: `${stats.literacy_rate || '—'}%` },
                  { label: 'Sex Ratio', value: stats.sex_ratio || '—' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f4ff' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Education & Languages */}
          {(profile.education || profile.languages) && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 24 }}>
              {profile.education && (
                <div style={{ ...T.card, padding: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={16} color={secondaryColor} />Education</h3>
                  <p style={{ fontSize: 13, color: '#aabbd0', lineHeight: 1.7, margin: 0 }}>{profile.education}</p>
                </div>
              )}
              {profile.languages && (
                <div style={{ ...T.card, padding: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><Languages size={16} color="#42a5f5" />Languages</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {parseArr(profile.languages).map((lang, i) => (
                      <span key={i} style={{ padding: '6px 12px', background: 'rgba(66,165,245,0.1)', border: '1px solid rgba(66,165,245,0.2)', borderRadius: 8, fontSize: 12, color: '#42a5f5', fontWeight: 600 }}>{lang}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {!profile && !isSuperAdmin && (
        <div style={{ textAlign: 'center', padding: 60, ...T.card }}>
          <Shield size={48} color="#8899bb" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff', margin: '0 0 8px' }}>Profile Not Configured</h3>
          <p style={{ fontSize: 13, color: '#8899bb', margin: 0 }}>Contact your administrator.</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
