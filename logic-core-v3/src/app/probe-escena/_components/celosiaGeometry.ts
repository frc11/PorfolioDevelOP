import { CELOSIA_NO_PENUMBRA, celosiaPenumbraAt, type CelosiaPenumbra } from './celosiaPenumbra'
import { bandEnvelope } from './moireTextures'
import {
  MOIRE_COARSE_CELLS,
  MOIRE_FADE,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_NEAR_BOTTOM,
  MOIRE_NEAR_RADIUS,
  MOIRE_NEAR_TOP,
  fineCells,
} from './probeMoire'

/**
 * LA GEOMETRÍA DE LA PROYECCIÓN (S11) — dónde cruza el rayo al sol cada capa.
 *
 * Es el gemelo en TypeScript del shader (`celosiaShader.ts`) y el instrumento con
 * el que se mide todo lo que S11 publica. Los dos hacen la MISMA cuenta, y una
 * comprobación verifica que los números que consumen sean los mismos.
 *
 * Vive aparte de `probeCelosia.ts` por el mismo seam que `probeMoire.ts` ↔
 * `moireTextures.ts`: allá están los números y su razonamiento, acá cómo se
 * calculan.
 *
 * ── La regla dura de este archivo ──────────────────────────────────────────
 *
 * **Nada de la trama se redefine acá.** Radios, bandas, celdas por vuelta,
 * desajuste y desvanecido se LEEN de `probeMoire.ts`. Si mañana cambia un radio
 * o una cantidad de celdas, la proyección —y con ella el factor de cielo— se
 * mueve sola. Este sprint consume la rendija, no la cambia.
 */

/** Una capa de la celosía, vista como ocluyente. Todo sale de `probeMoire.ts`. */
export type CelosiaLayer = {
  readonly radius: number
  readonly bottom: number
  readonly top: number
  readonly cells: number
  /** La capa gruesa es la que baja: su fase vertical lleva la deriva. */
  readonly drifts: boolean
}

/**
 * Las dos capas, con el desajuste ya aplicado a la fina. El orden es el mismo
 * que en `MoireScreen`: fina adelante, gruesa atrás.
 */
export function celosiaLayers(mismatch: number): readonly [CelosiaLayer, CelosiaLayer] {
  return [
    {
      radius: MOIRE_NEAR_RADIUS,
      bottom: MOIRE_NEAR_BOTTOM,
      top: MOIRE_NEAR_TOP,
      cells: fineCells(mismatch),
      drifts: false,
    },
    {
      radius: MOIRE_FAR_RADIUS,
      bottom: MOIRE_FAR_BOTTOM,
      top: MOIRE_FAR_TOP,
      cells: MOIRE_COARSE_CELLS,
      drifts: true,
    },
  ]
}

export type Point3 = readonly [number, number, number]

/** Dónde y con qué fase el rayo cruza una capa. */
export type CelosiaCrossing = {
  /** Fase horizontal, en celdas. La barra vive en los enteros. */
  readonly u: number
  /** Fase vertical, en celdas, con la deriva ya sumada. */
  readonly v: number
  /** El desvanecido de banda de la capa en ese punto. */
  readonly envelope: number
  /** Distancia a la que cruza, en unidades de mundo. */
  readonly t: number
  /**
   * El ancho de penumbra en ese cruce, en celdas, una por familia de barras
   * (S12). Con el sol sin tamaño angular es `{u: 0, v: 0}` y el borde vuelve a
   * ser el de S11. Ver `celosiaPenumbra.ts`.
   */
  readonly penumbra: CelosiaPenumbra
}

/**
 * Los cruces de un rayo contra una capa, ordenados por distancia.
 *
 * ⚠️ **Son DOS, y el segundo no es un detalle.** Desde un punto de adentro del
 * cilindro hay un solo cruce (la salida). Desde uno de AFUERA —el ciclorama más
 * allá de radio 38— el rayo al sol puede entrar y volver a salir, o sea que esa
 * superficie está tapada dos veces. Sin el segundo cruce, la pared del lado del
 * sol quedaría iluminada pareja mientras la de enfrente lleva bandas.
 */
