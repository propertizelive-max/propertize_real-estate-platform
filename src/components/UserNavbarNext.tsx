'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import UserAvatarDropdown from './UserAvatarDropdown'
import GlobalSearch from './GlobalSearch'

export default function UserNavbarNext() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal() ?? {}
  const isProjects = pathname === '/projects'
  const isRent = pathname === '/rent'
  const isResale = pathname === '/resale'
  const isAbout = pathname === '/about'
  const isCompare = pathname === '/compare'
  const isHome = pathname === '/'

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-background-dark border-b border-primary/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/Propertize Logo-01.png"
            alt="Propertize - Live & Rise"
            className="h-14 w-auto object-contain"
          />
        </Link>
        <nav className="flex items-center gap-4 md:gap-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/projects"
            className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
              isProjects ? 'text-primary border-b-2 border-accent-gold pb-0.5' : 'text-primary/80 hover:text-primary'
            }`}
          >
            New Projects
          </Link>
          <Link
            href="/rent"
            className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
              isRent ? 'text-primary border-b-2 border-accent-gold pb-0.5' : 'text-primary/80 hover:text-primary'
            }`}
          >
            Rent
          </Link>
          <Link
            href="/resale"
            className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
              isResale ? 'text-primary border-b-2 border-accent-gold pb-0.5' : 'text-primary/80 hover:text-primary'
            }`}
          >
            Resale
          </Link>
          <Link
            href="/about"
            className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
              isAbout ? 'text-primary border-b-2 border-accent-gold pb-0.5' : 'text-primary/80 hover:text-primary'
            }`}
          >
            About
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        <div className="flex-1 max-w-xs">
          <GlobalSearch />
        </div>
        {user ? (
          <UserAvatarDropdown />
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal?.(pathname)}
            className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}
