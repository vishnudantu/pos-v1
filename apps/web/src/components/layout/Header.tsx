import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface HeaderProps {
  activePage: string;
  onMenuToggle: () => void;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'quick-capture': 'Quick Capture',
  constituency: 'Constituency',
  grievances: 'Grievances',
  events: 'Events',
  team: 'Team',
  voters: 'Voters',
  projects: 'Projects',
  media: 'Media Monitor',
  communication: 'Communication',
  finance: 'Finance',
  analytics: 'Analytics',
  documents: 'Documents',
  settings: 'Settings',
  appointments: 'Appointments',
  polls: 'Polls',
  booths: 'Booth Management',
  darshan: 'Darshan',
  darshans: 'Multi-Temple Darshan',
  'ai-training': 'AI Training',
  legislative: 'Legislative Tracker',
  citizen: 'Citizen Engagement',
  profile: 'Profile',
  parliamentary: 'Parliamentary Tracker',
  briefing: 'Political Briefing',
  omniscan: 'OmniScan',
  'morning-brief': 'Morning Brief',
  sentiment: 'Sentiment Dashboard',
  opposition: 'Opposition Tracker',
  'voice-intelligence': 'Voice Intelligence',
  'website-admin': 'Website Admin',
  superadmin: 'Super Admin',
  promises: 'Promise Tracker',
  'content-factory': 'Content Factory',
  'whatsapp-intelligence': 'WhatsApp Intelligence',
  'smart-visit': 'Smart Visit Planner',
  'predictive-crisis': 'Predictive Crisis Center',
  'agent-system': 'Agent System',
  'deepfake-shield': 'Deepfake Shield',
  'coalition-forecast': 'Coalition Forecast',
  'crisis-war-room': 'Crisis War Room',
  'relationship-graph': 'Relationship Graph',
  'economic-intelligence': 'Economic Intelligence',
  'citizen-services': 'Citizen Services',
  'election-command': 'Election Command',
  'finance-compliance': 'Financial Compliance',
  'party-integration': 'Party Integrations',
  'digital-twin': 'Digital Twin',
  'party-manager': 'Party Manager',
  'staff-management': 'Staff Management',
  'ai-studio': 'AI Studio',
};

export default function Header({ activePage, onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const title = pageTitles[activePage] || activePage
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const name = (user as any)?.politician?.full_name || (user as any)?.email || 'User';
  const initials = name.slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-3 md:px-5 border-b border-border-DEFAULT bg-surface-DEFAULT/80 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="xl:hidden touch-min w-9 h-9 rounded-nethra-sm flex items-center justify-center bg-surface-elevated border border-border-DEFAULT text-content-DEFAULT hover:border-border-strong transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-content-DEFAULT capitalize truncate font-display">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-nethra-sm bg-surface-elevated border border-border-DEFAULT text-content-secondary text-sm">
          <Search size={16} />
          <span className="hidden md:inline text-xs">Search ⌘K</span>
          <span className="md:hidden text-xs">Search</span>
        </div>

        <button className="touch-min relative w-9 h-9 rounded-nethra-sm flex items-center justify-center bg-surface-elevated border border-border-DEFAULT text-content-DEFAULT hover:border-border-strong transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-nethra-red" />
        </button>

        <div className="flex items-center gap-2 pl-1 md:pl-2">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-nethra-sm bg-gradient-to-br from-nethra-teal to-nethra-blue flex items-center justify-center text-surface-DEFAULT font-bold text-sm">
            {initials}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-sm font-medium text-content-DEFAULT truncate max-w-[140px]">
              {name}
            </div>
            <div className="text-xs text-content-secondary capitalize">
              {(user as any)?.role || 'User'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
