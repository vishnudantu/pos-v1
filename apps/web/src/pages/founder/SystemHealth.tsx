import { useEffect, useState } from 'react'
import { Activity, Server, Database, Cpu, Lock, Globe, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent } from '../../components/primitives/Card'
import { SectionCard } from '../../components/primitives/SectionCard'
import { Badge } from '../../components/primitives/Badge'
import { Button } from '../../components/primitives/Button'
import { apiGet } from '../../lib/api'

export default function SystemHealth() {
  const [health, setHealth] = useState<any>(null)

  useEffect(() => {
    apiGet('/api/health').then((r) => r.json()).then((d) => setHealth(d)).catch(() => setHealth({ status: 'error' }))
  }, [])

  const services = [
    { name: 'API Server', status: health?.status === 'ok' ? 'ok' : 'error', icon: Server },
    { name: 'Database', status: 'ok', icon: Database },
    { name: 'AI Providers', status: 'ok', icon: Cpu },
    { name: 'SSL Certificate', status: 'ok', icon: Lock },
    { name: 'CDN / Static', status: 'ok', icon: Globe },
  ]

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Health</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform infrastructure and service status.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md ${s.status === 'ok' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium">{s.name}</p>
                  </div>
                  <Badge variant={s.status === 'ok' ? 'success' : 'danger'}>{s.status === 'ok' ? 'Healthy' : 'Issue'}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Server Details">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Hostname</span><span>vmi3284430</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">OS</span><span>Ubuntu 24.04 Noble</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Node.js</span><span>v20.20.2</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Web Port</span><span>4173 (static)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">API Port</span><span>3002</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">SSL Expiry</span><span>Sep 2026</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Actions">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" size="sm"><Activity className="mr-2 h-4 w-4" /> Restart API Service</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Globe className="mr-2 h-4 w-4" /> Restart Web Service</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Database className="mr-2 h-4 w-4" /> Backup Database</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Lock className="mr-2 h-4 w-4" /> Renew SSL</Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="API Response" action={<Badge variant={health?.status === 'ok' ? 'success' : 'danger'}>{health?.status || 'unknown'}</Badge>}>
        <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(health, null, 2)}</pre>
      </SectionCard>
    </div>
  )
}
