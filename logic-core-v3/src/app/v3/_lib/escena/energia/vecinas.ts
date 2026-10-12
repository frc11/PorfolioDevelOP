import { BRASAS, type Brasas } from './brasas'
import { CELDA, celdaDe, indice } from './grilla'

/**
 * [PULIDO 17] O3 · LAS VECINAS DE UNA BRASA (`brasas.ts`: la física), por la grilla del último paso: cuántas tiene cerca (el grupo más
 * denso de la descarga), el brillo por la densidad (un grupo no se satura: «flashero pero con límite»), calentar una (un arco la
 * tocó) y cuántos enlaces hay. Puro (Node).
 */
/** Cuántas brasas hay a menos de `radio` (≤ el alcance de la grilla) de la brasa `i`, por la grilla del último paso. */
export function vecinasDe(b: Brasas, i: number, radio: number): number {
  const L = b.lugar
  const g = b.grilla
  celdaDe(g, L, i * 3)
  const cx = CELDA[0]
  const cy = CELDA[1]
  const cz = CELDA[2]
  let n = 0
  const r2 = radio * radio
  for (let ax = Math.max(0, cx - 1); ax <= Math.min(g.nx - 1, cx + 1); ax += 1) for (let ay = Math.max(0, cy - 1); ay <= Math.min(g.ny - 1, cy + 1); ay += 1) for (let az = Math.max(0, cz - 1); az <= Math.min(g.nz - 1, cz + 1); az += 1) {
    for (let j = b.cabeza[indice(g, ax, ay, az)]; j >= 0; j = b.siguiente[j]) {
      // [PULIDO 18] Por el cuadrado (sin `Math.hypot`, que asigna en cada llamada).
      const dx = L[j * 3] - L[i * 3]
      const dy = L[j * 3 + 1] - L[i * 3 + 1]
      const dz = L[j * 3 + 2] - L[i * 3 + 2]
      if (j !== i && dx * dx + dy * dy + dz * dz < r2) n += 1
    }
  }
  return n
}

/**
 * El brillo por la densidad: una cuarta parte de las brasas mira a sus vecinas en cada cuadro y persigue el suyo con inercia
 * ([PULIDO 19] Q1.c · `suavizaS`: antes saltaba de golpe); y el brillo que se dibuja, de todas: la densidad por la vida.
 */
export function brilloPorDensidad(b: Brasas, dt: number): void {
  const D = BRASAS.densidad
  const sigue = 1 - Math.exp((-4 * Math.max(0, dt)) / D.suavizaS)
  for (let i = b.turno * 2 + (b.paresMirados & 1); i < b.n; i += 4) b.densidad[i] += (1 / (1 + D.baja * vecinasDe(b, i, D.radio)) - b.densidad[i]) * sigue
  for (let i = 0; i < b.n; i += 1) b.brillo[i] = b.densidad[i] * b.vida[i]
}

/** Calienta la brasa `i` (un arco la tocó). */
export function calentarBrasa(b: Brasas, i: number, cuanto: number): void {
  b.energia[i] = Math.min(1, b.energia[i] + cuanto)
}

/** Cuántos enlaces hay (pares). */
export function cuantosEnlaces(b: Brasas): number {
  let k = 0
  for (let i = 0; i < b.n; i += 1) if (b.pareja[i] > i) k += 1
  return k
}
