import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TABLE } from '../../lib/tableNames'

type ListingRow = {
  id: number
  title: string | null
  price: number | null
  cover_url?: string | null
}

function KpiIcon({ name }: { name: string }) {
  const base = 'w-10 h-10 rounded-full flex items-center justify-center'
  if (name === 'building')
    return <div className={`${base} bg-blue-100 text-blue-600`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
  if (name === 'users')
    return <div className={`${base} bg-blue-100 text-blue-600`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
  if (name === 'calendar')
    return <div className={`${base} bg-blue-100 text-blue-600`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
  return <div className={`${base} bg-blue-100 text-blue-600`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
}

export default function Dashboard() {
  const [totalProperties, setTotalProperties] = useState<number | null>(null)
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null)
  const [recentListings, setRecentListings] = useState<ListingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toursCount] = useState(12)
  const [revenue] = useState('$45k')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [countProps, countProfiles, recentRes] = await Promise.all([
          supabase.from(TABLE.properties).select('id', { count: 'exact', head: true }),
          supabase.from(TABLE.profiles).select('id', { count: 'exact', head: true }),
          supabase.from(TABLE.properties).select('id, title, price').order('id', { ascending: false }).limit(5),
        ])

        setTotalProperties(countProps.count ?? 0)
        setRegisteredUsers(countProfiles.count ?? 0)
        const list = (recentRes.data ?? []) as { id: number; title: string | null; price: number | null }[]
        if (list.length > 0) {
          const ids = list.map((p) => p.id)
          const { data: mediaRows } = await supabase
            .from(TABLE.property_media)
            .select('property_id, file_url')
            .in('property_id', ids)
            .order('id')

          const firstByProp: Record<number, string> = {}
          for (const row of mediaRows ?? []) {
            const pid = (row as { property_id: number; file_url: string }).property_id
            if (firstByProp[pid] == null) firstByProp[pid] = (row as { property_id: number; file_url: string }).file_url
          }
          setRecentListings(
            list.map((p) => ({ ...p, cover_url: firstByProp[p.id] ?? null }))
          )
        } else {
          setRecentListings([])
        }
      } catch (e) {
        console.error('Dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpis = [
    { title: 'Total Listed Properties', value: loading ? '…' : String(totalProperties ?? 0), change: '', positive: true, icon: 'building' as const },
    { title: 'Registered Users', value: loading ? '…' : String(registeredUsers ?? 0), change: '', positive: true, icon: 'users' as const },
    { title: 'Tours Today', value: String(toursCount), change: '', positive: true, icon: 'calendar' as const },
    { title: 'Total Revenue/Leads', value: revenue, change: '', positive: false, icon: 'revenue' as const },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Admin</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <KpiIcon name={k.icon} />
              {k.change && (
                <span className={`text-sm font-medium ${k.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {k.change}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">{k.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Upcoming Scheduled Tours</h2>
            <Link to="/admin/scheduled-tours" className="text-sm text-primary hover:underline">View Calendar</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="p-3 font-medium">PROPERTY</th>
                  <th className="p-3 font-medium">CLIENT NAME</th>
                  <th className="p-3 font-medium">DATE & TIME</th>
                  <th className="p-3 font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="p-3 text-gray-500" colSpan={4}>No upcoming tours. Data from appointments table can be wired here.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Listings</h2>
            <Link to="/admin/properties/add" className="text-sm text-primary hover:underline">Add New</Link>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">Loading…</div>
          ) : recentListings.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No listings yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentListings.map((l) => (
                <li key={l.id}>
                  <Link
                    to={`/admin/properties/${l.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                        {l.cover_url ? (
                          <img src={l.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{l.title ?? 'Untitled'}</p>
                        <p className="text-sm text-gray-500">
                          {l.price != null ? l.price.toLocaleString() : '—'}
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="p-4 border-t border-gray-100">
            <Link to="/admin/properties" className="block w-full py-2 text-center border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors">View All Listings</Link>
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold">Market Insights</h2>
          <p className="mt-2 text-gray-300 text-sm max-w-2xl">
            Property demand insights and marketing suggestions can be added here.
          </p>
        </div>
      </div>
    </div>
  )
}
