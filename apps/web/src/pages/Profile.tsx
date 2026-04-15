import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Award, BookOpen, Languages,
  Edit3, Save, X, Sparkles, Globe, Twitter, Facebook,
  Instagram, Youtube, Copy, Check, Brain, TrendingUp,
  Users, Vote, Calendar, BarChart3
} from 'lucide-react';
import {
  Card, Button, Text, Title, Badge, Avatar, Group, Stack,
  Grid, SimpleGrid, Divider, Box, Container, ActionIcon,
  Tooltip, Loader, Center, ThemeIcon, RingProgress, Progress
} from '@mantine/core';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

// Inline useW hook (per Development Bible)
import { useState as _useStateW, useEffect as _useEffectW } from 'react';
function useW() {
  const [_w, _setW] = _useStateW(typeof window !== 'undefined' ? window.innerWidth : 1440);
  _useEffectW(() => { const _fn = () => _setW(window.innerWidth); window.addEventListener('resize', _fn); return () => window.removeEventListener('resize', _fn); }, []);
  return _w;
}
const isMob = (_w: number) => _w < 640;

interface Profile {
  id: string; full_name: string; party: string | null; designation: string | null;
  constituency_name: string | null; state: string | null; lok_sabha_seat: string | null;
  bio: string | null; education: string | null; languages: string | null;
  achievements: string | null; phone: string | null; email: string | null;
  website: string | null; twitter_handle: string | null; facebook_url: string | null;
  instagram_handle: string | null; youtube_channel: string | null;
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
  const { primaryColor, secondaryColor } = useTheme();
  const w = useW();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autofillName, setAutofillName] = useState('');
  const [autofilling, setAutofilling] = useState(false);
  const [autofillMsg, setAutofillMsg] = useState('');
  const [copied, setCopied] = useState('');

  const isSuperAdmin = userRole?.role === 'super_admin';

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
      <Center style={{ minHeight: '100vh', background: `linear-gradient(180deg, #060b18 0%, #0a1120 100%)` }}>
        <Loader size="xl" variant="dots" color={primaryColor} />
      </Center>
    );
  }

  return (
    <Container size="xl" style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(180deg, #060b18 0%, #0a1120 100%)`,
      padding: isMob(w) ? 16 : 32,
    }}>
      {/* AI Auto-Fill (Super Admin) */}
      {isSuperAdmin && !profile && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ marginBottom: 32 }}
        >
          <Card 
            padding="xl" 
            radius="xl"
            style={{ 
              background: `linear-gradient(135deg, rgba(0,212,170,0.06), rgba(30,136,229,0.04))`,
              border: `1px solid rgba(0,212,170,0.15)`,
            }}
          >
            <Group gap="sm" mb="md">
              <ThemeIcon size="lg" radius="xl" variant="light" color={primaryColor}>
                <Brain size={20} />
              </ThemeIcon>
              <Title order={3} c="#f0f4ff">AI Profile Auto-Fill</Title>
            </Group>
            <Text c="#8899bb" size="sm" mb="md">
              Enter politician name and let AI fetch their complete profile from public data
            </Text>
            <Group gap="xs" wrap={isMob(w) ? 'wrap' : 'nowrap'}>
              <input
                value={autofillName}
                onChange={(e) => setAutofillName(e.target.value)}
                placeholder="e.g. GM Harish Balayogi"
                style={{ 
                  flex: 1, 
                  minWidth: 200,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f0f4ff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <Button
                onClick={handleAutoFill}
                loading={autofilling}
                leftSection={<Sparkles size={16} />}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  color: '#060b18',
                  fontWeight: 700,
                }}
              >
                {autofilling ? 'Fetching...' : 'AI Fill'}
              </Button>
            </Group>
            {autofillMsg && (
              <Box mt="md" p="sm" style={{
                background: autofillMsg.includes('✓') ? 'rgba(0,212,170,0.1)' : 'rgba(255,85,85,0.1)',
                border: `1px solid ${autofillMsg.includes('✓') ? 'rgba(0,212,170,0.3)' : 'rgba(255,85,85,0.3)'}`,
                borderRadius: 12,
                fontSize: 12,
                color: autofillMsg.includes('✓') ? '#00d4aa' : '#ff5555',
              }}>
                {autofillMsg}
              </Box>
            )}
          </Card>
        </motion.div>
      )}

      {profile && (
        <>
          {/* Hero Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card 
              padding={isMob(w) ? 'md' : 'xl'} 
              radius="xl"
              style={{ 
                background: `linear-gradient(135deg, rgba(${parseInt(primaryColor.slice(1,3),16)},${parseInt(primaryColor.slice(3,5),16)},${parseInt(primaryColor.slice(5,7),16)},0.08), rgba(255,255,255,0.02))`,
                border: `1px solid rgba(255,255,255,0.06)`,
                backdropFilter: 'blur(20px)',
                marginBottom: 24,
              }}
            >
              <Grid gutter={isMob(w) ? 'md' : 'xl'} align="center">
                <Grid.Col span={isMob(w) ? 12 : 'auto'}>
                  <Center>
                    <Avatar
                      src={profile.photo_url}
                      alt={profile.full_name}
                      size={isMob(w) ? 140 : 180}
                      radius="xl"
                      style={{ 
                        border: `4px solid ${primaryColor}40`,
                        boxShadow: `0 20px 60px ${primaryColor}30`,
                      }}
                    >
                      <User size={isMob(w) ? 60 : 80} color={primaryColor} />
                    </Avatar>
                  </Center>
                </Grid.Col>
                <Grid.Col span={isMob(w) ? 12 : 'auto'} style={{ flex: 1 }}>
                  <Group gap="xs" mb="md" wrap="wrap">
                    <Badge 
                      size="lg" 
                      radius="sm"
                      style={{ 
                        background: `${primaryColor}22`, 
                        border: `1px solid ${primaryColor}44`, 
                        color: primaryColor,
                        fontWeight: 700,
                      }}
                    >
                      {profile.designation}
                    </Badge>
                    {profile.constituency_name && (
                      <Badge size="lg" radius="sm" variant="outline" c="#8899bb">
                        <MapPin size={12} style={{ marginRight: 4 }} />
                        {profile.constituency_name}
                      </Badge>
                    )}
                    {profile.state && (
                      <Badge size="lg" radius="sm" variant="outline" c="#8899bb">
                        {profile.state}
                      </Badge>
                    )}
                  </Group>
                  
                  <Title order={2} c="#f0f4ff" mb="md" style={{ fontSize: isMob(w) ? 24 : 32 }}>
                    {profile.full_name}
                  </Title>
                  
                  {profile.bio && (
                    <Text c="#aabbd0" size={isMob(w) ? 'sm' : 'md'} lh={1.7} mb="lg">
                      {profile.bio.slice(0, 200)}{profile.bio.length > 200 ? '...' : ''}
                    </Text>
                  )}
                  
                  <Group gap="xs" wrap="wrap">
                    {profile.twitter_handle && (
                      <Tooltip label="Twitter">
                        <ActionIcon
                          component="a"
                          href={`https://twitter.com/${profile.twitter_handle}`}
                          target="_blank"
                          size="lg"
                          radius="xl"
                          variant="outline"
                          style={{ color: '#8899bb' }}
                        >
                          <Twitter size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {profile.facebook_url && (
                      <Tooltip label="Facebook">
                        <ActionIcon
                          component="a"
                          href={profile.facebook_url}
                          target="_blank"
                          size="lg"
                          radius="xl"
                          variant="outline"
                          style={{ color: '#8899bb' }}
                        >
                          <Facebook size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {profile.instagram_handle && (
                      <Tooltip label="Instagram">
                        <ActionIcon
                          component="a"
                          href={`https://instagram.com/${profile.instagram_handle}`}
                          target="_blank"
                          size="lg"
                          radius="xl"
                          variant="outline"
                          style={{ color: '#8899bb' }}
                        >
                          <Instagram size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {profile.youtube_channel && (
                      <Tooltip label="YouTube">
                        <ActionIcon
                          component="a"
                          href={profile.youtube_channel}
                          target="_blank"
                          size="lg"
                          radius="xl"
                          variant="outline"
                          style={{ color: '#8899bb' }}
                        >
                          <Youtube size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {profile.website && (
                      <Tooltip label="Website">
                        <ActionIcon
                          component="a"
                          href={profile.website}
                          target="_blank"
                          size="lg"
                          radius="xl"
                          variant="outline"
                          style={{ color: '#8899bb' }}
                        >
                          <Globe size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Grid.Col>
              </Grid>
            </Card>
          </motion.div>

          {/* Election Metrics */}
          {(profile.winning_margin || profile.vote_count || profile.election_year) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <SimpleGrid cols={isMob(w) ? 1 : 4} spacing="md" mb="md">
                {[
                  { label: 'Winning Margin', value: fmt(profile.winning_margin), color: primaryColor, icon: Vote },
                  { label: 'Votes Received', value: fmt(profile.vote_count), color: secondaryColor, icon: Users },
                  { label: 'Vote Share', value: profile.vote_count && profile.total_votes_polled ? `${Math.round(profile.vote_count * 100 / profile.total_votes_polled)}%` : '—', color: '#a78bfa', icon: BarChart3 },
                  { label: 'Election Year', value: profile.election_year || '—', color: '#ffa726', icon: Calendar },
                ].map((stat, i) => (
                  <Card key={i} padding="lg" radius="xl" className="card-hover" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <Group gap="sm" mb="xs">
                      <ThemeIcon size="sm" radius="xl" variant="light" color={stat.color}>
                        <stat.icon size={14} />
                      </ThemeIcon>
                      <Text size="xs" c="#8899bb" tt="uppercase" fw={700}>{stat.label}</Text>
                    </Group>
                    <Text size="xl" fw={800} c={stat.color}>{stat.value}</Text>
                  </Card>
                ))}
              </SimpleGrid>
            </motion.div>
          )}

          {/* Constituency Stats */}
          {stats && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card padding={isMob(w) ? 'md' : 'xl'} radius="xl" mb="md" style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <Group gap="sm" mb="lg">
                  <ThemeIcon size="lg" radius="xl" variant="light" color={primaryColor}>
                    <Users size={18} />
                  </ThemeIcon>
                  <Title order={3} c="#f0f4ff">Constituency Intelligence</Title>
                </Group>
                <SimpleGrid cols={isMob(w) ? 2 : 4} spacing="md">
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
                    <Box key={i} p="md" style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <Text size="xs" c="#8899bb" tt="uppercase" fw={700} mb="xs">{s.label}</Text>
                      <Text size="lg" fw={700} c="#f0f4ff">{s.value}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Card>
            </motion.div>
          )}

          {/* Education & Languages */}
          {(profile.education || profile.languages) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <SimpleGrid cols={isMob(w) ? 1 : 2} spacing="md" mb="md">
                {profile.education && (
                  <Card padding="lg" radius="xl" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <Group gap="sm" mb="md">
                      <ThemeIcon size="sm" radius="xl" variant="light" color={secondaryColor}>
                        <BookOpen size={16} />
                      </ThemeIcon>
                      <Text size="sm" c="#f0f4ff" fw={700}>Education</Text>
                    </Group>
                    <Text size="sm" c="#aabbd0" lh={1.7}>{profile.education}</Text>
                  </Card>
                )}
                {profile.languages && (
                  <Card padding="lg" radius="xl" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <Group gap="sm" mb="md">
                      <ThemeIcon size="sm" radius="xl" variant="light" color="#42a5f5">
                        <Languages size={16} />
                      </ThemeIcon>
                      <Text size="sm" c="#f0f4ff" fw={700}>Languages</Text>
                    </Group>
                    <Group gap="xs" wrap="wrap">
                      {parseArr(profile.languages).map((lang, i) => (
                        <Badge key={i} size="sm" radius="sm" variant="outline" c="#42a5f5" style={{
                          borderColor: 'rgba(66,165,245,0.3)',
                        }}>
                          {lang}
                        </Badge>
                      ))}
                    </Group>
                  </Card>
                )}
              </SimpleGrid>
            </motion.div>
          )}

          {/* Empty State */}
          {!profile && !isSuperAdmin && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Card padding="xl" radius="xl" style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                textAlign: 'center',
                padding: 60,
              }}>
                <ThemeIcon size="xl" radius="xl" variant="light" color="gray" mb="md">
                  <User size={48} />
                </ThemeIcon>
                <Title order={3} c="#f0f4ff" mb="sm">Profile Not Configured</Title>
                <Text c="#8899bb">Contact your administrator to set up your profile.</Text>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </Container>
  );
}
