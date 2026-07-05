import AIModelSwitcher from '../AIModelSwitcher';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Calendar, Users, Newspaper, TrendingUp, FolderOpen,
  MessageSquare, Map, BarChart3, Settings, Wallet, UserCheck, Zap,
  CalendarCheck, PieChart, Star, Scale, Megaphone,
  Building2, Sparkles, LogOut, ChevronDown, Shield, Check, BrainCircuit, Brain, Activity, Clock, Eye, Mic,
  Box, Flag, MessageCircleWarning, Radar, Bot, ShieldAlert, Network, LineChart, Handshake, FileCheck2,
  Users2, Cpu, Target, Globe, AlertTriangle, X, Pin, History, Search
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useI18n } from '../../lib/i18n';

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: number;
  adminOnly?: boolean;
  superOnly?: boolean;
  moduleKey?: string;
}

const ALL_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, moduleKey: 'dashboard' },
  { id: 'ai-studio', label: 'AI Studio', shortLabel: 'AI', icon: BrainCircuit, moduleKey: 'ai-studio' },
  { id: 'ai-training', label: 'AI Training', shortLabel: 'AI Train', icon: Brain, moduleKey: 'ai-studio' },
  { id: 'quick-capture', label: 'Quick Capture', shortLabel: 'Capture', icon: Mic, moduleKey: 'dashboard' },
  { id: 'morning-brief', label: 'Morning Brief', shortLabel: 'Brief', icon: Clock, moduleKey: 'morning-brief' },
  { id: 'grievances', label: 'Grievances', shortLabel: 'Grievances', icon: FileText, badge: 5, moduleKey: 'grievances' },
  { id: 'appointments', label: 'Appointments', shortLabel: 'Appointments', icon: CalendarCheck, moduleKey: 'appointments' },
  { id: 'events', label: 'Events', shortLabel: 'Events', icon: Calendar, moduleKey: 'events' },
  { id: 'projects', label: 'Projects', shortLabel: 'Projects', icon: TrendingUp, moduleKey: 'projects' },
  { id: 'darshan', label: 'Tirupati Darshan', shortLabel: 'Darshan', icon: Star, moduleKey: 'darshan' },
  { id: 'darshans', label: 'Darshans', shortLabel: 'Darshans', icon: Map, moduleKey: 'darshans' },
  { id: 'voters', label: 'Voter Database', shortLabel: 'Voters', icon: UserCheck, moduleKey: 'voters' },
  { id: 'booths', label: 'Booth Management', shortLabel: 'Booths', icon: Box, moduleKey: 'booth_management' },
  { id: 'polls', label: 'Polls & Surveys', shortLabel: 'Polls', icon: PieChart, moduleKey: 'polls' },
  { id: 'legislative', label: 'Legislative', shortLabel: 'Legislative', icon: Scale, moduleKey: 'legislative' },
  { id: 'citizen', label: 'Citizen Engagement', shortLabel: 'Citizen', icon: Megaphone, moduleKey: 'citizen' },
  { id: 'promises', label: 'Promises Tracker', shortLabel: 'Promises', icon: Flag, moduleKey: 'promises' },
  { id: 'omniscan', label: 'OmniScan', shortLabel: 'OmniScan', icon: Activity, moduleKey: 'omniscan' },
  { id: 'sentiment', label: 'Sentiment', shortLabel: 'Sentiment', icon: BarChart3, moduleKey: 'sentiment' },
  { id: 'opposition', label: 'Opposition', shortLabel: 'Opposition', icon: Eye, moduleKey: 'opposition' },
  { id: 'media', label: 'Media Monitor', shortLabel: 'Media', icon: Newspaper, moduleKey: 'media' },
  { id: 'whatsapp-intelligence', label: 'WhatsApp', shortLabel: 'WhatsApp', icon: MessageCircleWarning, moduleKey: 'whatsapp-intelligence' },
  { id: 'voice-intelligence', label: 'Voice Intel', shortLabel: 'Voice', icon: Mic, moduleKey: 'voice-intelligence' },
  { id: 'content-factory', label: 'Content Factory', shortLabel: 'Content', icon: Sparkles, moduleKey: 'content-factory' },
  { id: 'smart-visit', label: 'Smart Visit', shortLabel: 'Visits', icon: Map, moduleKey: 'smart-visit' },
  { id: 'briefing', label: 'Briefings', shortLabel: 'Briefings', icon: Sparkles, moduleKey: 'briefing' },
  { id: 'team', label: 'Team', shortLabel: 'Team', icon: Users, moduleKey: 'team' },
  { id: 'finance', label: 'Finance', shortLabel: 'Finance', icon: Wallet, moduleKey: 'finance' },
  { id: 'documents', label: 'Documents', shortLabel: 'Documents', icon: FolderOpen, moduleKey: 'documents' },
  { id: 'communication', label: 'Communication', shortLabel: 'Comm', icon: MessageSquare, moduleKey: 'communication' },
  { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: BarChart3, moduleKey: 'analytics' },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings, moduleKey: 'settings' },
  { id: 'superadmin', label: 'Platform Admin', shortLabel: 'Admin', icon: Shield, superOnly: true, moduleKey: 'superadmin' },
  { id: 'website-admin', label: 'Website CMS', shortLabel: 'CMS', icon: Globe, superOnly: true, moduleKey: 'superadmin' },
  { id: 'party-manager', label: 'Party Manager', shortLabel: 'Parties', icon: Building2, superOnly: true, moduleKey: 'superadmin' },
  { id: 'staff-management', label: 'Staff Management', shortLabel: 'Staff', icon: Users2, superOnly: true, moduleKey: 'staff-management' },
  { id: 'predictive-crisis', label: 'Predictive Crisis', shortLabel: 'Crisis', icon: Radar, moduleKey: 'predictive-crisis' },
  { id: 'agent-system', label: 'Agent System', shortLabel: 'Agents', icon: Bot, moduleKey: 'agent-system' },
  { id: 'deepfake-shield', label: 'Deepfake Shield', shortLabel: 'Deepfake', icon: ShieldAlert, moduleKey: 'deepfake-shield' },
  { id: 'coalition-forecast', label: 'Coalition', shortLabel: 'Coalition', icon: Handshake, moduleKey: 'coalition-forecast' },
  { id: 'crisis-war-room', label: 'War Room', shortLabel: 'War Room', icon: AlertTriangle, moduleKey: 'crisis-war-room' },
  { id: 'relationship-graph', label: 'Relations', shortLabel: 'Relations', icon: Network, moduleKey: 'relationship-graph' },
  { id: 'economic-intelligence', label: 'Economic', shortLabel: 'Economic', icon: LineChart, moduleKey: 'economic-intelligence' },
  { id: 'citizen-services', label: 'Citizen Services', shortLabel: 'Services', icon: Handshake, moduleKey: 'citizen-services' },
  { id: 'election-command', label: 'Election Command', shortLabel: 'Election', icon: Target, moduleKey: 'election-command' },
  { id: 'finance-compliance', label: 'Finance Compliance', shortLabel: 'Compliance', icon: FileCheck2, moduleKey: 'finance-compliance' },
  { id: 'party-integration', label: 'Party Integration', shortLabel: 'Party Sync', icon: Users2, moduleKey: 'party-integration' },
  { id: 'digital-twin', label: 'Digital Twin', shortLabel: 'Twin', icon: Cpu, moduleKey: 'digital-twin' },
];

