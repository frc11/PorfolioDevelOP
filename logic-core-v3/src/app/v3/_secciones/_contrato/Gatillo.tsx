'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { useMovimientoEnTodoAncho } from './coreografia'
import { cruceDelTramo } from './cruce'
import { LINEA_DEL_DISPARO, margenDelDisparo, siguienteEstado, type EstadoDelGatillo } from './disparo'
import { vigilarElReposo } from './reposo'

/**
 * [P-H18] EL GATILLO — una pieza que entra ENTERA al cruzar la línea de disparo y se va en espejo al volver a subir por encima (el
 * «disparo por línea» del home). Es el de servicios (`_servicios/movimiento/Gatillo.tsx`), subido al contrato: desde acá se importa.
 * La máquina de estados es pura (`disparo.ts`); acá sólo se observa el cruce y se pintan los estados.
 *
 * El gesto es el del remate del home: aparece EN SU LUGAR con una corrida corta desde la derecha y un fundido, con la duración y la
 * curva de los tokens del tema. Nada entra desde abajo. Corre en todo ancho, como el remate (`useMovimientoEnTodoAncho`); con movimiento
 * reducido o sin la coreografía instalada (el HTML servido y el primer render) está QUIETO: a la vista y sin transición. El elemento que
 * se observa nunca se mueve: lo que se corre es su hijo. La guarda en reposo (P-H25) es `reposo.ts`.
 *
 * [C2 · 60c] `desde="abajo"`: la misma máquina, la misma línea y la misma duración, pero la corrida corta llega desde abajo (y se va
 * hacia abajo, en espejo). Es la entrada del CTA del Panel. Sin la prop, desde la derecha: los demás usos no cambian.
 */
const CLASES_DEL_ESTADO: Readonly<Record<EstadoDelGatillo, string>> = {
  quieto: '',
  espera: 'translate-x-8 opacity-0',
  puesto: 'transition duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none',
  ido: 'translate-x-8 opacity-0 transition duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none',
}

/** [C2 · 60c] La misma entrada, desde abajo: la traslación de 8 del tema, en el eje vertical. */
const CLASES_DESDE_ABAJO: Readonly<Record<EstadoDelGatillo, string>> = {
  quieto: '',
  espera: 'translate-y-8 opacity-0',
  puesto: 'transition duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none',
  ido: 'translate-y-8 opacity-0 transition duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none',
}

/**
 * [L2] `claseDelContenido`: la del hijo que se corre (lo que se mueve), para que una pieza que llena su alto (el carrusel del Portfolio en el
 * teléfono) siga siendo flex adentro del gatillo. Sin la prop, el marcado de siempre.
 */
const claseConLaDelContenido = (delEstado: string, delContenido: string | undefined): string => (delContenido === undefined ? delEstado : `${delEstado} ${delContenido}`.trim())

/** De dónde llega la pieza: del costado (el defecto, el gesto del remate del home) o desde abajo. */
export type DesdeDelGatillo = 'costado' | 'abajo'

export function Gatillo({ children, className, desde = 'costado', claseDelContenido }: { readonly children: ReactNode; readonly className?: string; readonly desde?: DesdeDelGatillo; readonly claseDelContenido?: string }): React.JSX.Element {
  const anima = useMovimientoEnTodoAncho()
  const [estado, setEstado] = useState<EstadoDelGatillo>('quieto')
  const caja = useRef<HTMLDivElement>(null)

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
  }, [anima])

  // Sin movimiento manda el estado quieto, sin escribirlo en un efecto: la pieza queda a la vista.
  const efectivo = anima ? estado : siguienteEstado(estado, { tipo: 'sin-movimiento' })
  return (
    <div ref={caja} data-gatillo={efectivo} className={className}>
      <div className={claseConLaDelContenido((desde === 'abajo' ? CLASES_DESDE_ABAJO : CLASES_DEL_ESTADO)[efectivo], claseDelContenido)}>{children}</div>
    </div>
  )
}
