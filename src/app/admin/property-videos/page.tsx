'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  fetchPropertiesForDropdown,
  uploadToStorage,
  createPropertyVideo,
  fetchPropertyVideos,
  toggleVideoFeatured,
  type PropertyVideoRow,
} from '@/lib/propertyVideosApi'
import { toPropertySlug } from '@/lib/slug'

export default function PropertyVideosPage() {
  const [properties, setProperties] = useState<{ id: number; title: string | null }[]>([])
  const [videos, setVideos] = useState<(PropertyVideoRow & { property_title: string | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [propertyId, setPropertyId] = useState<string>('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isFeatured, setIsFeatured] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [props, vids] = await Promise.all([
          fetchPropertiesForDropdown(),
          fetchPropertyVideos(),
        ])
        setProperties(props)
        setVideos(vids)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      if (!f.type.startsWith('video/') && !f.name.toLowerCase().endsWith('.mp4')) {
        setError('Please select an MP4 video file.')
        return
      }
      setVideoFile(f)
      setError(null)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setThumbnailFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId || !videoFile) {
      setError('Please select a property and a video file.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const propId = parseInt(propertyId, 10)
      const videoUrl = await uploadToStorage(videoFile, `videos/${propId}`)
      let thumbnailUrl: string | null = null
      if (thumbnailFile) {
        thumbnailUrl = await uploadToStorage(thumbnailFile, `thumbnails/${propId}`)
      }
      await createPropertyVideo({
        property_id: propId,
        file_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        media_type: 'video',
        is_featured: isFeatured,
      })
      const vids = await fetchPropertyVideos()
      setVideos(vids)
      setPropertyId('')
      setVideoFile(null)
      setThumbnailFile(null)
      setIsFeatured(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleFeatured = async (id: number, current: boolean) => {
    try {
      await toggleVideoFeatured(id, !current)
      const vids = await fetchPropertyVideos()
      setVideos(vids)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Property Videos</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Video</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select a property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title ?? `Property #${p.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video (MP4)</label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,.mp4"
              onChange={handleVideoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {videoFile && (
              <p className="mt-1 text-sm text-gray-500">{videoFile.name} ({(videoFile.size / 1024).toFixed(1)} KB)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {thumbnailFile && (
              <p className="mt-1 text-sm text-gray-500">{thumbnailFile.name}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
              Show in New Projects section on homepage
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !videoFile}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">All Videos</h2>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No videos yet. Upload one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {videos.map((v) => {
                  const slug = toPropertySlug(v.property_title ?? null, v.property_id)
                  return (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="w-24 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                          {v.thumbnail_url ? (
                            <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <video src={v.file_url} className="w-full h-full object-cover" muted />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{v.property_title ?? `Property #${v.property_id}`}</p>
                        <Link href={`/property/${slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          View property
                        </Link>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(v.id, v.is_featured)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${v.is_featured ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {v.is_featured ? 'Featured' : 'Not featured'}
                        </button>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4">
                        <a href={v.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          Open video
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