type SectionKey = 'command' | 'work' | 'political' | 'intelligence' | 'admin' | 'future' | 'founder';

interface SectionDef {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
  defaultOpen: boolean;
  order: number;
  itemIds: string[];
}

const SECTIONS: SectionDef[] = [
  { key: 'command', label: 'COMMAND', icon: Zap, defaultOpen: true, order: 1, itemIds: ['dashboard', 'ai-studio', 'ai-training', 'quick-capture', 'morning-brief'] },
  { key: 'work', label: 'MY WORK', icon: CalendarCheck, defaultOpen: true, order: 2, itemIds: ['grievances', 'appointments', 'events', 'projects', 'darshan', 'darshans'] },
  { key: 'political', label: 'POLITICAL OPS', icon: Target, defaultOpen: false, order: 3, itemIds: ['voters', 'booths', 'polls', 'legislative', 'citizen', 'promises'] },
  { key: 'intelligence', label: 'INTELLIGENCE', icon: Activity, defaultOpen: false, order: 4, itemIds: ['omniscan', 'sentiment', 'opposition', 'media', 'whatsapp-intelligence', 'voice-intelligence', 'content-factory', 'smart-visit', 'briefing'] },
  { key: 'admin', label: 'ADMINISTRATION', icon: Settings, defaultOpen: false, order: 5, itemIds: ['team', 'finance', 'documents', 'communication', 'analytics', 'settings'] },
  { key: 'future', label: 'FUTURE LAB', icon: Sparkles, defaultOpen: false, order: 6, itemIds: ['predictive-crisis', 'agent-system', 'deepfake-shield', 'coalition-forecast', 'crisis-war-room', 'relationship-graph', 'economic-intelligence', 'citizen-services', 'election-command', 'finance-compliance', 'party-integration', 'digital-twin'] },
  { key: 'founder', label: 'FOUNDER', icon: Shield, defaultOpen: false, order: 7, itemIds: ['superadmin', 'website-admin', 'party-manager', 'staff-management'] },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  mobile?: boolean;
  onCloseMobile?: () => void;
}

