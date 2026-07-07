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
  CheckCircle2,
  CreditCard,
  Globe,
  AlertTriangle,
  Cpu,
  Lock,
  Bot,
  MessageSquareWarning,
  Sparkles,
  Newspaper,
  Smartphone,
  Landmark,
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

const ALL_FEATURES = [
  { id: 'ai-studio', label: 'AI Studio', icon: Sparkles, description: 'Prompts, agents, training' },
  { id: 'omniscan', label: 'OmniScan Media', icon: Newspaper, description: 'RSS + news monitoring' },
  { id: 'whatsapp-intel', label: 'WhatsApp Intelligence', icon: Smartphone, description: 'Group ingestion + classification' },
  { id: 'darshan', label: 'Tirupati Darshan', icon: Landmark, description: 'Temple booking workflow' },
  { id: 'grievances', label: 'Grievance Center', icon: MessageSquareWarning, description: 'Citizen issue tracking' },
  { id: 'booths', label: 'Booth Management', icon: Users, description: 'Karyakarta + voter mapping' },
  { id: 'voters', label: 'Voter Database', icon: Shield, description: 'Import + predictive scoring' },
  { id: 'content-factory', label: 'Content Factory', icon: Cpu, description: 'AI generated content' },
  { id: 'agent-system', label: 'Auto Agents', icon: Bot, description: 'Autonomous task agents' },
  { id: 'deepfake-shield', label: 'Deepfake Shield', icon: Lock, description: 'Misinformation defense' },
]

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
    try {
      const [pRes, uRes, polRes, iRes, fRes, hRes] = await Promise.all([
        api.list('parties'),
        api.list('founder/users'),
        api.list('politicians'),
        api.list('integrations'),
        api.get('/api/features/matrix'),
        api.get('/api/founder/reports/political-health'),
      ])
      setParties(pRes.data || pRes || [])
      setUsers(uRes.data || uRes || [])
      setPoliticians(polRes.data || polRes || [])
      setIntegrations(iRes.data || iRes || [])
      setGlobalFeatures(fRes.global || [])
      setHealth(hRes.summary || null)
    } catch (e) {
      console.error('[founder-dashboard] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const enabledCount = useMemo(() => {
    return globalFeatures.filter((f) => f.is_active).length
  }, [globalFeatures])

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
          <StatCard label="Parties" value={parties.length} icon={Building2} delta={parties.filter((p) => p.subscription_status === 'active').length} deltaLabel="active" />
          <StatCard label="Politicians" value={politicians.length} icon={Shield} delta={politicians.filter((p) => p.is_active).length} deltaLabel="active" />
          <StatCard label="Active Users" value={users.filter((u) => u.is_active).length} icon={Users} delta={users.length} deltaLabel="total" />
          <StatCard label="Features Enabled" value={`${enabledCount}/${ALL_FEATURES.length}`} icon={ToggleRight} deltaLabel="globally" />
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
                      <p className="text-xs text-muted-foreground">{p.politicians_count ?? 0} politicians · {p.users_count ?? 0} users · {p.subscription_plan || 'trial'} plan</p>
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
            {ALL_FEATURES.map((f) => {
              const Icon = f.icon
              const enabled = globalFeatures.some((g) => g.feature_key === f.id && g.is_active)
              return (
                <div key={f.id} className="flex items-start justify-between rounded-md border p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                  <Badge variant={enabled ? 'success' : 'secondary'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
                </div>
              )
            })}
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
            <div className="flex justify-between"><span>Politicians</span><span className="font-medium">{health?.politicians ?? 0}</span></div>
            <div className="flex justify-between"><span>Parties</span><span className="font-medium">{health?.parties ?? 0}</span></div>
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
