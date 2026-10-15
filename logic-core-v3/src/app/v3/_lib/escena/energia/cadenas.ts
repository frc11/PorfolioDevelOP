import type { Brasas } from './brasas'
import { cruzaUnaCaja } from './cajas'
import { coordenadasDe, type Dominio } from './dominio'
import { CELDA, celdaDe, indice } from './grilla'
import type { Red } from './reposo'

/**
 * [PULIDO 23] U2 · LA RED EN CADENAS, MENOS Y CON AIRE (`reposo.ts`: la máquina). Antes cada brasa se enlazaba de una vez con sus tres
 * vecinas más cercanas: una maraña de rayos cortos. Ahora la red CRECE mientras la página está quieta: en cada cuadro algunas brasas
 * (cada vez más: la cuenta crece con el cuadrado del tiempo, pocas al principio) buscan su vecina más cercana con lugar y se enlazan
 * con ella. Cada brasa, a lo sumo dos enlaces, así los enlaces forman CADENAS (polilíneas quebradas de hasta `largo` brasas, nunca un
 * círculo), y un enlace casi paralelo a otro cercano no nace (el aire entre rayos). Las brasas sin enlace siguen andando; sólo se
 * frenan las enlazadas (`quieta`, que lee el paso). Puro (Node), sin reservas por cuadro.
 */
export const CADENAS = {
  /** Cuántas brasas como mucho en una cadena, cuántos enlaces por brasa y cuántos intentos por brasa en toda la formación. */
  largo: 5,
  porBrasa: 2,
  intentosPorBrasa: 1.6,
  /** El aire: un enlace no nace si otro casi paralelo (el coseno del ángulo) tiene su medio a menos de `separacion` u. */
  separacion: 0.9,
  paralelo: 0.9,
} as const

/** Empieza una formación: sin enlaces, cada brasa su propia cadena, ninguna quieta. */
export function empezarLasCadenas(r: Red, n: number): void {
  r.n = 0
  r.grado.fill(0)
  r.quieta.fill(0)
  r.tamano.fill(1)
  for (let i = 0; i < n; i += 1) r.cadena[i] = i
  r.cursor = 0
  r.intentos = 0
}

/** ¿Hay un enlace casi paralelo a (i, j) con el medio cerca? */
function sinAire(r: Red, L: Float32Array, i: number, j: number): boolean {
  const dx = L[j * 3] - L[i * 3]
  const dy = L[j * 3 + 1] - L[i * 3 + 1]
  const dz = L[j * 3 + 2] - L[i * 3 + 2]
  const l = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
  const mx = (L[j * 3] + L[i * 3]) / 2
  const my = (L[j * 3 + 1] + L[i * 3 + 1]) / 2
  const mz = (L[j * 3 + 2] + L[i * 3 + 2]) / 2
  const S2 = CADENAS.separacion * CADENAS.separacion
  for (let k = 0; k < r.n; k += 1) {
    const a = r.a[k]
    const b = r.b[k]
    const ex = L[b * 3] - L[a * 3]
    const ey = L[b * 3 + 1] - L[a * 3 + 1]
    const ez = L[b * 3 + 2] - L[a * 3 + 2]
    const le = Math.sqrt(ex * ex + ey * ey + ez * ez) || 1
    if (Math.abs(dx * ex + dy * ey + dz * ez) / (l * le) < CADENAS.paralelo) continue
    const fx = (L[b * 3] + L[a * 3]) / 2 - mx
    const fy = (L[b * 3 + 1] + L[a * 3 + 1]) / 2 - my
    const fz = (L[b * 3 + 2] + L[a * 3 + 2]) / 2 - mz
    if (fx * fx + fy * fy + fz * fz < S2) return true
  }
  return false
}

/** Enlaza `i` con `j` (nace ahora, `ahoraS`) y junta sus cadenas. */
function enlazar(r: Red, i: number, j: number, ahoraS: number, azar: () => number): void {
  const k = r.n
  r.a[k] = i
  r.b[k] = j
  r.grado[i] += 1
  r.grado[j] += 1
  r.nace[k] = ahoraS
  r.semilla[k] = azar()
  r.alfa[k] = 0
  r.n = k + 1
  const ci = r.cadena[i]
  const cj = r.cadena[j]
  r.tamano[ci] += r.tamano[cj]
  for (let q = 0; q < r.cadena.length; q += 1) if (r.cadena[q] === cj) r.cadena[q] = ci
}

/**
 * Un cuadro de la formación: los intentos de este cuadro (hasta `ahoraS` de `formaS`), cada uno con la brasa que sigue; si tiene lugar,
 * se enlaza con su vecina más cercana con lugar (por la grilla del último paso), al alcance en el mundo y en el cuadro, de otra cadena
 * (las dos juntas, a lo sumo `largo`) y con aire.
 */
export function crecerLasCadenas(r: Red, b: Brasas, d: Dominio, ahoraS: number, formaS: number, alcance: number, enElCuadro: number, vidaMinima: number, azar: () => number): void {
  const t = Math.min(1, ahoraS / formaS)
  const hasta = Math.floor(b.n * CADENAS.intentosPorBrasa * t * t)
  const L = b.lugar
  const g = b.grilla
  const A2 = alcance * alcance
  const C2 = enElCuadro * enElCuadro
  // [PULIDO 27] Z2 · hasta el tope de esta formación (menos rayos, más grandes).
  for (; r.intentos < hasta && r.n < Math.min(r.maximo, r.tope); r.intentos += 1) {
    const i = r.cursor
    r.cursor = (r.cursor + 1) % b.n
    if (b.vida[i] < vidaMinima || r.grado[i] >= CADENAS.porBrasa) continue
    celdaDe(g, L, i * 3)
    const cx = CELDA[0]
    const cy = CELDA[1]
    const cz = CELDA[2]
    const ci = coordenadasDe(d, L, i * 3)
    const ui = ci.u
    const vi = ci.v
    let mejor = -1
    let dMejor = A2
    for (let ax = Math.max(0, cx - 1); ax <= Math.min(g.nx - 1, cx + 1); ax += 1) for (let ay = Math.max(0, cy - 1); ay <= Math.min(g.ny - 1, cy + 1); ay += 1) for (let az = Math.max(0, cz - 1); az <= Math.min(g.nz - 1, cz + 1); az += 1) {
      for (let j = b.cabeza[indice(g, ax, ay, az)]; j >= 0; j = b.siguiente[j]) {
        if (j === i || b.vida[j] < vidaMinima || r.grado[j] >= CADENAS.porBrasa || r.cadena[j] === r.cadena[i] || r.tamano[r.cadena[i]] + r.tamano[r.cadena[j]] > CADENAS.largo) continue
        const dx = L[j * 3] - L[i * 3]
        const dy = L[j * 3 + 1] - L[i * 3 + 1]
        const dz = L[j * 3 + 2] - L[i * 3 + 2]
        const dd = dx * dx + dy * dy + dz * dz
        if (dd >= dMejor) continue
        const cj = coordenadasDe(d, L, j * 3)
        const du = cj.u - ui
        const dv = cj.v - vi
        // [PULIDO 27] Z2 · ni delante de un texto, un botón o el logo (`cajas.ts`).
        if (du * du + dv * dv >= C2 || cruzaUnaCaja(r.cajas, ui, vi, cj.u, cj.v)) continue
        mejor = j
        dMejor = dd
      }
    }
    if (mejor >= 0 && !sinAire(r, L, i, mejor)) enlazar(r, i, mejor, ahoraS, azar)
  }
}
