import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { fetchFeaturedVideos } from '../lib/featuredVideosApi'

function VideoCard({
  video,
}: {
  video: { id: number; property_id: number; file_url: string; thumbnail_url: string | null }
}) {
  const ref = useRef<HTMLVideoElement>(null)
  return (
    <Link
      to={`/property/${video.property_id}`}
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

  useEffect(() => {
    fetchFeaturedVideos()
      .then(setFeaturedVideos)
      .catch(() => setFeaturedVideos([]))
      .finally(() => setVideosLoading(false))
  }, [])

  const featuredProperties = [
    {
      id: '1',
      title: 'The Emerald Estate',
      location: "Bel Air, Los Angeles",
      price: '12,450,000',
      badge: 'New Listing',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHmMp4LMVN4kImS82wVRhwHTqWbZ3rPxGXpoI-NwEm6yCOFuoGso35oZNTmO0LA0BBzsSQipnfhr6RgiuckpP3sGhtRGjjbQe51Pb8nyqJdx3hw-aXV8a6uFJAcJvGcfGCdzDxnMsjwOHp-fM3UTdv3BppImiCFZYM3pZs-qP3amPAgorpqHj05qpBRmzhb7IzZezHgBftkJFMXNHPFNDBzJl8w47_jfhW2BfVjShnXLxHvutoe_KRDslXToFofM2B5R8WbVhVO4hr',
      alt: 'Luxury modern house with beautiful garden and pool',
      beds: 6,
      baths: 8,
      sqft: '12,500 SqFt',
    },
    {
      id: '2',
      title: 'Skyline Villa',
      location: "Cote d'Azur, France",
      price: '28,000,000',
      badge: 'Featured',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjyksuuJWSwEdMUFeZzXYaeEDDhP_IN5C4GGKCtETVV6rYRmk80iMWuRvx-l5gTi2KmZ6rxDKBmICmqxhwLObzSyBuOxJ0NRn35E1A-s2DjyZIDmxgG7dXcCEUGXz8VFjqy6Ec8U4UPHmgufycePSqW04wtiQxe9FSKDH4lG6ORO80H5cizjYHfATKo2I5Lu1ZmglS37Noi0cBAQ1tNIUquhBi9YB7LeTZC6tl9C48vRdCd4oVZWMXWYjCVDjzkuQizetfJSc6P87Z',
      alt: 'Grand luxury white mansion with columns and fountains',
      beds: 8,
      baths: 10,
      sqft: '18,200 SqFt',
    },
    {
      id: '3',
      title: 'Ocean Whisper',
      location: 'Palm Jumeirah, Dubai',
      price: '9,750,000',
      badge: 'Limited',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC6UyHRGSYUA2UEJbnbBXGHi-720fdyftB0uuWjh-N1UPHrM7q6DB4Ex9t6Yf6nxhTuWKU7R9dzjyhXlX0xvNa9bRmaqiOH1mvKKBlOeRz3HraNYs718zPg8PMSRn5tJQJroo7AMmgrVd5tSTeQCT78nl17c01GZroqOUUdWt_lj6Q_rwUzDQ1cu9cDG0ZhWz_zEuVjrYCS8hwgo4gjVsEx43QsV5tUW4s-MUMJK1x7w8Rapeojfx-24cLaWQBFQyRRkEiTGhEAX3d',
      alt: 'Contemporary glass and wood luxury home at night',
      beds: 5,
      baths: 6,
      sqft: '8,400 SqFt',
    },
  ]

  const advantages = [
    {
      id: 'global',
      icon: 'public',
      title: 'Global Reach',
      description: 'Connected to a worldwide network of luxury agents and off-market opportunities across 50+ countries.',
    },
    {
      id: 'discreet',
      icon: 'encrypted',
      title: 'Discreet Service',
      description: 'Confidentiality is our priority. We manage transactions for high-profile clients with absolute privacy.',
    },
    {
      id: 'expert',
      icon: 'verified',
      title: 'Expert Valuation',
      description: 'Our data-driven appraisal methods ensure you get the absolute best market value for your assets.',
    },
  ]

  return (
    <div className="luxe-landing min-h-screen bg-background-light dark:bg-background-dark text-primary font-display antialiased">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            alt="Stunning modern mansion with a infinity pool at sunset"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPF-DV3xCyT0V5AsbUHQhqbLmz1gFYSJiIADmYBIOK2H7qBIk1L5YHsfOBOhYoxLQ4hLpO9bVaPpvuwIyDy83awK7TpZd31KPNlf9F_4rhVeTzTjAWxJP_Fli9y2iiBP-WRd_XV187iMm7tGtvGXqd-Cwo5ccf0XwL7zCekry9hwakAGwXxndRxmh3vN25PyP6SGO1wCf0iCCSw4WKXnjRbARtSVSFBfbat7c1eb28m1lNIa9ItgxtqOQ1zqCMzl1OZYvWftNyL7il"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/60" />
        </div>
        <div className="relative z-10 w-full max-w-5xl px-6 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            Find Your Dream <br /><span className="text-accent-gold">Property Effortlessly</span>
          </h1>
          <p className="text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto opacity-90">
            Access the world&apos;s most exclusive listings with our bespoke real estate services tailored for the discerning investor.
          </p>
          {/* Search Bar */}
          <div className="glass-dark p-2 rounded-xl md:rounded-full shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-white/10">
              <span className="material-symbols-outlined text-accent-gold">location_on</span>
              <input className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/60 w-full" placeholder="Location" type="text" />
            </div>
            <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-white/10">
              <span className="material-symbols-outlined text-accent-gold">payments</span>
              <select className="bg-transparent border-none focus:ring-0 text-white/60 w-full appearance-none">
                <option>Price Range</option>
                <option>$1M - $5M</option>
                <option>$5M - $10M</option>
                <option>$10M+</option>
              </select>
            </div>
            <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full">
              <span className="material-symbols-outlined text-accent-gold">home_work</span>
              <select className="bg-transparent border-none focus:ring-0 text-white/60 w-full appearance-none">
                <option>Property Type</option>
                <option>Penthouse</option>
                <option>Villa</option>
                <option>Estate</option>
              </select>
            </div>
            <button type="button" className="w-full md:w-auto bg-accent-gold hover:bg-accent-gold/90 text-primary font-bold px-8 py-4 rounded-full transition-transform active:scale-95 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">search</span>
              <span>Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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

      {/* New Projects - Featured Videos */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <h2 className="text-primary text-4xl font-black tracking-tight">New Projects</h2>
            <p className="text-primary/60 mt-2">Explore our latest property videos.</p>
          </div>
          <Link to="/projects" className="text-accent-gold font-bold flex items-center gap-2 hover:underline">
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

      {/* Featured Properties Section */}
      <section className="bg-primary py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-white text-4xl font-black mb-4">Featured Properties</h2>
          <p className="text-white/60">Our curated selection of the most prestigious estates on the market.</p>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth px-6 lg:px-[max(1.5rem,calc((100vw-1280px)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredProperties.map((property) => (
            <Link key={property.id} to={`/property/${property.id}`} className="min-w-[350px] md:min-w-[450px] snap-center bg-white/5 border border-white/10 rounded-xl overflow-hidden group flex-shrink-0 block">
              <div className="relative h-[300px]">
                <img className="w-full h-full object-cover" alt={property.alt} src={property.image} />
                <div className="absolute top-4 left-4 bg-accent-gold text-primary font-bold px-4 py-1 rounded-full text-xs uppercase tracking-tighter">{property.badge}</div>
                <div className="absolute bottom-4 right-4 glass px-4 py-1 rounded-lg text-primary font-black">{property.price}</div>
              </div>
              <div className="p-6">
                <h3 className="text-white text-xl font-bold mb-2">{property.title}</h3>
                <p className="text-white/50 text-sm mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span> {property.location}
                </p>
                <div className="flex justify-between items-center text-white/70 text-sm border-t border-white/10 pt-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-gold">bed</span> {property.beds} Beds
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-gold">bathtub</span> {property.baths} Baths
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-gold">square_foot</span> {property.sqft}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us - Advantage Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-primary text-4xl font-black mb-4">The Luxe Advantage</h2>
          <p className="text-primary/60 max-w-2xl mx-auto">Providing unparalleled service and expertise to our prestigious clientele for over three decades.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {advantages.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center p-8 rounded-xl hover:shadow-xl transition-shadow border border-transparent hover:border-accent-gold/20">
              <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-accent-gold">{item.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-primary">{item.title}</h3>
              <p className="text-primary/60">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-background-light py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="material-symbols-outlined text-accent-gold text-5xl mb-8">format_quote</span>
          <blockquote className="text-2xl md:text-3xl font-medium text-primary italic mb-10 leading-relaxed">
            &ldquo;Working with Propertize was a masterclass in professional service. Their attention to detail and ability to find an off-market penthouse in London exceeded all my expectations.&rdquo;
          </blockquote>
          <div className="flex flex-col items-center">
            <div className="size-16 rounded-full overflow-hidden mb-4 border-2 border-accent-gold">
              <img
                className="w-full h-full object-cover"
                alt="Portrait of a successful luxury homeowner"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoexW8uR8w7GrTB40msLYqR6m2ALOkTo7wIAwF-jlwL6a2ntXgfwmb4ujlUZZ1IFTG-3KGUF4-fDeh_DaJNvPXcj6JzI1jNan-BgwSsTRVMzafafOKkUCm-O-W6nNjVw4HJAx87xJJ7VyuhS3t86LHL3-Ue4-QzjxtOIf0mObFTE8gEt5NkBR9wnalCquNayiqM-9xFm6Ny4B8VrglxcsfOvXhs7a0Hz9o41Kt8h1_nwjpaE3wzfsR8uvQGcOarmBcVQgVB9-TAzqZ"
              />
            </div>
            <div className="font-bold text-primary">Alexander Thorne</div>
            <div className="text-sm text-primary/60 uppercase tracking-widest font-semibold">Founder, Thorne Group</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 rounded-lg px-3 py-2 inline-flex">
                <img
                  src="/Propertize Logo-01.png"
                  alt="Propertize - Live & Rise"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              The leading global real estate agency specializing in luxury estates, penthouses, and private islands for the world&apos;s most discerning individuals.
            </p>
            <div className="flex gap-4">
              <button type="button" className="size-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-gold transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
              <button type="button" className="size-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-gold transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">person_pin</span>
              </button>
              <button type="button" className="size-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-gold transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">alternate_email</span>
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-accent-gold font-bold mb-6">Discover</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a className="hover:text-white transition-colors" href="#">Residential Sales</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Luxury Rentals</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Investment Portfolios</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Commercial Estates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-accent-gold font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a className="hover:text-white transition-colors" href="#">Our Story</a></li>
              <li><a className="hover:text-white transition-colors" href="#">The Concierge</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Career Opportunities</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-accent-gold font-bold mb-6">Join Our Newsletter</h4>
            <p className="text-white/60 text-sm mb-4">Receive weekly insights on high-end market trends.</p>
            <div className="flex gap-2">
              <input className="bg-white/5 border border-white/10 rounded-lg focus:ring-accent-gold focus:border-accent-gold text-white flex-1 text-sm px-3 py-2 placeholder:text-white/40" placeholder="Email Address" type="email" />
              <button type="button" className="bg-accent-gold text-primary p-2 rounded-lg font-bold">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-white/40 text-xs tracking-widest uppercase font-semibold gap-4">
          <p>© {new Date().getFullYear()} Propertize. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a className="hover:text-white/70 transition-colors" href="#">Terms</a>
            <a className="hover:text-white/70 transition-colors" href="#">Privacy</a>
            <a className="hover:text-white/70 transition-colors" href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
