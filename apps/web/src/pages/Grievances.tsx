import { useMemo, useState } from 'react'
import {
  MessageSquareWarning,
  Filter,
  LayoutGrid,
  List,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  Trash2,
} from 'lucide-react'
import { useGrievances, Grievance } from '../features/grievances/useGrievances'
import { Button } from '../components/primitives/Button'
import { Badge } from '../components/primitives/Badge'
import { Card, CardContent } from '../components/primitives/Card'
import { SectionCard } from '../components/primitives/SectionCard'
import { StatCard } from '../components/primitives/StatCard'
import { Loading } from '../components/primitives/Loading'
import { EmptyState } from '../components/primitives/EmptyState'
import { Modal } from '../components/primitives/Modal'
import { Input } from '../components/primitives/Input'
import { Select } from '../components/primitives/Select'
import { Textarea } from '../components/primitives/Textarea'
import { api } from '../lib/api'
import { cn } from '../lib/utils'

const STATUSES = ['new', 'in_progress', 'escalated', 'resolved', 'rejected'] as const
const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
const CATEGORIES = ['Water', 'Roads', 'Electricity', 'Pensions', 'Health', 'Education', 'Sanitation', 'Housing', 'Employment', 'Other']

function statusVariant(status: string): any {
  switch (status) {
    case 'new': return 'info'
    case 'in_progress': return 'warning'
    case 'escalated': return 'danger'
    case 'resolved': return 'success'
    case 'rejected': return 'secondary'
    default: return 'secondary'
  }
}

