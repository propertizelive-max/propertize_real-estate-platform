'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchPropertyById, formatLocation, getFirstImage } from '@/lib/propertyApi'
import { createAppointment } from '@/lib/appointmentsApi'
import { parsePropertyIdFromSlug } from '@/lib/slug'
import { toPropertySlug } from '@/lib/slug'

const SLOTS = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM']

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

function parseSlot(slot: string): { hours: number; minutes: number } {
  const match = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return { hours: 9, minutes: 0 }
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const pm = match[3].toUpperCase() === 'PM'
  if (pm && h !== 12) h += 12
  if (!pm && h === 12) h = 0
  return { hours: h, minutes: m }
}

function toISODate(year: number, month: number, day: number, hours: number, minutes: number): string {
  const d = new Date(year, month, day, hours, minutes)
  return d.toISOString()
}

function getDaysInMonth(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const days = last.getDate()
  const prevMonth = new Date(year, month, 0).getDate()
  const prevDays = Array.from({ length: startPad }, (_, i) => prevMonth - startPad + i + 1)
  const currDays = Array.from({ length: days }, (_, i) => i + 1)
  return { prevDays, currDays }
}

export default function BookAppointmentPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug as string | undefined
  const router = useRouter()
  const { user, profile } = useAuth()
  const propertyId = slug ? parsePropertyIdFromSlug(slug) ?? 0 : 0

  const [property, setProperty] = useState<Awaited<ReturnType<typeof fetchPropertyById>>>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today.getDate())
  const [selectedSlot, setSelectedSlot] = useState('01:00 PM')

  useEffect(() => {
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/property/${slug}/appointment`)}`)
      return
    }
    if (!propertyId) return
    fetchPropertyById(propertyId).then((p) => setProperty(p)).finally(() => setLoading(false))
  }, [propertyId, user, router, slug])

  const handleBook = async () => {
    if (!user || !propertyId) return
    const { hours, minutes } = parseSlot(selectedSlot)
    const iso = toISODate(selectedYear, selectedMonth, selectedDate, hours, minutes)
    setSubmitting(true)
    setError(null)
    try {
      await createAppointment(propertyId, user.id, iso, {
        fullName: profile?.full_name ?? undefined,
        phone: profile?.phone ?? undefined,
        email: user.email ?? undefined,
      })
      setSuccess(true)
      const destSlug = property ? toPropertySlug(property.title, property.id) : String(propertyId)
      setTimeout(() => router.push(`/property/${destSlug}`), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-primary min-h-screen font-display flex items-center justify-center">
        <p className="text-primary/60">Loading...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-primary min-h-screen font-display flex items-center justify-center">
        <p className="text-primary/60">Property not found.</p>
      </div>
    )
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })
  const { prevDays, currDays } = getDaysInMonth(viewYear, viewMonth)

  return (
    <div className="bg-background-light dark:bg-background-dark text-primary min-h-screen font-display">
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-primary/60 font-semibold tracking-widest text-xs uppercase">Exclusive Access</span>
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-primary">Schedule a Private Viewing</h1>
              <p className="text-lg text-primary/60 leading-relaxed max-w-md">
                Select your preferred date and time for a personalized tour. You must be signed in to book.
              </p>
            </div>
            <div className="p-6 bg-primary/5 rounded-xl border border-primary/5">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary/40">info</span>
                <p className="text-sm text-primary/70 leading-relaxed">
                  Our concierge will reach out within 2 hours to confirm the logistics of your visit.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden">
              <div className="p-8 md:p-10 space-y-10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold">1</span>
                  <h2 className="text-xl font-bold">Select Date & Time</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <span className="font-bold text-lg">{monthLabel}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) } else setViewMonth((m) => m - 1) }} className="p-2 hover:bg-primary/5 rounded-full transition-colors">
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button type="button" onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) } else setViewMonth((m) => m + 1) }} className="p-2 hover:bg-primary/5 rounded-full transition-colors">
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {prevDays.map((d) => <div key={`prev-${d}`} className="p-3 text-sm text-primary/20">{d}</div>)}
                      {currDays.map((d) => {
                        const isSelected = viewYear === selectedYear && viewMonth === selectedMonth && selectedDate === d
                        return (
                          <button key={d} type="button" onClick={() => { setSelectedYear(viewYear); setSelectedMonth(viewMonth); setSelectedDate(d) }} className={`p-3 text-sm rounded-lg font-medium transition-colors ${isSelected ? 'bg-primary text-white' : 'hover:bg-primary/5'}`}>
                            {d}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="font-bold text-lg">Available Slots</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {SLOTS.map((slot) => (
                        <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={`px-4 py-3 text-sm font-medium border rounded-lg transition-colors ${selectedSlot === slot ? 'bg-primary text-white border-primary' : 'border-primary/10 hover:bg-primary/5'}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-primary/5">
                      <p className="text-xs text-primary/50 flex items-center gap-2 uppercase tracking-widest font-bold">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Duration: 60 Minutes
                      </p>
                    </div>
                  </div>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm" role="alert">{error}</div>}
                {success && <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm" role="alert">Appointment booked successfully! Redirecting...</div>}

                <div className="bg-background-light dark:bg-primary/10 p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/5">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Viewing Reservation</p>
                    <p className="text-xl font-bold">
                      {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'short' })} {ordinal(selectedDate)} at {selectedSlot}
                    </p>
                  </div>
                  <button type="button" onClick={handleBook} disabled={submitting} className="w-full md:w-auto bg-primary text-white px-10 py-5 rounded-lg text-base font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                    {submitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6 px-4">
              <img alt={property.title ?? 'Property'} className="w-20 h-20 rounded-lg object-cover border border-primary/10" src={getFirstImage(property.media ?? [])} />
              <div>
                <p className="text-sm font-bold">Selected Property</p>
                <p className="text-lg text-primary/70">{property.title ?? 'Untitled'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-xs text-primary/40">location_on</span>
                  <span className="text-xs text-primary/40 font-medium">{formatLocation(property.location)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-primary/5 py-10 bg-white/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-primary/40 font-medium">© {new Date().getFullYear()} Propertize. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="text-xs font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="text-xs font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors" href="#">Terms</a>
            <a className="text-xs font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
