'use client'

import { motion, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { LOGO_INK_VIEWBOX, LOGO_INK_VIEWBOX_ATTR, LOGO_PATH_D } from '@/components/ui/LogoMark'

import type { PropsDeLaVariante } from './IndicadorDelRecorrido'
import { GRUESO_DEL_TRAZO, SECCIONES_DEL_RECORRIDO, TRAZO_DEL_INFINITO, TRAZO_DEL_PALO, dibujado, seccionDelTramo } from './recorrido'

/**
 * [INTERFAZ 2] T4 · V1 — EL LOGO QUE SE DIBUJA. El logo chico, con su silueta apenas marcada, y su trazo que se dibuja
 * con el recorrido: el infinito con las secciones hasta Por qué develOP y el palo de la «p» con el Cierre. Recorrer la
 * página es construir el logo.
 *
 * El trazo es la línea central del logo (`recorrido.ts`) con el grueso del tubo; se dibuja con `stroke-dashoffset` sobre
 * un largo normalizado (`pathLength = 1`), movido por el avance directo: ni un render de React por cuadro. Cada sección
 * es un punto sobre el trazo, donde empieza su tramo; tocar cualquier punto del trazo lleva a la sección de ese tramo.
 */
const MUESTRAS = 160
const N = SECCIONES_DEL_RECORRIDO.length

export function LogoQueSeDibuja({ recorrido, pasos, ir }: PropsDeLaVariante): React.JSX.Element {
  const svg = useRef<SVGSVGElement>(null)
  const infinito = useRef<SVGPathElement>(null)
  const palo = useRef<SVGPathElement>(null)
  const restoDelInfinito = useTransform(recorrido, (r) => 1 - dibujado(r, N).infinito)
  const restoDelPalo = useTransform(recorrido, (r) => 1 - dibujado(r, N).palo)
  // Un trazo sin largo con punta redonda dibuja un punto: hasta que empieza, no se ve.
  const veoElInfinito = useTransform(recorrido, (r) => (dibujado(r, N).infinito > 0.002 ? 1 : 0))
  const veoElPalo = useTransform(recorrido, (r) => (dibujado(r, N).palo > 0.002 ? 1 : 0))
  const [lugares, setLugares] = useState<readonly (readonly [number, number])[]>([])
  const muestras = useRef<{ readonly x: number; readonly y: number; readonly r: number }[]>([])

  // Dónde va cada punto (y las muestras para tocar el trazo): se mide una vez, del trazo de verdad.
  useEffect(() => {
    const a = infinito.current
    const b = palo.current
    if (a === null || b === null) return undefined
    const cuadro = requestAnimationFrame(() => {
      const [la, lb] = [a.getTotalLength(), b.getTotalLength()]
      const v = LOGO_INK_VIEWBOX
      const enPorcentaje = (pt: DOMPoint): readonly [number, number] => [((pt.x - v.x) / v.width) * 100, ((pt.y - v.y) / v.height) * 100]
      // Las secciones hasta Por qué develOP, a lo largo del infinito; el Cierre, donde arranca el palo.
      setLugares(SECCIONES_DEL_RECORRIDO.map((_, i) => (i < N - 1 ? enPorcentaje(a.getPointAtLength((i / (N - 1)) * la)) : enPorcentaje(b.getPointAtLength(0)))))
      const lista: { x: number; y: number; r: number }[] = []
      for (let k = 0; k <= MUESTRAS; k += 1) {
        const f = k / MUESTRAS
        const pi = a.getPointAtLength(f * la)
        lista.push({ x: pi.x, y: pi.y, r: f * ((N - 1) / N) })
        const pp = b.getPointAtLength(f * lb)
        lista.push({ x: pp.x, y: pp.y, r: (N - 1 + f) / N })
      }
      muestras.current = lista
    })
    return () => cancelAnimationFrame(cuadro)
  }, [])

  const alTocar = (e: React.MouseEvent<SVGPathElement>): void => {
    const m = svg.current?.getScreenCTM()
    if (m === null || m === undefined) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    let [mejor, distancia] = [0, Number.POSITIVE_INFINITY]
    for (const s of muestras.current) {
      const d = (s.x - pt.x) ** 2 + (s.y - pt.y) ** 2
      if (d < distancia) [mejor, distancia] = [s.r, d]
    }
    ir(seccionDelTramo(mejor, N))
  }

  return (
    <span className="relative block w-[calc(var(--spacing-20)*1.6)]">
      <svg ref={svg} viewBox={LOGO_INK_VIEWBOX_ATTR} aria-hidden="true" className="block h-auto w-full overflow-visible">
        <path d={LOGO_PATH_D} fill="currentColor" opacity={0.14} />
        <motion.path ref={infinito} d={TRAZO_DEL_INFINITO} fill="none" stroke="currentColor" strokeWidth={GRUESO_DEL_TRAZO} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: restoDelInfinito, opacity: veoElInfinito }} />
        <motion.path ref={palo} d={TRAZO_DEL_PALO} fill="none" stroke="currentColor" strokeWidth={GRUESO_DEL_TRAZO} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: restoDelPalo, opacity: veoElPalo }} />
        {/* Lo que se toca: el trazo entero, más ancho que lo que se ve (con el mouse; el teclado tiene los puntos). */}
        <path d={`${TRAZO_DEL_INFINITO} ${TRAZO_DEL_PALO}`} fill="none" stroke="transparent" strokeWidth={GRUESO_DEL_TRAZO * 2.4} pointerEvents="stroke" onClick={alTocar} className="cursor-pointer" />
      </svg>
      {pasos(lugares)}
    </span>
  )
}
