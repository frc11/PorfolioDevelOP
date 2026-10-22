/**
 * [NOCTURNO B2] EL ARO DE LAS RESEÑAS, PURO — dónde va cada placa, cuánto se lee y cómo gira. Sin three ni el DOM: lo recorre `s83` sin
 * navegador y lo usan la escena (`EscenaDeLasResenas.tsx`) y los bancos.
 *
 * El mundo: el logo centrado en el origen, el frente hacia la cámara (+z) y el aro en el plano horizontal, centrado en el eje del logo. Un
 * ángulo del aro α va del frente (0) hacia la derecha (90°), la nuca (180°) y la izquierda (270°): la placa en α está en (R sen α, R cos α)
 * y mira hacia afuera (su normal, la misma dirección). El aro gira con α creciente: lo de adelante corre hacia la derecha.
 *
 * LA ENTRADA (atada al avance `e`, de 0 a 1): dos cadenas. La de ADELANTE llega desde la izquierda por la recta tangente al frente del aro
 * (z = R, hacia +x) y, al tocarlo, sigue por la mitad derecha; la de ATRÁS llega desde la derecha por la tangente de la nuca (z = −R, hacia
 * −x) y sigue por la mitad izquierda. Se unen alrededor del logo. Cada placa sabe de qué cadena es por la mitad del aro en que termina, y
 * en `e` está corrida hacia atrás sobre su camino `(1 − e) · S`, con `S` lo que hace falta para que la cadena entera arranque afuera
 * del cuadro. Función pura de `e` y del giro: para atrás, en reversa.
 */

export const ARO = {
  /** Las placas físicas: en la nuca, cada una cambia a la reseña siguiente. */
  placas: 10,
  /**
   * Medidas en el mundo para un cuadro de 1,6 (1440 × 900); se escalan con la proporción (`escalaDelAro`). [B2, después de verla] Más
   * chicas y más cerca del logo (eran radio 6,4 y placas de 3,2 × 2,15: la de frente medía un tercio del ancho y tapaba un tercio del
   * logo): con la cámara de los valores la de frente mide ~21 % del ancho y tapa ~14 % de la caja del logo (s83 §13).
   */
  radio: 5.6,
  ancho: 2.2,
  alto: 1.5,
  espesor: 0.12,
  esquina: 0.16,
  /** Lo que la placa queda por encima del pie del logo (mundo): el pie del aro, a la altura del pie del logo. */
  sobreElPie: 0,
  /** Una vuelta entera, en segundos: velocidad de lectura (cada placa pasa ~14 s por el frente). */
  vueltaS: 72,
  /** El freno del hover y lo que tarda en volver a girar (constante de tiempo, s); la inercia de un arrastre soltado (s). */
  frenoS: 0.35,
  inerciaS: 1.4,
  /** El levante de la placa señalada (mundo) y en cuánto llega (s). */
  levanta: 0.24,
  levantaS: 0.12,
  /** El texto: entero hasta `lleno` grados del frente, nada desde `nada`. */
  texto: { lleno: 40, nada: 62 },
  /** La niebla de la sala: la placa se mete desde `desde` grados y desde `hasta` no se dibuja. */
  niebla: { desde: 95, hasta: 150 },
  /**
   * El texto aparece con la entrada (desde `textoDesde`, entero `textoEn` después): las placas que pasan por el frente ya se leen mientras
   * el aro termina de armarse. [B2, después de verla] Era desde 0,82: a mitad de la entrada (un 38 % del alto de la sección) las placas
   * pasaban vacías.
   */
  textoDesde: 0.45,
  textoEn: 0.3,
  /** Lo que un px de arrastre gira el aro (rad por px de un cuadro de 1440 de ancho). */
  arrastrePorPx: 0.0042,
} as const

