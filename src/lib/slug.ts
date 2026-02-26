/**
 * SEO-friendly property slugs.
 * Since DB has no slug column, we generate slug from title + id.
 * Format: "property-title-slug-123" - id is always the last segment when numeric.
 */

export function toPropertySlug(title: string | null, id: number): string {
  if (!title || !title.trim()) return String(id)
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug ? `${slug}-${id}` : String(id)
}

/**
 * Extract property ID from slug. Handles:
 * - "123" -> 123
 * - "luxury-villa-123" -> 123
 */
export function parsePropertyIdFromSlug(slug: string): number | null {
  const trimmed = slug?.trim()
  if (!trimmed) return null
  const num = parseInt(trimmed, 10)
  if (!Number.isNaN(num) && String(num) === trimmed) return num
  const parts = trimmed.split('-')
  const last = parts[parts.length - 1]
  const id = parseInt(last ?? '', 10)
  return !Number.isNaN(id) ? id : null
}
