import { useEffect, useState } from 'react'
import {
  Mic,
  Camera,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  Phone,
  Send,
  ChevronRight,
  Trophy,
  CloudOff,
  RefreshCw,
  User,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { Button } from '../primitives/Button'
import { Card, CardContent } from '../primitives/Card'
import { Badge } from '../primitives/Badge'
import { StatCard } from '../primitives/StatCard'
import { Loading } from '../primitives/Loading'
import { DashboardLayout } from './DashboardLayout'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

function BigActionButton({ icon: Icon, label, color, to }: { icon: any; label: string; color: string; to: string }) {
  return (
    <Link to={to}>
      <button className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-5 shadow-sm transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md dark:bg-card',
        color
      )}>
        <Icon className="h-8 w-8" />
        <span className="text-sm font-semibold">{label}</span>
      </button>
    </Link>
  )
}

function TaskCard({ task, onComplete }: { task: any; onComplete: (id: number) => void }) {
  const typeColors: Record<string, string> = {
    voter_contact: 'bg-info/10 text-info border-info/20',
    grievance_capture: 'bg-danger/10 text-danger border-danger/20',
    event_attendance: 'bg-success/10 text-success border-success/20',
    photo_upload: 'bg-warning/10 text-warning border-warning/20',
    survey: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    booth_strength: 'bg-primary/10 text-primary border-primary/20',
    other: 'bg-muted text-muted-foreground',
  }
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm dark:bg-card">
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border', typeColors[task.task_type] || typeColors.other)}>
        {task.task_type === 'voter_contact' && <Phone className="h-6 w-6" />}
        {task.task_type === 'grievance_capture' && <Mic className="h-6 w-6" />}
        {task.task_type === 'event_attendance' && <Calendar className="h-6 w-6" />}
        {task.task_type === 'photo_upload' && <Camera className="h-6 w-6" />}
        {task.task_type === 'survey' && <User className="h-6 w-6" />}
        {task.task_type === 'booth_strength' && <Users className="h-6 w-6" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{task.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary'} className="text-[10px] capitalize">{task.priority}</Badge>
          {task.booth && <Badge variant="outline" className="text-[10px]">Booth {task.booth}</Badge>}
          {task.village && <span className="text-[10px] text-muted-foreground">{task.village}</span>}
        </div>
      </div>
      {task.status === 'pending' ? (
        <Button size="sm" onClick={() => onComplete(task.id)}><CheckCircle2 className="h-4 w-4" /></Button>
      ) : (
        <Badge variant="success" className="text-[10px]">Done</Badge>
      )}
    </div>
  )
}

export function KaryakartaDashboard() {
  const { user, activePolitician } = useAuth() as any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/karyakarta')
      .then((d) => setData(d))
      .catch((e) => console.error('[karyakarta] error:', e))
      .finally(() => setLoading(false))
  }, [])

  async function completeTask(id: number) {
    try {
      await api.post(`/api/karyakarta/tasks/${id}/complete`, {})
      setData((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) => t.id === id ? { ...t, status: 'completed' } : t),
        stats: { ...prev.stats, pendingTasks: Math.max(0, prev.stats.pendingTasks - 1), completedToday: prev.stats.completedToday + 1 },
      }))
    } catch (e: any) {
      alert('Failed: ' + e.message)
    }
  }

  if (loading) return <Loading text="Loading booth command..." className="min-h-[60vh]" />
  if (!data) return <div className="p-6 text-center text-danger">Failed to load</div>

  const politicianColor = activePolitician?.color_primary || '#F5D50A'

  return (
    <DashboardLayout
      title="Booth Command"
      subtitle="Ground operations, voter contact, and issue capture"
      badge="Karyakarta"
      actions={<Link to="/quick-capture"><Button size="sm" className="gap-2" style={{ background: politicianColor, color: '#000' }}><Mic className="h-4 w-4" /> Quick Capture</Button></Link>}
      loading={loading}
    >
      {/* My Booth Hero */}
      <div className="lg:col-span-3">
        <Card className="overflow-hidden border-none bg-white shadow-md dark:bg-card">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">My Booth</h2>
                  <Badge variant="outline" style={{ borderColor: politicianColor, color: '#000' }}>{activePolitician?.party}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.booth?.booth_name || `Booth ${data.booth?.booth || '15'}`} · {data.booth?.village || activePolitician?.constituency_name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1 text-xs"><MapPin className="h-3 w-3" /> {data.booth?.mandal || activePolitician?.constituency_name}</Badge>
                  <Badge variant="secondary" className="gap-1 text-xs"><User className="h-3 w-3" /> {user?.display_name || user?.email}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{data.stats.contactsToday}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{data.stats.totalContacts}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-3">
        <BigActionButton icon={Mic} label="Speak Issue" color="hover:border-danger/30" to="/quick-capture" />
        <BigActionButton icon={Camera} label="Snap Photo" color="hover:border-warning/30" to="/quick-capture" />
        <BigActionButton icon={Users} label="Mark Voter" color="hover:border-info/30" to="/voters" />
        <BigActionButton icon={Phone} label="Call Voter" color="hover:border-success/30" to="/voters" />
        <BigActionButton icon={Calendar} label="Event Check-in" color="hover:border-purple-500/30" to="/events" />
        <BigActionButton icon={Trophy} label="Leaderboard" color="hover:border-primary/30" to="#" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:col-span-3">
        <StatCard label="Pending Tasks" value={data.stats.pendingTasks} icon={CheckCircle2} color="#ef4444" />
        <StatCard label="Completed Today" value={data.stats.completedToday} icon={CheckCircle2} trendType="up" color="#22c55e" />
      </div>

      {/* Today's Tasks */}
      <div className="lg:col-span-2">
        <Card className="bg-white dark:bg-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Today's Tasks</h3>
              {data.stats.pendingSync > 0 && <Badge variant="warning" className="gap-1"><CloudOff className="h-3 w-3" /> {data.stats.pendingSync} offline</Badge>}
            </div>
            {data.tasks?.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <p className="font-semibold">No tasks assigned</p>
                <p className="text-xs text-muted-foreground">Check back later or start a quick capture.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.tasks.map((task: any) => <TaskCard key={task.id} task={task} onComplete={completeTask} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Offline / Sync */}
      <div className="space-y-4">
        <Card className="bg-white dark:bg-card">
          <CardContent className="p-5">
            <h3 className="mb-3 text-base font-semibold">Offline Queue</h3>
            {data.stats.pendingSync === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm text-success">
                <RefreshCw className="h-4 w-4" /> All synced
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-warning/10 p-3 text-sm text-warning">
                <CloudOff className="h-4 w-4" /> {data.stats.pendingSync} captures pending
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Captures saved when no signal will sync automatically.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
