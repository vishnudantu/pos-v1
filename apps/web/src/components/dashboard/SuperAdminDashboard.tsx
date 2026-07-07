import { Users, Shield, Activity, AlertTriangle, Server, Key } from 'lucide-react'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { EmptyState } from '../primitives/EmptyState'
import { DashboardLayout } from './DashboardLayout'
import { useDashboardCommand } from './useDashboardCommand'

export function SuperAdminDashboard() {
  const { data, loading } = useDashboardCommand()

  return (
    <DashboardLayout
      title="Super Admin Command"
      subtitle="Platform health, users, politicians, and system governance."
      badge="Super Admin"
      actions={<Button size="sm">Manage Platform</Button>}
      loading={loading}
      stats={
        <>
          <StatCard label="Total Users" value={data?.activeUsers ?? 0} icon={Users} delta={12} deltaLabel="this week" />
          <StatCard label="Politicians" value={data?.totalPoliticians ?? 0} icon={Shield} />
          <StatCard label="Active Modules" value="8" icon={Activity} delta={2} deltaLabel="new" />
          <StatCard label="System Alerts" value="1" icon={AlertTriangle} delta={-50} deltaLabel="vs last week" />
        </>
      }
    >
      <div className="lg:col-span-2 space-y-6">
        <SectionCard
          title="System Health"
          description="API, database, and queue status"
          action={<Badge variant="success">Operational</Badge>}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">API</p>
              <p className="font-medium">Healthy</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Database</p>
              <p className="font-medium">Connected</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">SSL Expiry</p>
              <p className="font-medium">Sep 2026</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recent Sign-ups" description="Last 5 users who joined">
          <EmptyState
            icon={Users}
            title="No recent sign-ups"
            description="New users will appear here once they activate their accounts."
          />
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Quick Actions">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Users className="mr-2 h-4 w-4" /> Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Shield className="mr-2 h-4 w-4" /> Manage Politicians
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Key className="mr-2 h-4 w-4" /> API Keys
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Server className="mr-2 h-4 w-4" /> Server Logs
            </Button>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
