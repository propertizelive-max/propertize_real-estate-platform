'use client'

import { useState, useEffect } from 'react'
import { fetchServices, createService, updateService, deleteService } from '@/features/cms/services/cmsApi'
import type { Service } from '@/features/cms/types'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSkeleton } from '../LoadingSkeleton'

export function ServicesTab() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState({ title: '', description: '', icon: '', status: 'active' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })

  const showToast = (m: string, s: boolean) => {
    setToast({ show: true, message: m, success: s })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchServices()
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
    setForm({ title: '', description: '', icon: '', status: 'active' })
    setModalOpen(true)
  }
  function openEdit(s: Service) {
    setEditing(s)
    setForm({ title: s.title ?? '', description: s.description ?? '', icon: s.icon ?? '', status: (s.status ?? 'active').toLowerCase() })
    setModalOpen(true)
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { title: form.title.trim(), description: form.description.trim(), icon: form.icon.trim() || null, status: form.status }
      if (editing) {
        await updateService(editing.id, payload)
        showToast('Updated.', true)
      } else {
        await createService(payload)
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
  async function handleDelete(s: Service) {
    if (!confirm(`Delete "${s.title}"?`)) return
    try {
      await deleteService(s.id)
      showToast('Deleted.', true)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={load}><button type="button" onClick={openAdd} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5">+ Add Service</button></ErrorState>

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90">+ Add Service</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        {items.length === 0 ? (
          <EmptyState title="No Services" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Icon</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{s.title ?? '-'}</td>
                    <td className="max-w-xs px-6 py-4 text-sm truncate">{s.description ?? '-'}</td>
                    <td className="px-6 py-4 text-sm">{s.icon ?? '-'}</td>
                    <td className="px-6 py-4"><span className={`rounded px-2 py-0.5 text-xs ${(s.status ?? 'active') === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{s.status ?? 'active'}</span></td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => openEdit(s)} className="text-primary hover:underline text-sm mr-2">Edit</button>
                      <button type="button" onClick={() => handleDelete(s)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </td>
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
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Service</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div><label className="mb-1 block text-sm font-medium">Title</label><input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Icon</label><input type="text" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="e.g. home" className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Status</label><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-lg border px-4 py-2"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div className="flex gap-2"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {toast.show && <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>{toast.message}</div>}
    </div>
  )
}
