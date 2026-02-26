import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TABLE } from '../../lib/tableNames'
import type { Amenity, PropertyType } from '../../types/database'

const STEPS = [
  { id: 1, title: 'Basic information', subtitle: 'Title, Price & Type' },
  { id: 2, title: 'Location', subtitle: 'Address & Map' },
  { id: 3, title: 'Features', subtitle: 'Amenities & Specs' },
]

export default function AddProperty() {
  const [step, setStep] = useState(1)
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loadingLookups, setLoadingLookups] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: '',
    price: '',
    street: '123 Luxury Way',
    city: 'Los Angeles',
    state: 'California',
    zip: '90210',
    bedrooms: '0',
    bathrooms: '0',
    sqft: '',
    yearBuilt: '2023',
    amenities: [] as string[],
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()

  // Load dynamic options from Supabase so admin-created data is reflected
  useEffect(() => {
    async function loadLookups() {
      setLoadingLookups(true)
      const [typesRes, amenitiesRes] = await Promise.all([
        supabase.from(TABLE.property_type).select('id, name').order('name'),
        supabase.from(TABLE.amenities).select('id, name').order('name'),
      ])

      if (!typesRes.error && typesRes.data) {
        setPropertyTypes(typesRes.data as PropertyType[])
      }
      if (!amenitiesRes.error && amenitiesRes.data) {
        setAmenities(amenitiesRes.data as Amenity[])
      }
      setLoadingLookups(false)
    }

    loadLookups()
  }, [])

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return
    setFiles(selected)
    setPreviews(
      selected.map((file) => ({
        url: file.type.startsWith('video/') ? '' : URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
      }))
    )
  }

  const isProject =
    form.propertyType &&
    propertyTypes.some(
      (t) => String(t.id) === form.propertyType && t.name?.trim().toLowerCase() === 'project'
    )

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click()
  }

  async function uploadImages(propertyId: number) {
    if (files.length === 0) return
    const bucket = 'property-media'

    const uploads = files.map(async (file) => {
      const path = `${propertyId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError)
        throw uploadError
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      const publicUrl = data.publicUrl

      const { error: mediaError } = await supabase
        .from(TABLE.property_media)
        .insert({ property_id: propertyId, file_url: publicUrl })
      if (mediaError) {
        console.error('Supabase media insert error:', mediaError)
        throw mediaError
      }
    })

    await Promise.all(uploads)
  }

  async function handlePublish() {
    if (!form.title.trim()) {
      setSubmitError('Title is required.')
      return
    }
    if (!form.propertyType) {
      setSubmitError('Property type is required.')
      return
    }
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim()) {
      setSubmitError('All location fields (street, city, state, zip) are required.')
      return
    }

    const typeId = Number(form.propertyType)
    const selectedType = propertyTypes.find((t) => String(t.id) === form.propertyType)
    const listingType = selectedType?.name ?? null
    const isProjectType = listingType?.trim().toLowerCase() === 'project'

    if (!isProjectType) {
      if (!form.price?.trim()) {
        setSubmitError('Asking price is required for non-Project properties.')
        return
      }
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const price = form.price ? Number(form.price) : null
      const bedrooms = form.bedrooms ? Number(form.bedrooms) : null
      const bathrooms = form.bathrooms ? Number(form.bathrooms) : null
      const sqft = form.sqft ? Number(form.sqft) : null
      const yearBuilt = form.yearBuilt ? Number(form.yearBuilt) : null

      // 1) Insert / persist location in Property_location
      const locationPayload = {
        streetaddress: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip_code: form.zip.trim(),
      }

      const { data: locationRow, error: locationError } = await supabase
        .from(TABLE.property_location)
        .insert(locationPayload)
        .select('id')
        .single()

      if (locationError) {
        throw locationError
      }

      const locationId = locationRow?.id as number

      // 2) Insert property row — minimal for Project, full for non-Project
      const insertPayload: any = {
        title: form.title.trim(),
        about_property: form.description.trim(),
        property_Type_id: typeId,
        property_location_id: locationId,
        listing_type: listingType,
      }

      if (isProjectType) {
        // Project: do NOT send Bedrooms, Bathrooms, square_feet, price
        // (they will stay at DB defaults / NULL as per your schema)
        insertPayload.year_built = yearBuilt ?? null
      } else {
        insertPayload.price = price
        insertPayload.Bedrooms = bedrooms
        insertPayload.Bathrooms = bathrooms
        insertPayload.square_feet = sqft
        insertPayload.year_built = yearBuilt
      }

      const { data: propertyRow, error: insertError } = await supabase
        .from(TABLE.properties)
        .insert(insertPayload)
        .select('id')
        .single()

      if (insertError) {
        throw insertError
      }

      const propertyId = propertyRow?.id as number

      // Insert pivot rows for property_amenities (both Project and non-Project)
      if (propertyId && form.amenities.length > 0) {
        const rows = form.amenities.map((amenityId) => ({
          property_id: propertyId,
          amenity_id: Number(amenityId),
        }))
        const { error: pivotError } = await supabase.from(TABLE.property_amenities).insert(rows)
        if (pivotError) throw pivotError
      }

      // Upload images/videos and create media records (both flows)
      if (propertyId) {
        await uploadImages(propertyId)
      }

      if (isProjectType) {
        navigate(`/admin/properties/${propertyId}`)
      } else {
        navigate('/admin/properties')
      }
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to publish property.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-sm text-gray-500 mt-0.5">Draft saved 2 minutes ago</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium">
            Save Draft
          </button>
          <button type="button" className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">
            Publish Property
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s.id}
            </div>
            <span className={step === s.id ? 'font-medium text-gray-900' : 'text-gray-500'}>
              Step {s.id}: {s.title}
            </span>
            {s.id < STEPS.length && <span className="text-gray-300">—</span>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">General Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
            <input
              type="text"
              placeholder="e.g. Modern Minimalist Villa in Beverly Hills"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Describe the property's unique features, neighborhood, and selling points..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={form.propertyType}
                onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select type...</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asking Price (USD) {isProject && <span className="text-gray-500 font-normal">(optional for Project)</span>}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Location Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={form.street}
              onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
              <input type="text" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input type="text" value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Map</label>
            <div className="h-64 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center relative">
              <span className="text-gray-500">Map placeholder</span>
              <button type="button" className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
                Pin Location on Map
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <>
          {!isProject && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Key Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input type="text" value={form.bathrooms} onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                  <input type="text" placeholder="e.g. 2400" value={form.sqft} onChange={(e) => setForm((f) => ({ ...f, sqft: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                  <input type="text" value={form.yearBuilt} onChange={(e) => setForm((f) => ({ ...f, yearBuilt: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>
            </section>
          )}
          {isProject && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <p className="text-sm text-gray-600">For Project type, add unit-level details (bedrooms, bathrooms, price per unit) after publishing.</p>
            </section>
          )}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Amenities & Facilities</h2>
            {loadingLookups ? (
              <div className="text-gray-500 text-sm">Loading amenities…</div>
            ) : amenities.length === 0 ? (
              <div className="text-gray-500 text-sm">No amenities defined yet. Add some in the Amenities page.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenities.map((a) => {
                  const idStr = String(a.id)
                  return (
                    <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.amenities.includes(idStr)}
                        onChange={() => toggleAmenity(idStr)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{a.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </section>
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Property Media</h2>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer"
              onClick={handleOpenFileDialog}
            >
              <p className="text-gray-600">Drag and drop or click to add images and videos. JPG, PNG, WEBP, MP4, etc.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              {previews.map((p, index) => (
                <div key={`${p.url}-${index}`} className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden relative flex items-center justify-center">
                  {index === 0 && (
                    <span className="text-xs font-medium text-white bg-primary/80 px-1.5 py-0.5 rounded absolute top-1 left-1 z-10">
                      COVER
                    </span>
                  )}
                  {p.isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-300 text-gray-600 text-xs p-1">
                      <svg className="w-8 h-8 mb-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7zM4 19h14V5H4z" /></svg>
                      <span className="truncate w-full text-center">{files[index]?.name ?? 'Video'}</span>
                    </div>
                  ) : (
                    <img src={p.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
              {previews.length === 0 && (
                <>
                  <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center relative">
                    <span className="text-xs font-medium text-white bg-primary/80 px-1.5 py-0.5 rounded absolute top-1 left-1">
                      COVER
                    </span>
                  </div>
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl text-gray-400">
                    +
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
        <Link to="/admin/properties" className="text-primary hover:underline font-medium">← Back to List</Link>
        <div className="flex gap-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium">Back</button>
          )}
          {step < 3 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">Next</button>
          ) : (
            <>
              <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium">Discard</button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Publishing…' : 'Publish Property'}
              </button>
            </>
          )}
        </div>
      </div>
      {submitError && (
        <div className="mt-4 text-sm text-red-600">
          {submitError}
        </div>
      )}
    </div>
  )
}
