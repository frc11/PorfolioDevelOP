'use client'

import { useCallback, useRef, useState } from 'react'

import { sonar } from '../../_lib/sonido/bus'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { TEXTO_DEL_MEDIO, TITULO_DEL_SERVICIO } from '../../_secciones/servicios/escenario/datos'
import { useAlCruzar } from '../_lab/useAlCruzar'

/** Lo repetitivo, en las palabras de la página de IA: «mensajes, recordatorios, cargas de datos y avisos entre sistemas». */
const TAREAS = [
  'Mandar el recordatorio de cada turno',
  'Contestar «¿cuánto sale?» otra vez',
  'Pasar cada pedido a la planilla',
  'Avisar que llegó lo que esperaban',
  'Cargar los datos de cada cliente nuevo',
] as const

/**
 * [L7e · I3] PASA SOLO — la lista de lo que hoy se hace a mano, y cada tarea, al cruzar la línea, se TILDA sola: el tilde se dibuja (el
 * trazo del signo ≠ de Quiénes somos), la tarea se despinta como lo tachado y al lado aparece «pasa solo» en el acento; suena el `tic`
 * del sitio (sólo con el sonido prendido: el sonido confirma, no adorna). Al subir, se destilda. Con movimiento reducido, sin trazo.
 */
export function PasaSolo(): React.JSX.Element {
  const titulo = TITULO_DEL_SERVICIO['ia-automatizacion']
  return (
    <div data-servicio="ia-automatizacion">
      <header className="mx-auto max-w-4xl px-6 pt-36 pb-[14svh] escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-acento uppercase">Integraciones con IA · automatizaciones</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Lo que hoy</span>
          <span className="block font-liviano tracking-titulo italic uppercase">hacés a mano</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-texto">{TEXTO_DEL_MEDIO['ia-automatizacion'][2]}</p>
      </header>
      <ul className="mx-auto max-w-4xl px-6 pb-[40svh]">
        {TAREAS.map((t) => (
          <Tarea key={t} texto={t} />
        ))}
      </ul>
    </div>
  )
}

function Tarea({ texto }: { readonly texto: string }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const caja = useRef<HTMLLIElement>(null)
  const [hecha, setHecha] = useState(false)
  const alCambiar = useCallback((adentro: boolean) => {
    setHecha(adentro)
    if (adentro) sonar('tic')
  }, [])
  useAlCruzar(caja, alCambiar, true, 0.55, 0.68)
  const transicion = reducido ? 'none' : undefined
  return (
    <li ref={caja} className="flex items-center gap-4 border-b border-borde py-[6svh] tablet:gap-6">
      {/* El tilde: un trazo que se dibuja (`pathLength` 1, la raya del ≠), en una caja de borde fino. */}
      <svg viewBox="0 0 32 32" aria-hidden="true" className={`size-9 shrink-0 rounded-sutil border transition-colors duration-[var(--duracion-media)] ease-[var(--ease-salida)] tablet:size-11 ${hecha ? 'border-acento' : 'border-borde-fuerte'}`}>
        <path
          d="M8 16.5 L14 22.5 L24.5 10"
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-acento transition-[stroke-dashoffset] duration-[var(--duracion-lenta)] ease-[var(--ease-salida)]"
          style={{ strokeDasharray: 1, strokeDashoffset: hecha ? 0 : 1, transition: transicion }}
        />
      </svg>
      <p className={`grow text-titulo-s leading-titulo transition-colors duration-[var(--duracion-lenta)] ease-[var(--ease-salida)] tablet:text-titulo-m ${hecha ? 'text-tinta-media' : 'text-tinta'}`}>{texto}</p>
      <span
        aria-hidden="true"
        className="hidden shrink-0 font-codigo text-caption tracking-wide text-acento uppercase transition-[opacity,translate] duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] tablet:block motion-reduce:transition-none"
        style={{ opacity: hecha ? 1 : 0, translate: hecha ? '0 0' : '0 0.75rem' }}
      >
        Pasa solo
      </span>
      <span className="sr-only">{hecha ? 'Pasa solo' : ''}</span>
    </li>
  )
}
