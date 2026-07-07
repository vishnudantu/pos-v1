import { useAuth } from '../../lib/auth'
import {
  SuperAdminDashboard,
  FounderDashboard,
  PoliticianDashboard,
  StaffDashboard,
  FieldWorkerDashboard,
} from './index'

export function DashboardRouter() {
  const { user } = useAuth() as any
  const role = user?.role || 'staff'

  // If the user is founder or has founder flag, show Founder dashboard
  if (role === 'founder' || user?.is_founder === true || user?.email === 'admin@thoughtfirst.in') {
    return <FounderDashboard />
  }

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />
    case 'politician_admin':
    case 'politician':
      return <PoliticianDashboard />
    case 'field_worker':
      return <FieldWorkerDashboard />
    case 'staff':
    case 'team':
    default:
      return <StaffDashboard />
  }
}
