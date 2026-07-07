import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Users,
  ToggleRight,
  Key,
  Download,
  Shield,
  Settings,
  Globe,
  CreditCard,
  Activity,
  Landmark,
  TrendingUp,
  MessageSquareWarning,
  CalendarDays,
  Vote,
  Map,
  BrainCircuit,
  Newspaper,
  Smartphone,
} from 'lucide-react'
import { NavGroup } from './types'

export function getFounderNavigation(): NavGroup[] {
  return [
    {
      label: 'Command',
      items: [
        { label: 'Founder Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { label: 'Political Health', to: '/founder/political-health', icon: TrendingUp },
        { label: 'Public Website', to: '/founder/public', icon: Globe },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Grievances', to: '/grievances', icon: MessageSquareWarning },
        { label: 'Events', to: '/events', icon: CalendarDays },
        { label: 'Appointments', to: '/appointments', icon: CalendarDays },
        { label: 'Voters', to: '/voters', icon: Users },
        { label: 'Booths', to: '/booths', icon: Map },
        { label: 'Darshan', to: '/darshan', icon: Landmark },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { label: 'Morning Brief', to: '/morning-brief', icon: Activity },
        { label: 'AI Studio', to: '/ai-studio', icon: BrainCircuit },
        { label: 'OmniScan Media', to: '/media', icon: Newspaper },
        { label: 'Sentiment', to: '/sentiment', icon: TrendingUp },
      ],
    },
    {
      label: 'Ground',
      items: [
        { label: 'WhatsApp Intel', to: '/whatsapp-intelligence', icon: Smartphone },
        { label: 'Quick Capture', to: '/quick-capture', icon: Activity },
      ],
    },
    {
      label: 'Tenants & Entities',
      items: [
        { label: 'Parties', to: '/founder/parties', icon: Building2 },
        { label: 'Politicians', to: '/founder/politicians', icon: UserCheck },
        { label: 'Constituencies', to: '/founder/constituencies', icon: Landmark },
      ],
    },
    {
      label: 'Users & Access',
      items: [
        { label: 'All Users', to: '/founder/users', icon: Users },
        { label: 'Staff', to: '/founder/staff', icon: Users },
        { label: 'Field Workers', to: '/founder/workers', icon: Users },
        { label: 'Roles & Permissions', to: '/founder/roles', icon: Shield },
      ],
    },
    {
      label: 'Platform Control',
      items: [
        { label: 'Feature Matrix', to: '/founder/features', icon: ToggleRight },
        { label: 'Subscriptions', to: '/founder/subscriptions', icon: CreditCard },
        { label: 'Integrations', to: '/founder/integrations', icon: Key },
        { label: 'Audit & Exports', to: '/founder/exports', icon: Download },
        { label: 'System Health', to: '/founder/system', icon: Activity },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ]
}
