import {
  LayoutDashboard,
  Sunrise,
  BrainCircuit,
  Newspaper,
  MessageSquareWarning,
  CalendarDays,
  Users,
  Map,
  Landmark,
  Smartphone,
  Settings,
  Shield,
  FileText,
} from 'lucide-react'
import { NavGroup, Role } from './types'

const all: Role[] = ['super_admin', 'founder', 'politician_admin', 'politician', 'staff', 'team', 'field_worker']
const ops: Role[] = ['super_admin', 'founder', 'politician_admin', 'politician', 'staff', 'team']
const adminOnly: Role[] = ['super_admin', 'founder']
const politicianScope: Role[] = ['super_admin', 'founder', 'politician_admin', 'politician', 'staff', 'team']

export function getNavigation(role: Role): NavGroup[] {
  return [
    {
      label: 'Overview',
      items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: all }],
    },
    {
      label: 'Intelligence',
      items: [
        { label: 'Morning Brief', to: '/morning-brief', icon: Sunrise, roles: politicianScope },
        { label: 'AI Studio', to: '/ai-studio', icon: BrainCircuit, roles: politicianScope },
        { label: 'OmniScan Media', to: '/media', icon: Newspaper, roles: politicianScope },
        { label: 'Narrative War Room', to: '/narrative', icon: FileText, roles: adminOnly },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Grievances', to: '/grievances', icon: MessageSquareWarning, roles: ops },
        { label: 'Events', to: '/events', icon: CalendarDays, roles: ops },
        { label: 'Appointments', to: '/appointments', icon: CalendarDays, roles: ops },
        { label: 'Voters', to: '/voters', icon: Users, roles: ops },
        { label: 'Booths', to: '/booths', icon: Map, roles: ops },
        { label: 'Darshan', to: '/darshan', icon: Landmark, roles: politicianScope },
      ],
    },
    {
      label: 'Ground',
      items: [
        { label: 'WhatsApp Intel', to: '/whatsapp', icon: Smartphone, roles: politicianScope },
        { label: 'Karyakarta', to: '/karyakarta', icon: Users, roles: ops },
      ],
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users', to: '/users', icon: Users, roles: adminOnly },
        { label: 'Politicians', to: '/politicians', icon: Shield, roles: adminOnly },
        { label: 'Settings', to: '/settings', icon: Settings, roles: all },
      ],
    },
  ]
}
