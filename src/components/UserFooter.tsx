'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchCompanyProfile } from '@/features/cms/services/cmsApi'

export default function UserFooter() {
  const [company, setCompany] = useState<any | null>(null)

  useEffect(() => {
    fetchCompanyProfile()
      .then(setCompany)
      .catch(() => setCompany(null))
  }, [])

  return (
    <footer className="bg-primary text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 rounded-lg px-3 py-2 inline-flex">
              <img src="/Propertize Logo-01.png" alt="Propertize - Live & Rise" className="h-14 w-auto object-contain" />
            </div>
          </div>
          <div className="text-white/60 text-sm leading-relaxed mb-6 space-y-1">
            <p className="font-semibold text-white">
              {(company?.company_name as string) ?? 'Propertize'}
            </p>
            {Boolean(company?.address || company?.city || company?.state || company?.country) && (
              <p>
                {[company?.address, company?.city, company?.state, company?.country].filter(Boolean).join(', ')}
              </p>
            )}
            {typeof company?.phone === 'string' && <p>Phone: {company.phone}</p>}
            {typeof company?.email === 'string' && <p>Email: {company.email}</p>}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="size-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-gold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </button>
            <button
              type="button"
              className="size-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-gold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">person_pin</span>
            </button>
            <button
              type="button"
              className="size-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-gold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">alternate_email</span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-accent-gold font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li>
              <Link href="/about#services" className="hover:text-white transition-colors">
                Our Services
              </Link>
            </li>
            <li>
              <Link href="/about#vision" className="hover:text-white transition-colors">
                Our Vision
              </Link>
            </li>
            <li>
              <Link href="/about#mission" className="hover:text-white transition-colors">
                Our Mission
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-accent-gold font-bold mb-6">Legal</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li>
              <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-accent-gold font-bold mb-6">Join Our Newsletter</h4>
          <p className="text-white/60 text-sm mb-4">Receive weekly insights on high-end market trends.</p>
          <div className="flex gap-2">
            <input
              className="bg-white/5 border border-white/10 rounded-lg focus:ring-accent-gold focus:border-accent-gold text-white flex-1 text-sm px-3 py-2 placeholder:text-white/40"
              placeholder="Email Address"
              type="email"
            />
            <button type="button" className="bg-accent-gold text-primary p-2 rounded-lg font-bold">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-white/40 text-xs tracking-widest uppercase font-semibold gap-4">
        <p>© {new Date().getFullYear()} Propertize. All Rights Reserved.</p>
        <div className="flex gap-8">
          <Link href="/legal/terms-of-service" className="hover:text-white/70 transition-colors">
            Terms
          </Link>
          <Link href="/legal/privacy-policy" className="hover:text-white/70 transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}

