import { PLASMA, distanciaAlRayo, type Cargas, type RayoDelPuntero } from './cargas'

/**
 * [PULIDO 15] M2 · LOS ARCOS DE PLASMA (`cargas.ts`: el todo). Un arco es corto (~0,3 s) y quebrado: el camino entre sus dos
 * extremos por desplazamiento de punto medio (cada nivel corre el medio de cada tramo hacia un costado, la mitad de lo que corrió
 * el nivel anterior), con una o dos ramas cortas; mientras vive TIEMBLA (cada `tiembla` s el camino se rehace, con otro brillo) y
 * sus extremos siguen a las cargas. Tres clases: entre los dos de un enlace (`par`), del logo hacia una carga cercana (`logo`) y
 * de una carga al puntero (`cursor`). Como mucho `maximo` a la vez. Todo en búferes fijos: los arcos no alocan nada.
 */
export const ARCOS = {
  /** Cuántos a la vez, como mucho (en escritorio y en el teléfono), y los lugares reservados. */
  maximo: 5,
  maximoCompacto: 4,
  lugares: 6,
  /** Cuánto vive cada uno (s, al azar en el tramo) y cada cuánto se rehace su camino (s). */
  vida: [0.22, 0.36],
  tiembla: 0.045,
  /** El camino: los niveles del punto medio (2^niveles tramos), el desvío del primero (parte del largo) y cuánto se achica por nivel. */
  niveles: 5,
  desvio: 0.2,
  aspereza: 0.56,
  /** Las ramas: cuántas (de 0 a 2), sus niveles, su largo (parte del arco) y su ángulo (rad). */
  ramas: { maximo: 2, niveles: 3, largo: [0.22, 0.42], angulo: [0.35, 0.85] },
  /** Los del enlace: cuántos por segundo en toda la escena, la chance de repetir en el mismo par y en cuánto (s); el largo máximo (u). */
  deLosPares: 1.1,
  repite: 0.4,
  repiteEn: [0.04, 0.2],
  largoMaximo: 3.2,
  /** Los del logo: cada cuánto (s, al azar en el tramo) y hasta dónde llega (u desde su centro). */
  delLogo: [2.4, 4.8],
  logoAlcance: 6.8,
  /** Los del puntero: cuántos por segundo mientras haya cargas a su alcance (`PLASMA.cursor.arco`). */
  alCursor: 3,
} as const

export type ClaseDeArco = 'par' | 'logo' | 'cursor'
const CLASES: readonly ClaseDeArco[] = ['par', 'logo', 'cursor']

const N = 2 ** ARCOS.niveles
const M = 2 ** ARCOS.ramas.niveles
/** Los tramos que un arco puede pedir al búfer: el camino y sus ramas. */
export const TRAMOS_POR_ARCO = N + ARCOS.ramas.maximo * M
export const TRAMOS_DEL_BUFER = TRAMOS_POR_ARCO * ARCOS.lugares

export interface Arco {
  activo: boolean
  clase: ClaseDeArco
  /** Las cargas de los extremos (−1: un punto: el del logo en `a`, el del puntero en `b`). */
  a: number
  b: number
  /** El punto del extremo que no es una carga (relativo al centro del logo). */
  readonly punto: Float32Array
  edad: number
  vida: number
  temblor: number
  brillo: number
  readonly desvios: Float32Array
  ramas: number
  readonly ramaDesde: Int32Array
  readonly ramaDir: Float32Array
  readonly ramaLargo: Float32Array
  readonly ramaDesvios: Float32Array
}

export interface Pendiente {
  a: number
  b: number
  en: number
}

export interface EstadoDeLosArcos {
  readonly arcos: readonly Arco[]
  readonly pendientes: Pendiente[]
  proximoDelLogo: number
  /** Lo que pide el banco (un arco ya). */
  forzado: ClaseDeArco | null
  readonly contados: Record<ClaseDeArco, number>
  maximoALaVez: number
}

