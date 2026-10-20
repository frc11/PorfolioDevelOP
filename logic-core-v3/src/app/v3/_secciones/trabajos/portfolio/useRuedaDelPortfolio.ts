'use client'

import { useEffect, type RefObject } from 'react'

import { conElDefecto } from './medida'
import { GESTO_QUIETO, calibracionDeLaRafaga, destinoDeLaRueda, gestoDeLaRueda, pxDeLaRueda, rafagaDeLaRueda, type DestinoDeLaRueda, type EventoDelRastro } from './rueda'

/** Lo que la rueda necesita de la sección, leído en cada evento (una `ref`: nada se vuelve a suscribir). */
export interface ControlDeLaRueda {
  /** La tira activa si la rueda manda (el panel adentro, el escenario pegado, ningún diálogo abierto), o `null`. */
  readonly manda: () => number | null
  /**
   * Un salto en vuelo: la rueda no hace nada (sigue siendo el mismo gesto). [B1.2d] Y es del Portfolio aunque el panel ya no mande (el
   * vuelo a Demos o hacia arriba publica su destino en el acto): nadie le pisa el viaje con la rueda.
   */
  readonly ocupado: () => boolean
  readonly ir: (destino: DestinoDeLaRueda) => void
  /**
   * [B1.2d] A2.3 · Una ráfaga hacia `sentido` (`px`: lo que trae este evento, que Lenis todavía no sumó a su destino): `true` si el
   * Portfolio la toma (sale sin recorrer lo que falta, lo saltea entero si la ráfaga entra al tramo, o ya está volando por una): la rueda
   * se traga. `false`: es de la página.
   */
  readonly rafaga: (sentido: 1 | -1, px: number) => boolean
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
 * [B1.2d] A2.3 · Antes que nada, la ráfaga (`rafagaDeLaRueda`, con la calibración de `?rafaga=`).
 */
export function useRuedaDelPortfolio(control: RefObject<ControlDeLaRueda | null>): void {
  useEffect(() => {
    let gesto = GESTO_QUIETO
    let rastro: readonly EventoDelRastro[] = []
    const calibracion = calibracionDeLaRafaga(window.location.search)
    const alGirar = (e: WheelEvent): void => {
      const c = control.current
      if (c === null || e.ctrlKey || e.deltaY === 0) return
      const ahora = performance.now()
      c.ultimaRueda.current = ahora
      const px = pxDeLaRueda(e.deltaY, e.deltaMode)
      const r = rafagaDeLaRueda(rastro, px, ahora, calibracion)
      rastro = r.rastro
      const enUnDialogo = (): boolean => e.composedPath().some((n) => n instanceof HTMLElement && n.hasAttribute('data-lenis-prevent'))
      if (r.sentido !== null && !enUnDialogo() && c.rafaga(r.sentido, px)) {
        const deLaRafaga: EventoDeLenis = e
        deLaRafaga.lenisStopPropagation = true
        if (e.cancelable) e.preventDefault()
        gesto = { acumulado: 0, ultimo: ahora, disparado: true }
        return
      }
      const activa = c.manda()
      const ocupado = c.ocupado()
      const enVuelo = ocupado && !conElDefecto('vuelo-sin-dueno')
      if (activa === null && !enVuelo) {
        // El gesto que corre la página afuera del panel es de la página: si el panel entra en el medio, ese gesto ya no da un paso
        // (el siguiente, sí).
        gesto = { acumulado: 0, ultimo: ahora, disparado: true }
        return
      }
      if (enUnDialogo()) return
      const paraLenis: EventoDeLenis = e
      paraLenis.lenisStopPropagation = true
      if (e.cancelable) e.preventDefault()
      if (activa === null) {
        // [B1.2d] El vuelo de la salida (a Demos o hacia arriba) termina sí o sí: la rueda se traga y el gesto queda disparado.
        gesto = { acumulado: 0, ultimo: ahora, disparado: true }
        return
      }
      c.inerte.current = { x: e.clientX, y: e.clientY }
      const g = gestoDeLaRueda(gesto, px, ahora, ocupado)
      gesto = g.gesto
      if (g.sentido !== null) c.ir(destinoDeLaRueda(activa, g.sentido))
    }
    window.addEventListener('wheel', alGirar, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', alGirar, { capture: true })
  }, [control])
}
