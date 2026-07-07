import { useMemo, useState } from 'react'
import {
  TrendingUp,
  AlertOctagon,
  MessageSquareWarning,
  Newspaper,
  Users,
  MapPin,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Flag,
  Activity,
  Bell,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '../../components/primitives/Card'
import { Button } from '../../components/primitives/Button'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { StatCard } from '../../components/primitives/StatCard'
import { Loading } from '../../components/primitives/Loading'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface PoliticianHealth {
  id: number
  name: string
  constituency: string
  party: string
  winningIndex: number
  sentiment: number
  grievanceResolution: number
  boothStrength: number
  mediaMentions: number
  redFlags: number
  trend: 'up' | 'down' | 'flat'
  status: 'strong' | 'competitive' | 'at-risk' | 'critical'
  lastAlert?: string
}

const DEMO_DATA: PoliticianHealth[] = [
  { id: 1, name: 'Nara Chandrababu Naidu', constituency: 'Kuppam', party: 'TDP', winningIndex: 78, sentiment: 72, grievanceResolution: 85, boothStrength: 82, mediaMentions: 124, redFlags: 1, trend: 'up', status: 'strong', lastAlert: 'Opposition rally planned in Kuppam next week' },
  { id: 2, name: 'Nara Lokesh', constituency: 'Mangalagiri', party: 'TDP', winningIndex: 65, sentiment: 58, grievanceResolution: 68, boothStrength: 70, mediaMentions: 89, redFlags: 3, trend: 'down', status: 'competitive', lastAlert: 'Water shortage complaints rising in 3 wards' },
  { id: 3, name: 'Kinjarapu Ram Mohan Naidu', constituency: 'Srikakulam', party: 'TDP', winningIndex: 82, sentiment: 76, grievanceResolution: 91, boothStrength: 88, mediaMentions: 102, redFlags: 0, trend: 'up', status: 'strong' },
  { id: 4, name: 'Appalanaidu Kalisetti', constituency: 'Vizianagaram', party: 'TDP', winningIndex: 48, sentiment: 45, grievanceResolution: 52, boothStrength: 55, mediaMentions: 67, redFlags: 5, trend: 'down', status: 'at-risk', lastAlert: 'Youth unemployment protests in Vizianagaram' },
  { id: 5, name: 'Dr. Chandra Sekhar Pemmasani', constituency: 'Guntur', party: 'TDP', winningIndex: 71, sentiment: 69, grievanceResolution: 74, boothStrength: 76, mediaMentions: 95, redFlags: 2, trend: 'flat', status: 'competitive' },
  { id: 6, name: 'Magunta Sreenivasulu Reddy', constituency: 'Ongole', party: 'TDP', winningIndex: 42, sentiment: 38, grievanceResolution: 41, boothStrength: 48, mediaMentions: 54, redFlags: 7, trend: 'down', status: 'critical', lastAlert: 'Caste equations shifting against party in Ongole' },
]

const SENTIMENT_DATA = [
  { day: 'Mon', positive: 65, negative: 25, neutral: 10 },
  { day: 'Tue', positive: 68, negative: 22, neutral: 10 },
  { day: 'Wed', positive: 62, negative: 28, neutral: 10 },
  { day: 'Thu', positive: 70, negative: 20, neutral: 10 },
  { day: 'Fri', positive: 74, negative: 18, neutral: 8 },
  { day: 'Sat', positive: 71, negative: 21, neutral: 8 },
  { day: 'Sun', positive: 69, negative: 23, neutral: 8 },
]

const BOOTH_DATA = [
  { name: 'Strong', value: 142 },
  { name: 'Good', value: 98 },
  { name: 'Weak', value: 64 },
  { name: 'Critical', value: 31 },
]

const RADAR_DATA = [
  { metric: 'Sentiment', A: 70, fullMark: 100 },
  { metric: 'Booth Strength', A: 75, fullMark: 100 },
  { metric: 'Grievance Resolution', A: 82, fullMark: 100 },
  { metric: 'Media Presence', A: 68, fullMark: 100 },
  { metric: 'Ground Activity', A: 60, fullMark: 100 },
  { metric: 'Opposition Weakness', A: 55, fullMark: 100 },
]

const RED_FLAGS = [
  { id: 1, politician: 'Magunta Sreenivasulu Reddy', issue: 'Caste equations shifting', severity: 'critical', type: 'Demographic' },
  { id: 2, politician: 'Appalanaidu Kalisetti', issue: 'Youth unemployment protests', severity: 'high', type: 'Grievance' },
  { id: 3, politician: 'Nara Lokesh', issue: 'Water shortage complaints', severity: 'medium', type: 'Service' },
  { id: 4, politician: 'Nara Chandrababu Naidu', issue: 'Opposition rally planned', severity: 'low', type: 'Political' },
  { id: 5, politician: 'Appalanaidu Kalisetti', issue: 'Negative media coverage spike', severity: 'high', type: 'Media' },
]

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
    strong: 'success',
    competitive: 'warning',
    'at-risk': 'danger',
    critical: 'danger',
  }
  return <Badge variant={variants[status] || 'secondary'}>{status.replace('-', ' ').toUpperCase()}</Badge>
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-success" />
  if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-danger" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, 'danger' | 'warning' | 'info' | 'secondary'> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'secondary',
  }
  return <Badge variant={variants[severity] || 'secondary'}>{severity.toUpperCase()}</Badge>
}

