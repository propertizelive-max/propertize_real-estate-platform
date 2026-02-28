'use client'

import { useState, useEffect } from 'react'
import { fetchServices } from '../../services/cmsApi'
import type { Service } from '../../types'

export default function ServicesSection() {
  const [items, setItems] = useState<Service[]>([])

  useEffect(() => {
    fetchServices()
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  const activeServices = items.filter((s) => s.is_active)
  if (activeServices.length === 0) return null

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-primary text-4xl font-black mb-4">Our Services</h2>
        <p className="text-primary/60 max-w-2xl mx-auto">Providing unparalleled service and expertise to our prestigious clientele.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {activeServices.map((s) => (
          <div key={s.id} className="flex flex-col items-center text-center p-8 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-accent-gold/20 overflow-visible">
            <div className="size-24 min-h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 shrink-0 overflow-visible">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '2.75rem' }}>
                {s.icon || 'home'}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">{s.title ?? '—'}</h3>
            <p className="text-gray-600 leading-relaxed">{s.description ?? ''}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
