import { FLOOR_Y } from '../probeScene'
import { CAIDA_AL_HUECO, anguloDeLaCaida, caidaIntegrada, type CaidaIntegrada } from './caidaAlHueco'
import { duracionDelRebote } from './reboteDelPie'
export { reboteDeLaPieza } from './reboteDelPie'

/**
 * [PULIDO 19] Q2 · LAS PIEZAS DEL PIE TAMBIÉN CAEN — cada pieza del pie de volumen (los textos extruidos, las placas del mail, WhatsApp
 * y las redes, los enlaces del recorrido, la placa del formulario) termina acostada en el piso, con la cara arriba, alrededor del logo.
 * Todo es función de los segundos del reloj del final: el rebobinado la deshace por el mismo camino. Puro (Node): la escena le da las
 * piezas como números y lee poses como números.
 *
 * [PULIDO 20] R1 · CON EL LOGO. Lo que cae es un CUERPO RÍGIDO (`pie3d/caida.ts`: cada columna del pie, la caja invisible que contiene sus
 * piezas, que van pegadas a ella): su escala no cambia, sólo se mueve y gira. BAJA PARADO de la pared del pie a su lugar en el piso en lo
 * que baja el logo (`bajaS`: llega al piso con él), con la BASE en el piso, y ahí VUELCA hacia atrás sobre el canto de su base con la
 * física del logo (`caidaAlHueco.ts`: la inclinación hasta pasar su equilibrio, θ'' = κ·sen(θ − α) con RK4, el rebote, asentada) y su
 * propio κ. Arranca cuando le toca para TOCAR EL PISO EN EL GOLPE: cae lo que le pide su alto y, si no entra entre la bajada y el golpe
 * (una columna más alta que el logo), su reloj se apura lo justo: cae junto con el logo. Asentado, se INCRUSTA: baja su espesor hasta
 * dejar la cara al ras del piso (`sobra` arriba). Su DOM sólo se ve con el cuerpo quieto (`domDeLaPieza`).
 *
 * DÓNDE (`lugaresEnElPiso`): a los lados del logo. Acostados, los de cada lado se apilan hacia atrás en el orden en que estaban de pie (lo
 * de arriba más lejos), con `aire` entre ellos, centrados en el logo a lo largo y pegados a su lado del logo (con `aire`).
 *
 * Coordenadas: el mundo, con la base de la cámara de antes del final sin el mouse: `derecha` (horizontal), arriba (0, 1, 0) y `atras`
 * (horizontal, alejándose de la cámara). Una pieza de pie es su canto de abajo y de atrás (el medio) en el mundo y sus medidas;
 * acostada, su cara mira arriba y su cabeza apunta hacia `atras`. Lo que entra y sale son arreglos ya reservados.
 */
export const CAIDA_DEL_PIE = {
  /** La bajada parada hasta su lugar en el piso (s): la del logo (llega al piso con él). */
  bajaS: CAIDA_AL_HUECO.lenta.bajaS,
  /**
   * Los dos tramos de la bajada (partes de `bajaS`): primero va hacia su lugar a la altura que tenía (hasta `hacia`) y después baja y se
   * endereza (el último `abaja`): cuando bajan, las de una columna ya están en filas distintas (con un solo tramo, el rótulo que va arriba
   * del formulario lo atravesaba: bajaba 7,8 u en lo que el borde del formulario bajaba 0,6).
   */
  tramos: { hacia: 0.6, abaja: 0.55 },
  /** Entre piezas acostadas y hasta el logo (u). */
  aire: 0.5,
  /** Del cuadro que ocupa el pie acostado con el logo (la cámara desde arriba se queda a la distancia que lo deja entero). */
  margenDelCuadro: 0.86,
  /** Asentada, se incrusta en esto (s) y queda `sobra` (u) por encima del piso. */
  incrustaS: 0.3,
  sobra: 0.012,
  /** El DOM: se apaga al arrancar el final (s) y aparece con la pieza incrustada (s). */
  domFueraS: 0.15,
  domS: 0.2,
  /** Lo que el reloj sigue corriendo después de que el DOM de la última apareció (s): el destello y la expansión de siempre. */
  despuesS: 0.6,
  /** Cuánto dura el final después del golpe (s): el rebote, el incrustado, el DOM y `despuesS` (era 4,5 con las piezas en onda). */
  hastaS: 2.5,
  /** Un lugar inalcanzable (sin piezas): la distancia de la cámara es la de siempre. */
  sinPiezas: 0,
  /**
   * Dos piezas cuyos cantos están a menos de esto (u, de pie) están en la misma fila: acostadas van una al lado de la otra, no una detrás
   * de otra. [PULIDO 20] R1 · y a menos de la mitad del alto de la más baja (a 1920 los enlaces del recorrido, uno arriba del otro a 0,5
   * u, quedaban en una fila: acostados, encimados).
   */
  mismaFila: 0.5,
} as const