export default function PoliticalHealth() {
  const [filter, setFilter] = useState<'all' | 'strong' | 'competitive' | 'at-risk' | 'critical'>('all')
  const [generating, setGenerating] = useState(false)

  const filteredData = useMemo(() => {
    if (filter === 'all') return DEMO_DATA
    return DEMO_DATA.filter((p) => p.status === filter)
  }, [filter])

  const averages = useMemo(() => {
    const n = DEMO_DATA.length
    return {
      winningIndex: Math.round(DEMO_DATA.reduce((a, b) => a + b.winningIndex, 0) / n),
      sentiment: Math.round(DEMO_DATA.reduce((a, b) => a + b.sentiment, 0) / n),
      grievanceResolution: Math.round(DEMO_DATA.reduce((a, b) => a + b.grievanceResolution, 0) / n),
      boothStrength: Math.round(DEMO_DATA.reduce((a, b) => a + b.boothStrength, 0) / n),
      redFlags: DEMO_DATA.reduce((a, b) => a + b.redFlags, 0),
      critical: DEMO_DATA.filter((p) => p.status === 'critical' || p.status === 'at-risk').length,
    }
  }, [])

  function generateReport() {
    setGenerating(true)
    setTimeout(() => {
      alert('Political Health Report generated and queued for download.')
      setGenerating(false)
    }, 1500)
  }

  if (generating) return <Loading text="Generating comprehensive political health report..." />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Political Health & Intelligence</h1>
            <Badge variant="info">Super Admin</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Winning index, sentiment, red flags, and operational health across all active politicians.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button size="sm" variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          <Button size="sm" onClick={generateReport} loading={generating}><Download className="mr-2 h-4 w-4" /> Generate Report</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg Winning Index" value={averages.winningIndex} icon={TrendingUp} delta={5} deltaLabel="vs last week" />
        <StatCard label="Avg Sentiment" value={`${averages.sentiment}%`} icon={Newspaper} delta={-2} deltaLabel="vs last week" />
        <StatCard label="Avg Booth Strength" value={`${averages.boothStrength}%`} icon={MapPin} delta={3} deltaLabel="vs target" />
        <StatCard label="Red Flags" value={averages.redFlags} icon={AlertOctagon} delta={averages.critical} deltaLabel="critical" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Politician Health Matrix"
          description="Ranked by composite winning index"
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {p.name.split(' ').pop()?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{p.name}</p>
                          <StatusBadge status={p.status} />
                          <TrendIcon trend={p.trend} />
                        </div>
                        <p className="text-xs text-muted-foreground">{p.constituency} · {p.party}</p>
                        {p.lastAlert && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-warning">
                            <Bell className="h-3 w-3" />
                            {p.lastAlert}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 md:gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Win</p>
                        <p className={`font-semibold ${p.winningIndex >= 70 ? 'text-success' : p.winningIndex >= 50 ? 'text-warning' : 'text-danger'}`}>{p.winningIndex}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Sent.</p>
                        <p className="font-semibold">{p.sentiment}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Booth</p>
                        <p className="font-semibold">{p.boothStrength}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Flags</p>
                        <p className={`font-semibold ${p.redFlags > 3 ? 'text-danger' : 'text-foreground'}`}>{p.redFlags}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Red Flag Alerts" description="Issues requiring founder attention" action={<Badge variant="danger">{RED_FLAGS.length} open</Badge>}>
            <div className="space-y-2">
              {RED_FLAGS.map((r) => (
                <div key={r.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{r.politician}</p>
                    <SeverityBadge severity={r.severity} />
                  </div>
                  <p className="mt-1 text-sm font-medium">{r.issue}</p>
                  <p className="text-xs text-muted-foreground">{r.type}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Sentiment Trend (7d)">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SENTIMENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="positive" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="negative" stroke="hsl(var(--danger))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Booth Strength Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BOOTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {BOOTH_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['hsl(var(--success))', 'hsl(142 71% 55%)', 'hsl(var(--warning))', 'hsl(var(--danger))'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Composite Strength Radar">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar name="Org Average" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent Intelligence" description="Auto-generated insights">
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Activity className="mt-0.5 h-4 w-4 text-info" />
              <p>3 politicians show declining sentiment over 7 days.</p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Flag className="mt-0.5 h-4 w-4 text-warning" />
              <p>Booth strength below 60% in 95 booths across 4 constituencies.</p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MessageSquareWarning className="mt-0.5 h-4 w-4 text-danger" />
              <p>Water and unemployment grievances spiked 34% this week.</p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Newspaper className="mt-0.5 h-4 w-4 text-success" />
              <p>Positive coverage on education and health initiatives.</p>
            </div>
          </div>
          <Button className="mt-4 w-full" size="sm" variant="outline">
            <FileText className="mr-2 h-4 w-4" /> View Full Intelligence Brief
          </Button>
        </SectionCard>
      </div>
    </div>
  )
}
