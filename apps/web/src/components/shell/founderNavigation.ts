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
  AlertOctagon,
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
