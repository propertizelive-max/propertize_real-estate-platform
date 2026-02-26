'use client'

import { useState, useEffect } from 'react'
import { fetchContactInquiries } from '@/features/cms/services/cmsApi'
import { ErrorState } from '../ErrorState'
import { LoadingSkeleton } from '../LoadingSkeleton'

export function ContactInquiriesTab() {
  const [items, setItems] = useState<Array<{ id: number; name: string | null; email: string | null; phone: string | null; subject: string | null; message: string | null; status: string | null; created_at?: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchContactInquiries()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">Contact form submissions. Read-only. Manage status in Supabase if needed.</p>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        {items.length === 0 ? (
          <div className="p-16 text-center text-gray-500">No contact inquiries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {i.created_at ? new Date(i.created_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 font-medium">{i.name ?? '-'}</td>
                    <td className="px-6 py-4 text-sm">{i.email ?? '-'}</td>
                    <td className="px-6 py-4 text-sm">{i.subject ?? '-'}</td>
                    <td className="max-w-xs px-6 py-4 text-sm truncate">{i.message ?? '-'}</td>
                    <td className="px-6 py-4"><span className="rounded px-2 py-0.5 text-xs bg-gray-100">{i.status ?? '-'}</span></td>
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
