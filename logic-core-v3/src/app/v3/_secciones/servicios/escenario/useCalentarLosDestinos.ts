'use client'

import { useEffect, type RefObject } from 'react'

import { calentarElDestino } from '../../../_componentes/navegacion/calentar'
import { DESTINO_DEL_SERVICIO } from './datos'

/**
 * [L8b · 4] LOS DESTINOS DE LOS SERVICIOS, CALENTADOS EN LA ENTRADA — el primer paso (de la entrada a Desarrollo web) se trababa ~0,4 s en el
 * build: al llegar el panel, su video (un enlace a la página) quedaba debajo del puntero quieto, el `pointerenter` calentaba el destino
 * (`calentarElDestino`: los trozos de las variantes y las fuentes del título de la página) y el `loadingdone` de esas fuentes hacía que la
 * coreografía volviera a ajustar las letras de los tres paneles, todo en el cuadro de la transición. Ahora se calienta antes: con el
 * escenario a la vista, pasado `ESPERA_MS` (la llegada a la entrada ya asentada) y en un rato ocioso del hilo. Una vez; el enlace después
 * no pide nada (`calentarElDestino` recuerda lo pedido).
 */
export const CALENTADO_DE_LOS_DESTINOS = { esperaMs: 1200, ociosoTopeMs: 2000 } as const

export function useCalentarLosDestinos(escenario: RefObject<HTMLElement | null>, activo: boolean): void {
  useEffect(() => {
    const el = escenario.current
    if (!activo || el === null) return undefined
    let reloj = 0
    let ocio = 0
    let hecho = false
    const calentar = (): void => {
      hecho = true
      mirador.disconnect()
      for (const href of new Set(Object.values(DESTINO_DEL_SERVICIO))) calentarElDestino(href)
    }
    const cancelar = (): void => {
      window.clearTimeout(reloj)
      if (ocio !== 0 && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(ocio)
      ocio = 0
    }
    const mirador = new IntersectionObserver(
      ([e]) => {
        cancelar()
        if (hecho || e?.isIntersecting !== true) return
        reloj = window.setTimeout(() => {
          if (typeof window.requestIdleCallback === 'function') ocio = window.requestIdleCallback(calentar, { timeout: CALENTADO_DE_LOS_DESTINOS.ociosoTopeMs })
          else calentar()
        }, CALENTADO_DE_LOS_DESTINOS.esperaMs)
      },
      { threshold: 0.6 },
    )
    mirador.observe(el)
    return () => {
      cancelar()
      mirador.disconnect()
    }
  }, [escenario, activo])
}
