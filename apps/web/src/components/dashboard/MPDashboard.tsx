import { useAuth } from '../../lib/auth'
import { DashboardLayout } from './DashboardLayout'
import { Card, CardContent } from '../primitives/Card'

export function MPDashboard() {
  const { user } = useAuth() as any
  return (
    <DashboardLayout title="MP National Command" subtitle="Lok Sabha, MPLADS, and central scheme oversight." badge="Member of Parliament">
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">MP dashboard for {user?.email} — coming soon.</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
              <li>MPLADS fund pipeline</li>
              <li>Parliamentary questions / attendance / bills</li>
              <li>Central scheme tracking</li>
              <li>MLAs under constituency health</li>
              <li>National media sentiment</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
