'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'

export default function UserAvatarDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await signOut()
    router.push('/')
  }

  if (!user) return null

  const displayName = profile?.full_name?.trim() || user.email?.split('@')[0] || 'User'
  const avatarUrl = user.user_metadata?.avatar_url ?? DEFAULT_AVATAR

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="size-10 rounded-full border-2 border-accent-gold p-0.5 overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <img
          alt={displayName}
          src={avatarUrl}
          className="w-full h-full object-cover rounded-full bg-gray-200"
        />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
          role="menu"
        >
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <span className="material-symbols-outlined text-lg">person</span>
            My Profile
          </Link>
          <Link
            href="/compare"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <span className="material-symbols-outlined text-lg">compare_arrows</span>
            Compare History
          </Link>
          <hr className="my-2 border-gray-100 dark:border-gray-700" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
            role="menuitem"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
