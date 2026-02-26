import { supabase } from './supabase'
import { TABLE } from './tableNames'

export type FeaturedVideo = {
  id: number
  property_id: number
  file_url: string
  thumbnail_url: string | null
  media_type: 'video'
  is_featured: boolean
  created_at: string | null
}

/**
 * Fetch featured videos for the "New Projects" section.
 * Only videos where is_featured = true, limit 6, order by created_at DESC.
 */
export async function fetchFeaturedVideos(): Promise<
  { id: number; property_id: number; file_url: string; thumbnail_url: string | null }[]
> {
  const { data, error } = await supabase
    .from(TABLE.property_media)
    .select('id, property_id, file_url, thumbnail_url')
    .eq('media_type', 'video')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) throw error
  return (data ?? []) as { id: number; property_id: number; file_url: string; thumbnail_url: string | null }[]
}
