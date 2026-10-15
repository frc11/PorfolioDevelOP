import { BRASAS, GRILLA, type Brasas, type Grilla } from './brasas'

/**
 * [PULIDO 19] Q1.b · LA GRILLA DE LAS BRASAS, RELATIVA A SU DOMINIO (salió de `brasas.ts`): celdas del alcance de las fuerzas sobre la caja
 * que las contiene en este paso (la del dominio de la vista, o la de la cáscara sin dominio: las pruebas). Antes era fija alrededor del
 * origen y una caja de 50 u de lado la desbordaba (todo caía en las celdas del borde). Si la caja pide más celdas que `celdas` por eje,
 * las celdas crecen (siempre de al menos el alcance: las 27 vecinas alcanzan). Y las fuerzas entre ellas por la grilla (cada par una
 * vez) y los enlaces que se forman. Puro (Node). Sin reservas por cuadro.
 */
const F = BRASAS.fuerzas

/** La grilla sobre la caja (mínimos en 0–2, máximos en 3–5) y las brasas en sus celdas. */
export function ajustarLaGrilla(b: Brasas, caja: ArrayLike<number>): void {
  const g = b.grilla
  const mayor = Math.max(caja[3] - caja[0], caja[4] - caja[1], caja[5] - caja[2], 1e-3)
  g.lado = Math.max(F.alcance, mayor / (GRILLA.celdas - 1))
  g.ox = caja[0]
  g.oy = caja[1]
  g.oz = caja[2]
  g.nx = Math.min(GRILLA.celdas, Math.floor((caja[3] - caja[0]) / g.lado) + 1)
  g.ny = Math.min(GRILLA.celdas, Math.floor((caja[4] - caja[1]) / g.lado) + 1)
  g.nz = Math.min(GRILLA.celdas, Math.floor((caja[5] - caja[2]) / g.lado) + 1)
  b.cabeza.fill(-1, 0, g.nx * g.ny * g.nz)
  for (let i = 0; i < b.n; i += 1) {
    // [PULIDO 27] Z1 · las de la reserva (`poblacion.ts`) no están en la grilla: ni fuerzas ni vecinas.
    if (b.oculta[i] === 1) {
      b.siguiente[i] = -1
      continue
    }
    const k = celdaDe(g, b.lugar, i * 3)
    b.siguiente[i] = b.cabeza[k]
    b.cabeza[k] = i
  }
}

/** [PULIDO 19] La celda (cx, cy, cz) de la última `celdaDe`. */
export const CELDA = new Int32Array(3)

/** La celda de la brasa en `L[o..o+2]`: (cx, cy, cz) en `CELDA` y su índice (sin números por parámetro: en el bucle de cada brasa se encajan). */
export function celdaDe(g: Grilla, L: Float32Array, o: number): number {
  const cx = Math.min(g.nx - 1, Math.max(0, Math.floor((L[o] - g.ox) / g.lado)))
  const cy = Math.min(g.ny - 1, Math.max(0, Math.floor((L[o + 1] - g.oy) / g.lado)))
  const cz = Math.min(g.nz - 1, Math.max(0, Math.floor((L[o + 2] - g.oz) / g.lado)))
  CELDA[0] = cx
  CELDA[1] = cy
  CELDA[2] = cz
  return (cx * g.ny + cy) * g.nz + cz
}

export const indice = (g: Grilla, cx: number, cy: number, cz: number): number => (cx * g.ny + cy) * g.nz + cz

/** Las fuerzas entre ellas por la grilla (cada par una vez) y los enlaces que se forman. La grilla, ya ajustada a la caja de este paso. */
export function entreEllas(b: Brasas, azar: () => number): void {
  const { lugar, fuerza, signo, pareja } = b
  const E = BRASAS.enlace
  const g = b.grilla
  let mirados = 0
  for (let i = 0; i < b.n; i += 1) {
    if (b.oculta[i] === 1) continue
    celdaDe(g, lugar, i * 3)
    const cx = CELDA[0]
    const cy = CELDA[1]
    const cz = CELDA[2]
    for (let ax = Math.max(0, cx - 1); ax <= Math.min(g.nx - 1, cx + 1); ax += 1) for (let ay = Math.max(0, cy - 1); ay <= Math.min(g.ny - 1, cy + 1); ay += 1) for (let az = Math.max(0, cz - 1); az <= Math.min(g.nz - 1, cz + 1); az += 1) {
      for (let j = b.cabeza[indice(g, ax, ay, az)]; j >= 0; j = b.siguiente[j]) {
        if (j <= i) continue
        mirados += 1
        const dx = lugar[j * 3] - lugar[i * 3]
        const dy = lugar[j * 3 + 1] - lugar[i * 3 + 1]
        const dz = lugar[j * 3 + 2] - lugar[i * 3 + 2]
        // [PULIDO 18] Sin `Math.hypot` (asigna en cada llamada): el cuadrado primero; la raíz, sólo de las que están al alcance.
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 >= F.alcance * F.alcance || d2 < 1e-10) continue
        const d = Math.sqrt(d2)
        const opuestas = signo[i] !== signo[j]
        const u = 1 - d / F.alcance
        let f = opuestas ? F.atrae * u : -F.repele * u
        if (d < F.cerca) f -= F.choque * (1 - d / F.cerca) ** 2
        const fx = (f * dx) / d
        const fy = (f * dy) / d
        const fz = (f * dz) / d
        fuerza[i * 3] += fx
        fuerza[i * 3 + 1] += fy
        fuerza[i * 3 + 2] += fz
        fuerza[j * 3] -= fx
        fuerza[j * 3 + 1] -= fy
        fuerza[j * 3 + 2] -= fz
        if (opuestas && d < E.forma && pareja[i] < 0 && pareja[j] < 0 && b.enfriado[i] <= 0 && b.enfriado[j] <= 0) {
          pareja[i] = j
          pareja[j] = i
          b.vidaDelEnlace[i] = E.vida[0] + azar() * (E.vida[1] - E.vida[0])
        }
      }
    }
  }
  b.paresMirados = mirados
}
