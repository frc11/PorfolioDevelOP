'use client'

import { motion, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { sampleLightArc } from '../../_lib/escena/choreographySampler'
import type { MutableLightLevels } from '../../_lib/escena/choreographyTypes'
import { medirLasSecciones } from '../../_lib/escena/extensionDeLasSecciones'
import { progresoDelScroll } from '../../_lib/escena/recorrido'
import type { PropsDeLaVariante } from './IndicadorDelRecorrido'
import { SECCIONES_DEL_RECORRIDO, avanceDeLaPagina, seccionDelTramo } from './recorrido'

/**
 * [INTERFAZ 2] T4 · V2 — EL RELOJ DEL DÍA. Un disco con el ciclo de la escena a lo largo de la página, leído del arco de
 * luz que mueve la sala (el mismo `sampleLightArc` del rig): el día del hero y de Quiénes somos, el atardecer, la noche de
 * Trabajos, la vuelta y el amanecer escondidos detrás de Servicios y Tu panel, y el día del final. Cada sección es una
 * «hora» igual del disco (el reparto del recorrido) y la luz de cada hora es la de esa parte de la página. La aguja marca
 * dónde estás; en su punta, el sol o la luna (el color de la luz de ese momento). Cada sección es un punto en el borde,
 * donde empieza; tocar el disco lleva a la sección de esa hora.
 *
 * Los colores son los dos extremos de la sala, no los de la tinta: el disco no se da vuelta con el tono de la página
 * (la noche es noche sobre papel y sobre oscuro).
 */
export const DIA_DEL_RELOJ = '#F7F7F5' // el papel de la sala (`PAPER_COLOR`)
export const NOCHE_DEL_RELOJ = '#141414' // la sala de noche
const MUESTRAS = 96

/** El color de la luz `nivel` (0 la noche, 1 el día), entre los dos extremos de la sala. */
export function colorDeLaLuz(nivel: number): string {
  const n = Math.max(0, Math.min(1, nivel))
  const canal = (i: number): string => {
    const a = parseInt(NOCHE_DEL_RELOJ.slice(1 + i * 2, 3 + i * 2), 16)
    const b = parseInt(DIA_DEL_RELOJ.slice(1 + i * 2, 3 + i * 2), 16)
    return Math.round(a + (b - a) * n)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${canal(0)}${canal(1)}${canal(2)}`
}

/** El nivel de luz de la sala en cada «hora» del disco (`n` muestras del avance del recorrido, de 0 a 1). */
export function nivelesDelRecorrido(n: number, inicios: readonly number[]): number[] {
  const alto = window.innerHeight
  const secciones = medirLasSecciones(document, window.scrollY)
  const maximo = Math.max(1, document.documentElement.scrollHeight - alto)
  const arco: MutableLightLevels = { level: 1, kelvin: 0, azimuthDeg: 0, elevationDeg: 0 }
  return Array.from({ length: n }, (_, k) => {
    if (secciones === null) return 1
    sampleLightArc(progresoDelScroll(avanceDeLaPagina(k / (n - 1), inicios) * maximo, secciones.arriba, secciones.abajo, alto), arco)
    return arco.level
  })
}

/** Dónde cae en el borde del disco (en % de su caja) el avance `p`: arriba es el principio, en el sentido del reloj. */
export function lugarEnElDisco(p: number, radio = 44): readonly [number, number] {
  const a = p * 2 * Math.PI
  return [50 + radio * Math.sin(a), 50 - radio * Math.cos(a)]
}

export function RelojDelDia({ recorrido, inicios, pasos, ir }: PropsDeLaVariante): React.JSX.Element {
  const disco = useRef<HTMLSpanElement>(null)
  const [niveles, setNiveles] = useState<readonly number[]>(() => Array.from({ length: MUESTRAS }, () => 1))
  // Se mide con el documento armado (en el cuadro siguiente) y cada vez que el recorrido se vuelve a medir.
  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setNiveles(nivelesDelRecorrido(MUESTRAS, inicios)))
    return () => cancelAnimationFrame(cuadro)
  }, [inicios])

  const giro = useTransform(recorrido, (r) => `rotate(${(r * 360).toFixed(2)}deg)`)
  const astro = useTransform(recorrido, (r) => colorDeLaLuz(niveles[Math.min(MUESTRAS - 1, Math.round(r * (MUESTRAS - 1)))] ?? 1))
  const gradiente = `conic-gradient(${niveles.map((n, k) => `${colorDeLaLuz(n)} ${((k / (MUESTRAS - 1)) * 100).toFixed(2)}%`).join(', ')})`

  const alTocar = (e: React.MouseEvent<HTMLSpanElement>): void => {
    const r = disco.current?.getBoundingClientRect()
    if (r === undefined) return
    const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)))
    ir(seccionDelTramo((a < 0 ? a + 2 * Math.PI : a) / (2 * Math.PI), SECCIONES_DEL_RECORRIDO.length))
  }

  return (
    <span className="relative block size-[var(--spacing-20)]">
      <span ref={disco} aria-hidden="true" onClick={alTocar} className="border-borde absolute inset-0 block cursor-pointer rounded-full border" style={{ background: gradiente }}>
        {/* El centro: un hueco del color de la pastilla, para que el ciclo se lea como un anillo. */}
        <span className="bg-fondo border-borde absolute inset-[22%] block rounded-full border" />
        {/* La aguja, del centro al borde, y en su punta la luz de ahora. */}
        <motion.span className="absolute inset-0 block" style={{ transform: giro }}>
          <span className="bg-tinta absolute top-[8%] left-1/2 block h-[42%] w-[var(--border-hairline)] -translate-x-1/2" />
          <motion.span className="border-tinta absolute top-[4%] left-1/2 block size-[var(--spacing-3)] -translate-x-1/2 rounded-full border" style={{ backgroundColor: astro }} />
        </motion.span>
      </span>
      {pasos(SECCIONES_DEL_RECORRIDO.map((_, i) => lugarEnElDisco(i / SECCIONES_DEL_RECORRIDO.length)))}
    </span>
  )
}
