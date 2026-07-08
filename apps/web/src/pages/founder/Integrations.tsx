import { useEffect, useMemo, useState } from 'react'
import { Key, Plus, Pencil, Trash2, Plug, Building2 } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Loading } from '../../components/primitives/Loading'
import { Modal } from '../../components/primitives/Modal'
import { Input } from '../../components/primitives/Input'
import { Select } from '../../components/primitives/Select'

export default function Integrations() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [integrationTypes, setIntegrationTypes] = useState<any[]>([])
  const [parties, setParties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const [iList, tList, pList] = await Promise.all([
        api.list('integrations'),
        api.list('integration-types'),
        api.list('parties'),
      ])
      setIntegrations(Array.isArray(iList) ? iList : [])
      setIntegrationTypes(Array.isArray(tList) ? tList : [])
      setParties(Array.isArray(pList) ? pList : [])
    } catch (e: any) {
      console.error('[integrations] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function emptyForm() {
    return { party_id: '', integration_type: '', provider_name: '', api_key_reference: '', status: 'pending', is_active: true }
  }

  function openCreate() {
    setForm(emptyForm())
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(i: any) {
    setForm({ ...i })
    setEditing(i)
    setDialogOpen(true)
  }

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.party_id || !form.integration_type) return alert('Party and integration type are required')
    setSaving(true)
    try {
      const payload = { ...form, is_active: form.is_active ? 1 : 0 }
      if (editing) {
        await api.update('integrations', editing.id, payload)
      } else {
        await api.create('integrations', payload)
      }
      setDialogOpen(false)
      await fetchData()
    } catch (e: any) {
      console.error('[integrations] save error:', e)
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deactivate this integration?')) return
    try {
      await api.remove('integrations', id)
      await fetchData()
    } catch (e: any) {
      alert('Delete failed: ' + e.message)
    }
  }

  async function testConnection(i: any) {
    try {
      const res = await api.post(`/api/integrations/${i.id}/test`, {})
      await fetchData()
      alert(res.status === 'connected' ? 'Connection successful' : 'Connection failed')
    } catch (e: any) {
      alert('Test failed: ' + e.message)
    }
  }

  const typeOptions = useMemo(() => integrationTypes.map((t) => ({ label: `${t.label} (${t.category})`, value: t.key_name })), [integrationTypes])
  const partyOptions = useMemo(() => parties.map((p) => ({ label: p.name, value: String(p.id) })), [parties])

  if (loading) return <Loading text="Loading integrations..." className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="text-sm text-muted-foreground">Connect AI, SMS, payments, WhatsApp, and other services per party.</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Integration</Button>
      </div>

      <SectionCard title="Connected Services" action={<span className="text-xs text-muted-foreground">{integrations.length} records</span>}>
        {integrations.length === 0 ? (
          <EmptyState icon={Key} title="No integrations" description="Add your first integration to enable platform services." action={<Button size="sm" onClick={openCreate}>Add Integration</Button>} />
        ) : (
          <div className="space-y-3">
            {integrations.map((i) => (
              <Card key={i.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{i.provider_name || i.integration_type}</p>
                        <Badge variant={i.status === 'connected' ? 'success' : i.status === 'pending' ? 'warning' : 'secondary'}>{i.status}</Badge>
                        <Badge variant={i.is_active ? 'success' : 'secondary'}>{i.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{i.integration_type} · Party ID {i.party_id}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => testConnection(i)}><Plug className="mr-2 h-4 w-4" /> Test</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? 'Edit Integration' : 'Add Integration'} footer={<><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="grid gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Party <span className="text-danger">*</span></label><Select value={form.party_id || ''} onChange={(e) => update('party_id', e.target.value)} options={partyOptions} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Integration Type <span className="text-danger">*</span></label><Select value={form.integration_type || ''} onChange={(e) => update('integration_type', e.target.value)} options={typeOptions} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Provider Name</label><Input value={form.provider_name || ''} onChange={(e) => update('provider_name', e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">API Key / Reference</label><Input type="password" value={form.api_key_reference || ''} onChange={(e) => update('api_key_reference', e.target.value)} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Status</label><Select value={form.status || ''} onChange={(e) => update('status', e.target.value)} options={[{ label: 'Connected', value: 'connected' }, { label: 'Pending', value: 'pending' }, { label: 'Failed', value: 'failed' }, { label: 'Disabled', value: 'disabled' }]} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4" /> Active</label>
        </div>
      </Modal>
    </div>
  )
}
