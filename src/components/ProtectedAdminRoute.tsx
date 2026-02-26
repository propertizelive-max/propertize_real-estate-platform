'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Protects admin routes using Supabase auth and profiles.role.
 * - Not logged in → redirect to login (with return URL)
 * - Logged in but role !== "admin" → sign out and redirect to login
 * - Logged in and role === "admin" → render children
 * Shows loading until session + profile are resolved to prevent dashboard flash.
 */
const ADMIN_LOGIN_PATH = '/admin/login'

type ProtectedAdminRouteProps = {
  children: React.ReactNode
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, loading, profileLoading, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)
  const nonAdminHandledRef = useRef(false)

  const loginUrl = `${ADMIN_LOGIN_PATH}?redirect=${encodeURIComponent(pathname)}`

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace(loginUrl)
      return
    }
    if (profileLoading || signingOut) return
    if (!isAdmin) {
      if (!nonAdminHandledRef.current) {
        nonAdminHandledRef.current = true
        setSigningOut(true)
        void signOut().finally(() => setSigningOut(false))
      }
      router.replace(loginUrl)
    }
  }, [loading, user, profileLoading, signingOut, isAdmin, signOut, router, loginUrl])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" aria-busy="true">
        <div className="text-gray-500">Checking auth…</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (profileLoading || signingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" aria-busy="true">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
