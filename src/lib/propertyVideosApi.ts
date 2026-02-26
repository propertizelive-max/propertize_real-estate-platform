import { supabase } from './supabase'
import { TABLE } from './tableNames'

const BUCKET = 'property-media'

export type PropertyOption = { id: number; title: string | null }
export type PropertyVideoRow = {
  id: number
  property_id: number
  file_url: string
  thumbnail_url: string | null
  media_type: string
  is_featured: boolean
  created_at: string | null
}

/** Fetch all properties for the dropdown */
export async function fetchPropertiesForDropdown(): Promise<PropertyOption[]> {
  const { data, error } = await supabase
    .from(TABLE.properties)
    .select('id, title')
    .order('id', { ascending: false })

  if (error) throw error
  return (data ?? []) as PropertyOption[]
}

/** Upload a file to property-media bucket and return public URL */
export async function uploadToStorage(
  file: File,
  prefix: string
): Promise<string> {
  const path = `${prefix}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Insert a video record into Propertys_media */
export async function createPropertyVideo(payload: {
  property_id: number
  file_url: string
  thumbnail_url?: string | null
  media_type: 'video'
  is_featured: boolean
}): Promise<{ id: number } | null> {
  const { data, error } = await supabase
    .from(TABLE.property_media)
    .insert({
      property_id: payload.property_id,
      file_url: payload.file_url,
      thumbnail_url: payload.thumbnail_url ?? null,
      media_type: payload.media_type,
      is_featured: payload.is_featured,
    })
    .select('id')
    .single()

  if (error) throw error
  return data as { id: number } | null
}

/** Fetch all property videos (admin list) */
export async function fetchPropertyVideos(): Promise<
  (PropertyVideoRow & { property_title: string | null })[]
> {
  const { data: rows, error } = await supabase
    .from(TABLE.property_media)
    .select('id, property_id, file_url, thumbnail_url, media_type, is_featured, created_at')
    .eq('media_type', 'video')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!rows?.length) return []

  const propIds = [...new Set(rows.map((r: { property_id: number }) => r.property_id))]
  const { data: props } = await supabase
    .from(TABLE.properties)
    .select('id, title')
    .in('id', propIds)

  const propMap: Record<number, string | null> = {}
  ;(props ?? []).forEach((p: { id: number; title: string | null }) => {
    propMap[p.id] = p.title
  })

  return rows.map((r: PropertyVideoRow) => ({
    ...r,
    property_title: propMap[r.property_id] ?? null,
  }))
}

/** Toggle is_featured for a video */
export async function toggleVideoFeatured(id: number, isFeatured: boolean): Promise<void> {
  const { error } = await supabase
    .from(TABLE.property_media)
    .update({ is_featured: isFeatured })
    .eq('id', id)

  if (error) throw error
}
