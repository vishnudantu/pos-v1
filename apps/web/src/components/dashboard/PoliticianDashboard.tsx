import { useEffect, useState, useMemo } from 'react'
import {
  MessageSquareWarning,
  Newspaper,
  CalendarDays,
  MapPin,
  Mic,
  Sparkles,
  Zap,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Users,
  Camera,
  Megaphone,
  Target,
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
import { cn } from '../../lib/utils'

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) { setCount(end); return }
    const timer = setInterval(() => {
      start += end > 100 ? Math.ceil(end / 40) : 1
      if (start >= end) { start = end; clearInterval(timer) }
      setCount(start)
    }, 25)
    return () => clearInterval(timer)
  }, [value])
  return <>{count}</>
}

function TrustRing({ value, color }: { value: number; color: string }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="48" cy="48" r={radius} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" opacity="0.3" />
        <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="text-center">
        <span className="text-2xl font-bold">{value}%</span>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trust</p>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, to, color }: { icon: any; label: string; to: string; color: string }) {
  return (
    <Link to={to}>
      <button className={cn('flex w-full flex-col items-center gap-2 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-card', color)}>
        <Icon className="h-6 w-6" />
        <span className="text-xs font-semibold">{label}</span>
      </button>
    </Link>
  )
}

export function PoliticianDashboard() {
  const { user, politician, activePolitician, allPoliticians } = useAuth() as any
  const effectivePolitician = politician || activePolitician || allPoliticians?.[0]
  const politicianId = effectivePolitician?.id
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!politicianId) { setLoading(false); setError('No politician assigned'); return }
    let cancelled = false
    api.get(`/api/dashboard/politician/${politicianId}`)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [politicianId])

  const trustScore = useMemo(() => {
    if (!data) return 0
    const grievanceScore = data.stats?.pendingGrievances === 0 ? 100 : 80
    const boothScore = data.stats?.boothStrength || 0
    return Math.round((grievanceScore + boothScore + 70) / 3)
  }, [data])

  if (loading) return <Loading text="Loading command center..." className="min-h-[60vh]" />
  if (error) return <div className="p-6 text-center text-danger">{error}</div>

  const primaryColor = effectivePolitician?.color_primary || '#F5D50A'

  return (
    <DashboardLayout
      title="Constituency Command Center"
      subtitle="Real-time ground intelligence and action dashboard"
      badge="Politician"
      actions={
        <>
          <Link to="/quick-capture">
            <Button size="sm" className="gap-2" style={{ background: primaryColor, color: '#000' }}>
              <Mic className="h-4 w-4" /> Quick Capture
            </Button>
          </Link>
          <Link to="/morning-brief">
            <Button size="sm" variant="outline" className="gap-2"><Sparkles className="h-4 w-4" /> Morning Brief</Button>
          </Link>
        </>
      }
      loading={loading}
    >
      {/* Hero Card */}
      <div className="lg:col-span-3">
        <Card className="overflow-hidden border-none bg-white shadow-md dark:bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full opacity-40 blur-md" style={{ background: primaryColor }} />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white text-3xl font-bold shadow-xl" style={{ background: primaryColor, color: '#000' }}>
                    {(effectivePolitician?.display_name || effectivePolitician?.full_name || 'P')[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-success px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                    ACTIVE
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">{effectivePolitician?.display_name || effectivePolitician?.full_name}</h2>
                    <Badge className="font-semibold" style={{ background: `${primaryColor}20`, color: '#000', borderColor: `${primaryColor}40` }}>
                      {effectivePolitician?.party}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {effectivePolitician?.designation} · {effectivePolitician?.constituency_name}{effectivePolitician?.state ? `, ${effectivePolitician?.state}` : ''}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1.5"><MapPin className="h-3 w-3" /> {data.stats?.totalBooths || 0} booths</Badge>
                    <Badge variant="secondary" className="gap-1.5"><MessageSquareWarning className="h-3 w-3" /> {data.stats?.pendingGrievances || 0} pending</Badge>
                    <Badge variant="secondary" className="gap-1.5"><Newspaper className="h-3 w-3" /> {data.stats?.mediaMentions24h || 0} today</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <TrustRing value={trustScore} color={primaryColor} />
                <div className="hidden md:block text-center">
                  <p className="text-4xl font-bold text-foreground"><AnimatedCounter value={data.stats?.pendingGrievances || 0} /></p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open Actions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:col-span-3">
        <StatCard label="Pending Grievances" value={<AnimatedCounter value={data.stats?.pendingGrievances || 0} />} icon={MessageSquareWarning} trend={data.urgentGrievances?.length || 0} trendLabel="urgent" trendType="down" color="#ef4444" />
        <StatCard label="Media Mentions" value={<AnimatedCounter value={data.stats?.mediaMentions24h || 0} />} icon={Newspaper} trend="24h" trendType="neutral" color="#3b82f6" />
        <StatCard label="Upcoming Events" value={<AnimatedCounter value={data.stats?.upcomingEvents || 0} />} icon={CalendarDays} trend="today+" trendType="neutral" color="#8b5cf6" />
        <StatCard label="Booth Strength" value={`${data.stats?.boothStrength || 0}%`} icon={MapPin} trend={data.stats?.weakBooths || 0} trendLabel="weak" trendType="up" color="#22c55e" />
      </div>

      {/* Main */}
      <div className="lg:col-span-2 space-y-6">
        <SectionCard
          title="Pending Actions"
          description="Ground issues needing attention"
          action={<Badge variant="danger" className="animate-pulse font-semibold">{data.urgentGrievances?.length || 0} urgent</Badge>}
        >
          {data.pendingActions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-7 w-7 text-success" />
              </div>
              <p className="font-semibold">All caught up!</p>
              <p className="text-xs text-muted-foreground">No pending actions right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingActions.map((a: any, i: number) => (
                <div key={i} className="group flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-card">
                  <div className="flex items-start gap-4">
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', a.type === 'grievance' ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info')}>
                      {a.type === 'grievance' ? <MessageSquareWarning className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{a.label}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={a.priority === 'urgent' ? 'danger' : a.priority === 'high' ? 'warning' : 'secondary'} className="text-[10px] capitalize">{a.priority}</Badge>
                        <span className="text-xs text-muted-foreground capitalize">{a.type} · {a.due_date ? new Date(a.due_date).toLocaleDateString('en-IN') : 'No due date'}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Quick Launch" description="One-tap ground modules">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickAction icon={MessageSquareWarning} label="Grievances" to="/grievances" color="hover:border-danger/30" />
            <QuickAction icon={CalendarDays} label="Events" to="/events" color="hover:border-info/30" />
            <QuickAction icon={Users} label="Voters" to="/voters" color="hover:border-warning/30" />
            <QuickAction icon={MapPin} label="Booths" to="/booths" color="hover:border-success/30" />
          </div>
        </SectionCard>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <SectionCard title="Morning Brief" description="AI priorities for today" className="bg-gradient-to-br from-warning/5 to-transparent">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-warning/10 p-3">
              <Zap className="mt-0.5 h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-semibold">Urgent grievances</p>
                <p className="text-xs text-muted-foreground">{data.urgentGrievances?.length || 0} need action today</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-info/10 p-3">
              <MapPin className="mt-0.5 h-5 w-5 text-info" />
              <div>
                <p className="text-sm font-semibold">Weak booths</p>
                <p className="text-xs text-muted-foreground">{data.stats?.weakBooths || 0} flagged for visit</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-success/10 p-3">
              <Megaphone className="mt-0.5 h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-semibold">Media mentions</p>
                <p className="text-xs text-muted-foreground">{data.stats?.mediaMentions24h || 0} in last 24h</p>
              </div>
            </div>
          </div>
          <Link to="/morning-brief"><Button className="mt-4 w-full" size="sm"><Sparkles className="mr-2 h-4 w-4" /> Open Full Brief</Button></Link>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
