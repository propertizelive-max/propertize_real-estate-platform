import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useCompare } from '../contexts/CompareContext'
import { useAuth } from '../contexts/AuthContext'
import { useAuthModal } from '../contexts/AuthModalContext'
import {
  formatPrice,
  formatLocation,
  getFirstImage,
  type ProjectWithUnits,
} from '../lib/propertyApi'
import { useProjectFilters, PROJECT_STATUS_OPTIONS } from '../hooks/usePropertyFilters'
import type { ProjectStatusFilter } from '../lib/propertyApi'

const AMENITY_ICON_MAP: Record<string, string> = {
  pool: 'pool',
  fitness: 'fitness_center',
  gym: 'fitness_center',
  spa: 'spa',
  parking: 'directions_car',
  concierge: 'person',
  smart: 'home_iot_device',
  helicopter: 'flight',
  wine: 'wine_bar',
}

function getAmenityIcons(amenityNames: string[]): string[] {
  const icons: string[] = []
  for (const name of amenityNames.slice(0, 3)) {
    const key = name.toLowerCase().replace(/\s+/g, '')
    const icon = AMENITY_ICON_MAP[key] ?? Object.entries(AMENITY_ICON_MAP).find(([k]) => key.includes(k))?.[1] ?? 'star'
    icons.push(icon)
  }
  return icons.length ? icons : ['home']
}

function deriveProjectDisplay(p: ProjectWithUnits & { amenities?: { name: string }[] }) {
  const units = p.units ?? []
  const beds = [...new Set(units.map((u) => u.bedrooms).filter((b): b is number => b != null))].sort((a, b) => a - b)
  const bhk = beds.length ? beds.join(', ') : p.Bedrooms != null ? String(p.Bedrooms) : '—'
  const minSqft = units.length ? Math.min(...units.map((u) => u.square_feet ?? Infinity).filter((s) => s !== Infinity)) : p.square_feet
  const area = minSqft != null && minSqft !== Infinity ? (minSqft >= 1000 ? `${(minSqft / 1000).toFixed(0)},000+` : `${minSqft}+`) : (p.square_feet != null ? `${p.square_feet}+` : '—')
  const possession = p.year_built ? `Ready ${p.year_built}` : 'TBA'
  const amenityNames = (p as { amenities?: { name: string }[] }).amenities?.map((a) => a.name) ?? []
  const amenityIcons = getAmenityIcons(amenityNames)
  const moreCount = Math.max(0, amenityNames.length - amenityIcons.length)
  const minPrice = units.length ? Math.min(...units.map((u) => u.price ?? Infinity).filter((pr) => pr != null && pr !== Infinity)) : p.price
  const priceStr = formatPrice(minPrice)
  return { bhk, area, possession, amenityIcons, moreCount, priceStr }
}

