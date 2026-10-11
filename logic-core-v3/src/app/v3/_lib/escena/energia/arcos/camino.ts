/**
 * [PULIDO 16] N2 · EL CAMINO DE UN ARCO: UN LÍDER ESCALONADO (`docs/rediseno/PLASMA.md`). Como un rayo de verdad, el arco avanza
 * de a pasos desde su origen y cada paso elige su dirección mezclando tres cosas: hacia dónde está el blanco (pesa cada vez más al
 * acercarse), el CAMPO ELÉCTRICO en ese punto (pesa al principio: el arco sigue las líneas de campo) y un poco de azar (el
 * quiebre). El último punto es el blanco. Después, cada tramo se parte en dos con el medio corrido un poco (el detalle fino). Las
 * ramas salen de algunos pasos y BUSCAN UNA CARGA CERCANA (si no hay, una rama corta que muere a lo largo del campo).
 * Escribe en búferes fijos (sin reservas): puro (la prueba lo corre en Node).
 */
export const CAMINO = {
  /** Los pasos del líder y en cuántos se parte cada uno (el detalle): 24 × 2 = 48 tramos. */
  pasos: 24,
  detalle: 2,
  /** Cuánto pesa el campo (al principio), el azar y el blanco (de `desde` a `hasta` a lo largo del camino). */
  campo: 0.62,
  azar: 0.34,
  blanco: [0.25, 1],
  /** El largo de cada paso: el que falta repartido en los pasos que quedan, por un azar en el tramo. */
  paso: [0.75, 1.25],
  /** El desvío del medio de cada tramo (parte del tramo). */
  quiebre: 0.14,
  /** Las ramas: cuántas como mucho, sus pasos, dónde pueden salir (parte del camino), hasta dónde buscan una carga (u) y el largo de la que muere (u). */
  ramas: { maximo: 3, pasos: 8, desde: [0.15, 0.8], busca: 1.9, muere: [0.35, 0.8] },
} as const

/** Los puntos del camino (con el detalle) y de cada rama. */
export const PUNTOS_DEL_CAMINO = CAMINO.pasos * CAMINO.detalle + 1
export const PUNTOS_DE_RAMA = CAMINO.ramas.pasos + 1

/** El campo en (x, y, z), en `destino` (lo arma `fisica.ts`: `campoEn`). */
export type Campo = (x: number, y: number, z: number, destino: Float32Array) => void

const E = new Float32Array(3)
const LIDER = new Float32Array((CAMINO.pasos + 1) * 3)

/**
 * El líder de `a` a `b` (relativos al centro) en `salida` desde `desde` (3 por punto, `pasos + 1` puntos). `limpio` (el del logo)
 * se quiebra la mitad. Devuelve la alineación media de sus pasos con el campo (|cos|, 0 a 1: para la prueba).
 */
export function lider(salida: Float32Array, desde: number, pasos: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, campo: Campo, azar: () => number, limpio: boolean): number {
  salida[desde] = ax
  salida[desde + 1] = ay
  salida[desde + 2] = az
  let px = ax
  let py = ay
  let pz = az
  let alineacion = 0
  for (let k = 1; k < pasos; k += 1) {
    let tx = bx - px
    let ty = by - py
    let tz = bz - pz
    const falta = Math.hypot(tx, ty, tz) || 1e-4
    tx /= falta
    ty /= falta
    tz /= falta
    campo(px, py, pz, E)
    const en = Math.hypot(E[0], E[1], E[2])
    const hay = en > 1e-6
    let ex = hay ? E[0] / en : 0
    let ey = hay ? E[1] / en : 0
    let ez = hay ? E[2] / en : 0
    // Sigue la línea de campo en el sentido que va hacia el blanco.
    if (ex * tx + ey * ty + ez * tz < 0) {
      ex = -ex
      ey = -ey
      ez = -ez
    }
    const s = k / pasos
    const wB = CAMINO.blanco[0] + (CAMINO.blanco[1] - CAMINO.blanco[0]) * s * s
    const wE = CAMINO.campo * (1 - s)
    const wA = CAMINO.azar * (1 - 0.5 * s) * (limpio ? 0.5 : 1)
    let dx = wB * tx + wE * ex + wA * (azar() * 2 - 1)
    let dy = wB * ty + wE * ey + wA * (azar() * 2 - 1)
    let dz = wB * tz + wE * ez + wA * (azar() * 2 - 1)
    const l = Math.hypot(dx, dy, dz) || 1
    dx /= l
    dy /= l
    dz /= l
    if (hay) alineacion += Math.abs(dx * ex + dy * ey + dz * ez)
    const largo = (falta / (pasos - k + 1)) * (CAMINO.paso[0] + azar() * (CAMINO.paso[1] - CAMINO.paso[0]))
    px += dx * largo
    py += dy * largo
    pz += dz * largo
    salida[desde + k * 3] = px
    salida[desde + k * 3 + 1] = py
    salida[desde + k * 3 + 2] = pz
  }
  salida[desde + pasos * 3] = bx
  salida[desde + pasos * 3 + 1] = by
  salida[desde + pasos * 3 + 2] = bz
  return alineacion / Math.max(1, pasos - 1)
}

