'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  formatPrice,
  formatLocation,
  getFirstImage,
  type PropertyWithDetails,
  type PropertyWithMedia,
  type PropertyUnitRow,
} from '@/lib/propertyApi'
import { toPropertySlug } from '@/lib/slug'

const AMENITY_ICON_MAP: Record<string, string> = {
  pool: 'pool', fitness: 'fitness_center', gym: 'fitness_center', spa: 'spa', parking: 'directions_car',
  smart: 'home_iot_device', wine: 'wine_bar', theater: 'theaters', cinema: 'theaters', garage: 'directions_car',
}

function amenityIcon(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, '')
  return AMENITY_ICON_MAP[key] ?? Object.entries(AMENITY_ICON_MAP).find(([k]) => key.includes(k))?.[1] ?? 'star'
}

function AvailableConfigurations({ units }: { units: PropertyUnitRow[] }) {
  const byBhk = units.reduce<Record<number, PropertyUnitRow[]>>((acc, u) => {
    const beds = u.bedrooms ?? 0
    if (!acc[beds]) acc[beds] = []
    acc[beds].push(u)
    return acc
  }, {})
  const bhkTabs = Object.keys(byBhk).map(Number).filter((n) => n > 0).sort((a, b) => a - b)
  const [activeBhk, setActiveBhk] = useState(bhkTabs[0] ?? 0)
  const activeUnits = byBhk[activeBhk] ?? []
  const representative = activeUnits[0]
  const minPrice = activeUnits.length ? Math.min(...activeUnits.map((u) => u.price ?? Infinity).filter((p) => p !== Infinity)) : null
  const minSqft = activeUnits.length ? Math.min(...activeUnits.map((u) => u.square_feet ?? Infinity).filter((s) => s !== Infinity)) : null
  const baths = representative?.bathrooms ?? '—'
  if (bhkTabs.length === 0) return null
  return (
    <section>
      <h3 className="text-2xl font-bold text-primary mb-6">Available Configurations</h3>
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {bhkTabs.map((bhk) => (
          <button key={bhk} type="button" onClick={() => setActiveBhk(bhk)} className={`pb-3 font-bold text-sm transition-colors border-b-2 -mb-px ${activeBhk === bhk ? 'text-accent-gold border-accent-gold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            {bhk} BHK
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">straighten</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Carpet Area</p>
              <p className="text-lg font-bold text-primary">{minSqft != null && minSqft !== Infinity ? `${minSqft.toLocaleString()} sq.ft.` : '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Price</p>
              <p className="text-lg font-bold text-primary">{formatPrice(minPrice)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">bathtub</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Bathrooms</p>
              <p className="text-lg font-bold text-primary">{baths !== '—' ? `${baths} Bath${Number(baths) !== 1 ? 's' : ''}` : baths}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function PropertyDetailContent({
  property,
  similar,
}: {
  property: PropertyWithDetails
  similar: PropertyWithMedia[]
}) {
  const [selectedImage, setSelectedImage] = useState(0)
  const media = property?.media ?? []
  const mainImage = getFirstImage(media)
  const thumbnails = media.slice(1, 5)
  const loc = formatLocation(property.location)
  const locCity = property.location?.city ?? ''
  const slug = toPropertySlug(property.title, property.id)

  return (
    <div className="luxe-landing bg-background-light dark:bg-background-dark font-display text-slate-900 overflow-x-hidden min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium uppercase tracking-widest">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span>{locCity || 'Property'}</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">{property.title ?? 'Details'}</span>
            </nav>
            <h1 className="text-4xl font-bold text-primary mb-2">{property.title ?? 'Untitled'}</h1>
            <div className="flex items-center gap-4 text-slate-600">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">location_on</span>
                {loc || '—'}
              </span>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Listing Price</p>
            <p className="text-4xl font-bold text-primary">{formatPrice(property.price)}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-12">
          <div className="col-span-12 lg:col-span-9">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-luxury group">
              <Image
                className="object-cover"
                alt={property.title ?? 'Property'}
                src={selectedImage === 0 ? mainImage : thumbnails[selectedImage - 1]?.file_url ?? mainImage}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium">
                {selectedImage + 1} of {media.length || 1} Photos
              </div>
            </div>
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button type="button" onClick={() => setSelectedImage(0)} className={`min-w-[160px] h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === 0 ? 'border-accent-gold shadow-sm' : 'border-transparent hover:border-slate-300'}`}>
                <Image className="w-full h-full object-cover" alt="Main view" src={mainImage} width={160} height={96} />
              </button>
              {thumbnails.map((t, i) => (
                <button key={t.id} type="button" onClick={() => setSelectedImage(i + 1)} className={`min-w-[160px] h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === i + 1 ? 'border-accent-gold shadow-sm' : 'border-transparent hover:border-slate-300'}`}>
                  <Image className={`object-cover w-full h-full ${selectedImage !== i + 1 ? 'opacity-80 hover:opacity-100' : ''}`} alt="" src={t.file_url} width={160} height={96} />
                </button>
              ))}
              {media.length > 5 && (
                <div className="relative min-w-[160px] h-24 rounded-lg overflow-hidden border-2 border-transparent cursor-pointer flex-shrink-0">
                  <Image className="object-cover opacity-60" alt="More" src={thumbnails[thumbnails.length - 1]?.file_url ?? mainImage} fill sizes="160px" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold">+{media.length - 5}</div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-24 bg-white rounded-xl shadow-luxury border border-slate-100 p-6 flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">JUST LISTED</span>
                <p className="text-3xl font-bold text-primary mt-2">{formatPrice(property.price)}</p>
                <p className="text-slate-500 text-sm font-medium">Contact for pricing details</p>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <Image className="rounded-full border border-slate-200" alt="Agent" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpSLztKIpn1WsCSqYqJ8NtI9s6GPjx79AR8CvVFNfXP0ezL1mEFW5brzLiN5-LBUWsF72l2rq8FaQvm0uJ3G2pj2WsuBs90YAjt0MQQ1ucTiqsqLQ3XThw2fbyr3zxHY8occBGe8hF3oeOEWlvI1JUwsZvnidqrJXe9iBK24BHswRSGset168Hv5ceQL9yvywoQkSwkdPSti9eZN596Ahdreubcu9rYsJXtnyyLaYXd2fMoqoA785_adUDsAg0ZxPMnuFYmu4QnXJ5" width={48} height={48} />
                  <div>
                    <p className="font-bold text-primary text-sm">Sebastian Sterling</p>
                    <p className="text-xs text-slate-500">Global Luxury Specialist</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button type="button" className="w-full gold-gradient-detail text-primary font-bold py-3.5 rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xl">mail</span> CONTACT AGENT
                  </button>
                  <Link href={`/property/${slug}/appointment`} className="w-full border-2 border-primary text-primary font-bold py-3.5 rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xl">event_available</span> BOOK VISIT
                  </Link>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Exclusive Benefits</p>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-accent-gold text-base">verified</span> Certified Pre-Inspection</li>
                  <li className="flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-accent-gold text-base">local_shipping</span> VIP Relocation Package</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {property.listing_type !== 'Project' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: 'square_foot', value: property.square_feet != null ? property.square_feet.toLocaleString() : '—', label: 'Total Sq Ft' },
              { icon: 'bed', value: property.Bedrooms != null ? String(property.Bedrooms) : '—', label: 'Bedrooms' },
              { icon: 'bathtub', value: property.Bathrooms != null ? String(property.Bathrooms) : '—', label: 'Bathrooms' },
              { icon: 'directions_car', value: '—', label: 'Car Garage' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-primary text-3xl mb-2">{stat.icon}</span>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-9 gap-12">
          <div className="lg:col-span-6 space-y-16">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-accent-gold rounded-full" /> About
              </h2>
              <div className="text-slate-600 leading-relaxed text-lg font-light space-y-4">
                <p>{property.about_property || 'No description available.'}</p>
              </div>
            </section>

            {property.amenities?.length ? (
              <section>
                <h2 className="text-2xl font-bold text-primary mb-8">Amenities & Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {property.amenities.map((a) => (
                    <div key={a.id} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">{amenityIcon(a.name)}</span>
                      </div>
                      <div><h3 className="font-bold text-primary">{a.name}</h3></div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {property.listing_type === 'Project' && property.units?.length ? <AvailableConfigurations units={property.units} /> : null}

            <section className="bg-primary rounded-xl p-8 text-white shadow-luxury overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6">Mortgage Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium opacity-80 uppercase tracking-wider">Home Price</label>
                        <span className="text-sm font-bold">12,500,000</span>
                      </div>
                      <input className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-gold" type="range" defaultValue={100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium opacity-80 uppercase tracking-wider">Down Payment (20%)</label>
                        <span className="text-sm font-bold">2,500,000</span>
                      </div>
                      <input className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-gold" type="range" defaultValue={20} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium opacity-80 uppercase tracking-wider">Interest Rate (6.5%)</label>
                        <span className="text-sm font-bold">6.5%</span>
                      </div>
                      <input className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-gold" type="range" defaultValue={65} />
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6 border border-white/10 flex flex-col justify-center items-center">
                    <p className="text-xs font-bold opacity-60 uppercase mb-2">Estimated Monthly</p>
                    <p className="text-5xl font-bold text-accent-gold">65,420</p>
                    <p className="text-[10px] opacity-40 mt-4 text-center">Principal and interest only. Actual rates may vary by lender.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-6">Location & Neighborhood</h2>
              <div className="rounded-xl overflow-hidden shadow-sm h-96 relative border border-slate-200">
                <Image className="object-cover" alt="Location" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5mGQ_LWZfp7vBA1ScpZZWqy8qrA4iyDTTowUCpumHVolRg5Mpko1nnvsIspJP0f8v1vdrEMMzx0RdTi3YvASvEtHy2pbJthOKVPIT9zdtq6HGVw7k80XZggxJtT2fQGi15-nOONOJ68OAulYBd_tpMc0kMSGBbApGqE2rxcA2WBOGSOoIHjhULw00OP6LV0VWFzJmV3D2n9hwhLh1MABSIcjnnswmtrIVbmrToHImn8DdrwlV1MJMChDwZ_Bk4MBmaPKq_7Ab-R_e" fill />
                <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <span className="material-symbols-outlined text-accent-gold text-5xl drop-shadow-lg">location_on</span>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-primary px-3 py-1 rounded-full text-xs font-bold shadow-xl border border-slate-100">
                      {property.title ?? 'Property'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[
                  { label: 'Beaches', name: 'El Matador State', time: '2 min drive' },
                  { label: 'Dining', name: 'Nobu Malibu', time: '12 min drive' },
                  { label: 'Schools', name: 'Malibu High', time: '8 min drive' },
                ].map((loc) => (
                  <div key={loc.label} className="p-4 bg-white rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">{loc.label}</p>
                    <p className="text-sm font-bold text-primary">{loc.name}</p>
                    <p className="text-xs text-slate-500">{loc.time}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-24 pt-24 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-primary mb-10">Similar Exclusive Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similar.map((item) => (
                <Link key={item.id} href={`/property/${toPropertySlug(item.title, item.id)}`} className="group cursor-pointer block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 shadow-md transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                    <Image className="object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title ?? ''} src={getFirstImage(item.media)} fill sizes="(max-width: 768px) 100vw, 33vw" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">{item.location?.city ?? formatLocation(item.location)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-1">{item.title ?? 'Untitled'}</h3>
                    <p className="text-slate-500 text-sm mb-2">
                      {item.Bedrooms ?? '—'} Bed • {item.Bathrooms ?? '—'} Bath • {item.square_feet != null ? item.square_feet.toLocaleString() : '—'} sq ft
                    </p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-primary text-white mt-24 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/10 rounded-lg px-3 py-2 inline-flex">
                <Image src="/Propertize Logo-01.png" alt="Propertize - Live & Rise" className="h-14 w-auto object-contain" width={140} height={56} />
              </div>
            </div>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              The world&apos;s leading marketplace for high-end luxury real estate. Our concierge service ensures an unparalleled experience from search to keys.
            </p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-gold transition-colors" href="#"><span className="material-symbols-outlined text-lg">public</span></a>
              <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-gold transition-colors" href="#"><span className="material-symbols-outlined text-lg">share</span></a>
              <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-gold transition-colors" href="#"><span className="material-symbols-outlined text-lg">mail</span></a>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-accent-gold uppercase tracking-widest text-xs">Navigation</h3>
            <ul className="space-y-4 text-slate-300 text-sm">
              <li><Link href="/projects" className="hover:text-white transition-colors">Find a Property</Link></li>
              <li><a className="hover:text-white transition-colors" href="#">Sell Your Estate</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Luxury Concierge</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Real Estate News</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-accent-gold uppercase tracking-widest text-xs">Legal</h3>
            <ul className="space-y-4 text-slate-300 text-sm">
              <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Fair Housing</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 mt-16 border-t border-white/10 text-center">
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Propertize. All rights reserved. Equal Housing Opportunity.</p>
        </div>
      </footer>
    </div>
  )
}
