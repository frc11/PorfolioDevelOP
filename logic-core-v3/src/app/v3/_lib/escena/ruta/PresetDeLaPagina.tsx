'use client'

import { useEffect, useLayoutEffect } from 'react'

import { REGISTRO_DE_VARIANTES } from '../../../_variantes/registro'

import { apilarElPreset, type PresetDeLaEscena } from './preset'

/**
 * [B12a.1] LA PÁGINA DECLARA SU PRESET (D1) — lo apila al montarse (antes del primer cuadro: `useLayoutEffect`) y lo saca al
 * desmontarse. No pinta nada. El preset tiene que ser estable (una constante de la página): cada uno nuevo es una entrada nueva en la pila.
 *
 * [T0 · 2026-10-22] 11 · 1 · Y pide ya el trozo de su variante (el import del registro, el mismo que hace la ranura): entrando directo, el
 * lienzo llega después que la página, y la variante tiene que estar para el primer cuadro (la noche y el acento desde el arranque).
 */
export function PresetDeLaPagina({ preset }: { readonly preset: PresetDeLaEscena }): null {
  useLayoutEffect(() => apilarElPreset(preset), [preset])
  useEffect(() => {
    if (preset.variante !== null) void REGISTRO_DE_VARIANTES[preset.variante]().catch(() => undefined)
  }, [preset])
  return null
}
