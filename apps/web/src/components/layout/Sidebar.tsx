import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UserCircle, Map, FileText, CalendarCheck, Calendar,
  Users, PieChart, Box, Scale, Megaphone, Star, Building2, BrainCircuit,
  Activity, Clock, BarChart3, Eye, Mic, Flag, Sparkles, MessageCircleWarning,
  Wand2, Radar, Bot, ShieldAlert, Network, LineChart, Handshake, Target,
  FileCheck2, Users2, Cpu, Globe, AlertTriangle, Wallet, Newspaper,
  FolderOpen, MessageSquare, Settings, Shield, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import {
  Box as MantineBox, ScrollArea, Tooltip, Badge, Avatar, Group, Text,
  UnstyledButton, Divider, Stack, Collapse
} from '@mantine/core';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../theme/ThemeProvider';

// ══ RESPONSIVE HOOK (inline per Development Bible) ══
import { useState as _useStateW, useEffect as _useEffectW } from 'react';
function useW() {
  const [_w, _setW] = _useStateW(typeof window !== 'undefined' ? window.innerWidth : 1440);
  _useEffectW(() => { const _fn = () => _setW(window.innerWidth); window.addEventListener('resize', _fn); return () => window.removeEventListener('resize', _fn); }, []);
  return _w;
}
const isMob = (_w: number) => _w < 640;
const isTab = (_w: number) => _w >= 640 && _w < 1024;
// ════════════════════════════════════════════════════════════

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  group: string;
  moduleKey?: string;
}

const navItems: NavItem[] = [
  // Core
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'core' },
  { id: 'profile', label: 'Profile', icon: UserCircle, group: 'core' },
  { id: 'constituency', label: 'Constituency', icon: Map, group: 'core' },
  { id: 'grievances', label: 'Grievances', icon: FileText, badge: 5, group: 'core' },
  { id: 'appointments', label: 'Appointments', icon: CalendarCheck, group: 'core' },
  { id: 'events', label: 'Events', icon: Calendar, group: 'core' },
  // Political
  { id: 'voters', label: 'Voters', icon: Users, group: 'political' },
  { id: 'polls', label: 'Polls', icon: PieChart, group: 'political' },
  { id: 'booths', label: 'Booths', icon: Box, group: 'political' },
  { id: 'legislative', label: 'Legislative', icon: Scale, group: 'political' },
  { id: 'citizen', label: 'Citizen', icon: Megaphone, group: 'political' },
  // Services
  { id: 'darshan', label: 'Darshan', icon: Star, group: 'services' },
  { id: 'parliamentary', label: 'Parliamentary', icon: Building2, group: 'services' },
  { id: 'ai-studio', label: 'AI Studio', icon: BrainCircuit, group: 'services' },
  // Intelligence
  { id: 'omniscan', label: 'OmniScan', icon: Activity, group: 'intelligence' },
  { id: 'morning-brief', label: 'Morning Brief', icon: Clock, group: 'intelligence' },
  { id: 'sentiment', label: 'Sentiment', icon: BarChart3, group: 'intelligence' },
  { id: 'opposition', label: 'Opposition', icon: Eye, group: 'intelligence' },
  { id: 'voice-intelligence', label: 'Voice Intel', icon: Mic, group: 'intelligence' },
  { id: 'promises', label: 'Promises', icon: Flag, group: 'intelligence' },
  { id: 'content-factory', label: 'Content', icon: Sparkles, group: 'intelligence' },
  { id: 'whatsapp-intelligence', label: 'WhatsApp', icon: MessageCircleWarning, group: 'intelligence' },
  { id: 'smart-visit', label: 'Smart Visit', icon: Map, group: 'intelligence' },
  // Future Lab
  { id: 'predictive-crisis', label: 'Predictive Crisis', icon: Radar, group: 'future' },
  { id: 'agent-system', label: 'Agent System', icon: Bot, group: 'future' },
  { id: 'deepfake-shield', label: 'Deepfake', icon: ShieldAlert, group: 'future' },
  { id: 'coalition-forecast', label: 'Coalition', icon: Handshake, group: 'future' },
  { id: 'crisis-war-room', label: 'War Room', icon: AlertTriangle, group: 'future' },
  { id: 'relationship-graph', label: 'Relationships', icon: Network, group: 'future' },
  { id: 'economic-intelligence', label: 'Economic', icon: LineChart, group: 'future' },
  { id: 'election-command', label: 'Election', icon: Target, group: 'future' },
  { id: 'digital-twin', label: 'Digital Twin', icon: Cpu, group: 'future' },
  // Admin
  { id: 'projects', label: 'Projects', icon: FolderOpen, group: 'admin' },
  { id: 'media', label: 'Media', icon: Newspaper, group: 'admin' },
  { id: 'communication', label: 'Communication', icon: MessageSquare, group: 'admin' },
  { id: 'finance', label: 'Finance', icon: Wallet, group: 'admin' },
  { id: 'team', label: 'Team', icon: Users, group: 'admin' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'admin' },
  { id: 'documents', label: 'Documents', icon: FolderOpen, group: 'admin' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'admin' },
  { id: 'superadmin', label: 'Platform Admin', icon: Shield, group: 'admin', badge: 1 },
];

const groupConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  core: { label: 'Core', icon: LayoutDashboard, color: '#00d4aa' },
  political: { label: 'Political Ops', icon: Users, color: '#1e88e5' },
  services: { label: 'Services', icon: Star, color: '#ffa726' },
  intelligence: { label: 'Intelligence', icon: BrainCircuit, color: '#ab47bc' },
  future: { label: 'Future Lab', icon: Cpu, color: '#26c6da' },
  admin: { label: 'Admin', icon: Settings, color: '#8899bb' },
};

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ active, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { activePolitician, userRole, signOut } = useAuth();
  const { primaryColor, secondaryColor } = useTheme();
  const w = useW();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    core: true,
    political: true,
    services: true,
    intelligence: true,
  });

  const isSuperAdmin = userRole?.role === 'super_admin';
  const isFieldWorker = userRole?.role === 'field_worker';
  const isStaff = userRole?.role === 'staff';

  // Filter items based on role
  const visibleItems = navItems.filter(item => {
    if (isSuperAdmin) return true;
    if (isFieldWorker) return ['dashboard', 'grievances', 'events', 'voice-intelligence'].includes(item.id);
    if (isStaff && ['finance', 'voters', 'settings'].includes(item.id)) return false;
    return true;
  });

  // Group items
  const groupedItems = visibleItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const profileName = activePolitician?.full_name || userRole?.email?.split('@')[0] || 'User';
  const initials = profileName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <MantineBox
      style={{
        width: collapsed ? 80 : 280,
        height: '100vh',
        background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 200,
      }}
    >
      {/* Logo & Toggle */}
      <MantineBox p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Group justify="space-between" wrap="nowrap">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              NETHRA
            </motion.div>
          )}
          <Tooltip label={collapsed ? 'Expand' : 'Collapse'}>
            <UnstyledButton onClick={onToggle} style={{ color: '#8899bb' }}>
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </UnstyledButton>
          </Tooltip>
        </Group>
      </MantineBox>

      {/* Navigation */}
      <ScrollArea flex={1} px="sm" py="md">
        <Stack gap="xs">
          {Object.entries(groupedItems).map(([group, items]) => {
            const config = groupConfig[group];
            const isOpen = openGroups[group];
            const Icon = config.icon;

            return (
              <MantineBox key={group}>
                {!collapsed && (
                  <UnstyledButton
                    onClick={() => toggleGroup(group)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#8899bb',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      marginBottom: 4,
                    }}
                  >
                    <Icon size={14} color={config.color} />
                    {config.label}
                    <ChevronRight
                      size={14}
                      style={{
                        marginLeft: 'auto',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </UnstyledButton>
                )}

                <Collapse in={isOpen || collapsed}>
                  <Stack gap={2}>
                    {items.map(item => {
                      const ItemIcon = item.icon;
                      const isActive = active === item.id;

                      return (
                        <Tooltip
                          key={item.id}
                          label={item.label}
                          disabled={!collapsed}
                          position="right"
                        >
                          <UnstyledButton
                            onClick={() => onNavigate(item.id)}
                            style={{
                              width: '100%',
                              padding: collapsed ? '10px' : '10px 12px',
                              borderRadius: 10,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              background: isActive
                                ? `linear-gradient(135deg, ${primaryColor}22, ${secondaryColor}22)`
                                : 'transparent',
                              border: isActive ? `1px solid ${primaryColor}44` : '1px solid transparent',
                              color: isActive ? primaryColor : '#8899bb',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }
                            }}
                          >
                            <ItemIcon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            {!collapsed && (
                              <>
                                <Text size="sm" fw={isActive ? 700 : 500} style={{ flex: 1 }}>
                                  {item.label}
                                </Text>
                                {item.badge && (
                                  <Badge
                                    size="sm"
                                    radius="sm"
                                    style={{
                                      background: `${primaryColor}22`,
                                      color: primaryColor,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                            {isActive && !collapsed && (
                              <motion.div
                                layoutId="activeIndicator"
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 3,
                                  background: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`,
                                  borderRadius: '0 4px 4px 0',
                                }}
                              />
                            )}
                          </UnstyledButton>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                </Collapse>

                {!collapsed && <Divider my="xs" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
              </MantineBox>
            );
          })}
        </Stack>
      </ScrollArea>

      {/* User Profile Section */}
      <MantineBox
        p="md"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <Group gap="sm" wrap="nowrap">
          <Avatar
            size={40}
            radius="xl"
            src={activePolitician?.photo_url}
            style={{
              border: `2px solid ${primaryColor}66`,
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>
          {!collapsed && (
            <MantineBox style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={700} c="#f0f4ff" truncate>
                {profileName}
              </Text>
              <Text size="xs" c="#8899bb" truncate>
                {activePolitician?.designation || userRole?.role || 'User'}
              </Text>
            </MantineBox>
          )}
          {!collapsed && (
            <Tooltip label="Sign Out">
              <UnstyledButton
                onClick={signOut}
                style={{ color: '#8899bb', flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ff5555')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8899bb')}
              >
                <LogOut size={18} />
              </UnstyledButton>
            </Tooltip>
          )}
        </Group>
      </MantineBox>
    </MantineBox>
  );
}