export function crearArcos(azar: () => number): EstadoDeLosArcos {
  const arcos = Array.from({ length: ARCOS.lugares }, (): Arco => ({
    activo: false,
    clase: 'par',
    a: -1,
    b: -1,
    punto: new Float32Array(3),
    edad: 0,
    vida: 0,
    temblor: 0,
    brillo: 0,
    desvios: new Float32Array((N + 1) * 3),
    ramas: 0,
    ramaDesde: new Int32Array(ARCOS.ramas.maximo),
    ramaDir: new Float32Array(ARCOS.ramas.maximo * 3),
    ramaLargo: new Float32Array(ARCOS.ramas.maximo),
    ramaDesvios: new Float32Array(ARCOS.ramas.maximo * (M + 1) * 3),
  }))
  return { arcos, pendientes: [], proximoDelLogo: 1 + azar() * 2, forzado: null, contados: { par: 0, logo: 0, cursor: 0 }, maximoALaVez: 0 }
}

/** Lo que el programador necesita de afuera: la cámara (relativa al centro), qué se ve, el puntero y el borde del logo. */
export interface Entorno {
  readonly camara: Float32Array
  readonly rayo: RayoDelPuntero | null
  readonly maximo: number
  /** ¿Se ve este punto (relativo al centro) y no cae sobre un texto? */
  readonly seVe: (x: number, y: number, z: number) => boolean
  /** El punto del borde del logo más cercano a (x, y, z), en `destino` (relativo al centro); falso si el logo no está. */
  readonly bordeDelLogo: (x: number, y: number, z: number, destino: Float32Array) => boolean
}

const entre = (azar: () => number, t: readonly [number, number] | readonly number[]): number => t[0] + azar() * (t[1] - t[0])

/** El extremo `cual` del arco (relativo al centro), en `destino`. */
export function extremo(arco: Arco, c: Cargas, cual: 'a' | 'b', destino: Float32Array): void {
  const i = cual === 'a' ? arco.a : arco.b
  if (i >= 0) {
    destino[0] = c.lugar[i * 3]
    destino[1] = c.lugar[i * 3 + 1]
    destino[2] = c.lugar[i * 3 + 2]
  } else {
    destino[0] = arco.punto[0]
    destino[1] = arco.punto[1]
    destino[2] = arco.punto[2]
  }
}

const [A, B, P1, P2, VISTA] = [new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3), new Float32Array(3)]
const PUNTO = new Float32Array(3)

const normalizar = (v: Float32Array): void => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  v[0] /= l
  v[1] /= l
  v[2] /= l
}
/** `destino` = u × w. */
const cruz = (u: ArrayLike<number>, w: ArrayLike<number>, destino: Float32Array): void => {
  const [x, y, z] = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
  destino[0] = x
  destino[1] = y
  destino[2] = z
}

/**
 * El desplazamiento de punto medio en `salida` (3 por punto, `tramos + 1` puntos, los extremos en cero): cada nivel corre el medio
 * de cada tramo hacia un costado (sobre todo de costado en la pantalla, `p1`; un poco en profundidad, `p2`).
 */
export function puntoMedio(salida: Float32Array, desde: number, tramos: number, largo: number, p1: ArrayLike<number>, p2: ArrayLike<number>, azar: () => number): void {
  for (let k = 0; k <= tramos; k += 1) for (let e = 0; e < 3; e += 1) salida[desde + k * 3 + e] = 0
  let amplitud = largo * ARCOS.desvio
  for (let paso = tramos; paso > 1; paso /= 2) {
    const medio = paso / 2
    for (let k = medio; k < tramos; k += paso) {
      const [u, w] = [(azar() * 2 - 1) * amplitud, (azar() * 2 - 1) * amplitud * 0.35]
      for (let e = 0; e < 3; e += 1) {
        const promedio = (salida[desde + (k - medio) * 3 + e] + salida[desde + (k + medio) * 3 + e]) / 2
        salida[desde + k * 3 + e] = promedio + p1[e] * u + p2[e] * w
      }
    }
    amplitud *= ARCOS.aspereza
  }
}

