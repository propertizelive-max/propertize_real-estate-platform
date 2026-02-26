'use client'

const DEFAULT_PAGE_SIZE = 9

type PaginationProps = {
  totalItems: number
  currentPage: number
  onPageChange: (page: number) => void
  pageSize?: number
  className?: string
}

export default function Pagination({
  totalItems,
  currentPage,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalPages <= 1) return null

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = []
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 'ellipsis', totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
    }
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={`flex justify-center mt-16 ${className}`}>
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-accent-gold hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        {visiblePages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                currentPage === p
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-accent-gold hover:text-primary'
              }`}
              aria-label={`Page ${p}`}
              aria-current={currentPage === p ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-accent-gold hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </nav>
    </div>
  )
}

export { DEFAULT_PAGE_SIZE }
