import { supabase } from './supabase'
import { TABLE } from './tableNames'

export type ListingType = 'Project' | 'Rent' | 'Resale'

export type PropertyRow = {
  id: number
  title: string | null
  price: number | null
  Bedrooms: number | null
  Bathrooms: number | null
  square_feet: number | null
  year_built: number | null
  about_property: string | null
  listing_type: string | null
  property_Type_id: number | null
  property_location_id: number | null
  status?: string | null
}

export type LocationRow = {
  id: number
  streetaddress: string
  city: string
  state: string
  zip_code: string
}

export type MediaRow = {
  id: number
  file_url: string
}

export type PropertyUnitRow = {
  id: number
  property_id: number
  unit_number: string | null
  floor: number | null
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  price: number | null
  status?: string | null
}

export type AmenityRow = {
  id: number
  name: string
}

export type PropertyWithMedia = PropertyRow & {
  media: MediaRow[]
  location: LocationRow | null
}

export type PropertyWithDetails = PropertyRow & {
  media: MediaRow[]
  location: LocationRow | null
  units: PropertyUnitRow[]
  amenities: AmenityRow[]
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'

/** Indian notation: Cr+ (crore), Lakh. Fetched from Supabase; supports full amount or crore/lakh values. */
export function formatPrice(price: number | null): string {
  if (price == null) return '—'
  // Full amount (e.g. 26000000): show as 2.6 Cr+, 1.7 Lakh, etc.
  if (price >= 1_00_00_000) return `${(price / 1_00_00_000).toFixed(1)} Cr+`
  if (price >= 1_00_000) return `${(price / 1_00_000).toFixed(1)} Lakh`
  if (price >= 1_000) return `${(price / 1_000).toFixed(1)} K`
  // Stored in crores (e.g. 2 or 2.6): append " Cr+"
  if (price >= 1) {
    const cr = price % 1 === 0 ? String(Math.round(price)) : price.toFixed(1)
    return `${cr} Cr+`
  }
  // Stored as fraction of crore = lakh (e.g. 0.17 = 17 Lakh): show as Lakh
  if (price >= 0.01) return `${(price * 100).toFixed(1)} Lakh`
  return String(price)
}

export type SearchMeta = {
  cities: string[]
  priceRanges: {
    Project: PriceRange
    Rent: PriceRange
    Resale: PriceRange
  }
  propertyTypes: { id: number; name: string }[]
}

/** Fetch distinct cities, per-listing-type price ranges, and property types for the hero search bar. */
export async function fetchSearchMeta(): Promise<SearchMeta> {
  const [locRes, typeRes, projectRange, rentRange, resaleRange] = await Promise.all([
    supabase.from(TABLE.property_location).select('city').not('city', 'is', null),
    supabase.from(TABLE.property_type).select('id, name').order('name'),
    fetchProjectPriceRange(),
    fetchRentPriceRange(),
    fetchResalePriceRange(),
  ])

  const citySet = new Set<string>()
  ;(locRes.data ?? []).forEach((row: { city: string | null }) => {
    const c = row.city?.trim()
    if (c) citySet.add(c)
  })
  const cities = Array.from(citySet).sort((a, b) => a.localeCompare(b))

  const propertyTypes = (typeRes.data ?? []) as { id: number; name: string }[]

  const priceRanges = {
    Project: projectRange,
    Rent: rentRange,
    Resale: resaleRange,
  }

  return { cities, priceRanges, propertyTypes }
}

export function formatLocation(loc: LocationRow | null): string {
  if (!loc) return ''
  const parts = [loc.streetaddress, loc.city, loc.state, loc.zip_code].filter(Boolean)
  return parts.join(', ')
}

export function getFirstImage(media: MediaRow[]): string {
  return media.length > 0 ? media[0].file_url : DEFAULT_IMAGE
}

/** Names to match in Property_Types for each listing type (case-insensitive) */
const LISTING_TYPE_NAMES: Record<ListingType, string[]> = {
  Project: ['project'],
  Rent: ['rent', 'rental', 'renter'],
  Resale: ['resale'],
}

/**
 * Fetch properties by listing type. Uses property_Type_id + Property_Types so it works
 * whether or not listing_type column exists. Matches Property_Types.name case-insensitively.
 */
export async function fetchPropertiesByListingType(
  listingType: ListingType
): Promise<PropertyWithMedia[]> {
  // 1) Get Property_Types IDs matching this listing type (e.g. "Rent" or "Rental")
  const typeNames = LISTING_TYPE_NAMES[listingType]
  const typeIds: number[] = []
  for (const name of typeNames) {
    const { data: types } = await supabase
      .from(TABLE.property_type)
      .select('id')
      .ilike('name', name)
    if (types?.length) typeIds.push(...types.map((t: { id: number }) => t.id))
  }
  if (typeIds.length === 0) return []

  // 2) Fetch properties by property_Type_id (works regardless of listing_type column)
  const { data: rows, error } = await supabase
    .from(TABLE.properties)
    .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, listing_type, property_location_id, status, about_property, property_Type_id')
    .in('property_Type_id', typeIds)
    .order('id', { ascending: false })

  if (error) throw error
  if (!rows?.length) return []

  const ids = rows.map((r: PropertyRow) => r.id)
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

  const result = rows.map((r: PropertyRow) => ({
    ...r,
    media: mediaByProperty[r.id] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id] ?? null : null,
  }))
  return result as unknown as PropertyWithMedia[]
}

