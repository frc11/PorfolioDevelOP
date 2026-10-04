'use client'

import { useEffect, useRef, useState } from 'react'

import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { montarElEnjambre } from '../../_lib/nanobots/montaje'
import { GraficoDeTorta, type GraficoDeTortaProps } from './GraficoDeTorta'
import { CLASE_DE_LA_TORTA } from './geometria'

/**
 * [PASADA FINAL] C4 · EL GRÁFICO DE SERVICIOS: LOS NANOBOTS — reemplaza a la torta junto al rodillo. Un enjambre que flota
 * y, cada vez que el rodillo cambia de servicio, se desarma y se arma en su símbolo (el globo de red, los engranajes, el
 * robot con su flujo), con el MISMO disparo que el rodillo y el CTA (`posicion`): ningún reloj propio para el traspaso.
 * El motor está en `_lib/nanobots/` (WebGL, una llamada, el morph en la GPU) y llega perezoso: three no entra al paquete
 * de la página por esto.
 *
 *   · **La torta queda de respaldo**: es lo que sale del servidor (y lo que leen los invariantes del marcado), lo que se
 *     ve hasta que el enjambre dibuja su primer cuadro y lo que vuelve si el navegador no da WebGL o pierde el contexto.
 *   · **Pausa fuera de pantalla** (`montaje.ts`). Con movimiento reducido, el símbolo quieto. En la cabeza angosta del
 *     teléfono, menos nanobots (`puntos`).
 *
 * El estado de React cambia una vez (cuando el enjambre está listo), nunca durante el pin.
 */
export function GraficoDeServicios({ progreso, medida, posicion, puntos }: GraficoDeTortaProps & { readonly puntos: number }): React.JSX.Element {
  const lienzo = useRef<HTMLCanvasElement>(null)
  const [listos, setListos] = useState(false)
  const reducido = useMovimientoReducido()
  const quieto = useRef(reducido)
  useEffect(() => {
    quieto.current = reducido
  }, [reducido])

  useEffect(() => {
    const c = lienzo.current
    if (c === null) return undefined
    let vivo = true
    let desmontar: (() => void) | null = null
    void import('../../_lib/nanobots/enjambre')
      .then(({ crearEnjambre }) => {
        if (!vivo) return
        desmontar = montarElEnjambre(c, crearEnjambre(c, puntos), posicion, quieto, { listo: () => setListos(true), perdido: () => setListos(false) })
      })
      // Sin WebGL (o sin el módulo): queda la torta.
      .catch(() => undefined)
    return () => {
      vivo = false
      desmontar?.()
    }
  }, [posicion, puntos])

  return (
    <div data-pieza="grafico-de-servicios" className={`relative aspect-square ${CLASE_DE_LA_TORTA}`}>
      {!listos && <GraficoDeTorta progreso={progreso} medida={medida} posicion={posicion} />}
      <canvas ref={lienzo} aria-hidden="true" data-pieza="nanobots" className="pointer-events-none absolute inset-0 size-full" />
    </div>
  )
}
