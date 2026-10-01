'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * [INTERFAZ 2] T3 · EL LATIDO — un contador que suma uno cada `cadaMs` mientras la pieza se ve.
 *
 * Se detiene solo: fuera de cuadro (un observador, como toda animación pesada del sitio), con la pestaña oculta, con
 * movimiento reducido y cuando la persona lo pausa (WCAG 2.2.2: lo que se mueve solo más de cinco segundos se puede
 * pausar). React se entera sólo en cada latido: un render cada un par de segundos, no por cuadro.
 */
export function useLatido(ref: RefObject<Element | null>, cadaMs: number, pausado: boolean): number {
  const [latido, setLatido] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (el === null || pausado) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let reloj: number | undefined
    let aLaVista = false
    const decidir = (): void => {
      const corre = aLaVista && document.visibilityState === 'visible'
      if (corre && reloj === undefined) reloj = window.setInterval(() => setLatido((n) => n + 1), cadaMs)
      if (!corre && reloj !== undefined) {
        window.clearInterval(reloj)
        reloj = undefined
      }
    }
    const observador = new IntersectionObserver((entradas) => {
      aLaVista = entradas.some((e) => e.isIntersecting)
      decidir()
    })
    observador.observe(el)
    document.addEventListener('visibilitychange', decidir)
    return () => {
      observador.disconnect()
      document.removeEventListener('visibilitychange', decidir)
      if (reloj !== undefined) window.clearInterval(reloj)
    }
  }, [ref, cadaMs, pausado])

  return latido
}
