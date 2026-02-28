'use client'

import { useState, useEffect } from 'react'
import { fetchLegalPages, updateLegalPage } from '../../services/cmsApi'
import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'
import type { LegalPage } from '../../types'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSkeleton } from '../LoadingSkeleton'

export function LegalPagesTab() {
  const [items, setItems] = useState<LegalPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<LegalPage | null>(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })

  const showToast = (m: string, s: boolean) => { setToast({ show: true, message: m, success: s }); setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000) }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLegalPages()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function openEdit(p: LegalPage) {
    setEditing(p)
    setForm({ title: p.title ?? '', content: p.content ?? '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSubmitting(true)
    try {
      await updateLegalPage(editing.id, { title: form.title.trim(), content: form.content.trim() })
      showToast('Updated.', true)
      setEditing(null)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreate(slug: string) {
    setSubmitting(true)
    try {
      const { data, error: err } = await supabase.from(TABLE.legal_pages).insert({ page_key: slug, title: slug.replace(/-/g, ' '), content: '' }).select().single()
      if (err) throw err
      showToast('Page created.', true)
      load()
      if (data) openEdit(data as LegalPage)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    } finally {
      setSubmitting(false)
    }
  }

  const LEGAL_SLUGS = ['privacy-policy', 'terms-of-service', 'cookie-policy', 'disclaimer']

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LEGAL_SLUGS.map((slug) => {
          const page = items.find((p) => p.page_key === slug)
          return (
            <button key={slug} type="button" onClick={() => (page ? openEdit(page) : handleCreate(slug))} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              {page ? `Edit ${page.title ?? slug}` : `Create ${slug.replace(/-/g, ' ')}`}
            </button>
          )
        })}
      </div>

      {editing && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-bold">Edit: {editing.title ?? editing.page_key}</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div><label className="mb-1 block text-sm font-medium">Title</label><input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>
            <div><label className="mb-1 block text-sm font-medium">Content</label><textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={16} className="w-full rounded-lg border px-4 py-2 font-mono text-sm" /></div>
            <div className="flex gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Save</button></div>
          </form>
        </div>
      )}

      {items.length === 0 && !editing && <EmptyState title="No Legal Pages" />}

      {toast.show && <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>{toast.message}</div>}
    </div>
  )
}
