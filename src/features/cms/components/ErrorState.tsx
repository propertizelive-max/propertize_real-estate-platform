'use client'

type ErrorStateProps = {
  error: string
  onRetry: () => void
  children?: React.ReactNode
}

export function ErrorState({ error, onRetry, children }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Could not load data</h3>
      <p className="text-sm text-gray-600 mb-4 max-w-md">{error}</p>
      <p className="text-xs text-gray-500 mb-6 max-w-md">
        Ensure the Supabase tables exist. Run the schema in <code className="bg-gray-100 px-1 rounded">src/features/cms/SUPABASE_SCHEMA.sql</code> and add RLS policies if needed.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Retry
        </button>
        {children}
      </div>
    </div>
  )
}
