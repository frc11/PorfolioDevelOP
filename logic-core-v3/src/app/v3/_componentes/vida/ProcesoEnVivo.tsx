'use client'

import { Check } from 'lucide-react'
import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'

import { SERVICIOS } from '../../_secciones/_contrato/acento'
import { Caption, Micro } from '../tipografia/Textos'
import { PROCESOS_DE_EJEMPLO, ROTULO_DEL_PROCESO } from './ejemplos'
import { useLatido } from './useLatido'

/**
 * [INTERFAZ 2] T3 · SERVICIOS, FUNCIONANDO — la propuesta para Servicios en la línea de Tu panel (en el producto desde
 * el cierre).
 *
 * Servicios no tiene la sala detrás (es papel opaco): la vida tiene que ser propia. En la columna fija, debajo de la
 * torta, el recorrido de UN pedido de ejemplo por lo que hace el servicio que el rodillo muestra: los pasos se cumplen de
 * a uno (un latido de 1,1 s cada uno) y quedan cumplidos. Vuelve a empezar cuando el rodillo cambia de servicio (lo lee
 * del mismo disparo, `posicion`), sin escuchar el scroll (s6-servicios lo prohíbe). En el estado 00 («Nuestros
 * servicios») guarda su lugar vacío: la torta no se mueve al aparecer.
 *
 * [Cierre de INTERFAZ 2] Corre UNA vez por servicio (4,4 s) y se queda quieto: menos de cinco segundos de movimiento
 * solo, así que no pide un botón de pausa (WCAG 2.2.2), y las dos ramas de la sección tienen el mismo recorrido de
 * teclado (`s6-servicios`). Sin `<li>` (la sección no tiene listas) ni transformadas en el marcado: las marcas se
 * cumplen por clase.
 */
export const MS_DEL_PASO = 1100

export function ProcesoEnVivo({ posicion }: { readonly posicion: MotionValue<number> }): React.JSX.Element {
  const caja = useRef<HTMLElement>(null)
  const [estado, setEstado] = useState(() => Math.round(posicion.get()))
  const servicio = SERVICIOS[estado - 1] ?? null
  const pasos = servicio === null ? [] : PROCESOS_DE_EJEMPLO[servicio.id]
  // El latido en que empezó este servicio: el recorrido arranca de cero cada vez que el rodillo cambia.
  const [desde, setDesde] = useState(0)
  const [cumplidosAntes, setCumplidosAntes] = useState(0)
  const quieto = pasos.length === 0 || cumplidosAntes >= pasos.length
  const latido = useLatido(caja, MS_DEL_PASO, quieto)
  const cumplidos = pasos.length === 0 ? 0 : Math.min(pasos.length, latido - desde + 1)
  if (cumplidos !== cumplidosAntes) setCumplidosAntes(cumplidos)
  useMotionValueEvent(posicion, 'change', (v) => {
    const e = Math.round(v)
    if (e === estado) return
    setEstado(e)
    setDesde(latido)
    setCumplidosAntes(0)
  })

  return (
    <figure
      ref={caja}
      data-pieza="proceso-en-vivo"
      aria-label={servicio === null ? undefined : `Ejemplo de ${servicio.nombre} funcionando`}
      aria-hidden={servicio === null ? true : undefined}
      className={`border-borde flex flex-col gap-[var(--spacing-3)] rounded-[var(--radius-medio)] border p-[var(--spacing-4)] transition-opacity duration-[var(--duracion-media)] ${servicio === null ? 'opacity-0' : 'opacity-100'}`}
    >
      <Micro como="span" peso="medio" className="flex items-center gap-[var(--spacing-2)] uppercase">
        <span aria-hidden="true" className={`bg-tinta size-[var(--spacing-2)] rounded-full ${quieto ? '' : 'motion-safe:animate-pulse'}`} />
        {ROTULO_DEL_PROCESO}
      </Micro>
      {/* Cuatro renglones siempre (vacíos en el 00): el alto no cambia con el estado. */}
      <div aria-hidden="true" className="flex flex-col gap-[var(--spacing-2)]">
        {Array.from({ length: 4 }, (_, i) => {
          const hecho = i < cumplidos
          return (
            <div key={`${String(estado)}-${String(i)}`} className="flex items-center gap-[var(--spacing-2)]">
              <span className={`border-borde grid size-[var(--spacing-5)] shrink-0 place-items-center rounded-full border transition-[scale,opacity] duration-[var(--duracion-media)] ease-out ${hecho ? 'scale-100 opacity-100' : 'scale-80 opacity-40'}`}>
                {hecho && <Check strokeWidth={1.5} className="size-[var(--spacing-3)]" />}
              </span>
              <Caption como="span" peso={i === cumplidos - 1 ? 'medio' : 'normal'} className={`transition-opacity duration-[var(--duracion-media)] ${hecho ? 'opacity-100' : 'opacity-40'}`}>
                {pasos[i] ?? ''}
              </Caption>
            </div>
          )
        })}
      </div>
    </figure>
  )
}
