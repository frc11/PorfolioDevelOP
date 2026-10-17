/**
 * [B1] EL SALTO A UN PASO DEL SELECTOR — el hover con intención, el clic en un lomo, el teclado y el ancla al cargar (plan §5.8).
 *
 * La página va al centro del paso y el estado la sigue (los bordes que cruza en el camino no disparan nada: `usePortfolio` mira
 * el destino mientras el salto vuela). Con Lenis, `lenis.scrollTo` con una duración por distancia; sin Lenis (abajo de 1025), el
 * viaje sin Lenis; con movimiento reducido, instantáneo. Nunca `router.push`: es la misma página.
 */

import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'
import { viajarSinLenis } from '../../../_componentes/viajeSinLenis'

/** La duración de un salto: base más un tanto por paso, con tope (ms). */
export const SALTO = { baseMs: 420, porPasoMs: 110, topeMs: 900 } as const

export const duracionDelSalto = (pasos: number): number => Math.min(SALTO.topeMs, SALTO.baseMs + SALTO.porPasoMs * Math.max(0, pasos - 1))

/** easeInOutCubic: arranca y llega suave. */
export const curvaDelSalto = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Lleva la página a `destino` (px de scroll). Devuelve cómo cancelarlo; `alLlegar` corre al terminar (también si es instantáneo). */
export function saltarA(destino: number, pasos: number, reducido: boolean, alLlegar: () => void): () => void {
  const y = Math.round(destino)
  const lenis = LENIS_DEL_SITIO.instancia
  if (reducido) {
    if (lenis !== null) lenis.scrollTo(y, { immediate: true, force: true })
    else window.scrollTo({ top: y, behavior: 'instant' })
    alLlegar()
    return () => undefined
  }
  const ms = duracionDelSalto(pasos)
  if (lenis === null) return viajarSinLenis(y, ms, curvaDelSalto, alLlegar)
  let vivo = true
  lenis.scrollTo(y, { duration: ms / 1000, easing: curvaDelSalto, force: true, onComplete: () => vivo && alLlegar() })
  return () => {
    vivo = false
  }
}
