'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Llama la server action que marca mensajes como leídos y revalida el tag
// del badge. Usa ref guard para no re-disparar si router.refresh() re-renderiza
// el componente con una nueva referencia de action.
export function MarkReadOnMount({ action }: { action: () => Promise<void> }) {
  const router = useRouter()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true
    action().then(() => router.refresh())
  }, [action, router])

  return null
}
