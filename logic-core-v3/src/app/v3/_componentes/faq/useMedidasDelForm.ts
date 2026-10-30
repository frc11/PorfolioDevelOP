'use client'

import { useEffect, useState, type CSSProperties } from 'react'

/**
 * [C2-71] EL TAMAÑO DE LOS BLOQUES DEL FAQ DE VOLUMEN (ítem 22): el de la derecha (las respuestas), del tamaño del formulario del pie (su
 * caja del layout: la placa que se hundió por ese mismo lugar), y crece hacia abajo si una respuesta larga no entra; el de la izquierda (las
 * preguntas), del ancho del formulario y más alto (`masAlto`: no cuadrado). Lo mide del formulario del pie (`data-pieza`), con un
 * observador (cambia con el ancho de la ventana). Sin el pie de volumen, nada (el vidrio tiene su tamaño).
 */
// [L5] `masAlto` 1 (era 1,3: el bloque quedaba con un espacio grande abajo, lote2/17): el contenido lo agranda si hace falta.
export const MEDIDAS_DEL_FAQ = { masAlto: 1, formulario: '[data-pieza="contacto-del-pie"]' } as const

export interface MedidasDelFaq {
  readonly preguntas?: CSSProperties
  readonly respuesta?: CSSProperties
}

export function medidasDelFaq(ancho: number, alto: number): MedidasDelFaq {
  if (ancho <= 0 || alto <= 0) return {}
  return { respuesta: { width: ancho, minHeight: alto }, preguntas: { width: ancho, minHeight: Math.round(alto * MEDIDAS_DEL_FAQ.masAlto) } }
}

export function useMedidasDelForm(pie: string, activo: boolean): MedidasDelFaq {
  const [medida, setMedida] = useState<{ readonly ancho: number; readonly alto: number } | null>(null)
  useEffect(() => {
    if (!activo) return undefined
    const form = document.querySelector(pie)?.querySelector<HTMLElement>(MEDIDAS_DEL_FAQ.formulario)
    if (form === null || form === undefined) return undefined
    // El layout (sin la transformada que la escena le escribe a la placa); el observador avisa también al empezar.
    const vigia = new ResizeObserver(() => setMedida((m) => (m !== null && m.ancho === form.offsetWidth && m.alto === form.offsetHeight ? m : { ancho: form.offsetWidth, alto: form.offsetHeight })))
    vigia.observe(form)
    return () => vigia.disconnect()
  }, [pie, activo])
  return activo && medida !== null ? medidasDelFaq(medida.ancho, medida.alto) : {}
}
