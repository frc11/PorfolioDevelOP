/**
 * COMPROBACIONES DE S11 · lo que la celosía dibuja.
 *
 *     npx tsx src/app/probe-escena/__tests__/s11-proyeccion.invariant.ts
 *
 * Los números que dicen si esto se lee como un día pasando o como una textura:
 *
 *   1. **El alcance.** La celosía no tapa toda la losa todo el tiempo, y eso lo
 *      destapó un control positivo que falló — ver la nota larga abajo.
 *   2. **El paso proyectado, el batido y el estiramiento.**
 *   3. **El barrido**: cuántas bandas le pasan por encima a un punto del piso.
 *
 * Todo esto está en unidades de MUNDO. Cómo cae en pantalla —el batido en píxeles
 * por pose y el aliasing con su filtro— está en `s11-pantalla.invariant.ts`.
 */
import { celosiaCrossings, celosiaLayers } from '@/app/v3/_lib/escena/celosiaGeometry'
import { sampleLightArc } from '@/app/v3/_lib/escena/choreographySampler'
import type { MutableLightLevels } from '@/app/v3/_lib/escena/choreographyTypes'
import {
  MOIRE_COARSE_CELLS,
  MOIRE_DRIFT_PERIOD_S,
  MOIRE_FAR_RADIUS,
  MOIRE_MISMATCH,
  MOIRE_NEAR_RADIUS,
  fineCells,
} from '@/app/v3/_lib/escena/probeMoire'
import { FLOOR_Y, check, report, section, type Vec3 } from './harness'
import { sunDirectionAt } from './shading'

const RAD = Math.PI / 180
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }
const LAYERS = celosiaLayers(MOIRE_MISMATCH)

/** El azimut del sol en un progreso. Sirve para orientar tangente y radial. */
function sunAzimuthAt(p: number): number {
  sampleLightArc(p, arc)
  return arc.azimuthDeg * RAD
}

/** Gradiente de la fase de una capa al moverse sobre el piso, en celdas/unidad. */
function phaseGradient(point: Vec3, sun: Vec3, layer: (typeof LAYERS)[number], step: Vec3): number {
  const eps = 0.002
  const here = celosiaCrossings(point, sun, layer, 0)[0]
  const there = celosiaCrossings(
    [point[0] + step[0] * eps, point[1], point[2] + step[2] * eps],
    sun,
    layer,
    0
  )[0]
  if (!here || !there) return NaN
  return Math.hypot((there.u - here.u) / eps, (there.v - here.v) / eps)
}

// ── 1 · El alcance ──────────────────────────────────────────────────────────

section('El alcance: hasta dónde de la losa llega la celosía')

