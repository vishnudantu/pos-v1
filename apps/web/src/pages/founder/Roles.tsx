import { useEffect, useState } from 'react'
import { Shield, CheckCircle2, XCircle, Save } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { SectionCard } from '../../components/primitives/SectionCard'
import { Badge } from '../../components/primitives/Badge'
import { Loading } from '../../components/primitives/Loading'
import { cn } from '../../lib/utils'

const ROLES = ['super_admin', 'founder', 'politician_admin', 'politician', 'staff', 'team', 'field_worker']

export default function Roles() {
  const [permissions, setPermissions] = useState<any[]>([])
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const [permData, rpData] = await Promise.all([
        api.get('/api/permissions'),
        api.get('/api/role-permissions'),
      ])
      const perms = permData.data || permData || []
      const rp = rpData.data || rpData || []
      setPermissions(perms)

      const map: Record<string, Record<string, boolean>> = {}
      ROLES.forEach((r) => (map[r] = {}))
      rp.forEach((x: any) => {
        if (!map[x.role]) map[x.role] = {}
        map[x.role][x.permission_key] = !!x.is_enabled
      })
      setRolePermissions(map)
    } catch (e) {
      console.error('[roles] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function toggle(role: string, key: string) {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role]?.[key],
      },
    }))
  }

  async function save() {
    setSaving(true)
    try {
      for (const role of ROLES) {
        for (const perm of permissions) {
          const is_enabled = !!rolePermissions[role]?.[perm.key_name]
          await api.post('/api/role-permissions/toggle', { role, permission_key: perm.key_name, is_enabled })
        }
      }
      await fetchData()
      alert('Permissions saved successfully')
    } catch (e) {
      console.error('[roles] save error:', e)
      alert('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading text="Loading roles & permissions..." className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Roles & Permissions</h1>
            <Badge variant="outline">Users & Access</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Control what each role can access and modify across the platform.</p>
        </div>
        <Button size="sm" onClick={save} loading={saving}><Save className="mr-2 h-4 w-4" /> Save Permissions</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ROLES.map((role) => (
          <SectionCard
            key={role}
            title={role.replace(/_/g, ' ').toUpperCase()}
            action={<Badge variant="secondary">{role === 'super_admin' ? 'All Access' : 'Custom'}</Badge>}
          >
            <div className="space-y-2">
              {permissions.map((perm) => {
                const granted = !!rolePermissions[role]?.[perm.key_name]
                return (
                  <button
                    key={perm.key_name}
                    onClick={() => toggle(role, perm.key_name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors hover:bg-accent',
                      granted && 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {granted ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                      <span className={`text-sm ${granted ? 'font-medium' : 'text-muted-foreground'}`}>{perm.label}</span>
                    </div>
                    <Badge variant={granted ? 'success' : 'secondary'} className="text-[10px]">{granted ? 'GRANTED' : 'DENIED'}</Badge>
                  </button>
                )
              })}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
