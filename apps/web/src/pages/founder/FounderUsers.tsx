import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Shield, UserCog } from 'lucide-react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Loading } from '../../components/primitives/Loading'
import { Modal } from '../../components/primitives/Modal'
import { Input } from '../../components/primitives/Input'
import { Select } from '../../components/primitives/Select'
import { cn } from '../../lib/utils'

const ROLES = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Founder', value: 'founder' },
  { label: 'Politician Admin', value: 'politician_admin' },
  { label: 'Politician', value: 'politician' },
  { label: 'Staff', value: 'staff' },
  { label: 'Team', value: 'team' },
  { label: 'Field Worker', value: 'field_worker' },
]

interface User {
  id: number
  email: string
  display_name?: string
  role: string
  politician_id?: number
  is_active: number
  last_login_at?: string
}

export default function FounderUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [politicians, setPoliticians] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const [uRes, pRes] = await Promise.all([apiGet('/api/founder/users'), apiGet('/api/politicians')])
      const uData = await uRes.json()
      const pData = await pRes.json()
      setUsers(uData.data || uData || [])
      setPoliticians(pData.data || pData || [])
    } catch (e) {
      console.error('[users] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function emptyForm() {
    return { email: '', display_name: '', role: 'staff', politician_id: '', is_active: true }
  }

  function openCreate() {
    setForm(emptyForm())
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(u: User) {
    setForm({ ...u, politician_id: u.politician_id || '' })
    setEditing(u)
    setDialogOpen(true)
  }

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.email || !form.role) return alert('Email and role are required')
    setSaving(true)
    try {
      if (editing) {
        await apiPut(`/api/founder/users/${editing.id}`, form)
      } else {
        await apiPost('/api/founder/users', { ...form, password: 'TempPass123!' })
      }
      setDialogOpen(false)
      await fetchData()
    } catch (e) {
      console.error('[users] save error:', e)
      alert('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(u: User) {
    try {
      await apiPut(`/api/founder/users/${u.id}`, { ...u, is_active: u.is_active ? 0 : 1 })
      await fetchData()
    } catch (e) {
      console.error('[users] toggle error:', e)
      alert('Toggle failed.')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deactivate this user?')) return
    try {
      await apiDelete(`/api/founder/users/${id}`)
      await fetchData()
    } catch (e) {
      console.error('[users] delete error:', e)
      alert('Delete failed.')
    }
  }

  const roleColor: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'danger'> = {
    super_admin: 'danger',
    founder: 'warning',
    politician_admin: 'info',
    politician: 'success',
    staff: 'secondary',
    team: 'secondary',
    field_worker: 'secondary',
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">All Users</h1>
            <Badge variant="outline">Users & Access</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Manage staff, workers, politicians, and administrators.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add User</Button>
      </div>

      <SectionCard title="User Directory" action={users.length > 0 ? <span className="text-xs text-muted-foreground">{users.length} users</span> : null}>
        {loading ? (
          <Loading text="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users" description="Add users to manage access." action={<Button size="sm" onClick={openCreate}>Add User</Button>} />
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <Card key={u.id} className={cn(!u.is_active && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {(u.display_name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{u.display_name || u.email}</p>
                          <Badge variant={roleColor[u.role] || 'secondary'}>{u.role.replace(/_/g, ' ').toUpperCase()}</Badge>
                          <Badge variant={u.is_active ? 'success' : 'secondary'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{u.email}{u.politician_id ? ` · Politician ID: ${u.politician_id}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(u)}>{u.is_active ? 'Pause' : 'Activate'}</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? 'Edit User' : 'Add User'} description="Configure user access." footer={<><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="grid gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Email <span className="text-danger">*</span></label><Input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Display Name</label><Input value={form.display_name || ''} onChange={(e) => update('display_name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Role <span className="text-danger">*</span></label><Select value={form.role || ''} onChange={(e) => update('role', e.target.value)} options={ROLES} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Assigned Politician</label><Select value={form.politician_id || ''} onChange={(e) => update('politician_id', e.target.value)} options={politicians.map((p) => ({ label: p.display_name || p.full_name, value: String(p.id) }))} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4" /> Active</label>
        </div>
      </Modal>
    </div>
  )
}
