'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * [NOCTURNO] B · SEGUIR LO QUE LLEGA, ADENTRO DEL PANEL — cuando llega un mensaje, la demo lo deja a la vista moviendo
 * SÓLO las cajas del panel (`scrollTop` del contenido del marco), nunca la página de atrás: `scrollIntoView` movería
 * todos los ancestros con scroll (es lo que hace `components/dashboard/ClientChatThread.tsx`, y por eso se copió).
 */
export const CONTENIDO_DEL_PANEL = '[data-parte="contenido-del-panel"]'

/** Deja el pie de `el` a la vista en el contenido del panel (si hace falta). */
export function mostrarAlFondo(el: HTMLElement | null, suave: boolean): void {
  const caja = el?.closest<HTMLElement>(CONTENIDO_DEL_PANEL) ?? null
  if (el === null || caja === null) return
  const r = el.getBoundingClientRect()
  const c = caja.getBoundingClientRect()
  const sobra = r.bottom - (c.bottom - 16)
  if (sobra > 0) caja.scrollTo({ top: caja.scrollTop + sobra, behavior: suave ? 'smooth' : 'auto' })
}

/**
 * ¿La demo sigue lo que llega? Sí, hasta que el visitante mueve el contenido del panel a mano (la rueda, el dedo):
 * desde ahí manda él. `reanudar` lo vuelve a prender (cuando el visitante mismo pregunta algo).
 */
export function useSeguir(raiz: RefObject<HTMLElement | null>): { readonly seguir: boolean; readonly reanudar: () => void } {
  const [seguir, setSeguir] = useState(true)
  useEffect(() => {
    const caja = raiz.current?.closest<HTMLElement>(CONTENIDO_DEL_PANEL) ?? null
    if (caja === null) return undefined
    const soltar = (): void => setSeguir(false)
    caja.addEventListener('wheel', soltar, { passive: true })
    caja.addEventListener('touchmove', soltar, { passive: true })
    return () => {
      caja.removeEventListener('wheel', soltar)
      caja.removeEventListener('touchmove', soltar)
    }
  }, [raiz])
  return { seguir, reanudar: () => setSeguir(true) }
}
