import {
  Users,
  Shield,
  Building2,
  ToggleRight,
  Key,
  Download,
  Activity,
  Plus,
  Settings,
  Globe,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { EmptyState } from '../primitives/EmptyState'
import { Loading } from '../primitives/Loading'
import { DashboardLayout } from './DashboardLayout'
import { api } from '../../lib/api'

export function FounderDashboard() {
  const [parties, setParties] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [politicians, setPoliticians] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [globalFeatures, setGlobalFeatures] = useState<any[]>([])
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    const results: any = {}

    try {
      results.parties = await api.list('parties')
    } catch (e: any) {
      console.error('[founder-dashboard] parties error:', e)
      results.parties = []
    }
    try {
      results.users = await api.list('founder/users')
    } catch (e: any) {
      console.error('[founder-dashboard] users error:', e)
      results.users = []
    }
    try {
      results.politicians = await api.list('politicians')
    } catch (e: any) {
      console.error('[founder-dashboard] politicians error:', e)
      results.politicians = []
    }
    try {
      results.integrations = await api.list('integrations')
    } catch (e: any) {
      console.error('[founder-dashboard] integrations error:', e)
      results.integrations = []
    }
    try {
      const f = await api.get('/api/features/matrix')
      results.features = f.global || []
    } catch (e: any) {
      console.error('[founder-dashboard] features error:', e)
      results.features = []
    }
    try {
      results.health = await api.get('/api/founder/reports/political-health')
    } catch (e: any) {
      console.error('[founder-dashboard] health error:', e)
      results.health = null
    }

    setParties(Array.isArray(results.parties) ? results.parties : [])
    setUsers(Array.isArray(results.users) ? results.users : [])
    setPoliticians(Array.isArray(results.politicians) ? results.politicians : [])
    setIntegrations(Array.isArray(results.integrations) ? results.integrations : [])
    setGlobalFeatures(Array.isArray(results.features) ? results.features : [])
    setHealth(results.health?.summary || results.health || null)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const enabledCount = useMemo(() => globalFeatures.filter((f) => f.is_active).length, [globalFeatures])
  const connectedIntegrations = useMemo(() => integrations.filter((i) => i.status === 'connected').length, [integrations])

  return (
    <DashboardLayout
      title="Founder Command Center"
      subtitle="Deploy parties, control features, manage subscriptions, and export everything."
      badge="God Mode"
      actions={
        <>
          <Button size="sm" variant="outline"><Globe className="mr-2 h-4 w-4" /> Public View</Button>
          <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" /> Export All</Button>
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Deploy Party</Button>
        </>
      }
      loading={loading}
      stats={
        <>
          <StatCard label="Parties" value={parties.length} icon={Building2} delta={parties.filter((p) => p.is_active).length} deltaLabel="active" />
          <StatCard label="Politicians" value={politicians.length} icon={Shield} delta={politicians.filter((p) => p.is_active).length} deltaLabel="active" />
          <StatCard label="Active Users" value={users.filter((u) => u.is_active).length} icon={Users} delta={users.length} deltaLabel="total" />
          <StatCard label="Features Enabled" value={`${enabledCount}/${globalFeatures.length || 51}`} icon={ToggleRight} deltaLabel="globally" />
        </>
      }
    >
      <div className="lg:col-span-2 space-y-6">
        <SectionCard
          title="Party Deployments"
          description="Parties subscribed to the platform"
          action={<Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Party</Button>}
        >
          <div className="space-y-2">
            {parties.length === 0 ? (
              <EmptyState icon={Building2} title="No parties deployed" description="Create a party to begin." />
            ) : (
              parties.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                      {p.code || p.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.subscription_plan?.toUpperCase() || 'NO PLAN'} · {p.subscription_status || 'unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.subscription_status === 'active' ? 'success' : 'warning'}>{p.subscription_status}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Global Feature Matrix"
          description="Control feature availability across all tenants"
          action={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">Per-Party</Button>
              <Button size="sm" variant="outline">Per-Role</Button>
            </div>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {globalFeatures.slice(0, 10).map((f) => (
              <div key={f.id} className="flex items-start justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.description || 'No description'}</p>
                </div>
                <Badge variant={f.is_active ? 'success' : 'secondary'}>{f.is_active ? 'Enabled' : 'Disabled'}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Platform Health"
          description="Political and system status"
          action={<Badge variant={health?.critical ? 'warning' : 'success'}>{health?.critical ? `${health.critical} critical` : 'Healthy'}</Badge>}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Politicians</span><span className="font-medium">{health?.politicians ?? politicians.length}</span></div>
            <div className="flex justify-between"><span>Parties</span><span className="font-medium">{health?.parties ?? parties.length}</span></div>
            <div className="flex justify-between"><span>Critical Alerts</span><span className={health?.critical ? 'font-medium text-danger' : 'font-medium'}>{health?.critical ?? 0}</span></div>
            <div className="flex justify-between"><span>Integrations</span><span className="font-medium">{connectedIntegrations}/{integrations.length} connected</span></div>
            <div className="flex justify-between"><span>API</span><span className="text-success">Operational</span></div>
            <div className="flex justify-between"><span>Database</span><span className="text-success">Connected</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Integrations" description="Connected services" action={<Button size="sm" variant="outline"><Key className="mr-2 h-4 w-4" /> Manage</Button>}>
          <div className="space-y-2">
            {integrations.length === 0 ? (
              <EmptyState icon={Key} title="No integrations" description="Add AI, SMS, payment, or messaging integrations." />
            ) : (
              integrations.slice(0, 5).map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{i.provider_name || i.integration_type}</p>
                    <p className="text-xs text-muted-foreground">{i.integration_type}</p>
                  </div>
                  <Badge variant={i.status === 'connected' ? 'success' : i.status === 'pending' ? 'warning' : 'secondary'}>{i.status}</Badge>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="God Mode Actions">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" size="sm"><Building2 className="mr-2 h-4 w-4" /> Deploy New Party</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Shield className="mr-2 h-4 w-4" /> Deploy Politician</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Users className="mr-2 h-4 w-4" /> Bulk Create Staff</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><ToggleRight className="mr-2 h-4 w-4" /> Feature Permissions</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Key className="mr-2 h-4 w-4" /> API Keys</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Download className="mr-2 h-4 w-4" /> Bulk Data Export</Button>
            <Button variant="outline" className="w-full justify-start" size="sm"><Activity className="mr-2 h-4 w-4" /> Audit Logs</Button>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
