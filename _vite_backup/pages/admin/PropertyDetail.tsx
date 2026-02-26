import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TABLE } from '../../lib/tableNames'

const BUCKET_MEDIA = 'property-media'

const UNIT_STATUS_LABELS: Record<string, string> = {
  under_construction: 'Under Construction',
  ready_to_move: 'Ready to Move',
}

function formatUnitStatus(status: string | null): string {
  if (!status) return '—'
  return UNIT_STATUS_LABELS[status] ?? status
}

type PropertyRecord = {
  id: number
  title?: string | null
  about_property?: string | null
  price?: number | null
  Bedrooms?: number | null
  Bathrooms?: number | null
  square_feet?: number | null
  year_built?: number | null
  property_Type_id?: number | null
  property_location_id?: number | null
}

type MediaRecord = {
  id: number
  file_url: string
}

type LocationRecord = {
  id: number
  streetaddress: string
  city: string
  state: string
  zip_code: string
}

type TypeRecord = {
  id: number
  name: string
}

type UnitRecord = {
  id: number
  property_id: number
  unit_number: string | null
  floor: number | null
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  price: number | null
  status: string | null
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [property, setProperty] = useState<PropertyRecord | null>(null)
  const [media, setMedia] = useState<MediaRecord[]>([])
  const [units, setUnits] = useState<UnitRecord[]>([])
  const [location, setLocation] = useState<LocationRecord | null>(null)
  const [type, setType] = useState<TypeRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [addingUnit, setAddingUnit] = useState(false)
  const [unitForm, setUnitForm] = useState({ unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' })
  const [bulkUnitRows, setBulkUnitRows] = useState<Array<{ unit_number: string; floor: string; bedrooms: string; bathrooms: string; square_feet: string; price: string; status: string }>>([
    { unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' },
    { unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' },
    { unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' },
  ])
  const [bulkInserting, setBulkInserting] = useState(false)
  const [editingAllUnits, setEditingAllUnits] = useState(false)
  const [editUnitState, setEditUnitState] = useState<Record<number, { unit_number: string; floor: string; bedrooms: string; bathrooms: string; square_feet: string; price: string; status: string }>>({})
  const [savingAllUnits, setSavingAllUnits] = useState(false)

  const mediaInputRef = useRef<HTMLInputElement>(null)

  const isProject = type?.name?.trim().toLowerCase() === 'project'

  // Local editable fields
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [about, setAbout] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [sqft, setSqft] = useState('')
  const [yearBuilt, setYearBuilt] = useState('')

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const propertyId = Number(id)

        const [
          { data: propertyRow, error: propError },
          { data: mediaRows, error: mediaError },
          { data: unitsRows, error: unitsError },
        ] = await Promise.all([
          supabase
            .from(TABLE.properties)
            .select('id, title, about_property, price, Bedrooms, Bathrooms, square_feet, year_built, property_Type_id, property_location_id')
            .eq('id', propertyId)
            .single(),
          supabase.from(TABLE.property_media).select('id, file_url').eq('property_id', propertyId).order('id'),
          supabase.from(TABLE.property_units).select('id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, price, status').eq('property_id', propertyId).order('id'),
        ])

        if (propError) throw propError
        if (mediaError) throw mediaError

        const prop = propertyRow as PropertyRecord
        setProperty(prop)
        setMedia((mediaRows as MediaRecord[]) ?? [])
        if (!unitsError && unitsRows) setUnits(unitsRows as UnitRecord[])
        else setUnits([])

        // Populate editable fields
        setTitle(prop.title ?? '')
        setPrice(prop.price != null ? String(prop.price) : '')
        setAbout(prop.about_property ?? '')
        setBedrooms(prop.Bedrooms != null ? String(prop.Bedrooms) : '')
        setBathrooms(prop.Bathrooms != null ? String(prop.Bathrooms) : '')
        setSqft(prop.square_feet != null ? String(prop.square_feet) : '')
        setYearBuilt(prop.year_built != null ? String(prop.year_built) : '')

        // Load related type and location if present
        const [typeRowRes, locationRowRes] = await Promise.all([
          prop.property_Type_id
            ? supabase.from(TABLE.property_type).select('id, name').eq('id', prop.property_Type_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          prop.property_location_id
            ? supabase
                .from(TABLE.property_location)
                .select('id, streetaddress, city, state, zip_code')
                .eq('id', prop.property_location_id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ])

        if (typeRowRes.error) {
          console.error('Error loading property type:', typeRowRes.error)
        } else {
          setType((typeRowRes.data as TypeRecord) ?? null)
        }

        if (locationRowRes.error) {
          console.error('Error loading property location:', locationRowRes.error)
        } else {
          setLocation((locationRowRes.data as LocationRecord) ?? null)
        }
      } catch (e: any) {
        console.error('Failed to load property:', e)
        setError(e?.message || 'Failed to load property.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  async function handleSave() {
    if (!property) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const priceNum = price ? Number(price) : null
      const bedroomsNum = bedrooms ? Number(bedrooms) : null
      const bathroomsNum = bathrooms ? Number(bathrooms) : null
      const sqftNum = sqft ? Number(sqft) : null
      const yearBuiltNum = yearBuilt ? Number(yearBuilt) : null

      const updatePayload: any = {
        title: title.trim(),
        about_property: about.trim(),
        price: priceNum,
        Bedrooms: bedroomsNum,
        Bathrooms: bathroomsNum,
        square_feet: sqftNum,
        year_built: yearBuiltNum,
      }

      const { error: updateError } = await supabase
        .from(TABLE.properties)
        .update(updatePayload)
        .eq('id', property.id)

      if (updateError) throw updateError

      setSuccess('Property updated successfully.')
    } catch (e: any) {
      console.error('Failed to update property:', e)
      setError(e?.message || 'Failed to update property.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault()
    if (!property) return
    setError(null)
    setSuccess(null)
    try {
      const { error: insertError } = await supabase.from(TABLE.property_units).insert({
        property_id: property.id,
        unit_number: unitForm.unit_number.trim() || null,
        floor: unitForm.floor ? Number(unitForm.floor) : null,
        bedrooms: unitForm.bedrooms ? Number(unitForm.bedrooms) : null,
        bathrooms: unitForm.bathrooms ? Number(unitForm.bathrooms) : null,
        square_feet: unitForm.square_feet ? Number(unitForm.square_feet) : null,
        price: unitForm.price ? Number(unitForm.price) : null,
        status: unitForm.status || 'under_construction',
      })
      if (insertError) throw insertError
      setSuccess('Unit added.')
      setUnitForm({ unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'available' })
      setAddingUnit(false)
      const { data } = await supabase.from(TABLE.property_units).select('id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, price, status').eq('property_id', property.id).order('id')
      setUnits((data as UnitRecord[]) ?? [])
    } catch (err: any) {
      setError(err?.message || 'Failed to add unit.')
    }
  }

  async function handleDeleteUnit(unitId: number) {
    if (!property || !confirm('Remove this unit?')) return
    setError(null)
    try {
      const { error: delError } = await supabase.from(TABLE.property_units).delete().eq('id', unitId)
      if (delError) throw delError
      setUnits((prev) => prev.filter((u) => u.id !== unitId))
      setSuccess('Unit removed.')
    } catch (err: any) {
      setError(err?.message || 'Failed to remove unit.')
    }
  }

  async function handleBulkInsertUnits(e: React.FormEvent) {
    e.preventDefault()
    if (!property) return
    const toInsert = bulkUnitRows
      .map((r) => ({
        unit_number: r.unit_number.trim() || null,
        floor: r.floor ? Number(r.floor) : null,
        bedrooms: r.bedrooms ? Number(r.bedrooms) : null,
        bathrooms: r.bathrooms ? Number(r.bathrooms) : null,
        square_feet: r.square_feet ? Number(r.square_feet) : null,
        price: r.price ? Number(r.price) : null,
        status: r.status || 'under_construction',
      }))
      .filter((r) => r.unit_number != null || r.price != null || r.bedrooms != null)
    if (toInsert.length === 0) {
      setError('Add at least one unit with unit #, price, or bedrooms.')
      return
    }
    setBulkInserting(true)
    setError(null)
    try {
      const rows = toInsert.map((r) => ({ property_id: property.id, ...r }))
      const { error: insertError } = await supabase.from(TABLE.property_units).insert(rows)
      if (insertError) throw insertError
      setSuccess(`Inserted ${rows.length} unit(s).`)
      setBulkUnitRows([
        { unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' },
        { unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' },
        { unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' },
      ])
      const { data } = await supabase.from(TABLE.property_units).select('id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, price, status').eq('property_id', property.id).order('id')
      setUnits((data as UnitRecord[]) ?? [])
    } catch (err: any) {
      setError(err?.message || 'Bulk insert failed.')
    } finally {
      setBulkInserting(false)
    }
  }

  function startEditAllUnits() {
    const state: Record<number, { unit_number: string; floor: string; bedrooms: string; bathrooms: string; square_feet: string; price: string; status: string }> = {}
    units.forEach((u) => {
      state[u.id] = {
        unit_number: u.unit_number ?? '',
        floor: u.floor != null ? String(u.floor) : '',
        bedrooms: u.bedrooms != null ? String(u.bedrooms) : '',
        bathrooms: u.bathrooms != null ? String(u.bathrooms) : '',
        square_feet: u.square_feet != null ? String(u.square_feet) : '',
        price: u.price != null ? String(u.price) : '',
        status: u.status ?? 'under_construction',
      }
    })
    setEditUnitState(state)
    setEditingAllUnits(true)
  }

  async function handleSaveAllUnits() {
    if (!property) return
    setSavingAllUnits(true)
    setError(null)
    try {
      for (const u of units) {
        const e = editUnitState[u.id]
        if (!e) continue
        const { error: upErr } = await supabase
          .from(TABLE.property_units)
          .update({
            unit_number: e.unit_number.trim() || null,
            floor: e.floor ? Number(e.floor) : null,
            bedrooms: e.bedrooms ? Number(e.bedrooms) : null,
            bathrooms: e.bathrooms ? Number(e.bathrooms) : null,
            square_feet: e.square_feet ? Number(e.square_feet) : null,
            price: e.price ? Number(e.price) : null,
            status: e.status || null,
          })
          .eq('id', u.id)
        if (upErr) throw upErr
      }
      setSuccess('All units updated.')
      setEditingAllUnits(false)
      const { data } = await supabase.from(TABLE.property_units).select('id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, price, status').eq('property_id', property.id).order('id')
      setUnits((data as UnitRecord[]) ?? [])
    } catch (err: any) {
      setError(err?.message || 'Failed to save units.')
    } finally {
      setSavingAllUnits(false)
    }
  }

  async function handleAddMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0 || !property) return
    setUploadingMedia(true)
    setError(null)
    const bucket = BUCKET_MEDIA
    try {
      for (const file of selected) {
        const path = `${property.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        const { error: mediaError } = await supabase.from(TABLE.property_media).insert({ property_id: property.id, file_url: data.publicUrl })
        if (mediaError) throw mediaError
      }
      setSuccess('Media added.')
      const { data: mediaRows } = await supabase.from(TABLE.property_media).select('id, file_url').eq('property_id', property.id).order('id')
      setMedia((mediaRows as MediaRecord[]) ?? [])
    } catch (err: any) {
      setError(err?.message || 'Failed to upload media.')
    } finally {
      setUploadingMedia(false)
      e.target.value = ''
    }
  }

  function isVideoUrl(url: string) {
    const u = url.toLowerCase()
    return u.includes('.mp4') || u.includes('.webm') || u.includes('.mov') || u.includes('video')
  }

  async function handleDelete() {
    if (!property || deleting) return
    if (!confirm('Delete this property? This action cannot be undone.')) return

    setDeleting(true)
    setError(null)

    try {
      const propertyId = property.id

      const [{ error: mediaError }, { error: pivotError }, { error: unitsError }] = await Promise.all([
        supabase.from(TABLE.property_media).delete().eq('property_id', propertyId),
        supabase.from(TABLE.property_amenities).delete().eq('property_id', propertyId),
        supabase.from(TABLE.property_units).delete().eq('property_id', propertyId),
      ])

      if (mediaError) {
        console.error('Failed to delete property media:', mediaError)
        throw mediaError
      }
      if (pivotError) {
        console.error('Failed to delete property amenities:', pivotError)
        throw pivotError
      }
      if (unitsError) {
        console.error('Failed to delete property units:', unitsError)
        throw unitsError
      }

      const { error: propError } = await supabase.from(TABLE.properties).delete().eq('id', propertyId)
      if (propError) throw propError

      navigate('/admin/properties')
    } catch (e: any) {
      console.error('Failed to delete property:', e)
      setError(e?.message || 'Failed to delete property.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading property…
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-8 text-center text-gray-500">
        Property not found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property #{property.id}</h1>
          {type && <p className="text-sm text-gray-500 mt-1">{type.name}</p>}
        </div>
        <Link to="/admin/properties" className="text-primary hover:underline text-sm font-medium">
          ← Back to List
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Basic Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
              <input
                type="text"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
              <input
                type="text"
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 font-medium disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete Property'}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Location</h2>
          {location ? (
            <div className="text-sm text-gray-700 space-y-1">
              <div>{location.streetaddress}</div>
              <div>
                {location.city}, {location.state} {location.zip_code}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No location data.</div>
          )}

          <h2 className="font-bold text-gray-900 mt-6">Media</h2>
          {media.length === 0 ? (
            <div className="text-sm text-gray-500">No images or videos yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {media.map((m, index) => (
                <div key={m.id} className="relative rounded-lg overflow-hidden border border-gray-200">
                  {index === 0 && (
                    <span className="absolute top-1 left-1 z-10 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary text-white">
                      COVER
                    </span>
                  )}
                  {isVideoUrl(m.file_url) ? (
                    <video src={m.file_url} controls className="w-full h-28 object-cover" />
                  ) : (
                    <img src={m.file_url} alt={`Property media ${index + 1}`} className="w-full h-28 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleAddMedia}
            />
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={uploadingMedia}
              className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
            >
              {uploadingMedia ? 'Uploading…' : '+ Add more images or videos'}
            </button>
          </div>
        </section>
      </div>

      {isProject && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Units</h2>
          <p className="text-sm text-gray-600">Add units for this project. Each unit can have its own bedrooms, bathrooms, square feet, and price.</p>

          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Bulk add units (one submit)</h3>
            <form onSubmit={handleBulkInsertUnits} className="space-y-2">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="py-1 pr-2">Unit #</th>
                      <th className="py-1 pr-2">Floor</th>
                      <th className="py-1 pr-2">Beds</th>
                      <th className="py-1 pr-2">Baths</th>
                      <th className="py-1 pr-2">Sq ft</th>
                      <th className="py-1 pr-2">Price</th>
                      <th className="py-1 pr-2">Status</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bulkUnitRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-1 pr-2"><input type="text" value={row.unit_number} onChange={(e) => setBulkUnitRows((prev) => { const n = [...prev]; n[idx] = { ...n[idx], unit_number: e.target.value }; return n; })} placeholder="101" className="w-16 px-1.5 py-1 border rounded" /></td>
                        <td className="py-1 pr-2"><input type="number" value={row.floor} onChange={(e) => setBulkUnitRows((prev) => { const n = [...prev]; n[idx] = { ...n[idx], floor: e.target.value }; return n; })} className="w-14 px-1.5 py-1 border rounded" /></td>
                        <td className="py-1 pr-2"><input type="number" value={row.bedrooms} onChange={(e) => setBulkUnitRows((prev) => { const n = [...prev]; n[idx] = { ...n[idx], bedrooms: e.target.value }; return n; })} className="w-14 px-1.5 py-1 border rounded" /></td>
                        <td className="py-1 pr-2"><input type="number" value={row.bathrooms} onChange={(e) => setBulkUnitRows((prev) => { const n = [...prev]; n[idx] = { ...n[idx], bathrooms: e.target.value }; return n; })} className="w-14 px-1.5 py-1 border rounded" /></td>
                        <td className="py-1 pr-2"><input type="text" value={row.square_feet} onChange={(e) => setBulkUnitRows((prev) => { const n = [...prev]; n[idx] = { ...n[idx], square_feet: e.target.value }; return n; })} className="w-16 px-1.5 py-1 border rounded" /></td>
                        <td className="py-1 pr-2"><input type="text" value={row.price} onChange={(e) => setBulkUnitRows((prev) => { const n = [...prev]; n[idx] = { ...n[idx], price: e.target.value }; return n; })} placeholder="0" className="w-20 px-1.5 py-1 border rounded" /></td>
                        <td className="py-1 pr-2">
                          <select value={row.status} onChange={(e) => setBulkUnitRows((prev) => { const n = [...prev]; n[idx] = { ...n[idx], status: e.target.value }; return n; })} className="px-1.5 py-1 border rounded text-xs">
                            <option value="under_construction">Under Construction</option>
                            <option value="ready_to_move">Ready to Move</option>
                          </select>
                        </td>
                        <td className="py-1">
                          {bulkUnitRows.length > 1 && (
                            <button type="button" onClick={() => setBulkUnitRows((prev) => prev.filter((_, i) => i !== idx))} className="text-red-600 text-xs">×</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => setBulkUnitRows((prev) => [...prev, { unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' }])} className="text-sm text-primary hover:underline">+ Add row</button>
                <button type="submit" disabled={bulkInserting} className="px-3 py-1.5 rounded bg-primary text-white text-sm font-medium disabled:opacity-50">{bulkInserting ? 'Inserting…' : 'Insert all'}</button>
              </div>
            </form>
          </div>

          {units.length > 0 && (
            <div className="overflow-x-auto">
              {!editingAllUnits ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Existing units</span>
                    <button type="button" onClick={startEditAllUnits} className="text-sm text-primary hover:underline font-medium">Edit all units</button>
                  </div>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200">
                        <th className="py-2 pr-4">Unit #</th>
                        <th className="py-2 pr-4">Floor</th>
                        <th className="py-2 pr-4">Beds</th>
                        <th className="py-2 pr-4">Baths</th>
                        <th className="py-2 pr-4">Sq ft</th>
                        <th className="py-2 pr-4">Price</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {units.map((u) => (
                        <tr key={u.id}>
                          <td className="py-2 pr-4">{u.unit_number ?? '—'}</td>
                          <td className="py-2 pr-4">{u.floor ?? '—'}</td>
                          <td className="py-2 pr-4">{u.bedrooms ?? '—'}</td>
                          <td className="py-2 pr-4">{u.bathrooms ?? '—'}</td>
                          <td className="py-2 pr-4">{u.square_feet ?? '—'}</td>
                          <td className="py-2 pr-4">{u.price != null ? `$${u.price.toLocaleString()}` : '—'}</td>
                          <td className="py-2 pr-4">{formatUnitStatus(u.status)}</td>
                          <td className="py-2">
                            <button type="button" onClick={() => handleDeleteUnit(u.id)} className="text-red-600 hover:underline text-xs">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Edit all</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSaveAllUnits} disabled={savingAllUnits} className="px-3 py-1.5 rounded bg-primary text-white text-sm font-medium disabled:opacity-50">Save all</button>
                      <button type="button" onClick={() => setEditingAllUnits(false)} className="px-3 py-1.5 rounded border border-gray-300 text-sm">Cancel</button>
                    </div>
                  </div>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200">
                        <th className="py-2 pr-2">Unit #</th>
                        <th className="py-2 pr-2">Floor</th>
                        <th className="py-2 pr-2">Beds</th>
                        <th className="py-2 pr-2">Baths</th>
                        <th className="py-2 pr-2">Sq ft</th>
                        <th className="py-2 pr-2">Price</th>
                        <th className="py-2 pr-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {units.map((u) => {
                        const e = editUnitState[u.id]
                        if (!e) return null
                        return (
                          <tr key={u.id}>
                            <td className="py-1 pr-2"><input type="text" value={e.unit_number} onChange={(ev) => setEditUnitState((s) => ({ ...s, [u.id]: { ...s[u.id], unit_number: ev.target.value } }))} className="w-16 px-1.5 py-1 border rounded" /></td>
                            <td className="py-1 pr-2"><input type="number" value={e.floor} onChange={(ev) => setEditUnitState((s) => ({ ...s, [u.id]: { ...s[u.id], floor: ev.target.value } }))} className="w-14 px-1.5 py-1 border rounded" /></td>
                            <td className="py-1 pr-2"><input type="number" value={e.bedrooms} onChange={(ev) => setEditUnitState((s) => ({ ...s, [u.id]: { ...s[u.id], bedrooms: ev.target.value } }))} className="w-14 px-1.5 py-1 border rounded" /></td>
                            <td className="py-1 pr-2"><input type="number" value={e.bathrooms} onChange={(ev) => setEditUnitState((s) => ({ ...s, [u.id]: { ...s[u.id], bathrooms: ev.target.value } }))} className="w-14 px-1.5 py-1 border rounded" /></td>
                            <td className="py-1 pr-2"><input type="text" value={e.square_feet} onChange={(ev) => setEditUnitState((s) => ({ ...s, [u.id]: { ...s[u.id], square_feet: ev.target.value } }))} className="w-16 px-1.5 py-1 border rounded" /></td>
                            <td className="py-1 pr-2"><input type="text" value={e.price} onChange={(ev) => setEditUnitState((s) => ({ ...s, [u.id]: { ...s[u.id], price: ev.target.value } }))} className="w-20 px-1.5 py-1 border rounded" /></td>
                            <td className="py-1 pr-2">
                              <select value={e.status} onChange={(ev) => setEditUnitState((s) => ({ ...s, [u.id]: { ...s[u.id], status: ev.target.value } }))} className="px-1.5 py-1 border rounded text-xs">
                                <option value="under_construction">Under Construction</option>
                                <option value="ready_to_move">Ready to Move</option>
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {!addingUnit ? (
            <button
              type="button"
              onClick={() => setAddingUnit(true)}
              className="px-3 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5"
            >
              + Add unit
            </button>
          ) : (
            <form onSubmit={handleAddUnit} className="p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Unit #</label>
                  <input
                    type="text"
                    value={unitForm.unit_number}
                    onChange={(e) => setUnitForm((f) => ({ ...f, unit_number: e.target.value }))}
                    placeholder="e.g. 101"
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Floor</label>
                  <input
                    type="number"
                    value={unitForm.floor}
                    onChange={(e) => setUnitForm((f) => ({ ...f, floor: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Bedrooms</label>
                  <input
                    type="number"
                    value={unitForm.bedrooms}
                    onChange={(e) => setUnitForm((f) => ({ ...f, bedrooms: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Bathrooms</label>
                  <input
                    type="number"
                    value={unitForm.bathrooms}
                    onChange={(e) => setUnitForm((f) => ({ ...f, bathrooms: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Square feet</label>
                  <input
                    type="text"
                    value={unitForm.square_feet}
                    onChange={(e) => setUnitForm((f) => ({ ...f, square_feet: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Price</label>
                  <input
                    type="text"
                    value={unitForm.price}
                    onChange={(e) => setUnitForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-0.5">Status</label>
                  <select
                    value={unitForm.status}
                    onChange={(e) => setUnitForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm rounded border border-gray-200"
                  >
                    <option value="under_construction">Under Construction</option>
                    <option value="ready_to_move">Ready to Move</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 rounded bg-primary text-white text-sm font-medium">
                  Save unit
                </button>
                <button type="button" onClick={() => { setAddingUnit(false); setUnitForm({ unit_number: '', floor: '', bedrooms: '', bathrooms: '', square_feet: '', price: '', status: 'under_construction' }) }} className="px-3 py-1.5 rounded border border-gray-300 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  )
}

