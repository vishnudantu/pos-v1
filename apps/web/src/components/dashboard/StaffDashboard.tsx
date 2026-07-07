import { MessageSquareWarning, CalendarDays, Users, CheckSquare } from 'lucide-react'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { EmptyState } from '../primitives/EmptyState'
import { DashboardLayout } from './DashboardLayout'
import { useDashboardCommand } from './useDashboardCommand'

export function StaffDashboard() {
  const { data, loading } = useDashboardCommand()

  return (
    <DashboardLayout
      title="Staff Workspace"
      subtitle="Your assigned tasks, grievances, and schedules."
      badge="Staff"
      actions={<Button size="sm">New Task</Button>}
      loading={loading}
      stats={
        <>
          <StatCard label="My Grievances" value={data?.pendingGrievances ?? 0} icon={MessageSquareWarning} />
          <StatCard label="Tasks Done" value="14" icon={CheckSquare} delta={8} deltaLabel="this week" />
          <StatCard label="Upcoming" value={data?.upcomingEvents ?? 0} icon={CalendarDays} />
          <StatCard label="Contacts" value={data?.totalVoters ?? 0} icon={Users} />
        </>
      }
    >
      <div className="lg:col-span-2 space-y-6">
        <SectionCard title="Assigned Grievances" description="Issues assigned to you" action={<Badge variant="warning">2 due today</Badge>}>
          <div className="space-y-2">
            {[
              { title: 'Street light repair — Lane 7', status: 'In Progress', due: 'Today' },
              { title: 'Pension application support', status: 'New', due: 'Tomorrow' },
              { title: 'Drainage overflow — Market area', status: 'Escalated', due: 'Overdue' },
            ].map((g, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{g.title}</p>
                  <p className="text-xs text-muted-foreground">Due {g.due}</p>
                </div>
                <Badge variant={g.status === 'Escalated' ? 'danger' : g.status === 'New' ? 'info' : 'secondary'}>
                  {g.status}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Quick Links">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" size="sm">Grievances</Button>
            <Button variant="outline" className="w-full justify-start" size="sm">Voter Lookup</Button>
            <Button variant="outline" className="w-full justify-start" size="sm">Event Calendar</Button>
          </div>
        </SectionCard>

        <SectionCard title="Announcements">
          <EmptyState
            icon={CheckSquare}
            title="No announcements"
            description="Updates from your team will appear here."
          />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
