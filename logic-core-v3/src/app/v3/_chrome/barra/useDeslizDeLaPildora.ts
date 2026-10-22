'use client'

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

import { EVENTOS_DEL_VELO, conLaBandaCorta, retenerElQuieto, viaDelVelo } from '../../_lib/veloDeNavegacion'
import { VELO, tiemposDelVelo } from '../velo/velo'

import { CALMA_DEL_DESLIZ, CURVA_DEL_DESLIZ, arrancaElDesliz, cuadroCalmo, type CuadroDelDesliz } from './desliz'

/** [B12a.8] T2 · Lo que tarda en deslizarse a su lugar del destino: el destape del velo (`velo.ts`; [T0] el de la vía del velo). */
export const deslizDeLaPildoraMs = (): number => tiemposDelVelo(conLaBandaCorta(viaDelVelo())).destaparMs

/** Un `translate` vertical retenido (dos cuadros clave iguales: la píldora se queda ahí hasta que se cancela). */
const RETENIDA_MS = 60_000

/** [T0] El techo de la retención del «quieto» (ms): todo lo que puede durar una pasada (cubrir, tapado, la espera de la calma y deslizarse). */
const SEGURO_DE_LA_RETENCION_MS = VELO.cubrirMs + VELO.esperaMaximaMs + CALMA_DEL_DESLIZ.esperaMaximaMs + VELO.destaparMs + CALMA_DEL_DESLIZ.retencionMaximaMs

/**
 * [B12a.8] T2 · LA PÍLDORA SE DESLIZA A SU LUGAR DEL DESTINO mientras pasa el velo (que pasa por debajo del chrome: la píldora se ve todo
 * el tiempo). Tres momentos:
 *   1 · el velo empieza a cubrir (`EVENTOS_DEL_VELO.cubre`): se toma dónde está; [T0] y se retiene el «quieto» del velo hasta terminar;
 *   2 · cambia la ruta (un efecto de LAYOUT, antes de pintar): el layout ya la puso en su lugar nuevo (el nacimiento de la ruta), así que se
 *       la retiene donde estaba, sin que se vea el salto;
 *   3 · el velo empieza a destapar (`EVENTOS_DEL_VELO.destapa`): [T0] la píldora sigue retenida (si su lugar del destino se corre, la
 *       retención lo sigue: no se mueve) hasta que el hilo está calmo (`desliz.ts`: dos cuadros seguidos con la hora fresca y cortos, o
 *       400 ms), y ahí se anima desde donde estaba hasta su lugar, con la hora de ese cuadro y rellenando hacia atrás. Al terminar suelta el
 *       «quieto»: las obras del home que esperan al velo arrancan después, no en medio del deslizamiento.
 *       [B12a.8] Antes arrancaba con `repuso`, en medio del montaje del home (aparecía ya por el 72 %: un salto de 24 a 606 px); el WIP
 *       `97c80a64` (un cuadro después de `destapa`) seguía cruzando el cuadro largo del montaje: 6,51 px/ms en el banco (la curva, 2,64).
 * Con movimiento reducido, va derecho a su lugar. Animaciones de `translate`: el compositor, sin tocar el `transform` de la píldora.
 */
export function useDeslizDeLaPildora(pastilla: RefObject<HTMLElement | null>, ruta: string | null): void {
  const desde = useRef<number | null>(null)
  const retenida = useRef<Animation | null>(null)
  /** [T0] Cuánto la corre la retención (px): para seguir a su lugar del destino si se corre mientras espera la calma. */
  const corridaRetenida = useRef(0)
  const animacion = useRef<Animation | null>(null)

  useEffect(() => {
    const el = pastilla.current
    if (el === null) return undefined
    let cuadro = 0
    let seguro = 0
    let soltarElQuieto: () => void = () => undefined
    const soltar = (): void => {
      window.clearTimeout(seguro)
      soltarElQuieto()
    }
    const retener = (corrida: number): void => {
      retenida.current?.cancel()
      corridaRetenida.current = corrida
      retenida.current = el.animate([{ translate: `0 ${corrida.toFixed(1)}px` }, { translate: `0 ${corrida.toFixed(1)}px` }], { duration: RETENIDA_MS, fill: 'forwards' })
    }
    const alCubrir = (): void => {
      desde.current = el.getBoundingClientRect().top
      cancelAnimationFrame(cuadro)
      soltar()
      // [T0] El «quieto» del velo espera a que la píldora termine (con un techo, por si la pasada se corta).
      soltarElQuieto = retenerElQuieto()
      seguro = window.setTimeout(soltar, SEGURO_DE_LA_RETENCION_MS)
    }
    const alDestapar = (): void => {
      const d = desde.current
      desde.current = null
      cancelAnimationFrame(cuadro)
      if (d === null) {
        retenida.current?.cancel()
        retenida.current = null
        soltar()
        return
      }
      const t0 = performance.now()
      let anterior: CuadroDelDesliz | null = null
      let calmos = 0
      const esperar = (hora: number): void => {
        const c: CuadroDelDesliz = { ahora: performance.now(), hora }
        calmos = cuadroCalmo(anterior, c) ? calmos + 1 : 0
        anterior = c
        if (!arrancaElDesliz(calmos, c.ahora - t0)) {
          // Retenida donde estaba; si su lugar del destino se corrió (el documento del home todavía se acomoda), la retención lo sigue.
          if (retenida.current !== null) {
            const corrida = d - (el.getBoundingClientRect().top - corridaRetenida.current)
            if (Math.abs(corrida - corridaRetenida.current) > 0.5) retener(corrida)
          }
          cuadro = requestAnimationFrame(esperar)
          return
        }
        const sinRetener = el.getBoundingClientRect().top - (retenida.current === null ? 0 : corridaRetenida.current)
        retenida.current?.cancel()
        retenida.current = null
        animacion.current?.cancel()
        const corrida = d - sinRetener
        const suelta = soltarElQuieto
        if (Math.abs(corrida) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          soltar()
          return
        }
        // [T0] Con la hora de este cuadro calmo y rellenando hacia atrás: ningún cuadro la muestra en el destino antes de tiempo.
        const a = el.animate([{ translate: `0 ${corrida.toFixed(1)}px` }, { translate: '0 0' }], { duration: deslizDeLaPildoraMs(), easing: CURVA_DEL_DESLIZ, fill: 'backwards' })
        a.startTime = performance.now()
        animacion.current = a
        // Terminada (o cortada por otra pasada), suelta SU retención del «quieto» (la de otra pasada, no).
        a.onfinish = () => suelta()
        a.oncancel = () => suelta()
      }
      cuadro = requestAnimationFrame(esperar)
    }
    window.addEventListener(EVENTOS_DEL_VELO.cubre, alCubrir)
    window.addEventListener(EVENTOS_DEL_VELO.destapa, alDestapar)
    return () => {
      window.removeEventListener(EVENTOS_DEL_VELO.cubre, alCubrir)
      window.removeEventListener(EVENTOS_DEL_VELO.destapa, alDestapar)
      cancelAnimationFrame(cuadro)
      soltar()
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
    corridaRetenida.current = corrida
    retenida.current = el.animate([{ translate: `0 ${corrida.toFixed(1)}px` }, { translate: `0 ${corrida.toFixed(1)}px` }], { duration: RETENIDA_MS, fill: 'forwards' })
  }, [pastilla, ruta])
}
