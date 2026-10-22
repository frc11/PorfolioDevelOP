'use client'

import { useMotionValue, useTransform, type MotionValue } from 'motion/react'

import { CanalDeUnaPieza } from '../../../_secciones/_contrato/canales'
import { Bloque, type Progreso } from '../../../_secciones/_contrato/coreografia'

/**
 * [B13] CÓMO LLEGA CADA PIEZA DEL CIERRE — el gesto de la casa (P5), como en la lista y en el pie del home, sin la mezcla: el cierre de una
 * página de noche va en los claros (la sección invertida), no en la diferencia contra la sala de día. Sin coreografía, quietas y puestas.
 */

/** Una pieza que llega con P5 sobre su ventana visible (la lista de Seis razones). */
export function LlegaEnSuVentana({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <Bloque patron="P5" rango="ventana-visible">
      {(progreso) => (
        <CanalDeUnaPieza progreso={progreso} patron="P5">
          {children}
        </CanalDeUnaPieza>
      )}
    </Bloque>
  )
}

/** El tramo de una ventana del progreso del pie, o `null` sin coreografía. */
export function useTramoDelPie(progreso: Progreso, ventana: readonly [number, number]): MotionValue<number> | null {
  const cero = useMotionValue(0)
  const tramo = useTransform(progreso ?? cero, [ventana[0], ventana[1]], [0, 1])
  return progreso === null ? null : tramo
}

/** Una pieza del pie que llega con P5 en su ventana de la pantalla del pie (`LLEGADAS_DEL_PIE`, las del home). */
export function LlegaEnElPie({ progreso, ventana, className, children }: { readonly progreso: Progreso; readonly ventana: readonly [number, number]; readonly className?: string; readonly children: React.ReactNode }): React.JSX.Element {
  const tramo = useTramoDelPie(progreso, ventana)
  return (
    <CanalDeUnaPieza progreso={tramo} patron="P5" className={className}>
      {children}
    </CanalDeUnaPieza>
  )
}
