'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'

const TABLE_MAP: Record<string, string> = {
  site_sections: TABLE.site_sections,
  services: TABLE.services,
  team_members: TABLE.team_members,
  testimonials: TABLE.testimonials,
  faqs: TABLE.faqs,
  company_stats: TABLE.company_stats,
  company_info: TABLE.company_info,
  legal_pages: TABLE.legal_pages,
  contact_inquiries: TABLE.contact_inquiries,
}

type UseFetchTableOptions = {
  activeOnly?: boolean
  orderBy?: string
  ascending?: boolean
}

export function useFetchTable<T = Record<string, unknown>>(
  tableName: keyof typeof TABLE_MAP,
  options: UseFetchTableOptions = {}
) {
  const table = TABLE_MAP[tableName]
  if (!table) {
    throw new Error(`Unknown table: ${tableName}`)
  }

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from(table).select('*')

      if (options.activeOnly) {
        if (tableName === 'site_sections') query = query.eq('is_active', true)
        else if (tableName === 'testimonials') query = query.eq('is_active', true)
        else if (tableName === 'faqs') query = query.eq('is_active', true)
      }

      const orderCol = options.orderBy ?? (tableName === 'site_sections' ? 'section_key' : 'id')
      query = query.order(orderCol, { ascending: options.ascending ?? true })

      const { data: rows, error: err } = await query
      if (err) throw err
      setData((rows as T[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [table, tableName, options.activeOnly, options.orderBy, options.ascending])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
