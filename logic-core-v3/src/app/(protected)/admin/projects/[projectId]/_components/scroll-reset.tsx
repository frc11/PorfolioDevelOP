'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Resetea al tope el scroll del contenedor real (el `<main>` del admin, que es
 * `overflow-y-auto`) cada vez que cambia la ruta. Ni Next ni TransitionContext
 * resetean ese `<main>` (sólo window), así que la ficha heredaba el scroll del
 * board. Lane-local, sin tocar el layout admin (frozen) ni navegar.
 */
export function ScrollReset() {
  const pathname = usePathname()

  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return null
}
