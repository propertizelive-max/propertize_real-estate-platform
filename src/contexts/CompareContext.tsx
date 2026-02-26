import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'

const STORAGE_KEY = 'compare_properties'
const MAX_PROPERTIES = 3

export type ListingType = 'Project' | 'Rent' | 'Resale'

export type CompareProperty = {
  id: string
  title: string
  price: string
  image: string
  location?: string
  beds?: string
  baths?: string
  sqft?: string
  listingType: ListingType
}

type CompareContextType = {
  properties: CompareProperty[]
  addToCompare: (p: CompareProperty) => void
  removeFromCompare: (id: string) => void
  setCompareProperties: (props: CompareProperty[]) => void
  clearCompare: () => void
  toast: string | null
  dismissToast: () => void
}

const CompareContext = createContext<CompareContextType | null>(null)

function loadFromStorage(): CompareProperty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX_PROPERTIES).map((p) => {
      const x = p as Record<string, unknown>
      return {
        id: String(x?.id ?? ''),
        title: String(x?.title ?? ''),
        price: String(x?.price ?? ''),
        image: String(x?.image ?? ''),
        location: x?.location != null ? String(x.location) : undefined,
        beds: x?.beds != null ? String(x.beds) : undefined,
        baths: x?.baths != null ? String(x.baths) : undefined,
        sqft: x?.sqft != null ? String(x.sqft) : undefined,
        listingType: (x?.listingType as ListingType) ?? 'Resale',
      } as CompareProperty
    }).filter((p) => p.id)
  } catch {
    return []
  }
}

function saveToStorage(props: CompareProperty[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(props))
  } catch {
    // ignore
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<CompareProperty[]>(loadFromStorage)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    saveToStorage(properties)
  }, [properties])

  const dismissToast = useCallback(() => setToast(null), [])

  const addToCompare = useCallback((p: CompareProperty) => {
    setProperties((prev) => {
      if (prev.some((x) => x.id === p.id)) return prev
      if (prev.length >= MAX_PROPERTIES) {
        setToast('You can compare maximum 3 properties')
        return prev
      }
      return [...prev, p]
    })
  }, [])

  const removeFromCompare = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setCompareProperties = useCallback((props: CompareProperty[]) => {
    setProperties(props.slice(0, MAX_PROPERTIES))
  }, [])

  const clearCompare = useCallback(() => {
    setProperties([])
  }, [])

  return (
    <CompareContext.Provider
      value={{
        properties,
        addToCompare,
        removeFromCompare,
        setCompareProperties,
        clearCompare,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
