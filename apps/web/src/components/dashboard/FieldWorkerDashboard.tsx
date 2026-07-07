import { MapPin, Camera, Users, CheckCircle2 } from 'lucide-react'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Button } from '../primitives/Button'
import { EmptyState } from '../primitives/EmptyState'
import { DashboardLayout } from './DashboardLayout'

export function FieldWorkerDashboard() {
  return (
    <DashboardLayout
      title="Field Agent Console"
      subtitle="Tasks, visits, photo captures, and voter verification."
      badge="Field Worker"
      actions={<Button size="sm"><Camera className="mr-2 h-4 w-4" /> Capture</Button>}
      stats={
        <>
          <StatCard label="Visits Today" value="4" icon={MapPin} delta={2} deltaLabel="vs yesterday" />
          <StatCard label="Photos" value="18" icon={Camera} />
          <StatCard label="Voter Verifications" value="32" icon={Users} delta={12} deltaLabel="today" />
          <StatCard label="Tasks Done" value="7/10" icon={CheckCircle2} />
        </>
      }
    >
      <div className="lg:col-span-2 space-y-6">
        <SectionCard title="Today’s Route" description="Optimized visit sequence">
          <div className="space-y-2">
            {['Booth 4 — School inspection', 'Booth 9 — Water complaint', 'Booth 12 — Voter registration camp', 'Booth 15 — Follow-up visit'].map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium">{t}</p>
                </div>
                <Button variant="outline" size="sm">Check in</Button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Quick Capture">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" size="sm"><Camera className="mr-2 h-4 w-4" /> Photo Grievance</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Users className="mr-2 h-4 w-4" /> Voter Check</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><MapPin className="mr-2 h-4 w-4" /> Mark Location</Button>
          </div>
        </SectionCard>

        <SectionCard title="Sync Status">
          <EmptyState
            icon={CheckCircle2}
            title="All synced"
            description="Last sync: 2 minutes ago"
          />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
