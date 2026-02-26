'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'

type PropertyRow = {
  id: number
  title?: string | null
  price?: number | null
}

export default function PropertiesPage() {
  const [items, setItems] = useState<PropertyRow[]>([])
  const [searchByTitle, setSearchByTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filteredItems = searchByTitle.trim()
    ? items.filter((p) => (p.title ?? '').toLowerCase().includes(searchByTitle.trim().toLowerCase()))
    : items

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from(TABLE.properties)
        .select('id, title, price')
        .order('id', { ascending: false })

      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      setItems((data as PropertyRow[]) ?? [])
    }

    fetchProperties()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <Link
          href="/admin/properties/add"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
        >
          <span>+</span> Add New Property
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="sr-only">Search by title</label>
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="search"
            placeholder="Search by title..."
            value={searchByTitle}
            onChange={(e) => setSearchByTitle(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading properties...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {items.length === 0
              ? 'No properties yet. Create your first listing.'
              : 'No properties match your search.'}
            <div className="mt-2">
              <Link href="/admin/properties/add" className="text-primary hover:underline font-medium">
                Add New Property
              </Link>
            </div>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">#{p.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="text-primary hover:underline"
                    >
                      {p.title ?? 'Untitled'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {p.price != null ? `$${p.price.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
