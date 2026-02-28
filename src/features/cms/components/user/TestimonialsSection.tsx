'use client'

import { useState, useEffect } from 'react'
import { fetchTestimonials } from '../../services/cmsApi'
import type { Testimonial } from '../../types'

export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([])

  useEffect(() => {
    fetchTestimonials(true)
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-16 px-6 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Our Clients Say</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
              {t.rating != null && (
                <div className="flex gap-1 mb-3 text-amber-500">
                  {Array.from({ length: Math.min(5, t.rating) }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              )}
              <p className="text-gray-700 mb-4">&ldquo;{t.review ?? ''}&rdquo;</p>
              <p className="font-semibold text-gray-900">{t.client_name ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
