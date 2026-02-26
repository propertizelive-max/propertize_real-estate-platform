'use client'

import UserNavbarNext from '@/components/UserNavbarNext'
import UserFooter from '@/components/UserFooter'
import CompareBar from '@/components/CompareBar'
import CompareToast from '@/components/CompareToast'
import LoginModal from '@/components/LoginModal'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen luxe-landing bg-background-light dark:bg-background-dark">
      <UserNavbarNext />
      {children}
      <UserFooter />
      <CompareBar />
      <CompareToast />
      <LoginModal />
    </div>
  )
}
