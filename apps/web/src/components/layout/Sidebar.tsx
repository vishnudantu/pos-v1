import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../lib/auth';
import {
  LayoutDashboard, BookOpen, MessageSquareWarning, Calendar, Clock, Users, MapPin,
  Radio, Sparkles, Settings, ChevronLeft, ChevronRight, X, Zap, BarChart3, FileText,
  Briefcase, Megaphone, Landmark, Vote, Scan, Sun, Activity, Target, Mic,
  HeartHandshake, Wrench, Globe, TrendingUp, ShieldAlert, Bot, Smartphone, Siren,
  Network, Wallet, Building2, UserCircle, PartyPopper,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  active: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  mobile?: boolean;
  onCloseMobile?: () => void;
}

const navGroups = [
  {
    title: 'Command',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'morning-brief', label: 'Morning Brief', icon: Sun },
      { id: 'quick-capture', label: 'Quick Capture', icon: Zap },
    ],
  },
  {
    title: 'Constituency',
    items: [
      { id: 'grievances', label: 'Grievances', icon: MessageSquareWarning },
      { id: 'appointments', label: 'Appointments', icon: Clock },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'darshan', label: 'Darshan', icon: BookOpen },
      { id: 'promises', label: 'Promises', icon: HeartHandshake },
      { id: 'citizen-services', label: 'Citizen Services', icon: Wrench },
    ],
  },
  {
    title: 'People & Field',
    items: [
      { id: 'voters', label: 'Voters', icon: Users },
      { id: 'booths', label: 'Booths', icon: MapPin },
      { id: 'team', label: 'Team', icon: UserCircle },
      { id: 'staff-management', label: 'Staff', icon: Briefcase },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'omniscan', label: 'OmniScan Media', icon: Scan },
      { id: 'sentiment', label: 'Sentiment', icon: Activity },
      { id: 'opposition', label: 'Opposition', icon: Target },
      { id: 'whatsapp-intelligence', label: 'WhatsApp Intel', icon: Smartphone },
      { id: 'voice-intelligence', label: 'Voice Intel', icon: Mic },
      { id: 'predictive-crisis', label: 'Crisis Center', icon: ShieldAlert },
    ],
  },
  {
    title: 'AI Studio',
    items: [
      { id: 'ai-studio', label: 'AI Studio', icon: Sparkles },
      { id: 'ai-training', label: 'AI Training', icon: Bot },
      { id: 'content-factory', label: 'Content Factory', icon: Megaphone },
      { id: 'digital-twin', label: 'Digital Twin', icon: Network },
    ],
  },
  {
    title: 'Strategy',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'briefing', label: 'Political Briefing', icon: FileText },
      { id: 'briefing', label: 'Political Briefing', icon: FileText },
      { id: 'briefing', label: 'Political Briefing', icon: FileText },
      { id: 'media', label: 'Media', icon: Radio },
      { id: 'communication', label: 'Communication', icon: Globe },
      { id: 'smart-visit', label: 'Smart Visit', icon: MapPin },
      { id: 'coalition-forecast', label: 'Coalition', icon: PartyPopper },
      { id: 'crisis-war-room', label: 'War Room', icon: Siren },
      { id: 'election-command', label: 'Election Command', icon: Vote },
    ],
  },
  {
    title: 'Government',
    items: [
      { id: 'legislative', label: 'Legislative', icon: Landmark },
      { id: 'parliamentary', label: 'Parliamentary', icon: FileText },
      { id: 'projects', label: 'Projects', icon: Wrench },
      { id: 'constituency', label: 'Constituency', icon: MapPin },
    ],
  },
  {
    title: 'Admin',
    items: [
      { id: 'finance', label: 'Finance', icon: Wallet },
      { id: 'finance-compliance', label: 'Compliance', icon: ShieldAlert },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'superadmin', label: 'Super Admin', icon: Building2 },
      { id: 'website-admin', label: 'Website Admin', icon: Globe },
      { id: 'party-manager', label: 'Party Manager', icon: PartyPopper },
      { id: 'party-integration', label: 'Party Integrations', icon: Network },
    ],
  },
  {
    title: 'Future',
    items: [
      { id: 'polls', label: 'Polls', icon: Vote },
      { id: 'agent-system', label: 'Agent System', icon: Bot },
      { id: 'deepfake-shield', label: 'Deepfake Shield', icon: ShieldAlert },
      { id: 'relationship-graph', label: 'Relations', icon: Network },
      { id: 'economic-intelligence', label: 'Economic Intel', icon: TrendingUp },
      { id: 'citizen', label: 'Citizen', icon: HeartHandshake },
      { id: 'profile', label: 'Profile', icon: UserCircle },
    ],
  },
];