export type ProjectWithUnits = PropertyWithMedia & {
  units: PropertyUnitRow[]
  amenities: AmenityRow[]
}

/**
 * Fetch projects (listing_type = Project) with units and amenities
 */
export async function fetchProjectsWithUnits(): Promise<ProjectWithUnits[]> {
  const rows = await fetchPropertiesByListingType('Project')
  if (rows.length === 0) return []

  const ids = rows.map((r: PropertyRow) => r.id)

  const [unitsRes, paRes] = await Promise.all([
    supabase
      .from(TABLE.property_units)
      .select('id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, price')
      .in('property_id', ids)
      .order('property_id')
      .order('id'),
    supabase.from(TABLE.property_amenities).select('property_id, amenity_id').in('property_id', ids),
  ])

  const unitsByProperty: Record<number, PropertyUnitRow[]> = {}
  ;(unitsRes.data ?? []).forEach((u: PropertyUnitRow) => {
    if (!unitsByProperty[u.property_id]) unitsByProperty[u.property_id] = []
    unitsByProperty[u.property_id].push(u)
  })

  const amenityIds = [...new Set((paRes.data ?? []).map((x: { amenity_id: number }) => x.amenity_id))]
  const amenityMap: Record<number, AmenityRow> = {}
  if (amenityIds.length > 0) {
    const { data: amenityRows } = await supabase.from(TABLE.amenities).select('id, name').in('id', amenityIds)
    ;(amenityRows ?? []).forEach((a: AmenityRow) => {
      amenityMap[a.id] = a
    })
  }

  const amenitiesByProperty: Record<number, AmenityRow[]> = {}
  ;(paRes.data ?? []).forEach((pa: { property_id: number; amenity_id: number }) => {
    const a = amenityMap[pa.amenity_id]
    if (a) {
      if (!amenitiesByProperty[pa.property_id]) amenitiesByProperty[pa.property_id] = []
      amenitiesByProperty[pa.property_id].push(a)
    }
  })

  return rows.map((r) => ({
    ...r,
    units: unitsByProperty[r.id] ?? [],
    amenities: amenitiesByProperty[r.id] ?? [],
  })) as ProjectWithUnits[]
}

/**
 * Fetch single property by ID with media, location, units (if Project), amenities
 */
