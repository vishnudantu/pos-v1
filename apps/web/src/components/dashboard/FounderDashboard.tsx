import {
  Users,
  Shield,
  Map,
  Megaphone,
  Wallet,
  Key,
  Cpu,
  ToggleRight,
  Download,
  Activity,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Newspaper,
  Landmark,
  Globe,
  Lock,
} from 'lucide-react'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { EmptyState } from '../primitives/EmptyState'
import { DashboardLayout } from './DashboardLayout'
import { useDashboardCommand } from './useDashboardCommand'

const FEATURES = [
  { id: 'ai-studio', label: 'AI Studio', icon: Sparkles, enabled: true },
  { id: 'omniscan', label: 'OmniScan Media', icon: Newspaper, enabled: true },
  { id: 'whatsapp', label: 'WhatsApp Intel', icon: Smartphone, enabled: false },
  { id: 'darshan', label: 'Tirupati Darshan', icon: Landmark, enabled: true },
  { id: 'grievances', label: 'Grievance Center', icon: AlertTriangle, enabled: true },
  { id: 'booths', label: 'Booth Management', icon: Map, enabled: true },
  { id: 'voters', label: 'Voter Database', icon: Users, enabled: false },
  { id: 'content-factory', label: 'Content Factory', icon: Megaphone, enabled: false },
]

const POLITICIANS = [
  { name: 'Nara Chandrababu Naidu', role: 'Party President', state: 'Andhra Pradesh', active: true },
  { name: 'Nara Lokesh', role: 'MLA', state: 'Andhra Pradesh', active: true },
  { name: 'Kinjarapu Ram Mohan Naidu', role: 'MP', state: 'Andhra Pradesh', active: true },
  { name: 'Appalanaidu Kalisetti', role: 'MP', state: 'Andhra Pradesh', active: false },
]

const INTEGRATIONS = [
  { name: 'Bynara AI', status: 'connected', type: 'AI' },
  { name: 'Ollama Local', status: 'connected', type: 'AI' },
  { name: 'Fast2SMS', status: 'pending', type: 'SMS' },
  { name: 'WhatsApp Business', status: 'disabled', type: 'Messaging' },
]

export function FounderDashboard() {
  const { data, loading } = useDashboardCommand()

  return (
    <DashboardLayout
      title="Founder Command Center"
      subtitle="Deploy politicians, manage features, control integrations, and export everything."
      badge="Party President"
      actions={
        <>
          <Button size="sm" variant="outline"><Globe className="mr-2 h-4 w-4" /> Public View</Button>
          <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Deploy Politician</Button>
        </>
      }
      loading={loading}
      stats={
        <>
          <StatCard label="Politicians Deployed" value={data?.totalPoliticians ?? 24} icon={Shield} delta={4} deltaLabel="this month" />
          <StatCard label="Active Staff" value={data?.activeUsers ?? 142} icon={Users} delta={18} deltaLabel="this week" />
          <StatCard label="Features Enabled" value="5/8" icon={ToggleRight} deltaLabel="modules" />
          <StatCard label="AI Credits Used" value="82%" icon={Cpu} delta={12} deltaLabel="vs last week" />
        </>
      }
    >
      <div className="lg:col-span-2 space-y-6">
        {/* Politicians */}
        <SectionCard
          title="Politicians & Deployments"
          description="Active politicians under your organization"
          action={<Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Add</Button>}
        >
          <div className="space-y-2">
            {POLITICIANS.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {p.name.split(' ').pop()?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role} · {p.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.active ? 'success' : 'secondary'}>
                    {p.active ? 'Active' : 'Paused'}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Feature Control */}
        <SectionCard
          title="Feature Control"
          description="Enable or disable modules across the platform"
          action={<Badge variant="info">Global</Badge>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{f.label}</span>
                  </div>
                  <Badge variant={f.enabled ? 'success' : 'secondary'}>
                    {f.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        {/* Integrations */}
        <SectionCard
          title="API Keys & Integrations"
          description="Connected services and credentials"
          action={<Button size="sm" variant="outline"><Key className="mr-2 h-4 w-4" /> Manage</Button>}
        >
          <div className="space-y-2">
            {INTEGRATIONS.map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.type}</p>
                </div>
                <Badge
                  variant={
                    i.status === 'connected' ? 'success' : i.status === 'pending' ? 'warning' : 'secondary'
                  }
                >
                  {i.status}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* AI Governance */}
        <SectionCard
          title="AI Governance"
          description="Models, prompts, and usage controls"
          action={<Button size="sm" variant="outline"><Cpu className="mr-2 h-4 w-4" /> Configure</Button>}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Default Model</span>
              <Badge variant="secondary">Bynara AI</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Fallback Model</span>
              <Badge variant="secondary">Ollama llama3.1</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Per-Politician Training</span>
              <Badge variant="success"><CheckCircle2 className="mr-1 inline h-3 w-3" /> Active</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Monthly Quota</span>
              <span className="font-medium">820K / 1M tokens</span>
            </div>
          </div>
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard title="Founder Actions">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Users className="mr-2 h-4 w-4" /> Manage Staff
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Lock className="mr-2 h-4 w-4" /> Roles & Permissions
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Wallet className="mr-2 h-4 w-4" /> Billing & Wallet
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Download className="mr-2 h-4 w-4" /> Bulk Data Export
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Activity className="mr-2 h-4 w-4" /> Audit Logs
            </Button>
          </div>
        </SectionCard>

        {/* System Status */}
        <SectionCard title="Platform Health" action={<Badge variant="success">Healthy</Badge>}>
          <EmptyState
            icon={CheckCircle2}
            title="All systems operational"
            description="No critical alerts at this time."
          />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
