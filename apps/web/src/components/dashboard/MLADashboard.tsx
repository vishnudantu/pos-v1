import { useAuth } from '../../lib/auth'
import { DashboardLayout } from './DashboardLayout'
import { Card, CardContent } from '../primitives/Card'

export function MLADashboard() {
  const { user } = useAuth() as any
  return (
    <DashboardLayout title="MLA Constituency Command" subtitle="Assembly, MLA-LAD, and local grievance redressal." badge="MLA">
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">MLA dashboard for {user?.email} — coming soon.</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
              <li>MLA-LAD works & fund burn</li>
              <li>Local grievance resolution rate</li>
              <li>Assembly performance</li>
              <li>Booth-level voter strength</li>
              <li>Mandal/village-level issues</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
