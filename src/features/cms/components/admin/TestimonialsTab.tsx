'use client'

import { useState, useEffect } from 'react'
import { fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/features/cms/services/cmsApi'
import type { Testimonial } from '@/features/cms/types'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSkeleton } from '../LoadingSkeleton'

export function TestimonialsTab() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({ client_name: '', client_role: '', content: '', rating: 5, image_url: '', is_active: true })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })

  const showToast = (m: string, s: boolean) => { setToast({ show: true, message: m, success: s }); setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000) }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTestimonials(false)
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ client_name: '', client_role: '', content: '', rating: 5, image_url: '', is_active: true })
    setModalOpen(true)
  }
  function openEdit(t: Testimonial) {
    setEditing(t)
    setForm({ client_name: t.client_name ?? '', client_role: t.client_role ?? '', content: t.content ?? '', rating: t.rating ?? 5, image_url: t.image_url ?? '', is_active: t.is_active ?? true })
    setModalOpen(true)
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { client_name: form.client_name.trim(), client_role: form.client_role.trim() || null, content: form.content.trim(), rating: form.rating, image_url: form.image_url.trim() || null, is_active: form.is_active }
      if (editing) {
        await updateTestimonial(editing.id, payload)
        showToast('Updated.', true)
      } else {
        await createTestimonial(payload)
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
  async function handleDelete(t: Testimonial) {
    if (!confirm('Delete?')) return
    try {
      await deleteTestimonial(t.id)
      showToast('Deleted.', true)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={load}><button type="button" onClick={openAdd} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5">+ Add Testimonial</button></ErrorState>

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90">+ Add Testimonial</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        {items.length === 0 ? (
          <EmptyState title="No Testimonials" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Content</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Active</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{t.client_name ?? '-'}</td>
                    <td className="max-w-xs px-6 py-4 text-sm truncate">{t.content ?? '-'}</td>
                    <td className="px-6 py-4">{t.rating ?? '-'}</td>
                    <td className="px-6 py-4">{t.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4"><button type="button" onClick={() => openEdit(t)} className="text-primary hover:underline text-sm mr-2">Edit</button><button type="button" onClick={() => handleDelete(t)} className="text-red-600 hover:underline text-sm">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Testimonial</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div><label className="mb-1 block text-sm font-medium">Client Name</label><input type="text" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} required className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Client Role</label><input type="text" value={form.client_role} onChange={(e) => setForm((f) => ({ ...f, client_role: e.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Content</label><textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} required className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Rating</label><input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Image URL</label><input type="url" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="ta" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /><label htmlFor="ta">Active</label></div>
              <div className="flex gap-2"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {toast.show && <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>{toast.message}</div>}
    </div>
  )
}
