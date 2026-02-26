'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute'
import Sidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/AdminHeader'

const ADMIN_LOGIN_PATH = '/admin/login'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isLoginPage = pathname === ADMIN_LOGIN_PATH

  if (isLoginPage) {
    return <>{children}</>
  }
  return (
    <ProtectedAdminRoute>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedAdminRoute>
  )
}
