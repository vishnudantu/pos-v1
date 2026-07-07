import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Loading } from '../../components/primitives/Loading'
import { Modal } from '../../components/primitives/Modal'
import { Input } from '../../components/primitives/Input'
import { Textarea } from '../../components/primitives/Textarea'
import { Select } from '../../components/primitives/Select'

export default function Parties() {
  const [parties, setParties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchParties() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.list('parties')
      setParties(Array.isArray(data) ? data : [])
    } catch (e: any) {
      console.error('[parties] fetch error:', e)
      setError(e.message || 'Failed to load parties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParties()
  }, [])

  function emptyForm() {
    return { name: '', code: '', color_primary: '#3b82f6', color_secondary: '#1e40af', subscription_plan: 'trial', subscription_status: 'active', description: '', is_active: true }
  }

  function openCreate() {
    setForm(emptyForm())
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(p: any) {
    setForm({ ...p })
    setEditing(p)
    setDialogOpen(true)
  }

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name || !form.code) return alert('Name and code required')
    setSaving(true)
    try {
      const payload = { ...form, is_active: form.is_active ? 1 : 0 }
      if (editing) {
        await api.update('parties', editing.id, payload)
      } else {
        await api.create('parties', payload)
      }
      setDialogOpen(false)
      await fetchParties()
    } catch (e: any) {
      console.error('[parties] save error:', e)
      alert('Save failed: ' + (e.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deactivate this party?')) return
    try {
      await api.remove('parties', id)
      await fetchParties()
    } catch (e: any) {
      alert('Delete failed: ' + e.message)
    }
  }

  if (loading) return <Loading text="Loading parties..." className="min-h-[60vh]" />
  if (error) return <div className="p-6 text-danger">Error: {error}</div>

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parties</h1>
          <p className="text-sm text-muted-foreground">Deploy political parties and manage tenant status.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Deploy Party</Button>
      </div>

      <SectionCard title="Active Parties" action={<span className="text-xs text-muted-foreground">{parties.length} records</span>}>
        {parties.length === 0 ? (
          <EmptyState icon={Building2} title="No parties" description="Create the first party to get started." action={<Button size="sm" onClick={openCreate}>Deploy Party</Button>} />
        ) : (
          <div className="space-y-3">
            {parties.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md font-bold text-white" style={{ background: p.color_primary || '#3b82f6' }}>
                        {(p.code || 'P').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{p.name}</p>
                          <Badge variant="outline">{p.subscription_plan?.toUpperCase()}</Badge>
                          <Badge variant={p.subscription_status === 'active' ? 'success' : 'warning'}>{p.subscription_status}</Badge>
                          <Badge variant={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? 'Edit Party' : 'Deploy Party'} footer={<><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="grid gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Party Name <span className="text-danger">*</span></label><Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Short Code <span className="text-danger">*</span></label><Input value={form.code || ''} onChange={(e) => update('code', e.target.value.toUpperCase())} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Primary Color</label><Input type="color" value={form.color_primary || '#3b82f6'} onChange={(e) => update('color_primary', e.target.value)} className="h-10 px-1" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Secondary Color</label><Input type="color" value={form.color_secondary || '#1e40af'} onChange={(e) => update('color_secondary', e.target.value)} className="h-10 px-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Plan</label><Select value={form.subscription_plan || ''} onChange={(e) => update('subscription_plan', e.target.value)} options={[{ label: 'Trial', value: 'trial' }, { label: 'Standard', value: 'standard' }, { label: 'Premium', value: 'premium' }, { label: 'Enterprise', value: 'enterprise' }]} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Status</label><Select value={form.subscription_status || ''} onChange={(e) => update('subscription_status', e.target.value)} options={[{ label: 'Active', value: 'active' }, { label: 'Paused', value: 'paused' }, { label: 'Expired', value: 'expired' }, { label: 'Cancelled', value: 'cancelled' }]} /></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Description</label><Textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4" /> Active</label>
        </div>
      </Modal>
    </div>
  )
}
