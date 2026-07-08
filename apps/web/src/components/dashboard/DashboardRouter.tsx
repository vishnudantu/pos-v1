import { useAuth } from '../../lib/auth'
import {
  SuperAdminDashboard,
  FounderDashboard,
  PoliticianDashboard,
  StaffDashboard,
  FieldWorkerDashboard,
  MPDashboard,
  MLADashboard,
  MLCDashboard,
  KaryakartaDashboard,
  PartyPresidentDashboard,
} from './index'

export function DashboardRouter() {
  const { user } = useAuth() as any
  const role = user?.role || 'staff'

  // Founder / super admin / admin email gets Founder dashboard
  if (role === 'founder' || user?.is_founder === true || user?.email === 'admin@thoughtfirst.in') {
    return <FounderDashboard />
  }

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />
    case 'mp':
      return <MPDashboard />
    case 'mla':
      return <MLADashboard />
    case 'mlc':
      return <MLCDashboard />
    case 'party_president':
    case 'state_committee':
    case 'central_committee':
      return <PartyPresidentDashboard />
    case 'politician_admin':
    case 'politician':
      return <PoliticianDashboard />
    case 'karyakarta':
      return <KaryakartaDashboard />
    case 'field_worker':
      return <FieldWorkerDashboard />
    case 'staff':
    case 'team':
    default:
      return <StaffDashboard />
  }
}
