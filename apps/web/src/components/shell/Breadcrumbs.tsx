import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'morning-brief': 'Morning Brief',
  'ai-studio': 'AI Studio',
  media: 'OmniScan Media',
  grievances: 'Grievances',
  events: 'Events',
  appointments: 'Appointments',
  voters: 'Voters',
  booths: 'Booths',
  darshan: 'Darshan',
  users: 'Users',
  politicians: 'Politicians',
  settings: 'Settings',
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground">
        Home
      </Link>
      {segments.map((seg, idx) => {
        const path = '/' + segments.slice(0, idx + 1).join('/')
        const isLast = idx === segments.length - 1
        return (
          <span key={seg} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-foreground">{LABELS[seg] || seg}</span>
            ) : (
              <Link to={path} className="hover:text-foreground">
                {LABELS[seg] || seg}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
