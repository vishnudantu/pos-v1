import { MessageSquareWarning, Newspaper, CalendarDays, Map, Zap, Sparkles, Clock, CheckCircle2 } from 'lucide-react'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { EmptyState } from '../primitives/EmptyState'
import { DashboardLayout } from './DashboardLayout'
import { useDashboardCommand } from './useDashboardCommand'

export function PoliticianDashboard() {
  const { data, loading } = useDashboardCommand()

  return (
    <DashboardLayout
      title="Constituency Command Center"
      subtitle="Grievances, media, events, and booth strength in one view."
      badge="Politician"
      actions={
        <>
          <Button size="sm" variant="outline">Morning Brief</Button>
          <Button size="sm"><Zap className="mr-2 h-4 w-4" /> AI Action</Button>
        </>
      }
      loading={loading}
      stats={
        <>
          <StatCard
            label="Pending Grievances"
            value={data?.pendingGrievances ?? 0}
            icon={MessageSquareWarning}
            delta={data ? Math.round((data.overdueGrievances / Math.max(data.pendingGrievances, 1)) * 100) : 0}
            deltaLabel="overdue"
          />
          <StatCard label="Media Mentions" value={data?.mediaMentions24h ?? 0} icon={Newspaper} delta={data?.sentimentTrend} deltaLabel="sentiment" />
          <StatCard label="Upcoming Events" value={data?.upcomingEvents ?? 0} icon={CalendarDays} />
          <StatCard label="Booth Strength" value={`${data?.boothStrength ?? 0}%`} icon={Map} delta={data ? data.boothStrength - 72 : 0} deltaLabel="vs target" />
        </>
      }
    >
      <div className="lg:col-span-2 space-y-6">
        <SectionCard
          title="Pending Actions"
          description="Issues requiring your attention today"
          action={<Badge variant="danger">3 urgent</Badge>}
        >
          <div className="space-y-2">
            {[
              { title: 'Water supply complaint in Ward 4', time: '2h ago', type: 'Grievance', urgent: true },
              { title: 'School renovation follow-up', time: '5h ago', type: 'Grievance', urgent: false },
              { title: 'Village visit — Dubbaka mandal', time: 'Tomorrow, 9:00 AM', type: 'Schedule', urgent: false },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${a.urgent ? 'bg-danger' : 'bg-muted'}`} />
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.type} · {a.time}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Open</Button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Media Mentions (24h)" description="Sentiment and top headlines">
          {data?.mediaMentions24h ? (
            <div className="space-y-2">
              {['Positive coverage on irrigation project', 'Opposition questions road delay', 'Local news: constituency clinic launch'].map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{m}</span>
                  <Badge variant={i === 0 ? 'success' : i === 1 ? 'danger' : 'info'}>
                    {i === 0 ? '+' : i === 1 ? '−' : '•'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Newspaper} title="No mentions yet" description="Media scans run every hour." />
          )}
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Morning Brief" action={<Button size="sm" variant="ghost"><Sparkles className="h-4 w-4" /></Button>}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
              <p className="text-sm">Top 3 actions auto-generated for today.</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-warning" />
              <p className="text-sm">2 visits recommended based on weak booths.</p>
            </div>
            <Button className="w-full" size="sm">Open Brief</Button>
          </div>
        </SectionCard>

        <SectionCard title="Booth Strength" description="Top 3 weak booths">
          <div className="space-y-2">
            {['Booth 14 — Urban', 'Booth 27 — Rural North', 'Booth 31 — SC Colony'].map((b, i) => (
              <div key={b} className="flex items-center justify-between text-sm">
                <span>{b}</span>
                <span className={`font-medium ${i === 0 ? 'text-danger' : 'text-warning'}`}>{60 - i * 7}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
