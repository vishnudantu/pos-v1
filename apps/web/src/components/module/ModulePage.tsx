import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react'
import { Button } from '../primitives/Button'
import { Badge } from '../primitives/Badge'
import { Card, CardContent } from '../primitives/Card'
import { SectionCard } from '../primitives/SectionCard'
import { StatCard } from '../primitives/StatCard'
import { Loading } from '../primitives/Loading'
import { EmptyState } from '../primitives/EmptyState'
import { Modal } from '../primitives/Modal'
import { Input } from '../primitives/Input'
import { cn } from '../../lib/utils'

export interface ModuleField<T = any> {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select'
  editable?: boolean
  options?: { label: string; value: any }[]
  render?: (item: T) => React.ReactNode
}

export interface ModulePageProps<T = any> {
  title: string
  subtitle: string
  badge?: string
  entity: string
  fields: ModuleField<T>[]
  stats?: { label: string; value: (items: T[]) => number | string; icon: any }[]
  idKey?: string
  canCreate?: boolean
  defaultForm?: Record<string, any>
  transformCreate?: (form: Record<string, any>) => Record<string, any>
}

export default function ModulePage<T extends Record<string, any>>({
  title,
  subtitle,
  badge,
  entity,
  fields,
  stats,
  idKey = 'id',
  canCreate = true,
  defaultForm = {},
  transformCreate,
}: ModulePageProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch(`/api/${entity}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('nethra_token') || ''}` } })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setItems(data.data || data || [])
    } catch (e: any) {
      console.error(`[${entity}] fetch error:`, e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [entity])

  const filtered = useMemo(() => {
    if (!search) return items
    return items.filter((item) =>
      fields.some((f) => {
        const val = item[f.key]
        return val !== null && val !== undefined && String(val).toLowerCase().includes(search.toLowerCase())
      })
    )
  }, [items, search, fields])

  function openCreate() {
    setForm({ ...defaultForm })
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(item: T) {
    setForm({ ...item })
    setEditing(item)
    setDialogOpen(true)
  }

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('nethra_token') || ''
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      const payload = transformCreate ? transformCreate(form) : form

      if (editing) {
        await fetch(`/api/${entity}/${editing[idKey]}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
      } else {
        await fetch(`/api/${entity}`, { method: 'POST', headers, body: JSON.stringify(payload) })
      }
      setDialogOpen(false)
      await fetchItems()
    } catch (e: any) {
      console.error(`[${entity}] save error:`, e)
      alert(`Save failed: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: T) {
    if (!confirm('Are you sure?')) return
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('nethra_token') || ''
      await fetch(`/api/${entity}/${item[idKey]}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      await fetchItems()
    } catch (e: any) {
      console.error(`[${entity}] delete error:`, e)
      alert(`Delete failed: ${e.message}`)
    }
  }

  function renderFieldEditor(f: ModuleField) {
    switch (f.type) {
      case 'textarea':
        return <textarea className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
      case 'select':
        return <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)}><option value="">Select</option>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      case 'number':
        return <input type="number" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
      case 'date':
        return <input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
      default:
        return <input type={text" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
    }
  }

  if (loading) return <Loading text={`Loading ${title.toLowerCase()}...`} className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {badge && <Badge variant="outline">{badge}</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchItems}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          {canCreate && <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New</Button>}
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={i} label={s.label} value={s.value(items)} icon={s.icon} />
          ))}
        </div>
      )}

      <SectionCard title="Search & Filter">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          {search && <Button variant="ghost" size="sm" onClick={() => setSearch('')}>Clear</Button>}
        </div>
      </SectionCard>

      <SectionCard title={`${title} List`} action={<span className="text-xs text-muted-foreground">{filtered.length} records</span>}>
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No records found" description={search ? 'Try a different search' : `Create your first ${title.toLowerCase()}`} action={canCreate ? <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Create</Button> : undefined} />
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card key={item[idKey]}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {fields.map((f) => (
                        <div key={f.key}>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{f.label}</p>
                          <div className="mt-0.5">
                            {f.render ? f.render(item) : <span className="text-sm">{item[f.key] !== null && item[f.key] !== undefined ? String(item[f.key]) : '—'}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`} footer={<><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="grid gap-4">
          {fields.filter((f) => f.editable !== false).map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium">{f.label}</label>
              {renderFieldEditor(f)}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
