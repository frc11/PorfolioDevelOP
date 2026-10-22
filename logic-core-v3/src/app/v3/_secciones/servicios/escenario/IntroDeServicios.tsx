'use client'

import { useEffect } from 'react'
import type { MotionValue } from 'motion/react'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../../_componentes/tipografia/Titular'
import { CanalDeUnaPieza } from '../../_contrato/canales'
import type { Progreso } from '../../_contrato/coreografia'
import { TITULAR } from '../contenido'
import { SUBTITULO } from './datos'

/**
 * [B4] LA ENTRADA DE LA SECCIÓN — «Nuestros servicios» y su bajada, sobre el papel y delante de los nanobots grises. Entra con el
 * efecto de los títulos que vienen desde abajo, el de los módulos del Panel (P2 con la ventana de la demo: `Bloque` + `CanalDeUnaPieza`
 * del contrato, los mismos que usa `tu-panel/Tarjeta.tsx`). Como vive adentro del escenario pegado, el bloque que se MIDE está afuera,
 * en la pista (`MarcaDeLaEntrada`): una caja que no se pega, donde estaría el título con el escenario recién anclado; su progreso
 * llega acá por `progreso`.
 *
 * El `h2` es el encabezado de la sección (`aria-labelledby` de la `<section>`). `data-caja-del-titulo` marca lo que el truco de
 * profundidad tiene que esquivar: las cajas de sus renglones.
 */
export function IntroDeServicios({ progreso, className }: { readonly progreso: Progreso; readonly className?: string }): React.JSX.Element {
  return (
    <div data-pieza="entrada-de-servicios" className={className}>
      <CanalDeUnaPieza progreso={progreso} patron="P2" className="flex flex-col items-center gap-[var(--spacing-4)] text-center">
        {/* `titulo-l` (el nivel del titular de la sección de siempre) y la bajada en dos renglones: el título queda en el tercio
            del medio, así el globo de web (a la derecha) se posa sin pisarlo y el cambio de capa tiene su cuadro limpio (`capa.ts`). */}
        <Titular nivel="titulo-l" como="h2" id={idDelTitularDeSeccion('servicios')}>
          <span data-caja-del-titulo="">{TITULAR}</span>
        </Titular>
        <Cuerpo className="max-w-[calc(var(--spacing-20)*3.2)] text-tinta-media">
          <span data-caja-del-titulo="">{SUBTITULO}</span>
        </Cuerpo>
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
