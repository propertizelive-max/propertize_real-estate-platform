'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { fetchFeaturedVideos } from '@/lib/featuredVideosApi'
import { toPropertySlug } from '@/lib/slug'
import { formatPrice, formatLocation, getFirstImage, type ProjectWithUnits, fetchSearchMeta, type SearchMeta } from '@/lib/propertyApi'
import { useProjectFilters } from '@/hooks/usePropertyFilters'
import ServicesSection from '@/features/cms/components/user/ServicesSection'
import FaqSection from '@/features/cms/components/user/FaqSection'
import TestimonialsSection from '@/features/cms/components/user/TestimonialsSection'
import { fetchHeroSection } from '@/features/cms/services/cmsApi'
import type { HeroSection } from '@/features/cms/types'

function VideoCard({
  video,
}: {
  video: { id: number; property_id: number; file_url: string; thumbnail_url: string | null }
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const slug = String(video.property_id)
  return (
    <Link
      href={`/property/${slug}`}
      className="relative group h-[450px] overflow-hidden rounded-xl block"
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => {
        ref.current?.pause()
        ref.current && (ref.current.currentTime = 0)
      }}
    >
      <video
        ref={ref}
        src={video.file_url}
        poster={video.thumbnail_url ?? undefined}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="material-symbols-outlined text-white text-6xl">play_circle</span>
      </div>
    </Link>
  )
}

