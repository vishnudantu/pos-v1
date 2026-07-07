import { LucideIcon } from 'lucide-react'

export type Role =
  | 'super_admin'
  | 'founder'
  | 'politician_admin'
  | 'politician'
  | 'staff'
  | 'team'
  | 'field_worker'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: number
  roles?: Role[]
  children?: NavItem[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}
