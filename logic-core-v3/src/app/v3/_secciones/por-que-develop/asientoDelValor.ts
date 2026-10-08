import { ASIENTO } from '../../_lib/titulos3d/repeticiones'

/**
 * [PULIDO 4] C1 · 4 · EL ASIENTO DE UN VALOR, SIN SALTOS — cada valor llega con su tramo del scroll y, con el scroll quieto a
 * mitad (`ASIENTO`), se completa o se deshace solo (RONDA 2 F2). El defecto: al volver el scroll, el valor saltaba de lo que
 * el asiento había hecho al lugar del scroll en un cuadro (medido: de 0 a 0,57 de opacidad en un paso de 12 px; «se
 * teletransportan al acomodarse»). Ahora lo mostrado SIGUE al scroll sin saltar:
 *   · si va adelante del scroll en la dirección en que se mueve, espera a que el scroll lo alcance;
 *   · si quedó atrás, lo alcanza más rápido que el scroll (en `ALCANCE` de recorrido se come casi todo el desfasaje) y en la
 *     punta del tramo ya es el scroll: nunca se mueve en contra del scroll ni más de un múltiplo del paso.
 * Puro: `s55` lo recorre en pasos chicos, ida y vuelta, con frenadas.
 */
export const ALCANCE = 0.2

export interface SeguidorDelValor {
  /** Lo que se muestra (0 a 1 del tramo). */
  mostrado: number
  /** Lo que dice el scroll. */
  scroll: number
}

export const nuevoSeguidor = (p: number): SeguidorDelValor => ({ mostrado: p, scroll: p })

/** El scroll se movió a `p`: lo mostrado lo sigue sin saltar. */
export function seguirAlScroll(s: SeguidorDelValor, p: number): void {
  const d = p - s.scroll
  if (d === 0) return
  const desfasaje = s.mostrado - s.scroll
  if (desfasaje * d > 0) {
    // Va adelante en la dirección del scroll: se queda donde está hasta que el scroll lo pase.
    s.mostrado = d > 0 ? Math.max(s.mostrado, p) : Math.min(s.mostrado, p)
  } else if (desfasaje !== 0) {
    // Quedó atrás: lo alcanza (el desfasaje se achica con el recorrido y llega a cero en la punta del tramo).
    const antes = d > 0 ? 1 - s.scroll : s.scroll
    const ahora = d > 0 ? 1 - p : p
    const queda = Math.min(Math.exp(-Math.abs(d) / ALCANCE), antes > 1e-9 ? Math.max(0, ahora) / antes : 0)
    s.mostrado = p + desfasaje * queda
  } else {
    s.mostrado = p
  }
  s.scroll = p
}

/** Adónde va el asiento: con el scroll a mitad del tramo, a la punta más cercana; en una punta, a esa. */
export const destinoDelAsiento = (s: SeguidorDelValor): number => (s.scroll >= 0.5 ? 1 : 0)

/**
 * El scroll lleva quieto lo suficiente (`ASIENTO.quietoMs`): lo que quedó a mitad va a la punta más cercana (con el scroll a
 * mitad del tramo, la del scroll), a la velocidad del asiento (`ASIENTO.s` de punta a punta), lineal: la misma ley que el
 * `animate` del valor (`valorEnVolumen.tsx`). Devuelve si todavía se mueve.
 */
export function asentar(s: SeguidorDelValor, dt: number): boolean {
  const destino = destinoDelAsiento(s)
  const paso = Math.max(0, dt) / ASIENTO.s
  if (Math.abs(destino - s.mostrado) <= paso) {
    s.mostrado = destino
    return false
  }
  s.mostrado += Math.sign(destino - s.mostrado) * paso
  return true
}
