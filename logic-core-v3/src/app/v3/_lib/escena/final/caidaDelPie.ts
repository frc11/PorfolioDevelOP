import { FLOOR_Y } from '../probeScene'
import { CAIDA_AL_HUECO, anguloEnElReloj, arranqueDeLaCaida, caidaIntegrada, type CaidaIntegrada } from './caidaAlHueco'

/**
 * [PULIDO 19] Q2 · LAS PIEZAS DEL PIE TAMBIÉN CAEN — después del logo, cada pieza del pie de volumen (los textos extruidos, las placas
 * del mail, WhatsApp y las redes, los enlaces del recorrido, la placa del formulario) baja de su lugar en la pared del pie hasta su
 * lugar en el piso y VUELCA hacia atrás sobre su canto de abajo y de atrás con la misma física que el logo (`caidaAlHueco.ts`: la
 * inclinación hasta pasar su equilibrio, θ'' = κ·sen(θ − α) con RK4, el rebote por restitución, asentada), con su propio κ (su alto y
 * su espesor en u). Queda al ras del piso, con la cara arriba. Todo es función de los segundos del reloj del final: el rebobinado la
 * deshace por el mismo camino. Puro (Node): la escena le da las piezas como números y lee poses como números.
 *
 * DÓNDE CAE CADA UNA (`lugaresEnElPiso`): la pared del pie son dos columnas a los lados del logo (la izquierda: el logotipo, el
 * titular, el contacto, el recorrido, las redes, la legal; la derecha: el formulario). Acostadas, cada columna se apila hacia atrás
 * en el orden en que estaba de pie (lo que estaba arriba queda más lejos), con `aire` entre piezas, centrada en el logo a lo largo
 * (la pila lo flanquea) y pegada a su lado del logo (con `aire`): vista desde arriba, la composición es la del pie, compacta; nada
 * cae sobre el logo ni sobre otra pieza. EL ORDEN: una onda desde el logo (`ondaUs`): cada pieza arranca al golpe más la distancia de
 * su lugar al centro, sobre la velocidad de la onda. LA BAJADA (`bajaS`): de su lugar en la pared (inclinada como la cámara) a su
 * lugar en el piso, enderezándose, con el trayecto de mínimo tirón (el de una mano que apoya algo), y ahí la física.
 *
 * Coordenadas: el mundo, con la base de la cámara de antes del final sin el mouse: `derecha` (horizontal), arriba (0, 1, 0) y
 * `atras` (horizontal, alejándose de la cámara). Una pieza de pie es su canto de abajo y de atrás (el medio) en el mundo y sus
 * medidas; acostada, su cara mira arriba y su cabeza apunta hacia `atras`. Lo que entra y sale son arreglos ya reservados.
 */
export const CAIDA_DEL_PIE = {
  /** La onda desde el logo (u/s): cuánto después del golpe arranca cada pieza, por la distancia de su lugar al centro del logo. */
  ondaUs: 18,
  /** La bajada hasta su lugar en el piso, enderezándose: el trayecto de mínimo tirón, al menos `bajaS` (s) y a lo sumo `bajaUs` (u/s de media). */
  bajaS: 0.45,
  bajaUs: 24,
  /** Entre piezas acostadas y hasta el logo (u). */
  aire: 0.5,
  /** Del cuadro que ocupa el pie acostado con el logo (la cámara desde arriba se queda a la distancia que lo deja entero). */
  margenDelCuadro: 0.86,
  /** Lo que el reloj sigue corriendo después de que la última pieza se asienta (s): el destello y la expansión de siempre. */
  despuesS: 1.2,
  /** Cuánto dura el final después del golpe (s): lo que tardan las piezas del pie de 1440 en asentarse y `despuesS` (era 1,7 sin ellas). */
  hastaS: 4.5,
  /** Un lugar inalcanzable (sin piezas): la distancia de la cámara es la de siempre. */
  sinPiezas: 0,
  /** Dos piezas a menos de esto de alto (u, de pie) están en la misma fila: acostadas van una al lado de la otra, no una detrás de otra. */
  mismaFila: 0.5,
  /** El alto del logo (u): una placa más alta cae con el tiempo comprimido por la raíz de la razón (la gravedad, por la razón): el formulario tardaría 2,7 s en tocar. */
  altoDelLogo: 4.78,
} as const

