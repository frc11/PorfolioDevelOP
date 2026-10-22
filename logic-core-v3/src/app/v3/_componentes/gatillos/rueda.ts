/**
 * [B4] LA RUEDA DE LOS GATILLOS — pura, COMÚN al Portfolio y a Servicios (salió de `trabajos/portfolio/rueda.ts`, que la
 * re-exporta sin cambios: el Portfolio la sigue leyendo de ahí).
 *
 * Un gesto es UN paso: una muesca de la rueda o un deslizamiento del trackpad (con su inercia). El gesto termina cuando la rueda se
 * queda quieta `quietoMs`; mientras un salto vuela, la rueda no hace nada (sigue siendo el mismo gesto). [B1.2c] plan §13, punto 5.
 */

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

/** El gesto que ya dio su paso (o que es de la página): lo que queda de él se traga. */
export const gestoDisparado = (ahora: number): GestoDeLaRueda => ({ acumulado: 0, ultimo: ahora, disparado: true })

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
