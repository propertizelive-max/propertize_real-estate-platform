import { useEffect } from 'react'
import { useCompare } from '../contexts/CompareContext'

export default function CompareToast() {
  const { toast, dismissToast } = useCompare()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(dismissToast, 3000)
    return () => clearTimeout(t)
  }, [toast, dismissToast])

  if (!toast) return null

  return (
    <div
      role="alert"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-primary text-white text-sm font-medium shadow-xl"
    >
      {toast}
    </div>
  )
}
