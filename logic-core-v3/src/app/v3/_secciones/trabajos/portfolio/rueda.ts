/**
 * [B1.2c] LA RUEDA EN EL PORTFOLIO — pura (plan §13, punto 5).
 *
 * El proyecto activo manda. Con el panel adentro, la rueda no corre la página de a píxeles: avanza o retrocede DE A UN PROYECTO desde
 * el activo, en orden. Después del último («la tuya») sigue a Demos; antes del primero, sale hacia arriba. Una muesca de la rueda o un
 * deslizamiento del trackpad (con su inercia) es UN gesto, y un gesto es UN paso: el gesto termina cuando la rueda se queda quieta
 * `quietoMs`. Mientras el salto vuela, la rueda no hace nada (sigue siendo el mismo gesto).
 *
 * Y mientras la rueda tiene el control el hover queda inerte hasta que el puntero se mueva de verdad (`seMovioDeVerdad`, 4 px): los
 * lomos que se reacomodan debajo de un mouse quieto no activan nada. Así, con el puntero sobre un lomo, la rueda sigue por los
 * proyectos en vez de pelear con él (B1.2b: con el mouse arriba de un lomo y la rueda a la vez, la página seguía de largo hasta Demos).
 */

import { CANTIDAD_DE_PASOS } from './pasos'

/** Lo que hace falta para que un gesto sea un paso (px), y lo quieta que tiene que estar la rueda para que el gesto termine (ms). */
export const RUEDA = { umbralPx: 30, quietoMs: 160 } as const

/** Un renglón y una página, en px (los `deltaMode` 1 y 2 de un `WheelEvent`). */
const PX_POR_MODO = [1, 16, 800] as const

export const pxDeLaRueda = (deltaY: number, deltaMode: number): number => deltaY * (PX_POR_MODO[deltaMode] ?? 1)

export interface GestoDeLaRueda {
  readonly acumulado: number
  /** El último evento del gesto (ms). */
  readonly ultimo: number
  /** Si este gesto ya dio su paso. */
  readonly disparado: boolean
}

export const GESTO_QUIETO: GestoDeLaRueda = { acumulado: 0, ultimo: Number.NEGATIVE_INFINITY, disparado: false }

/**
 * Un evento de la rueda: el gesto que sigue y, si este evento lo completa, hacia dónde (1 abajo, −1 arriba). `ocupado`: un salto en
 * vuelo (el evento cuenta para el gesto, que queda como ya disparado).
 */
export function gestoDeLaRueda(g: GestoDeLaRueda, dy: number, ahora: number, ocupado = false): { readonly gesto: GestoDeLaRueda; readonly sentido: 1 | -1 | null } {
  const nuevo = ahora - g.ultimo > RUEDA.quietoMs
  const base = nuevo ? GESTO_QUIETO : g
  const acumulado = base.acumulado + dy
  if (ocupado) return { gesto: { acumulado: 0, ultimo: ahora, disparado: true }, sentido: null }
  if (base.disparado || Math.abs(acumulado) < RUEDA.umbralPx) return { gesto: { acumulado, ultimo: ahora, disparado: base.disparado }, sentido: null }
  return { gesto: { acumulado: 0, ultimo: ahora, disparado: true }, sentido: acumulado > 0 ? 1 : -1 }
}

export type DestinoDeLaRueda = { readonly tipo: 'paso'; readonly indice: number } | { readonly tipo: 'demos' } | { readonly tipo: 'arriba' }

/** Adónde lleva un paso de la rueda desde la tira activa (0…3: los tres proyectos y «la tuya»). */
export function destinoDeLaRueda(activa: number, sentido: 1 | -1): DestinoDeLaRueda {
  const siguiente = activa + sentido
  if (siguiente >= CANTIDAD_DE_PASOS) return { tipo: 'demos' }
  if (siguiente < 0) return { tipo: 'arriba' }
  return { tipo: 'paso', indice: siguiente }
}

/**
 * Lo que la rueda deja hacer (para los tests y el arnés, el modelo entero en una función): desde la tira activa, con el puntero
 * sobre `hover` (o `null`) y una lista de muescas, dónde termina. El hover activa su lomo ANTES de la rueda (el proyecto activo
 * manda); después la rueda tiene el control y el hover queda inerte con el puntero quieto.
 */
export function recorridoDeLaRueda(activa: number, hover: number | null, muescas: readonly (1 | -1)[]): DestinoDeLaRueda {
  let tira = hover ?? activa
  let destino: DestinoDeLaRueda = { tipo: 'paso', indice: tira }
  for (const m of muescas) {
    if (destino.tipo !== 'paso') break
    destino = destinoDeLaRueda(tira, m)
    if (destino.tipo === 'paso') tira = destino.indice
  }
  return destino
}