export default function Home() {
  const [featuredVideos, setFeaturedVideos] = useState<{ id: number; property_id: number; file_url: string; thumbnail_url: string | null }[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [searchMeta, setSearchMeta] = useState<SearchMeta | null>(null)
  const [searchMetaLoading, setSearchMetaLoading] = useState(true)
  const [hero, setHero] = useState<HeroSection | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<string>('')
  const { data: projects = [], loading: projectsLoading, error: projectsError } = useProjectFilters()

  useEffect(() => {
    fetchFeaturedVideos()
      .then(setFeaturedVideos)
      .catch(() => setFeaturedVideos([]))
      .finally(() => setVideosLoading(false))
  }, [])

  useEffect(() => {
    fetchSearchMeta()
      .then(setSearchMeta)
      .catch(() => setSearchMeta(null))
      .finally(() => setSearchMetaLoading(false))
  }, [])

  useEffect(() => {
    fetchHeroSection()
      .then(setHero)
      .catch(() => setHero(null))
  }, [])

  const selectedListingType = useMemo<'Project' | 'Rent' | 'Resale' | null>(() => {
    if (!searchMeta || !selectedPropertyTypeId) return null
    const t = searchMeta.propertyTypes.find((pt) => String(pt.id) === selectedPropertyTypeId)
    if (!t) return null
    const name = t.name.toLowerCase()
    if (name.includes('project')) return 'Project'
    if (name.includes('rent')) return 'Rent'
    if (name.includes('resale')) return 'Resale'
    return null
  }, [searchMeta, selectedPropertyTypeId])

  const randomProjects = useMemo<ProjectWithUnits[]>(() => {
    if (!projects.length) return []
    const copy = [...projects]
    // Simple random shuffle, then take first 3 projects
    copy.sort(() => Math.random() - 0.5)
    return copy.slice(0, 3)
  }, [projects])

  const searchHref = useMemo(() => {
    const params = new URLSearchParams()
    // Use city text for the global search term (like manual search),
    // and pass listing type separately for filtering.
    const qTerm = selectedCity.trim()
    if (!qTerm && !selectedListingType) return '/search'
    if (qTerm) params.set('q', qTerm)
    if (selectedListingType) params.set('type', selectedListingType)
    const qs = params.toString()
    return qs ? `/search?${qs}` : '/search'
  }, [selectedCity, selectedListingType])

  return (
    <div className="luxe-landing min-h-screen bg-background-light dark:bg-background-dark text-primary font-display antialiased">
      <section className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {hero?.file_url && hero?.media_type === 'video' ? (
            <video
              className="w-full h-full object-cover"
              src={hero.file_url}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          ) : (
            <img
              className="w-full h-full object-cover"
              alt={hero?.title ?? 'Hero background'}
              src={
                hero?.file_url && hero?.media_type !== 'video'
                  ? hero.file_url
                  : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPF-DV3xCyT0V5AsbUHQhqbLmz1gFYSJiIADmYBIOK2H7qBIk1L5YHsfOBOhYoxLQ4hLpO9bVaPpvuwIyDy83awK7TpZd31KPNlf9F_4rhVeTzTjAWxJP_Fli9y2iiBP-WRd_XV187iMm7tGtvGXqd-Cwo5ccf0XwL7zCekry9hwakAGwXxndRxmh3vN25PyP6SGO1wCf0iCCSw4WKXnjRbARtSVSFBfbat7c1eb28m1lNIa9ItgxtqOQ1zqCMzl1OZYvWftNyL7il'
              }
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/60" />
        </div>
        <div className="relative z-10 w-full max-w-5xl px-6 text-center text-white">
          {hero?.logo_url && (
            <div className="mb-8 flex justify-center">
              <img src={hero.logo_url} alt="Logo" className="h-12 md:h-14 object-contain" />
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            {hero?.title ? (
              <>
                {hero.title.includes('\n')
                  ? hero.title.split('\n').map((line, i) => (
                      <span key={i}>
                        {i > 0 && <br />}
                        {i === 1 ? <span className="text-accent-gold">{line}</span> : line}
                      </span>
                    ))
                  : hero.title}
              </>
            ) : (
              <>
                Find Your Dream <br /><span className="text-accent-gold">Property Effortlessly</span>
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto opacity-90">
            {hero?.sub_title ?? "Access the world's most exclusive listings with our bespoke real estate services tailored for the discerning investor."}
          </p>
          <div className="glass-dark p-2 rounded-xl md:rounded-full shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-white/10">
              <span className="material-symbols-outlined text-accent-gold">location_on</span>
              <select
                className="bg-transparent border-none focus:ring-0 text-white/80 w-full appearance-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">
                  {searchMetaLoading ? 'Loading locations...' : 'Location'}
                </option>
                {searchMeta?.cities.map((city) => (
                  <option key={city} value={city} className="text-primary">
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-white/10">
              <span className="material-symbols-outlined text-accent-gold">payments</span>
              <select
                className="bg-transparent border-none focus:ring-0 text-white/80 w-full appearance-none disabled:text-white/40"
                value={selectedListingType ?? ''}
                disabled={!selectedListingType || !searchMeta}
              >
                <option value="" disabled>
                  {!selectedListingType || !searchMeta
                    ? 'Select Property Type first'
                    : `${formatPrice(searchMeta.priceRanges[selectedListingType].min)} - ${formatPrice(
                        searchMeta.priceRanges[selectedListingType].max,
                      )}`}
                </option>
              </select>
            </div>
            <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full">
              <span className="material-symbols-outlined text-accent-gold">home_work</span>
              <select
                className="bg-transparent border-none focus:ring-0 text-white/80 w-full appearance-none"
                value={selectedPropertyTypeId}
                onChange={(e) => setSelectedPropertyTypeId(e.target.value)}
              >
                <option value="">
                  {searchMetaLoading ? 'Property Type' : 'Select Property Type'}
                </option>
                {searchMeta?.propertyTypes.map((t) => (
                  <option key={t.id} value={String(t.id)} className="text-primary">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href={searchHref}
              className="w-full md:w-auto bg-accent-gold hover:bg-accent-gold/90 text-primary font-bold px-8 py-4 rounded-full transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-primary">search</span>
              <span className="text-primary">Search</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-10 max-w-7xl mx-auto px-6">
        <div className="bg-primary text-white rounded-xl py-10 px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 shadow-2xl border border-accent-gold/20">
          <div className="text-center">
            <div className="text-4xl font-black text-accent-gold mb-1">$2.4B+</div>
            <div className="text-xs uppercase tracking-widest font-semibold opacity-70">Total Sales Volume</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className="text-4xl font-black text-accent-gold mb-1">850+</div>
            <div className="text-xs uppercase tracking-widest font-semibold opacity-70">Exclusive Listings</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className="text-4xl font-black text-accent-gold mb-1">15+</div>
            <div className="text-xs uppercase tracking-widest font-semibold opacity-70">Countries Served</div>
          </div>
          <div className="text-center border-l border-white/10">
            <div className="text-4xl font-black text-accent-gold mb-1">98%</div>
            <div className="text-xs uppercase tracking-widest font-semibold opacity-70">Client Retention</div>
          </div>
        </div>
      </div>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <h2 className="text-primary text-4xl font-black tracking-tight">New Projects</h2>
            <p className="text-primary/60 mt-2">Explore our latest property videos.</p>
          </div>
          <Link href="/projects" className="text-accent-gold font-bold flex items-center gap-2 hover:underline">
            View All Projects <span className="material-symbols-outlined">arrow_right_alt</span>
          </Link>
        </div>
        {videosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[450px] rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : featuredVideos.length === 0 ? (
          <div className="h-[300px] rounded-xl bg-gray-100 flex items-center justify-center text-primary/60">
            No featured videos yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-16 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-white text-4xl font-black mb-4">New Projects</h2>
            <p className="text-white/60">Handpicked luxury developments, shown in random order every time.</p>
          </div>
          <Link href="/projects" className="text-accent-gold font-bold flex items-center gap-2 hover:underline">
            View All Projects <span className="material-symbols-outlined">arrow_right_alt</span>
          </Link>
        </div>
        {projectsLoading ? (
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth px-6 lg:px-[max(1.5rem,calc((100vw-1280px)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[350px] md:min-w-[450px] h-[320px] rounded-xl bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : projectsError || !randomProjects.length ? (
          <div className="max-w-7xl mx-auto h-[200px] rounded-xl bg-primary/80 border border-white/10 flex items-center justify-center text-white/70">
            {projectsError ? 'Unable to load projects right now. Please try again later.' : 'No projects available yet. Check back soon!'}
          </div>
        ) : (
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth px-6 lg:px-[max(1.5rem,calc((100vw-1280px)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {randomProjects.map((project) => {
              const slug = toPropertySlug(project.title ?? 'project', project.id)
              const image = getFirstImage(project.media)
              const priceStr = formatPrice(project.price)
              return (
                <Link
                  key={project.id}
                  href={`/property/${slug}`}
                  className="min-w-[350px] md:min-w-[450px] snap-center bg-white/5 border border-white/10 rounded-xl overflow-hidden group flex-shrink-0 block"
                >
                  <div className="relative h-[300px]">
                    <img className="w-full h-full object-cover" alt={project.title ?? 'Project'} src={image} />
                    {priceStr && (
                      <div className="absolute bottom-4 right-4 glass px-4 py-1 rounded-lg text-primary font-black">
                        {priceStr}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">{project.title ?? 'Untitled Project'}</h3>
                    <p className="text-white/50 text-sm mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {formatLocation(project.location)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <ServicesSection />

      <TestimonialsSection />

      <FaqSection />
    </div>
  )
}
