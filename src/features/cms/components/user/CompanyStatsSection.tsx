'use client'

import { useState, useEffect } from 'react'
import { fetchCompanyStats } from '../../services/cmsApi'
import type { CompanyStat } from '../../types'

export default function CompanyStatsSection() {
  const [items, setItems] = useState<CompanyStat[]>([])

  useEffect(() => {
    fetchCompanyStats()
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-16 px-6 bg-primary/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 text-center">
              <p className="text-3xl font-bold text-primary">{s.value ?? '-'}</p>
              <p className="text-sm text-gray-600 mt-1">{s.label ?? ''}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
