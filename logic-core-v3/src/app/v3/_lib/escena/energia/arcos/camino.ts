import { largo3 } from '../largo'

/**
 * [PULIDO 17] O3 · EL CAMINO DE UN ARCO (`docs/rediseno/PLASMA.md`): el de PULIDO 15, que gustó. El desplazamiento de punto medio:
 * cada nivel corre el medio de cada tramo hacia un costado (sobre todo de costado en la pantalla; un poco en profundidad), cada vez
 * menos (la aspereza); con una o dos ramas cortas. Lo que cambia: un camino más suave (menos desvío y menos aspereza: un canal, no un
 * zigzag dibujado) y, en cada re-golpe, el canal TIEMBLA un poco (no se rehace entero: es el mismo canal que se vuelve a encender).
 * Los desvíos se guardan respecto de la recta entre los extremos de ahora, así el arco sigue a lo que une. Puro (Node).
 */
export const CAMINO = {
  /** Los niveles del punto medio (2^niveles tramos), el desvío del primero (parte del largo) y cuánto se achica por nivel. */
  niveles: 5,
  desvio: 0.12,
  aspereza: 0.45,
  /** Cuánto de profundidad tiene el desvío (respecto del de costado). */
  profundidad: 0.35,
  /** Las ramas: cuántas como mucho, sus niveles, su largo (parte del arco) y su ángulo (rad). */
  ramas: { maximo: 2, niveles: 3, largo: [0.2, 0.4], angulo: [0.35, 0.85] },
} as const

export const TRAMOS_DEL_CAMINO = 2 ** CAMINO.niveles
export const TRAMOS_DE_RAMA = 2 ** CAMINO.ramas.niveles

/** La forma de un arco: los desvíos de su camino y de sus ramas (todo en arreglos fijos). */
export interface Forma {
  readonly desvios: Float32Array
  ramas: number
  readonly ramaDesde: Int32Array
  readonly ramaDir: Float32Array
  readonly ramaLargo: Float32Array
  readonly ramaDesvios: Float32Array
}

export function crearForma(): Forma {
  const R = CAMINO.ramas.maximo
  return {
    desvios: new Float32Array((TRAMOS_DEL_CAMINO + 1) * 3),
    ramas: 0,
    ramaDesde: new Int32Array(R),
    ramaDir: new Float32Array(R * 3),
    ramaLargo: new Float32Array(R),
    ramaDesvios: new Float32Array(R * (TRAMOS_DE_RAMA + 1) * 3),
  }
}

const entre = (azar: () => number, t: readonly number[]): number => t[0] + azar() * (t[1] - t[0])

const P1 = new Float32Array(3)
const P2 = new Float32Array(3)
const S1 = new Float32Array(3)
const S2 = new Float32Array(3)
const EJE = new Float32Array(3)
const VISTA = new Float32Array(3)

function normalizar(v: Float32Array): void {
  const l = largo3(v[0], v[1], v[2]) || 1
  v[0] /= l
  v[1] /= l
  v[2] /= l
}
/** `destino` = u × w. */
function cruz(u: Float32Array, w: Float32Array, destino: Float32Array): void {
  const x = u[1] * w[2] - u[2] * w[1]
  const y = u[2] * w[0] - u[0] * w[2]
  const z = u[0] * w[1] - u[1] * w[0]
  destino[0] = x
  destino[1] = y
  destino[2] = z
}

/** Las dos direcciones de costado de un eje visto desde `VISTA`: `P1` de costado en la pantalla, `P2` en profundidad. */
function costados(eje: Float32Array): void {
  cruz(eje, VISTA, P1)
  normalizar(P1)
  cruz(eje, P1, P2)
  normalizar(P2)
}

