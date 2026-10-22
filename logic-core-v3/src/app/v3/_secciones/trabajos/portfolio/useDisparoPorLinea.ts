'use client'

import { useEffect, useState, type RefObject } from 'react'

import { useMovimientoEnTodoAncho } from '../../_contrato/coreografia'
import { cruceDelTramo } from '../../_contrato/cruce'
import { LINEA_DEL_DISPARO, estaALaVista, margenDelDisparo, siguienteEstado, type EstadoDelGatillo } from '../../_contrato/disparo'
import { vigilarElReposo } from '../../_contrato/reposo'

/**
 * [B1.2e] EL DISPARO POR LÍNEA, COMO UN SÍ O UN NO — para lo que se revela con su propia animación (el título «Portfolio» con su P2, el
 * «?» de «la tuya» que se arma) en el flujo del carrusel. Es la máquina del gatillo del contrato (`_contrato/disparo.ts`: el cruce, los
 * cuatro estados, la línea y la guarda en reposo), observada como la observa `Gatillo.tsx`; acá devuelve sólo si la pieza está puesta.
 * `Gatillo` pinta su propia corrida y no expone el estado, y su fuente la fija s77: por eso no se usa el componente. Sin movimiento (el HTML
 * servido, el movimiento reducido) está puesta: a la vista y quieta.
 */
export function useDisparoPorLinea(caja: RefObject<HTMLElement | null>): boolean {
  const anima = useMovimientoEnTodoAncho()
  const [estado, setEstado] = useState<EstadoDelGatillo>('quieto')
  useEffect(() => {
    const el = caja.current
    if (!anima || el === null) return undefined
    let primero = true
    let soltarElReposo: (() => void) | null = null
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e === undefined) return
        const entrada = cruceDelTramo({ cruza: e.isIntersecting, tope: e.boundingClientRect.top, pie: e.boundingClientRect.bottom })
        const tipo = primero ? 'carga' : 'cruce'
        primero = false
        setEstado((actual) => siguienteEstado(actual, { tipo, entrada }))
        soltarElReposo ??= vigilarElReposo(el, (aLaVista) => setEstado((actual) => siguienteEstado(actual, { tipo: 'reposo', aLaVista })))
      },
      { rootMargin: margenDelDisparo(LINEA_DEL_DISPARO) },
    )
    observador.observe(el)
    return () => {
      observador.disconnect()
      soltarElReposo?.()
    }
  }, [anima, caja])
  return estaALaVista(anima ? estado : siguienteEstado(estado, { tipo: 'sin-movimiento' }))
}
