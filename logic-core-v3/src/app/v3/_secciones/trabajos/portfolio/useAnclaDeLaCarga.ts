'use client'

import { useEffect, useRef, type RefObject } from 'react'

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

/** [L2] Cuánto se vuelve a poner el ancla de la carga si el documento cambia de alto (ms): lo que tarda en asentarse lo de arriba. */
export const REASIENTO_MS = 4000

/**
 * [B1] El ancla al cargar (`#portfolio-el-garage`, …): el navegador ya saltó al elemento; el Portfolio lo lleva al píxel del paso.
 * [B1.3] Salió de `usePortfolio.ts` (la regla de las 300 líneas), sin cambios. [B1.2d] Y `#trabajos` entra al Portfolio
 * (`anclaDelHash`), también cuando el hash cambia sin recargar. [B1.2e] Con el carrusel (debajo de 1024) las anclas viven en su flujo (los
 * proyectos, en la pantalla del carrusel; «la tuya», en la suya): el ancla queda arriba del cuadro, que es lo que hace el salto nativo, y el
 * carrusel va al proyecto del ancla (`FlujoDelPortfolio`). Vuelve a correr cuando el CSS decide el carrusel (el flujo se monta después).
 */
export function useAnclaDeLaCarga(caja: RefObject<HTMLElement | null>, carrusel: boolean): void {
  const primera = useRef(true)
  useEffect(() => {
    const el = caja.current
    // [B1.2e] Cuando el CSS cambia de modo, el ancla se vuelve a poner sólo si la carga sigue en su ancla (nadie movió la página).
    const sigueEnElAncla = primera.current || el?.hasAttribute('data-ancla-de-la-carga') === true
    primera.current = false
    const irAlAncla = (): (() => void) | null => {
      // [B12a.7] Volviendo con la flecha, manda la posición que el home dejó (el velo la devuelve), no el ancla que quedó en la URL.
      if (VUELTA_AL_HOME.enCurso) return null
      const ancla = anclaDelHash(window.location.hash)
      if (ancla === undefined || medir(caja.current) === null) return null
      // [L2] El destino se lee al saltar (no antes): con el carrusel, lo de arriba del flujo puede haber cambiado de alto en el medio.
      const destino = (): number | null => {
        const m = medir(caja.current)
        if (m === null) return null
        const delFlujo = carrusel ? (document.getElementById(ancla.id)?.getBoundingClientRect().top ?? null) : null
        return delFlujo === null ? Math.round(scrollDelPx(centroDelPaso(ancla.paso, PANTALLAS_POR_PASO), m.tope, m.alto)) : Math.round(delFlujo + window.scrollY)
      }
      const ir = (): void => {
        const y = destino()
        if (y !== null && Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: 'instant' })
      }
      // El ancla con la que cargó, para el diagnóstico de la carga, hasta que el visitante mueva la página por su cuenta. [B1.2b] Un clic
      // también (el menú lleva a otra sección: el arnés lo contaba como un ancla desfasada).
      el?.setAttribute('data-ancla-de-la-carga', ancla.id)
      const soltar = (): void => el?.removeAttribute('data-ancla-de-la-carga')
      const gestos = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
      for (const g of gestos) window.addEventListener(g, soltar, { once: true, passive: true })
      const reloj = window.setTimeout(ir, 0)
      // [L2] Con el carrusel, si el documento cambia de alto mientras nadie tocó la página (las fuentes, los medios, lo de arriba que se mide),
      // el ancla se vuelve a poner: el reporte lo encontró entre el 66 y el 143 % del cuadro. Hasta un gesto, o `REASIENTO_MS`.
      const reasentar = carrusel ? new ResizeObserver(() => (el?.hasAttribute('data-ancla-de-la-carga') === true ? ir() : undefined)) : null
      reasentar?.observe(document.body)
      const fin = window.setTimeout(() => reasentar?.disconnect(), REASIENTO_MS)
      return () => {
        window.clearTimeout(reloj)
        window.clearTimeout(fin)
        reasentar?.disconnect()
        for (const g of gestos) window.removeEventListener(g, soltar)
      }
    }
    let soltarElAncla = sigueEnElAncla ? irAlAncla() : null
    const alCambiarElHash = (): void => {
      soltarElAncla?.()
      soltarElAncla = irAlAncla()
    }
    window.addEventListener('hashchange', alCambiarElHash)
    return () => {
      window.removeEventListener('hashchange', alCambiarElHash)
      soltarElAncla?.()
    }
  }, [caja, carrusel])
}