/** Una pieza de pie: sus medidas (u) y el medio de su canto de abajo y de atrás en el mundo (en la pared). */
export interface PiezaDePie {
  readonly ancho: number
  readonly alto: number
  readonly espesor: number
  readonly x: number
  readonly y: number
  readonly z: number
  /** Lo hondo de lo que se ve en su cara (u: los pozos del formulario), que al incrustarse queda sobre el piso; sin nada, 0. */
  readonly hondo?: number
}

/** La base de la cámara de antes del final sin el mouse, horizontal: `derecha` y `atras` (unitarios, en el plano xz) y el centro del logo. */
export interface BaseDelPie {
  readonly derechaX: number
  readonly derechaZ: number
  readonly atrasX: number
  readonly atrasZ: number
  readonly logoX: number
  readonly logoZ: number
  /** La huella del logo acostado (u): su ancho (a lo largo de `derecha`) y su fondo (a lo largo de `atras`). */
  readonly logoAncho: number
  readonly logoFondo: number
}

/** Su lugar en el piso (el medio del canto: x, z) y su reloj (s del final). */
export interface LugarEnElPiso {
  x: number
  z: number
  /** La bajada parada (s, la misma para todas) y cuánto se apura su caída (1: la de su alto). */
  bajaS: number
  rapidez: number
  /** Cuándo empieza a inclinarse, cuándo arranca la física, cuándo toca (el golpe), cuándo se asienta y cuándo queda incrustada. */
  inclina: number
  cae: number
  toca: number
  asentada: number
  incrustada: number
  /** Su caída integrada (la de su tamaño: `caidaAlHueco.ts`). */
  caida: CaidaIntegrada
  /** A qué lado (−1 izquierda, 1 derecha) y en qué puesto de su pila (0 el más cercano a la cámara). */
  lado: number
  puesto: number
}

const CAIDA_NULA = caidaIntegrada({ alto: 1, espesor: 0.1 })

export function crearLugar(): LugarEnElPiso {
  return { x: 0, z: 0, bajaS: CAIDA_DEL_PIE.bajaS, rapidez: 1, inclina: 0, cae: 0, toca: 0, asentada: 0, incrustada: 0, caida: CAIDA_NULA, lado: 0, puesto: 0 }
}

const ORDEN = new Int32Array(64)
const ALTURA = new Float64Array(64)

/** Cuánto hacia la derecha está el canto de la pieza respecto del logo (u). */
const aLaDerecha = (p: PiezaDePie, b: BaseDelPie): number => (p.x - b.logoX) * b.derechaX + (p.z - b.logoZ) * b.derechaZ

/**
 * Los lugares en el piso de todas las piezas (en `destino`, ya reservado, uno por pieza): las dos pilas y el reloj de cada una. Devuelve
 * cuándo aparece el DOM de la última (s del reloj), o el golpe si no hay piezas. `caidas`: la caída integrada de cada pieza (por su tamaño).
 * [CIERRE A-bis] A10 · `rebote` (s): lo que saltan las piezas después del golpe (A10b: en el producto; sin `?rebote=no`); se incrustan cuando terminan.
 */
