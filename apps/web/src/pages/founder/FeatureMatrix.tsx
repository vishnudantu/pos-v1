import { useEffect, useMemo, useState } from 'react'
import { ToggleRight, Building2, UserCheck, Shield, Globe } from 'lucide-react'
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
  feature_key: string
  feature_name?: string
  module_name?: string
  description?: string
  is_active: number
}

const ROLES = ['super_admin', 'founder', 'politician_admin', 'politician', 'staff', 'team', 'field_worker']

export default function FeatureMatrix() {
  const [globalFeatures, setGlobalFeatures] = useState<Feature[]>([])
  const [parties, setParties] = useState<any[]>([])
  const [politicians, setPoliticians] = useState<any[]>([])
  const [access, setAccess] = useState<any[]>([])
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
    setParties(p.data || p || [])
    setPoliticians(pol.data || pol || [])
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
    const records = scope === 'party' ? (data.party_access || [])
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
    } catch (e) {
      console.error('[features] toggle error:', e)
      alert('Toggle failed')
    } finally {
      setSavingKey(null)
    }
  }

  function isEnabled(key: string): boolean {
    if (scope === 'global') {
      const f = globalFeatures.find((x) => x.feature_key === key)
      return f ? !!f.is_active : false
    }
    const a = access.find((x) => x.feature_key === key)
    if (a) return !!a.is_enabled
    const f = globalFeatures.find((x) => x.feature_key === key)
    return f ? !!f.is_active : false
  }

  const scopeOptions = useMemo(() => {
    switch (scope) {
      case 'party': return parties.map((p) => ({ label: p.name, value: String(p.id) }))
      case 'politician': return politicians.map((p) => ({ label: p.display_name || p.full_name, value: String(p.id) }))
      case 'role': return ROLES.map((r) => ({ label: r.replace(/_/g, ' ').toUpperCase(), value: r }))
      default: return []
    }
  }, [scope, parties, politicians])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feature Matrix</h1>
        <p className="text-sm text-muted-foreground">Enable or disable features globally, per party, per politician, or per role.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
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
              <div className="min-w-[220px]">
                <Select value={scopeId} onChange={(e) => setScopeId(e.target.value)} options={scopeOptions} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SectionCard title={`${scope.charAt(0).toUpperCase() + scope.slice(1)} Features`}>
        {loading ? <Loading text="Loading features..." /> : globalFeatures.length === 0 ? (
          <EmptyState icon={ToggleRight} title="No features found" description="Feature modules will appear once configured." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {globalFeatures.map((f) => {
              const enabled = isEnabled(f.feature_key)
              return (
                <Card key={f.id} className={enabled ? 'border-primary/30' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{f.feature_name || f.module_name || f.feature_key}</p>
                        <p className="text-xs text-muted-foreground">{f.description || 'No description'}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={enabled ? 'primary' : 'outline'}
                        onClick={() => toggle(f.feature_key)}
                        loading={savingKey === f.feature_key}
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
        )}
      </SectionCard>
    </div>
  )
}