{
  function crossedFrom(point: Vec3, sun: Vec3): number {
    let crossed = 0
    for (const layer of LAYERS) {
      if (celosiaCrossings(point, sun, layer, 0).length > 0) crossed += 1
    }
    return crossed
  }

  /**
   * ⚠️ **CONTROL POSITIVO.** "El rayo cruza las dos capas" es exactamente el tipo
   * de afirmación que un instrumento roto contesta que sí. Antes de creerle hay
   * que verlo decir que NO cuando corresponde: con el sol en el cenit el rayo sale
   * por encima del tope de las dos bandas.
   */
  check(
    'el instrumento sabe decir que NO cruza: con el sol en el cenit el rayo sale por arriba',
    crossedFrom([0, FLOOR_Y, 0], [0, 1, 0]) === 0,
    `las bandas terminan en y = ${LAYERS[0].top} y ${LAYERS[1].top}`
  )

  let centerAlwaysBoth = true
  for (let i = 0; i <= 200; i += 1) {
    if (crossedFrom([0, FLOOR_Y, 0], sunDirectionAt(i / 200)) !== 2) centerAlwaysBoth = false
  }
  check(
    'desde el centro de la losa el rayo cruza las DOS capas en todo el arco',
    centerAlwaysBoth,
    'con una sola capa habría bandas pero no moiré'
  )

  /**
   * ⚠️ **LA CELOSÍA TIENE ALCANCE, Y ESTE CONTROL POSITIVO ES EL QUE LO DESTAPÓ.**
   *
   * La primera versión de este chequeo afirmaba "desde CUALQUIER punto de la losa
   * el rayo cruza las dos capas" y **falló**, en el borde y en la meseta. No era
   * el instrumento: es geometría. Los cilindros están abiertos arriba, así que la
   * luz de un sol a 36° entra por encima del tope de la capa cercana (y = 34) y
   * cae sobre la parte de la losa OPUESTA al sol. La sombra de ese borde llega
   * 52,7 unidades desde la pared, y la losa mide 68 de diámetro.
   *
   * **No es un defecto: es la misma cuenta que alarga la sombra del logo.** El
   * alcance se abre con el arco —82% de la losa durante toda la meseta, 95% en
   * Trabajos, 100% desde p=0,875— así que la creciente de sol abierto se cierra a
   * medida que atardece. Es otra forma del mismo reloj, y **está adentro de todos
   * los valores medios que este sprint publica**.
   *
   * Lo que el chequeo protege es la DIRECCIÓN: el alcance no puede achicarse.
   */
  function reachAt(p: number): number {
    const sun = sunDirectionAt(p)
    let both = 0
    let total = 0
    const N = 90
    for (let i = 0; i < N; i += 1) {
      for (let j = 0; j < N; j += 1) {
        const x = ((i + 0.5) / N) * 68 - 34
        const z = ((j + 0.5) / N) * 68 - 34
        if (Math.hypot(x, z) > 34) continue
        total += 1
        if (crossedFrom([x, FLOOR_Y, z], sun) === 2) both += 1
      }
    }
    return both / total
  }

  const reach = [0, 0.25, 0.5, 0.625, 0.75, 0.875, 1].map(reachAt)
  // La tolerancia es de la GRILLA, no del fenómeno: durante la meseta la elevación
  // no se mueve, así que el alcance es constante y lo único que varía es qué
  // muestras del tablero de 90×90 caen adentro del disco cuando el azimut rota.
  check(
    'el alcance nunca se achica: se abre con el atardecer',
    reach.every((value, i) => i === 0 || value >= reach[i - 1] - 0.005),
    reach.map((value) => `${(value * 100).toFixed(1)}%`).join(' → ')
  )
  check(
    'y termina cubriendo la losa entera antes del cierre',
    reach[reach.length - 1] > 0.999 && reach[0] > 0.8,
    `arranca en ${(reach[0] * 100).toFixed(1)}% y cierra en ${(reach[reach.length - 1] * 100).toFixed(1)}% — la creciente de sol abierto es la parte de la losa opuesta al sol, y se cierra sola`
  )
}

// ── 2 · El paso proyectado y el batido ──────────────────────────────────────

section('Lo que la celosía dibuja sobre el piso')

{
  const rows: string[] = []
  const beats: number[] = []
  const fineRadial: number[] = []

  for (const p of [0, 0.5, 0.75, 1]) {
    const sun = sunDirectionAt(p)
    const azimuth = sunAzimuthAt(p)
    const tangent: Vec3 = [Math.cos(azimuth), 0, -Math.sin(azimuth)]
    const radial: Vec3 = [Math.sin(azimuth), 0, Math.cos(azimuth)]
    const origin: Vec3 = [0, FLOOR_Y, 0]

    const gt = LAYERS.map((layer) => phaseGradient(origin, sun, layer, tangent))
    const gr = LAYERS.map((layer) => phaseGradient(origin, sun, layer, radial))
    const beat = 1 / Math.abs(gt[0] - 2 * gt[1])
    beats.push(beat)
    fineRadial.push(1 / gr[0])
    rows.push(
      `p=${p.toFixed(2)} celda ${(1 / gt[0]).toFixed(2)}×${(1 / gr[0]).toFixed(2)} · batido ${beat.toFixed(1)} tang`
    )
  }

  check(
    'la celda proyectada mide su propio paso a lo ancho, y ése no cambia con el arco',
    beats.every((value) => Math.abs(value - beats[0]) < 0.05),
    rows.join(' · ')
  )
  check(
    'el batido tangencial cae donde entran unas pocas bandas en la losa',
    beats[0] > 10 && beats[0] < 25,
    `${beats[0].toFixed(1)} de mundo → ${(68 / beats[0]).toFixed(1)} bandas a lo ancho de la losa (68)`
  )
  check(
    'y el desajuste lo mueve, aunque sobre el piso mande la separación de radios',
    1 /
      Math.abs(
        phaseGradient([0, FLOOR_Y, 0], sunDirectionAt(0), celosiaLayers(12)[0], [1, 0, 0]) -
          2 * phaseGradient([0, FLOOR_Y, 0], sunDirectionAt(0), celosiaLayers(12)[1], [1, 0, 0])
      ) <
      beats[0],
    `la relación de pasos proyectados es (${MOIRE_FAR_RADIUS}/${MOIRE_COARSE_CELLS})·(${fineCells(MOIRE_MISMATCH)}/${MOIRE_NEAR_RADIUS}) = ${(((MOIRE_FAR_RADIUS / MOIRE_COARSE_CELLS) * fineCells(MOIRE_MISMATCH)) / MOIRE_NEAR_RADIUS).toFixed(3)}, lejos de 2 con desajuste o sin él`
  )
  check(
    'las bandas se ALARGAN con el arco, y la razón es la de la sombra del logo',
    fineRadial[fineRadial.length - 1] / fineRadial[0] > 3.5,
    `de ${fineRadial[0].toFixed(2)} a ${fineRadial[fineRadial.length - 1].toFixed(2)} de largo · ×${(fineRadial[fineRadial.length - 1] / fineRadial[0]).toFixed(1)}`
  )
}

