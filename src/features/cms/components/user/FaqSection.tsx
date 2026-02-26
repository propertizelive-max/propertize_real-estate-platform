'use client'

import { useState, useEffect } from 'react'
import { fetchFaqs } from '../../services/cmsApi'
import type { Faq } from '../../types'

export default function FaqSection() {
  const [items, setItems] = useState<Faq[]>([])
  const [openId, setOpenId] = useState<string | number | null>(null)

  useEffect(() => {
    fetchFaqs(true)
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-primary text-4xl font-black mb-4">Frequently Asked Questions</h2>
        <p className="text-primary/60">Find answers to common questions about our services.</p>
      </div>
      <div className="space-y-4">
        {items.map((f) => {
          const isOpen = openId === f.id
          return (
            <div
              key={f.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : (f.id as string | number))}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-accent-gold text-xl shrink-0 mt-0.5">
                    help
                  </span>
                  <span className="font-semibold text-primary text-sm md:text-base">
                    {f.question ?? '—'}
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-primary/60 text-xl shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  expand_more
                </span>
              </button>
              <div
                className={`px-6 pb-4 pt-0 overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-primary/70 pl-9 text-sm leading-relaxed">
                  {f.answer ?? '—'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
