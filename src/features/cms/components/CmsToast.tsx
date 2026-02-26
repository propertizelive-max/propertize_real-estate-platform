'use client'

type CmsToastProps = {
  show: boolean
  message: string
  success: boolean
}

export function CmsToast({ show, message, success }: CmsToastProps) {
  if (!show) return null
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-opacity ${
        success ? 'bg-gray-800' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  )
}
