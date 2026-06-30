'use client'

// P1-fix scroll — El dashboard scrollea en un contenedor INTERNO (el <main>
// overflow-y-auto del shell), no en la ventana, así que el scroll-restoration de
// Next (que resetea el window) no lo resetea entre navegaciones → la página
// aparece scrolleada. Este componente, montado DENTRO de ese <main>, busca su
// ancestro scrollable más cercano y lo lleva al tope en cada cambio de pathname.
//
// Aditivo y autocontenido: NO toca la estructura/overflow del <main> ni del
// shell — solo se monta. Encuentra el contenedor desde su propia posición en el
// DOM (sin querySelector global, sin ref sobre el <main>).

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollTopOnNavigate() {
  const pathname = usePathname()
  const anchorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let el: HTMLElement | null = anchorRef.current?.parentElement ?? null
    while (el) {
      const overflowY = getComputedStyle(el).overflowY
      if (overflowY === 'auto' || overflowY === 'scroll') {
        el.scrollTo({ top: 0 })
        return
      }
      el = el.parentElement
    }
    // Fallback: si no hubiera contenedor scrollable, la ventana.
    window.scrollTo({ top: 0 })
  }, [pathname])

  return <span ref={anchorRef} aria-hidden className="hidden" />
}
