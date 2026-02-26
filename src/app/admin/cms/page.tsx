'use client'

import { useState, useEffect, useRef } from 'react'
import { AboutTab } from '@/features/cms/components/admin/AboutTab'
import { ServicesTab } from '@/features/cms/components/admin/ServicesTab'
import { TestimonialsTab } from '@/features/cms/components/admin/TestimonialsTab'
import { FaqTab } from '@/features/cms/components/admin/FaqTab'
import { LegalPagesTab } from '@/features/cms/components/admin/LegalPagesTab'
import { ContactInquiriesTab } from '@/features/cms/components/admin/ContactInquiriesTab'
import {
  fetchTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  fetchCompanyStats,
  createCompanyStat,
  updateCompanyStat,
  deleteCompanyStat,
  fetchCompanyInfo,
  createCompanyInfo,
  updateCompanyInfo,
  fetchHeroSection,
  createHeroSection,
  updateHeroSection,
  deleteHeroSection,
} from '@/features/cms/services/cmsApi'
import type { TeamMember, CompanyStat, CompanyInfo, HeroSection } from '@/features/cms/types'
import { supabase } from '@/lib/supabase'
import { EmptyState } from '@/features/cms/components/EmptyState'
import { ErrorState } from '@/features/cms/components/ErrorState'
import { LoadingSkeleton } from '@/features/cms/components/LoadingSkeleton'

const TABS = [
  { id: 'hero-section', label: 'Hero Section' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'team', label: 'Team' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'company-stats', label: 'Company Stats' },
  { id: 'company-info', label: 'Company Info' },
  { id: 'legal', label: 'Legal Pages' },
  { id: 'inquiries', label: 'Contact Inquiries' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('about')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CMS</h1>
        <p className="text-sm text-gray-500 mt-1">Manage website content. Add, edit, or delete sections.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary bg-white text-primary'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
        {activeTab === 'hero-section' && <HeroSectionTab />}
        {activeTab === 'about' && <AboutTab />}
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'testimonials' && <TestimonialsTab />}
        {activeTab === 'faq' && <FaqTab />}
        {activeTab === 'company-stats' && <CompanyStatsTab />}
        {activeTab === 'company-info' && <CompanyInfoTab />}
        {activeTab === 'legal' && <LegalPagesTab />}
        {activeTab === 'inquiries' && <ContactInquiriesTab />}
      </div>
    </div>
  )
}

const HERO_STORAGE_BUCKET = 'property-media'

