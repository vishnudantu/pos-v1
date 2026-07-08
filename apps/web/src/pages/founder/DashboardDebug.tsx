import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function DashboardDebug() {
  const [logs, setLogs] = useState<any>({})

  useEffect(() => {
    async function load() {
      const results: any = {}
      try {
        results.parties = await api.list('parties')
        results.partiesType = typeof results.parties
        results.partiesLength = Array.isArray(results.parties) ? results.parties.length : 'not array'
      } catch (e: any) { results.partiesError = e.message }
      try {
        results.users = await api.list('founder/users')
        results.usersType = typeof results.users
        results.usersLength = Array.isArray(results.users) ? results.users.length : 'not array'
      } catch (e: any) { results.usersError = e.message }
      try {
        results.politicians = await api.list('politicians')
        results.politiciansType = typeof results.politicians
        results.politiciansLength = Array.isArray(results.politicians) ? results.politicians.length : 'not array'
      } catch (e: any) { results.politiciansError = e.message }
      try {
        results.integrations = await api.list('integrations')
        results.integrationsLength = Array.isArray(results.integrations) ? results.integrations.length : 'not array'
      } catch (e: any) { results.integrationsError = e.message }
      try {
        results.features = await api.get('/api/features/matrix')
        results.featuresGlobalLength = Array.isArray(results.features?.global) ? results.features.global.length : 'not array'
      } catch (e: any) { results.featuresError = e.message }
      setLogs(results)
    }
    load()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard API Debug</h1>
      <pre className="bg-muted p-4 rounded text-xs overflow-auto">{JSON.stringify(logs, null, 2)}</pre>
    </div>
  )
}
