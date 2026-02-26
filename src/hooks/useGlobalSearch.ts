import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { searchProperties } from '../lib/propertyApi'
import type { PropertyWithMedia } from '../lib/propertyApi'

const DEBOUNCE_MS = 300
const SUGGESTIONS_LIMIT = 5

export function useGlobalSearch() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<PropertyWithMedia[]>([])
  const [results, setResults] = useState<PropertyWithMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const data = await searchProperties(term.trim(), SUGGESTIONS_LIMIT)
      setSuggestions(data)
      setShowDropdown(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!searchTerm.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchTerm)
      debounceRef.current = null
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm, fetchSuggestions])

  const handleSearch = useCallback(
    async (term?: string) => {
      const q = (term ?? searchTerm).trim()
      if (!q) return
      setShowDropdown(false)
      setLoading(true)
      try {
        const data = await searchProperties(q)
        setResults(data)
        router.push(`/search?q=${encodeURIComponent(q)}`)
      } catch {
        setResults([])
        router.push(`/search?q=${encodeURIComponent(q)}`)
      } finally {
        setLoading(false)
      }
    },
    [searchTerm, router]
  )

  const handleSuggestionClick = useCallback(
    () => {
      const term = searchTerm.trim()
      if (!term) return
      setShowDropdown(false)
      setSuggestions([])
      handleSearch(term)
    },
    [searchTerm, handleSearch]
  )

  const handleInputChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false)
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    results,
    loading,
    showDropdown,
    setShowDropdown,
    handleInputChange,
    handleSearch,
    handleSuggestionClick,
    handleCloseDropdown,
  }
}