function useSidebarState() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SECTIONS.forEach(s => initial[s.key] = s.defaultOpen);
    return initial;
  });
  const [pinned, setPinned] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('nethra_sidebar_pins') || '[]'); } catch { return []; }
  });
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try { localStorage.setItem('nethra_sidebar_pins', JSON.stringify(pinned)); } catch {}
  }, [pinned]);

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function togglePin(id: string) {
    setPinned(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  function recordVisit(id: string) {
    setRecent(prev => [id, ...prev.filter(r => r !== id)].slice(0, 5));
  }

  return { openSections, toggleSection, pinned, togglePin, recent, recordVisit };
}

export default function Sidebar({ active, onNavigate, collapsed, mobile, onCloseMobile }: SidebarProps) {
  const { userRole, user, activePolitician, allPoliticians, setActivePolitician, signOut, hasModule } = useAuth();
  const { t } = useI18n();
  const { openSections, toggleSection, pinned, togglePin, recent, recordVisit } = useSidebarState();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  const role = (userRole?.role || '').toLowerCase();
  const isSuperAdmin = role === 'super_admin';
  const isFieldWorker = role === 'field_worker';
  const isStaff = role === 'staff';
  const isPoliticianAdmin = role === 'politician_admin';

  const primaryColor = activePolitician?.color_primary || '#00d4aa';
  const secondaryColor = activePolitician?.color_secondary || '#1e88e5';

  const profileName = (() => {
    if (!isSuperAdmin) return activePolitician?.full_name || 'Loading...';
    if (user?.display_name) return user.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Super Admin';
  })();
  const initials = profileName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const profileSubtitle = isSuperAdmin
    ? 'Founder Command Center'
    : `${activePolitician?.designation || userRole?.role?.replace('_', ' ') || ''}${activePolitician?.constituency_name ? ` • ${activePolitician.constituency_name}` : ''}`;

  const visibleItems = useMemo(() => {
    return ALL_ITEMS.filter(item => {
      if (item.superOnly && !isSuperAdmin) return false;
      if (item.adminOnly && !isSuperAdmin && !isPoliticianAdmin) return false;
      if (isFieldWorker && !['dashboard', 'quick-capture', 'voice-intelligence', 'grievances', 'appointments', 'events'].includes(item.id)) return false;
      if (isStaff && ['voters', 'finance', 'finance-compliance'].includes(item.id)) return false;
      if (item.moduleKey && !hasModule(item.moduleKey)) return false;
      return true;
    });
  }, [isSuperAdmin, isFieldWorker, isStaff, isPoliticianAdmin, hasModule]);

  const findItem = (id: string) => visibleItems.find(i => i.id === id);

  const sections = useMemo(() => {
    return SECTIONS.map(section => ({
      ...section,
      items: section.itemIds.map(id => findItem(id)).filter((i): i is NavItem => !!i),
    })).filter(section => section.items.length > 0 && (section.key !== 'founder' || isSuperAdmin));
  }, [visibleItems, isSuperAdmin]);

  const pinnedItems = useMemo(() => pinned.map(id => findItem(id)).filter((i): i is NavItem => !!i), [pinned, visibleItems]);
  const recentItems = useMemo(() => recent.map(id => findItem(id)).filter((i): i is NavItem => !!i).slice(0, 3), [recent, visibleItems]);
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return visibleItems.filter(i => i.label.toLowerCase().includes(q) || i.shortLabel.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, visibleItems]);

  function handleSignOut() {
    setSigningOut(true);
    signOut();
    window.location.href = '/';
  }

  function handleNav(id: string) {
    onNavigate(id);
    recordVisit(id);
    if (mobile && onCloseMobile) onCloseMobile();
    setSearchOpen(false);
    setSearchQuery('');
  }

  const expanded = !collapsed || mobile;
  const width = expanded ? 260 : 72;

  const NavButton = ({ item, showPin = true }: { item: NavItem; showPin?: boolean }) => {
    const Icon = item.icon;
    const isActive = active === item.id;
    const isPinned = pinned.includes(item.id);
    return (
      <motion.button
        key={item.id}
        onClick={() => handleNav(item.id)}
        className="group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left mb-0.5"
        style={{
          color: isActive ? '#f0f4ff' : '#a0aec8',
          background: isActive ? `linear-gradient(90deg, ${primaryColor}20, transparent 75%)` : 'transparent',
        }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: 1 }}
        whileTap={{ scale: 0.98 }}
        title={!expanded ? item.label : undefined}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
            style={{ background: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 0 10px ${primaryColor}` }}
          />
        )}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: isActive ? primaryColor : undefined }}>
          <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-[13px] font-medium flex-1 truncate">
              {t(`nav.${item.id}`)?.startsWith('nav.') ? item.label : t(`nav.${item.id}`)}
            </motion.span>
          )}
        </AnimatePresence>
        {expanded && item.badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,85,85,0.18)', color: '#ff6b6b' }}>{item.badge}</span>
        )}
        {expanded && showPin && (
          <button
            onClick={e => { e.stopPropagation(); togglePin(item.id); }}
            className={`opacity-0 group-hover:opacity-100 transition-all w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 hover:bg-white/10 ${isPinned ? 'opacity-100' : ''}`}
            style={{ color: isPinned ? primaryColor : '#5a6a8a' }}
            title={isPinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin size={12} />
          </button>
        )}
      </motion.button>
    );
  };

  const SectionHeader = ({ section }: { section: SectionDef & { items: NavItem[] } }) => {
    const Icon = section.icon;
    const isOpen = openSections[section.key];
    return (
      <button
        onClick={() => toggleSection(section.key)}
        className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 mb-1 rounded-lg transition-colors hover:bg-white/[0.04]"
        title={!expanded ? section.label : undefined}
      >
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: '#64748b' }}>
          <Icon size={15} strokeWidth={1.9} />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-[10px] font-bold tracking-[0.14em] text-slate-400">{section.label}</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={12} style={{ color: '#64748b' }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  };

  const content = (
    <>
      <div className="flex items-center gap-3 px-3 h-[68px] flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
          <Zap size={20} color="#060b18" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="min-w-0 flex-1">
              <div className="font-bold text-sm tracking-wide nethra-gradient-text font-display">NETHRA</div>
              <div className="text-[9px] text-slate-400 tracking-wider">POLITICAL INTELLIGENCE</div>
            </motion.div>
          )}
        </AnimatePresence>
        {mobile && (
          <button onClick={onCloseMobile} className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
        {expanded && !mobile && (
          <button onClick={() => setSearchOpen(true)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Search modules">
            <Search size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {searchOpen && expanded && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="px-3 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-white/[0.08]">
              <Search size={14} className="text-slate-400" />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Find module..." className="flex-1 bg-transparent outline-none text-xs text-slate-200 placeholder:text-slate-500" />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-slate-400 hover:text-white"><X size={14} /></button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-1 rounded-xl bg-slate-900 border border-white/10 overflow-hidden">
                {searchResults.map(item => (
                  <button key={item.id} onClick={() => handleNav(item.id)} className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 transition-colors">
                    <item.icon size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-200">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-hide">
        {expanded && pinnedItems.length > 0 && (
          <div className="mb-3">
            <div className="px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-slate-500 flex items-center gap-1.5"><Pin size={10} /> PINNED</div>
            {pinnedItems.map(item => <NavButton key={`pin-${item.id}`} item={item} showPin={false} />)}
          </div>
        )}

        {expanded && recentItems.length > 0 && !searchOpen && (
          <div className="mb-3">
            <div className="px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-slate-500 flex items-center gap-1.5"><History size={10} /> RECENT</div>
            {recentItems.map(item => <NavButton key={`recent-${item.id}`} item={item} showPin={false} />)}
          </div>
        )}

        {sections.map(section => (
          <div key={section.key}>
            <SectionHeader section={section} />
            <AnimatePresence initial={false}>
              {openSections[section.key] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  {section.items.map(item => <NavButton key={item.id} item={item} />)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {isSuperAdmin && expanded && <div className="mb-3"><AIModelSwitcher compact /></div>}

        {isSuperAdmin && allPoliticians.length > 1 && expanded && (
          <div className="relative mb-3">
            <button onClick={() => setSwitcherOpen(!switcherOpen)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all bg-slate-800/40 border border-white/[0.07] hover:bg-slate-800/60">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: '#060b18' }}>
                {activePolitician?.full_name?.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('') || initials}
              </div>
              <span className="flex-1 text-left truncate text-xs text-slate-300">{activePolitician?.full_name || 'Select Politician'}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {switcherOpen && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden z-50 bg-slate-900 border border-white/10 max-h-[200px] overflow-y-auto">
                  {allPoliticians.map(pol => (
                    <button key={pol.id} onClick={() => { setActivePolitician(pol); setSwitcherOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-all hover:bg-white/5 text-left">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${pol.color_primary || '#00d4aa'}, ${pol.color_secondary || '#1e88e5'})`, color: '#060b18' }}>
                        {pol.full_name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs text-slate-200 font-medium">{pol.full_name}</div>
                        <div className="truncate text-[10px] text-slate-500">{pol.constituency_name}</div>
                      </div>
                      {activePolitician?.id === pol.id && <Check size={12} className="text-nethra-teal flex-shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
            <span className="text-[10px] font-bold text-[#060b18]">{initials}</span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 min-w-0 overflow-hidden">
                <div className="truncate text-xs font-medium text-slate-200">{profileName}</div>
                <div className="truncate text-[10px] text-slate-500">{profileSubtitle}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleSignOut} disabled={signingOut} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-nethra-red hover:bg-white/5 transition-colors flex-shrink-0" title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );

  if (mobile) {
    return (
      <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden shadow-2xl" style={{ width: 300, maxWidth: '90vw', background: '#0c1322', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        {content}
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col overflow-hidden"
      style={{ background: '#0c1322', borderRight: '1px solid rgba(255,255,255,0.08)', boxShadow: '4px 0 30px rgba(0,0,0,0.25)' }}
    >
      {content}
    </motion.aside>
  );
}