export function lugaresEnElPiso(piezas: readonly PiezaDePie[], cuantas: number, caidas: readonly CaidaIntegrada[], b: BaseDelPie, destino: readonly LugarEnElPiso[], rebote: number = duracionDelRebote()): number {
  const n = Math.min(cuantas, piezas.length, destino.length, ORDEN.length)
  const G = CAIDA_AL_HUECO.golpeS
  const I = CAIDA_AL_HUECO.inclinaS
  // La bajada de todos: la del logo; lo que queda hasta el golpe, para inclinarse y caer.
  const baja: number = CAIDA_DEL_PIE.bajaS
  const disponible = G - I - baja
  let ultima: number = G
  for (let lado = -1; lado <= 1; lado += 2) {
    // Las de este lado, de abajo (de pie) hacia arriba: ordenadas por la altura de su canto (inserción: son pocas).
    let m = 0
    for (let i = 0; i < n; i += 1) {
      if ((aLaDerecha(piezas[i], b) < 0 ? -1 : 1) !== lado) continue
      const h = piezas[i].y
      let k = m
      while (k > 0 && ALTURA[k - 1] > h) {
        ORDEN[k] = ORDEN[k - 1]
        ALTURA[k] = ALTURA[k - 1]
        k -= 1
      }
      ORDEN[k] = i
      ALTURA[k] = h
      m += 1
    }
    if (m === 0) continue
    // [PULIDO 23] U4 · CAE DONDE ESTÁ PARADA: su lugar en el piso es el de su canto de pie (ni se acerca ni va hacia el logo: baja lo que
    // flota y vuelca sobre su base). Antes se apilaba pegada al logo (la cámara después la buscaba con un zoom fuerte). Sólo si de pie
    // queda encima de la huella del logo (de pie está más cerca que él: el hueco del cuadro es más angosto ahí), se corre HACIA AFUERA lo
    // justo para dejarle `aire`.
    let masCerca = lado < 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
    for (let k = 0; k < m; k += 1) {
      const p = piezas[ORDEN[k]]
      const borde = aLaDerecha(p, b) - (lado * p.ancho) / 2
      masCerca = lado < 0 ? Math.max(masCerca, borde) : Math.min(masCerca, borde)
    }
    const libre = lado * (b.logoAncho / 2 + CAIDA_DEL_PIE.aire) - masCerca
    const afuera = lado < 0 ? Math.min(0, libre) : Math.max(0, libre)
    for (let k = 0; k < m; k += 1) {
      const i = ORDEN[k]
      const p = piezas[i]
      const l = destino[i]
      l.x = p.x + b.derechaX * afuera
      l.z = p.z + b.derechaZ * afuera
      l.lado = lado
      l.puesto = k
      // El reloj: toca en el golpe; su física arranca lo que tarda en caer antes (apurada lo justo si no entra después de la bajada).
      const c = caidas[i]
      l.caida = c
      l.bajaS = baja
      l.rapidez = Math.max(1, c.contactoS / disponible)
      l.cae = G - c.contactoS / l.rapidez
      l.inclina = l.cae - I / l.rapidez
      l.toca = G
      l.asentada = Math.max(G + rebote, l.cae + (Number.isFinite(c.asentadaS) ? c.asentadaS : c.contactoS) / l.rapidez)
      l.incrustada = l.asentada + CAIDA_DEL_PIE.incrustaS
      ultima = Math.max(ultima, l.incrustada + CAIDA_DEL_PIE.domS)
    }
  }
  return ultima
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** Lo que devuelve `poseDeLaPiezaQueCae` (el mismo objeto cada vez: sin reservas por cuadro). */
export const POSE_DE_LA_PIEZA = {
  /** Cuánto bajó de su lugar en la pared a su lugar en el piso (0 en la pared, 1 parada en el piso, derecha). */
  bajada: 0,
  /** El medio del canto en el mundo. */
  x: 0,
  y: 0,
  z: 0,
  /** El ángulo del cuerpo (0 de pie, π/2 acostada), si ya tocó, cuánto se incrustó (0 a 1) y si quedó quieta (incrustada). */
  a: 0,
  toco: false,
  hundido: 0,
  quieta: false,
}
export type PoseDeLaPieza = typeof POSE_DE_LA_PIEZA

/**
 * La pose de la pieza a los `s` del reloj del final: en cero, de pie en la pared; en la bajada, el canto va hacia su lugar en el piso y
 * después baja (`tramos`), cada tramo con el trayecto de mínimo tirón (y `bajada` dice cuánto bajó y se enderezó); parada en el piso, se
 * inclina y vuelca sobre el canto, que no se mueve más; asentada, se incrusta.
 */
export function poseDeLaPiezaQueCae(p: PiezaDePie, l: LugarEnElPiso, s: number): typeof POSE_DE_LA_PIEZA {
  const P = POSE_DE_LA_PIEZA
  const T = CAIDA_DEL_PIE.tramos
  const h = s <= 0 ? 0 : suave(s / (l.bajaS * T.hacia))
  const b = s <= 0 ? 0 : suave((s - l.bajaS * (1 - T.abaja)) / (l.bajaS * T.abaja))
  P.bajada = b
  P.x = p.x + (l.x - p.x) * h
  P.y = p.y + (FLOOR_Y - p.y) * b
  P.z = p.z + (l.z - p.z) * h
  P.a = 0
  P.toco = false
  P.hundido = 0
  P.quieta = false
  if (s <= l.inclina) return P
  // La inclinación hasta pasar su equilibrio (el trayecto de mínimo tirón) y después la física, en el reloj de la pieza.
  const c = l.caida
  const u = (s - l.cae) * l.rapidez
  P.a = u <= 0 ? c.desde * suave((u + CAIDA_AL_HUECO.inclinaS) / CAIDA_AL_HUECO.inclinaS) : anguloDeLaCaida(c, u)
  P.toco = u >= c.contactoS
  // Asentada, se incrusta: baja su espesor hasta dejar la cara (y lo hondo de ella) `sobra` por encima del piso.
  P.hundido = suave((s - l.asentada) / CAIDA_DEL_PIE.incrustaS)
  P.y -= Math.max(0, p.espesor - (p.hondo ?? 0) - CAIDA_DEL_PIE.sobra) * P.hundido
  P.quieta = s >= l.incrustada
  return P
}

/**
 * Cuánto se ve el DOM de la pieza a los `s` del reloj (0 a 1): entero en cero (la pared), se apaga al arrancar el final (`domFueraS`) y
 * vuelve con la pieza incrustada (`domS`): mientras baja, vuelca o se levanta, nada (ni clics ni su homografía de canto).
 */
export function domDeLaPieza(l: LugarEnElPiso, s: number): number {
  if (s <= CAIDA_DEL_PIE.domFueraS) return 1 - suave(s / CAIDA_DEL_PIE.domFueraS)
  return suave((s - l.incrustada) / CAIDA_DEL_PIE.domS)
}

/** Si el DOM de la pieza sigue a la pieza a los `s` del reloj: en la pared (mientras se apaga) y quieta en el piso; en camino, no. */
export function domSigueALaPieza(l: LugarEnElPiso, s: number): boolean {
  return s <= CAIDA_DEL_PIE.domFueraS || s >= l.incrustada
}

/**
 * La distancia desde arriba a la que el pie acostado entra entero con margen: la huella (medias extensiones desde el blanco, u, a lo
 * largo de `derecha` y de `atras`), el campo vertical de la cámara (grados) y su aspecto. Sin huella, `sinPiezas`.
 */
export function distanciaParaElPie(fovGrados: number, aspecto: number, mediaDerecha: number, mediaAtras: number): number {
  if (!(mediaDerecha > 0) || !(mediaAtras > 0)) return CAIDA_DEL_PIE.sinPiezas
  const t = Math.tan((fovGrados * Math.PI) / 360)
  return Math.max(mediaAtras / t, mediaDerecha / (t * aspecto)) / CAIDA_DEL_PIE.margenDelCuadro
}

/** La huella de todo (las piezas acostadas y el logo): las medias extensiones desde el centro del logo, en `destino` (derecha, atrás). */
export function huellaDelPie(piezas: readonly PiezaDePie[], cuantas: number, lugares: readonly LugarEnElPiso[], b: BaseDelPie, destino: Float64Array): void {
  let derecha = b.logoAncho / 2
  let atras = b.logoFondo / 2
  const n = Math.min(cuantas, piezas.length, lugares.length)
  for (let i = 0; i < n; i += 1) {
    const p = piezas[i]
    const l = lugares[i]
    const d = (l.x - b.logoX) * b.derechaX + (l.z - b.logoZ) * b.derechaZ
    const a = (l.x - b.logoX) * b.atrasX + (l.z - b.logoZ) * b.atrasZ
    derecha = Math.max(derecha, Math.abs(d) + p.ancho / 2)
    atras = Math.max(atras, Math.abs(a), Math.abs(a + p.alto))
  }
  destino[0] = derecha
  destino[1] = atras
}
