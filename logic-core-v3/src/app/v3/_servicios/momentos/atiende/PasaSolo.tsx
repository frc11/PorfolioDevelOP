'use client'

import { useCallback, useRef, useState } from 'react'

import { sonar } from '../../../_lib/sonido/bus'
import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { useAvanceDelRecorrido } from '../useAvanceDelRecorrido'
import { PASA_SOLO, TAREAS, debeSonar, tildeSiguiente } from './datos'

/**
 * [M3] PASA SOLO — el prototipo 15: lo que hoy se hace a mano, y cada tarea, al cruzar el medio de la pantalla, se TILDA sola (el tilde se
 * dibuja en el verde de la página, la tarea pasa al gris de lo hecho y al lado aparece «pasa solo»). Suena el `tic` del sitio, sutil: el
 * bus no hace nada con el sonido apagado (el defecto), y con movimiento reducido no se llama nunca (`debeSonar`). Al subir, se destilda.
 * Con movimiento reducido, todas tildadas y quietas.
 */
export function PasaSolo(): React.JSX.Element {
  const reducido = useMovimientoReducido()
  return (
    <ul className="border-t border-borde">
      {TAREAS.map((t) => (
        <Tarea key={t.texto} texto={t.texto} tipo={t.tipo} reducido={reducido} />
      ))}
    </ul>
  )
}

function Tarea({ texto, tipo, reducido }: { readonly texto: string; readonly tipo: string; readonly reducido: boolean }): React.JSX.Element {
  const caja = useRef<HTMLLIElement>(null)
  const [tildada, setTildada] = useState(false)
  const estado = useRef(false)
  const alAvanzar = useCallback((avance: number) => {
    const antes = estado.current
    const ahora = tildeSiguiente(antes, avance)
    if (ahora === antes) return
    estado.current = ahora
    setTildada(ahora)
    const r = caja.current?.getBoundingClientRect()
    if (debeSonar({ reducido, antes, ahora, aLaVista: r !== undefined && r.bottom > 0 && r.top < window.innerHeight })) sonar('tic')
  }, [reducido])
  useAvanceDelRecorrido(caja, alAvanzar, { modo: 'cruce', desde: 0.62, hasta: 0.5 }, !reducido)
  const hecha = reducido || tildada
  return (
    <li ref={caja} data-tarea="" data-hecha={hecha ? '' : undefined} className="flex items-center gap-4 border-b border-borde py-5 tablet:gap-6 escritorio:py-7">
      <svg viewBox="0 0 32 32" aria-hidden="true" className={`size-9 shrink-0 rounded-sutil border transition-colors duration-[var(--duracion-media)] ease-[var(--ease-salida)] tablet:size-11 ${hecha ? 'border-acento' : 'border-borde-fuerte'}`}>
        <path
          d="M8 16.5 L14 22.5 L24.5 10"
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-acento transition-[stroke-dashoffset] duration-[var(--duracion-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none"
          style={{ strokeDasharray: 1, strokeDashoffset: hecha ? 0 : 1 }}
        />
      </svg>
      <span className="flex min-w-0 grow flex-col gap-1">
        <span className="font-codigo text-micro tracking-wide text-tinta-media uppercase">{tipo}</span>
        <span className={`text-titulo-s leading-titulo transition-colors duration-[var(--duracion-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none ${hecha ? 'text-tinta-media' : 'text-tinta'}`}>{texto}</span>
      </span>
      <span
        aria-hidden="true"
        className="hidden shrink-0 font-codigo text-caption tracking-wide text-acento uppercase transition-[opacity,translate] duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] tablet:block motion-reduce:transition-none"
        style={{ opacity: hecha ? 1 : 0, translate: hecha ? '0 0' : '0 0.75rem' }}
      >
        {PASA_SOLO}
      </span>
      <span className="sr-only">{hecha ? PASA_SOLO : ''}</span>
    </li>
  )
}