export default function Projects() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal() ?? {}
  const { addToCompare, removeFromCompare, properties: compareProps } = useCompare()
  const { filters, updateFilter, clearFilters, data: projects, loading, error, priceRange: priceRangeMeta } = useProjectFilters()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleCompare = (project: ProjectWithUnits) => {
    if (!user) {
      openAuthModal ? openAuthModal(location.pathname) : navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }
    const idStr = String(project.id)
    const isSelected = compareProps.some((p) => p.id === idStr)
    if (isSelected) {
      removeFromCompare(idStr)
    } else {
      const display = deriveProjectDisplay(project)
      addToCompare({
        id: idStr,
        title: project.title ?? 'Untitled',
        price: display.priceStr,
        image: getFirstImage(project.media),
        location: formatLocation(project.location),
        sqft: display.area,
        beds: display.bhk,
        listingType: 'Project',
      })
    }
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="luxe-landing min-h-screen bg-background-light dark:bg-background-dark text-primary font-display">
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-10 min-h-[calc(100vh-64px-4rem)]">
          {/* Sidebar Filter - 320px fixed, sticky, visible on lg+ */}
          <aside className="w-80 shrink-0 hidden lg:block">
            <div className="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Filters</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-primary">Project Status</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PROJECT_STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-accent-gold transition-all group"
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                        <input
                          type="radio"
                          name="status"
                          checked={filters.projectStatus === opt.value}
                          onChange={() => updateFilter('projectStatus', opt.value as ProjectStatusFilter)}
                          className="text-primary focus:ring-accent-gold rounded-full"
                        />
                      </label>
                    ))}
                    <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-accent-gold transition-all group">
                      <span className="text-sm font-medium">All</span>
                      <input
                        type="radio"
                        name="status"
                        checked={filters.projectStatus === null}
                        onChange={() => updateFilter('projectStatus', null)}
                        className="text-primary focus:ring-accent-gold rounded-full"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-primary block mb-4">Price Range (Starting from)</label>
              <div className="px-2">
                <input
                  type="range"
                  min={priceRangeMeta.min}
                  max={Math.max(priceRangeMeta.max, priceRangeMeta.min + 1)}
                  value={filters.minPrice ?? priceRangeMeta.min}
                  onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-3 text-xs font-bold text-gray-500">
                  <span>{formatPrice(priceRangeMeta.min)}</span>
                  <span>{formatPrice(priceRangeMeta.max)}+</span>
                </div>
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
          <main className="flex-1 min-w-0 py-2 pb-32">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-accent-gold">New Projects</span>
              </nav>
              <h1 className="text-4xl font-bold text-primary mb-2">Explore New Projects</h1>
              <p className="text-gray-500 font-medium">
                {loading ? 'Loading...' : error ? '' : `${projects.length} upcoming luxury developments across the globe.`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Sort by:</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent cursor-pointer w-full min-w-[180px]">
                  <option>Price: High to Low</option>
                  <option>Price: Low to High</option>
                  <option>Newest Launch</option>
                  <option>Possession Date</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          {/* Property Grid - 3 cols desktop, taller aspect 3/4 image */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-16 text-center text-gray-500 font-medium">Loading projects...</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const idStr = String(project.id)
              const display = deriveProjectDisplay(project)
              const badges = 'status' in project && project.status ? [String(project.status)] : ['New Launch']
              return (
              <Link
                key={project.id}
                to={`/property/${project.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col block cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    alt={project.title ?? 'Project'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={getFirstImage(project.media)}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {badges.map((badge) => (
                      <span
                        key={badge}
                        className={
                          badge === 'New Launch' || badge === 'Selling Fast'
                            ? 'gold-gradient text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg'
                            : 'bg-primary text-accent-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg'
                        }
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2" onClick={(e) => e.preventDefault()}>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(idStr); }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all flex items-center justify-center"
                    >
                      <span className={`material-symbols-outlined ${favorites.has(idStr) ? 'fill' : ''}`}>
                        favorite
                      </span>
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md text-white px-4 py-2 rounded-lg">
                    <p className="text-[10px] font-bold text-accent-gold uppercase tracking-widest">Starting from</p>
                    <p className="text-xl font-bold">{display.priceStr}</p>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary group-hover:text-accent-gold transition-colors">
                        {project.title ?? 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {formatLocation(project.location)}
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
                        onChange={(e) => { e.stopPropagation(); toggleCompare(project); }}
                        className="w-4 h-4 rounded text-accent-gold focus:ring-accent-gold"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-50 mb-6">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">BHK Type</p>
                      <p className="text-sm font-bold text-primary">{display.bhk}</p>
                    </div>
                    <div className="text-center border-x border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Area (SqFt)</p>
                      <p className="text-sm font-bold text-primary">{display.area}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Possession</p>
                      <p className="text-sm font-bold text-primary">{display.possession}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                      {display.amenityIcons.map((icon) => (
                        <div
                          key={icon}
                          className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center text-white ring-2 ring-white"
                        >
                          <span className="material-symbols-outlined text-xs">{icon}</span>
                        </div>
                      ))}
                      {display.moreCount > 0 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 ring-2 ring-white text-[10px] font-bold">
                          +{display.moreCount}
                        </div>
                      )}
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

          {/* Pagination */}
          <div className="flex justify-center mt-16">
            <nav className="flex items-center gap-2">
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-accent-gold hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-sm"
              >
                1
              </button>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-accent-gold hover:text-primary font-bold text-sm transition-all"
              >
                2
              </button>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-accent-gold hover:text-primary font-bold text-sm transition-all"
              >
                3
              </button>
              <span className="px-2 text-gray-400">...</span>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-accent-gold hover:text-primary font-bold text-sm transition-all"
              >
                12
              </button>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-accent-gold hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </main>
        </div>
      </div>
    </div>
  )
}
