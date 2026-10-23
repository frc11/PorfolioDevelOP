'use client'

import { useEffect, type CSSProperties } from 'react'
import type { MotionValue } from 'motion/react'

import { AvisoDeScroll } from '../../../_componentes/avisos/AvisoDeScroll'
import { idDelTitularDeSeccion } from '../../../_componentes/tipografia/Titular'
import { CanalDeUnaPieza } from '../../_contrato/canales'
import type { Progreso } from '../../_contrato/coreografia'
import { RENGLONES_DEL_TITULO, SUBTITULO } from './datos'
import { TituloQueSePintaAlLlegar } from './TituloQueSePintaAlLlegar'

/**
 * [B4 · C2-50] LA ENTRADA DE LA SECCIÓN — «Nuestros servicios» y su bajada, sobre el papel, con los nanobots girando alrededor (ítem 12).
 * Entra con el efecto de los títulos que vienen desde abajo (P2 con la ventana de la demo: `Bloque` + `CanalDeUnaPieza`, como los
 * módulos del Panel) y, al terminar de llegar, se PINTA rápido, con el pintado del título del Panel (`TituloQueSePintaAlLlegar`). El
 * bloque que se MIDE está afuera, en la pista; su progreso llega por `progreso` (`null` sin coreografía: se pinta al verse).
 *
 *   · El título, en la letra del Panel y grande, en dos renglones (el tamaño: `VARIABLES_DEL_TITULO`).
 *   · La bajada, más grande y en tinta plena: contrasta contra los puntos.
 *   · Debajo, el aviso de scroll (`aviso`, de 05-TEXTOS: en escritorio «Scrolleá…», en el teléfono el del gesto).
 *   · El LUGAR de la órbita (`data-lugar-de-los-nanobots="0"`): la caja del título y la bajada, un poco más grande; el enjambre gira
 *     alrededor y pasa por detrás de las letras (el lienzo está debajo de la entrada hasta el cambio de capa).
 *
 * `data-caja-del-titulo` marca lo que el truco de profundidad tiene que esquivar: las cajas de los renglones.
 */

/** El título: el ancho de la entrada sobre `divisor`, con tope en `tope` svh (el Panel usa 10,1 y 15: éste queda en el tercio del medio). */
export const TAMANO_DEL_TITULO = { divisor: 13.5, tope: 11 } as const

const VARIABLES_DEL_TITULO = { '--divisor-del-titulo': String(TAMANO_DEL_TITULO.divisor), '--tope-del-titulo': `${String(TAMANO_DEL_TITULO.tope)}svh` } as CSSProperties

export function IntroDeServicios({ progreso, aviso, className }: { readonly progreso: Progreso; readonly aviso: string | null; readonly className?: string }): React.JSX.Element {
  return (
    <div data-pieza="entrada-de-servicios" className={className} style={VARIABLES_DEL_TITULO}>
      <CanalDeUnaPieza progreso={progreso} patron="P2" className="@container flex w-full flex-col items-center gap-[var(--spacing-6)] text-center">
        <div className="relative flex w-full flex-col items-center gap-[var(--spacing-4)]">
          <div aria-hidden="true" data-lugar-de-los-nanobots={0} className="pointer-events-none absolute -inset-y-[var(--spacing-8)] inset-x-0 mx-auto w-[min(100%,calc(var(--spacing-20)*9))]" />
          <TituloQueSePintaAlLlegar renglones={RENGLONES_DEL_TITULO} progreso={progreso} id={idDelTitularDeSeccion('servicios')} />
          <p className="font-cuerpo text-fluido-titulo-m leading-texto text-tinta max-w-[calc(var(--spacing-20)*5)]">
            <span data-caja-del-titulo="">{SUBTITULO}</span>
          </p>
        </div>
        {aviso === null ? null : <AvisoDeScroll texto={aviso} />}
      </CanalDeUnaPieza>
    </div>
  )
}

/** Pasa el progreso del bloque medido (en la pista) a la entrada (en el escenario). */
export function PasarElProgreso({ progreso, a }: { readonly progreso: MotionValue<number> | null; readonly a: (p: MotionValue<number> | null) => void }): null {
  useEffect(() => {
    a(progreso)
    return () => a(null)
  }, [progreso, a])
  return null
}
