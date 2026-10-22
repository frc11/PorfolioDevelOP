'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { conElDefectoDeLosGatillos } from '../../../_componentes/gatillos/defectos'
import { useGatillos } from '../../../_componentes/gatillos/useGatillos'
import { hayBanco } from '../../../_lib/escena/entorno'

import { LLEGADA_DE_DEMOS, PISTA_DE_LA_PARADA, llegadaEnCurso, scrollDeLaTuya } from './parada'

/** La pista, en `svh` (en escritorio es la ventana: la regla la mide `useGatillos` con `innerHeight`). */
const ESTILO_DE_LA_PISTA = {
  bottom: `${(PISTA_DE_LA_PARADA.abajo * 100).toFixed(2)}svh`,
  height: `${(PISTA_DE_LA_PARADA.alto * 100).toFixed(2)}svh`,
} as const

/**
 * [NOCTURNO B5] LA PARADA DE DEMOS, EN LA PÁGINA (`parada.ts`) — la pista invisible y la máquina de gatillos común con un paso. Va en la
 * caja del Portfolio desde 1024 (abajo de 1024 el Portfolio es un flujo y la rueda es de la página, como en el carrusel).
 *
 * `reducido`: los vuelos son inmediatos (como los del Portfolio). Los defectos del banco (`sin-parada`, `parada-sin-llegada`) sólo los
 * pide `scripts-carga/demos-parada.ts` antes de cargar.
 */
export function ParadaDeDemos({ reducido }: { readonly reducido: boolean }): React.JSX.Element {
  const pista = useRef<HTMLSpanElement | null>(null)
  // En el cliente: el defecto lo pide el banco antes de cargar (en el servidor no hay ventana: la parada, prendida).
  const [activa] = useState(() => !conElDefectoDeLosGatillos('sin-parada'))
  const ocupada = useCallback((): boolean => !conElDefectoDeLosGatillos('parada-sin-llegada') && llegadaEnCurso(LLEGADA_DE_DEMOS.persecucion), [])
  const salidaDeArriba = useCallback((): number | null => scrollDeLaTuya(), [])
  useGatillos({ pista, cantidad: 1, activa, tactil: false, reducido, duracionMs: 0, ocupada, salidaDeArriba, nombre: 'demos' })

  // El banco: lo que mostró la llegada (la foto de «Demos entera» se toma con esto).
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as Window & { __paradaDeDemos?: unknown }
    ventana.__paradaDeDemos = { llegada: () => LLEGADA_DE_DEMOS.persecucion?.mostrada ?? null, enCurso: () => llegadaEnCurso(LLEGADA_DE_DEMOS.persecucion) }
    return () => {
      delete ventana.__paradaDeDemos
    }
  }, [])

  return <span ref={pista} aria-hidden="true" data-pieza="parada-de-demos" data-paso="-1" className="pointer-events-none absolute left-0 w-px" style={ESTILO_DE_LA_PISTA} />
}
