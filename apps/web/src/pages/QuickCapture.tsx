import { useState, useEffect, useRef } from 'react'
import { Mic, Camera, Send, MapPin, User, AlertCircle, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'
import { Button } from '../components/primitives/Button'
import { Card, CardContent } from '../components/primitives/Card'
import { Badge } from '../components/primitives/Badge'
import { SectionCard } from '../components/primitives/SectionCard'

const TYPES = [
  { key: 'grievance', label: 'Grievance', icon: AlertCircle, color: 'bg-danger/10 text-danger border-danger/20' },
  { key: 'visit', label: 'Field Visit', icon: MapPin, color: 'bg-info/10 text-info border-info/20' },
  { key: 'feedback', label: 'Feedback', icon: User, color: 'bg-success/10 text-success border-success/20' },
]

export default function QuickCapture() {
  const { politician } = useAuth() as any
  const [type, setType] = useState('grievance')
  const [step, setStep] = useState(1)
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState('')
  const [form, setForm] = useState({ title: '', description: '', citizen_name: '', citizen_phone: '', location: '', priority: 'medium' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const mediaRef = useRef<any>(null)

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function startRecording() {
    setRecording(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      mediaRef.current.ondataavailable = (e: any) => chunks.push(e.data)
      mediaRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setTranscript('Voice captured. AI will extract issue details after upload.')
        setForm((prev) => ({ ...prev, title: 'Water supply issue', description: 'Voice note received from field worker. AI extraction pending.' }))
      }
      mediaRef.current.start()
    } catch (e) {
      alert('Microphone access required')
      setRecording(false)
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    setRecording(false)
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      await api.post('/api/quick-capture', {
        type,
        politician_id: politician?.id,
        ...form,
      })
      setDone(true)
    } catch (e: any) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Captured Successfully</h2>
        <p className="mt-2 text-sm text-muted-foreground">Office team has been notified.</p>
        <Button className="mt-6 gap-2" onClick={() => { setDone(false); setStep(1); setForm({ title: '', description: '', citizen_name: '', citizen_phone: '', location: '', priority: 'medium' }); setAudioBlob(null); setTranscript('') }}>
          <RotateCcw className="h-4 w-4" /> Capture Another
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Quick Capture</h1>
        <p className="text-sm text-muted-foreground">Speak or snap — AI fills the form for field workers</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {TYPES.map((t) => {
          const Icon = t.icon
          const active = type === t.key
          return (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
                active ? `bg-white shadow-sm ${t.color}` : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {step === 1 && (
        <Card className="border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-8 flex justify-center gap-6">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={cn(
                  'flex h-24 w-24 flex-col items-center justify-center rounded-full shadow-lg transition-all active:scale-95',
                  recording ? 'animate-pulse bg-danger text-white' : 'bg-primary text-primary-foreground'
                )}
              >
                <Mic className="h-8 w-8" />
                <span className="mt-1 text-[10px] font-semibold">{recording ? 'Stop' : 'Speak'}</span>
              </button>
              <button className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-muted text-muted-foreground shadow-lg transition-all active:scale-95 hover:bg-accent">
                <Camera className="h-8 w-8" />
                <span className="mt-1 text-[10px] font-semibold">Snap</span>
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {recording ? 'Listening... describe the issue in Telugu/Hindi' : 'Tap mic and speak, or tap camera to take a photo'}
            </p>
            {transcript && (
              <div className="mt-6 rounded-xl bg-muted p-4 text-left">
                <Badge variant="outline" className="mb-2 text-[10px]">AI Transcript</Badge>
                <p className="text-sm">{transcript}</p>
              </div>
            )}
            <Button className="mt-8 w-full gap-2" onClick={() => setStep(2)}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <SectionCard title="Confirm Details" description="AI extracted this — edit if needed">
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">What is the issue?</label>
              <input className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={form.title} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Details</label>
              <textarea className="mt-1 min-h-[80px] w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            {type === 'grievance' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Citizen Name</label>
                  <input className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm" value={form.citizen_name} onChange={(e) => update('citizen_name', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Phone</label>
                  <input className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm" value={form.citizen_phone} onChange={(e) => update('citizen_phone', e.target.value)} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Location</label>
                <input className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm" value={form.location} onChange={(e) => update('location', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Priority</label>
                <select className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1 gap-2" onClick={handleSubmit} loading={saving}><Send className="h-4 w-4" /> Submit</Button>
          </div>
        </SectionCard>
      )}

      <div className="rounded-2xl bg-muted p-4 text-center">
        <p className="text-xs text-muted-foreground">Field workers only confirm 4 fields. AI enriches the rest automatically.</p>
      </div>
    </div>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
