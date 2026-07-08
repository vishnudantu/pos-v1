import { useAuth } from '../../lib/auth'
import { DashboardLayout } from './DashboardLayout'
import { Card, CardContent } from '../primitives/Card'

export function PartyPresidentDashboard() {
  const { user } = useAuth() as any
  return (
    <DashboardLayout title="War Room" subtitle="Statewide strategy, candidates, and crisis response." badge="Leadership">
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Party leadership dashboard for {user?.email} — coming soon.</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
              <li>Statewide constituency heatmap</li>
              <li>Candidate health scores</li>
              <li>Fund vs polling strength</li>
              <li>Media sentiment across leaders</li>
              <li>Opposition tracker</li>
              <li>Ticket-worthiness scoring</li>
              <li>Crisis alerts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
