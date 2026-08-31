import { celosiaCrossings, celosiaLayers, celosiaTransmittance } from '@/app/v3/_lib/escena/celosiaGeometry'
import { CELOSIA_BAR, celosiaSkyFactor } from '@/app/v3/_lib/escena/probeCelosia'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'
import { PAPER_COLOR } from '@/app/v3/_lib/escena/probeScene'

import { TAN_HALF_V, cameraAt, emptyPose, type Vec3 } from './harness'
import { rayFloor, track } from './frameProbe'
import { shadeSurface, sunDirectionAt, type ViewContext } from './shading'

/**
 * EL BATIDO DEL PISO, MEDIDO — el instrumento que S11 no dejó.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ ESTE ARCHIVO EXISTE, Y LA REGLA QUE LO OBLIGA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * S11 publicó cuatro números de amplitud de batido —**10,8 / 7,1 / 13,1 / 6,5
 * puntos sRGB** en hero / números / trabajos / cierre— y **ninguno tiene
 * instrumento en el repo**. Viven en la prosa de `outputs/S11-LUZ.md` §4.2 y en
 * un string de `s11-celosia.invariant.ts`; su commit no agregó un solo script
 * que los produzca (`git log --diff-filter=AD` sobre `__tests__/`). **No son
 * reproducibles y por lo tanto no son comparables contra nada.**
 *
 * > **Regla del proyecto, desde S12: una cifra que se publica en un reporte y no
 * > tiene instrumento que la produzca es PROSA, no medición.** Si hay que
 * > compararla más adelante, no se puede. Si hay que defenderla, tampoco.
 *
 * Los números que valen desde acá son los que devuelve esta función, con el
 * método declarado abajo y con su propia columna de α = 0 como control.
 *
 * ── El método, entero, porque el número depende de él ──────────────────────
 *
 * Se recorre el piso a lo largo de **la tangente al azimut del sol** —la
 * dirección en la que corre el batido— arrancando del punto de piso más cercano
 * al centro del cuadro. En cada muestra se sombrea el papel con el gobo de ESE
 * punto, o sea la misma cuenta que hace el shader.
 *
 * - **portadora** = `max − min` del perfil crudo. Es el contraste de la banda
 *   misma: cuánto separa el papel iluminado del papel bajo una barra.
 * - **batido** = `max − min` de la media móvil de **una celda GRUESA
 *   proyectada**. La celda gruesa es el período de portadora más largo de los
 *   dos, así que es la ventana más CORTA que borra las dos tramas y deja solo su
 *   envolvente. Con una ventana de celda fina el número queda contaminado por la
 *   trama gruesa: en el hero da 20,3 sobre una portadora de 28,6, que es casi
 *   todo residuo de portadora.
 *
 * ⚠️ **El batido depende del tramo barrido, y hay que decirlo.** Con 3 períodos
 * el hero da 12,3, con 5 da 23,1 y con 7 da 28,6 —la portadora entera—, porque
 * cuanto más largo el barrido más cerca se pasa de un nodo perfectamente en
 * fase. `BEAT_PERIODS` fija el tramo en **5**, que es el más largo en el que
 * ninguna de las cuatro poses satura. **El número que decide no es el absoluto:
 * es el cambio contra el control de α = 0 al MISMO tramo.** La portadora, en
 * cambio, no depende del tramo, y por eso es la lectura limpia del contraste.
 */

const ASPECT = 16 / 9
const LAYERS = celosiaLayers(MOIRE_MISMATCH)
const UP: Vec3 = [0, 1, 0]

/** Tramo barrido, en períodos de batido. Ver la nota de arriba. */
export const BEAT_PERIODS = 5
/** Muestras por celda fina proyectada. */
export const BEAT_SAMPLES_PER_CELL = 24

/** Una pose del recorrido, como la consumen las suites: nombre y encuadre. */
export type BeatPose = readonly [name: string, at: number, azimuthDeg: number, height: number]

/**
 * Las cuatro poses con piso en cuadro. Son las mismas cuatro en las que S11 dijo
 * haber medido el batido.
 */
export const BEAT_POSES: readonly BeatPose[] = [
  ['hero', 0, 0, 6.4],
  ['números', 0.5, 185, 9],
  ['trabajos', 0.625, 195, 4.5],
  ['cierre', 0.95, 360, -1.4],
]

