'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'
import type { PropertyType } from '@/types/database'

export default function PropertyTypesPage() {
  const [items, setItems] = useState<PropertyType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PropertyType | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; success: boolean }>({ show: false, message: '', success: false })

  function showToast(message: string, success: boolean) {
    setToast({ show: true, message, success })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000)
  }

  async function fetchTypes() {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase.from(TABLE.property_type).select('id, name, description').order('name')
    setLoading(false)
    if (e) {
      setError(e.message)
      return
    }
    setItems((data as PropertyType[]) ?? [])
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  function openCreate() {
    setEditing(null)
    setName('')
    setDescription('')
    setModalOpen(true)
  }

  function openEdit(row: PropertyType) {
    setEditing(row)
    setName(row.name)
    setDescription(row.description ?? '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setName('')
    setDescription('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const trimmedName = name.trim()
    const trimmedDescription = description.trim() || trimmedName
    setSubmitLoading(true)
    if (editing) {
      const { error: e } = await supabase
        .from(TABLE.property_type)
        .update({ name: trimmedName, description: trimmedDescription } as { name: string; description: string })
        .eq('id', editing.id)
      setSubmitLoading(false)
      if (e) {
        showToast(e.message, false)
        return
      }
      showToast('Property type updated.', true)
    } else {
      const { error: e } = await supabase
        .from(TABLE.property_type)
        .insert({ name: trimmedName, description: trimmedDescription } as { name: string; description: string })
      setSubmitLoading(false)
      if (e) {
        showToast(e.message, false)
        return
      }
      showToast('Property type added.', true)
    }
    closeModal()
    fetchTypes()
  }

  async function handleDelete(row: PropertyType) {
    if (!confirm(`Delete "${row.name}"? Properties using this type may be affected.`)) return
    const { error: e } = await supabase.from(TABLE.property_type).delete().eq('id', row.id)
    if (e) {
      showToast(e.message, false)
      return
    }
    showToast('Property type deleted.', true)
    fetchTypes()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Types</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage property types (apartment, villa, house, etc.) for listings.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 flex items-center gap-2 shrink-0"
        >
          <span>+</span> Add Type
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No property types yet. Add one to get started.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <span className="font-medium text-gray-900">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => openEdit(item)} className="text-sm text-primary hover:underline font-medium">Edit</button>
                  <button type="button" onClick={() => handleDelete(item)} className="text-sm text-red-600 hover:underline font-medium">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} aria-hidden />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Property Type' : 'Add Property Type'}</h3>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apartment, Villa, House"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description for this property type"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitLoading} className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50">
                  {submitLoading ? 'Saving…' : editing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${toast.success ? 'bg-gray-800' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
