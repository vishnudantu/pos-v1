import { Download, FileText, Database, Users, Shield, Activity, Calendar } from 'lucide-react'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'

const EXPORTS = [
  { key: 'politicians', label: 'All Politicians', icon: Shield, description: 'Politician profiles, party assignments, status' },
  { key: 'parties', label: 'All Parties', icon: Users, description: 'Party details, subscriptions, active status' },
  { key: 'users', label: 'All Users', icon: Users, description: 'User directory, roles, last login' },
  { key: 'grievances', label: 'Grievances', icon: FileText, description: 'Full grievance database with status and SLA' },
  { key: 'events', label: 'Events & Appointments', icon: Calendar, description: 'Schedule and event history' },
  { key: 'audit_logs', label: 'Audit Logs', icon: Activity, description: 'Security and change audit trail' },
  { key: 'full_database', label: 'Full Database Dump', icon: Database, description: 'Complete MySQL-compatible export' },
]

export default function Exports() {
  async function download(key: string) {
    alert(`Export queued for ${key}. Download will begin shortly.`)
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit & Exports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Download reports and full data exports for compliance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map((e) => {
          const Icon = e.icon
          return (
            <Card key={e.key}>
              <CardContent className="p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium">{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.description}</p>
                <Button className="mt-4 w-full" size="sm" variant="outline" onClick={() => download(e.key)}>
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <SectionCard title="Recent Exports" description="History of generated reports">
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No exports generated yet. Use the cards above to create one.
        </div>
      </SectionCard>
    </div>
  )
}
