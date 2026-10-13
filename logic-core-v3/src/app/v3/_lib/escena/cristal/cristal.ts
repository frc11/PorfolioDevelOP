import { FLOOR_Y } from '../probeScene'

/**
 * [PULIDO 20] R2 · EL CRISTAL, LO PURO (`docs/rediseno/DIMENSION-ESPEJO.md`, «Las esquirlas»). El de PULIDO 19 (una malla de celdas pegada a
 * la cúpula, plana y pareja, en una pasada de pantalla entera) se borró: no gustó y tenía cuatro defectos (vibraba, se comía partículas,
 * doblaba los textos y rayaba la silueta del logo, estiraba los bordes: las causas, en el log). Ahora son ESQUIRLAS 3D de verdad, como
 * las de la foto de Dr. Strange: pocas, grandes, facetadas, con biseles y cantos filosos, a distintas profundidades CONTRA EL DOMO (un
 * anillo lejos del centro: paralaje real), que refractan SÓLO EL FONDO (`fondo.ts`: el cielo, el domo, la trama y la fábrica de logos, sin
 * logo, títulos, partículas ni pie) y se ven sólo en el BORDE del cuadro (`zonaDelCristal`): nunca detrás de un texto ni del logo, nunca
 * pegadas a la cámara, y donde una refracción mira fuera del fondo se desvanecen (nunca estiran). Cristalizan: aparecen creciendo y
 * respiran y giran muy lento, con el reloj (sin temblor). Puro (Node): las constantes, dónde va cada esquirla, dónde se ve.
 */
export const CRISTAL = {
  /**
   * Las esquirlas: cuántas, el anillo donde viven (radio u: adentro de la trama cercana, contra el domo), entre qué alturas sobre el piso
   * (u), su largo (u), su ancho (parte del largo), su espesor (parte del ancho), lo que se mete el bisel (parte) y la semilla.
   */
  // [PULIDO 21] S4 · toda la escena rodeada, pareja en los 360° del domo. [PULIDO 22] T5 · una PARED continua de facetas: 4 filas de 40
  // celdas a 27 u (adentro de la trama, en 38, y de la fábrica, en 45: nada del fondo la tapa), del piso a 36 u; el largo es el alto de
  // la celda y el ancho, partes de su paso en el azimut (más de una: se solapan, sin huecos).
  esquirlas: { cuantas: 160, radio: [26.7, 27.3], alto: [0, 36], largo: [9.5, 9.8], ancho: [1.06, 1.1], espesor: [0.03, 0.05], bisel: 0.12, semilla: 20, filas: 4 },
  /** El vidrio: el índice, a qué distancia detrás se lee el fondo (u), el F0 de Schlick y la dispersión del prisma (en los cantos, el doble). */
  vidrio: { indice: 1.5, fondo: 14, f0: 0.04, dispersion: 0.03 },
  /**
   * La luz: el brillo especular (día, noche) y su dureza; el reflejo del entorno (día, noche); el filo (cuánto se aclara el canto de
   * noche y se oscurece de día: la reflexión total en el borde) y la tinta del cuerpo de día.
   */
  luz: { especular: [0.9, 1.6], dureza: 60, reflejo: [0.15, 0.22], filo: [0.65, 0.8], tinta: 0.06 },
  /** Cristalizan: aparecen creciendo (s), respiran muy lento (periodo s, cuánto) y giran muy lento (grados por segundo, entre). */
  movimiento: { aparecenS: 2.5, periodoS: 140, crece: 0.02, giroGradosS: [0.01, 0.03], crecenDesde: 0.55 },
  /**
   * Dónde se ven en el cuadro (NDC): fuera de la zona central segura (una elipse: sus semiejes, y el fundido hacia afuera, en veces del
   * semieje), lejos de la cámara (u: de nada a entera), lejos de las cajas del texto (el fundido: NDC en lo puro; px de más en el
   * sombreador, sobre el borde del plasma; hasta `cajas`: la barra primero, después los textos más grandes) y de la silueta del logo (el
   * fundido, NDC).
   */
  zona: { semiejes: [0.6, 0.5], fundido: 0.45, cerca: [10, 18], texto: 0.08, textoPx: 28, logo: 0.1, cajas: 24 },
  /** Dónde se apaga la página (las secciones de papel opaco y el túnel) y el fundido alrededor (pantallas). */
  donde: { apagadas: ['trabajos', 'tu-panel'], fundido: 0.35 },
  /** El fondo que refractan, a esta fracción del búfer de dibujo. */
  fondo: { escala: 0.5 },
  /** Antes que todo lo transparente que no es fondo (las partículas en 0, la energía en −10, el espejo en −14): nunca las tapa. */
  orden: -17,
} as const

