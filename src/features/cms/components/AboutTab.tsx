'use client'

import { useState, useEffect } from 'react'
import { fetchSiteSections, upsertSiteSection } from '../services/cmsApi'
import type { SiteSection } from '../types'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'
import Toast from './Toast'

const SECTION_KEYS = [
  { key: 'about_company', label: 'About Company' },
  { key: 'company_vision', label: 'Company Vision' },
  { key: 'company_mission', label: 'Company Mission' },
] as const

export default function AboutTab() {
  const [sections, setSections] = useState<SiteSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    button_text: '',
    button_link: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchSiteSections()
    setSections(data ?? [])
    setError(err?.message ?? null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openModal(sectionKey: string) {
    const existing = sections.find((s) => s.section_key === sectionKey)
    setForm({
      title: existing?.title ?? '',
      subtitle: existing?.subtitle ?? '',
      description: existing?.description ?? '',
      image_url: existing?.image_url ?? '',
      button_text: existing?.button_text ?? '',
      button_link: existing?.button_link ?? '',
      is_active: existing?.is_active ?? true,
    })
    setModalOpen(sectionKey)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!modalOpen) return
    setSaving(true)
    const { data, error: err } = await upsertSiteSection({
      section_key: modalOpen,
      ...form,
    })
    setSaving(false)
    if (err) {
      setToast({ message: err.message, type: 'error' })
      return
    }
    setToast({ message: 'Section saved successfully.', type: 'success' })
    setModalOpen(null)
    load()
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">About Sections</h2>
      <p className="text-sm text-gray-500">Manage about_company, company_vision, company_mission sections.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECTION_KEYS.map(({ key, label }) => {
          const section = sections.find((s) => s.section_key === key)
          return (
            <div
              key={key}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-sm text-gray-500 mt-1 truncate">
                {section?.title || 'Not configured'}
              </p>
              <button
                type="button"
                onClick={() => openModal(key)}
                className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
                  section ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-primary text-white hover:opacity-90'
                }`}
              >
                {section ? 'Edit' : 'Add'}
              </button>
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(null)} aria-hidden />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {SECTION_KEYS.find((s) => s.key === modalOpen)?.label}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={form.button_text}
                  onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="url"
                  value={form.button_link}
                  onChange={(e) => setForm((f) => ({ ...f, button_link: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
