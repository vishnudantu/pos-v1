import { useEffect, useMemo, useState } from 'react'
import { ToggleRight, Building2, UserCheck, Shield, Globe, CheckCircle2, XCircle, Info } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { Badge } from '../../components/primitives/Badge'
import { SectionCard } from '../../components/primitives/SectionCard'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Loading } from '../../components/primitives/Loading'
import { Select } from '../../components/primitives/Select'

interface Feature {
  id: number
  module_key: string
  label: string
  category: string
  description?: string
  is_active: number
}

interface AccessRecord {
  feature_key: string
  is_enabled: number
}

const ROLES = ['super_admin', 'founder', 'politician_admin', 'politician', 'staff', 'team', 'field_worker']

function scopeName(scope: string, id: string, parties: any[], politicians: any[]) {
  if (scope === 'global') return 'Global default'
  if (scope === 'party') {
    const p = parties.find((x) => String(x.id) === id)
    return p?.name || 'Unknown party'
  }
  if (scope === 'politician') {
    const p = politicians.find((x) => String(x.id) === id)
    return p?.display_name || p?.full_name || 'Unknown politician'
  }
  return id.replace(/_/g, ' ').toUpperCase()
}

export default function FeatureMatrix() {
  const [globalFeatures, setGlobalFeatures] = useState<Feature[]>([])
  const [parties, setParties] = useState<any[]>([])
  const [politicians, setPoliticians] = useState<any[]>([])
  const [access, setAccess] = useState<AccessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const [scope, setScope] = useState<'global' | 'party' | 'politician' | 'role'>('global')
  const [scopeId, setScopeId] = useState<string>('')

  useEffect(() => {
    setScopeId('')
  }, [scope])

  async function fetchBase() {
    const [f, p, pol] = await Promise.all([
      api.get('/api/features/matrix'),
      api.list('parties'),
      api.list('politicians'),
    ])
    setGlobalFeatures(f.global || [])
    setParties(p || [])
    setPoliticians(pol || [])
  }

  async function fetchAccess() {
    if (scope === 'global') {
      setAccess([])
      return
    }
    const params: Record<string, string> = {}
    if (scope === 'party') params.party_id = scopeId
    if (scope === 'politician') params.politician_id = scopeId
    if (scope === 'role') params.role = scopeId

    const qs = new URLSearchParams(params).toString()
    const data = await api.get(`/api/features/matrix${qs ? '?' + qs : ''}`)
    const records =
      scope === 'party' ? (data.party_access || [])
      : scope === 'politician' ? (data.politician_access || [])
      : (data.role_access || [])
    setAccess(records || [])
  }

  useEffect(() => {
    setLoading(true)
    fetchBase().then(fetchAccess).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAccess()
  }, [scope, scopeId])

  async function toggle(feature_key: string) {
    setSavingKey(feature_key)
    try {
      const current = isEnabled(feature_key)
      await api.post('/api/features/toggle', {
        scope,
        scope_id: scope === 'global' ? null : scopeId,
        feature_key,
        is_enabled: !current,
      })
      await fetchBase()
      await fetchAccess()
    } catch (e: any) {
      console.error('[features] toggle error:', e)
      alert('Toggle failed: ' + e.message)
    } finally {
      setSavingKey(null)
    }
  }

  function isEnabled(key: string): boolean {
    if (scope === 'global') {
      const f = globalFeatures.find((x) => x.module_key === key)
      return f ? !!f.is_active : false
    }
    const a = access.find((x) => x.feature_key === key)
    if (a) return !!a.is_enabled
    const f = globalFeatures.find((x) => x.module_key === key)
    return f ? !!f.is_active : false
  }

  function isExplicit(key: string): boolean {
    if (scope === 'global') return true
    return access.some((x) => x.feature_key === key)
  }

  const scopeOptions = useMemo(() => {
    switch (scope) {
      case 'party': return parties.map((p) => ({ label: p.name, value: String(p.id) }))
      case 'politician': return politicians.map((p) => ({ label: p.display_name || p.full_name, value: String(p.id) }))
      case 'role': return ROLES.map((r) => ({ label: r.replace(/_/g, ' ').toUpperCase(), value: r }))
      default: return []
    }
  }, [scope, parties, politicians])

  const grouped = useMemo(() => {
    const map: Record<string, Feature[]> = {}
    globalFeatures.forEach((f) => {
      if (!map[f.category]) map[f.category] = []
      map[f.category].push(f)
    })
    return map
  }, [globalFeatures])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Feature Matrix</h1>
          <p className="text-sm text-muted-foreground">Enable or disable features globally, per party, per politician, or per role.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-md border p-1">
              {[
                { key: 'global', label: 'Global', icon: Globe },
                { key: 'party', label: 'Party', icon: Building2 },
                { key: 'politician', label: 'Politician', icon: UserCheck },
                { key: 'role', label: 'Role', icon: Shield },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.key}
                    onClick={() => setScope(s.key as any)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${scope === s.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                  >
                    <Icon className="h-4 w-4" /> {s.label}
                  </button>
                )
              })}
            </div>

            {scope !== 'global' && (
              <div className="min-w-[260px]">
                <Select value={scopeId} onChange={(e) => setScopeId(e.target.value)} options={scopeOptions} />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              {scope === 'global' ? 'Controls platform default' : `Overrides global for ${scopeName(scope, scopeId, parties, politicians)}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {scope !== 'global' && !scopeId ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Select a {scope} above to manage its feature overrides.
          </CardContent>
        </Card>
      ) : loading ? (
        <Loading text="Loading features..." />
      ) : globalFeatures.length === 0 ? (
        <EmptyState icon={ToggleRight} title="No features found" description="Feature modules will appear once configured." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <SectionCard key={category} title={category} description={`${items.length} feature${items.length === 1 ? '' : 's'}`}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f) => {
                  const enabled = isEnabled(f.module_key)
                  const explicit = isExplicit(f.module_key)
                  return (
                    <Card key={f.id} className={enabled ? 'border-primary/30' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{f.label}</p>
                              {explicit && scope !== 'global' && (
                                <Badge variant="outline" className="text-[10px]">Override</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{f.description || 'No description'}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={enabled ? 'primary' : 'outline'}
                            onClick={() => toggle(f.module_key)}
                            loading={savingKey === f.module_key}
                            disabled={scope !== 'global' && !scopeId}
                          >
                            {enabled ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}