/** El detalle: entre cada dos puntos del líder (en `LIDER`), el medio corrido de costado. Escribe `pasos · 2 + 1` puntos. */
function detallar(salida: Float32Array, pasos: number, azar: () => number, limpio: boolean): void {
  const q = CAMINO.quiebre * (limpio ? 0.5 : 1)
  for (let k = 0; k < pasos; k += 1) {
    const x0 = LIDER[k * 3]
    const y0 = LIDER[k * 3 + 1]
    const z0 = LIDER[k * 3 + 2]
    const x1 = LIDER[k * 3 + 3]
    const y1 = LIDER[k * 3 + 4]
    const z1 = LIDER[k * 3 + 5]
    const l = Math.hypot(x1 - x0, y1 - y0, z1 - z0)
    salida[k * 6] = x0
    salida[k * 6 + 1] = y0
    salida[k * 6 + 2] = z0
    salida[k * 6 + 3] = (x0 + x1) / 2 + (azar() * 2 - 1) * q * l
    salida[k * 6 + 4] = (y0 + y1) / 2 + (azar() * 2 - 1) * q * l
    salida[k * 6 + 5] = (z0 + z1) / 2 + (azar() * 2 - 1) * q * l
  }
  salida[pasos * 6] = LIDER[pasos * 3]
  salida[pasos * 6 + 1] = LIDER[pasos * 3 + 1]
  salida[pasos * 6 + 2] = LIDER[pasos * 3 + 2]
}

/** El camino entero de `a` a `b` en `salida` (`PUNTOS_DEL_CAMINO` puntos). Devuelve la alineación con el campo. */
export function camino(salida: Float32Array, ax: number, ay: number, az: number, bx: number, by: number, bz: number, campo: Campo, azar: () => number, limpio: boolean): number {
  const alineacion = lider(LIDER, 0, CAMINO.pasos, ax, ay, az, bx, by, bz, campo, azar, limpio)
  detallar(salida, CAMINO.pasos, azar, limpio)
  return alineacion
}

/** El re-golpe: el mismo canal con un temblor chico (un rayo vuelve a golpear por el canal que ya abrió). */
export function temblarElCanal(canal: Float32Array, azar: () => number, cuanto: number): void {
  const ultimo = PUNTOS_DEL_CAMINO - 1
  for (let k = 1; k < ultimo; k += 1) {
    const dx = canal[(k + 1) * 3] - canal[(k - 1) * 3]
    const dy = canal[(k + 1) * 3 + 1] - canal[(k - 1) * 3 + 1]
    const dz = canal[(k + 1) * 3 + 2] - canal[(k - 1) * 3 + 2]
    const l = Math.hypot(dx, dy, dz)
    canal[k * 3] += (azar() * 2 - 1) * cuanto * l
    canal[k * 3 + 1] += (azar() * 2 - 1) * cuanto * l
    canal[k * 3 + 2] += (azar() * 2 - 1) * cuanto * l
  }
}

/**
 * Una rama desde el punto `k` del canal: busca una carga cercana (`buscar` devuelve su lugar en `destino` o false) y va hacia ella
 * por un líder corto; si no hay, una rama corta a lo largo del campo, que muere. Escribe `PUNTOS_DE_RAMA` puntos en `salida` desde
 * `desde`. Devuelve si encontró una carga.
 */
export function rama(salida: Float32Array, desde: number, x: number, y: number, z: number, campo: Campo, buscar: (x: number, y: number, z: number, destino: Float32Array) => boolean, azar: () => number): boolean {
  const R = CAMINO.ramas
  const encontro = buscar(x, y, z, E)
  let bx = E[0]
  let by = E[1]
  let bz = E[2]
  if (!encontro) {
    campo(x, y, z, E)
    const en = Math.hypot(E[0], E[1], E[2]) || 1
    const largo = R.muere[0] + azar() * (R.muere[1] - R.muere[0])
    const signo = azar() < 0.5 ? -1 : 1
    bx = x + (signo * E[0] / en + (azar() - 0.5) * 0.8) * largo
    by = y + (signo * E[1] / en + (azar() - 0.5) * 0.8) * largo
    bz = z + (signo * E[2] / en + (azar() - 0.5) * 0.8) * largo
  }
  lider(salida, desde, R.pasos, x, y, z, bx, by, bz, campo, azar, false)
  return encontro
}
