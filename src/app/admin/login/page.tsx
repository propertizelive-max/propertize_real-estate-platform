export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import LoginPageContent from '@/components/LoginPageContent'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageContent defaultRedirect="/admin" />
    </Suspense>
  )
}
