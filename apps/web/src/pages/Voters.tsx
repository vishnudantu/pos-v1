import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  Upload,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Heart,
  ThumbsUp,
  HelpCircle,
  ThumbsDown,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button } from '../components/primitives/Button'
import { Card, CardContent } from '../components/primitives/Card'
import { Badge } from '../components/primitives/Badge'
import { SectionCard } from '../components/primitives/SectionCard'
import { StatCard } from '../components/primitives/StatCard'
import { Loading } from '../components/primitives/Loading'
import { Modal } from '../components/primitives/Modal'
import { Input } from '../components/primitives/Input'
import { Select } from '../components/primitives/Select'

interface Voter {
  id: number
  voter_id: string
  full_name: string
  phone?: string
  age?: number
  gender?: string
  mandal?: string
  village?: string
  booth?: string
  caste_category?: string
  party_affiliation?: string
  support_level?: 'strong' | 'leaning' | 'undecided' | 'opposition'
  notes?: string
  photo_url?: string
  is_active?: number
}

const SUPPORT_OPTIONS = [
  { label: 'Strong Supporter', value: 'strong', color: 'success' },
  { label: 'Leaning Towards', value: 'leaning', color: 'info' },
  { label: 'Undecided', value: 'undecided', color: 'warning' },
  { label: 'Opposition', value: 'opposition', color: 'danger' },
]

const PARTY_OPTIONS = ['TDP', 'YSRCP', 'JSP', 'BJP', 'INC', 'Others', 'Undecided']

function SupportBadge({ level }: { level?: string }) {
  const map: Record<string, { icon: any; variant: any; label: string }> = {
    strong: { icon: Heart, variant: 'success', label: 'Strong' },
    leaning: { icon: ThumbsUp, variant: 'info', label: 'Leaning' },
    undecided: { icon: HelpCircle, variant: 'warning', label: 'Undecided' },
    opposition: { icon: ThumbsDown, variant: 'danger', label: 'Opposition' },
  }
  const config = map[level || 'undecided'] || map.undecided
  const Icon = config.icon
  return <Badge variant={config.variant} className="gap-1"><Icon className="h-3 w-3" /> {config.label}</Badge>
}