/** Cuánto más rápido corre el reloj de la caída de una pieza (1: como el logo; las más altas que el logo, más). */
export function rapidezDeLaCaida(p: PiezaDePie): number {
  return Math.max(1, Math.sqrt(p.alto / CAIDA_DEL_PIE.altoDelLogo))
}

/** Una pieza de pie: sus medidas (u) y el medio de su canto de abajo y de atrás en el mundo. */
export interface PiezaDePie {
  readonly ancho: number
  readonly alto: number
  readonly espesor: number
  readonly x: number
  readonly y: number
  readonly z: number
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

/** Su lugar en el piso: el medio del canto (x, z), cuándo arranca (s del reloj) y cuándo toca y se asienta (s del reloj). */
export interface LugarEnElPiso {
  x: number
  z: number
  /** Cuánto dura su bajada (s): por lo que viaja. */
  bajaS: number
  arranque: number
  toca: number
  asentada: number
  /** A qué lado (−1 izquierda, 1 derecha) y en qué puesto de su pila (0 el más cercano a la cámara). */
  lado: number
  puesto: number
}

export function crearLugar(): LugarEnElPiso {
  return { x: 0, z: 0, bajaS: CAIDA_DEL_PIE.bajaS, arranque: 0, toca: 0, asentada: 0, lado: 0, puesto: 0 }
}

const ORDEN = new Int32Array(64)
const ALTURA = new Float64Array(64)

/** A qué lado del logo está la pieza (por su canto, a lo largo de `derecha`). */
function ladoDe(p: PiezaDePie, b: BaseDelPie): number {
  return (p.x - b.logoX) * b.derechaX + (p.z - b.logoZ) * b.derechaZ < 0 ? -1 : 1
}

/** Cuánto hacia la derecha está el canto de la pieza respecto del logo (u), y cuánto hacia atrás. */
const aLaDerecha = (p: PiezaDePie, b: BaseDelPie): number => (p.x - b.logoX) * b.derechaX + (p.z - b.logoZ) * b.derechaZ

/**
 * Los lugares en el piso de todas las piezas (en `destino`, ya reservado, uno por pieza): las dos pilas, el orden y la onda. Devuelve
 * cuándo se asienta la última (s del reloj), o el golpe si no hay piezas. `caidas`: la caída integrada de cada pieza (por su tamaño).
 */
export function lugaresEnElPiso(piezas: readonly PiezaDePie[], cuantas: number, caidas: readonly CaidaIntegrada[], b: BaseDelPie, destino: readonly LugarEnElPiso[]): number {
  const n = Math.min(cuantas, piezas.length, destino.length, ORDEN.length)
  let ultima: number = CAIDA_AL_HUECO.golpeS
  for (let lado = -1; lado <= 1; lado += 2) {
    // Las de este lado, de abajo (de pie) hacia arriba: ordenadas por la altura de su canto (inserción: son pocas).
    let m = 0
    for (let i = 0; i < n; i += 1) {
      if (ladoDe(piezas[i], b) !== lado) continue
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
    // Las filas (las que estaban a la misma altura van una al lado de la otra) y el fondo total de la pila (el alto de cada fila y
    // el aire entre filas), centrada en el logo a lo largo de `atras`.
    let fondo = 0
    let filaAlto = 0
    for (let k = 0; k < m; k += 1) {
      if (k > 0 && ALTURA[k] - ALTURA[k - 1] > CAIDA_DEL_PIE.mismaFila) {
        fondo += filaAlto + CAIDA_DEL_PIE.aire
        filaAlto = 0
      }
      filaAlto = Math.max(filaAlto, piezas[ORDEN[k]].alto)
    }
    fondo += filaAlto
    // El borde de la pila pegado al logo: la pieza que más se acerca al logo (de pie) queda a `aire` de su huella; las demás, con
    // su mismo corrimiento (la alineación de la columna, como de pie).
    let masCerca = lado < 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
    for (let k = 0; k < m; k += 1) {
      const p = piezas[ORDEN[k]]
      const borde = aLaDerecha(p, b) - (lado * p.ancho) / 2
      masCerca = lado < 0 ? Math.max(masCerca, borde) : Math.min(masCerca, borde)
    }
    const corrimiento = lado * (b.logoAncho / 2 + CAIDA_DEL_PIE.aire) - masCerca
    let atras = -fondo / 2
    filaAlto = 0
    for (let k = 0; k < m; k += 1) {
      const i = ORDEN[k]
      const p = piezas[i]
      const l = destino[i]
      if (k > 0 && ALTURA[k] - ALTURA[k - 1] > CAIDA_DEL_PIE.mismaFila) {
        atras += filaAlto + CAIDA_DEL_PIE.aire
        filaAlto = 0
      }
      filaAlto = Math.max(filaAlto, p.alto)
      const derecha = aLaDerecha(p, b) + corrimiento
      // El canto queda en el frente de su lugar (la cabeza va hacia atrás).
      l.x = b.logoX + b.derechaX * derecha + b.atrasX * atras
      l.z = b.logoZ + b.derechaZ * derecha + b.atrasZ * atras
      l.lado = lado
      l.puesto = k
      const distancia = Math.hypot(derecha, atras + p.alto / 2)
      l.arranque = CAIDA_AL_HUECO.golpeS + distancia / CAIDA_DEL_PIE.ondaUs
      const c = caidas[i]
      const rapidez = rapidezDeLaCaida(p)
      l.bajaS = Math.max(CAIDA_DEL_PIE.bajaS, Math.hypot(l.x - p.x, FLOOR_Y - p.y, l.z - p.z) / CAIDA_DEL_PIE.bajaUs)
      const vuelca = l.arranque + l.bajaS
      l.toca = vuelca + (CAIDA_AL_HUECO.inclinaS + c.contactoS) / rapidez
      l.asentada = vuelca + (CAIDA_AL_HUECO.inclinaS + (Number.isFinite(c.asentadaS) ? c.asentadaS : c.contactoS)) / rapidez
      ultima = Math.max(ultima, l.asentada)
    }
  }
  return ultima
}

/** La caída integrada de una pieza (memorizada por tamaño en `caidaAlHueco.ts`). */
export function caidaDeLaPieza(p: PiezaDePie): CaidaIntegrada {
  return caidaIntegrada(p)
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** Lo que devuelve `poseDeLaPiezaQueCae` (el mismo objeto cada vez: sin reservas por cuadro). */
export const POSE_DE_LA_PIEZA = {
  /** Cuánto bajó de su lugar en la pared a su lugar en el piso (0 de pie en la pared, 1 en el piso, enderezada). */
  bajada: 0,
  /** El medio del canto en el mundo. */
  x: 0,
  y: 0,
  z: 0,
  /** El ángulo del cuerpo (0 de pie, π/2 acostada) y si ya tocó. */
  a: 0,
  toco: false,
}

/**
 * La pose de la pieza a los `s` del reloj del final: antes de su arranque, de pie en la pared; en la bajada, el canto va de su lugar
 * en la pared a su lugar en el piso con el trayecto de mínimo tirón (y `bajada` dice cuánto se enderezó); después, la física del
 * vuelco sobre el canto, que no se mueve más.
 */
export function poseDeLaPiezaQueCae(p: PiezaDePie, l: LugarEnElPiso, s: number): typeof POSE_DE_LA_PIEZA {
  const P = POSE_DE_LA_PIEZA
  const u = s - l.arranque
  if (u <= 0) {
    P.bajada = 0
    P.x = p.x
    P.y = p.y
    P.z = p.z
    P.a = 0
    P.toco = false
    return P
  }
  const b = suave(u / l.bajaS)
  P.bajada = b
  P.x = p.x + (l.x - p.x) * b
  P.y = p.y + (FLOOR_Y - p.y) * b
  P.z = p.z + (l.z - p.z) * b
  if (u <= l.bajaS) {
    P.a = 0
    P.toco = false
    return P
  }
  // El vuelco, con el reloj del logo corrido (y comprimido en las placas altas): la inclinación arranca al terminar la bajada
  // (`anguloEnElReloj` la pone `inclinaS` antes de su arranque).
  const c = caidaIntegrada(p)
  const reloj = (u - l.bajaS) * rapidezDeLaCaida(p) + arranqueDeLaCaida(p) - CAIDA_AL_HUECO.inclinaS
  const r = anguloEnElReloj(p, reloj)
  P.a = r.a
  P.toco = r.toco || reloj - arranqueDeLaCaida(p) >= c.contactoS
  return P
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
