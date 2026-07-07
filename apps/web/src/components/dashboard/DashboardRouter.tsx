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

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />
    case 'founder':
      return <FounderDashboard />
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