// ── 3 · El barrido ──────────────────────────────────────────────────────────

section('El barrido: cuántas bandas le pasan por encima a un punto del piso')

{
  function sweptCells(point: Vec3): number {
    let total = 0
    let previous: number | null = null
    for (let i = 0; i <= 400; i += 1) {
      const crossing = celosiaCrossings(point, sunDirectionAt(i / 400), LAYERS[0], 0)[0]
      if (!crossing) {
        previous = null
        continue
      }
      const value = crossing.u + crossing.v
      if (previous !== null) total += Math.abs(value - previous)
      previous = value
    }
    return total
  }

  const center = sweptCells([0, FLOOR_Y, 0])
  const rim = sweptCells([25, FLOOR_Y, 0])
  const cellWidth = (2 * Math.PI * MOIRE_NEAR_RADIUS) / fineCells(MOIRE_MISMATCH)
  check(
    'sobre el centro de la losa pasan decenas de bandas: es un barrido, no una deriva',
    center > 40,
    `${center.toFixed(1)} celdas finas = ${(center * cellWidth).toFixed(0)} unidades de mundo de banda pasando por encima`
  )
  check(
    'y el barrido es del ARCO: sale de los 180° de azimut, no de la deriva',
    Math.abs(center - (180 / 360) * fineCells(MOIRE_MISMATCH)) < 1,
    `${center.toFixed(1)} contra las ${((180 / 360) * fineCells(MOIRE_MISMATCH)).toFixed(1)} que predicen los 180° de barrido — el patrón está anclado al azimut del sol`
  )
  check(
    'también barre lejos del centro, aunque menos',
    rim > 15 && rim < center,
    `${rim.toFixed(1)} celdas a 25 de radio contra ${center.toFixed(1)} en el centro`
  )

  /**
   * Y con la escena quieta el batido igual se mueve: la deriva corre la capa
   * gruesa una celda cada `MOIRE_DRIFT_PERIOD_S`, y el batido —que es la
   * diferencia de fases— avanza DOS períodos por cada uno de ella.
   */
  const drifted = celosiaCrossings([0, FLOOR_Y, 0], sunDirectionAt(0), LAYERS[1], 0.5)[0]
  const still = celosiaCrossings([0, FLOOR_Y, 0], sunDirectionAt(0), LAYERS[1], 0)[0]
  check(
    'la deriva de la capa gruesa entra en la proyección: la sombra baja con la rendija',
    drifted !== undefined && still !== undefined && Math.abs(drifted.v - still.v - 0.5) < 1e-9,
    `media celda de deriva mueve media celda la fase de la sombra · el batido avanza 2/${MOIRE_DRIFT_PERIOD_S} de período por segundo, unas 5,5 veces más rápido que la trama`
  )
}

report('s11 · lo que la celosía dibuja')
