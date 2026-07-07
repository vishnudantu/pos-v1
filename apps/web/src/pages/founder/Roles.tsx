import { Shield, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '../../components/primitives/Card'
import { SectionCard } from '../../components/primitives/SectionCard'
import { Badge } from '../../components/primitives/Badge'
import { Button } from '../../components/primitives/Button'

const PERMISSIONS = [
  'manage_parties', 'manage_politicians', 'manage_users', 'manage_features',
  'manage_integrations', 'view_reports', 'manage_subscriptions', 'system_admin',
  'view_dashboard', 'edit_grievances', 'view_voters', 'manage_booths',
]

const ROLES = [
  { name: 'Super Admin', grants: PERMISSIONS },
  { name: 'Founder', grants: PERMISSIONS.filter((p) => !['system_admin'].includes(p)) },
  { name: 'Politician Admin', grants: ['view_dashboard', 'edit_grievances', 'view_voters', 'manage_booths'] },
  { name: 'Politician', grants: ['view_dashboard', 'edit_grievances', 'view_voters'] },
  { name: 'Staff', grants: ['view_dashboard', 'edit_grievances'] },
  { name: 'Field Worker', grants: ['view_dashboard'] },
]

export default function Roles() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roles & Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control what each role can access and modify.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ROLES.map((role) => (
          <SectionCard key={role.name} title={role.name} action={<Button size="sm" variant="outline">Edit</Button>}>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((perm) => {
                const granted = role.grants.includes(perm)
                return (
                  <div key={perm} className="flex items-center gap-2 rounded-md border p-2">
                    {granted ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    <span className={`text-xs ${granted ? 'font-medium' : 'text-muted-foreground'}`}>{perm.replace(/_/g, ' ')}</span>
                    <Badge variant={granted ? 'success' : 'secondary'} className="ml-auto text-[10px]">{granted ? 'GRANTED' : 'DENIED'}</Badge>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
