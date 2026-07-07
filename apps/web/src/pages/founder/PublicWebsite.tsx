import { useEffect, useState } from 'react'
import { Globe, ExternalLink, Save, RefreshCw } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { SectionCard } from '../../components/primitives/SectionCard'
import { Badge } from '../../components/primitives/Badge'
import { Loading } from '../../components/primitives/Loading'
import { cn } from '../../lib/utils'

const MODULES = [
  { key: 'portal_enabled', label: 'Public Portal Enabled', description: 'Master switch for the citizen-facing website' },
  { key: 'grievance_tracker', label: 'Grievance Status Tracker', description: 'Citizens can check grievance status publicly' },
  { key: 'appointment_booking', label: 'Appointment Booking', description: 'Allow public appointment requests' },
  { key: 'development_works_map', label: 'Development Works Map', description: 'Map of ongoing and completed projects' },
  { key: 'scheme_eligibility', label: 'Scheme Eligibility Checker', description: 'Citizens check eligibility for government schemes' },
  { key: 'event_calendar', label: 'Event Calendar', description: 'Public events and meetings calendar' },
  { key: 'praise_complaint', label: 'Praise / Complaint', description: 'Public feedback form for politician' },
  { key: 'newsletter', label: 'Newsletter Subscription', description: 'Allow citizens to subscribe to updates' },
]

export default function PublicWebsite() {
  const [config, setConfig] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  async function fetchConfig() {
    setLoading(true)
    try {
      const data = await api.get('/api/founder/public-website-config')
      const map: Record<string, boolean> = {}
      ;(data.data || data || []).forEach((c: any) => {
        map[c.config_key] = !!c.is_enabled
      })
      setConfig(map)
    } catch (e) {
      console.error('[public-website] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  async function toggle(key: string) {
    const next = !config[key]
    setSavingKey(key)
    try {
      await api.post('/api/founder/public-website-config', { config_key: key, is_enabled: next })
      setConfig((prev) => ({ ...prev, [key]: next }))
    } catch (e) {
      console.error('[public-website] toggle error:', e)
      alert('Failed to update setting')
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) return <Loading text="Loading public website config..." className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Public Website</h1>
            <Badge variant="outline">Command</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Configure the citizen-facing portal and landing page modules.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchConfig}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          <Button size="sm" onClick={() => window.open('https://thoughtfirst.in', '_blank')}><ExternalLink className="mr-2 h-4 w-4" /> Open Site</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Citizen Portal Modules" description="Toggle features available on the public website">
          <div className="space-y-2">
            {MODULES.map((m) => {
              const enabled = !!config[m.key]
              return (
                <button
                  key={m.key}
                  onClick={() => toggle(m.key)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors hover:bg-accent',
                    enabled && 'border-primary/30 bg-primary/5'
                  )}
                >
                  <div>
                    <p className={`text-sm font-medium ${enabled ? '' : 'text-muted-foreground'}`}>{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                  <Badge variant={enabled ? 'success' : 'secondary'}>
                    {savingKey === m.key ? 'Saving...' : enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Live Preview" description="Current public website status">
          <div className="rounded-md border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-medium">https://thoughtfirst.in</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The public portal is currently {config.portal_enabled ? 'enabled' : 'disabled'}.
              {config.portal_enabled ? ' Citizens can access enabled modules above.' : ' Only the login/dashboard is visible.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {MODULES.filter((m) => m.key !== 'portal_enabled' && config[m.key]).map((m) => (
                <Badge key={m.key} variant="outline">{m.label}</Badge>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
