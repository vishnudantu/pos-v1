import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users, ArrowRightLeft, UserX, History, User } from 'lucide-react'
import { Link } from 'react-router-dom'
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

interface Party { id: number; name: string; code: string; color_primary?: string | null }
interface Politician {
  id: number
  full_name: string
  display_name?: string
  party_name?: string
  party_code?: string
  party_id?: number | null
  party_color?: string
  is_independent: number
  candidate_type?: string
  designation?: string
  constituency_name?: string
  state?: string
  email?: string
  phone?: string
  color_primary?: string
  is_active: number
  previous_party_name?: string
  party_switched_at?: string
}

export default function Politicians() {
  const [politicians, setPoliticians] = useState<Politician[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [partySwitchOpen, setPartySwitchOpen] = useState(false)
  const [editing, setEditing] = useState<Politician | null>(null)
  const [switching, setSwitching] = useState<Politician | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const [polRes, partyRes] = await Promise.all([
        apiGet('/api/politicians'),
        apiGet('/api/parties'),
      ])
      const polData = await polRes.json()
      const partyData = await partyRes.json()
      setPoliticians(polData.data || polData || [])
      setParties(partyData.data || partyData || [])
    } catch (e) {
      console.error('[politicians] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function emptyForm() {
    return {
      full_name: '',
      display_name: '',
      party_id: '',
      designation: '',
      constituency_name: '',
      state: '',
      email: '',
      phone: '',
      color_primary: '#3b82f6',
      is_independent: false,
      is_active: true,
    }
  }

  function openCreate() {
    setForm(emptyForm())
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(p: Politician) {
    setForm({ ...p, party_id: p.party_id || '' })
    setEditing(p)
    setDialogOpen(true)
  }

  function openPartySwitch(p: Politician) {
    setSwitching(p)
    setForm({ party_id: p.party_id || '', is_independent: !!p.is_independent })
    setPartySwitchOpen(true)
  }

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.full_name) return alert('Full name is required')

    const payload = { ...form }
    if (payload.is_independent) payload.party_id = null

    setSaving(true)
    try {
      if (editing) {
        await apiPut(`/api/politicians/${editing.id}`, payload)
      } else {
        await apiPost('/api/politicians', payload)
      }
      setDialogOpen(false)
      await fetchData()
    } catch (e) {
      console.error('[politicians] save error:', e)
      alert('Save failed. Check console.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePartySwitch() {
    if (!switching) return
    setSaving(true)
    try {
      await apiPut(`/api/politicians/${switching.id}/party`, {
        party_id: form.is_independent ? null : form.party_id,
        is_independent: !!form.is_independent,
      })
      setPartySwitchOpen(false)
      await fetchData()
    } catch (e) {
      console.error('[politicians] switch error:', e)
      alert('Party switch failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deactivate this politician?')) return
    try {
      await apiDelete(`/api/politicians/${id}`)
      await fetchData()
    } catch (e) {
      console.error('[politicians] delete error:', e)
      alert('Delete failed.')
    }
  }

  async function toggleActive(p: Politician) {
    try {
      await apiPut(`/api/politicians/${p.id}`, { ...p, is_active: p.is_active ? 0 : 1 })
      await fetchData()
    } catch (e) {
      console.error('[politicians] toggle error:', e)
      alert('Toggle failed.')
    }
  }

  const activeParties = useMemo(() => parties.filter((p) => p.is_active), [parties])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Politicians</h1>
            <Badge variant="outline">Tenants & Entities</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Deploy politicians, assign them to party buckets, switch parties, or mark independent.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Deploy Politician
        </Button>
      </div>

      <SectionCard
        title="Active Politicians"
        description="Politicians deployed across all parties"
        action={politicians.length > 0 ? <span className="text-xs text-muted-foreground">{politicians.length} records</span> : null}
      >
        {loading ? (
          <Loading text="Loading politicians..." />
        ) : politicians.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No politicians yet"
            description="Deploy your first politician and assign them to a party."
            action={<Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Deploy Politician</Button>}
          />
        ) : (
          <div className="space-y-3">
            {politicians.map((p) => (
              <Card key={p.id} className={cn(!p.is_active && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ background: p.party_color || p.color_primary || (p.party_id ? '#3b82f6' : '#64748b') }}
                      >
                        {p.is_independent ? 'I' : (p.party_code || 'P')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{p.display_name || p.full_name}</p>
                          {p.is_independent ? (
                            <Badge variant="secondary"><UserX className="mr-1 h-3 w-3" /> Independent</Badge>
                          ) : (
                            <Badge variant="outline">{p.party_name || 'No party'}</Badge>
                          )}
                          <Badge variant={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.designation}{p.designation && p.constituency_name ? ' · ' : ''}{p.constituency_name}{p.state ? `, ${p.state}` : ''}
                        </p>
                        {p.previous_party_name && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <History className="h-3 w-3" />
                            Switched from {p.previous_party_name} {p.party_switched_at ? `on ${new Date(p.party_switched_at).toLocaleDateString('en-IN')}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openPartySwitch(p)}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Switch Party
                      </Button>
                      <Link to={`/politician/${p.id}`}><Button variant="ghost" size="sm" className="h-8"><User className="mr-1 h-4 w-4" /> Profile</Button></Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(p)}>
                        {p.is_active ? 'Pause' : 'Activate'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? 'Edit Politician' : 'Deploy Politician'} description="Fill in politician details and assign to a party." footer={<><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="grid gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Full Name <span className="text-danger">*</span></label><Input value={form.full_name || ''} onChange={(e) => update('full_name', e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Display Name</label><Input value={form.display_name || ''} onChange={(e) => update('display_name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Party</label><Select value={form.party_id || ''} onChange={(e) => update('party_id', e.target.value)} options={activeParties.map((p) => ({ label: p.name, value: String(p.id) }))} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Designation</label><Input value={form.designation || ''} onChange={(e) => update('designation', e.target.value)} placeholder="MLA / MP" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Constituency</label><Input value={form.constituency_name || ''} onChange={(e) => update('constituency_name', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">State</label><Input value={form.state || ''} onChange={(e) => update('state', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><Input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><Input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex gap-2">
              <Input type="color" value={form.color_primary || '#3b82f6'} onChange={(e) => update('color_primary', e.target.value)} className="w-14 px-1" />
              <Input value={form.color_primary || ''} onChange={(e) => update('color_primary', e.target.value)} className="flex-1" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_independent} onChange={(e) => update('is_independent', e.target.checked)} className="h-4 w-4 rounded border-input" /> Mark as Independent</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 rounded border-input" /> Active</label>
        </div>
      </Modal>

      <Modal open={partySwitchOpen} onOpenChange={setPartySwitchOpen} title={switching ? `Switch Party: ${switching.display_name || switching.full_name}` : 'Switch Party'} description="Move to another party or make independent." footer={<><Button variant="outline" onClick={() => setPartySwitchOpen(false)}>Cancel</Button><Button onClick={handlePartySwitch} loading={saving}>Confirm Switch</Button></>}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_independent} onChange={(e) => update('is_independent', e.target.checked)} className="h-4 w-4 rounded border-input" /> Independent Candidate</label>
          {!form.is_independent && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">New Party</label>
              <Select value={form.party_id || ''} onChange={(e) => update('party_id', e.target.value)} options={activeParties.map((p) => ({ label: p.name, value: String(p.id) }))} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
