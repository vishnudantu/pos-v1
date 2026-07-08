import { useAuth } from '../../lib/auth'
import { DashboardLayout } from './DashboardLayout'
import { Card, CardContent } from '../primitives/Card'
import { Mic, Camera, MapPin, Users, CheckCircle2 } from 'lucide-react'
import { Button } from '../primitives/Button'
import { Link } from 'react-router-dom'

export function KaryakartaDashboard() {
  const { user, activePolitician } = useAuth() as any
  return (
    <DashboardLayout title="Booth Command" subtitle="Voice-first ground operations." badge="Karyakarta">
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold">Your Booth: {activePolitician?.constituency_name || 'Not assigned'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Field worker dashboard for {user?.email}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link to="/quick-capture">
                <Button className="h-auto w-full flex-col gap-2 py-5">
                  <Mic className="h-6 w-6" />
                  <span className="text-xs">Speak</span>
                </Button>
              </Link>
              <Link to="/quick-capture">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-5">
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Snap</span>
                </Button>
              </Link>
              <Link to="/voters">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-5">
                  <Users className="h-6 w-6" />
                  <span className="text-xs">Voters</span>
                </Button>
              </Link>
              <Link to="/grievances">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-5">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-xs">Tasks</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
