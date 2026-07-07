import { Download, FileText, Users, Shield, Activity, Database, Calendar } from 'lucide-react'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { SectionCard } from '../../components/primitives/SectionCard'

const EXPORTS = [
  { key: 'politicians', label: 'All Politicians', icon: Shield, description: 'Politician profiles, party assignments, status' },
  { key: 'parties', label: 'All Parties', icon: Users, description: 'Party details, subscriptions, active status' },
  { key: 'users', label: 'All Users', icon: Users, description: 'User directory, roles, last login' },
  { key: 'grievances', label: 'Grievances', icon: FileText, description: 'Full grievance database with status and SLA' },
]

export default function Exports() {
  function download(type: string) {
    const token = localStorage.getItem('token') || localStorage.getItem('nethra_token') || ''
    const url = `/api/founder/exports/${type}?_t=${Date.now()}`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        const blob = await r.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${type}_export.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch((e) => {
        console.error('[exports] download error:', e)
        alert('Export failed: ' + e.message)
      })
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit & Exports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Download reports and data exports for compliance and analysis.</p>
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
                  <Download className="mr-2 h-4 w-4" /> Download CSV
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <SectionCard title="Full Database Export" description="MySQL dump for disaster recovery">
        <p className="text-sm text-muted-foreground">Use the server command below or request a full database backup from System Health.</p>
        <code className="mt-2 block rounded-md bg-muted p-3 text-xs">
          mysqldump -u pos_user -p pos_db &gt; backup.sql
        </code>
      </SectionCard>
    </div>
  )
}
