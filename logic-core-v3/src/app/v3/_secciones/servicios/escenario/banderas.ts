'use client'

import { useSyncExternalStore } from 'react'

/**
 * [B4] LAS DOS BANDERAS DE LA SECCIÓN, para que Valentino elija (después se van y queda la elegida como constante):
 *
 *   `?diagonal=30|20|12`               el ángulo de la franja del texto, en grados desde la vertical. Por defecto, 20.
 *   `?servicios-movil=deslizar|gatillo` abajo de 1024: cada servicio una pantalla con scroll normal (por defecto), o de a uno con
 *                                       gatillos, como en escritorio.
 */

export const ANGULOS_DE_LA_DIAGONAL = [30, 20, 12] as const
export type AnguloDeLaDiagonal = (typeof ANGULOS_DE_LA_DIAGONAL)[number]
export const DIAGONAL_POR_DEFECTO: AnguloDeLaDiagonal = 20

export const MODOS_EN_EL_TELEFONO = ['deslizar', 'gatillo'] as const
export type ModoEnElTelefono = (typeof MODOS_EN_EL_TELEFONO)[number]
export const MODO_POR_DEFECTO: ModoEnElTelefono = 'deslizar'

export function diagonalDeLaBandera(valor: string | null): AnguloDeLaDiagonal {
  return ANGULOS_DE_LA_DIAGONAL.find((a) => String(a) === valor) ?? DIAGONAL_POR_DEFECTO
}

export function modoDeLaBandera(valor: string | null): ModoEnElTelefono {
  return MODOS_EN_EL_TELEFONO.find((m) => m === valor) ?? MODO_POR_DEFECTO
}

/** La tangente del ángulo: cuánto corre la diagonal en horizontal por cada px de alto. */
export const tangenteDe = (grados: number): number => Math.tan((grados * Math.PI) / 180)

const sinCambios = (): (() => void) => () => undefined
const deLaUrl = (nombre: string): string | null => new URLSearchParams(window.location.search).get(nombre)

export const useDiagonal = (): AnguloDeLaDiagonal =>
  useSyncExternalStore(sinCambios, () => diagonalDeLaBandera(deLaUrl('diagonal')), () => DIAGONAL_POR_DEFECTO)

export const useModoEnElTelefono = (): ModoEnElTelefono =>
  useSyncExternalStore(sinCambios, () => modoDeLaBandera(deLaUrl('servicios-movil')), () => MODO_POR_DEFECTO)
