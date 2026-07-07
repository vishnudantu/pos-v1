import { useEffect, useState } from 'react'
import { api } from '../api'

export interface UseCrudOptions {
  entity: string
  limit?: number
  order?: string
  dir?: 'ASC' | 'DESC'
  searchFields?: string[]
}

export function useCrud<T extends Record<string, any>>(opts: UseCrudOptions) {
  const { entity, limit = 200, order = 'created_at', dir = 'DESC' } = opts
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchItems(params?: Record<string, any>) {
    setLoading(true)
    setError(null)
    try {
      const data = await api.list(entity, {
        limit: String(limit),
        order,
        dir,
        ...params,
      })
      setItems(data || [])
    } catch (e: any) {
      console.error(`[crud:${entity}] fetch error:`, e)
      setError(e.message || `Failed to load ${entity}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [entity])

  async function create(body: Partial<T>) {
    const res = await api.create(entity, body)
    await fetchItems()
    return res
  }

  async function update(id: string | number, body: Partial<T>) {
    const res = await api.update(entity, id, body)
    await fetchItems()
    return res
  }

  async function remove(id: string | number) {
    const res = await api.remove(entity, id)
    await fetchItems()
    return res
  }

  return { items, loading, error, refresh: fetchItems, create, update, remove }
}
