'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCompare } from '@/contexts/CompareContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import {
  searchProperties,
  searchPropertiesByCity,
  formatPrice,
  formatLocation,
  getFirstImage,
  type PropertyWithMedia,
} from '@/lib/propertyApi'
import { toPropertySlug } from '@/lib/slug'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const q = searchParams.get('q') ?? ''
  const typeParam = (searchParams.get('type') ?? '').toLowerCase()
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal() ?? {}
  const { addToCompare, removeFromCompare, properties: compareProps } = useCompare()

  const [results, setResults] = useState<PropertyWithMedia[]>([])
  const [loading, setLoading] = useState(!q ? false : true)

  useEffect(() => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const primary = await searchProperties(trimmed)
      let data = primary
      if (!cancelled && primary.length === 0) {
        // Fallback: try city-only search so rentals in that city still show.
        const byCity = await searchPropertiesByCity(trimmed)
        data = byCity
      }
      if (!cancelled) {
        const filtered =
          typeParam && ['project', 'rent', 'resale'].includes(typeParam)
            ? data.filter(
                (p) => (p.listing_type ?? '').toLowerCase() === typeParam
              )
            : data
        setResults(filtered)
      }
    })()
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
      return () => {
        cancelled = true
      }
  }, [q, typeParam])

  const toggleCompare = (p: PropertyWithMedia) => {
    if (!user) {
      openAuthModal?.(pathname)
      return
    }
    const idStr = String(p.id)
    const isSelected = compareProps.some((x) => x.id === idStr)
    if (isSelected) {
      removeFromCompare(idStr)
    } else {
      addToCompare({
        id: idStr,
        title: p.title ?? 'Untitled',
        price: formatPrice(p.price),
        image: getFirstImage(p.media),
        location: formatLocation(p.location),
        beds: p.Bedrooms != null ? String(p.Bedrooms) : undefined,
        baths: p.Bathrooms != null ? String(p.Bathrooms) : undefined,
        sqft: p.square_feet != null ? String(p.square_feet) : undefined,
        listingType: (p.listing_type ?? 'Property') as 'Rent' | 'Resale' | 'Project',
      })
    }
  }

  return (
    <div className="luxe-landing min-h-screen bg-background-light dark:bg-background-dark text-primary font-display">
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {q ? `Search results for "${q}"` : 'Search'}
        </h1>

        {loading ? (
          <p className="text-gray-500">Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500">
            {q ? 'No properties found. Try a different search term.' : 'Enter a search term to find properties.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
            {results.map((p) => {
              const idStr = String(p.id)
              const beds = p.Bedrooms != null ? `${p.Bedrooms} Beds` : '—'
              const baths = p.Bathrooms != null ? `${p.Bathrooms} Baths` : '—'
              const area = p.square_feet != null ? `${p.square_feet.toLocaleString()} sqft` : '—'
              const slug = toPropertySlug(p.title ?? null, Number(p.id))
              return (
                <Link
                  key={p.id}
                  href={`/property/${slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col block cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={getFirstImage(p.media)}
                      alt={p.title ?? 'Property'}
                    />
                    <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md text-white px-4 py-2 rounded-lg">
                      <p className="text-xl font-bold">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary group-hover:text-accent-gold transition-colors">
                          {p.title ?? 'Untitled'}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {formatLocation(p.location)}
                        </p>
                      </div>
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => e.preventDefault()}
                      >
                        <input
                          type="checkbox"
                          checked={compareProps.some((x) => x.id === idStr)}
                          onChange={(e) => { e.preventDefault(); toggleCompare(p); }}
                          className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold"
                        />
                        <span className="text-xs font-bold text-gray-400 uppercase">Compare</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-50">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase">Beds</p>
                        <p className="text-sm font-bold text-primary">{beds}</p>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase">Baths</p>
                        <p className="text-sm font-bold text-primary">{baths}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase">Area</p>
                        <p className="text-sm font-bold text-primary">{area}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="luxe-landing min-h-screen bg-background-light dark:bg-background-dark text-primary font-display flex items-center justify-center">
        <p className="text-gray-500">Loading search...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
