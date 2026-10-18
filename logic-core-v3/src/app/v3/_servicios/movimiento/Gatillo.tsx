'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { seguirElScroll } from '../../_lib/scrollEnMovimiento'
import { ASIENTO } from '../../_lib/titulos3d/repeticiones'
import { useMovimientoEnTodoAncho } from '../../_secciones/_contrato/coreografia'
import { cruceDelTramo } from '../../_secciones/_contrato/cruce'
import { LINEA_DEL_DISPARO, margenDelDisparo, siguienteEstado, type EstadoDelGatillo } from './disparo'

/**
 * [SERVICIOS M1] EL GATILLO — una pieza que entra ENTERA al cruzar la línea de disparo y se va en espejo al volver a subir por encima
 * (el «disparo por línea» del home). P-H18: reemplazar por el import de _contrato. La máquina de estados es pura (`disparo.ts`); acá
 * solo se observa el cruce y se pintan los estados.
 *
 * El gesto es el del remate del home: aparece EN SU LUGAR con una corrida corta desde la derecha y un fundido, con la duración y la
 * curva de los tokens del tema (`--duracion-muy-lenta`, `--ease-salida`). Nada entra desde abajo.
 *
 * Corre en todo ancho, como el remate (`useMovimientoEnTodoAncho`); con movimiento reducido o sin la coreografía instalada (el HTML
 * servido y el primer render) está QUIETO: a la vista y sin transición. El elemento que se observa nunca se mueve: lo que se corre es
 * su hijo.
 *
 * La guarda en reposo (P-H25) escucha el scroll con el escucha compartido del home (`_lib/scrollEnMovimiento.ts`) y espera el quieto
 * del asiento del home (`ASIENTO.quietoMs`). Arranca con el primer aviso del observador, para que el primer reposo encuentre el
 * estado de carga.
 */
const CLASES_DEL_ESTADO: Readonly<Record<EstadoDelGatillo, string>> = {
  quieto: '',
  espera: 'translate-x-8 opacity-0',
  puesto: 'transition duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none',
  ido: 'translate-x-8 opacity-0 transition duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none',
}

export function Gatillo({ children, className }: { readonly children: ReactNode; readonly className?: string }): React.JSX.Element {
  const anima = useMovimientoEnTodoAncho()
  const [estado, setEstado] = useState<EstadoDelGatillo>('quieto')
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = caja.current
    if (!anima || el === null) return undefined
    let primero = true
    let soltarElScroll: (() => void) | null = null
    const enReposo = (): void => {
      const borde = el.getBoundingClientRect()
      const aLaVista = borde.bottom > 0 && borde.top < window.innerHeight
      setEstado((actual) => siguienteEstado(actual, { tipo: 'reposo', aLaVista }))
    }
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e === undefined) return
        const entrada = cruceDelTramo({ cruza: e.isIntersecting, tope: e.boundingClientRect.top, pie: e.boundingClientRect.bottom })
        const tipo = primero ? 'carga' : 'cruce'
        primero = false
        setEstado((actual) => siguienteEstado(actual, { tipo, entrada }))
        if (soltarElScroll === null) soltarElScroll = seguirElScroll(ASIENTO.quietoMs, () => undefined, enReposo)
      },
      { rootMargin: margenDelDisparo(LINEA_DEL_DISPARO) },
    )
    observador.observe(el)
    return () => {
      observador.disconnect()
      soltarElScroll?.()
    }
  }, [anima])

  // Sin movimiento manda el estado quieto, sin escribirlo en un efecto: la pieza queda a la vista.
  const efectivo = anima ? estado : siguienteEstado(estado, { tipo: 'sin-movimiento' })
  return (
    <div ref={caja} data-gatillo={efectivo} className={className}>
      <div className={CLASES_DEL_ESTADO[efectivo]}>{children}</div>
    </div>
  )
}
