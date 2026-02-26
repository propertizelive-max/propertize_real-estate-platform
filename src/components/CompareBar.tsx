'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCompare } from '@/contexts/CompareContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { saveCompression } from '@/lib/compressionApi'

const LABELS: Record<string, string> = {
  Project: 'Project',
  Rent: 'Rental',
  Resale: 'Property',
}

export default function CompareBar() {
  const router = useRouter()
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal() ?? {}
  const { properties, removeFromCompare, clearCompare } = useCompare()
  const [saving, setSaving] = useState(false)

  if (properties.length === 0) return null

  const label = LABELS[properties[0]?.listingType ?? 'Property'] ?? 'Property'
  const labelPlural = properties.length !== 1 ? `${label}s` : label

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
      <div className="navy-glass rounded-2xl p-4 shadow-2xl flex items-center justify-between text-white flex-wrap gap-4 outline-none">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest">Compare</span>
            <span className="text-sm font-medium">
              {properties.length} {labelPlural} Selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            {properties.map((p) => (
              <div key={p.id} className="relative group">
                <div
                  className="w-12 h-12 rounded-lg bg-cover bg-center border border-white/20"
                  style={{ backgroundImage: `url('${p.image}')` }}
                  role="img"
                  aria-label={p.title}
                />
                <button
                  type="button"
                  onClick={() => removeFromCompare(p.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] hover:scale-110 transition-transform text-white font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 3 - properties.length) }, (_, i) => (
              <div
                key={`empty-${i}`}
                className="w-12 h-12 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-white/20"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs font-bold text-gray-300 hover:text-white transition-colors uppercase tracking-widest outline-none focus:outline-none focus:ring-0"
          >
            Clear All
          </button>
          <button
            type="button"
            disabled={saving || properties.length < 2}
            onClick={async () => {
              if (properties.length < 2) return
              if (!user) {
                openAuthModal ? openAuthModal(window.location.pathname || '/compare') : router.push(`/login?redirect=${encodeURIComponent(window.location.pathname || '/compare')}`)
                return
              }
              setSaving(true)
              const { error } = await saveCompression(properties)
              setSaving(false)
              if (error) {
                alert('Could not save comparison: ' + error.message)
                return
              }
              router.push('/compare')
            }}
            className="gold-gradient text-primary px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-accent-gold/20 transition-all outline-none focus:outline-none focus:ring-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Comparing...' : 'Compare Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
