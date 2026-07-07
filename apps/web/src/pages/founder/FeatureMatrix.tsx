import { useEffect, useMemo, useState } from 'react'
import { ToggleRight, Building2, UserCheck, Users, Shield } from 'lucide-react'
import { apiGet, apiPost } from '../../lib/api'
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
  module_name?: string
  feature_name?: string
  description?: string
  is_active: number
}

interface AccessRecord {
  feature_key: string
  is_enabled: number
}

const ROLES = ['super_admin', 'founder', 'politician_admin', 'politician', 'staff', 'team', 'field_worker']

export default function FeatureMatrix() {
  const [globalFeatures, setGlobalFeatures] = useState<Feature[]>([])
  const [parties, setParties] = useState<any[]>([])
  const [politicians, setPoliticians] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const [scope, setScope] = useState<'global' | 'party' | 'politician' | 'role'>('global')
  const [scopeId, setScopeId] = useState<string>('')

  useEffect(() => {
    setScopeId('')
  }, [scope])

  async function fetchData() {
    setLoading(true)
    try {
      const [fRes, pRes, polRes] = await Promise.all([
        apiGet('/api/features/matrix'),
        apiGet('/api/parties'),
        apiGet('/api/politicians'),
      ])
      const fData = await fRes.json()
      const pData = await pRes.json()
      const polData = await polRes.json()

      setGlobalFeatures(fData.global || [])
      setParties(pData.data || pData || [])
      setPoliticians(polData.data || polData || [])
    } catch (e) {
      console.error('[features] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function toggleFeature(feature_key: string, current: boolean) {
    setSavingKey(feature_key)
    try {
      await apiPost('/api/features/toggle', {
        scope,
        scope_id: scope === 'global' ? null : scopeId,
        feature_key,
        is_enabled: !current,
      })
      await fetchData()
    } catch (e) {
      console.error('[features] toggle error:', e)
      alert('Toggle failed.')
    } finally {
      setSavingKey(null)
    }
  }

  function isEnabled(featureKey: string): boolean {
    // Simplified: for now we only show global toggle state
    // Per-scope state would require scope-specific queries; backend supports it.
    const f = globalFeatures.find((x) => x.feature_key === featureKey)
    return f ? !!f.is_active : false
  }

  const scopeOptions = useMemo(() => {
    switch (scope) {
      case 'party':
        return parties.map((p) => ({ label: p.name, value: String(p.id) }))
      case 'politician':
        return politicians.map((p) => ({ label: p.display_name || p.full_name, value: String(p.id) }))
      case 'role':
        return ROLES.map((r) => ({ label: r.replace(/_/g, ' ').toUpperCase(), value: r }))
      default:
        return []
    }
  }, [scope, parties, politicians])

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Feature Matrix</h1>
            <Badge variant="outline">Platform Control</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Enable or disable features globally, per party, per politician, or per role.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border p-1">
              {[
                { key: 'global', label: 'Global', icon: ToggleRight },
                { key: 'party', label: 'Party', icon: Building2 },
                { key: 'politician', label: 'Politician', icon: UserCheck },
                { key: 'role', label: 'Role', icon: Shield },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.key}
                    onClick={() => setScope(s.key as any)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      scope === s.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {s.label}
                  </button>
                )
              })}
            </div>

            {scope !== 'global' && (
              <div className="min-w-[220px]">
                <Select
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  options={scopeOptions}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SectionCard
        title={`${scope.replace(/^\w/, (c) => c.toUpperCase())} Features`}
        description={scope === 'global' ? 'Control platform-wide feature availability' : `Control features for selected ${scope}`}
      >
        {loading ? (
          <Loading text="Loading features..." />
        ) : globalFeatures.length === 0 ? (
          <EmptyState icon={ToggleRight} title="No features found" description="Feature modules will appear once configured." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {globalFeatures.map((f) => {
              const enabled = isEnabled(f.feature_key)
              return (
                <Card key={f.id} className={enabled ? 'border-primary/30' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{f.feature_name || f.module_name || f.feature_key}</p>
                        <p className="text-xs text-muted-foreground">{f.description || 'No description'}</p>
                      </div>
                      <div className="text-right">
                        <Button
                          size="sm"
                          variant={enabled ? 'primary' : 'outline'}
                          onClick={() => toggleFeature(f.feature_key, enabled)}
                          loading={savingKey === f.feature_key}
                          disabled={scope !== 'global' && !scopeId}
                        >
                          {enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
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
