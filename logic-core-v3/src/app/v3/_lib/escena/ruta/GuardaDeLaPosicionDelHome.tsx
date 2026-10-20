'use client'

import { useLayoutEffect } from 'react'

import { guardarLaPosicionDelHome, posicionDeAhora } from './posicionDelHome'

/**
 * [B12a.7] GUARDA DÓNDE ESTABA EL HOME AL IRSE, por cualquier camino (un enlace, la flecha, el menú): en la limpieza de un efecto de
 * layout, que React corre al desmontar el home ANTES de sacar su DOM, con el scroll y la noche todavía suyos (después, el documento de la
 * página acorta el scroll y la gota apaga la noche en su limpieza pasiva). La monta sólo el home; sin DOM propio.
 */
export function GuardaDeLaPosicionDelHome(): null {
  useLayoutEffect(() => () => guardarLaPosicionDelHome(posicionDeAhora()), [])
  return null
}