/** Una esquirla: su centro (u), su tamaño (u), su giro de base (un cuaternión: x, y, z, w), su eje de giro lento y su velocidad (rad/s), sus fases. */
export interface Esquirla {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly largo: number
  readonly ancho: number
  readonly espesor: number
  readonly giro: readonly [number, number, number, number]
  readonly eje: readonly [number, number, number]
  readonly velocidad: number
  readonly fase: number
  readonly faseDelGiro: number
  /** Su forma en el plano (pares x, y en partes del largo y del ancho: un polígono convexo y filoso). */
  readonly contorno: readonly number[]
}

/** Un azar con semilla (mulberry32): siempre las mismas esquirlas. */
export function azarDelCristal(semilla: number): () => number {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const entre = (azar: () => number, r: readonly number[]): number => r[0] + azar() * (r[1] - r[0])

/** El cuaternión que lleva (0, 0, 1) a la dirección (x, y, z) unitaria, girado `rollo` alrededor de ella. */
function mirando(x: number, y: number, z: number, rollo: number): [number, number, number, number] {
  // De (0,0,1) a d: eje = z × d, ángulo = acos(d.z); después el rollo alrededor de d.
  const c = Math.max(-1, Math.min(1, z))
  let ex = -y
  let ey = x
  const l = Math.hypot(ex, ey)
  let q: [number, number, number, number]
  if (l < 1e-6) q = c > 0 ? [0, 0, 0, 1] : [1, 0, 0, 0]
  else {
    ex /= l
    ey /= l
    const s = Math.sin(Math.acos(c) / 2)
    q = [ex * s, ey * s, 0, Math.cos(Math.acos(c) / 2)]
  }
  const sr = Math.sin(rollo / 2)
  const r: [number, number, number, number] = [x * sr, y * sr, z * sr, Math.cos(rollo / 2)]
  // r · q
  return [r[3] * q[0] + r[0] * q[3] + r[1] * q[2] - r[2] * q[1], r[3] * q[1] - r[0] * q[2] + r[1] * q[3] + r[2] * q[0], r[3] * q[2] + r[0] * q[1] - r[1] * q[0] + r[2] * q[3], r[3] * q[3] - r[0] * q[0] - r[1] * q[1] - r[2] * q[2]]
}

/**
 * Las esquirlas (siempre las mismas: la semilla): repartidas alrededor del domo (el azimut parejo con un poco de azar), en el anillo, a
 * alturas distintas, de tamaños variados; cada una mira más o menos al centro (de frente a la sala, con su inclinación y su rollo) y gira
 * lento alrededor de un eje propio. Su contorno: un polígono convexo y alargado, con una punta (lo filoso de un vidrio roto).
 */
export function esquirlasDelCristal(n: number = CRISTAL.esquirlas.cuantas, semilla: number = CRISTAL.esquirlas.semilla): Esquirla[] {
  const E = CRISTAL.esquirlas
  const azar = azarDelCristal(semilla)
  const salida: Esquirla[] = []
  const porFila = Math.ceil(n / E.filas)
  const franja = (E.alto[1] - E.alto[0]) / E.filas
  const j = (k: number): number => (azar() - 0.5) * 2 * k
  for (let k = 0; k < n; k += 1) {
    // [PULIDO 22] T5 · una pared: cada esquirla es una celda (su columna en el azimut, su fila en la altura, las filas corridas media
    // celda como ladrillos), de cara al centro con un desvío chico (las facetas), y un poco más grande que su celda (sin huecos).
    const fila = Math.floor(k / porFila)
    const az = (((k % porFila) + 0.5 * (fila % 2) + 0.5) / porFila) * 2 * Math.PI
    const radio = entre(azar, E.radio)
    const y = FLOOR_Y + E.alto[0] + franja * (fila + 0.5)
    const largo = entre(azar, E.largo)
    const ancho = ((2 * Math.PI * radio) / porFila) * entre(azar, E.ancho)
    const espesor = ancho * entre(azar, E.espesor)
    const x = Math.sin(az) * radio
    const z = Math.cos(az) * radio
    const dx = -Math.sin(az + j(0.12))
    const dz = -Math.cos(az + j(0.12))
    const dy = j(0.1)
    const l = Math.hypot(dx, dy, dz)
    const giro = mirando(dx / l, dy / l, dz / l, j(0.05))
    const ex = azar() - 0.5
    const ey = azar() - 0.5
    const ez = azar() - 0.5
    const le = Math.hypot(ex, ey, ez) || 1
    const velocidad = ((entre(azar, CRISTAL.movimiento.giroGradosS) * Math.PI) / 180) * (azar() < 0.5 ? -1 : 1)
    // El contorno: la celda con las esquinas apenas corridas (el vidrio cortado a mano).
    const contorno = [-0.5 + j(0.04), -0.5 + j(0.04), 0.5 + j(0.04), -0.5 + j(0.04), 0.5 + j(0.04), 0.5 + j(0.04), -0.5 + j(0.04), 0.5 + j(0.04)]
    salida.push({ x, y, z, largo, ancho, espesor, giro, eje: [ex / le, ey / le, ez / le], velocidad, fase: azar() * 2 * Math.PI, faseDelGiro: azar() * 2 * Math.PI, contorno })
  }
  return salida
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * (3 - 2 * u)
}

/**
 * Cuánto se ve el cristal en un punto del cuadro (NDC, −1 a 1), lo mismo que el sombreador (`vidrio.ts`): fuera de la elipse central, lejos
 * de las cajas del texto (`textos`: x0, y0, x1, y1 en NDC) y del rectángulo del logo (`logo`: x0, y0, x1, y1), con sus fundidos. Para el
 * invariante: en una caja del texto o en el logo, cero.
 */
export function zonaDelCristal(x: number, y: number, aspecto: number, textos: ArrayLike<number>, cuantosTextos: number, logo: ArrayLike<number> | null): number {
  const Z = CRISTAL.zona
  const r = Math.hypot(x / Z.semiejes[0], y / Z.semiejes[1])
  let a = suave((r - 1) / Z.fundido)
  for (let k = 0; k < cuantosTextos; k += 1) a *= suave(fueraDeLaCaja(x, y, textos[k * 4], textos[k * 4 + 1], textos[k * 4 + 2], textos[k * 4 + 3], aspecto) / Z.texto)
  if (logo !== null) a *= suave(fueraDeLaCaja(x, y, logo[0], logo[1], logo[2], logo[3], aspecto) / Z.logo)
  return a
}

/** Cuánto afuera de una caja (NDC) está un punto: 0 adentro, la distancia al borde afuera (el x por el aspecto: en distancia de pantalla). */
export function fueraDeLaCaja(x: number, y: number, x0: number, y0: number, x1: number, y1: number, aspecto: number): number {
  const dx = Math.max(x0 - x, 0, x - x1) * aspecto
  const dy = Math.max(y0 - y, 0, y - y1)
  return Math.hypot(dx, dy)
}

/**
 * La amplitud por dónde está la página (0 a 1): 0 con el medio de la pantalla adentro de una sección apagada, 1 a más de `fundido`
 * pantallas de todas, el fundido entre medio. `bandas`: por sección apagada, su arriba y su abajo (px del documento); `centro`: el medio
 * de la pantalla (px del documento); `alto`: la pantalla (px).
 */
export function amplitudPorDonde(centro: number, alto: number, bandas: ArrayLike<number>, cuantas: number): number {
  let a = 1
  const fundido = CRISTAL.donde.fundido * Math.max(1, alto)
  for (let k = 0; k < cuantas; k += 1) {
    const arriba = bandas[k * 2]
    const abajo = bandas[k * 2 + 1]
    if (!Number.isFinite(arriba) || !Number.isFinite(abajo)) continue
    const fuera = centro < arriba ? arriba - centro : centro > abajo ? centro - abajo : 0
    a = Math.min(a, suave(fuera / fundido))
  }
  return a
}

/** La amplitud del cuadro: por dónde está la página y por el final del pie (se va con la cámara que sube, `camara` 0 a 1). */
export function amplitudDelCristal(porDonde: number, camara: number): number {
  return porDonde * (1 - suave(camara))
}
