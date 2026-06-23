'use client'

import { useEffect, useRef } from 'react'

// scrollTrigger cambia cuando llegan nuevos mensajes (ej. messages.length),
// disparando el scroll al fondo — igual que el useEffect([messages]) del cliente.
export function MessagesScrollAnchor({ scrollTrigger = 0 }: { scrollTrigger?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scrollTrigger])

  return <div ref={ref} />
}
