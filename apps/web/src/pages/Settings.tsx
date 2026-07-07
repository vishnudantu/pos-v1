import { useState, useEffect } from 'react'
import { Bell, Shield, Globe, Moon, Sun, Monitor, Save, RefreshCw } from 'lucide-react'
import { Button } from '../components/primitives/Button'
import { Card, CardContent } from '../components/primitives/Card'
import { SectionCard } from '../components/primitives/SectionCard'
import { Badge } from '../components/primitives/Badge'
import { Select } from '../components/primitives/Select'
import { useTheme } from '../lib/theme'

export default function Settings() {
  const { theme, setTheme, resolved } = useTheme()
  const [language, setLanguage] = useState('en')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('nethra-language') || 'en'
    setLanguage(savedLang)
  }, [])

  function handleSave() {
    localStorage.setItem('nethra-language', language)
    localStorage.setItem('nethra-email-notifications', String(emailNotifications))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Appearance" description="Customize the look and feel">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <div className="mt-2 flex items-center gap-2 rounded-md border p-1">
                {[
                  { key: 'light', label: 'Light', icon: Sun },
                  { key: 'dark', label: 'Dark', icon: Moon },
                  { key: 'system', label: 'System', icon: Monitor },
                ].map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key as any)}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${theme === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                      <Icon className="h-4 w-4" /> {t.label}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Currently active: {resolved}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Language</label>
              <div className="mt-1 max-w-xs">
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} options={[
                  { label: 'English', value: 'en' },
                  { label: 'Telugu', value: 'te' },
                  { label: 'Hindi', value: 'hi' },
                ]} />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" description="Control how you receive alerts">
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive daily summaries and alerts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
            </label>

            <label className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Require 2FA for login</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
            </label>
          </div>
        </SectionCard>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Save Changes</p>
              <p className="text-xs text-muted-foreground">Apply your preferences</p>
            </div>
            <div className="flex items-center gap-2">
              {saved && <Badge variant="success">Saved</Badge>}
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" /> Reset</Button>
              <Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
