'use client'

import { Check, Pause, Play } from 'lucide-react'
import { motion, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'

import { SERVICIOS } from '../../_secciones/_contrato/acento'
import { Caption, Micro } from '../tipografia/Textos'
import { PROCESOS_DE_EJEMPLO, ROTULO_DEL_PROCESO } from './ejemplos'
import { useLatido } from './useLatido'

/**
 * [INTERFAZ 2] T3 · SERVICIOS, FUNCIONANDO — la propuesta para Servicios en la línea de Tu panel (`vida=si`).
 *
 * Servicios no tiene la sala detrás (es papel opaco): la vida tiene que ser propia. En la columna fija, debajo de la
 * torta, el recorrido de UN pedido de ejemplo por lo que hace el servicio que el rodillo muestra: los pasos se van
 * cumpliendo de a uno (un latido de 1,1 s cada uno), se sostienen dos latidos y vuelve a empezar. Cambia con el rodillo
 * (lo lee del mismo disparo, `posicion`), sin escuchar el scroll (s6-servicios lo prohíbe). En el estado 00 («Nuestros
 * servicios») guarda su lugar vacío: la torta no se mueve al aparecer.
 *
 * Mismo trato que el panel: se nombra para el lector, lo que se mueve no se anuncia, se pausa con su botón, y solo
 * fuera de cuadro o con movimiento reducido.
 */
export const MS_DEL_PASO = 1100
const LATIDOS_DE_PAUSA = 2

export function ProcesoEnVivo({ posicion }: { readonly posicion: MotionValue<number> }): React.JSX.Element {
  const caja = useRef<HTMLElement>(null)
  const [estado, setEstado] = useState(() => Math.round(posicion.get()))
  const [pausado, setPausado] = useState(false)
  const latido = useLatido(caja, MS_DEL_PASO, pausado)
  // El latido en que empezó este servicio: el recorrido arranca de cero cada vez que el rodillo cambia.
  const [desde, setDesde] = useState(latido)
  useMotionValueEvent(posicion, 'change', (v) => {
    const e = Math.round(v)
    if (e === estado) return
    setEstado(e)
    setDesde(latido)
  })

  const servicio = SERVICIOS[estado - 1] ?? null
  const pasos = servicio === null ? [] : PROCESOS_DE_EJEMPLO[servicio.id]
  const ciclo = pasos.length + LATIDOS_DE_PAUSA
  const cumplidos = pasos.length === 0 ? 0 : Math.min(pasos.length, ((latido - desde) % ciclo) + 1)

  return (
    <figure
      ref={caja}
      data-pieza="proceso-en-vivo"
      aria-label={servicio === null ? undefined : `Ejemplo de ${servicio.nombre} funcionando`}
      aria-hidden={servicio === null ? true : undefined}
      className={`border-borde flex flex-col gap-[var(--spacing-3)] rounded-[var(--radius-medio)] border p-[var(--spacing-4)] transition-opacity duration-[var(--duracion-media)] ${servicio === null ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex items-center justify-between gap-[var(--spacing-3)]">
        <Micro como="span" peso="medio" className="flex items-center gap-[var(--spacing-2)] uppercase">
          <span aria-hidden="true" className="bg-tinta size-[var(--spacing-2)] rounded-full motion-safe:animate-pulse" />
          {ROTULO_DEL_PROCESO}
        </Micro>
        <button
          type="button"
          tabIndex={servicio === null ? -1 : undefined}
          onClick={() => setPausado((p) => !p)}
          aria-label={pausado ? 'Reanudar el ejemplo' : 'Pausar el ejemplo'}
          className="text-tinta-media hover:text-tinta focus-visible:text-tinta grid size-[var(--spacing-8)] place-items-center rounded-full"
        >
          {pausado ? <Play aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" /> : <Pause aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" />}
        </button>
      </div>
      {/* Cuatro renglones siempre (vacíos en el 00): el alto no cambia con el estado. */}
      <ol aria-hidden="true" className="flex flex-col gap-[var(--spacing-2)]">
        {Array.from({ length: 4 }, (_, i) => {
          const paso = pasos[i] ?? ''
          const hecho = i < cumplidos
          return (
            <li key={`${String(estado)}-${String(i)}`} className="flex items-center gap-[var(--spacing-2)]">
              <motion.span
                className="border-borde grid size-[var(--spacing-5)] shrink-0 place-items-center rounded-full border"
                animate={{ scale: hecho ? 1 : 0.8, opacity: hecho ? 1 : 0.4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {hecho && <Check strokeWidth={1.5} className="size-[var(--spacing-3)]" />}
              </motion.span>
              <motion.span animate={{ opacity: hecho ? 1 : 0.4 }} transition={{ duration: 0.3 }}>
                <Caption como="span" peso={i === cumplidos - 1 ? 'medio' : 'normal'}>
                  {paso}
                </Caption>
              </motion.span>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
