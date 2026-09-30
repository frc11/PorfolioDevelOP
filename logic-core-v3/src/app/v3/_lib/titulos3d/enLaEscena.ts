'use client'

import { motionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, type RefObject } from 'react'

/**
 * [ESCENA 9] T5 · V2 · LOS TÍTULOS EN LA ESCENA, del lado del DOM — sin three: la sección anota acá su título (el
 * elemento que ocupa su lugar, el texto y cuánto llegó) y la escena (`escena/titulos/TitulosEnLaEscena.tsx`) lo dibuja en
 * 3D en el mismo lugar de la pantalla. La tinta la lee la escena del elemento de arriba (el que la pinta en el DOM).
 */
export interface TituloParaLaEscena {
  readonly id: string
  readonly texto: string
  readonly elemento: HTMLElement
  /** Cuánto llegó, de 0 a 1 (el mismo progreso que movía la pieza). */
  llegada: number
}

export const TITULOS_PARA_LA_ESCENA = new Map<string, TituloParaLaEscena>()

/** Un progreso quieto (llegado), para cuando no hay uno: los ganchos no pueden ser condicionales. */
const LLEGADO = motionValue(1)

export function useTituloEnLaEscena(id: string, texto: string, elemento: RefObject<HTMLElement | null>, progreso: MotionValue<number> | null): void {
  useEffect(() => {
    const el = elemento.current
    if (el === null) return undefined
    TITULOS_PARA_LA_ESCENA.set(id, { id, texto, elemento: el, llegada: progreso === null ? 1 : progreso.get() })
    return () => {
      TITULOS_PARA_LA_ESCENA.delete(id)
    }
  }, [id, texto, elemento, progreso])
  useMotionValueEvent(progreso ?? LLEGADO, 'change', (p) => {
    const t = TITULOS_PARA_LA_ESCENA.get(id)
    if (t !== undefined) t.llegada = p
  })
}
