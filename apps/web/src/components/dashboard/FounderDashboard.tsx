import { Landmark, Map, Megaphone, TrendingUp, Wallet } from 'lucide-react'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { DashboardLayout } from './DashboardLayout'

export function FounderDashboard() {
  return (
    <DashboardLayout
      title="Party President Dashboard"
      subtitle="Multi-constituency view, party health, and state-level narrative."
      badge="Founder"
      actions={
        <>
          <Button size="sm" variant="outline">State Report</Button>
          <Button size="sm">Launch Campaign</Button>
        </>
      }
      stats={
        <>
          <StatCard label="Active Politicians" value="24" icon={Landmark} delta={4} deltaLabel="this month" />
          <StatCard label="Constituencies" value="42" icon={Map} />
          <StatCard label="Active Campaigns" value="7" icon={Megaphone} delta={12} deltaLabel="vs last month" />
          <StatCard label="Party Health" value="86" icon={TrendingUp} deltaLabel="score" />
        </>
      }
    >
      <div className="lg:col-span-2 space-y-6">
        <SectionCard title="State Trends" description="Sentiment and activity by region">
          <div className="h-40 rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">
            State-level charts will render here
          </div>
        </SectionCard>

        <SectionCard title="Top Performing Politicians" description="By resolution rate and media presence">
          <ul className="space-y-2">
            {['Andhra North', 'Telangana Central', 'Hyderabad Urban'].map((c, i) => (
              <li key={c} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{c}</p>
                  <p className="text-xs text-muted-foreground">Grievance resolution {90 - i * 8}%</p>
                </div>
                <Badge variant={i === 0 ? 'success' : 'secondary'}>#{i + 1}</Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Finance & Compliance" description="Donations vs expenses">
          <div className="flex items-center gap-3 rounded-md bg-muted p-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">₹ 12.4L available</p>
              <p className="text-xs text-muted-foreground">75% of quarterly budget</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
