'use client'

import { useEffect, useState, type RefObject } from 'react'

import { cruceDelTramo, puestoTras } from '../../_secciones/_contrato/cruce'
import { LINEA_DEL_DISPARO, margenDelDisparo } from '../../_secciones/_contrato/disparo'

/**
 * [M2] SI UN ELEMENTO YA CRUZÓ LA LÍNEA DE DISPARO del sitio (la del `Gatillo`: 6 % del alto desde abajo) — bajando, `true` (`retrasoMs` después);
 * volviendo a subir por encima de ella, `false` en el acto (en espejo). Pasarla de largo por arriba también cuenta como cruzada. Arranca en
 * `false`: en el servidor y antes del primer aviso, lo que se levanta está abajo (lo que lo usa decide qué pasa con movimiento reducido).
 */
export function useCruzoLaLinea(ref: RefObject<HTMLElement | null>, retrasoMs = 0): boolean {
  const [cruzo, setCruzo] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (el === null) return undefined
    let espera = 0
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e === undefined) return
        window.clearTimeout(espera)
        const puesto = puestoTras(cruceDelTramo({ cruza: e.isIntersecting, tope: e.boundingClientRect.top, pie: e.boundingClientRect.bottom }))
        if (!puesto) setCruzo(false)
        else espera = window.setTimeout(() => setCruzo(true), retrasoMs)
      },
      { rootMargin: margenDelDisparo(LINEA_DEL_DISPARO) },
    )
    observador.observe(el)
    return () => {
      observador.disconnect()
      window.clearTimeout(espera)
    }
  }, [ref, retrasoMs])
  return cruzo
}