function priorityVariant(priority: string): any {
  switch (priority) {
    case 'urgent': return 'danger'
    case 'high': return 'warning'
    case 'medium': return 'info'
    case 'low': return 'secondary'
    default: return 'secondary'
  }
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function isOverdue(g: Grievance) {
  if (!g.due_date) return false
  if (g.status === 'resolved' || g.status === 'rejected') return false
  return new Date(g.due_date) < new Date()
}

function KanbanColumn({ title, status, items, onStatus, onPriority, onDelete }: any) {
  return (
    <div className="flex min-w-[260px] flex-1 flex-col rounded-lg border bg-card/50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(status)}>{title}</Badge>
          <span className="text-xs text-muted-foreground">{items.length}</span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {items.map((g: Grievance) => (
          <GrievanceCard
            key={g.id}
            g={g}
            compact
            onStatus={onStatus}
            onPriority={onPriority}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

function GrievanceCard({ g, compact, onStatus, onPriority, onDelete }: { g: Grievance; compact?: boolean; onStatus: (id: number, s: Grievance['status']) => void; onPriority: (id: number, p: Grievance['priority']) => void; onDelete: (id: number) => void }) {
  return (
    <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', isOverdue(g) && 'border-danger/50')}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={priorityVariant(g.priority)} className="text-[10px]">{g.priority.toUpperCase()}</Badge>
              {isOverdue(g) && <Badge variant="danger" className="text-[10px]"><Clock className="mr-1 h-3 w-3" /> OVERDUE</Badge>}
              <Badge variant="outline" className="text-[10px]">{g.category || 'General'}</Badge>
            </div>
            <h4 className={cn('mt-2 font-medium', compact ? 'text-sm' : 'text-base')}>{g.title}</h4>
            {!compact && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {g.citizen_name && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {g.citizen_name}</span>}
              {g.citizen_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {g.citizen_phone}</span>}
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(g.created_at)}</span>
              {g.due_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {formatDate(g.due_date)}</span>}
            </div>
          </div>
        </div>

        <div className={cn('mt-4 flex flex-wrap items-center gap-2', compact && 'mt-3')}>
          <Select
            value={g.status}
            onChange={(e) => onStatus(g.id, e.target.value as Grievance['status'])}
            options={STATUSES.map((s) => ({ label: s.replace(/_/g, ' ').toUpperCase(), value: s }))}
            className="h-8 w-[140px] text-xs"
          />
          <Select
            value={g.priority}
            onChange={(e) => onPriority(g.id, e.target.value as Grievance['priority'])}
            options={PRIORITIES.map((p) => ({ label: p.toUpperCase(), value: p }))}
            className="h-8 w-[110px] text-xs"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => onDelete(g.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Grievances() {
  const { grievances, loading, refresh, updateStatus, updatePriority, deleteGrievance } = useGrievances()
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({
    title: '',
    description: '',
    citizen_name: '',
    citizen_phone: '',
    category: '',
    priority: 'medium',
    status: 'new',
    due_date: '',
  })
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    return grievances.filter((g) => {
      const statusMatch = filterStatus === 'all' || g.status === filterStatus
      const priorityMatch = filterPriority === 'all' || g.priority === filterPriority
      const searchMatch = !search || [g.title, g.description, g.citizen_name, g.category].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
      return statusMatch && priorityMatch && searchMatch
    })
  }, [grievances, filterStatus, filterPriority, search])

  const stats = useMemo(() => ({
    total: grievances.length,
    pending: grievances.filter((g) => g.status !== 'resolved' && g.status !== 'rejected').length,
    overdue: grievances.filter((g) => isOverdue(g)).length,
    urgent: grievances.filter((g) => g.priority === 'urgent').length,
  }), [grievances])

  async function handleCreate() {
    if (!form.title) return alert('Title is required')
    setSaving(true)
    try {
      await api.create('grievances', {
        ...form,
        category: form.category || 'Other',
        priority: form.priority || 'medium',
        status: 'new',
      })
      setCreateOpen(false)
      setForm({ title: '', description: '', citizen_name: '', citizen_phone: '', category: '', priority: 'medium', status: 'new', due_date: '' })
      await refresh()
    } catch (e) {
      console.error('[grievances] create error:', e)
      alert('Failed to create grievance.')
    } finally {
      setSaving(false)
    }
  }

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) return <Loading text="Loading grievance command center..." className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Grievance Command Center</h1>
            <Badge variant="outline">Operations</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Track, prioritize, and resolve citizen grievances.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={view === 'kanban' ? 'primary' : 'outline'} onClick={() => setView('kanban')}><LayoutGrid className="mr-2 h-4 w-4" /> Kanban</Button>
          <Button size="sm" variant={view === 'list' ? 'primary' : 'outline'} onClick={() => setView('list')}><List className="mr-2 h-4 w-4" /> List</Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}><MessageSquareWarning className="mr-2 h-4 w-4" /> New Grievance</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={MessageSquareWarning} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} delta={stats.pending} deltaLabel="open" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} className={stats.overdue > 0 ? 'border-danger/30' : ''} />
        <StatCard label="Urgent" value={stats.urgent} icon={AlertTriangle} className={stats.urgent > 0 ? 'border-danger/30' : ''} />
      </div>

      <SectionCard
        title="Filters"
        description="Filter by status, priority, or keyword"
        action={
          <button onClick={() => { setFilterStatus('all'); setFilterPriority('all'); setSearch('') }} className="text-xs text-muted-foreground hover:text-foreground">
            Reset
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[{ label: 'All Statuses', value: 'all' }, ...STATUSES.map((s) => ({ label: s.replace(/_/g, ' ').toUpperCase(), value: s }))]}
          />
          <Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            options={[{ label: 'All Priorities', value: 'all' }, ...PRIORITIES.map((p) => ({ label: p.toUpperCase(), value: p }))]}
          />
        </div>
      </SectionCard>

      {view === 'kanban' ? (
        <div className="flex flex-col gap-4 overflow-x-auto pb-2 md:flex-row">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              title={status.replace(/_/g, ' ').toUpperCase()}
              status={status}
              items={filtered.filter((g) => g.status === status)}
              onStatus={updateStatus}
              onPriority={updatePriority}
              onDelete={deleteGrievance}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState icon={MessageSquareWarning} title="No grievances match" description="Try adjusting filters or create a new grievance." />
          ) : (
            filtered.map((g) => (
              <GrievanceCard key={g.id} g={g} onStatus={updateStatus} onPriority={updatePriority} onDelete={deleteGrievance} />
            ))
          )}
        </div>
      )}

      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Grievance"
        description="Log a citizen grievance."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title <span className="text-danger">*</span></label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Citizen Name</label><Input value={form.citizen_name} onChange={(e) => update('citizen_name', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><Input value={form.citizen_phone} onChange={(e) => update('citizen_phone', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onChange={(e) => update('category', e.target.value)} options={CATEGORIES.map((c) => ({ label: c, value: c }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <Select value={form.priority} onChange={(e) => update('priority', e.target.value)} options={PRIORITIES.map((p) => ({ label: p.toUpperCase(), value: p }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Due Date</label>
            <Input type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
