'use client'

import { useEffect, type RefObject } from 'react'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { medir } from './medida'
import { PANTALLAS_POR_PASO, centroDelPaso, scrollDelPx } from './pasos'

/**
 * [B1] El ancla al cargar (`#portfolio-el-garage`, …): el navegador ya saltó al elemento; el Portfolio lo lleva al píxel del paso.
 * [B1.3] Salió de `usePortfolio.ts` (la regla de las 300 líneas), sin cambios.
 */
export function useAnclaDeLaCarga(caja: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const ancla = ANCLAS_DEL_PORTFOLIO.find((a) => `#${a.id}` === window.location.hash)
    const m = ancla === undefined ? null : medir(caja.current)
    if (ancla === undefined || m === null) return undefined
    const y = Math.round(scrollDelPx(centroDelPaso(ancla.paso, PANTALLAS_POR_PASO), m.tope, m.alto))
    const el = caja.current
    // El ancla con la que cargó, para el diagnóstico de la carga, hasta que el visitante mueva la página por su cuenta. [B1.2b] Un clic
    // también (el menú lleva a otra sección: el arnés lo contaba como un ancla desfasada).
    el?.setAttribute('data-ancla-de-la-carga', ancla.id)
    const soltar = (): void => el?.removeAttribute('data-ancla-de-la-carga')
    const gestos = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    for (const g of gestos) window.addEventListener(g, soltar, { once: true, passive: true })
    const reloj = window.setTimeout(() => window.scrollTo({ top: y, behavior: 'instant' }), 0)
    return () => {
      window.clearTimeout(reloj)
      for (const g of gestos) window.removeEventListener(g, soltar)
    }
  }, [caja])
}
