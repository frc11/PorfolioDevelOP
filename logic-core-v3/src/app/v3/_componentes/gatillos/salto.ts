/**
 * [B4] EL SALTO DE LOS GATILLOS — COMÚN al Portfolio y a Servicios (salió de `trabajos/portfolio/saltar.ts`, que lo re-exporta sin
 * cambios). Lleva la página a un destino con Lenis (`scrollTo` con una duración y la marca del viaje) o, abajo de 1025 donde no hay
 * Lenis, con el viaje sin Lenis; con duración 0, inmediato. Nunca `router.push`: es la misma página.
 */

import { LENIS_DEL_SITIO } from '../../_lib/lenisDelSitio'
import { viajarSinLenis } from '../viajeSinLenis'

/** La duración de un salto de la rueda: base más un tanto por paso, con tope (ms). */
export const SALTO = { baseMs: 420, porPasoMs: 110, topeMs: 900 } as const

export const duracionDelSalto = (pasos: number): number => Math.min(SALTO.topeMs, SALTO.baseMs + SALTO.porPasoMs * Math.max(0, pasos - 1))

/** easeInOutCubic: arranca y llega suave. */
export const curvaDelSalto = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * [B1.2d] La marca de un viaje con Lenis (su `userData`): Lenis la pone con cada `scrollTo` y la vacía al llegar, y la rueda, otro viaje
 * o un ancla la reemplazan. Si ya no es la del vuelo, alguien se lo pisó (`vueloPisado`). No se compara el `targetScroll`: en un viaje
 * programado Lenis lo lleva con el valor animado, cuadro a cuadro.
 */
export const CLAVE_DEL_VUELO = 'vueloDelPortfolio'

/**
 * Lleva la página a `destino` (px de scroll) en `ms` (0: inmediato). Devuelve cómo cancelarlo; `alLlegar` corre al terminar. [B1.2d]
 * `marca`: la del viaje en el `userData` de Lenis.
 */
export function saltarA(destino: number, ms: number, alLlegar: () => void, marca: string | null = null): () => void {
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
  lenis.scrollTo(y, { duration: ms / 1000, easing: curvaDelSalto, force: true, onComplete: () => vivo && alLlegar(), ...(marca === null ? {} : { userData: { [CLAVE_DEL_VUELO]: marca } }) })
  return () => {
    vivo = false
  }
}
