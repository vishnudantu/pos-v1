import { useEffect, useState, useMemo } from 'react'
import {
  MessageSquareWarning,
  Newspaper,
  CalendarDays,
  MapPin,
  Mic,
  Sparkles,
  Zap,
  Megaphone,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { Button } from '../primitives/Button'
import { Card, CardContent } from '../primitives/Card'
import { Badge } from '../primitives/Badge'
import { StatCard } from '../primitives/StatCard'
import { SectionCard } from '../primitives/SectionCard'
import { Loading } from '../primitives/Loading'
import { DashboardLayout } from './DashboardLayout'
import { Link } from 'react-router-dom'

function AnimatedRing({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90 transform">
          <circle cx="48" cy="48" r={radius} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
          <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold">{value}%</span></div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

export function PoliticianDashboard() {
  const { user, politician } = useAuth() as any
  const politicianId = politician?.id
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!politicianId) {
      setLoading(false)
      setError('No politician assigned to this account')
      return
    }
    let cancelled = false
    api.get(`/api/dashboard/politician/${politicianId}`)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => {
        console.error('[dashboard] error:', e)
        if (!cancelled) setError(e.message || 'Failed to load dashboard')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [politicianId])

  const trustScore = useMemo(() => {
    if (!data) return 0
    const grievanceScore = data.stats?.pendingGrievances === 0 ? 100 : 70
    const boothScore = data.stats?.boothStrength || 0
    const mediaScore = 60
    return Math.round((grievanceScore + boothScore + mediaScore) / 3)
  }, [data])

  if (loading) return <Loading text="Loading command center..." className="min-h-[60vh]" />
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-danger mb-4">{error}</p>
      <p className="text-xs text-muted-foreground">Politician ID: {politicianId || 'none'} | User: {user?.email}</p>
    </div>
  )

  return (
    <DashboardLayout
      title="Constituency Command Center"
      subtitle="Grievances, media, events, and booth strength in one view."
      badge="Politician"
      actions={
        <>
          <Link to="/morning-brief"><Button size="sm" variant="outline"><Sparkles className="mr-2 h-4 w-4" /> Morning Brief</Button></Link>
          <Link to="/quick-capture"><Button size="sm"><Mic className="mr-2 h-4 w-4" /> Quick Capture</Button></Link>
        </>
      }
      loading={loading}
    >
      <div className="lg:col-span-3">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background text-3xl font-bold text-white shadow-xl" style={{ background: politician?.color_primary || 'hsl(var(--primary))' }}>
                  {(politician?.display_name || politician?.full_name || 'P')[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-success-foreground">Active</div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">{politician?.display_name || politician?.full_name}</h2>
                  <Badge variant="outline" style={{ borderColor: politician?.color_primary, color: politician?.color_primary }}>{politician?.party}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{politician?.designation} · {politician?.constituency_name}{politician?.state ? `, ${politician?.state}` : ''}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1"><MapPin className="h-3 w-3" /> {data.stats?.totalBooths || 0} booths</Badge>
                  <Badge variant="secondary" className="gap-1"><MessageSquareWarning className="h-3 w-3" /> {data.stats?.pendingGrievances || 0} pending</Badge>
                  <Badge variant="secondary" className="gap-1"><Newspaper className="h-3 w-3" /> {data.stats?.mediaMentions24h || 0} mentions today</Badge>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <AnimatedRing value={trustScore} label="Trust Score" color="hsl(var(--success))" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-3">
        <StatCard label="Pending Grievances" value={data.stats?.pendingGrievances || 0} icon={MessageSquareWarning} delta={data.urgentGrievances?.length || 0} deltaLabel="urgent" />
        <StatCard label="Media Mentions" value={data.stats?.mediaMentions24h || 0} icon={Newspaper} deltaLabel="24h" />
        <StatCard label="Upcoming Events" value={data.stats?.upcomingEvents || 0} icon={CalendarDays} deltaLabel="today+" />
        <StatCard label="Booth Strength" value={`${data.stats?.boothStrength || 0}%`} icon={MapPin} delta={data.stats?.weakBooths || 0} deltaLabel="weak" />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <SectionCard title="Pending Actions" description="Issues requiring your attention today" action={<Badge variant="danger">{data.urgentGrievances?.length || 0} urgent</Badge>}>
          <div className="space-y-3">
            {data.pendingActions?.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No pending actions. Great day ahead!</div>
            ) : (
              data.pendingActions.map((a: any, i: number) => (
                <div key={i} className="group flex items-center justify-between rounded-md border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${a.priority === 'urgent' ? 'bg-danger' : a.priority === 'high' ? 'bg-warning' : 'bg-muted'}`} />
                    <div>
                      <p className="text-sm font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">{a.type} · {a.due_date ? new Date(a.due_date).toLocaleDateString('en-IN') : 'No due date'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Morning Brief" description="AI-generated priorities">
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm"><Zap className="mt-0.5 h-4 w-4 text-warning" /><p>{data.urgentGrievances?.length || 0} urgent grievances need action today.</p></div>
            <div className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 text-info" /><p>{data.stats?.weakBooths || 0} booths flagged as weak coverage.</p></div>
            <div className="flex items-start gap-2 text-sm"><Megaphone className="mt-0.5 h-4 w-4 text-success" /><p>{data.stats?.mediaMentions24h || 0} media mentions in last 24h.</p></div>
          </div>
          <Link to="/morning-brief"><Button className="mt-4 w-full" size="sm"><Sparkles className="mr-2 h-4 w-4" /> Open Full Brief</Button></Link>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
