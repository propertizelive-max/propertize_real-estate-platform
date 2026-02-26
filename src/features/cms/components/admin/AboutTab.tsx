'use client'

import { useState, useEffect } from 'react'
import {
  fetchSiteSections,
  updateSiteSection,
} from '../../services/cmsApi'
import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'
import type { SiteSection } from '../../types'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSkeleton } from '../LoadingSkeleton'

const SECTION_KEYS = ['about_company', 'company_vision', 'company_mission'] as const

async function insertSiteSection(row: Partial<SiteSection> & { section_key: string }) {
  const { data, error } = await supabase
    .from(TABLE.site_sections)
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data as SiteSection
}

export function AboutTab() {
  const [sections, setSections] = useState<SiteSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SiteSection | null>(null)
  const [sectionKey, setSectionKey] = useState<string>('about_company')
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    button_text: '',
    button_link: '',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })

  const showToast = (message: string, success: boolean) => {
    setToast({ show: true, message, success })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSiteSections(false)
      setSections(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const getSection = (key: string) => sections.find((s) => s.section_key === key)

  function openAdd(key: string) {
    setEditing(null)
    setSectionKey(key)
    setForm({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      button_text: '',
      button_link: '',
      is_active: true,
    })
    setModalOpen(true)
  }

  function openEdit(sec: SiteSection) {
    setEditing(sec)
    setSectionKey(sec.section_key)
    setForm({
      title: sec.title ?? '',
      subtitle: sec.subtitle ?? '',
      description: sec.description ?? '',
      image_url: sec.image_url ?? '',
      button_text: sec.button_text ?? '',
      button_link: sec.button_link ?? '',
      is_active: sec.is_active ?? true,
    })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        section_key: sectionKey,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || null,
        button_text: form.button_text.trim() || null,
        button_link: form.button_link.trim() || null,
        is_active: form.is_active,
      }
      if (editing) {
        await updateSiteSection(editing.id, payload)
        showToast('Section updated.', true)
      } else {
        await insertSiteSection(payload)
        showToast('Section added.', true)
      }
      setModalOpen(false)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save', false)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error)
    return (
      <ErrorState error={error} onRetry={load}>
        {SECTION_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => openAdd(key)}
            className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Add {key.replace(/_/g, ' ')}
          </button>
        ))}
      </ErrorState>
    )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SECTION_KEYS.map((key) => {
          const sec = getSection(key)
          const label = key.replace(/_/g, ' ')
          return (
            <div
              key={key}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md"
            >
              <h3 className="font-semibold text-gray-900 capitalize">{label}</h3>
              {sec ? (
                <>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {sec.title ?? '—'}
                  </p>
                  <button
                    type="button"
                    onClick={() => openEdit(sec)}
                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAdd(key)}
                  className="mt-4 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                >
                  Add
                </button>
              )}
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              {editing ? 'Edit' : 'Add'} {sectionKey.replace(/_/g, ' ')}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Button Text</label>
                  <input
                    type="text"
                    value={form.button_text}
                    onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Button Link</label>
                  <input
                    type="url"
                    value={form.button_link}
                    onChange={(e) => setForm((f) => ({ ...f, button_link: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (show on website)
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
