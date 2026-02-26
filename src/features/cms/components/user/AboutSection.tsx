'use client'

import { useState, useEffect } from 'react'
import { fetchSiteSections } from '../../services/cmsApi'
import type { SiteSection } from '../../types'

const SECTION_KEYS = ['about_company', 'company_vision', 'company_mission'] as const

export default function AboutSection() {
  const [sections, setSections] = useState<SiteSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSiteSections(true)
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || sections.length === 0) return null

  const byKey = Object.fromEntries(sections.map((s) => [s.section_key, s]))
  const ordered = SECTION_KEYS.map((k) => byKey[k]).filter(Boolean)

  if (ordered.length === 0) return null

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="space-y-16">
        {ordered.map((sec) => (
          <div
            key={sec.id}
            className="rounded-2xl shadow-md bg-white p-6 md:p-8"
          >
            {sec.title && (
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{sec.title}</h2>
            )}
            {sec.subtitle && (
              <p className="text-lg text-gray-600 mb-4">{sec.subtitle}</p>
            )}
            {sec.description && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{sec.description}</p>
            )}
            {sec.image_url && (
              <img
                src={sec.image_url}
                alt={sec.title ?? 'Section'}
                className="mt-6 rounded-xl w-full max-h-80 object-cover"
              />
            )}
            {sec.button_text && sec.button_link && (
              <a
                href={sec.button_link}
                className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                {sec.button_text}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
