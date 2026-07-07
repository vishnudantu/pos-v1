import { Globe, ExternalLink } from 'lucide-react'
import { Button } from '../../components/primitives/Button'
import { SectionCard } from '../../components/primitives/SectionCard'

export default function PublicWebsite() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Public Website</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure the citizen-facing portal and landing pages.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Live Public Site" description="What citizens see today">
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">https://thoughtfirst.in</p>
            <p className="text-xs text-muted-foreground">Currently points to the dashboard login. Citizen portal coming in Phase 7.</p>
            <Button className="mt-3" size="sm" variant="outline" onClick={() => window.open('https://thoughtfirst.in', '_blank')}><ExternalLink className="mr-2 h-4 w-4" /> Open Site</Button>
          </div>
        </SectionCard>

        <SectionCard title="Portal Modules" description="Enable citizen-facing features">
          <div className="space-y-2">
            {['Grievance Status Tracker', 'Appointment Booking', 'Development Works Map', 'Scheme Eligibility', 'Event Calendar', 'Praise / Complaint'].map((m) => (
              <div key={m} className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">{m}</span>
                <span className="text-xs text-muted-foreground">Coming soon</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