export const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const suave = (u: number): number => {
  const t = acotar01(u)
  return t * t * (3 - 2 * t)
}
/** El ángulo en (−π, π]. */
export function centrado(a: number): number {
  const r = a % (2 * Math.PI)
  if (r > Math.PI) return r - 2 * Math.PI
  if (r <= -Math.PI) return r + 2 * Math.PI
  return r
}
const enVuelta = (a: number): number => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

/** La escala del aro con la proporción del cuadro: en uno más angosto que 1,6 el aro se achica (el campo horizontal es menor). */
export function escalaDelAro(aspecto: number): number {
  return Math.min(1.1, Math.max(0.72, aspecto / 1.6))
}

/** Las medidas del aro en un cuadro de esta proporción. */
export interface MedidasDelAro {
  readonly radio: number
  readonly ancho: number
  readonly alto: number
  readonly espesor: number
  readonly esquina: number
  /** El recorrido de la entrada: la media vuelta más la recta hasta afuera del cuadro. */
  readonly recorrido: number
}

export function medidasDelAro(aspecto: number): MedidasDelAro {
  return medidasDeLaEscala(escalaDelAro(aspecto))
}

/** Las medidas del aro con su escala (`escalaDelAro`). */
export function medidasDeLaEscala(k: number): MedidasDelAro {
  const radio = ARO.radio * k
  const ancho = ARO.ancho * k
  return { radio, ancho, alto: ARO.alto * k, espesor: ARO.espesor * k, esquina: ARO.esquina * k, recorrido: Math.PI * radio + 1.6 * radio + ancho }
}

/** [B3] Lo que baja una placa con la bajada entera (mundo): hasta perderse por el hueco del piso. */
export const HONDO_DE_LA_BAJADA = 3.2

/** Una placa en el aro: dónde (x, z), hacia dónde mira (la normal, en el ángulo `mira`) y su ángulo en el aro (0, el frente). */
export interface PoseDeLaPlaca {
  x: number
  z: number
  mira: number
  angulo: number
  /** Si ya está en el aro (no en la recta de su cadena). */
  enElAro: boolean
  /** La cadena: 0 la de adelante, 1 la de atrás. */
  cadena: 0 | 1
}

export const nuevaPose = (): PoseDeLaPlaca => ({ x: 0, z: 0, mira: 0, angulo: 0, enElAro: true, cadena: 0 })

/** El ángulo de la placa `i` con el aro girado `giro` (rad, sin acotar): su lugar armado. */
export const anguloDeLaPlaca = (i: number, giro: number): number => (i * 2 * Math.PI) / ARO.placas + giro

/**
 * La pose de la placa `i` con la entrada `e` y el giro `giro` (escribe en `p`, sin reservar). En `e` = 1 está en su lugar del aro; en 0, la
 * cadena entera está en su recta, afuera del cuadro.
 */
export function poseDeLaPlaca(i: number, e: number, giro: number, m: MedidasDelAro, p: PoseDeLaPlaca): PoseDeLaPlaca {
  const a = enVuelta(anguloDeLaPlaca(i, giro))
  const cadena: 0 | 1 = a < Math.PI ? 0 : 1
  const tangente = cadena === 0 ? 0 : Math.PI
  const u = (a - tangente) * m.radio - (1 - acotar01(e)) * m.recorrido
  p.cadena = cadena
  if (u >= 0) {
    const phi = tangente + u / m.radio
    p.x = m.radio * Math.sin(phi)
    p.z = m.radio * Math.cos(phi)
    p.mira = phi
    p.angulo = centrado(phi)
    p.enElAro = true
    return p
  }
  // En la recta: la tangente del aro en su punto de entrada, recorrida para atrás (la de adelante hacia −x, la de atrás hacia +x).
  const sentido = cadena === 0 ? 1 : -1
  p.x = sentido * u
  p.z = cadena === 0 ? m.radio : -m.radio
  p.mira = tangente
  p.angulo = centrado(tangente)
  p.enElAro = false
  return p
}

