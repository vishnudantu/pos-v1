import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api'
import { Button } from '../primitives/Button'
import { Card, CardContent } from '../primitives/Card'
import { Badge } from '../primitives/Badge'
import { SectionCard } from '../primitives/SectionCard'
import { EmptyState } from '../primitives/EmptyState'
import { Loading } from '../primitives/Loading'
import { Modal } from '../primitives/Modal'
import { Input } from '../primitives/Input'
import { Textarea } from '../primitives/Textarea'
import { Select } from '../primitives/Select'

export interface CrudField {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'color' | 'checkbox' | 'date' | 'password'
  required?: boolean
  options?: { label: string; value: any }[]
  numeric?: boolean
  placeholder?: string
}

export interface CrudPageProps {
  title: string
  subtitle: string
  endpoint: string
  fields: CrudField[]
  idKey?: string
  badge?: string
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  extraRowActions?: (item: any, refresh: () => void) => React.ReactNode
}

export default function CrudPage({
  title,
  subtitle,
  endpoint,
  fields,
  idKey = 'id',
  badge,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  extraRowActions,
}: CrudPageProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<any>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  const displayFields = useMemo(() => fields.filter((f) => f.type !== 'password'), [fields])

  function emptyForm() {
    const obj: Record<string, any> = {}
    fields.forEach((f) => {
      if (f.type === 'checkbox') obj[f.key] = true
      else if (f.type === 'number') obj[f.key] = ''
      else if (f.type === 'color') obj[f.key] = '#3b82f6'
      else obj[f.key] = ''
    })
    return obj
  }

  async function fetchItems() {
    setLoading(true)
    try {
      const r = await apiGet(endpoint)
      const data = await r.json()
      setItems(data.data || data || [])
    } catch (e) {
      console.error('[crud] fetch error:', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [endpoint])

  function openCreate() {
    setForm(emptyForm())
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(item: any) {
    setForm({ ...item })
    setEditing(item)
    setDialogOpen(true)
  }

  function confirmDelete(item: any) {
    setDeletingId(item[idKey])
    setDeleteOpen(true)
  }

  async function handleSave() {
    for (const f of fields) {
      if (f.required && (form[f.key] === '' || form[f.key] === null || form[f.key] === undefined)) {
        alert(`${f.label} is required`)
        return
      }
    }

    const payload: Record<string, any> = {}
    fields.forEach((f) => {
      let v = form[f.key]
      if (f.type === 'checkbox') v = v ? 1 : 0
      else if (f.type === 'number') v = v === '' || v === undefined || v === null ? 0 : Number(v)
      else if (f.numeric && v !== '' && v !== null && v !== undefined) v = Number(v)
      payload[f.key] = v
    })

    setSaving(true)
    try {
      if (editing) {
        await apiPut(`${endpoint}/${editing[idKey]}`, payload)
      } else {
        await apiPost(endpoint, payload)
      }
      setDialogOpen(false)
      await fetchItems()
    } catch (e) {
      console.error('[crud] save error:', e)
      alert('Save failed. Check console.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await apiDelete(`${endpoint}/${deletingId}`)
      setDeleteOpen(false)
      await fetchItems()
    } catch (e) {
      console.error('[crud] delete error:', e)
      alert('Delete failed.')
    }
  }

  function renderValue(f: CrudField, value: any) {
    if (value === null || value === undefined || value === '') {
      return <span className="text-xs text-muted-foreground">—</span>
    }
    if (f.type === 'color') {
      return (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border" style={{ background: value }} />
          <span className="text-xs">{value}</span>
        </div>
      )
    }
    if (f.key === 'is_active') {
      return <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Active' : 'Inactive'}</Badge>
    }
    if (f.key === 'subscription_status' || f.key === 'status') {
      const variantMap: Record<string, any> = {
        active: 'success',
        connected: 'success',
        paused: 'warning',
        pending: 'warning',
        expired: 'secondary',
        disabled: 'secondary',
        cancelled: 'danger',
        failed: 'danger',
      }
      return <Badge variant={variantMap[String(value).toLowerCase()] || 'secondary'}>{String(value)}</Badge>
    }
    return <span className="text-sm">{String(value)}</span>
  }

  function renderInput(f: CrudField) {
    const value = form[f.key]
    const update = (v: any) => setForm((prev) => ({ ...prev, [f.key]: v }))

    switch (f.type) {
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => update(e.target.value)}
            placeholder={f.placeholder}
            required={f.required}
          />
        )
      case 'select':
        return (
          <Select
            value={value || ''}
            onChange={(e) => update(e.target.value)}
            options={f.options || []}
            required={f.required}
          />
        )
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => update(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-muted-foreground">{f.label}</span>
          </label>
        )
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={value || '#3b82f6'}
              onChange={(e) => update(e.target.value)}
              className="h-10 w-14 px-1"
            />
            <Input value={value || ''} onChange={(e) => update(e.target.value)} className="flex-1" />
          </div>
        )
      case 'password':
        return <Input type="password" value={value || ''} onChange={(e) => update(e.target.value)} placeholder={f.placeholder} />
      default:
        return (
          <Input
            type={f.type || 'text'}
            value={value || ''}
            onChange={(e) => update(e.target.value)}
            placeholder={f.placeholder}
            required={f.required}
          />
        )
    }
  }

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
        {canCreate && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Deploy New
          </Button>
        )}
      </div>

      <SectionCard
        title={`${title} List`}
        description={`Manage ${title.toLowerCase()} records`}
        action={items.length > 0 ? <span className="text-xs text-muted-foreground">{items.length} records</span> : null}
      >
        {loading ? (
          <Loading text={`Loading ${title.toLowerCase()}...`} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Pencil}
            title={`No ${title.toLowerCase()} yet`}
            description={`Click Deploy New to add the first ${title.toLowerCase()}.`}
            action={canCreate ? <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Deploy New</Button> : undefined}
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item[idKey]}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="grid flex-1 grid-cols-2 gap-y-3 gap-x-4 sm:grid-cols-3 lg:grid-cols-4">
                      {displayFields.map((f) => (
                        <div key={f.key}>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{f.label}</p>
                          <div className="mt-0.5">{renderValue(f, item[f.key])}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => confirmDelete(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {extraRowActions?.(item, fetchItems)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Edit ${title.slice(0, -1)}` : `Deploy New ${title.slice(0, -1)}`}
        description="Fill in the details below."
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="grid gap-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              {f.type !== 'checkbox' && <label className="text-sm font-medium">{f.label}{f.required && <span className="text-danger">*</span>}</label>}
              {renderInput(f)}
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Confirm Delete"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Are you sure you want to delete this record?</p>
      </Modal>
    </div>
  )
}
