'use client'

import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-gray-800' : 'bg-red-600'
      }`}
      role="alert"
    >
      {message}
    </div>
  )
}