/** Rehace el camino del arco (y sus ramas) entre sus extremos de ahora, con otro brillo. */
export function temblar(arco: Arco, c: Cargas, camara: ArrayLike<number>, azar: () => number): void {
  extremo(arco, c, 'a', A)
  extremo(arco, c, 'b', B)
  const eje = [B[0] - A[0], B[1] - A[1], B[2] - A[2]]
  const largo = Math.hypot(eje[0], eje[1], eje[2]) || 1e-3
  for (let e = 0; e < 3; e += 1) VISTA[e] = (A[e] + B[e]) / 2 - camara[e]
  cruz(eje, VISTA, P1)
  normalizar(P1)
  cruz(eje, P1, P2)
  normalizar(P2)
  puntoMedio(arco.desvios, 0, N, largo, P1, P2, azar)
  arco.brillo = 0.55 + 0.45 * azar()
  arco.ramas = azar() < 0.3 ? 0 : azar() < 0.6 ? 1 : 2
  for (let r = 0; r < arco.ramas; r += 1) {
    const desde = Math.round(N * entre(azar, [0.25, 0.7]))
    const angulo = entre(azar, ARCOS.ramas.angulo) * (azar() < 0.5 ? -1 : 1)
    const [cs, sn] = [Math.cos(angulo), Math.sin(angulo)]
    for (let e = 0; e < 3; e += 1) arco.ramaDir[r * 3 + e] = (eje[e] / largo) * cs + P1[e] * sn + P2[e] * (azar() - 0.5) * 0.4
    const dir = arco.ramaDir.subarray(r * 3, r * 3 + 3)
    normalizar(dir)
    arco.ramaDesde[r] = desde
    arco.ramaLargo[r] = largo * entre(azar, ARCOS.ramas.largo)
    cruz(dir, VISTA, P1)
    normalizar(P1)
    cruz(dir, P1, P2)
    normalizar(P2)
    puntoMedio(arco.ramaDesvios, r * (M + 1) * 3, M, arco.ramaLargo[r], P1, P2, azar)
  }
  if (arco.a >= 0) c.brillo[arco.a] = Math.min(1.5, c.brillo[arco.a] + PLASMA.brillo.arco * 0.4)
  if (arco.b >= 0) c.brillo[arco.b] = Math.min(1.5, c.brillo[arco.b] + PLASMA.brillo.arco * 0.4)
}

function activos(e: EstadoDeLosArcos): number {
  let k = 0
  for (const a of e.arcos) if (a.activo) k += 1
  return k
}

/** Un lugar libre; si no hay (o se llegó al tope) y `desplaza`, el del más viejo que no sea del puntero. */
function lugarLibre(e: EstadoDeLosArcos, maximo: number, desplaza: boolean): Arco | null {
  if (activos(e) < maximo) return e.arcos.find((a) => !a.activo) ?? null
  if (!desplaza) return null
  let viejo: Arco | null = null
  for (const a of e.arcos) if (a.activo && a.clase !== 'cursor' && (viejo === null || a.edad / a.vida > viejo.edad / viejo.vida)) viejo = a
  if (viejo !== null) viejo.activo = false
  return viejo
}

function encender(e: EstadoDeLosArcos, arco: Arco, clase: ClaseDeArco, a: number, b: number, c: Cargas, camara: ArrayLike<number>, azar: () => number): void {
  arco.activo = true
  arco.clase = clase
  arco.a = a
  arco.b = b
  arco.edad = 0
  arco.vida = entre(azar, ARCOS.vida)
  arco.temblor = ARCOS.tiembla
  temblar(arco, c, camara, azar)
  e.contados[clase] += 1
  e.maximoALaVez = Math.max(e.maximoALaVez, activos(e))
}

const lugarDe = (c: Cargas, i: number): [number, number, number] => [c.lugar[i * 3], c.lugar[i * 3 + 1], c.lugar[i * 3 + 2]]

