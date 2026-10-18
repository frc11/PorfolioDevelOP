/**
 * [B1] EL SALTO A UN PASO DEL SELECTOR — el teclado, el clic, el hover, la rueda y el ancla al cargar (plan §5.8; [B1.2c] §13, punto 5).
 *
 * La página va al centro del paso y el estado la sigue (los bordes que cruza en el camino no disparan nada: `usePortfolio` mira
 * el destino mientras el salto vuela). Con Lenis, `lenis.scrollTo` con una duración; sin Lenis (abajo de 1025), el viaje sin Lenis.
 * [B1.2c] Con duración 0, INMEDIATO: el proyecto activo manda y el scroll se acomoda en silencio a su tramo (el hover, el clic, el
 * tap y las teclas; y todo con movimiento reducido). La rueda sí viaja (`duracionDelSalto`). Nunca `router.push`: es la misma página.
 */

import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'
import { viajarSinLenis } from '../../../_componentes/viajeSinLenis'

/** La duración de un salto de la rueda: base más un tanto por paso, con tope (ms). */
export const SALTO = { baseMs: 420, porPasoMs: 110, topeMs: 900 } as const

export const duracionDelSalto = (pasos: number): number => Math.min(SALTO.topeMs, SALTO.baseMs + SALTO.porPasoMs * Math.max(0, pasos - 1))

/** easeInOutCubic: arranca y llega suave. */
export const curvaDelSalto = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Lleva la página a `destino` (px de scroll) en `ms` (0: inmediato). Devuelve cómo cancelarlo; `alLlegar` corre al terminar. */
export function saltarA(destino: number, ms: number, alLlegar: () => void): () => void {
  const y = Math.round(destino)
  const lenis = LENIS_DEL_SITIO.instancia
  if (!(ms > 0)) {
    if (lenis !== null) lenis.scrollTo(y, { immediate: true, force: true })
    else window.scrollTo({ top: y, behavior: 'instant' })
    alLlegar()
    return () => undefined
  }
  if (lenis === null) return viajarSinLenis(y, ms, curvaDelSalto, alLlegar)
  let vivo = true
  lenis.scrollTo(y, { duration: ms / 1000, easing: curvaDelSalto, force: true, onComplete: () => vivo && alLlegar() })
  return () => {
    vivo = false
  }
}