/** El punto medio en `salida` desde `desde` (`tramos + 1` puntos, los extremos en cero). */
function puntoMedio(salida: Float32Array, desde: number, tramos: number, largo: number, azar: () => number): void {
  for (let k = 0; k <= tramos * 3; k += 1) salida[desde + k] = 0
  let amplitud = largo * CAMINO.desvio
  for (let paso = tramos; paso > 1; paso /= 2) {
    const medio = paso / 2
    for (let k = medio; k < tramos; k += paso) {
      const u = (azar() * 2 - 1) * amplitud
      const w = (azar() * 2 - 1) * amplitud * CAMINO.profundidad
      for (let e = 0; e < 3; e += 1) salida[desde + k * 3 + e] = (salida[desde + (k - medio) * 3 + e] + salida[desde + (k + medio) * 3 + e]) / 2 + P1[e] * u + P2[e] * w
    }
    amplitud *= CAMINO.aspereza
  }
}

/**
 * Traza la forma entre `a` y `b` (relativos al centro), vista desde `camara`: el camino y sus ramas (`ramas`: cuántas como mucho).
 */
export function trazar(f: Forma, a: ArrayLike<number>, b: ArrayLike<number>, camara: ArrayLike<number>, ramas: number, azar: () => number): void {
  for (let e = 0; e < 3; e += 1) {
    EJE[e] = b[e] - a[e]
    VISTA[e] = (a[e] + b[e]) / 2 - camara[e]
  }
  const largo = largo3(EJE[0], EJE[1], EJE[2]) || 1e-3
  costados(EJE)
  puntoMedio(f.desvios, 0, TRAMOS_DEL_CAMINO, largo, azar)
  f.ramas = Math.min(ramas, CAMINO.ramas.maximo)
  for (let r = 0; r < f.ramas; r += 1) {
    const angulo = entre(azar, CAMINO.ramas.angulo) * (azar() < 0.5 ? -1 : 1)
    const cs = Math.cos(angulo)
    const sn = Math.sin(angulo)
    for (let e = 0; e < 3; e += 1) f.ramaDir[r * 3 + e] = (EJE[e] / largo) * cs + P1[e] * sn + P2[e] * (azar() - 0.5) * 0.4
    const dir = f.ramaDir.subarray(r * 3, r * 3 + 3)
    normalizar(dir)
    f.ramaDesde[r] = Math.round(TRAMOS_DEL_CAMINO * entre(azar, [0.25, 0.7]))
    f.ramaLargo[r] = largo * entre(azar, CAMINO.ramas.largo)
    S1.set(P1)
    S2.set(P2)
    costados(dir)
    puntoMedio(f.ramaDesvios, r * (TRAMOS_DE_RAMA + 1) * 3, TRAMOS_DE_RAMA, f.ramaLargo[r], azar)
    P1.set(S1)
    P2.set(S2)
  }
}

/** El re-golpe: el mismo canal con un temblor chico (parte del largo de cada tramo), y las ramas igual. */
export function temblar(f: Forma, largo: number, cuanto: number, azar: () => number): void {
  const paso = (largo / TRAMOS_DEL_CAMINO) * cuanto
  for (let k = 1; k < TRAMOS_DEL_CAMINO; k += 1) for (let e = 0; e < 3; e += 1) f.desvios[k * 3 + e] += (azar() * 2 - 1) * paso
  for (let r = 0; r < f.ramas; r += 1) {
    const o = r * (TRAMOS_DE_RAMA + 1) * 3
    const p = (f.ramaLargo[r] / TRAMOS_DE_RAMA) * cuanto
    for (let k = 1; k <= TRAMOS_DE_RAMA; k += 1) for (let e = 0; e < 3; e += 1) f.ramaDesvios[o + k * 3 + e] += (azar() * 2 - 1) * p
  }
}

/** El punto `k` del camino entre `a` y `b` de ahora, en `destino`. */
export function puntoDelCamino(f: Forma, a: ArrayLike<number>, b: ArrayLike<number>, k: number, destino: Float32Array): void {
  for (let e = 0; e < 3; e += 1) destino[e] = a[e] + ((b[e] - a[e]) * k) / TRAMOS_DEL_CAMINO + f.desvios[k * 3 + e]
}
