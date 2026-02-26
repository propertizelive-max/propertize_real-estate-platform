'use client'

import { useRef, useEffect } from 'react'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import { formatPrice, formatLocation, getFirstImage } from '@/lib/propertyApi'

export default function GlobalSearch() {
  const {
    searchTerm,
    suggestions,
    loading,
    showDropdown,
    handleInputChange,
    handleSearch,
    handleSuggestionClick,
    handleCloseDropdown,
    setShowDropdown,
  } = useGlobalSearch()

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleCloseDropdown()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleCloseDropdown])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search locations or property..."
          className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-primary/10 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-accent-gold"
        />
      </div>

      {showDropdown && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-background-dark border border-gray-200 dark:border-primary/20 rounded-lg shadow-lg overflow-hidden z-50 min-w-[280px]">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Searching...</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={handleSuggestionClick}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-primary/10 flex items-center gap-3 transition-colors"
                  >
                    <img
                      src={getFirstImage(item.media)}
                      alt=""
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-primary truncate">{item.title ?? 'Untitled'}</p>
                      <p className="text-xs text-gray-500 truncate">{formatLocation(item.location)}</p>
                    </div>
                    <span className="text-sm font-bold text-primary flex-shrink-0">
                      {formatPrice(item.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
