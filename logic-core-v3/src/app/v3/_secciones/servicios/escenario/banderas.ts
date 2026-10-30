'use client'

import { useSyncExternalStore } from 'react'

import { MODOS_DEL_ARO, type ModoDelAro } from '../../../_lib/nanobots/simbolos'

/**
 * [B4 · C2-50 · L3] LAS BANDERAS DE LA SECCIÓN, para que Valentino elija (después se van y queda la elegida como constante):
 *
 *   `?diagonal=<grados>`              el ángulo de la franja del texto, en grados desde la vertical (numérica, de 0 a 45). [L3] Por
 *                                     defecto, 7 (ítem 50: «Diagonal en 7»).
 *   `?titulo-cursiva=1|2|3`           [L3] la cursiva del SEGUNDO renglón del título de cada servicio («Desarrollo / web»): 1,
 *                                     Instrument Serif (por defecto); 2, Fraunces; 3, Playfair Display. El primer renglón es siempre la
 *                                     display condensada (la que era `?titulo-servicio=1`).
 *   `?aro-color=mezcla|tercios|ola`   [L3] el color de la órbita de la entrada: `mezcla`, los tres acentos en manchas grandes con puntos
 *                                     sueltos de los otros; `tercios`, un arco de cada uno; `ola`, todo el aro de un color que cambia por
 *                                     partes, como una ola que lo recorre (por defecto).
 *
 * [L3] `?titulo-servicio=` y `?fuente-servicio=` se fueron: el título es la display arriba y la cursiva abajo, y el cuerpo es la letra
 * de los cuerpos del sitio.
 */

export const DIAGONAL_POR_DEFECTO = 7
export const DIAGONAL_MAXIMA = 45

/** El ángulo de la bandera, o el de por defecto si no es un número entre 0 y 45. */
export function diagonalDeLaBandera(valor: string | null): number {
  if (valor === null || valor.trim() === '') return DIAGONAL_POR_DEFECTO
  const n = Number(valor)
  return Number.isFinite(n) && n >= 0 && n <= DIAGONAL_MAXIMA ? n : DIAGONAL_POR_DEFECTO
}

export const CURSIVAS_DEL_TITULO = ['1', '2', '3'] as const
export type CursivaDelTitulo = (typeof CURSIVAS_DEL_TITULO)[number]
export const CURSIVA_POR_DEFECTO: CursivaDelTitulo = '1'

export const COLORES_DEL_ARO = MODOS_DEL_ARO
export type ColorDelAro = ModoDelAro
export const COLOR_DEL_ARO_POR_DEFECTO: ColorDelAro = 'ola'

export const cursivaDeLaBandera = (valor: string | null): CursivaDelTitulo => CURSIVAS_DEL_TITULO.find((c) => c === valor) ?? CURSIVA_POR_DEFECTO
export const colorDelAroDeLaBandera = (valor: string | null): ColorDelAro => COLORES_DEL_ARO.find((c) => c === valor) ?? COLOR_DEL_ARO_POR_DEFECTO

/** La tangente del ángulo: cuánto corre la diagonal en horizontal por cada px de alto. */
export const tangenteDe = (grados: number): number => Math.tan((grados * Math.PI) / 180)

const sinCambios = (): (() => void) => () => undefined
const deLaUrl = (nombre: string): string | null => new URLSearchParams(window.location.search).get(nombre)

export const useDiagonal = (): number => useSyncExternalStore(sinCambios, () => diagonalDeLaBandera(deLaUrl('diagonal')), () => DIAGONAL_POR_DEFECTO)

export const useCursivaDelTitulo = (): CursivaDelTitulo => useSyncExternalStore(sinCambios, () => cursivaDeLaBandera(deLaUrl('titulo-cursiva')), () => CURSIVA_POR_DEFECTO)

export const useColorDelAro = (): ColorDelAro => useSyncExternalStore(sinCambios, () => colorDelAroDeLaBandera(deLaUrl('aro-color')), () => COLOR_DEL_ARO_POR_DEFECTO)
