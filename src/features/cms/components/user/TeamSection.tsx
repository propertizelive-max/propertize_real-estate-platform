'use client'

import { useState, useEffect } from 'react'
import { fetchTeamMembers } from '../../services/cmsApi'
import type { TeamMember } from '../../types'

export default function TeamSection() {
  const [items, setItems] = useState<TeamMember[]>([])

  useEffect(() => {
    fetchTeamMembers()
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 overflow-hidden mb-4">
                {t.image_url ? (
                  <img src={t.image_url} alt={t.name ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">?</div>
                )}
              </div>
              <h3 className="font-bold text-gray-900">{t.name ?? '-'}</h3>
              <p className="text-sm text-primary">{t.role ?? ''}</p>
              {t.experience_years != null && <p className="text-xs text-gray-500 mt-1">{t.experience_years} years</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
