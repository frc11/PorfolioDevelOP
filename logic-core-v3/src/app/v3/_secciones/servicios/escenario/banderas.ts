'use client'

import { useSyncExternalStore } from 'react'

/**
 * [B4 · C2-50] LAS BANDERAS DE LA SECCIÓN, para que Valentino elija (después se van y queda la elegida como constante):
 *
 *   `?diagonal=<grados>`        el ángulo de la franja del texto, en grados desde la vertical (numérica, de 0 a 45). Por defecto, 6,5
 *                               (ítem 20: «el 12, pero menos inclinado, 6 o 7 grados»).
 *   `?titulo-servicio=1|2|3`    la letra del título de cada servicio: 1, la display condensada en negrita del título del Panel, en
 *                               mayúsculas (por defecto); 2, una serif display grande (DM Serif Display); 3, una grotesca extra negrita
 *                               (Chivo a 900, la que ya carga el sitio).
 *   `?fuente-servicio=1|2|3|4`  la serif en cursiva del texto del medio: 1, Instrument Serif (por defecto); 2, Fraunces; 3, Cormorant
 *                               Garamond; 4, Playfair Display.
 *
 * [C2-50] `?servicios-movil=` se fue: abajo de 1024, con movimiento, la sección va siempre con gatillos (ítem «servicios de mobile»).
 */

export const DIAGONAL_POR_DEFECTO = 6.5
export const DIAGONAL_MAXIMA = 45

/** El ángulo de la bandera, o el de por defecto si no es un número entre 0 y 45. */
export function diagonalDeLaBandera(valor: string | null): number {
  if (valor === null || valor.trim() === '') return DIAGONAL_POR_DEFECTO
  const n = Number(valor)
  return Number.isFinite(n) && n >= 0 && n <= DIAGONAL_MAXIMA ? n : DIAGONAL_POR_DEFECTO
}

export const TITULOS_DEL_SERVICIO = ['1', '2', '3'] as const
export type TituloDelServicio = (typeof TITULOS_DEL_SERVICIO)[number]
export const TITULO_POR_DEFECTO: TituloDelServicio = '1'

export const FUENTES_DEL_SERVICIO = ['1', '2', '3', '4'] as const
export type FuenteDelServicio = (typeof FUENTES_DEL_SERVICIO)[number]
export const FUENTE_POR_DEFECTO: FuenteDelServicio = '1'

export const tituloDeLaBandera = (valor: string | null): TituloDelServicio => TITULOS_DEL_SERVICIO.find((t) => t === valor) ?? TITULO_POR_DEFECTO
export const fuenteDeLaBandera = (valor: string | null): FuenteDelServicio => FUENTES_DEL_SERVICIO.find((f) => f === valor) ?? FUENTE_POR_DEFECTO

/** La tangente del ángulo: cuánto corre la diagonal en horizontal por cada px de alto. */
export const tangenteDe = (grados: number): number => Math.tan((grados * Math.PI) / 180)

const sinCambios = (): (() => void) => () => undefined
const deLaUrl = (nombre: string): string | null => new URLSearchParams(window.location.search).get(nombre)

export const useDiagonal = (): number => useSyncExternalStore(sinCambios, () => diagonalDeLaBandera(deLaUrl('diagonal')), () => DIAGONAL_POR_DEFECTO)

export const useTituloDelServicio = (): TituloDelServicio =>
  useSyncExternalStore(sinCambios, () => tituloDeLaBandera(deLaUrl('titulo-servicio')), () => TITULO_POR_DEFECTO)

export const useFuenteDelServicio = (): FuenteDelServicio =>
  useSyncExternalStore(sinCambios, () => fuenteDeLaBandera(deLaUrl('fuente-servicio')), () => FUENTE_POR_DEFECTO)