export default function Sidebar({ active, onNavigate, collapsed, onCollapseChange, mobile, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const activeGroup = navGroups.find((g) => g.items.some((i) => i.id === active));
    return new Set(activeGroup ? [activeGroup.title] : ['Command']);
  });

  const isSuperAdmin = (user as any)?.role === 'super_admin';

  function handleNav(id: string) {
    onNavigate(id);
    if (mobile && onCloseMobile) onCloseMobile();
  }

  function toggleGroup(title: string) {
    const next = new Set(expandedGroups);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setExpandedGroups(next);
  }

  const width = mobile ? 280 : collapsed ? 72 : 260;

  return (
    <motion.aside
      initial={mobile ? { x: -280 } : false}
      animate={{ x: 0, width }}
      exit={mobile ? { x: -280 } : undefined}
      transition={{ type: 'spring', damping: 30, stiffness: 250 }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-surface-elevated/95 border-r border-border-DEFAULT backdrop-blur-xl py-4"
      style={{ width }}
    >
      <div className={`flex items-center mb-6 ${collapsed && !mobile ? 'justify-center px-0' : 'justify-between px-5'}`}>
        {collapsed && !mobile ? (
          <div className="w-10 h-10 rounded-nethra-sm bg-gradient-to-br from-nethra-teal to-nethra-blue flex items-center justify-center">
            <Sparkles size={20} className="text-surface-DEFAULT" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-nethra-sm bg-gradient-to-br from-nethra-teal to-nethra-blue flex items-center justify-center">
              <Sparkles size={20} className="text-surface-DEFAULT" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-content-DEFAULT font-display">NETHRA</span>
          </div>
        )}
        {mobile && onCloseMobile && (
          <button onClick={onCloseMobile} className="w-8 h-8 rounded-nethra-sm flex items-center justify-center text-content-secondary hover:text-content-DEFAULT transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.title) || (collapsed && !mobile);
          const hasActive = group.items.some((item) => item.id === active);
          return (
            <div key={group.title} className="mb-3">
              {!collapsed && !mobile && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors ${hasActive ? 'text-nethra-teal' : 'text-content-tertiary'}`}
                >
                  {group.title}
                  <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronRight size={12} />
                  </span>
                </button>
              )}

              <AnimatePresence initial={false}>
                {(isExpanded || mobile) && (
                  <motion.div
                    initial={!mobile ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={!mobile ? { height: 0, opacity: 0 } : undefined}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {group.items.map((item) => {
                      const isActive = active === item.id;
                      const Icon = item.icon;
                      if (item.id === 'superadmin' && !isSuperAdmin) return null;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNav(item.id)}
                          className={`w-full flex items-center rounded-nethra-sm text-sm transition-all duration-200 ${collapsed && !mobile ? 'justify-center py-3 px-2' : 'justify-start gap-3 py-2.5 px-3'} ${isActive ? 'bg-surface-card text-nethra-teal border border-border-strong' : 'text-content-secondary hover:text-content-DEFAULT hover:bg-surface-card-hover border border-transparent'}`}
                          title={collapsed && !mobile ? item.label : undefined}
                        >
                          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                          {(!collapsed || mobile) && <span className={`truncate ${isActive ? 'font-medium' : ''}`}>{item.label}</span>}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {!mobile && (
        <div className="px-3 pt-3 border-t border-border-DEFAULT">
          <button
            onClick={() => onCollapseChange(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 text-content-secondary hover:text-content-DEFAULT transition-colors text-sm"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}

      {(!collapsed || mobile) && (
        <div className="mx-3 mt-3 p-3 rounded-nethra-sm bg-surface-card border border-border-DEFAULT">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-nethra-sm bg-gradient-to-br from-nethra-teal to nethra-blue flex items-center justify-center text-surface-DEFAULT font-semibold text-sm">
              {((user as any)?.politician?.full_name?.[0] || (user as any)?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-content-DEFAULT truncate">{(user as any)?.politician?.full_name || (user as any)?.email || 'User'}</div>
              <div className="text-xs text-content-secondary capitalize">{(user as any)?.role || 'User'}</div>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
