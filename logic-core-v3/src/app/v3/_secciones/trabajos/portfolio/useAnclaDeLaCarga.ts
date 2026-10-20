'use client'

import { useEffect, type RefObject } from 'react'

import { VUELTA_AL_HOME } from '../../../_lib/escena/ruta/posicionDelHome'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { medir } from './medida'
import { PANTALLAS_POR_PASO, centroDelPaso, scrollDelPx } from './pasos'

/**
 * [B1.2d] El ancla de un hash: la de un paso (`#portfolio-el-garage`, …) o, con `#trabajos`, la de El Garage (como el «Portfolio» de la
 * barra, `destinosDelViaje.ts`): el salto nativo de la sección cae en la aproximación, donde sólo se ve el logo (A8).
 */
export function anclaDelHash(hash: string): (typeof ANCLAS_DEL_PORTFOLIO)[number] | undefined {
  if (hash === '#trabajos') return ANCLAS_DEL_PORTFOLIO[0]
  return ANCLAS_DEL_PORTFOLIO.find((a) => `#${a.id}` === hash)
}

/**
 * [B1] El ancla al cargar (`#portfolio-el-garage`, …): el navegador ya saltó al elemento; el Portfolio lo lleva al píxel del paso.
 * [B1.3] Salió de `usePortfolio.ts` (la regla de las 300 líneas), sin cambios. [B1.2d] Y `#trabajos` entra al Portfolio
 * (`anclaDelHash`), también cuando el hash cambia sin recargar.
 */
export function useAnclaDeLaCarga(caja: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = caja.current
    const irAlAncla = (): (() => void) | null => {
      // [B12a.7] Volviendo con la flecha, manda la posición que el home dejó (el velo la devuelve), no el ancla que quedó en la URL.
      if (VUELTA_AL_HOME.enCurso) return null
      const ancla = anclaDelHash(window.location.hash)
      const m = ancla === undefined ? null : medir(caja.current)
      if (ancla === undefined || m === null) return null
      const y = Math.round(scrollDelPx(centroDelPaso(ancla.paso, PANTALLAS_POR_PASO), m.tope, m.alto))
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
    }
    let soltarElAncla = irAlAncla()
    const alCambiarElHash = (): void => {
      soltarElAncla?.()
      soltarElAncla = irAlAncla()
    }
    window.addEventListener('hashchange', alCambiarElHash)
    return () => {
      window.removeEventListener('hashchange', alCambiarElHash)
      soltarElAncla?.()
    }
  }, [caja])
}
