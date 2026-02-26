'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, profileLoading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace(loginUrl)
      return
    }
    if (requireAdmin && (profileLoading || !isAdmin)) {
      if (!profileLoading && !isAdmin) {
        router.replace(`${loginUrl}&reason=admin_required`)
      }
    }
  }, [loading, user, profileLoading, isAdmin, requireAdmin, router, loginUrl])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireAdmin && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}