const grados = (rad: number): number => (Math.abs(centrado(rad)) * 180) / Math.PI

/** Cuánto se lee el texto de una placa en `angulo` (rad): entero adelante, nada de costado. */
export function textoDeLaPlaca(angulo: number): number {
  const g = grados(angulo)
  return 1 - suave((g - ARO.texto.lleno) / (ARO.texto.nada - ARO.texto.lleno))
}

/** Cuánto se metió la placa en la niebla (0, nada; 1, no se dibuja). Siempre DESPUÉS de que perdió el texto. */
export function nieblaDeLaPlaca(angulo: number): number {
  const g = grados(angulo)
  return suave((g - ARO.niebla.desde) / (ARO.niebla.hasta - ARO.niebla.desde))
}

/** El texto con la entrada: aparece con el aro casi armado. */
export const textoConLaEntrada = (e: number): number => suave((e - ARO.textoDesde) / ARO.textoEn)

/**
 * La reseña que muestra la placa `i` con el giro `giro`: cambia a la siguiente (de a `placas`) cada vez que la placa cruza la NUCA del aro
 * (α = 180°), donde no se ve. Con el giro para atrás (un arrastre), vuelve. Entre las placas que se leen (adelante) nunca se repite una
 * reseña mientras haya al menos tantas reseñas como placas.
 */
export function resenaDeLaPlaca(i: number, giro: number, resenas: number): number {
  const vueltas = Math.floor((anguloDeLaPlaca(i, giro) + Math.PI) / (2 * Math.PI))
  const n = i + ARO.placas * vueltas
  return ((n % resenas) + resenas) % resenas
}

/** El giro del aro: el ángulo (rad, sin acotar) y la velocidad (rad/s). */
export interface GiroDelAro {
  angulo: number
  velocidad: number
}

export const VELOCIDAD_DE_LECTURA = (2 * Math.PI) / ARO.vueltaS

/**
 * Un paso del giro (`dt` en s). Gira sólo con el aro armado; señalada una placa (hover o foco), frena hasta parar; con movimiento reducido,
 * quieto. Arrastrando, el ángulo sigue al puntero (`dx` ya en rad) y la velocidad es la del arrastre; al soltar, esa velocidad vuelve a la de
 * lectura con la inercia (un arrastre rápido sigue girando y se calma).
 */
export function pasoDelGiro(g: GiroDelAro, dt: number, armado: boolean, senalada: boolean, quieto: boolean, arrastrando: boolean, dx: number): GiroDelAro {
  const paso = Math.max(0, Math.min(dt, 0.1))
  if (!armado || quieto) {
    g.velocidad = 0
    return g
  }
  if (arrastrando) {
    g.angulo += dx
    if (paso > 0) g.velocidad += (dx / paso - g.velocidad) * 0.5
    return g
  }
  const objetivo = senalada ? 0 : VELOCIDAD_DE_LECTURA
  const tau = Math.abs(g.velocidad) > VELOCIDAD_DE_LECTURA * 1.5 ? ARO.inerciaS : ARO.frenoS
  g.velocidad += (objetivo - g.velocidad) * (1 - Math.exp(-paso / tau))
  g.angulo += g.velocidad * paso
  return g
}

/** El levante de una placa hacia su objetivo (0 o 1) en `dt`. */
export function pasoDelLevante(actual: number, objetivo: number, dt: number): number {
  return actual + (objetivo - actual) * (1 - Math.exp(-Math.max(0, dt) / ARO.levantaS))
}

/** Las placas cuyo texto se lee (más de la mitad) con el aro armado y girado `giro`. */
export function placasQueSeLeen(giro: number, m: MedidasDelAro): number[] {
  const p = nuevaPose()
  const salida: number[] = []
  for (let i = 0; i < ARO.placas; i += 1) if (textoDeLaPlaca(poseDeLaPlaca(i, 1, giro, m, p).angulo) > 0.5) salida.push(i)
  return salida
}
