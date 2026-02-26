'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'

export default function LoginModal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const authModal = useAuthModal()
  const router = useRouter()

  const isOpen = authModal?.isOpen ?? false
  const redirect = authModal?.redirect ?? null
  const closeAuthModal = authModal?.closeAuthModal ?? (() => {})
  const isUserFlow = !(redirect?.startsWith('/admin') ?? false)

  useEffect(() => {
    if (!authLoading && user && isOpen) {
      closeAuthModal()
      router.push(redirect ?? '/')
    }
  }, [authLoading, user, isOpen, closeAuthModal, router, redirect])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, { full_name: fullName || undefined, contact: contact || undefined })
      setSuccess('Account created. You can sign in now.')
      setShowSignUp(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeAuthModal}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 text-center pr-8">
          {showSignUp ? (isUserFlow ? 'Create Account' : 'Create Admin Account') : (isUserFlow ? 'Sign In to Compare Properties' : 'Admin Sign In')}
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1">Propertize Real Estate</p>

        {success && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">{success}</div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {showSignUp ? (
          <form onSubmit={handleSignUp} className="mt-6 space-y-4">
            {isUserFlow && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    placeholder="Phone number"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password (min 6 characters)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-medium"
            >
              {loading ? 'Creating…' : isUserFlow ? 'Sign Up' : 'Create Admin Account'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setShowSignUp(false); setError(''); setSuccess(''); }}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-medium"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <p className="text-center text-sm text-gray-500">
              No account yet?{' '}
              <button
                type="button"
                onClick={() => { setShowSignUp(true); setError(''); setSuccess(''); }}
                className="text-primary font-medium hover:underline"
              >
                {isUserFlow ? 'Sign up' : 'Create admin account'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
