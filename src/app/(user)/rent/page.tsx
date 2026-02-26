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
import { useRentFilters } from '@/hooks/usePropertyFilters'
import Pagination, { DEFAULT_PAGE_SIZE } from '@/components/Pagination'

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5]

export default function RentPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal() ?? {}
  const { addToCompare, removeFromCompare, properties: compareProps } = useCompare()
  const { filters, updateFilter, clearFilters, data: rentals, loading, error, priceRange } = useRentFilters()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.minPrice, filters.maxPrice, filters.bedrooms])

  const toggleCompare = (r: PropertyWithMedia) => {
    if (!user) {
      openAuthModal ? openAuthModal(pathname) : router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    const idStr = String(r.id)
    const isSelected = compareProps.some((p) => p.id === idStr)
    if (isSelected) {
      removeFromCompare(idStr)
    } else {
      addToCompare({
        id: idStr,
        title: r.title ?? 'Untitled',
        price: formatPrice(r.price),
        image: getFirstImage(r.media),
        location: formatLocation(r.location),
        beds: r.Bedrooms != null ? String(r.Bedrooms) : undefined,
        baths: r.Bathrooms != null ? String(r.Bathrooms) : undefined,
        sqft: r.square_feet != null ? String(r.square_feet) : undefined,
        listingType: 'Rent',
      })
    }
  }

  return (
    <div className="luxe-landing min-h-screen bg-background-light dark:bg-background-dark text-primary font-display">
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-10 min-h-[calc(100vh-64px-4rem)]">
          {/* Sidebar Filters - stacked on mobile, sticky sidebar on lg+ */}
          <aside className="w-full lg:w-80 shrink-0 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Filters</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-primary">Price Range (Monthly)</label>
                  <div className="px-2 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Min</span>
                      <input
                        type="range"
                        min={priceRange.min}
                        max={Math.max(priceRange.max, priceRange.min + 1)}
                        value={filters.minPrice ?? priceRange.min}
                        onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Max</span>
                      <input
                        type="range"
                        min={priceRange.min}
                        max={Math.max(priceRange.max, priceRange.min + 1)}
                        value={filters.maxPrice ?? priceRange.max}
                        onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>{formatPrice(filters.minPrice ?? priceRange.min)}</span>
                      <span>{formatPrice(filters.maxPrice ?? priceRange.max)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-primary block mb-3">Bedrooms</label>
              <div className="grid grid-cols-4 gap-2">
                {BEDROOM_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => updateFilter('bedrooms', filters.bedrooms === n ? null : n)}
                    className={`p-2 border rounded-lg text-sm font-bold transition-all ${
                      filters.bedrooms === n
                        ? 'border-accent-gold bg-primary text-white'
                        : 'border-gray-200 text-gray-600 hover:border-accent-gold'
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
              className="w-full py-3 bg-gray-100 text-primary font-bold rounded-xl hover:bg-gray-200 transition-all text-sm uppercase tracking-wide"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 py-2 pb-32 overflow-x-hidden">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                <Link href="/" className="hover:text-primary">Home</Link>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span>Rentals</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-accent-gold">Villas</span>
              </nav>
              <h1 className="text-4xl font-bold text-primary mb-2">Explore Rentals</h1>
              <p className="text-gray-500 font-medium">
                {loading ? 'Loading...' : error ? '' : `${rentals.length} premium properties found for your perfect stay.`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Sort by:</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent cursor-pointer w-full min-w-[180px]">
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          {/* Property Grid - 3 cols desktop, aspect 4/3 image */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-16 text-center text-gray-500 font-medium">Loading rentals...</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(rentals.length > DEFAULT_PAGE_SIZE
              ? rentals.slice((currentPage - 1) * DEFAULT_PAGE_SIZE, currentPage * DEFAULT_PAGE_SIZE)
              : rentals
            ).map((r) => {
              const idStr = String(r.id)
              const beds = r.Bedrooms != null ? `${r.Bedrooms} Beds` : '—'
              const baths = r.Bathrooms != null ? `${r.Bathrooms} Baths` : '—'
              const area = r.square_feet != null ? `${r.square_feet.toLocaleString()} sqft` : '—'
              const slug = toPropertySlug(r.title ?? null, Number(r.id))
              return (
              <Link
                key={r.id}
                href={`/property/${slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col block cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={getFirstImage(r.media)}
                    alt={r.title ?? 'Rental'}
                  />
                  <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md text-white px-4 py-2 rounded-lg">
                    <p className="text-[10px] font-bold text-accent-gold uppercase tracking-widest">From</p>
                    <p className="text-xl font-bold">{formatPrice(r.price)}<span className="text-xs font-normal opacity-70">/mo</span></p>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary group-hover:text-accent-gold transition-colors">{r.title ?? 'Untitled'}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {formatLocation(r.location)}
                      </p>
                    </div>
                    <label
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compare</span>
                      <input
                        type="checkbox"
                        checked={compareProps.some((p) => p.id === idStr)}
                        onChange={(e) => { e.stopPropagation(); toggleCompare(r); }}
                        className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-50 mb-6">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Beds</p>
                      <p className="text-sm font-bold text-primary">{beds}</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Baths</p>
                      <p className="text-sm font-bold text-primary">{baths}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Area</p>
                      <p className="text-sm font-bold text-primary">{area}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-accent-gold">
                      <span className="material-symbols-outlined text-sm filled-icon">star</span>
                      <span className="text-xs font-bold ml-1">4.9</span>
                    </div>
                    <span className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-gold hover:text-primary transition-all duration-300 inline-block text-center">
                      VIEW DETAILS
                    </span>
                  </div>
                </div>
              </Link>
            )})}
          </div>
          )}
          <Pagination
            totalItems={rentals.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={DEFAULT_PAGE_SIZE}
          />
        </main>
        </div>
      </div>
    </div>
  )
}
