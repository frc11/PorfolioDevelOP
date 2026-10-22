'use client'

import { useSyncExternalStore } from 'react'

import type { PalabraEnElTelefono, PosicionDelGrupo } from './geometria'

/**
 * [B6] LAS BANDERAS DE CALIBRACIÓN DE TU PANEL — para que Valentino elija; después la elegida queda como constante y la
 * bandera se va.
 *
 *   `?grupo=final|union`           la posición vertical del grupo palabra/título/descripción desde 1024. Defecto `final`.
 *   `?palabra-movil=union|debajo`  la palabra fundida abajo de 1024: en la unión o debajo del título. Defecto `union`.
 *
 * Se leen de la URL una vez (el HTML del servidor sale con el defecto y la hidratación pasa a la de la URL).
 */
export const GRUPO_POR_DEFECTO: PosicionDelGrupo = 'final'
export const PALABRA_POR_DEFECTO: PalabraEnElTelefono = 'union'

export function posicionDelGrupo(valor: string | null): PosicionDelGrupo {
  return valor === 'union' ? 'union' : valor === 'final' ? 'final' : GRUPO_POR_DEFECTO
}

export function palabraEnElTelefono(valor: string | null): PalabraEnElTelefono {
  return valor === 'debajo' ? 'debajo' : valor === 'union' ? 'union' : PALABRA_POR_DEFECTO
}

const sinCambios = (): (() => void) => () => undefined
const deLaUrl = (nombre: string): string | null => new URLSearchParams(window.location.search).get(nombre)

export function useBanderasDelPanel(): { readonly grupo: PosicionDelGrupo; readonly palabra: PalabraEnElTelefono } {
  const grupo = useSyncExternalStore(sinCambios, () => posicionDelGrupo(deLaUrl('grupo')), () => GRUPO_POR_DEFECTO)
  const palabra = useSyncExternalStore(sinCambios, () => palabraEnElTelefono(deLaUrl('palabra-movil')), () => PALABRA_POR_DEFECTO)
  return { grupo, palabra }
}
