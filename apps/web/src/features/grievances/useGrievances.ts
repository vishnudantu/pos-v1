import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export interface Grievance {
  id: number
  title: string
  description?: string
  citizen_name?: string
  citizen_phone?: string
  status: 'new' | 'in_progress' | 'escalated' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  department?: string
  assigned_to?: number
  assigned_name?: string
  politician_id?: number
  created_at: string
  updated_at: string
  due_date?: string
}

export function useGrievances() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchGrievances() {
    setLoading(true)
    try {
      const data = await api.list('grievances', { limit: '200', order: 'created_at', dir: 'DESC' })
      setGrievances(data || [])
    } catch (e) {
      console.error('[grievances] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrievances()
  }, [])

  async function updateStatus(id: number, status: Grievance['status']) {
    try {
      await api.update('grievances', id, { status })
      await fetchGrievances()
    } catch (e) {
      console.error('[grievances] status update error:', e)
    }
  }

  async function updatePriority(id: number, priority: Grievance['priority']) {
    try {
      await api.update('grievances', id, { priority })
      await fetchGrievances()
    } catch (e) {
      console.error('[grievances] priority update error:', e)
    }
  }

  async function deleteGrievance(id: number) {
    if (!confirm('Delete this grievance?')) return
    try {
      await api.remove('grievances', id)
      await fetchGrievances()
    } catch (e) {
      console.error('[grievances] delete error:', e)
    }
  }

  return { grievances, loading, refresh: fetchGrievances, updateStatus, updatePriority, deleteGrievance }
}
