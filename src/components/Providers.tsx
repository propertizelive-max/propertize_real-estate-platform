'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { CompareProvider } from '@/contexts/CompareContext'
import { AuthModalProvider } from '@/contexts/AuthModalContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CompareProvider>
        <AuthModalProvider>{children}</AuthModalProvider>
      </CompareProvider>
    </AuthProvider>
  )
}