export function celosiaCrossings(
  point: Point3,
  sun: Point3,
  layer: CelosiaLayer,
  drift: number,
  spread = 0
): readonly CelosiaCrossing[] {
  const a = sun[0] * sun[0] + sun[2] * sun[2]
  if (a <= 1e-8) return []
  const b = 2 * (point[0] * sun[0] + point[2] * sun[2])
  const c = point[0] * point[0] + point[2] * point[2] - layer.radius * layer.radius
  const disc = b * b - 4 * a * c
  if (disc < 0) return []

  const root = Math.sqrt(disc)
  const found: CelosiaCrossing[] = []
  const pitch = (2 * Math.PI * layer.radius) / layer.cells
  const height = layer.top - layer.bottom

  for (const t of [(-b - root) / (2 * a), (-b + root) / (2 * a)]) {
    if (t <= 1e-4) continue
    const y = point[1] + sun[1] * t
    if (y < layer.bottom || y > layer.top) continue
    const x = point[0] + sun[0] * t
    const z = point[2] + sun[2] * t
    found.push({
      u: (Math.atan2(x, z) / (2 * Math.PI)) * layer.cells,
      v: (y - layer.bottom) / pitch + (layer.drifts ? drift : 0),
      envelope: bandEnvelope((y - layer.bottom) / height, MOIRE_FADE),
      t,
      penumbra:
        spread > 0
          ? celosiaPenumbraAt([x, y, z], sun, layer.radius, pitch, t, spread)
          : CELOSIA_NO_PENUMBRA,
    })
  }

  return found
}

/**
 * La barra, sin filtrar: 1 adentro, 0 afuera. La barra está CENTRADA en los
 * enteros de la fase, igual que la línea de la trama está centrada en el borde
 * de la celda (ver `moireTextures.ts`).
 */
export function celosiaBarAt(phase: number, bar: number): number {
  return Math.abs(phase - Math.round(phase)) < bar / 2 ? 1 : 0
}

/**
 * La barra FILTRADA, que es lo que corre en el shader.
 *
 * `footprint` es la huella del fragmento en celdas (`fwidth` de la fase). Con
 * huella chica devuelve la barra dura; a partir de media celda la reemplaza por
 * su propia media, que es exactamente lo que hace un mipmap cuando la trama deja
 * de resolverse. Sin esto la vía analítica titilaría en los rayos rasantes — el
 * 0,015% de los rayos que tocan piso, medido sobre los cinco recorridos.
 */
export function celosiaBarFiltered(phase: number, bar: number, footprint: number): number {
  const w = Math.max(footprint, 1e-5)
  const d = Math.abs(phase - Math.round(phase))
  const hard = Math.min(1, Math.max(0, (bar / 2 - d) / w + 0.5))
  const blend = Math.min(1, Math.max(0, w * 2 - 1))
  return hard + (bar - hard) * blend
}

/** Qué fracción de la celda tapa la barra en las DOS direcciones. */
export function celosiaCoverage(bar: number): number {
  return 1 - (1 - bar) * (1 - bar)
}

/**
 * Transmitancia de la celosía hacia el sol, con el patrón. 1 = luz plena.
 *
 * Es el gobo: lo que multiplica al aporte de la key en cada fragmento.
 */
export function celosiaTransmittance(
  point: Point3,
  sun: Point3,
  bar: number,
  mismatch: number,
  drift = 0,
  spread = 0
): number {
  let transmittance = 1
  for (const layer of celosiaLayers(mismatch)) {
    for (const crossing of celosiaCrossings(point, sun, layer, drift, spread)) {
      // El gemelo no tiene derivadas de pantalla, así que su ancho de borde es
      // SOLO la penumbra: es el shader con un píxel infinitesimal. Con el sol
      // sin tamaño el perfil vuelve a ser binario — el control de S12.
      const mark = Math.max(
        celosiaBarFiltered(crossing.u, bar, crossing.penumbra.u),
        celosiaBarFiltered(crossing.v, bar, crossing.penumbra.v)
      )
      transmittance *= 1 - crossing.envelope * mark
    }
  }
  return transmittance
}

