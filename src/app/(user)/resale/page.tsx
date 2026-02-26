'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useCompare } from '@/contexts/CompareContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import {
  formatPrice,
  formatLocation,
  getFirstImage,
  type PropertyWithMedia,
} from '@/lib/propertyApi'
import { toPropertySlug } from '@/lib/slug'
import { useResaleFilters } from '@/hooks/usePropertyFilters'
import Pagination, { DEFAULT_PAGE_SIZE } from '@/components/Pagination'

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5]

export default function ResalePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal() ?? {}
  const { addToCompare, removeFromCompare, properties: compareProps } = useCompare()
  const { filters, updateFilter, clearFilters, data: resales, loading, error, priceRange } = useResaleFilters()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.minPrice, filters.maxPrice, filters.bedrooms])

  const toggleCompare = (p: PropertyWithMedia) => {
    if (!user) {
      openAuthModal ? openAuthModal(pathname) : router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
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
        listingType: 'Resale',
      })
    }
  }

  return (
    <div className="luxe-landing min-h-screen bg-background-light dark:bg-background-dark text-primary font-display">
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-10 min-h-[calc(100vh-64px-4rem)]">
          {/* Sidebar Filters - stacked on mobile, sticky sidebar on lg+ */}
          <aside className="w-full lg:w-80 shrink-0 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] overflow-y-auto bg-white dark:bg-background-dark/50 rounded-xl shadow-sm border border-primary/10 p-6 space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-4">Price Range</h3>
            <div className="px-2 space-y-2">
              <div>
                <span className="text-xs text-primary/50">Min</span>
                <input
                  type="range"
                  min={priceRange.min}
                  max={Math.max(priceRange.max, priceRange.min + 1)}
                  value={filters.minPrice ?? priceRange.min}
                  onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
                  className="w-full h-1.5 bg-primary/10 rounded-full accent-accent-gold"
                />
              </div>
              <div>
                <span className="text-xs text-primary/50">Max</span>
                <input
                  type="range"
                  min={priceRange.min}
                  max={Math.max(priceRange.max, priceRange.min + 1)}
                  value={filters.maxPrice ?? priceRange.max}
                  onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                  className="w-full h-1.5 bg-primary/10 rounded-full accent-accent-gold"
                />
              </div>
              <div className="flex justify-between text-sm font-semibold text-primary">
                <span>{formatPrice(filters.minPrice ?? priceRange.min)}</span>
                <span>{formatPrice(filters.maxPrice ?? priceRange.max)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40">Bedrooms</h3>
            <div className="grid grid-cols-4 gap-2">
              {BEDROOM_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateFilter('bedrooms', filters.bedrooms === n ? null : n)}
                  className={`p-2 text-xs font-bold rounded-lg transition-all border ${
                    filters.bedrooms === n
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-primary/10 hover:bg-primary/5'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="w-full py-4 rounded-xl border-2 border-primary/10 text-primary font-bold text-sm hover:border-accent-gold hover:text-accent-gold transition-all"
          >
            Reset All Filters
          </button>
        </div>
      </aside>

          {/* Content Area */}
          <section className="flex-1 min-w-0 py-2 overflow-y-auto">
        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-2">Explore Resale Properties</h2>
            {/* <p className="text-primary/60 text-lg">Curated pre-owned luxury homes for the discerning eye.</p> */}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-primary/50">
              {loading ? 'Loading...' : `${resales.length} exclusive listings`}
            </p>
            <div className="h-6 w-px bg-primary/10" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">Sort by:</span>
              <select className="border-none bg-transparent focus:ring-0 text-sm font-bold text-accent-gold p-0 pr-6 cursor-pointer">
                <option>Price: High to Low</option>
                <option>Newest Listed</option>
                <option>Popularity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Property Grid - 2 cols desktop, wider cards */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="py-16 text-center text-primary/60 font-medium">Loading resale properties...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-32">
          {(resales.length > DEFAULT_PAGE_SIZE
            ? resales.slice((currentPage - 1) * DEFAULT_PAGE_SIZE, currentPage * DEFAULT_PAGE_SIZE)
            : resales
          ).map((p) => {
            const idStr = String(p.id)
            const beds = p.Bedrooms != null ? String(p.Bedrooms) : '—'
            const baths = p.Bathrooms != null ? String(p.Bathrooms) : '—'
            const sqft = p.square_feet != null ? p.square_feet.toLocaleString() : '—'
            const slug = toPropertySlug(p.title ?? null, Number(p.id))
            return (
            <Link
              key={p.id}
              href={`/property/${slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col block cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={p.title ?? 'Resale property'}
                  src={getFirstImage(p.media)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-2xl font-bold text-white tracking-tight">{formatPrice(p.price)}</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-primary group-hover:text-accent-gold transition-colors">{p.title ?? 'Untitled'}</h3>
                  <div className="flex items-center gap-1 text-primary/50 text-sm mt-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {formatLocation(p.location)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-primary/40 uppercase tracking-tighter">Bedrooms</span>
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <span className="material-symbols-outlined text-lg text-accent-gold">bed</span>
                      {beds}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-primary/40 uppercase tracking-tighter">Bathrooms</span>
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <span className="material-symbols-outlined text-lg text-accent-gold">bathtub</span>
                      {baths}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-primary/40 uppercase tracking-tighter">Sq Ft</span>
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <span className="material-symbols-outlined text-lg text-accent-gold">straighten</span>
                      {sqft}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <label
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={compareProps.some((x) => x.id === idStr)}
                      onChange={(e) => { e.stopPropagation(); toggleCompare(p); }}
                      className="rounded border-primary/20 text-accent-gold focus:ring-accent-gold"
                    />
                    <span className="text-xs font-bold text-primary/60 uppercase">Compare</span>
                  </label>
                  <span className="px-6 py-2.5 bg-primary/5 text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          )})}
        </div>
        )}
        <Pagination
          totalItems={resales.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={DEFAULT_PAGE_SIZE}
        />
      </section>
        </div>
      </div>
    </div>
  )
}
