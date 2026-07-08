import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Calendar,
  MessageSquareWarning,
  Briefcase,
  CheckCircle2,
  Newspaper,
  Users,
  User,
  Star,
} from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { Loading } from '../../components/primitives/Loading'
import { StatCard } from '../../components/primitives/StatCard'
import { cn } from '../../lib/utils'

const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'works', label: 'Development Works', icon: Briefcase },
  { key: 'promises', label: 'Promises', icon: CheckCircle2 },
  { key: 'grievances', label: 'Grievances', icon: MessageSquareWarning },
  { key: 'media', label: 'Media', icon: Newspaper },
  { key: 'team', label: 'Team', icon: Users },
]

function AnimatedRing({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90">
          <circle cx="56" cy="56" r={radius} stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
          <circle cx="56" cy="56" r={radius} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold">{value}%</span></div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

function TimelineItem({ title, subtitle, date, status }: any) {
  const statusColors: Record<string, string> = {
    completed: 'bg-success', fulfilled: 'bg-success', in_progress: 'bg-warning',
    made: 'bg-info', planned: 'bg-muted', stalled: 'bg-danger', scheduled: 'bg-info',
  }
  return (
    <div className="relative pl-6 pb-6 border-l border-muted last:pb-0">
      <div className={cn('absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full', statusColors[status] || 'bg-muted')} />
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">{date}</span>
        <Badge variant="outline" className="text-[10px] capitalize">{status.replace(/_/g, ' ')}</Badge>
      </div>
    </div>
  )
}

export default function PoliticianProfile() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/api/politicians/${id}/profile`)
      .then((d) => setData(d))
      .catch((e) => console.error('[profile] error:', e))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading text="Loading politician intelligence..." className="min-h-[60vh]" />
  if (!data) return <div className="p-6 text-danger">Failed to load profile</div>

  const p = data.politician
  const stats = data.stats

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Link to="/founder/politicians"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background text-4xl font-bold text-white shadow-2xl" style={{ background: p.party_color || p.color_primary || 'hsl(var(--primary))' }}>
                {(p.display_name || p.full_name || 'P')[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-success px-3 py-1 text-[10px] font-bold text-success-foreground">Active</div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">{p.display_name || p.full_name}</h1>
                <Badge style={{ background: p.party_color, color: '#fff', borderColor: p.party_color }}>{p.party_name || p.party}</Badge>
                {p.is_active === 1 && <Badge variant="success">Active</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.designation} · {p.constituency_name}{p.state ? `, ${p.state}` : ''}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.constituency_name}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {p.phone || 'Not set'}</span>
                <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {p.email || 'Not set'}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Since {new Date(p.created_at).getFullYear()}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <AnimatedRing value={stats.publicRating ? Math.round((stats.publicRating / 5) * 100) : 0} label="Public Rating" color="hsl(var(--warning))" />
              <AnimatedRing value={stats.grievances?.resolutionRate || 0} label="Grievance Resolution" color="hsl(var(--success))" />
              <AnimatedRing value={stats.media?.sentiment || 50} label="Media Sentiment" color="hsl(var(--info))" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Grievances" value={stats.grievances?.total || 0} icon={MessageSquareWarning} delta={stats.grievances?.resolved || 0} deltaLabel="resolved" />
        <StatCard label="Works" value={stats.works?.total || 0} icon={Briefcase} delta={stats.works?.completed || 0} deltaLabel="completed" />
        <StatCard label="Promises" value={stats.promises?.total || 0} icon={CheckCircle2} delta={stats.promises?.fulfilled || 0} deltaLabel="fulfilled" />
        <StatCard label="Media" value={stats.media?.total || 0} icon={Newspaper} delta={stats.media?.sentiment || 0} deltaLabel="sentiment" />
        <StatCard label="Visits" value={stats.visits || 0} icon={MapPin} deltaLabel="30d" />
        <StatCard label="Team" value={stats.team || 0} icon={Users} deltaLabel="active" />
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="About">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.bio || `${p.display_name || p.full_name} represents ${p.constituency_name} as ${p.designation}. Member of ${p.party_name || p.party}.`}
              </p>
            </SectionCard>
            <SectionCard title="Recent Development Works">
              <div className="space-y-0">
                {data.recent?.works?.length === 0 ? <p className="text-sm text-muted-foreground">No works recorded yet.</p> : data.recent.works.map((w: any) => <TimelineItem key={w.id} title={w.title} subtitle={w.location} date={w.completed_at || new Date(w.created_at).toLocaleDateString('en-IN')} status={w.status} />)}
              </div>
            </SectionCard>
          </div>
          <div className="space-y-6">
            <SectionCard title="Constituency Snapshot">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Constituency</span><span className="font-medium">{p.constituency_name}</span></div>
                <div className="flex justify-between"><span>State</span><span className="font-medium">{p.state}</span></div>
                <div className="flex justify-between"><span>Party</span><span className="font-medium">{p.party_name || p.party}</span></div>
                <div className="flex justify-between"><span>Designation</span><span className="font-medium">{p.designation}</span></div>
                <div className="flex justify-between"><span>Plan</span><span className="font-medium uppercase">{p.subscription_plan || 'none'}</span></div>
              </div>
            </SectionCard>
            <SectionCard title="Public Rating" action={<Badge variant="warning"><Star className="mr-1 h-3 w-3" /> {stats.publicRating || '0'}/5</Badge>}>
              <p className="text-sm text-muted-foreground">Based on {stats.ratingCount || 0} public reviews.</p>
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === 'works' && (
        <SectionCard title="Development Works Timeline" description="Projects and initiatives">
          {data.recent?.works?.length === 0 ? <p className="text-sm text-muted-foreground">No development works recorded.</p> : data.recent.works.map((w: any) => <TimelineItem key={w.id} title={w.title} subtitle={w.description || w.location} date={w.completed_at || new Date(w.created_at).toLocaleDateString('en-IN')} status={w.status} />)}
        </SectionCard>
      )}

      {activeTab === 'promises' && (
        <SectionCard title="Promises Tracker" description="Electoral commitments and delivery">
          {data.recent?.promises?.length === 0 ? <p className="text-sm text-muted-foreground">No promises recorded.</p> : data.recent.promises.map((p: any) => <TimelineItem key={p.id} title={p.title} subtitle={p.category} date={p.target_date || new Date(p.promise_date).toLocaleDateString('en-IN')} status={p.status} />)}
        </SectionCard>
      )}

      {activeTab === 'grievances' && (
        <SectionCard title="Grievance Performance" description="Case resolution metrics">
          <div className="mb-4 grid grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.grievances?.total || 0}</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-success">{stats.grievances?.resolved || 0}</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-warning">{stats.grievances?.pending || 0}</p></CardContent></Card>
          </div>
          {data.recent?.grievances?.length === 0 ? <p className="text-sm text-muted-foreground">No recent grievances.</p> : data.recent.grievances.map((g: any) => <TimelineItem key={g.id} title={g.title} subtitle={g.citizen_name} date={new Date(g.created_at).toLocaleDateString('en-IN')} status={g.status} />)}
        </SectionCard>
      )}

      {activeTab === 'media' && (
        <SectionCard title="Media Mentions" description="Recent coverage and sentiment">
          {data.recent?.media?.length === 0 ? <p className="text-sm text-muted-foreground">No media mentions.</p> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.recent.media.map((m: any) => (
                <Card key={m.id}><CardContent className="p-4">
                  <p className="text-sm font-medium">{m.title || m.headline || 'Media mention'}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString('en-IN')}</span>
                    <Badge variant={m.sentiment > 0 ? 'success' : m.sentiment < 0 ? 'danger' : 'secondary'} className="text-[10px]">{m.sentiment > 0 ? 'Positive' : m.sentiment < 0 ? 'Negative' : 'Neutral'}</Badge>
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === 'team' && (
        <SectionCard title="Team Members" description="Assigned staff and workers">
          {data.team?.length === 0 ? <p className="text-sm text-muted-foreground">No team members assigned.</p> : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.team.map((t: any) => (
                <Card key={t.id}><CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{(t.display_name || t.email || 'U')[0]}</div>
                    <div>
                      <p className="font-medium">{t.display_name || t.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{t.role.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  )
}
