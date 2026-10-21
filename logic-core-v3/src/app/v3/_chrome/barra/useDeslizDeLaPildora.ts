'use client'

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

import { EVENTOS_DEL_VELO } from '../../_lib/veloDeNavegacion'

/** [B12a.8] T2 · Lo que tarda en deslizarse a su lugar del destino: el destape del velo (`velo.ts`). */
export const DESLIZ_DE_LA_PILDORA_MS = 560

/** Un `translate` vertical retenido (dos cuadros clave iguales: la píldora se queda ahí hasta que se cancela). */
const RETENIDA_MS = 60_000

/**
 * [B12a.8] T2 · LA PÍLDORA SE DESLIZA A SU LUGAR DEL DESTINO mientras pasa el velo (que pasa por debajo del chrome: la píldora se ve todo
 * el tiempo). Tres momentos:
 *   1 · el velo empieza a cubrir (`EVENTOS_DEL_VELO.cubre`): se toma dónde está;
 *   2 · cambia la ruta (un efecto de LAYOUT, antes de pintar): el layout ya la puso en su lugar nuevo (el nacimiento de la ruta), así que se
 *       la retiene donde estaba, sin que se vea el salto;
 *   3 · el velo empieza a destapar (`EVENTOS_DEL_VELO.destapa`: la página nueva ya tiene su scroll, del que depende el lugar final; en el home
 *       con la posición devuelta ya quedó pegada arriba): se suelta la retención y se anima desde donde estaba hasta ahí. [B12a.8] Antes
 *       arrancaba con `repuso`, en medio del montaje del home: la animación tomaba la hora del cuadro trabado y aparecía ya por el 72 % de
 *       su recorrido (un salto de 24 a 606 px, medido en el build con `velo.ts`).
 * Con movimiento reducido, va derecho a su lugar. Animaciones de `translate`: el compositor, sin tocar el `transform` de la píldora.
 */
export function useDeslizDeLaPildora(pastilla: RefObject<HTMLElement | null>, ruta: string | null): void {
  const desde = useRef<number | null>(null)
  const retenida = useRef<Animation | null>(null)
  const animacion = useRef<Animation | null>(null)

  useEffect(() => {
    const el = pastilla.current
    if (el === null) return undefined
    const alCubrir = (): void => {
      desde.current = el.getBoundingClientRect().top
    }
    let cuadro = 0
    const alDestapar = (): void => {
      const d = desde.current
      desde.current = null
      if (d === null) {
        retenida.current?.cancel()
        retenida.current = null
        return
      }
      // [B12a.8] En el cuadro siguiente y con la hora de ahora: el del destape es largo (27–35 ms en el build) y la animación tomaba como
      // inicio el principio de ese cuadro: aparecía ya adelantada (las dos primeras muestras a 7,4 y 5,7 px/ms; su curva da a lo sumo 2,6).
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => {
        retenida.current?.cancel()
        retenida.current = null
        const corrida = d - el.getBoundingClientRect().top
        animacion.current?.cancel()
        if (Math.abs(corrida) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const a = el.animate([{ translate: `0 ${corrida.toFixed(1)}px` }, { translate: '0 0' }], { duration: DESLIZ_DE_LA_PILDORA_MS, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' })
        a.startTime = performance.now()
        animacion.current = a
      })
    }
    window.addEventListener(EVENTOS_DEL_VELO.cubre, alCubrir)
    window.addEventListener(EVENTOS_DEL_VELO.destapa, alDestapar)
    return () => {
      window.removeEventListener(EVENTOS_DEL_VELO.cubre, alCubrir)
      window.removeEventListener(EVENTOS_DEL_VELO.destapa, alDestapar)
      cancelAnimationFrame(cuadro)
      retenida.current?.cancel()
      animacion.current?.cancel()
    }
  }, [pastilla])

  // 2 · Con la ruta nueva en el DOM y antes de pintar: retenida donde estaba (si el velo la tomó al cubrir).
  useLayoutEffect(() => {
    const el = pastilla.current
    const d = desde.current
    if (el === null || d === null) return
    const corrida = d - el.getBoundingClientRect().top
    if (Math.abs(corrida) < 1) return
    animacion.current?.cancel()
    retenida.current?.cancel()
    retenida.current = el.animate([{ translate: `0 ${corrida.toFixed(1)}px` }, { translate: `0 ${corrida.toFixed(1)}px` }], { duration: RETENIDA_MS, fill: 'forwards' })
  }, [pastilla, ruta])
}
