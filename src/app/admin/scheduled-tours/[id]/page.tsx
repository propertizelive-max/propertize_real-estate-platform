'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { fetchAppointmentById } from '@/lib/appointmentsApi'

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500 text-white',
  pending: 'bg-amber-500 text-white',
  completed: 'bg-gray-500 text-white',
  cancelled: 'bg-red-500 text-white',
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string | undefined
  const [appointment, setAppointment] = useState<Awaited<ReturnType<typeof fetchAppointmentById>>>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchAppointmentById(parseInt(id, 10))
      .then(setAppointment)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Loading appointment...</div>
  }

  if (!appointment) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500 mb-4">Appointment not found.</p>
        <Link href="/admin/scheduled-tours" className="text-primary hover:underline">Back to Scheduled Tours</Link>
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
      <div className="flex justify-between items-center">
        <div>
          <nav className="text-sm text-gray-500 mb-1">
            <Link href="/admin" className="hover:text-primary">Admin</Link>
            <span className="mx-1">/</span>
            <Link href="/admin/scheduled-tours" className="hover:text-primary">Scheduled Tours</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-900">#{appointment.id}</span>
          </nav>
          <h1 className="text-2xl font-bold">Appointment Details</h1>
        </div>
        <button type="button" onClick={() => router.push('/admin/scheduled-tours')} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
          Back to List
        </button>
      </div>

      <div className="bg-white rounded-xl border p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Property</h3>
            <p className="font-medium">{appointment.property_title ?? '-'}</p>
            <p className="text-sm text-gray-500">{appointment.property_location ?? '-'}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Date & Time</h3>
            <p>{dateStr}</p>
            <p className="text-sm text-gray-500">{startStr} - {endStr}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Status</h3>
            <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${statusColors[status] ?? 'bg-gray-200'}`}>{status}</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Client</h3>
            <p className="font-medium">{appointment.client_name ?? '-'}</p>
            <p className="text-sm text-gray-500">{appointment.client_phone ?? appointment.client_email ?? '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
