'use client'

import { useState, useEffect } from 'react'
import { fetchFaqs, createFaq, updateFaq, deleteFaq } from '../../services/cmsApi'
import type { Faq } from '../../types'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSkeleton } from '../LoadingSkeleton'

export function FaqTab() {
  const [items, setItems] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [form, setForm] = useState({ question: '', answer: '', is_active: true })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', success: false })

  const showToast = (m: string, s: boolean) => { setToast({ show: true, message: m, success: s }); setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000) }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFaqs(false)
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
    setForm({ question: '', answer: '', is_active: true })
    setModalOpen(true)
  }
  function openEdit(f: Faq) {
    setEditing(f)
    setForm({ question: f.question ?? '', answer: f.answer ?? '', is_active: f.is_active ?? true })
    setModalOpen(true)
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { question: form.question.trim(), answer: form.answer.trim(), is_active: form.is_active }
      if (editing) {
        await updateFaq(editing.id, payload)
        showToast('Updated.', true)
      } else {
        await createFaq(payload)
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
  async function handleDelete(f: Faq) {
    if (!confirm('Delete?')) return
    try {
      await deleteFaq(f.id)
      showToast('Deleted.', true)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed', false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={load}><button type="button" onClick={openAdd} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5">+ Add FAQ</button></ErrorState>

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90">+ Add FAQ</button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <EmptyState title="No FAQs" />
        ) : (
          items.map((f) => (
            <div key={f.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900">{f.question ?? '—'}</h4>
                  <p className="mt-1 text-sm text-gray-600">{f.answer ?? '—'}</p>
                  <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs ${f.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{f.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => openEdit(f)} className="text-primary hover:underline text-sm">Edit</button>
                  <button type="button" onClick={() => handleDelete(f)} className="text-red-600 hover:underline text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} FAQ</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div><label className="mb-1 block text-sm font-medium">Question</label><input type="text" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} required className="w-full rounded-lg border px-4 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium">Answer</label><textarea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} rows={4} required className="w-full rounded-lg border px-4 py-2" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="faq_active" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /><label htmlFor="faq_active">Active</label></div>
              <div className="flex gap-2"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {toast.show && <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>{toast.message}</div>}
    </div>
  )
}
