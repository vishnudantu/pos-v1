import { useAuth } from '../../lib/auth'
import { DashboardLayout } from './DashboardLayout'
import { Card, CardContent } from '../primitives/Card'

export function MLCDashboard() {
  const { user } = useAuth() as any
  return (
    <DashboardLayout title="MLC Council Command" subtitle="Legislative Council business and policy oversight." badge="MLC">
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">MLC dashboard for {user?.email} — coming soon.</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
              <li>Council business: bills, committees, questions</li>
              <li>Local-body engagement map</li>
              <li>Teacher / graduate / farmer issue forums</li>
              <li>Policy review workflow</li>
              <li>Influence & oversight score</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
