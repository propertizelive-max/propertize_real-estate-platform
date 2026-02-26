'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'

export default function ProfilePage() {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
      return
    }
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
    } else if (user) {
      void fetchProfile(user.id).then((p) => {
        if (p) {
          setFullName(p.full_name ?? '')
          setPhone(p.phone ?? '')
        }
      })
    }
  }, [user, profile, authLoading, router, fetchProfile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSaving(true)
    try {
      const { error } = await supabase
        .from(TABLE.profiles)
        .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
        .eq('id', user.id)

      if (error) throw error
      await fetchProfile(user.id)
      setToast('Profile updated successfully.')
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">My Profile</h1>

      {toast && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 text-sm" role="alert">
          {toast}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user.email ?? ''}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-accent-gold focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-accent-gold focus:border-transparent"
            placeholder="Phone number"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