export async function fetchPropertyById(id: number): Promise<PropertyWithDetails | null> {
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
      .then(async (res: { data: { amenity_id: number }[] | null; error: unknown }) => {
        if (res.error || !res.data?.length) return { data: [] }
        const ids = res.data.map((x: { amenity_id: number }) => x.amenity_id)
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
 * Fetch similar properties (same listing_type, exclude current id)
 */
export async function fetchSimilarProperties(
  listingType: string,
  excludeId: number,
  limit = 3
): Promise<PropertyWithMedia[]> {
  const { data: rows, error } = await supabase
    .from(TABLE.properties)
    .select('id, title, price, Bedrooms, Bathrooms, square_feet, property_location_id')
    .eq('listing_type', listingType)
    .neq('id', excludeId)
    .order('id', { ascending: false })
    .limit(limit)

  if (error || !rows?.length) return []

  const ids = rows.map((r: Pick<PropertyRow, 'id'>) => r.id)
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

  return rows.map((r: PropertyRow) => ({
    ...r,
    media: mediaByProperty[r.id] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id] ?? null : null,
  })) as PropertyWithMedia[]
}

// ─── Dynamic Filter Types & API ─────────────────────────────────────────────

export type ProjectStatusFilter = 'under_construction' | 'ready_to_move' | null

export type ProjectFilters = {
  projectStatus: ProjectStatusFilter
  minPrice: number | null
  maxPrice: number | null
}

export type RentResaleFilters = {
  minPrice: number | null
  maxPrice: number | null
  bedrooms: number | null
}

export type PriceRange = { min: number; max: number }

/** Resolve project property IDs (uses property_Type_id or listing_type) */
async function getProjectTypeIds(): Promise<number[]> {
  const typeNames = LISTING_TYPE_NAMES['Project']
  const typeIds: number[] = []
  for (const name of typeNames) {
    const { data: types } = await supabase
      .from(TABLE.property_type)
      .select('id')
      .ilike('name', name)
    if (types?.length) typeIds.push(...types.map((t: { id: number }) => t.id))
  }
  return typeIds
}

/**
 * Fetch MIN and MAX price from property_units for projects (listing_type = project).
 */
export async function fetchProjectPriceRange(): Promise<PriceRange> {
  const typeIds = await getProjectTypeIds()
  if (typeIds.length === 0) return { min: 0, max: 0 }

  const { data: propRows } = await supabase
    .from(TABLE.properties)
    .select('id')
    .in('property_Type_id', typeIds)

  const propertyIds = (propRows ?? []).map((r: { id: number }) => r.id)
  if (propertyIds.length === 0) return { min: 0, max: 0 }

  const { data: agg } = await supabase
    .from(TABLE.property_units)
    .select('price')
    .in('property_id', propertyIds)
    .not('price', 'is', null)

  const prices = (agg ?? []).map((r: { price: number }) => r.price).filter((p: number | null): p is number => p != null)
  if (prices.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/**
 * Fetch filtered NEW PROJECTS.
 * Filters: Project Status (property_units.status), Price Range (property_units.price).
 */
export async function fetchFilteredProjects(filters: ProjectFilters): Promise<ProjectWithUnits[]> {
  const typeIds = await getProjectTypeIds()
  if (typeIds.length === 0) return []

  const propertyIds = await getProjectPropertyIdsForUnitsFilter(typeIds, filters)
  if (propertyIds.length === 0) return []

  const [propRes, unitsRes] = await Promise.all([
    supabase
      .from(TABLE.properties)
      .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, listing_type, property_location_id, status, about_property, property_Type_id')
      .in('id', propertyIds)
      .in('property_Type_id', typeIds)
      .order('id', { ascending: false }),
    supabase
      .from(TABLE.property_units)
      .select('id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, price, status')
      .in('property_id', propertyIds)
      .order('property_id')
      .order('id'),
  ])

  const { data: propRows, error: propError } = propRes
  const unitRows = unitsRes.data ?? []

  if (propError) throw propError
  if (!propRows?.length) return []

  const ids = propRows.map((r: PropertyRow) => r.id)
  const [mediaRes, locRes, paRes] = await Promise.all([
    supabase.from(TABLE.property_media).select('id, property_id, file_url').in('property_id', ids).order('id'),
    supabase.from(TABLE.property_location).select('id, streetaddress, city, state, zip_code'),
    supabase.from(TABLE.property_amenities).select('property_id, amenity_id').in('property_id', ids),
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

  const unitsByProperty: Record<number, PropertyUnitRow[]> = {}
  unitRows.forEach((u: PropertyUnitRow) => {
    if (!unitsByProperty[u.property_id]) unitsByProperty[u.property_id] = []
    unitsByProperty[u.property_id].push(u)
  })

  const amenityIds = [...new Set((paRes.data ?? []).map((x: { amenity_id: number }) => x.amenity_id))]
  const amenityMap: Record<number, AmenityRow> = {}
  if (amenityIds.length > 0) {
    const { data: amenityRows } = await supabase.from(TABLE.amenities).select('id, name').in('id', amenityIds)
    ;(amenityRows ?? []).forEach((a: AmenityRow) => {
      amenityMap[a.id] = a
    })
  }
  const amenitiesByProperty: Record<number, AmenityRow[]> = {}
  ;(paRes.data ?? []).forEach((pa: { property_id: number; amenity_id: number }) => {
    const a = amenityMap[pa.amenity_id]
    if (a) {
      if (!amenitiesByProperty[pa.property_id]) amenitiesByProperty[pa.property_id] = []
      amenitiesByProperty[pa.property_id].push(a)
    }
  })

  return propRows.map((r: PropertyRow) => ({
    ...r,
    media: mediaByProperty[r.id] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id] ?? null : null,
    units: unitsByProperty[r.id] ?? [],
    amenities: amenitiesByProperty[r.id] ?? [],
  })) as ProjectWithUnits[]
}

async function getProjectPropertyIdsForUnitsFilter(
  typeIds: number[],
  filters: ProjectFilters
): Promise<number[]> {
  const { data: propRows } = await supabase
    .from(TABLE.properties)
    .select('id')
    .in('property_Type_id', typeIds)
  const allIds = (propRows ?? []).map((r: { id: number }) => r.id)
  if (allIds.length === 0) return []

  let unitsQuery = supabase
    .from(TABLE.property_units)
    .select('property_id, price, status')
    .in('property_id', allIds)

  if (filters.projectStatus) {
    unitsQuery = unitsQuery.eq('status', filters.projectStatus)
  }
  if (filters.minPrice != null && filters.minPrice > 0) {
    unitsQuery = unitsQuery.gte('price', filters.minPrice)
  }
  if (filters.maxPrice != null && filters.maxPrice > 0) {
    unitsQuery = unitsQuery.lte('price', filters.maxPrice)
  }

  const { data: unitRows } = await unitsQuery
  const arr = (unitRows ?? []) as { property_id: number }[]
  const distinctIds: number[] = [...new Set(arr.map((u) => u.property_id))]
  return distinctIds
}

/**
 * Fetch filtered RENT properties.
 * Filters: Price Range, Bedrooms.
 */
export async function fetchFilteredRent(filters: RentResaleFilters): Promise<PropertyWithMedia[]> {
  const typeIds = await getRentResaleTypeIds('Rent')
  if (typeIds.length === 0) return []

  let query = supabase
    .from(TABLE.properties)
    .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, listing_type, property_location_id, status, about_property, property_Type_id')
    .in('property_Type_id', typeIds)
    .order('id', { ascending: false })

  if (filters.minPrice != null && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice != null && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters.bedrooms != null && filters.bedrooms > 0) {
    query = query.eq('Bedrooms', filters.bedrooms)
  }

  const { data: rows, error } = await query
  if (error) throw error
  if (!rows?.length) return []

  const ids = rows.map((r: PropertyRow) => r.id)
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

  return rows.map((r: PropertyRow) => ({
    ...r,
    media: mediaByProperty[r.id] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id] ?? null : null,
  })) as PropertyWithMedia[]
}

/**
 * Fetch filtered RESALE properties.
 * Filters: Price Range, Bedrooms.
 */
export async function fetchFilteredResale(filters: RentResaleFilters): Promise<PropertyWithMedia[]> {
  const typeIds = await getRentResaleTypeIds('Resale')
  if (typeIds.length === 0) return []

  let query = supabase
    .from(TABLE.properties)
    .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, listing_type, property_location_id, status, about_property, property_Type_id')
    .in('property_Type_id', typeIds)
    .order('id', { ascending: false })

  if (filters.minPrice != null && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice != null && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters.bedrooms != null && filters.bedrooms > 0) {
    query = query.eq('Bedrooms', filters.bedrooms)
  }

  const { data: rows, error } = await query
  if (error) throw error
  if (!rows?.length) return []

  const ids = rows.map((r: PropertyRow) => r.id)
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

  return rows.map((r: PropertyRow) => ({
    ...r,
    media: mediaByProperty[r.id] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id] ?? null : null,
  })) as PropertyWithMedia[]
}

async function getRentResaleTypeIds(listingType: 'Rent' | 'Resale'): Promise<number[]> {
  const typeNames = LISTING_TYPE_NAMES[listingType]
  const typeIds: number[] = []
  for (const name of typeNames) {
    const { data: types } = await supabase
      .from(TABLE.property_type)
      .select('id')
      .ilike('name', name)
    if (types?.length) typeIds.push(...types.map((t: { id: number }) => t.id))
  }
  return typeIds
}

/**
 * Fetch MIN and MAX price from properties for rent listings.
 */
export async function fetchRentPriceRange(): Promise<PriceRange> {
  const typeIds = await getRentResaleTypeIds('Rent')
  if (typeIds.length === 0) return { min: 0, max: 0 }
  const { data } = await supabase
    .from(TABLE.properties)
    .select('price')
    .in('property_Type_id', typeIds)
    .not('price', 'is', null)
  const prices = (data ?? []).map((r: { price: number }) => r.price).filter((p: number | null): p is number => p != null)
  if (prices.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/**
 * Fetch MIN and MAX price from properties for resale listings.
 */
export async function fetchResalePriceRange(): Promise<PriceRange> {
  const typeIds = await getRentResaleTypeIds('Resale')
  if (typeIds.length === 0) return { min: 0, max: 0 }
  const { data } = await supabase
    .from(TABLE.properties)
    .select('price')
    .in('property_Type_id', typeIds)
    .not('price', 'is', null)
  const prices = (data ?? []).map((r: { price: number }) => r.price).filter((p: number | null): p is number => p != null)
  if (prices.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

// ─── Global Search ──────────────────────────────────────────────────────────

/** Escape user input for safe use in ILIKE pattern (% and _ are wildcards) */
function escapeLikePattern(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

/**
 * Search properties by title and location fields (streetaddress, city, state, zip_code).
 * Uses ILIKE partial match, case insensitive.
 */
export async function searchProperties(
  searchTerm: string,
  limit?: number
): Promise<PropertyWithMedia[]> {
  const trimmed = searchTerm.trim()
  if (!trimmed) return []

  const pattern = `%${escapeLikePattern(trimmed)}%`

  const [byTitleRes, byLocationRes] = await Promise.all([
    supabase
      .from(TABLE.properties)
      .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, listing_type, property_location_id, status, about_property, property_Type_id')
      .ilike('title', pattern)
      .order('id', { ascending: false })
      .limit(limit ?? 100),
    supabase
      .from(TABLE.property_location)
      .select('id')
      .or(
        `streetaddress.ilike.${pattern},city.ilike.${pattern},state.ilike.${pattern},zip_code.ilike.${pattern}`
      )
      .limit(200),
  ])

  const titleRows = byTitleRes.data ?? []
  const locationIds = (byLocationRes.data ?? []).map((r: { id: number }) => r.id)

  let locationPropRows: Record<string, unknown>[] = []
  if (locationIds.length > 0) {
    const { data } = await supabase
      .from(TABLE.properties)
      .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, listing_type, property_location_id, status, about_property, property_Type_id')
      .in('property_location_id', locationIds)
      .order('id', { ascending: false })
      .limit(limit ?? 100)
    locationPropRows = data ?? []
  }

  const seen = new Set<number>()
  const merged: typeof titleRows = []
  for (const r of [...titleRows, ...locationPropRows]) {
    const id = r.id as number
    if (seen.has(id)) continue
    seen.add(id)
    merged.push(r as (typeof titleRows)[number])
  }

  merged.sort((a: { id: unknown }, b: { id: unknown }) => (b.id as number) - (a.id as number))
  const limited = limit ? merged.slice(0, limit) : merged

  if (limited.length === 0) return []

  const ids = limited.map((r: { id: unknown }) => r.id as number)
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

  return limited.map((r: PropertyRow) => ({
    ...r,
    media: mediaByProperty[r.id as number] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id as number] ?? null : null,
  })) as PropertyWithMedia[]
}

/** Fallback: search strictly by exact city match (case-insensitive) when text search returns nothing. */
export async function searchPropertiesByCity(
  city: string,
): Promise<PropertyWithMedia[]> {
  const cityTrimmed = city.trim()
  if (!cityTrimmed) return []

  const { data: locRows, error: locError } = await supabase
    .from(TABLE.property_location)
    .select('id, streetaddress, city, state, zip_code')
    .ilike('city', cityTrimmed)

  if (locError || !locRows?.length) return []

  const locIds = locRows.map((l: LocationRow) => l.id)

  const { data: propRows, error: propError } = await supabase
    .from(TABLE.properties)
    .select('id, title, price, Bedrooms, Bathrooms, square_feet, year_built, listing_type, property_location_id, status, about_property, property_Type_id')
    .in('property_location_id', locIds)
    .order('id', { ascending: false })

  if (propError || !propRows?.length) return []

  const ids = propRows.map((r: PropertyRow) => r.id as number)
  const [mediaRes] = await Promise.all([
    supabase.from(TABLE.property_media).select('id, property_id, file_url').in('property_id', ids).order('id'),
  ])

  const mediaByProperty: Record<number, MediaRow[]> = {}
  ;(mediaRes.data ?? []).forEach((m: { property_id: number; id: number; file_url: string }) => {
    if (!mediaByProperty[m.property_id]) mediaByProperty[m.property_id] = []
    mediaByProperty[m.property_id].push({ id: m.id, file_url: m.file_url })
  })

  const locMap: Record<number, LocationRow> = {}
  ;(locRows ?? []).forEach((l: LocationRow) => {
    locMap[l.id] = l
  })

  return propRows.map((r: PropertyRow) => ({
    ...r,
    media: mediaByProperty[r.id as number] ?? [],
    location: r.property_location_id ? locMap[r.property_location_id as number] ?? null : null,
  })) as PropertyWithMedia[]
}
