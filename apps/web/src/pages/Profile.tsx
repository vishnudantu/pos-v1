import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Building2, Calendar, Award, BookOpen, Languages,
  Edit3, Save, X, Camera, Sparkles, TrendingUp, Users, Map, Vote,
  Target, Activity, BarChart3, CheckCircle2, Info,
  Globe, Twitter, Facebook, Instagram, Youtube,
  Copy, Check, Brain, Vote as VoteIcon, MapPin as LocationIcon
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
const isTab = (_w: number) => _w >= 640 && _w < 1024;

const T = {
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 } as React.CSSProperties,
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 13px', color: '#f0f4ff', fontSize: 13, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 700, color: '#8899bb', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 6 } as React.CSSProperties,
  primary: { background: 'linear-gradient(135deg,#00d4aa,#1e88e5)', border: 'none', borderRadius: 10, padding: '9px 20px', color: '#060b18', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' } as React.CSSProperties,
  ghost: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 16px', color: '#f0f4ff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  ai: { background: 'linear-gradient(135deg,rgba(0,212,170,0.08),rgba(30,136,229,0.05))', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 14, padding: 16 } as React.CSSProperties,
};

interface PoliticianProfile {
  id: string; full_name: string; display_name: string | null; party: string | null;
  designation: string | null; constituency_name: string | null; state: string | null;
  lok_sabha_seat: string | null; bio: string | null; education: string | null;
  age: number | null; dob: string | null; languages: string | null; achievements: string | null;
  phone: string | null; email: string | null; office_address: string | null; website: string | null;
  twitter_handle: string | null; facebook_url: string | null; instagram_handle: string | null;
  youtube_channel: string | null; photo_url: string | null; color_primary: string | null;
  color_secondary: string | null; election_year: number | null; term_start: string | null;
  term_end: string | null; previous_terms: number | null; winning_margin: number | null;
  vote_count: number | null; total_votes_polled: number | null; slug: string | null;
  is_active: boolean; subscription_status: string | null; deployed_at: string | null;
}

interface ConstituencyStats {
  total_voters: number; registered_voters: number; area_sqkm: number; population: number;
  total_mandals: number; total_villages: number; total_booths: number;
  literacy_rate: number; sex_ratio: number;
}

