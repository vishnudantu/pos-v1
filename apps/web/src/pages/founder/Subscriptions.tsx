import { useEffect, useState } from 'react'
import { CreditCard, Plus, Pencil, ArrowUpRight } from 'lucide-react'
import { apiGet, apiPost, apiPut } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Loading } from '../../components/primitives/Loading'
import { Modal } from '../../components/primitives/Modal'
import { Input } from '../../components/primitives/Input'
import { Select } from '../../components/primitives/Select'

export default function Subscriptions() {
  const [parties, setParties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiGet('/api/parties').then((r) => r.json()).then((d) => setParties(d.data || d || [])).finally(() => setLoading(false))
  }, [])

  function openEdit(p: any) {
    setEditing(p)
    setForm({
      subscription_plan: p.subscription_plan,
      subscription_status: p.subscription_status,
      subscription_expires: p.subscription_expires ? p.subscription_expires.slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      await apiPut(`/api/parties/${editing.id}`, { ...editing, ...form })
      setDialogOpen(false)
      const r = await apiGet('/api/parties')
      const d = await r.json()
      setParties(d.data || d || [])
    } catch (e) {
      console.error('[subscriptions] save error:', e)
      alert('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions & Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage party plans, status, and renewal dates.</p>
        </div>
        <Button size="sm" variant="outline"><CreditCard className="mr-2 h-4 w-4" /> Billing Portal</Button>
      </div>

      <SectionCard title="Party Subscriptions" action={parties.length > 0 ? <span className="text-xs text-muted-foreground">{parties.length} parties</span> : null}>
        {loading ? <Loading text="Loading subscriptions..." /> : parties.length === 0 ? (
          <EmptyState icon={CreditCard} title="No parties" description="Create parties first to manage subscriptions." />
        ) : (
          <div className="space-y-3">
            {parties.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{p.name}</p>
                        <Badge variant="outline">{p.subscription_plan?.toUpperCase()}</Badge>
                        <Badge variant={p.subscription_status === 'active' ? 'success' : p.subscription_status === 'paused' ? 'warning' : 'secondary'}>{p.subscription_status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Expires: {p.subscription_expires || 'Not set'}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="mr-2 h-4 w-4" /> Edit Plan</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal open={dialogOpen} onOpenChange={setDialogOpen} title="Edit Subscription" footer={<><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="grid gap-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Plan</label><Select value={form.subscription_plan || ''} onChange={(e) => update('subscription_plan', e.target.value)} options={[{ label: 'Trial', value: 'trial' }, { label: 'Standard', value: 'standard' }, { label: 'Premium', value: 'premium' }, { label: 'Enterprise', value: 'enterprise' }]} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Status</label><Select value={form.subscription_status || ''} onChange={(e) => update('subscription_status', e.target.value)} options={[{ label: 'Active', value: 'active' }, { label: 'Paused', value: 'paused' }, { label: 'Expired', value: 'expired' }, { label: 'Cancelled', value: 'cancelled' }]} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Expiry Date</label><Input type="date" value={form.subscription_expires || ''} onChange={(e) => update('subscription_expires', e.target.value)} /></div>
        </div>
      </Modal>
    </div>
  )
}
