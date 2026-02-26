import { createContext, useCallback, useContext, useState, ReactNode } from 'react'

type AuthModalContextType = {
  isOpen: boolean
  redirect: string | null
  openAuthModal: (redirect?: string) => void
  closeAuthModal: () => void
}

const AuthModalContext = createContext<AuthModalContextType | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [redirect, setRedirect] = useState<string | null>(null)

  const openAuthModal = useCallback((redirectPath?: string) => {
    setRedirect(redirectPath ?? null)
    setIsOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsOpen(false)
    setRedirect(null)
  }, [])

  return (
    <AuthModalContext.Provider value={{ isOpen, redirect, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  return ctx
}