export default function PoliticianProfile() {
  const { activePolitician, userRole } = useAuth();
  const w = useW();
  
  const [profile, setProfile] = useState<PoliticianProfile | null>(null);
  const [stats, setStats] = useState<ConstituencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillName, setAutofillName] = useState('');
  const [autofillType, setAutofillType] = useState<'MP' | 'MLA'>('MP');
  const [autofillSuccess, setAutofillSuccess] = useState('');
  const [autofillError, setAutofillError] = useState('');
  const [copied, setCopied] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  const isSuperAdmin = userRole?.role === 'super_admin';
  const isPoliticianAdmin = userRole?.role === 'politician_admin';
  const canEdit = isSuperAdmin || isPoliticianAdmin;

  useEffect(() => {
    fetchProfile();
  }, [activePolitician?.id]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const polId = activePolitician?.id || userRole?.politician_id;
      if (!polId) return;
      
      const [profileData, statsData] = await Promise.all([
        api.get(`/api/politician_profiles/${polId}`),
        api.get(`/api/constituency_profiles?politician_id=${polId}`).catch(() => [])
      ]);
      
      setProfile(profileData as PoliticianProfile || null);
      setStats((statsData as any[])?.[0] || null);
    } catch (err) {
      console.error('[fetchProfile]', err);
    }
    setLoading(false);
  }

  async function handleAutoFill() {
    if (!autofillName.trim()) {
      setAutofillError('Enter politician name first');
      return;
    }
    setAutofilling(true);
    setAutofillError('');
    setAutofillSuccess('');
    
    try {
      const data = await api.post('/api/politician-autofill', { 
        name: autofillName, 
        type: autofillType 
      });
      
      setProfile(prev => prev ? {
        ...prev,
        full_name: data.full_name || prev.full_name,
        party: data.party || prev.party,
        designation: data.designation || prev.designation,
        constituency_name: data.constituency_name || prev.constituency_name,
        state: data.state || prev.state,
        lok_sabha_seat: data.lok_sabha_seat || prev.lok_sabha_seat,
        bio: data.bio || prev.bio,
        education: data.education || prev.education,
        languages: data.languages ? JSON.stringify(data.languages) : prev.languages,
        achievements: data.achievements ? JSON.stringify(data.achievements) : prev.achievements,
        election_year: data.election_year || prev.election_year,
        twitter_handle: data.twitter_handle || prev.twitter_handle,
        website: data.website || prev.website,
      } : null);
      
      if (data.constituency_stats) {
        setStats(data.constituency_stats as ConstituencyStats);
      }
      
      setAutofillSuccess(`Auto-filled from AI (confidence: ${data.confidence || 'high'})`);
    } catch (err: any) {
      setAutofillError(err.message || 'Auto-fill failed');
    }
    setAutofilling(false);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put(`/api/politician_profiles/${profile.id}`, profile);
      
      if (stats) {
        const existingStats = await api.get(`/api/constituency_profiles?politician_id=${profile.id}`).catch(() => []);
        if ((existingStats as any[])?.length) {
          await api.update('constituency_profiles', (existingStats as any[])[0].id, stats);
        } else {
          await api.create('constituency_profiles', { ...stats, politician_id: profile.id });
        }
      }
      
      setEditing(false);
    } catch (err) {
      console.error('[save]', err);
    }
    setSaving(false);
  }

  function copyToClipboard(text: string, key: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  function parseArray(field: string | null): string[] {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch {
      return [field];
    }
  }

  function formatNumber(num: number | null): string {
    if (!num) return '—';
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return `${num}`;
  }

  const primaryColor = profile?.color_primary || '#00d4aa';
  const secondaryColor = profile?.color_secondary || '#1e88e5';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060b18 0%, #0a1120 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${primaryColor}33`, borderTopColor: primaryColor, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: '#8899bb', fontSize: 13 }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060b18 0%, #0a1120 100%)', paddingBottom: 80 }}>
      {/* Command Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6,11,24,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: isMob(w) ? '12px 16px' : '16px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: isMob(w) ? 18 : 20, 
              fontWeight: 800, 
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              {profile?.full_name || 'Politician Profile'}
            </h1>
            <p style={{ fontSize: 12, color: '#8899bb', margin: '4px 0 0' }}>
              {profile?.designation} {profile?.constituency_name && `• ${profile.constituency_name}`}
            </p>
          </div>
          
          {canEdit && (
            <div style={{ display: 'flex', gap: 8 }}>
              {!editing ? (
                <button onClick={() => setEditing(true)} style={T.ghost}>
                  <Edit3 size={16} />
                  {!isMob(w) && ' Edit'}
                </button>
              ) : (
                <>
                  <button onClick={() => { setEditing(false); fetchProfile(); }} style={T.ghost}>
                    <X size={16} />
                    {!isMob(w) && ' Cancel'}
                  </button>
                  <button onClick={handleSave} style={T.primary} disabled={saving}>
                    {saving ? <div style={{ width: 14, height: 14, border: '2px solid #060b1833', borderTopColor: '#060b18', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    {!isMob(w) && (saving ? 'Saving...' : ' Save')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMob(w) ? 16 : 24 }}>
        {/* AI Auto-Fill Section (Super Admin Only) */}
        {isSuperAdmin && !profile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ ...T.ai, marginBottom: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Brain size={20} color={primaryColor} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f0f4ff' }}>AI Profile Auto-Fill</h3>
            </div>
            <p style={{ fontSize: 12, color: '#8899bb', margin: '0 0 12px' }}>
              Enter politician name and let AI fetch their complete profile from public data
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                value={autofillName}
                onChange={(e) => setAutofillName(e.target.value)}
                placeholder="e.g. GM Harish Balayogi"
                style={{ ...T.input, flex: 1, minWidth: 200 }}
              />
              <select
                value={autofillType}
                onChange={(e) => setAutofillType(e.target.value as 'MP' | 'MLA')}
                style={{ ...T.input, width: 'auto', minWidth: 80 }}
              >
                <option value="MP">MP</option>
                <option value="MLA">MLA</option>
              </select>
              <button 
                onClick={handleAutoFill} 
                disabled={autofilling || !autofillName.trim()}
                style={{ ...T.primary, opacity: autofilling || !autofillName.trim() ? 0.6 : 1 }}
              >
                {autofilling ? <div style={{ width: 14, height: 14, border: '2px solid #060b1833', borderTopColor: '#060b18', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                {autofilling ? 'Fetching...' : 'Auto-Fill'}
              </button>
            </div>
            {autofillSuccess && <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 8, fontSize: 12, color: '#00d4aa' }}>✓ {autofillSuccess}</div>}
            {autofillError && <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,85,85,0.15)', border: '1px solid rgba(255,85,85,0.3)', borderRadius: 8, fontSize: 12, color: '#ff5555' }}>⚠ {autofillError}</div>}
          </motion.div>
        )}

        {/* Profile Photo & Quick Stats */}
        {profile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : '300px 1fr', gap: 24, marginBottom: 24 }}
          >
            {/* Photo Card */}
            <div style={{ ...T.card, padding: 24, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {profile.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt={profile.full_name}
                    style={{ width: 200, height: 200, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${primaryColor}33` }}
                  />
                ) : (
                  <div style={{ width: 200, height: 200, borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor}22, ${secondaryColor}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={80} color={primaryColor} />
                  </div>
                )}
                {canEdit && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: primaryColor, borderRadius: '50%', padding: 8, cursor: 'pointer' }}>
                    <Camera size={16} color="#060b18" />
                  </div>
                )}
              </div>
              <h2 style={{ margin: '16px 0 4px', fontSize: 18, fontWeight: 700, color: '#f0f4ff' }}>{profile.full_name}</h2>
              <p style={{ fontSize: 13, color: '#8899bb', margin: 0 }}>{profile.party}</p>
              {profile.constituency_name && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#8899bb' }}>
                  <MapPin size={12} />
                  {profile.constituency_name}, {profile.state}
                </div>
              )}
            </div>

            {/* Basic Info Card */}
            <div style={{ ...T.card, padding: isMob(w) ? 16 : 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color={primaryColor} />
                Basic Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={T.label}>Designation</label>
                  <div style={{ fontSize: 14, color: '#f0f4ff' }}>{profile.designation || '—'}</div>
                </div>
                <div>
                  <label style={T.label}>Party</label>
                  <div style={{ fontSize: 14, color: '#f0f4ff' }}>{profile.party || '—'}</div>
                </div>
                {profile.lok_sabha_seat && (
                  <div>
                    <label style={T.label}>Lok Sabha Seat</label>
                    <div style={{ fontSize: 14, color: '#f0f4ff' }}>{profile.lok_sabha_seat}</div>
                  </div>
                )}
                <div>
                  <label style={T.label}>State</label>
                  <div style={{ fontSize: 14, color: '#f0f4ff' }}>{profile.state || '—'}</div>
                </div>
                {profile.email && (
                  <div>
                    <label style={T.label}>Email</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: '#f0f4ff' }}>{profile.email}</span>
                      <button onClick={() => copyToClipboard(profile.email!, 'email')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8899bb' }}>
                        {copied === 'email' ? <Check size={14} color="#00d4aa" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
                {profile.phone && (
                  <div>
                    <label style={T.label}>Phone</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: '#f0f4ff' }}>{profile.phone}</span>
                      <button onClick={() => copyToClipboard(profile.phone!, 'phone')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8899bb' }}>
                        {copied === 'phone' ? <Check size={14} color="#00d4aa" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(profile.twitter_handle || profile.facebook_url || profile.instagram_handle || profile.youtube_channel || profile.website) && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <label style={T.label}>Social Media</label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                    {profile.twitter_handle && (
                      <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" style={{ ...T.ghost, padding: '6px 10px' }}>
                        <Twitter size={16} />
                      </a>
                    )}
                    {profile.facebook_url && (
                      <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" style={{ ...T.ghost, padding: '6px 10px' }}>
                        <Facebook size={16} />
                      </a>
                    )}
                    {profile.instagram_handle && (
                      <a href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noopener noreferrer" style={{ ...T.ghost, padding: '6px 10px' }}>
                        <Instagram size={16} />
                      </a>
                    )}
                    {profile.youtube_channel && (
                      <a href={profile.youtube_channel} target="_blank" rel="noopener noreferrer" style={{ ...T.ghost, padding: '6px 10px' }}>
                        <Youtube size={16} />
                      </a>
                    )}
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ ...T.ghost, padding: '6px 10px' }}>
                        <Globe size={16} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Election Metrics */}
        {profile && (profile.winning_margin || profile.vote_count || profile.election_year) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ ...T.card, padding: isMob(w) ? 16 : 24, marginBottom: 24 }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <VoteIcon size={18} color={primaryColor} />
              Election Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(0,212,170,0.08)', borderRadius: 12, border: '1px solid rgba(0,212,170,0.2)' }}>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Winning Margin</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: primaryColor }}>{formatNumber(profile.winning_margin)}</div>
                <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4 }}>votes</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(30,136,229,0.08)', borderRadius: 12, border: '1px solid rgba(30,136,229,0.2)' }}>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Votes Received</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: secondaryColor }}>{formatNumber(profile.vote_count)}</div>
                <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4 }}>total votes</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(167,139,250,0.08)', borderRadius: 12, border: '1px solid rgba(167,139,250,0.2)' }}>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Vote Share</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#a78bfa' }}>
                  {profile.vote_count && profile.total_votes_polled ? `${Math.round(profile.vote_count * 100 / profile.total_votes_polled)}%` : '—'}
                </div>
                <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4 }}>of total polled</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(255,167,38,0.08)', borderRadius: 12, border: '1px solid rgba(255,167,38,0.2)' }}>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginBottom: 4 }}>Election Year</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffa726' }}>{profile.election_year || '—'}</div>
                <div style={{ fontSize: 11, color: '#8899bb', marginTop: 4 }}>
                  {profile.previous_terms ? `${profile.previous_terms} previous term${profile.previous_terms > 1 ? 's' : ''}` : 'First term'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Constituency Statistics */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ ...T.card, padding: isMob(w) ? 16 : 24, marginBottom: 24 }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Map size={18} color={primaryColor} />
              Constituency Statistics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: primaryColor }}>{formatNumber(stats.total_voters)}</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Total Voters</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: secondaryColor }}>{formatNumber(stats.population)}</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Population</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#42a5f5' }}>{stats.area_sqkm || '—'}</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Area (sq km)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ab47bc' }}>{stats.total_mandals || '—'}</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Mandals</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ffa726' }}>{stats.total_villages || '—'}</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Villages</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr 1fr' : '1fr 1fr 1fr', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#00d4aa' }}>{stats.literacy_rate || '—'}%</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Literacy Rate</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#26c6da' }}>{stats.sex_ratio || '—'}</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Sex Ratio</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#64b5f6' }}>{formatNumber(stats.total_booths)}</div>
                <div style={{ fontSize: 11, color: '#8899bb', textTransform: 'uppercase', marginTop: 4 }}>Polling Booths</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bio & Education */}
        {profile && (profile.bio || profile.education) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : '1fr 1fr', gap: 24 }}
          >
            {/* Bio */}
            {profile.bio && (
              <div style={{ ...T.card, padding: isMob(w) ? 16 : 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={18} color={primaryColor} />
                  Biography
                </h3>
                <div style={{ fontSize: 13, color: '#aabbd0', lineHeight: 1.7 }}>
                  {profile.bio.length > 200 && !showBioExpand ? (
                    <>
                      {profile.bio.slice(0, 200)}...
                      <button onClick={() => setShowBioExpand(true)} style={{ background: 'none', border: 'none', color: primaryColor, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 4 }}>Read more</button>
                    </>
                  ) : (
                    <>
                      {profile.bio}
                      {profile.bio.length > 200 && (
                        <button onClick={() => setShowBioExpand(false)} style={{ background: 'none', border: 'none', color: primaryColor, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 4 }}>Show less</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && (
              <div style={{ ...T.card, padding: isMob(w) ? 16 : 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color={secondaryColor} />
                  Education
                </h3>
                <div style={{ fontSize: 13, color: '#aabbd0', lineHeight: 1.7 }}>{profile.education}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Languages & Achievements */}
        {profile && (profile.languages || profile.achievements) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'grid', gridTemplateColumns: isMob(w) ? '1fr' : '1fr 1fr', gap: 24, marginTop: 24 }}
          >
            {/* Languages */}
            {profile.languages && (
              <div style={{ ...T.card, padding: isMob(w) ? 16 : 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Languages size={18} color="#42a5f5" />
                  Languages
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {parseArray(profile.languages).map((lang, idx) => (
                    <span key={idx} style={{ padding: '6px 12px', background: 'rgba(66,165,245,0.15)', border: '1px solid rgba(66,165,245,0.3)', borderRadius: 8, fontSize: 12, color: '#42a5f5', fontWeight: 600 }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements && (
              <div style={{ ...T.card, padding: isMob(w) ? 16 : 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={18} color="#ffa726" />
                  Achievements
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {parseArray(profile.achievements).map((achievement, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle2 size={16} color="#ffa726" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#aabbd0', lineHeight: 1.5 }}>{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!profile && !isSuperAdmin && (
          <div style={{ textAlign: 'center', padding: 60, ...T.card }}>
            <Info size={48} color="#8899bb" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#f0f4ff' }}>No Profile Found</h3>
            <p style={{ fontSize: 13, color: '#8899bb', margin: 0 }}>Contact your administrator to set up your profile.</p>
          </div>
        )}
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
