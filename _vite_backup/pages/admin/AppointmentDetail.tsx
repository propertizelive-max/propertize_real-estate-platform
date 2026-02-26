import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { fetchAppointmentById } from '../../lib/appointmentsApi'

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500 text-white',
  pending: 'bg-amber-500 text-white',
  completed: 'bg-gray-500 text-white',
  cancelled: 'bg-red-500 text-white',
}

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState<Awaited<ReturnType<typeof fetchAppointmentById>>>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchAppointmentById(parseInt(id, 10))
      .then(setAppointment)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500">Loading appointment...</p>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Appointment not found.</p>
        <Link to="/admin/scheduled-tours" className="text-primary hover:underline font-medium">
          Back to Scheduled Tours
        </Link>
      </div>
    )
  }

  const d = new Date(appointment.appointment_date)
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const startStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const end = new Date(d.getTime() + 60 * 60 * 1000)
  const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const status = (appointment.status ?? 'pending').toLowerCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-500 mb-1">
            <Link to="/admin" className="hover:text-primary">Admin</Link>
            <span className="mx-1">/</span>
            <Link to="/admin/scheduled-tours" className="hover:text-primary">Scheduled Tours</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-900">Appointment #{appointment.id}</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/scheduled-tours')}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
        >
          ← Back to List
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Property</h3>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                  {appointment.property_image && (
                    <img src={appointment.property_image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{appointment.property_title ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-1">{appointment.property_location ?? '—'}</p>
                  <Link
                    to={`/admin/properties/${appointment.property_id}`}
                    className="inline-block mt-2 text-sm text-primary hover:underline font-medium"
                  >
                    View Property →
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Client</h3>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{appointment.client_name ?? '—'}</p>
                <p className="text-sm text-gray-500">{appointment.client_phone ?? '—'}</p>
                {appointment.client_email && (
                  <p className="text-sm text-gray-500">{appointment.client_email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Schedule</h3>
              <p className="font-medium text-gray-900">{dateStr}</p>
              <p className="text-gray-600 mt-1">{startStr} – {endStr}</p>
              <p className="text-sm text-gray-500 mt-1">Duration: 60 minutes</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
              <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium capitalize ${statusColors[status] ?? 'bg-gray-200 text-gray-800'}`}>
                {status}
              </span>
            </div>

            {appointment.created_at && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Booked On</h3>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.created_at).toLocaleString('en-US')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">schedule</span>
            Reschedule
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Confirm
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  )
}