/**
 * Transmitancia MEDIA en una dirección: la misma cuenta sin el patrón, o sea con
 * la barra promediada sobre la celda.
 *
 * Es lo que corresponde para una fuente ANCHA. La key es el sol —medio grado
 * contra una celda de 3,5°— así que da sombra dura y usa la de arriba; el cielo
 * es la fuente más ancha que existe y usa ésta.
 *
 * Reimplementa el cruce en vez de llamar a `celosiaCrossings` por una razón de
 * costo: la integral del cielo la evalúa **decenas de miles de veces al cargar el
 * módulo**, y devolver un array por cruce dejaría esa cantidad de objetos al
 * recolector en el arranque de la página. Acá no asigna nada.
 */
export function celosiaMeanTransmittance(
  point: Point3,
  direction: Point3,
  coverage: number,
  layers: readonly CelosiaLayer[]
): number {
  const a = direction[0] * direction[0] + direction[2] * direction[2]
  if (a <= 1e-8) return 1
  let transmittance = 1

  for (const layer of layers) {
    const b = 2 * (point[0] * direction[0] + point[2] * direction[2])
    const c = point[0] * point[0] + point[2] * point[2] - layer.radius * layer.radius
    const disc = b * b - 4 * a * c
    if (disc < 0) continue
    const root = Math.sqrt(disc)
    const height = layer.top - layer.bottom
    for (let side = 0; side < 2; side += 1) {
      const t = (-b + (side === 0 ? -root : root)) / (2 * a)
      if (t <= 1e-4) continue
      const y = point[1] + direction[1] * t
      if (y < layer.bottom || y > layer.top) continue
      transmittance *= 1 - bandEnvelope((y - layer.bottom) / height, MOIRE_FADE) * coverage
    }
  }

  return transmittance
}

/**
 * EL FACTOR DE CIELO, integrado de verdad: qué fracción de la irradiancia del
 * hemisferio superior le llega a un punto con la celosía en el medio.
 *
 * Muestreo por coseno (que es el peso con el que un difuso Lambert ve el cielo)
 * con una secuencia de baja discrepancia — determinista, sin `Math.random`, así
 * que dos corridas dan el mismo número.
 *
 * **Es la referencia, no lo que corre en runtime**: en runtime va la forma
 * cerrada de `probeCelosia.ts`, y una comprobación verifica que coincidan.
 */
export function celosiaSkyIntegral(
  point: Point3,
  coverage: number,
  mismatch: number,
  samples = 8000
): number {
  const layers = celosiaLayers(mismatch)
  const golden = 0.618033988749895
  const direction: [number, number, number] = [0, 0, 0]
  let sum = 0
  for (let i = 0; i < samples; i += 1) {
    const u1 = (i + 0.5) / samples
    const u2 = (i * golden) % 1
    const radius = Math.sqrt(u1)
    const phi = 2 * Math.PI * u2
    direction[0] = radius * Math.cos(phi)
    direction[1] = Math.sqrt(Math.max(0, 1 - u1))
    direction[2] = radius * Math.sin(phi)
    sum += celosiaMeanTransmittance(point, direction, coverage, layers)
  }
  return sum / samples
}

/**
 * Ω: EL ÚNICO NÚMERO DE LA FORMA CERRADA DEL CIELO, sacado de la geometría.
 *
 * `cielo(barra) = 1 − Ω · (1 − (1 − cobertura)²)`. Ω se elige por mínimos
 * cuadrados contra la integral de hemisferio **evaluada sobre todo el rango del
 * slider**, y no tomando un solo punto: el modelo de un factor no es exacto —el
 * desvanecido de banda hace que el producto de las dos capas no sea lineal en la
 * cobertura— y ajustarlo en un extremo dejaría el otro con el doble de error.
 *
 * Se calcula UNA vez, al cargar el módulo, y por eso **si mañana cambian los
 * radios, las bandas, las celdas o el desvanecido en `probeMoire.ts`, Ω se mueve
 * solo.** No hay ningún 0,4x escrito a mano en el repo.
 *
 * El ajuste es lineal en Ω, así que sale de una división y no de una búsqueda.
 */
export function fitCelosiaSkyShare(point: Point3, mismatch: number, samples = 2400): number {
  let num = 0
  let den = 0
  for (let i = 1; i <= 10; i += 1) {
    const bar = i / 20
    const open = 1 - celosiaCoverage(bar)
    const x = 1 - open * open
    const sky = celosiaSkyIntegral(point, celosiaCoverage(bar), mismatch, samples)
    num += x * (1 - sky)
    den += x * x
  }
  return den > 0 ? num / den : 0
}
