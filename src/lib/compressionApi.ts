import { supabase } from './supabase'
import { TABLE } from './tableNames'
import type { CompareProperty } from '../contexts/CompareContext'

const LISTING_TYPE_MAP = { Project: 1, Rent: 2, Resale: 3 } as const

export async function saveCompression(
  properties: CompareProperty[]
): Promise<{ error: Error | null }> {
  if (properties.length < 2) {
    return { error: new Error('Need at least 2 properties to save') }
  }

  // Always get user from Supabase session (avoids stale React state / race with login)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    return { error: new Error('Auth check failed: ' + authError.message) }
  }
  if (!user?.id) {
    return { error: new Error('Not authenticated. Please sign in to save comparisons.') }
  }

  const [p1, p2, p3] = properties
  const listingTypeNum = LISTING_TYPE_MAP[properties[0]?.listingType ?? 'Resale'] ?? 3

  const row = {
    user_id: user.id,
    property_one_id: Number(p1.id) || null,
    property_two_id: p2 ? Number(p2.id) || null : null,
    property_three_id: p3 ? Number(p3.id) || null : null,
    listing_type: listingTypeNum,
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[saveCompression] user.id:', user.id, 'row:', row)
  }

  const { error } = await supabase.from(TABLE.compression).insert(row)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[saveCompression] insert error:', error.message, 'code:', error.code)
    }
    return { error: new Error(error.message) }
  }
  return { error: null }
}

export type CompressionRow = {
  id: number
  created_at: string
  user_id: string | null
  property_one_id: number | null
  property_two_id: number | null
  property_three_id: number | null
  listing_type: number | null
}

export async function fetchCompressions(): Promise<{
  data: CompressionRow[] | null
  error: Error | null
}> {
  const { data, error } = await supabase
    .from(TABLE.compression)
    .select('id, created_at, user_id, property_one_id, property_two_id, property_three_id, listing_type')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as CompressionRow[], error: null }
}

export type CompressionWithDetails = {
  id: number
  created_at: string
  user_id: string | null
  listing_type: number | null
  property_one_id: number | null
  property_two_id: number | null
  property_three_id: number | null
  profiles: { full_name: string | null; phone: string | null } | null
  property_one: { id: number; title: string | null } | null
  property_two: { id: number; title: string | null } | null
  property_three: { id: number; title: string | null } | null
}

export async function fetchCompressionsWithDetails(): Promise<{
  data: CompressionWithDetails[] | null
  error: Error | null
}> {
  // Requires FKs: compression.user_id -> profiles(id), compression.property_*_id -> Propertys(id)
  const selectQuery = `id, created_at, user_id, listing_type, property_one_id, property_two_id, property_three_id, profiles(full_name, phone), property_one:Propertys!property_one_id(id, title), property_two:Propertys!property_two_id(id, title), property_three:Propertys!property_three_id(id, title)`

  const { data, error } = await supabase
    .from(TABLE.compression)
    .select(selectQuery)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: new Error(error.message) }
  return { data: (data ?? []) as unknown as CompressionWithDetails[], error: null }
}
