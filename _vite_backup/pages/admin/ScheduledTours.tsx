import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAppointments, type AppointmentWithDetails } from '../../lib/appointmentsApi'

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

export default function ScheduledTours() {
  const navigate = useNavigate()
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
      a.property_title?.toLowerCase().includes(search.toLowerCase()) ||
      a.client_name?.toLowerCase().includes(search.toLowerCase())
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
    { label: "Today's Tours", value: String(todayCount), icon: 'calendar', bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Confirmed', value: String(confirmedCount), icon: 'check', bg: 'bg-green-100', text: 'text-green-600' },
    { label: 'Pending', value: String(pendingCount), icon: 'pending', bg: 'bg-amber-100', text: 'text-amber-600' },
    { label: 'Completed', value: String(completedCount), icon: 'refresh', bg: 'bg-gray-100', text: 'text-gray-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Tours</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="search"
              placeholder="Search by property name or client..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-full sm:w-64 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium flex items-center gap-2">
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${m.bg} ${m.text} flex items-center justify-center`}>
              {m.icon === 'calendar' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              {m.icon === 'check' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              {m.icon === 'pending' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              {m.icon === 'refresh' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <p className="text-sm text-gray-500">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg" role="alert">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                <th className="p-4">Property</th>
                <th className="p-4">Client</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading appointments...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No appointments yet.</td></tr>
              ) : (
                paginated.map((a) => {
                  const { dateStr, timeStr } = formatAppointmentDisplay(a.appointment_date)
                  const status = (a.status ?? 'pending').toLowerCase()
                  return (
                    <tr
                      key={a.id}
                      onClick={() => navigate(`/admin/scheduled-tours/${a.id}`)}
                      className="hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                            {a.property_image && (
                              <img src={a.property_image} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{a.property_title ?? '—'}</p>
                            <p className="text-sm text-gray-500">{a.property_location ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{a.client_name ?? '—'}</p>
                        <p className="text-sm text-gray-500">{a.client_email ?? a.client_phone ?? '—'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900">{dateStr}</p>
                        <p className="text-sm text-gray-500">{timeStr}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status] ?? 'bg-gray-200 text-gray-800'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/scheduled-tours/${a.id}`)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button type="button" className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg" title="Reschedule">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                          <button type="button" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Cancel">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} tours
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded border border-gray-200 hover:bg-white disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="px-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              type="button"
              className="p-2 rounded border border-gray-200 hover:bg-white disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
