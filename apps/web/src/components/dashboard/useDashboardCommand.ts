import { useEffect, useState } from 'react'

export interface DashboardCommandData {
  pendingGrievances: number
  overdueGrievances: number
  mediaMentions24h: number
  sentimentTrend: number
  upcomingEvents: number
  activeCampaigns: number
  boothStrength: number
  totalVoters?: number
  activeUsers?: number
  totalPoliticians?: number
  activeBriefings?: number
}

export function useDashboardCommand() {
  const token = localStorage.getItem('token')
  const [data, setData] = useState<DashboardCommandData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch('/api/dashboard/command', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!mounted) return
        if (d?.data) setData(d.data)
        else if (d) setData(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [token])

  return { data, loading, error }
}
