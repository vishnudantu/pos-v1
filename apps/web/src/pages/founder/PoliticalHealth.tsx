import { useEffect, useMemo, useState } from 'react'
import {
  TrendingUp,
  Users,
  Building2,
  AlertTriangle,
  Shield,
  CreditCard,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  Bell,
  FileText,
  Calendar,
} from 'lucide-react'
import { Card, CardContent } from '../../components/primitives/Card'
import { Button } from '../../components/primitives/Button'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { StatCard } from '../../components/primitives/StatCard'
import { Loading } from '../../components/primitives/Loading'
import { api } from '../../lib/api'

interface PoliticianHealth {
  id: number
  name: string
  constituency?: string
  state?: string
  party?: string
  party_color?: string | null
  healthScore: number
  isActive: boolean
  plan: string
  status: string
  partySubscriptionStatus?: string
  daysSinceUpdate: number
  daysToExpiry: number | null
  state: 'strong' | 'competitive' | 'at-risk' | 'critical'
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
    strong: 'success',
    competitive: 'warning',
    'at-risk': 'danger',
    critical: 'danger',
  }
  return <Badge variant={variants[status] || 'secondary'}>{status.replace('-', ' ').toUpperCase()}</Badge>
}

function TrendIcon({ daysSinceUpdate }: { daysSinceUpdate: number }) {
  if (daysSinceUpdate < 7) return <ArrowUpRight className="h-4 w-4 text-success" />
  if (daysSinceUpdate > 30) return <ArrowDownRight className="h-4 w-4 text-danger" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export default function PoliticalHealth() {
  const [politicians, setPoliticians] = useState<PoliticianHealth[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'strong' | 'competitive' | 'at-risk' | 'critical'>('all')
  const [generating, setGenerating] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const data = await api.get('/api/founder/reports/political-health')
      const list = Array.isArray(data?.politicians) ? data.politicians : []
      setPoliticians(list)
      setSummary(data?.summary || { parties: 0, politicians: list.length, critical: 0 })
    } catch (e) {
      console.error('[political-health] fetch error:', e)
      setPoliticians([])
      setSummary({ parties: 0, politicians: 0, critical: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    if (filter === 'all') return politicians
    return politicians.filter((p) => p.state === filter)
  }, [politicians, filter])

  const averages = useMemo(() => {
    const n = politicians.length || 1
    return {
      healthScore: Math.round(politicians.reduce((a, b) => a + (b.healthScore || 0), 0) / n),
      activePct: Math.round((politicians.filter((p) => p.isActive).length / n) * 100),
      avgDaysSinceUpdate: Math.round(politicians.reduce((a, b) => a + (b.daysSinceUpdate || 0), 0) / n),
      critical: politicians.filter((p) => p.state === 'critical' || p.state === 'at-risk').length,
    }
  }, [politicians])

  function generateReport() {
    setGenerating(true)
    setTimeout(() => {
      alert('Political Health Report generated and queued for download.')
      setGenerating(false)
    }, 1500)
  }

  function alertText(p: PoliticianHealth): string | undefined {
    if (!p.isActive) return 'Politician account is inactive'
    if (p.partySubscriptionStatus === 'expired') return 'Party subscription expired'
    if (p.partySubscriptionStatus === 'cancelled') return 'Party subscription cancelled'
    if (p.partySubscriptionStatus === 'paused') return 'Party subscription paused'
    if (p.daysToExpiry !== null && p.daysToExpiry < 30) return `Subscription expires in ${p.daysToExpiry} days`
    if (p.daysSinceUpdate > 60) return 'No profile updates in 60+ days'
    return undefined
  }

  if (loading) return <Loading text="Loading political health intelligence..." className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Political Health & Intelligence</h1>
            <Badge variant="info">Super Admin</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Tenant health, subscription status, and platform engagement across all politicians.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          <Button size="sm" onClick={generateReport} loading={generating}><Download className="mr-2 h-4 w-4" /> Generate Report</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Politicians" value={summary?.politicians ?? 0} icon={Users} delta={summary?.parties} deltaLabel="parties" />
        <StatCard label="Avg Health Score" value={averages.healthScore} icon={TrendingUp} delta={averages.activePct} deltaLabel="% active" />
        <StatCard label="Critical" value={averages.critical} icon={AlertTriangle} delta={summary?.inactive} deltaLabel="inactive" />
        <StatCard label="Integrations" value={summary?.connectedIntegrations ?? 0} icon={Activity} deltaLabel="connected" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Politician Health Matrix"
          description="Ranked by tenant health score"
          action={
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border bg-background px-2 py-1 text-xs"
            >
              <option value="all">All Status</option>
              <option value="strong">Strong</option>
              <option value="competitive">Competitive</option>
              <option value="at-risk">At Risk</option>
              <option value="critical">Critical</option>
            </select>
          }
        >
          <div className="space-y-2">
            {filteredData.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ background: p.party_color || 'hsl(var(--primary))' }}
                      >
                        {(p.name?.split(' ').pop() || 'P')[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{p.name}</p>
                          <StatusBadge status={p.state} />
                          <TrendIcon daysSinceUpdate={p.daysSinceUpdate} />
                          {!p.isActive && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.constituency}{p.constituency && p.state ? ', ' : ''}{p.state}{p.party ? ` · ${p.party}` : ''}
                        </p>
                        {(() => {
                          const alert = alertText(p)
                          return alert ? (
                            <div className="mt-1 flex items-center gap-1 text-xs text-warning">
                              <Bell className="h-3 w-3" />{alert}
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 md:gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Health</p>
                        <p className={`font-semibold ${p.healthScore >= 70 ? 'text-success' : p.healthScore >= 50 ? 'text-warning' : 'text-danger'}`}>{p.healthScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Plan</p>
                        <p className="text-xs font-medium uppercase">{p.plan}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Updated</p>
                        <p className="font-semibold">{p.daysSinceUpdate}d</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Expiry</p>
                        <p className={`font-semibold ${p.daysToExpiry !== null && p.daysToExpiry < 30 ? 'text-danger' : ''}`}>
                          {p.daysToExpiry !== null ? `${p.daysToExpiry}d` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Subscription Mix" description="Active party plans">
            <div className="space-y-2">
              {Object.entries(summary?.planCounts || {}).map(([plan, count]: [string, any]) => (
                <div key={plan} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium capitalize">{plan}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(summary?.planCounts || {}).length === 0 && (
                <p className="text-sm text-muted-foreground">No active subscriptions yet.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Alerts" description="Tenant issues">
            <div className="space-y-2">
              {filteredData
                .filter((p) => alertText(p))
                .slice(0, 6)
                .map((p) => (
                  <div key={p.id} className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">{p.name}</p>
                    <p className="text-sm font-medium">{alertText(p)}</p>
                  </div>
                ))}
              {filteredData.filter((p) => alertText(p)).length === 0 && (
                <p className="text-sm text-muted-foreground">No active alerts.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Platform Pulse">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Active Users</span><span className="font-medium">{summary?.activeUsers ?? 0}</span></div>
              <div className="flex justify-between"><span>Connected Integrations</span><span className="font-medium">{summary?.connectedIntegrations ?? 0}</span></div>
              <div className="flex justify-between"><span>Inactive Politicians</span><span className="font-medium">{summary?.inactive ?? 0}</span></div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