export default function Voters() {
  const { politician } = useAuth() as any
  const [voters, setVoters] = useState<Voter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSupport, setFilterSupport] = useState('all')
  const [filterBooth, setFilterBooth] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({
    voter_id: '', full_name: '', phone: '', age: '', gender: '', mandal: '', village: '', booth: '', caste_category: '', party_affiliation: 'Undecided', support_level: 'undecided', notes: '',
  })
  const [saving, setSaving] = useState(false)

  async function fetchVoters() {
    setLoading(true)
    try {
      const data = await api.list('voters')
      setVoters(Array.isArray(data) ? data : (data.data || []))
    } catch (e) {
      console.error('[voters] fetch error:', e)
      setVoters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVoters()
  }, [])

  const filtered = useMemo(() => {
    return voters.filter((v) => {
      const matchesSearch = !search || [v.full_name, v.voter_id, v.phone, v.village, v.mandal].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
      const matchesSupport = filterSupport === 'all' || v.support_level === filterSupport
      const matchesBooth = filterBooth === 'all' || v.booth === filterBooth
      return matchesSearch && matchesSupport && matchesBooth
    })
  }, [voters, search, filterSupport, filterBooth])

  const stats = useMemo(() => ({
    total: voters.length,
    strong: voters.filter((v) => v.support_level === 'strong').length,
    undecided: voters.filter((v) => v.support_level === 'undecided').length,
    opposition: voters.filter((v) => v.support_level === 'opposition').length,
  }), [voters])

  const boothOptions = useMemo(() => {
    const booths = [...new Set(voters.map((v) => v.booth).filter(Boolean))]
    return booths.map((b) => ({ label: `Booth ${b}`, value: String(b) }))
  }, [voters])

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.full_name) return alert('Name is required')
    setSaving(true)
    try {
      await api.create('voters', {
        ...form,
        politician_id: politician?.id,
        age: form.age ? Number(form.age) : null,
        is_active: 1,
      })
      setCreateOpen(false)
      setForm({ voter_id: '', full_name: '', phone: '', age: '', gender: '', mandal: '', village: '', booth: '', caste_category: '', party_affiliation: 'Undecided', support_level: 'undecided', notes: '' })
      await fetchVoters()
    } catch (e: any) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this voter?')) return
    try {
      await api.remove('voters', id)
      await fetchVoters()
    } catch (e: any) {
      alert('Delete failed: ' + e.message)
    }
  }

  function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      const rows = text.split('\\n').filter((r) => r.trim()).slice(1)
      let added = 0
      for (const row of rows) {
        const cols = row.split(',').map((c) => c.trim())
        if (cols.length < 2) continue
        try {
          await api.create('voters', {
            voter_id: cols[0],
            full_name: cols[1],
            phone: cols[2] || '',
            village: cols[3] || '',
            mandal: cols[4] || '',
            booth: cols[5] || '',
            support_level: cols[6] || 'undecided',
            politician_id: politician?.id,
          })
          added++
        } catch (e) {
          console.error('Import row failed:', e)
        }
      }
      alert(`Imported ${added} voters`)
      setImportOpen(false)
      await fetchVoters()
    }
    reader.readAsText(file)
  }

  if (loading) return <Loading text="Loading voter intelligence..." className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voter Intelligence</h1>
          <p className="text-sm text-muted-foreground">Booth-level voter database and support tracking</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>
          <Button size="sm" variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Voter</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Records" value={stats.total} icon={Users} color="#3b82f6" />
        <StatCard label="Strong Supporters" value={stats.strong} icon={Heart} trendType="up" color="#22c55e" />
        <StatCard label="Undecided" value={stats.undecided} icon={HelpCircle} color="#f59e0b" />
        <StatCard label="Opposition" value={stats.opposition} icon={ThumbsDown} trendType="down" color="#ef4444" />
      </div>

      <SectionCard title="Filters" description="Search and segment voters">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, voter ID, village..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterSupport} onChange={(e) => setFilterSupport(e.target.value)} options={[{ label: 'All Support Levels', value: 'all' }, ...SUPPORT_OPTIONS.map((s) => ({ label: s.label, value: s.value }))]} />
          <Select value={filterBooth} onChange={(e) => setFilterBooth(e.target.value)} options={[{ label: 'All Booths', value: 'all' }, ...boothOptions]} />
          <Button variant="outline" size="sm" onClick={() => { setSearch(''); setFilterSupport('all'); setFilterBooth('all') }}><Filter className="mr-2 h-4 w-4" /> Reset</Button>
        </div>
      </SectionCard>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">No voters found</p>
            <p className="text-sm text-muted-foreground">Import CSV or add voters to build your database.</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>
              <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Voter</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <Card key={v.id} className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                      {(v.full_name || 'V')[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{v.full_name}</p>
                      <p className="text-xs text-muted-foreground">Voter ID: {v.voter_id}</p>
                    </div>
                  </div>
                  <SupportBadge level={v.support_level} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {v.village || '—'}, {v.mandal || '—'}</div>
                  <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {v.phone || '—'}</div>
                  <div>Booth: {v.booth || '—'}</div>
                  <div>{v.gender || '—'} · {v.age || '—'}</div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{v.party_affiliation || 'Undecided'}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onOpenChange={setCreateOpen} title="Add Voter" description="Quick voter registration" footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Voter ID</label>
              <Input value={form.voter_id} onChange={(e) => update('voter_id', e.target.value)} placeholder="ABC1234567" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Full Name <span className="text-danger">*</span></label>
              <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Phone</label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Age / Gender</label><div className="flex gap-2"><Input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="Age" className="w-20" /><Select value={form.gender} onChange={(e) => update('gender', e.target.value)} options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }]} className="flex-1" /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Mandal</label><Input value={form.mandal} onChange={(e) => update('mandal', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Village</label><Input value={form.village} onChange={(e) => update('village', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Booth</label><Input value={form.booth} onChange={(e) => update('booth', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Caste/Category</label><Input value={form.caste_category} onChange={(e) => update('caste_category', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Party Affiliation</label><Select value={form.party_affiliation} onChange={(e) => update('party_affiliation', e.target.value)} options={PARTY_OPTIONS.map((p) => ({ label: p, value: p }))} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold uppercase text-muted-foreground">Support Level</label><Select value={form.support_level} onChange={(e) => update('support_level', e.target.value)} options={SUPPORT_OPTIONS.map((s) => ({ label: s.label, value: s.value }))} /></div>
          </div>
        </div>
      </Modal>

      <Modal open={importOpen} onOpenChange={setImportOpen} title="Import Voters CSV" description="CSV format: voter_id, full_name, phone, village, mandal, booth, support_level">
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Upload CSV file</p>
            <p className="text-xs text-muted-foreground">voter_id, full_name, phone, village, mandal, booth, support_level</p>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="mt-4 block w-full text-xs file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
