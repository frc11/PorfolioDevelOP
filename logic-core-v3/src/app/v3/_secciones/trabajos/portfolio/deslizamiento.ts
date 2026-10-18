/**
 * [B1.3] EL DESLIZAMIENTO EN LAS HISTORIAS — puro (plan §13, punto 8). En el teléfono deslizar hacia arriba es el scroll de la página
 * (ningún gesto propio que pelee con él), y la página avanza DE A UN PROYECTO: cuando el deslizamiento termina (con su inercia), la
 * página se asienta en el centro del proyecto en que quedó, y a lo sumo uno más allá del que estaba cuando empezó. Lo que sale del
 * selector (antes del primero, después de «la tuya») se deja: es la salida.
 */

import { ANTES_DEL_PIN, CANTIDAD_DE_PASOS, EN_LA_COLA, type IndiceDePaso } from './pasos'

/** Lo poco que se deja sin asentar (fracción del paso, desde su centro): un deslizamiento que casi no movió, no rebota. */
export const DESLIZAMIENTO = { toleranciaDelCentro: 0.04, quietoMs: 160 } as const

/**
 * Dónde se asienta un deslizamiento que empezó en `desde` y terminó en `crudo` (el paso del píxel de ahora): el paso al que va
 * (0…3), o `null` si sale del selector o si ya está en el centro (`desvio`: cuánto está corrido del centro de su paso, fracción).
 */
export function asentamiento(desde: IndiceDePaso, crudo: IndiceDePaso, desvio: number): number | null {
  const destino = Math.min(desde + 1, Math.max(desde - 1, crudo))
  if (destino <= ANTES_DEL_PIN || destino >= EN_LA_COLA || destino >= CANTIDAD_DE_PASOS) return null
  if (destino === crudo && Math.abs(desvio) <= DESLIZAMIENTO.toleranciaDelCentro) return null
  return destino
}
