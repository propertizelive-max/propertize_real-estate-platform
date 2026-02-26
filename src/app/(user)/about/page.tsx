'use client'

import { useState, useEffect } from 'react'
import {
  fetchSiteSections,
  fetchServices,
  fetchTeamMembers,
  fetchCompanyStats,
  fetchFaqs,
  fetchTestimonials,
} from '@/features/cms/services/cmsApi'
import type { SiteSection, Service, TeamMember, CompanyStat, Faq, Testimonial } from '@/features/cms/types'

const SECTION_KEYS = ['about_company', 'company_vision', 'company_mission'] as const

export default function AboutPage() {
  const [sections, setSections] = useState<SiteSection[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<CompanyStat[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [heroVisible, setHeroVisible] = useState(false)
  const [openFaqId, setOpenFaqId] = useState<string | number | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [sects, svcs, mems, sts, fqs, tms] = await Promise.allSettled([
          fetchSiteSections(true),
          fetchServices(),
          fetchTeamMembers(),
          fetchCompanyStats(),
          fetchFaqs(true),
          fetchTestimonials(true),
        ])
        setSections(sects.status === 'fulfilled' ? sects.value : [])
        setServices(svcs.status === 'fulfilled' ? svcs.value : [])
        setTeam(mems.status === 'fulfilled' ? mems.value : [])
        setStats(sts.status === 'fulfilled' ? sts.value : [])
        setFaqs(fqs.status === 'fulfilled' ? fqs.value : [])
        setTestimonials(tms.status === 'fulfilled' ? tms.value : [])
      } catch {
        // already handled per-section via Promise.allSettled
      } finally {
        setLoading(false)
      }
    }
    load()
    setHeroVisible(true)
  }, [])

  const activeServices = services.filter((s) => (s.status ?? 'active').toLowerCase() === 'active')
  const byKey = Object.fromEntries(sections.map((s) => [s.section_key, s]))
  const orderedSections = SECTION_KEYS.map((k) => byKey[k]).filter(Boolean)

  const aboutSection = orderedSections.find((s) => s.section_key === 'about_company')
  const otherSections = orderedSections.filter((s) => s.section_key !== 'about_company')

  if (loading) {
    return (
      <div className="py-24 px-6 max-w-5xl mx-auto">
        <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const hasContent =
    orderedSections.length > 0 ||
    activeServices.length > 0 ||
    team.length > 0 ||
    stats.length > 0 ||
    faqs.length > 0 ||
    testimonials.length > 0

  if (!hasContent) {
    return (
      <div className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">About Us</h1>
        <p className="text-primary/60">
          Content is being prepared. Please check back soon.
        </p>
      </div>
    )
  }

  const testimonialContent = (t: Testimonial) => t.content ?? t.review ?? ''

  return (
    <div className="luxe-landing min-h-screen bg-[#faf9f7] dark:bg-background-dark text-primary font-display antialiased">
      {/* Hero header - solid dark for high contrast */}
      <header className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div
          className={`relative max-w-5xl mx-auto py-20 px-6 text-center transition-all duration-700 ease-out transform ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="inline-block text-accent-gold text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
            <span className="relative inline-block px-4 py-1">
              <span
                className="absolute inset-x-2 bottom-0 h-3 rounded-full bg-accent-gold/40"
                aria-hidden="true"
              />
              <span className="relative text-white">About Propertize</span>
            </span>
          </h1>
          <p className="text-white text-lg mt-4 max-w-2xl mx-auto" style={{ opacity: 0.95 }}>
            Learn more about our company, team, and values.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto -mt-8 px-6 pb-24 space-y-24 relative z-10">
        {/* Content sections - About, Vision, Mission */}
        {orderedSections.length > 0 && (
          <section className="space-y-10">
            {aboutSection && (
              <article className="rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100 border-l-4 border-primary">
                <div className="p-8 md:p-10">
                  {aboutSection.title && (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {aboutSection.title}
                    </h2>
                  )}
                  {aboutSection.subtitle && (
                    <p className="text-lg text-gray-700 mb-4 font-medium">
                      {aboutSection.subtitle}
                    </p>
                  )}
                  {aboutSection.description && (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {aboutSection.description}
                    </p>
                  )}
                  {aboutSection.button_text && aboutSection.button_link && (
                    <a
                      href={aboutSection.button_link}
                      className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent-gold text-primary font-bold rounded-lg hover:bg-accent-gold/90 transition-colors"
                    >
                      {aboutSection.button_text}
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </a>
                  )}
                </div>
              </article>
            )}

            {otherSections.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2">
                {otherSections.map((sec) => (
                  <article
                    key={sec.id}
                    className="rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-100 border-l-4 border-primary hover:-translate-y-1"
                  >
                    <div className="p-8 md:p-10">
                      {sec.title && (
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                          {sec.title}
                        </h2>
                      )}
                      {sec.subtitle && (
                        <p className="text-base text-gray-700 mb-3 font-medium">
                          {sec.subtitle}
                        </p>
                      )}
                      {sec.description && (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {sec.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Stats - clean horizontal bar */}
        {stats.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-accent-gold rounded-full" />
              Company Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-3xl font-black text-accent-gold">
                    {s.value ?? '-'}
                    {s.suffix && <span className="text-lg font-normal text-gray-600">{s.suffix}</span>}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{s.label ?? '-'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services - icon cards */}
        {activeServices.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-accent-gold rounded-full" />
              Our Services
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeServices.map((s) => (
                <div
                  key={s.id}
                  className="group bg-white rounded-xl border border-gray-100 p-8 shadow-md hover:shadow-2xl hover:border-accent-gold/40 hover:-translate-y-2 transition-all duration-300 overflow-visible"
                >
                  {s.icon && (
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors shrink-0 overflow-visible">
                      <span className="material-symbols-outlined text-4xl text-primary" style={{ fontSize: '2.5rem' }}>
                        {s.icon}
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-lg">{s.title ?? '-'}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.description ?? '-'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Team - profile cards */}
        {team.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-accent-gold rounded-full" />
              Our Team
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                    {t.image_url ? (
                      <img
                        src={t.image_url}
                        alt={t.name ?? ''}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300">
                          person
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg">{t.name ?? '-'}</h3>
                    <p className="text-accent-gold font-medium text-sm mt-0.5">{t.role ?? '-'}</p>
                    {t.experience && (
                      <p className="text-xs text-gray-500 mt-2">{t.experience}</p>
                    )}
                    {t.bio && (
                      <p className="text-sm text-gray-700 mt-3 leading-relaxed line-clamp-3">{t.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials - quote style */}
        {testimonials.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-accent-gold rounded-full" />
              Testimonials
            </h2>
            <div className="space-y-10">
              {testimonials.map((t) => (
                <blockquote key={t.id} className="relative pl-8 border-l-2 border-accent-gold/40">
                  <span className="material-symbols-outlined absolute -left-1 -top-1 text-accent-gold/60 text-2xl">
                    format_quote
                  </span>
                  <p className="text-gray-800 leading-relaxed italic">
                    &ldquo;{testimonialContent(t)}&rdquo;
                  </p>
                  <footer className="mt-4 flex items-center gap-4">
                    {t.image_url && (
                      <img
                        src={t.image_url}
                        alt={t.client_name ?? ''}
                        className="w-12 h-12 rounded-full object-cover border-2 border-accent-gold/30"
                      />
                    )}
                    <div>
                      <cite className="font-semibold text-gray-900 not-italic">{t.client_name ?? '-'}</cite>
                      {t.client_role && (
                        <p className="text-sm text-gray-600">{t.client_role}</p>
                      )}
                      {t.rating != null && t.rating > 0 && (
                        <p className="text-accent-gold text-sm mt-0.5">
                          {'★'.repeat(Math.round(t.rating))}
                        </p>
                      )}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* FAQ - accordion-style cards */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-accent-gold rounded-full" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((f) => {
                const isOpen = openFaqId === f.id
                return (
                  <div
                    key={f.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : (f.id as string | number))}
                      className="w-full flex items-start justify-between gap-3 p-6 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-accent-gold text-xl shrink-0 mt-0.5">
                          help
                        </span>
                        <h4 className="font-semibold text-gray-900">
                          {f.question ?? '—'}
                        </h4>
                      </div>
                      <span
                        className={`material-symbols-outlined text-gray-500 text-xl shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      >
                        expand_more
                      </span>
                    </button>
                    <div
                      className={`px-6 pb-6 pt-0 overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="text-gray-700 pl-9 text-sm leading-relaxed">
                        {f.answer ?? '—'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
