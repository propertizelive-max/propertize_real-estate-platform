import { useState, useEffect, useCallback } from 'react'
import {
  fetchFilteredProjects,
  fetchFilteredRent,
  fetchFilteredResale,
  fetchProjectPriceRange,
  fetchRentPriceRange,
  fetchResalePriceRange,
  type ProjectFilters,
  type RentResaleFilters,
  type ProjectStatusFilter,
  type ProjectWithUnits,
  type PropertyWithMedia,
  type PriceRange,
} from '../lib/propertyApi'

export type TabType = 'project' | 'rent' | 'resale'

const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  projectStatus: null,
  minPrice: null,
  maxPrice: null,
}

const DEFAULT_RENT_RESALE_FILTERS: RentResaleFilters = {
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
}

/** Reusable filter state and fetch logic for Projects tab */
export function useProjectFilters() {
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_PROJECT_FILTERS)
  const [data, setData] = useState<ProjectWithUnits[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 0 })

  const updateFilter = useCallback(<K extends keyof ProjectFilters>(key: K, value: ProjectFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_PROJECT_FILTERS })
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFilteredProjects(filters)
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load projects')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [filters.projectStatus, filters.minPrice, filters.maxPrice])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    let cancelled = false
    fetchProjectPriceRange().then((range) => {
      if (!cancelled) setPriceRange(range)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    data,
    loading,
    error,
    priceRange,
    refetch: fetchData,
  }
}

/** Reusable filter state and fetch logic for Rent tab */
export function useRentFilters() {
  const [filters, setFilters] = useState<RentResaleFilters>(DEFAULT_RENT_RESALE_FILTERS)
  const [data, setData] = useState<PropertyWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 0 })

  const updateFilter = useCallback(<K extends keyof RentResaleFilters>(key: K, value: RentResaleFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_RENT_RESALE_FILTERS })
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFilteredRent(filters)
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load rentals')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [filters.minPrice, filters.maxPrice, filters.bedrooms])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    let cancelled = false
    fetchRentPriceRange().then((range) => {
      if (!cancelled) setPriceRange(range)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    data,
    loading,
    error,
    priceRange,
    refetch: fetchData,
  }
}

/** Reusable filter state and fetch logic for Resale tab */
export function useResaleFilters() {
  const [filters, setFilters] = useState<RentResaleFilters>(DEFAULT_RENT_RESALE_FILTERS)
  const [data, setData] = useState<PropertyWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 0 })

  const updateFilter = useCallback(<K extends keyof RentResaleFilters>(key: K, value: RentResaleFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_RENT_RESALE_FILTERS })
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFilteredResale(filters)
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load resale properties')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [filters.minPrice, filters.maxPrice, filters.bedrooms])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    let cancelled = false
    fetchResalePriceRange().then((range) => {
      if (!cancelled) setPriceRange(range)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    data,
    loading,
    error,
    priceRange,
    refetch: fetchData,
  }
}

/** Project status options for New Projects tab filter */
export const PROJECT_STATUS_OPTIONS: { value: ProjectStatusFilter; label: string }[] = [
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'ready_to_move', label: 'Ready to Move' },
]