/** El punto del piso más cercano al centro del cuadro, y su profundidad. */
export function floorAtCenter(at: number): { point: Vec3; depth: number } | null {
  const cam = cameraAt(track, at, ASPECT, emptyPose())
  for (let k = 0; k <= 20; k += 1) {
    const ny = -(k / 20) * TAN_HALF_V
    const raw: Vec3 = [
      cam.forward[0] + cam.up[0] * ny,
      cam.forward[1] + cam.up[1] * ny,
      cam.forward[2] + cam.up[2] * ny,
    ]
    const length = Math.hypot(raw[0], raw[1], raw[2])
    const dir: Vec3 = [raw[0] / length, raw[1] / length, raw[2] / length]
    const t = rayFloor(cam.position, dir)
    if (isFinite(t)) {
      return {
        point: [
          cam.position[0] + dir[0] * t,
          cam.position[1] + dir[1] * t,
          cam.position[2] + dir[2] * t,
        ],
        depth: t,
      }
    }
  }
  return null
}

/** La derivada de la fase `u` de una capa a lo largo de una dirección del piso. */
function phaseSlope(p: Vec3, sun: Vec3, layer: (typeof LAYERS)[number], step: Vec3): number {
  const eps = 0.01
  const a = celosiaCrossings(p, sun, layer, 0)[0]
  const b = celosiaCrossings([p[0] + step[0] * eps, p[1], p[2] + step[2] * eps], sun, layer, 0)[0]
  if (!a || !b) return NaN
  return (b.u - a.u) / eps
}

/** El recorrido de la media móvil de ventana `window`: su máximo menos su mínimo. */
function movingRange(values: readonly number[], window: number): number {
  const w = Math.max(2, Math.round(window))
  if (w >= values.length) return 0
  let best = -Infinity
  let worst = Infinity
  for (let i = 0; i + w <= values.length; i += 1) {
    let sum = 0
    for (let k = 0; k < w; k += 1) sum += values[i + k]
    const mean = sum / w
    if (mean > best) best = mean
    if (mean < worst) worst = mean
  }
  return best - worst
}

export type BeatSample = {
  /** Contraste de la banda misma, en puntos sRGB. No depende del tramo barrido. */
  readonly carrier: number
  /** Modulación de la banda entre nodos, en puntos sRGB. Depende del tramo. */
  readonly beat: number
  /** Paso proyectado de la capa fina a lo largo de la tangente, en mundo. */
  readonly fineCell: number
  /** Ídem la gruesa: es la ventana con la que se saca la portadora. */
  readonly coarseCell: number
  /** Período del batido a lo largo de la tangente, en mundo. */
  readonly beatCell: number
}

/**
 * La portadora y el batido en una pose, con el sol de radio angular `spread`
 * (ya como `2·tan(α)`; 0 = el borde filoso de S11).
 *
 * `periods` existe para poder MOSTRAR la dependencia del tramo, no para
 * calibrarla: las suites usan el default.
 */
export function celosiaBeatAt(
  pose: BeatPose,
  spread: number,
  periods = BEAT_PERIODS
): BeatSample | null {
  const [, at, azimuthDeg, height] = pose
  const hit = floorAtCenter(at)
  if (!hit) return null
  const sun = sunDirectionAt(at)
  const view: ViewContext = { progress: at, cameraAzimuthDeg: azimuthDeg, cameraHeight: height }
  const sky = celosiaSkyFactor(CELOSIA_BAR)

  const sunAzimuth = Math.atan2(sun[0], sun[2])
  const tangent: Vec3 = [Math.cos(sunAzimuth), 0, -Math.sin(sunAzimuth)]
  const g = LAYERS.map((layer) => phaseSlope(hit.point, sun, layer, tangent))
  const fineCell = Math.abs(1 / g[0])
  const coarseCell = Math.abs(1 / g[1])
  const beatCell = Math.abs(1 / (g[0] - 2 * g[1]))
  if (!isFinite(fineCell) || !isFinite(coarseCell) || !isFinite(beatCell)) return null

  const span = periods * beatCell
  const total = Math.round((span / fineCell) * BEAT_SAMPLES_PER_CELL)
  const values: number[] = []
  for (let i = 0; i < total; i += 1) {
    const s = (i / total) * span - span / 2
    const p: Vec3 = [hit.point[0] + tangent[0] * s, hit.point[1], hit.point[2] + tangent[2] * s]
    const gobo = celosiaTransmittance(p, sun, CELOSIA_BAR, MOIRE_MISMATCH, 0, spread)
    values.push(shadeSurface(PAPER_COLOR, UP, view, hit.depth, gobo, sky))
  }

  return {
    carrier: Math.max(...values) - Math.min(...values),
    beat: movingRange(values, (coarseCell * total) / span),
    fineCell,
    coarseCell,
    beatCell,
  }
}
