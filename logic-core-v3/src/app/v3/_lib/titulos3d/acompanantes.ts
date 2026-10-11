'use client'

import { useEffect, useRef, type RefObject } from 'react'

import { CONSULTA_ESCENARIO } from '../compuerta'
import { useAnchoMinimo } from '../useAnchoMinimo'
import { useTituloListo, useTitulosDeVolumen } from './registro'

/**
 * [NOCTURNO] A1 · EL TEXTO 2D QUE ACOMPAÑA A UN TÍTULO 3D, del lado del DOM — la bajada y los CTA del hero, la bajada de
 * Portfolio, los valores de la frase de Por qué develOP, el párrafo de Demos. El título vive en el mundo y la cámara lo
 * corre (el mouse, la coreografía); su texto 2D se quedaba quieto y el título le pasaba por encima. La sección anota acá
 * el elemento y la escena (`escena/titulos3d/acompanantes.ts`) le escribe en cada cuadro la transformada que lo deja en
 * el MISMO plano que su título (sin `setState`, sólo si cambió). Sigue siendo el DOM: se enfoca, se cliquea y lo anuncia
 * el lector; el anillo del foco va con él. Desde 1024, con los títulos prendidos y el suyo armado (si no, en su lugar).
 */
export interface Acompanante {
  /** El `id` del título que acompaña. */
  readonly titulo: string
  /** Lo último que la escena le escribió (`''`: en su lugar). */
  css: string
  /** [AJUSTES FINALES] A4 · y su opacidad (`''`: la suya): el del titular del hero aparece con las letras que caen. */
  opacidad: string
}

export const ACOMPANANTES = new Map<HTMLElement, Acompanante>()

/** El elemento que va en el plano del título `titulo`: se le pasa la `ref` que devuelve. */
export function useAcompananteDelTitulo<T extends HTMLElement>(titulo: string): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const material = useTitulosDeVolumen()
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const listo = useTituloListo(titulo)
  const activo = material !== 'no' && escritorio && listo
  useEffect(() => {
    const el = ref.current
    if (!activo || el === null) return undefined
    ACOMPANANTES.set(el, { titulo, css: '', opacidad: '' })
    return () => {
      ACOMPANANTES.delete(el)
      el.style.transform = ''
      el.style.transformOrigin = ''
      el.style.opacity = ''
    }
  }, [titulo, activo])
  return ref
}
