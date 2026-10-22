'use client'

import { useEffect, useRef, useState } from 'react'

import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { montarElEnjambre } from '../../../_lib/nanobots/montaje'
import { PUNTOS_DEL_ENJAMBRE } from '../../../_lib/nanobots/simbolos'

/**
 * [B4] LOS NANOBOTS DE UN SERVICIO, EN SU LUGAR — para las pantallas sueltas (el teléfono con `?servicios-movil=deslizar`, y la
 * sección sin coreografía): el mismo motor de B4, con menos nanobots, posado en el símbolo del estado y vivo (el globo gira, los
 * engranajes giran, la red pulsa). El contexto WebGL existe sólo cerca de la vista (se crea al acercarse y se suelta al alejarse): en
 * la página nunca hay más de dos a la vez.
 */
/** Cuánto antes de la vista se crea el contexto (y cuánto después se suelta): el 60 % del cuadro arriba y abajo. */
const CERCA = [60, 0].map((v) => `${String(v)}%`).join(' ')

export function NanobotsQuietos({ estado, className }: { readonly estado: number; readonly className?: string }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const [cerca, setCerca] = useState(false)
  const reducido = useMovimientoReducido()
  const quieto = useRef(reducido)
  useEffect(() => {
    quieto.current = reducido
  }, [reducido])

  useEffect(() => {
    const el = caja.current
    if (el === null) return undefined
    const mirador = new IntersectionObserver(([e]) => setCerca(e?.isIntersecting === true), { rootMargin: CERCA })
    mirador.observe(el)
    return () => mirador.disconnect()
  }, [])

  useEffect(() => {
    const c = lienzo.current
    if (!cerca || c === null) return undefined
    let vivo = true
    let soltar: (() => void) | null = null
    void import('../../../_lib/nanobots/enjambreDeServicios')
      .then(({ crearEnjambreDeServicios }) => {
        if (!vivo) return
        const enjambre = crearEnjambreDeServicios(c, PUNTOS_DEL_ENJAMBRE.angosto)
        const ubicar = (): void => {
          const [w, h] = [c.clientWidth, c.clientHeight]
          enjambre.ubicar(enjambre.extensiones.map((ex) => ({ x: w / 2, y: h / 2, unidad: Math.min(w, h) / 2 / ex })))
        }
        ubicar()
        const medidor = new ResizeObserver(ubicar)
        medidor.observe(c)
        const desmontar = montarElEnjambre(c, enjambre, { get: () => estado }, quieto, { listo: () => undefined, perdido: () => undefined })
        soltar = () => {
          medidor.disconnect()
          desmontar()
        }
      })
      .catch(() => undefined)
    return () => {
      vivo = false
      soltar?.()
    }
  }, [cerca, estado])

  return (
    <div ref={caja} aria-hidden="true" data-pieza="nanobots-quietos" data-estado={estado} className={className}>
      {cerca ? <canvas ref={lienzo} className="pointer-events-none size-full" /> : null}
    </div>
  )
}
