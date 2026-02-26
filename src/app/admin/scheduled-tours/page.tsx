'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAppointments, type AppointmentWithDetails } from '@/lib/appointmentsApi'

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500 text-white',
  pending: 'bg-amber-500 text-white',
  completed: 'bg-gray-500 text-white',
  cancelled: 'bg-red-500 text-white',
}

function formatAppointmentDisplay(iso: string) {
  const d = new Date(iso)
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const startStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const end = new Date(d.getTime() + 60 * 60 * 1000)
  const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return { dateStr, timeStr: `${startStr} - ${endStr}` }
}

export default function ScheduledToursPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    fetchAppointments()
      .then(setAppointments)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = appointments.filter(
    (a) =>
      search === '' ||
      (a.property_title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.client_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const todayCount = appointments.filter((a) => {
    const d = new Date(a.appointment_date)
    const t = new Date()
    return d.toDateString() === t.toDateString()
  }).length
  const confirmedCount = appointments.filter((a) => (a.status ?? '').toLowerCase() === 'confirmed').length
  const pendingCount = appointments.filter((a) => (a.status ?? '').toLowerCase() === 'pending').length
  const completedCount = appointments.filter((a) => (a.status ?? '').toLowerCase() === 'completed').length

  const metrics = [
    { label: 'Todays Tours', value: String(todayCount), bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Confirmed', value: String(confirmedCount), bg: 'bg-green-100', text: 'text-green-600' },
    { label: 'Pending', value: String(pendingCount), bg: 'bg-amber-100', text: 'text-amber-600' },
    { label: 'Completed', value: String(completedCount), bg: 'bg-gray-100', text: 'text-gray-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Scheduled Tours</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={`rounded-xl border p-4 ${m.bg} ${m.text}`}>
            <p className="text-2xl font-bold">{m.value}</p>
            <p className="text-sm opacity-90">{m.label}</p>
          </div>
        ))}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg" role="alert">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex gap-2">
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="px-4 py-2 rounded-lg border flex-1 max-w-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b bg-gray-50">
                <th className="p-4">Property</th>
                <th className="p-4">Client</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No appointments.</td></tr>
              ) : (
                paginated.map((a) => {
                  const { dateStr } = formatAppointmentDisplay(a.appointment_date)
                  const status = (a.status ?? 'pending').toLowerCase()
                  return (
                    <tr
                      key={a.id}
                      onClick={() => router.push(`/admin/scheduled-tours/${a.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-4 font-medium">{a.property_title ?? '-'}</td>
                      <td className="p-4">{a.client_name ?? '-'}</td>
                      <td className="p-4">{dateStr}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusColors[status] ?? 'bg-gray-200'}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages} ({filtered.length} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
