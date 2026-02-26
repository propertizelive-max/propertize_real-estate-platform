import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TABLE } from '../../lib/tableNames'
import { fetchCompressions, type CompressionWithDetails } from '../../lib/compressionApi'

const LISTING_LABELS: Record<number, string> = {
  1: 'Project',
  2: 'Rent',
  3: 'Resale',
}

/** Fetches compressions with user full_name, phone and property titles by joining on user_id */
async function loadCompressionsWithProfiles(): Promise<CompressionWithDetails[]> {
  const { data: compData, error: compErr } = await fetchCompressions()
  if (compErr || !compData) return []
  const userIds = [...new Set(compData.map((r) => r.user_id).filter(Boolean))] as string[]
  const propIds = [
    ...new Set(
      compData.flatMap((r) => [r.property_one_id, r.property_two_id, r.property_three_id]).filter((id): id is number => id != null && id > 0)
    ),
  ]
  const [profRes, propRes] = await Promise.all([
    userIds.length > 0 ? supabase.from(TABLE.profiles).select('id, full_name, phone').in('id', userIds) : { data: [] as { id: string; full_name: string | null; phone: string | null }[], error: null },
    propIds.length > 0 ? supabase.from(TABLE.properties).select('id, title').in('id', propIds) : { data: [] as { id: number; title: string | null }[], error: null },
  ])
  if (profRes.error && import.meta.env.DEV) {
    console.warn('[Compressions] profiles fetch error:', profRes.error.message)
  }
  const profMap: Record<string, { full_name: string | null; phone: string | null }> = {}
  for (const p of profRes.data ?? []) {
    profMap[p.id] = { full_name: p.full_name ?? null, phone: p.phone ?? null }
  }
  const propMap: Record<number, { id: number; title: string | null }> = {}
  for (const p of propRes.data ?? []) {
    propMap[p.id] = { id: p.id, title: p.title ?? null }
  }
  return compData.map((r) => ({
    ...r,
    profiles: r.user_id && profMap[r.user_id] ? { full_name: profMap[r.user_id].full_name, phone: profMap[r.user_id].phone } : null,
    property_one: r.property_one_id ? { id: r.property_one_id, title: propMap[r.property_one_id]?.title ?? null } : null,
    property_two: r.property_two_id ? { id: r.property_two_id, title: propMap[r.property_two_id]?.title ?? null } : null,
    property_three: r.property_three_id ? { id: r.property_three_id, title: propMap[r.property_three_id]?.title ?? null } : null,
  })) as CompressionWithDetails[]
}

function getPropertyTitle(row: CompressionWithDetails, key: 'property_one' | 'property_two' | 'property_three'): string {
  const p = row[key]
  if (!p) return '—'
  return (p.title ?? 'Untitled').trim() || '—'
}

function getFullName(row: CompressionWithDetails): string {
  const p = row.profiles
  if (!p?.full_name?.trim()) return row.user_id ? `${row.user_id.slice(0, 8)}...` : 'Guest'
  return p.full_name.trim()
}

function getPhone(row: CompressionWithDetails): string {
  const p = row.profiles
  return (p?.phone?.trim()) ? p.phone.trim() : '—'
}

export default function Compressions() {
  const [rows, setRows] = useState<CompressionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await loadCompressionsWithProfiles()
        setRows(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load compressions')
        setRows([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Comparison</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading compressions…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No compressions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User Full Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Listing Type</th>
                  <th className="px-4 py-3">Property 1</th>
                  <th className="px-4 py-3">Property 2</th>
                  <th className="px-4 py-3">Property 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{getFullName(r)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{getPhone(r)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {LISTING_LABELS[r.listing_type ?? 0] ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate" title={getPropertyTitle(r, 'property_one')}>
                      {getPropertyTitle(r, 'property_one')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate" title={getPropertyTitle(r, 'property_two')}>
                      {getPropertyTitle(r, 'property_two')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate" title={getPropertyTitle(r, 'property_three')}>
                      {getPropertyTitle(r, 'property_three')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
