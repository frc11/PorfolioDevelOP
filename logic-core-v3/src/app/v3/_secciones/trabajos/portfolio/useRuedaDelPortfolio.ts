'use client'

import { useEffect, type RefObject } from 'react'

import { GESTO_QUIETO, destinoDeLaRueda, gestoDeLaRueda, pxDeLaRueda, type DestinoDeLaRueda } from './rueda'

/** Lo que la rueda necesita de la sección, leído en cada evento (una `ref`: nada se vuelve a suscribir). */
export interface ControlDeLaRueda {
  /** La tira activa si la rueda manda (el panel adentro, el escenario pegado, ningún diálogo abierto), o `null`. */
  readonly manda: () => number | null
  /** Un salto en vuelo: la rueda no hace nada (sigue siendo el mismo gesto). */
  readonly ocupado: () => boolean
  readonly ir: (destino: DestinoDeLaRueda) => void
  /** Dónde estaba el puntero cuando la rueda tomó el control: el hover queda inerte hasta que se mueva de ahí (`seMovioDeVerdad`). */
  readonly inerte: { current: { readonly x: number; readonly y: number } | null }
  /** Cuándo fue el último evento de la rueda, mande o no (ms): la entrada del panel atrapa la inercia de un gesto que viene corriendo. */
  readonly ultimaRueda: { current: number }
}

type EventoDeLenis = WheelEvent & { lenisStopPropagation?: boolean }

/**
 * [B1.2c] LA RUEDA, DE A UN PROYECTO (`rueda.ts`, plan §13, punto 5). En la fase de captura de la ventana, antes que Lenis (que escucha
 * en la de burbuja): con el panel adentro, cada gesto es un paso desde el activo y la página no se corre de a píxeles (ni Lenis, que
 * lee `lenisStopPropagation`, ni el navegador, `preventDefault`). Lo que pasa adentro de un diálogo (`data-lenis-prevent`) no se toca.
 */
export function useRuedaDelPortfolio(control: RefObject<ControlDeLaRueda | null>): void {
  useEffect(() => {
    let gesto = GESTO_QUIETO
    const alGirar = (e: WheelEvent): void => {
      const c = control.current
      if (c === null || e.ctrlKey || e.deltaY === 0) return
      const ahora = performance.now()
      c.ultimaRueda.current = ahora
      const activa = c.manda()
      if (activa === null) {
        // El gesto que corre la página afuera del panel es de la página: si el panel entra en el medio, ese gesto ya no da un paso
        // (el siguiente, sí).
        gesto = { acumulado: 0, ultimo: ahora, disparado: true }
        return
      }
      if (e.composedPath().some((n) => n instanceof HTMLElement && n.hasAttribute('data-lenis-prevent'))) return
      const paraLenis: EventoDeLenis = e
      paraLenis.lenisStopPropagation = true
      if (e.cancelable) e.preventDefault()
      c.inerte.current = { x: e.clientX, y: e.clientY }
      const r = gestoDeLaRueda(gesto, pxDeLaRueda(e.deltaY, e.deltaMode), ahora, c.ocupado())
      gesto = r.gesto
      if (r.sentido !== null) c.ir(destinoDeLaRueda(activa, r.sentido))
    }
    window.addEventListener('wheel', alGirar, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', alGirar, { capture: true })
  }, [control])
}
