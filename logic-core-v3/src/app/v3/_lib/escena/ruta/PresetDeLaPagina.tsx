'use client'

import { useLayoutEffect } from 'react'

import { apilarElPreset, type PresetDeLaEscena } from './preset'

/**
 * [B12a.1] LA PÁGINA DECLARA SU PRESET (D1) — lo apila al montarse (antes del primer cuadro: `useLayoutEffect`) y lo saca al
 * desmontarse. No pinta nada. El preset tiene que ser estable (una constante de la página): cada uno nuevo es una entrada nueva en la pila.
 */
export function PresetDeLaPagina({ preset }: { readonly preset: PresetDeLaEscena }): null {
  useLayoutEffect(() => apilarElPreset(preset), [preset])
  return null
}
