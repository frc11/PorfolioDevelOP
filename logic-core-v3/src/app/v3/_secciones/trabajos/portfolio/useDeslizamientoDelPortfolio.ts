'use client'

import { useEffect, type RefObject } from 'react'

import { DESLIZAMIENTO, asentamiento } from './deslizamiento'
import { medir } from './medida'
import { PANTALLAS_POR_PASO, bordesDelPaso, pasoEn, type IndiceDePaso } from './pasos'

/** Lo que el deslizamiento necesita de la sección, leído en cada evento. */
export interface ControlDelDeslizamiento {
  readonly caja: RefObject<HTMLElement | null>
  /** El paso que se muestra ahora y si hay un salto en vuelo. */
  readonly paso: () => IndiceDePaso
  readonly ocupado: () => boolean
  readonly irAlPaso: (i: number) => void
}

/**
 * [B1.3] EL DESLIZAMIENTO EN LAS HISTORIAS, EN EL TELÉFONO (`deslizamiento.ts`): anota el paso cuando el dedo toca, y cuando la página
 * se queda quieta (`quietoMs` sin scroll y sin el dedo) la asienta en el centro de su proyecto, a lo sumo uno más allá. Sólo con las
 * historias (`activo`); los escuchas son pasivos (no frenan el scroll).
 */
export function useDeslizamientoDelPortfolio(activo: boolean, control: RefObject<ControlDelDeslizamiento | null>): void {
  useEffect(() => {
    if (!activo) return undefined
    let desde: IndiceDePaso | null = null
    let tocando = false
    let reloj = 0
    const asentar = (): void => {
      reloj = 0
      const c = control.current
      if (c === null || tocando || desde === null || c.ocupado()) return
      const m = medir(c.caja.current)
      if (m === null) return
      const crudo = pasoEn(m.px, PANTALLAS_POR_PASO)
      const { desde: d, hasta } = bordesDelPaso(crudo, PANTALLAS_POR_PASO)
      const desvio = Number.isFinite(d) && Number.isFinite(hasta) ? (m.px - (d + hasta) / 2) / (hasta - d) : 0
      const destino = asentamiento(desde, crudo, desvio)
      desde = null
      if (destino !== null) c.irAlPaso(destino)
    }
    const programar = (): void => {
      window.clearTimeout(reloj)
      reloj = window.setTimeout(asentar, DESLIZAMIENTO.quietoMs)
    }
    const alTocar = (): void => {
      tocando = true
      desde = control.current?.paso() ?? null
    }
    const alSoltar = (): void => {
      tocando = false
      programar()
    }
    const alMoverse = (): void => {
      if (!tocando && desde !== null) programar()
    }
    window.addEventListener('touchstart', alTocar, { passive: true })
    window.addEventListener('touchend', alSoltar, { passive: true })
    window.addEventListener('touchcancel', alSoltar, { passive: true })
    window.addEventListener('scroll', alMoverse, { passive: true })
    return () => {
      window.clearTimeout(reloj)
      window.removeEventListener('touchstart', alTocar)
      window.removeEventListener('touchend', alSoltar)
      window.removeEventListener('touchcancel', alSoltar)
      window.removeEventListener('scroll', alMoverse)
    }
  }, [activo, control])
}
