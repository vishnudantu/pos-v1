import { useEffect, useState } from 'react'
import { Save, RefreshCw, Cpu, MessageSquare, Database, Globe, Shield, Bell } from 'lucide-react'
import { api } from '../../lib/api'
import { Button } from '../../components/primitives/Button'
import { Card, CardContent } from '../../components/primitives/Card'
import { SectionCard } from '../../components/primitives/SectionCard'
import { Badge } from '../../components/primitives/Badge'
import { Input } from '../../components/primitives/Input'
import { Select } from '../../components/primitives/Select'
import { Loading } from '../../components/primitives/Loading'

const SETTINGS = [
  { key: 'ai_provider', label: 'Default AI Provider', icon: Cpu, type: 'select', options: [{ label: 'Bynara AI', value: 'bynara' }, { label: 'Ollama Local', value: 'ollama' }, { label: 'Mistral', value: 'mistral' }] },
  { key: 'ollama_model', label: 'Ollama Model', icon: Cpu, type: 'text' },
  { key: 'mistral_model', label: 'Mistral Model', icon: Cpu, type: 'text' },
  { key: 'sms_gateway', label: 'SMS Gateway', icon: MessageSquare, type: 'select', options: [{ label: 'Fast2SMS', value: 'fast2sms' }, { label: 'None', value: 'none' }] },
  { key: 'whatsapp_provider', label: 'WhatsApp Provider', icon: MessageSquare, type: 'select', options: [{ label: 'WhatsApp Business API', value: 'whatsapp_business' }, { label: 'None', value: 'none' }] },
  { key: 'storage_provider', label: 'Storage Provider', icon: Database, type: 'select', options: [{ label: 'S3-Compatible', value: 's3' }, { label: 'Local', value: 'local' }] },
  { key: 'default_language', label: 'Default Language', icon: Globe, type: 'select', options: [{ label: 'English', value: 'en' }, { label: 'Telugu', value: 'te' }, { label: 'Hindi', value: 'hi' }] },
  { key: 'maintenance_mode', label: 'Maintenance Mode', icon: Shield, type: 'select', options: [{ label: 'Off', value: 'false' }, { label: 'On', value: 'true' }] },
  { key: 'allow_public_signup', label: 'Allow Public Signup', icon: Globe, type: 'select', options: [{ label: 'Off', value: 'false' }, { label: 'On', value: 'true' }] },
  { key: 'alert_email', label: 'Alert Email', icon: Bell, type: 'text' },
]

export default function PlatformSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchSettings() {
    setLoading(true)
    try {
      const data = await api.get('/api/founder/platform-settings')
      const map: Record<string, string> = {}
      ;(data.data || []).forEach((s: any) => map[s.config_key] = s.config_value)
      SETTINGS.forEach((s) => {
        if (map[s.key] === undefined) map[s.key] = ''
      })
      setSettings(map)
    } catch (e) {
      console.error('[platform-settings] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      for (const s of SETTINGS) {
        if (settings[s.key] !== undefined) {
          await api.post('/api/founder/platform-settings', { config_key: s.key, config_value: settings[s.key] })
        }
      }
      alert('Platform settings saved')
      await fetchSettings()
    } catch (e) {
      console.error('[platform-settings] save error:', e)
      alert('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading text="Loading platform settings..." className="min-h-[60vh]" />

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Global defaults for AI, messaging, storage, and security.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchSettings}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          <Button size="sm" onClick={save} loading={saving}><Save className="mr-2 h-4 w-4" /> Save All</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SETTINGS.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.key}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{s.label}</span>
                </div>
                {s.type === 'select' ? (
                  <Select value={settings[s.key] || ''} onChange={(e) => update(s.key, e.target.value)} options={s.options || []} />
                ) : (
                  <Input value={settings[s.key] || ''} onChange={(e) => update(s.key, e.target.value)} />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
