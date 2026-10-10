'use client'

import { useSyncExternalStore } from 'react'

/**
 * [PULIDO 10] J8 · CÓMO SE REPARTE EL PIE DESDE 1025 (con el pie de volumen; abajo, el apilado de siempre):
 *
 *   producto     25/50/25: a la izquierda develOP, el titular, el mail, WhatsApp, el recorrido (en texto, dos columnas: 4 y
 *                3), las redes y la línea legal; el medio, del logo; a la derecha, el formulario
 *   columna2     (`?pie=columna2`) cuatro columnas de un cuarto: el logo en la segunda —la cámara corre el encuadre
 *                (`setViewOffset`, en `OrbitRig`), no la escena—, el recorrido en la tercera y el formulario en la cuarta
 *   menu-abajo   (`?pie=menu-abajo`) como el producto, con el recorrido en una fila abajo, de lado a lado
 *
 * Se lee de la consulta de la página, como `?gracias=` (`formularios/gracias.ts`): sin pedir, o con otro valor, el producto.
 */
export type DisposicionDelPie = 'producto' | 'columna2' | 'menu-abajo'

export function disposicionDelPie(valor: string | null | undefined): DisposicionDelPie {
  return valor === 'columna2' || valor === 'menu-abajo' ? valor : 'producto'
}

/** La disposición de la consulta de la página (en el servidor, el producto). */
export function disposicionDeLaPagina(): DisposicionDelPie {
  return typeof window === 'undefined' ? 'producto' : disposicionDelPie(new URLSearchParams(window.location.search).get('pie'))
}

const sinCambios = (): (() => void) => () => undefined

export function useDisposicionDelPie(): DisposicionDelPie {
  return useSyncExternalStore(sinCambios, disposicionDeLaPagina, () => 'producto' as const)
}

/** En `columna2`, cuánto corre la cámara el encuadre (fracción del ancho): del centro (50 %) al de la segunda columna (37,5 %). */
export const CORRIMIENTO_DE_LA_COLUMNA_2 = 0.125