function HeroSectionTab() {
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [hero, setHero] = useState<HeroSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    sub_title: '',
    file_url: '',
    media_type: 'image',
    logo_url: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })
  const showToast = (m: string, s: boolean) => {
    setToast({ show: true, message: m, success: s })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHeroSection()
      setHero(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openAdd() {
    setForm({
      title: '',
      sub_title: '',
      file_url: '',
      media_type: 'image',
      logo_url: '',
    })
    setModalOpen(true)
  }

  function openEdit() {
    if (hero) {
      setForm({
        title: hero.title ?? '',
        sub_title: hero.sub_title ?? '',
        file_url: hero.file_url ?? '',
        media_type: hero.media_type ?? 'image',
        logo_url: hero.logo_url ?? '',
      })
      setModalOpen(true)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim() || null,
        sub_title: form.sub_title.trim() || null,
        file_url: form.file_url.trim() || null,
        media_type: form.media_type || null,
        logo_url: form.logo_url.trim() || null,
      }
      if (hero?.id) {
        await updateHeroSection(hero.id, payload)
        showToast('Hero section updated.', true)
      } else {
        const created = await createHeroSection(payload)
        setHero(created)
        showToast('Hero section created.', true)
      }
      setModalOpen(false)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    } finally {
      setSubmitting(false)
    }
  }

  async function uploadToHeroStorage(file: File, prefix: string): Promise<string> {
    const path = `hero/${prefix}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error: uploadError } = await supabase.storage.from(HERO_STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from(HERO_STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBg(true)
    try {
      const url = await uploadToHeroStorage(file, 'background')
      const isVideo = file.type.startsWith('video/')
      setForm((f) => ({ ...f, file_url: url, media_type: isVideo ? 'video' : 'image' }))
      showToast('Background uploaded to property-media bucket.', true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', false)
    } finally {
      setUploadingBg(false)
      e.target.value = ''
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const url = await uploadToHeroStorage(file, 'logo')
      setForm((f) => ({ ...f, logo_url: url }))
      showToast('Logo uploaded to property-media bucket.', true)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', false)
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  async function handleDelete() {
    if (!hero?.id || !confirm('Delete this hero section?')) return
    setSubmitting(true)
    try {
      await deleteHeroSection(hero.id)
      setHero(null)
      setModalOpen(false)
      showToast('Hero section deleted.', true)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) {
    return (
      <ErrorState error={error} onRetry={load}>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Add Hero Section
        </button>
      </ErrorState>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        {hero && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={hero ? openEdit : openAdd}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90"
        >
          {hero ? 'Edit Hero Section' : 'Add Hero Section'}
        </button>
      </div>

      {hero ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md space-y-4">
          <div className="flex flex-wrap gap-6">
            {hero.logo_url && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Logo</p>
                <img src={hero.logo_url} alt="Logo" className="h-12 object-contain" />
              </div>
            )}
            {hero.file_url && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1">Background ({hero.media_type || 'image'})</p>
                {hero.media_type === 'video' ? (
                  <video src={hero.file_url} className="max-h-32 rounded object-cover" muted playsInline />
                ) : (
                  <img src={hero.file_url} alt="Hero" className="max-h-32 rounded object-cover" />
                )}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{hero.title || '—'}</p>
            <p className="text-sm text-gray-600 mt-1">{hero.sub_title || '—'}</p>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Hero Section"
          description="Add title, subtitle, background image/video, and logo for your homepage hero."
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">{hero ? 'Edit Hero Section' : 'Add Hero Section'}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2"
                  placeholder="e.g. Find Your Dream Property Effortlessly"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Subtitle</label>
                <textarea
                  value={form.sub_title}
                  onChange={(e) => setForm((f) => ({ ...f, sub_title: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2"
                  rows={2}
                  placeholder="e.g. Access the world's most exclusive listings..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Background Image / Video</label>
                <p className="mb-2 text-xs text-gray-500">Stored in: {HERO_STORAGE_BUCKET}/hero/background/</p>
                <div className="flex gap-2">
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleBackgroundUpload}
                  />
                  <button
                    type="button"
                    onClick={() => backgroundInputRef.current?.click()}
                    disabled={uploadingBg}
                    className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    {uploadingBg ? 'Uploading…' : 'Upload from computer'}
                  </button>
                  <input
                    type="url"
                    value={form.file_url}
                    onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                    className="flex-1 rounded-lg border px-4 py-2 text-sm"
                    placeholder="Or paste URL"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Media Type</label>
                <select
                  value={form.media_type}
                  onChange={(e) => setForm((f) => ({ ...f, media_type: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Logo</label>
                <p className="mb-2 text-xs text-gray-500">Stored in: {HERO_STORAGE_BUCKET}/hero/logo/</p>
                <div className="flex gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    {uploadingLogo ? 'Uploading…' : 'Upload from computer'}
                  </button>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
                    className="flex-1 rounded-lg border px-4 py-2 text-sm"
                    placeholder="Or paste URL"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${
            toast.success ? 'bg-gray-800' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

function TeamTab() {
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState({ name: '', role: '', bio: '', phone: '', email: '', image_url: '', experience: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })
  const showToast = (m: string, s: boolean) => { setToast({ show: true, message: m, success: s }); setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000) }
  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTeamMembers()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])
  function openAdd() {
    setEditing(null)
    setForm({ name: '', role: '', bio: '', phone: '', email: '', image_url: '', experience: '' })
    setModalOpen(true)
  }
  function openEdit(t: TeamMember) {
    setEditing(t)
    setForm({ name: t.name ?? '', role: t.role ?? '', bio: t.bio ?? '', phone: t.phone ?? '', email: t.email ?? '', image_url: t.image_url ?? '', experience: t.experience ?? '' })
    setModalOpen(true)
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { name: form.name.trim(), role: form.role.trim() || null, bio: form.bio.trim() || null, phone: form.phone.trim() || null, email: form.email.trim() || null, image_url: form.image_url.trim() || null, experience: form.experience.trim() || null }
      if (editing) {
        await updateTeamMember(editing.id, payload)
        showToast('Updated.', true)
      } else {
        await createTeamMember(payload)
        showToast('Added.', true)
      }
      setModalOpen(false)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    } finally {
      setSubmitting(false)
    }
  }
  async function handleDelete(t: TeamMember) {
    if (!confirm(`Delete "${t.name}"?`)) return
    try {
      await deleteTeamMember(t.id)
      showToast('Deleted.', true)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    }
  }
  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={load}><button type="button" onClick={openAdd} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5">+ Add Member</button></ErrorState>
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90">+ Add Member</button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full"><EmptyState title="No Team Members" /></div>
        ) : (
          items.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <div className="aspect-square w-full bg-gray-100">
                {t.image_url ? <img src={t.image_url} alt={t.name ?? ''} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl text-gray-400">?</div>}
              </div>
              <div className="p-6">
                <h3 className="font-bold">{t.name ?? '-'}</h3>
                <p className="text-sm text-primary">{t.role ?? '-'}</p>
                {t.experience && <p className="mt-1 text-xs text-gray-500">{t.experience}</p>}
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => openEdit(t)} className="text-primary hover:underline text-sm">Edit</button>
                  <button type="button" onClick={() => handleDelete(t)} className="text-red-600 hover:underline text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Team Member</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {(['name', 'role', 'bio', 'phone', 'email', 'image_url', 'experience'] as const).map((field) => (
                <div key={field}><label className="mb-1 block text-sm font-medium capitalize">{field.replace('_', ' ')}</label>{field === 'bio' ? <textarea value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} rows={3} className="w-full rounded-lg border px-4 py-2" /> : <input type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full rounded-lg border px-4 py-2" />}</div>
              ))}
              <div className="flex gap-2"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Save</button></div>
            </form>
          </div>
        </div>
      )}
      {toast.show && <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>{toast.message}</div>}
    </div>
  )
}

function CompanyStatsTab() {
  const [items, setItems] = useState<CompanyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CompanyStat | null>(null)
  const [form, setForm] = useState({ label: '', value: '', icon: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })
  const showToast = (m: string, s: boolean) => { setToast({ show: true, message: m, success: s }); setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000) }
  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCompanyStats()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])
  function openAdd() {
    setEditing(null)
    setForm({ label: '', value: '', icon: '' })
    setModalOpen(true)
  }
  function openEdit(s: CompanyStat) {
    setEditing(s)
    setForm({ label: s.label ?? '', value: s.value ?? '', icon: s.icon ?? '' })
    setModalOpen(true)
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { label: form.label.trim(), value: form.value.trim(), icon: form.icon.trim() || null }
      if (editing) {
        await updateCompanyStat(editing.id, payload)
        showToast('Updated.', true)
      } else {
        await createCompanyStat(payload)
        showToast('Added.', true)
      }
      setModalOpen(false)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    } finally {
      setSubmitting(false)
    }
  }
  async function handleDelete(s: CompanyStat) {
    if (!confirm('Delete?')) return
    try {
      await deleteCompanyStat(s.id)
      showToast('Deleted.', true)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    }
  }
  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={load}><button type="button" onClick={openAdd} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5">+ Add Stat</button></ErrorState>
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90">+ Add Stat</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full"><EmptyState title="No Company Stats" /></div>
        ) : (
          items.map((s) => (
            <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{s.value ?? '-'}</p>
                  <p className="text-sm text-gray-600">{s.label ?? '-'}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(s)} className="text-primary hover:underline text-sm">Edit</button>
                  <button type="button" onClick={() => handleDelete(s)} className="text-red-600 hover:underline text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Company Stat</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div><label className="mb-1 block text-sm font-medium">Label</label><input type="text" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} required className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Value</label><input type="text" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} required className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Icon</label><input type="text" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>
              <div className="flex gap-2"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Save</button></div>
            </form>
          </div>
        </div>
      )}
      {toast.show && <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>{toast.message}</div>}
    </div>
  )
}

function CompanyInfoTab() {
  const [info, setInfo] = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    company_name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
    google_map_embed: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
  })
  const [toast, setToast] = useState({ show: false, message: '', success: false })
  const showToast = (m: string, s: boolean) => { setToast({ show: true, message: m, success: s }); setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000) }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCompanyInfo()
      setInfo(data)
      if (data) {
        setForm({
          company_name: data.company_name ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          country: data.country ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          google_map_embed: data.google_map_embed ?? '',
          facebook_url: data.facebook_url ?? '',
          instagram_url: data.instagram_url ?? '',
          linkedin_url: data.linkedin_url ?? '',
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openEdit() {
    setModalOpen(true)
  }

  function openAdd() {
    setInfo(null)
    setForm({
      company_name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      phone: '',
      email: '',
      google_map_embed: '',
      facebook_url: '',
      instagram_url: '',
      linkedin_url: '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: Partial<CompanyInfo> = {
        company_name: form.company_name.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        google_map_embed: form.google_map_embed.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
      }
      if (info?.id) {
        await updateCompanyInfo(info.id, payload)
        showToast('Company info updated.', true)
      } else {
        const created = await createCompanyInfo(payload)
        setInfo(created)
        showToast('Company info saved.', true)
      }
      setModalOpen(false)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) {
    return (
      <ErrorState error={error} onRetry={load}>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Add Company Info
        </button>
      </ErrorState>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={info ? openEdit : openAdd}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90"
        >
          {info ? 'Edit Company Info' : 'Add Company Info'}
        </button>
      </div>

      {info ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md space-y-2 text-sm text-gray-700">
          <p className="text-lg font-semibold text-gray-900">{info.company_name ?? 'Company'}</p>
          {[info.address, info.city, info.state, info.country].filter(Boolean).length > 0 && (
            <p>
              {[info.address, info.city, info.state, info.country].filter(Boolean).join(', ')}
            </p>
          )}
          {info.phone && <p>Phone: {info.phone}</p>}
          {info.email && <p>Email: {info.email}</p>}
          {info.google_map_embed && (
            <p className="truncate">Map Embed: {info.google_map_embed}</p>
          )}
          {(info.facebook_url || info.instagram_url || info.linkedin_url) && (
            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              {info.facebook_url && <span className="underline">Facebook</span>}
              {info.instagram_url && <span className="underline">Instagram</span>}
              {info.linkedin_url && <span className="underline">LinkedIn</span>}
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No Company Info"
          description="Add your company contact and social information to show it in the footer."
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">{info ? 'Edit Company Info' : 'Add Company Info'}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Google Map Embed</label>
                <input
                  type="text"
                  value={form.google_map_embed}
                  onChange={(e) => setForm((f) => ({ ...f, google_map_embed: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Facebook URL</label>
                  <input
                    type="url"
                    value={form.facebook_url}
                    onChange={(e) => setForm((f) => ({ ...f, facebook_url: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Instagram URL</label>
                  <input
                    type="url"
                    value={form.instagram_url}
                    onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">LinkedIn URL</label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${
            toast.success ? 'bg-gray-800' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
