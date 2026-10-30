'use client'

import { useEffect, useState, type RefObject } from 'react'

import { cruceDelTramo, puestoTras } from '../../_secciones/_contrato/cruce'
import { LINEA_DEL_DISPARO, margenDelDisparo } from '../../_secciones/_contrato/disparo'

/**
 * [M2] SI UN ELEMENTO YA CRUZÓ LA LÍNEA DE DISPARO del sitio (la del `Gatillo`: 6 % del alto desde abajo) — bajando, `true`; volviendo a subir
 * por encima de ella, `false` (en espejo). Pasarla de largo por arriba también cuenta como cruzada. Arranca en `false`: en el servidor y antes
 * del primer aviso, lo que se levanta está abajo (lo que lo usa decide qué pasa con movimiento reducido).
 */
export function useCruzoLaLinea(ref: RefObject<HTMLElement | null>): boolean {
  const [cruzo, setCruzo] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (el === null) return undefined
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e === undefined) return
        setCruzo(puestoTras(cruceDelTramo({ cruza: e.isIntersecting, tope: e.boundingClientRect.top, pie: e.boundingClientRect.bottom })))
      },
      { rootMargin: margenDelDisparo(LINEA_DEL_DISPARO) },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref])
  return cruzo
}
