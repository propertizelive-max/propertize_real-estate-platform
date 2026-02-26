import { createClient } from '@/lib/supabase/server'
import { TABLE } from './tableNames'
import type {
  PropertyWithDetails,
  PropertyWithMedia,
  LocationRow,
  MediaRow,
  PropertyUnitRow,
  AmenityRow,
} from './propertyApi'

/**
 * Fetch single property by ID (server-side).
 */
export async function fetchPropertyByIdServer(id: number): Promise<PropertyWithDetails | null> {
  const supabase = await createClient()

  const { data: prop, error: propError } = await supabase
    .from(TABLE.properties)
    .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, about_property, listing_type, property_location_id')
    .eq('id', id)
    .single()

  if (propError || !prop) return null

  const [mediaRes, locRes, unitsRes, amenityRes] = await Promise.all([
    supabase.from(TABLE.property_media).select('id, file_url').eq('property_id', id).order('id'),
    prop.property_location_id
      ? supabase.from(TABLE.property_location).select('id, streetaddress, city, state, zip_code').eq('id', prop.property_location_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from(TABLE.property_units).select('id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, price').eq('property_id', id).order('id'),
    supabase
      .from(TABLE.property_amenities)
      .select('amenity_id')
      .eq('property_id', id)
      .then(async (r) => {
        if (r.error || !r.data?.length) return { data: [] }
        const ids = r.data.map((x: { amenity_id: number }) => x.amenity_id)
        const { data } = await supabase.from(TABLE.amenities).select('id, name').in('id', ids)
        return { data: data ?? [] }
      }),
  ])

  const location = locRes.data as LocationRow | null
  const media = (mediaRes.data ?? []) as MediaRow[]
  const units = (unitsRes.data ?? []) as PropertyUnitRow[]
  const amenities = (amenityRes.data ?? []) as AmenityRow[]

  return {
    ...prop,
    media,
    location,
    units,
    amenities,
  } as PropertyWithDetails
}

/**
 * Fetch similar properties (server-side).
 */
export async function fetchSimilarPropertiesServer(
  listingType: string,
  excludeId: number,
  limit = 3
): Promise<PropertyWithMedia[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from(TABLE.properties)
    .select('id, title, price, Bedrooms, Bathrooms, square_feet, property_location_id')
    .eq('listing_type', listingType)
    .neq('id', excludeId)
    .order('id', { ascending: false })
    .limit(limit)

  if (error || !rows?.length) return []

  const ids = rows.map((r) => r.id)
  const [mediaRes, locRes] = await Promise.all([
    supabase.from(TABLE.property_media).select('id, property_id, file_url').in('property_id', ids).order('id'),
    supabase.from(TABLE.property_location).select('id, streetaddress, city, state, zip_code'),
  ])

  const mediaByProperty: Record<number, MediaRow[]> = {}
  ;(mediaRes.data ?? []).forEach((m: { property_id: number; id: number; file_url: string }) => {
    if (!mediaByProperty[m.property_id]) mediaByProperty[m.property_id] = []
    mediaByProperty[m.property_id].push({ id: m.id, file_url: m.file_url })
  })

  const locMap: Record<number, LocationRow> = {}
  ;(locRes.data ?? []).forEach((l: LocationRow) => {
    locMap[l.id] = l
  })

  return rows.map((r) => ({
    ...r,
    media: mediaByProperty[r.id] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id] ?? null : null,
  })) as PropertyWithMedia[]
}

export type PropertySlugEntry = { id: number; title: string | null }

/**
 * Fetch all property IDs and titles for sitemap generation.
 */
export async function fetchAllPropertySlugs(): Promise<PropertySlugEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from(TABLE.properties)
    .select('id, title')
    .order('id', { ascending: false })

  if (error || !data?.length) return []
  return data as PropertySlugEntry[]
}
