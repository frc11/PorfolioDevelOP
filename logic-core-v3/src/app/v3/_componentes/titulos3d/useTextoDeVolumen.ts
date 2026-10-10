'use client'

import type { MotionValue } from 'motion/react'
import { useRef, type RefObject } from 'react'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import type { LlegadaDelTitulo } from '../../_lib/escena/titulos3d/llegada'
import { useTituloDeVolumen, useTituloListo, useTitulosDeVolumen, type FuenteDelTitulo, type TrazoDelTitulo } from '../../_lib/titulos3d/registro'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'

/**
 * [RETOQUE 3D] UN TEXTO DEL DOM CON SU VOLUMEN, con el marcado de su sección (el hero, «El equipo»): a diferencia de
 * `TituloDeVolumen`, no arma su propio renglón; la sección le da el elemento que ya pinta el texto (el `lugar`) y, con el
 * título armado (`listo`), lo apaga con `TEXTO_REEMPLAZADO`: una opacidad, no `invisible`, así el texto sigue en el árbol
 * accesible (es el nombre del encabezado) y el hero sigue siendo el LCP (se pinta primero; el 3D llega después). Va con la
 * página (`pantalla`): sin escenario, en cada cuadro donde la cámara de ahora lo ve. Desde 1024 y con los títulos prendidos.
 */
export interface TextoDeVolumen {
  readonly id: string
  /** El texto como se VE (con `uppercase`, en mayúsculas): las letras que se extruyen. */
  readonly texto: string
  readonly fuente: FuenteDelTitulo
  readonly gesto: LlegadaDelTitulo
  /** El progreso de su llegada; `null`: llega sola, una vez, al armarse. */
  readonly llegada: MotionValue<number> | null
  readonly queda: boolean
  readonly rearma?: boolean
  readonly minimoS?: number | null
  /** [RETOQUE PANEL] T4 · sus rayas (memorizadas: cambiarlas lo vuelve a armar). */
  readonly trazos?: readonly TrazoDelTitulo[]
  /** [PULIDO 11] A2 · no llega encima del logo mientras su sección entra. */
  readonly esquivaElLogo?: boolean
}

/** El texto del DOM, apagado desde 1024 con el título armado (sigue en el árbol accesible y en su lugar). */
export const TEXTO_REEMPLAZADO = 'escritorio:opacity-0 transition-opacity duration-[var(--duracion-media)] ease-[var(--ease-salida)]'

export function useTextoDeVolumen<T extends HTMLElement>(t: TextoDeVolumen): { readonly lugar: RefObject<T | null>; readonly listo: boolean } {
  const material = useTitulosDeVolumen()
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const listo = useTituloListo(t.id)
  const lugar = useRef<T | null>(null)
  useTituloDeVolumen({
    id: t.id,
    texto: t.texto,
    lugar,
    lectura: 0,
    llegada: t.llegada,
    salida: null,
    queda: t.queda,
    fuente: t.fuente,
    gesto: t.gesto,
    colocacion: 'pantalla',
    rearma: t.rearma ?? true,
    minimoS: t.minimoS ?? null,
    trazos: t.trazos,
    esquivaElLogo: t.esquivaElLogo,
    activo: material !== 'no' && escritorio,
  })
  return { lugar, listo }
}
