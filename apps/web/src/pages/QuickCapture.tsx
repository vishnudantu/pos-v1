import { useState, useEffect, useRef } from 'react'
import { Mic, Camera, Send, X, MapPin, User, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'
import { Button } from '../components/primitives/Button'
import { Card, CardContent } from '../components/primitives/Card'
import { Badge } from '../components/primitives/Badge'
import { SectionCard } from '../components/primitives/SectionCard'
import { Loading } from '../components/primitives/Loading'

const TYPES = [
  { key: 'grievance', label: 'Grievance', icon: AlertCircle, color: 'danger' },
  { key: 'visit', label: 'Field Visit', icon: MapPin, color: 'info' },
  { key: 'feedback', label: 'Public Feedback', icon: User, color: 'success' },
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
        // Simulate AI transcript extraction
        setTranscript('Voice captured. AI will extract details after upload.')
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
        audio_url: audioBlob ? 'pending-upload' : null,
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
      <div className="mx-auto max-w-md py-12 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h2 className="mt-4 text-2xl font-semibold">Captured!</h2>
        <p className="mt-2 text-sm text-muted-foreground">The office team has been notified.</p>
        <Button className="mt-6" onClick={() => { setDone(false); setStep(1); setForm({ title: '', description: '', citizen_name: '', citizen_phone: '', location: '', priority: 'medium' }); setAudioBlob(null); setTranscript('') }}>Capture Another</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Quick Capture</h1>
        <p className="text-sm text-muted-foreground">Voice-first data entry for field workers</p>
      </div>

      <div className="flex justify-center gap-2">
        {TYPES.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${type === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-6 flex justify-center gap-4">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-transform ${recording ? 'animate-pulse bg-danger text-white' : 'bg-primary text-primary-foreground'}`}
              >
                <Mic className="h-8 w-8" />
              </button>
              <button className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-lg">
                <Camera className="h-8 w-8" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{recording ? 'Recording... tap to stop' : 'Tap mic and describe in Telugu/Hindi'}</p>
            {transcript && <p className="mt-4 rounded-md bg-muted p-3 text-sm">{transcript}</p>}
            <Button className="mt-6 w-full" onClick={() => setStep(2)} disabled={!audioBlob && !form.title}>Next</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <SectionCard title="Confirm Details" description="AI extracted these details — edit if needed">
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-medium uppercase text-muted-foreground">What happened?</label>
              <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Short title" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase text-muted-foreground">Details</label>
              <textarea className="mt-1 min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            {type === 'grievance' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase text-muted-foreground">Citizen Name</label>
                  <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.citizen_name} onChange={(e) => update('citizen_name', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-muted-foreground">Phone</label>
                  <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.citizen_phone} onChange={(e) => update('citizen_phone', e.target.value)} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase text-muted-foreground">Location</label>
                <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.location} onChange={(e) => update('location', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-muted-foreground">Priority</label>
                <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1" onClick={handleSubmit} loading={saving}><Send className="mr-2 h-4 w-4" /> Submit</Button>
          </div>
        </SectionCard>
      )}

      <div className="text-center text-xs text-muted-foreground">
        <p>Field workers only see 4 fields. AI enriches the rest.</p>
      </div>
    </div>
  )
}