/** ¿Se ve el par (los dos extremos y el medio) y es corto? */
function parQueSeVe(c: Cargas, i: number, j: number, en: Entorno): boolean {
  const [p, q] = [lugarDe(c, i), lugarDe(c, j)]
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < ARCOS.largoMaximo && en.seVe(...p) && en.seVe(...q) && en.seVe((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2)
}

/** El paso de los arcos: envejecen, tiemblan y se apagan; nacen los nuevos (puntero, repeticiones, enlaces, logo) bajo el tope. */
export function programarArcos(e: EstadoDeLosArcos, c: Cargas, dt: number, en: Entorno, azar: () => number): void {
  for (const arco of e.arcos) {
    if (!arco.activo) continue
    arco.edad += dt
    if (arco.edad >= arco.vida) {
      arco.activo = false
      // Mientras el par siga enlazado, puede volver a saltar enseguida (el parpadeo del plasma).
      if (arco.clase === 'par' && c.pareja[arco.a] === arco.b && azar() < ARCOS.repite && e.pendientes.length < ARCOS.lugares) e.pendientes.push({ a: arco.a, b: arco.b, en: entre(azar, ARCOS.repiteEn) })
      continue
    }
    if (arco.clase === 'cursor') {
      if (en.rayo === null) arco.activo = false
      else distanciaAlRayo(c, arco.a, en.rayo, arco.punto)
    }
    arco.temblor -= dt
    if (arco.activo && arco.temblor <= 0) {
      arco.temblor += ARCOS.tiembla
      temblar(arco, c, en.camara, azar)
    }
  }
  const forzado = e.forzado
  e.forzado = null
  // El puntero: si hay cargas a su alcance (y él no está sobre un texto), un arco le salta.
  if (en.rayo !== null && (forzado === 'cursor' || azar() < ARCOS.alCursor * dt)) {
    const inicio = Math.floor(azar() * c.n)
    for (let k = 0; k < c.n; k += 1) {
      const i = (inicio + k) % c.n
      const d = distanciaAlRayo(c, i, en.rayo, PUNTO)
      if (d < PLASMA.cursor.arco[0] || d >= PLASMA.cursor.arco[1] || !en.seVe(...lugarDe(c, i)) || !en.seVe(PUNTO[0], PUNTO[1], PUNTO[2])) continue
      const arco = lugarLibre(e, en.maximo, true)
      if (arco !== null) {
        arco.punto.set(PUNTO)
        encender(e, arco, 'cursor', i, -1, c, en.camara, azar)
      }
      break
    }
  }
  for (let k = e.pendientes.length - 1; k >= 0; k -= 1) {
    const p = e.pendientes[k]
    p.en -= dt
    if (p.en > 0) continue
    e.pendientes.splice(k, 1)
    if (c.pareja[p.a] !== p.b || !parQueSeVe(c, p.a, p.b, en)) continue
    const arco = lugarLibre(e, en.maximo, false)
    if (arco !== null) encender(e, arco, 'par', p.a, p.b, c, en.camara, azar)
  }
  // Los enlaces: cada tanto, en uno al azar que se vea.
  if (forzado === 'par' || azar() < ARCOS.deLosPares * dt) {
    const inicio = Math.floor(azar() * c.n)
    for (let k = 0; k < c.n; k += 1) {
      const i = (inicio + k) % c.n
      const j = c.pareja[i]
      if (j < 0 || !parQueSeVe(c, i, j, en)) continue
      const arco = lugarLibre(e, en.maximo, forzado === 'par')
      if (arco !== null) encender(e, arco, 'par', i, j, c, en.camara, azar)
      break
    }
  }
  // El logo: cada tanto, hacia una carga cercana (de tres al azar, la más cerca), desde el punto de su borde más cercano.
  e.proximoDelLogo -= dt
  if (forzado === 'logo' || e.proximoDelLogo <= 0) {
    e.proximoDelLogo = entre(azar, ARCOS.delLogo)
    let mejor = -1
    let distancia = Number.POSITIVE_INFINITY
    for (let intento = 0, vistos = 0; intento < c.n * 2 && vistos < 3; intento += 1) {
      const i = Math.floor(azar() * c.n)
      const p = lugarDe(c, i)
      const d = Math.hypot(...p)
      if (d > ARCOS.logoAlcance || !en.seVe(...p)) continue
      vistos += 1
      if (d < distancia) [mejor, distancia] = [i, d]
    }
    if (mejor >= 0 && en.bordeDelLogo(...lugarDe(c, mejor), PUNTO) && en.seVe(PUNTO[0], PUNTO[1], PUNTO[2])) {
      const arco = lugarLibre(e, en.maximo, true)
      if (arco !== null) {
        arco.punto.set(PUNTO)
        encender(e, arco, 'logo', -1, mejor, c, en.camara, azar)
      }
    }
  }
}

/** El búfer de los tramos (fijo: lo reservan una vez y los arcos lo reescriben). Por vértice: los dos extremos y la forma. */
export interface BuferDeLosArcos {
  readonly a: Float32Array
  readonly b: Float32Array
  /** El extremo (0/1), el lado (−1/1), el ancho (1 el camino, menos las ramas) y el brillo. */
  readonly forma: Float32Array
  readonly indices: Uint16Array
}

export function crearBuferDeLosArcos(): BuferDeLosArcos {
  const v = TRAMOS_DEL_BUFER * 4
  const indices = new Uint16Array(TRAMOS_DEL_BUFER * 6)
  // En sentido antihorario en la pantalla (el lado −1 queda a la derecha del avance): con el horario, el descarte de caras los tira.
  for (let s = 0; s < TRAMOS_DEL_BUFER; s += 1) indices.set([s * 4, s * 4 + 2, s * 4 + 1, s * 4 + 1, s * 4 + 2, s * 4 + 3], s * 6)
  return { a: new Float32Array(v * 3), b: new Float32Array(v * 3), forma: new Float32Array(v * 4), indices }
}

/** El brillo del arco a lo largo de su vida: entra rápido, tiembla y se apaga. */
export function envolvente(edad: number, vida: number, brillo: number): number {
  const x = Math.min(1, Math.max(0, edad / vida))
  const entra = Math.min(1, x / 0.08)
  const sale = x < 0.55 ? 1 : 1 - (x - 0.55) / 0.45
  return entra * sale * sale * brillo
}

function tramo(bufer: BuferDeLosArcos, s: number, p: ArrayLike<number>, q: ArrayLike<number>, ancho: number, brillo: number): void {
  for (let v = 0; v < 4; v += 1) {
    const [k3, k4] = [(s * 4 + v) * 3, (s * 4 + v) * 4]
    for (let e = 0; e < 3; e += 1) {
      bufer.a[k3 + e] = p[e]
      bufer.b[k3 + e] = q[e]
    }
    bufer.forma[k4] = v < 2 ? 0 : 1
    bufer.forma[k4 + 1] = v % 2 === 0 ? -1 : 1
    bufer.forma[k4 + 2] = ancho
    bufer.forma[k4 + 3] = brillo
  }
}

const [P, Q, BASE] = [new Float32Array(3), new Float32Array(3), new Float32Array(3)]

/** Escribe los tramos de los arcos vivos en el búfer y devuelve cuántos (el resto no se dibuja). */
export function rellenarArcos(e: EstadoDeLosArcos, c: Cargas, bufer: BuferDeLosArcos): number {
  let s = 0
  for (const arco of e.arcos) {
    if (!arco.activo) continue
    extremo(arco, c, 'a', A)
    extremo(arco, c, 'b', B)
    const brillo = envolvente(arco.edad, arco.vida, arco.brillo) * (arco.clase === 'par' ? 0.85 : 1)
    const punto = (k: number, destino: Float32Array): void => {
      for (let i = 0; i < 3; i += 1) destino[i] = A[i] + ((B[i] - A[i]) * k) / N + arco.desvios[k * 3 + i]
    }
    for (let k = 0; k < N; k += 1) {
      punto(k, P)
      punto(k + 1, Q)
      tramo(bufer, s, P, Q, 1, brillo)
      s += 1
    }
    for (let r = 0; r < arco.ramas; r += 1) {
      punto(arco.ramaDesde[r], BASE)
      const desde = r * (M + 1) * 3
      const en = (m: number, destino: Float32Array): void => {
        for (let i = 0; i < 3; i += 1) destino[i] = BASE[i] + (arco.ramaDir[r * 3 + i] * arco.ramaLargo[r] * m) / M + arco.ramaDesvios[desde + m * 3 + i]
      }
      for (let m = 0; m < M; m += 1) {
        en(m, P)
        en(m + 1, Q)
        tramo(bufer, s, P, Q, 0.6 * (1 - (m / M) * 0.5), brillo * 0.6)
        s += 1
      }
    }
  }
  return s
}

export { CLASES as CLASES_DE_ARCOS }
