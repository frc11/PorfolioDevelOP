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
    'control positivo — el instrumento sabe decir que NO cruza: con el sol en el cenit sale por arriba',
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

  const PROGRESOS = [0, 0.25, 0.5, 0.625, 0.75, 0.875, 1]
  const reach = PROGRESOS.map(reachAt)
  const elevacion = PROGRESOS.map((p) => {
    sampleLightArc(p, arc)
    return arc.elevationDeg
  })
  /**
   * ⚠️ **B8 · CUSTODIABA «el alcance nunca se achica: se abre con el atardecer».**
   * Era cierto para una tarde monótona. B8 pone la noche en Trabajos —un sol
   * rasante a 2,7°— y ahí el rayo desde media losa sale por encima de la capa
   * cercana: el alcance cae al 52 % y vuelve al 100 % con la mañana. Lo que la
   * afirmación siempre custodió es que el alcance sea GEOMETRÍA y no un
   * artefacto: es función de la elevación y de nada más —a igual elevación,
   * igual alcance, de a pares—, en las poses con luz no se achica, y en la
   * noche se publica: con la key al 8 %, la creciente de sol abierto no se ve.
   *
   * La tolerancia de los pares es de la GRILLA, no del fenómeno: a elevación
   * fija lo único que varía es qué muestras del tablero de 90×90 caen adentro
   * del disco cuando el azimut rota.
   */
  check(
    'el alcance es función de la elevación y de nada más: a igual elevación, igual alcance (la meseta y la noche, de a pares)',
    Math.abs(reach[0] - reach[1]) < 0.005 && Math.abs(reach[2] - reach[3]) < 0.005 && elevacion[0] === elevacion[1] && elevacion[2] === elevacion[3],
    PROGRESOS.map((p, i) => `p=${p} ${elevacion[i].toFixed(1)}° → ${(reach[i] * 100).toFixed(1)}%`).join(' · ')
  )
  check(
    'en las poses con luz no se achica: 82 % en la meseta y la losa entera desde que amanece',
    reach[0] > 0.8 && reach.slice(4).every((value) => value > 0.999),
    `${(reach[0] * 100).toFixed(1)}% a 36° → ${reach.slice(4).map((value) => `${(value * 100).toFixed(1)}%`).join(' → ')} a ${elevacion.slice(4).map((e) => `${e.toFixed(1)}°`).join(' → ')}`
  )
  check(
    '  y en la noche el sol rasante cruza las dos capas sólo desde media losa: se publica, y no se ve — la key está al 8 %',
    reach[2] < reach[0] && reach[2] > 0.4,
    `${(reach[2] * 100).toFixed(1)}% a ${elevacion[2].toFixed(1)}° — el rayo desde el lado opuesto al sol sale por encima de la capa cercana antes de cruzarla`
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
  /**
   * ⚠️ **B8 · CUSTODIABA «se alargan con el arco ×3,5 de punta a punta».** Con
   * la noche en el medio (p=0,5, el segundo de los cuatro progresos) la banda
   * más larga está ahí —un sol rasante la estira más de ×10— y en el cierre
   * queda más larga que a mediodía sin volver a la de la noche. La razón sigue
   * siendo la de la sombra del logo: 1/tan(elevación), y se afirma como cuenta.
   */
  const tanDe = (p: number): number => {
    sampleLightArc(p, arc)
    return Math.tan(arc.elevationDeg * RAD)
  }
  check(
    'las bandas se ALARGAN hasta la noche —un sol rasante— y ahí son las más largas',
    fineRadial[1] === Math.max(...fineRadial) && fineRadial[1] > fineRadial[0] * 10,
    `de ${fineRadial[0].toFixed(2)} a ${fineRadial[1].toFixed(2)} de largo · ×${(fineRadial[1] / fineRadial[0]).toFixed(1)}`
  )
  check(
    '  y en el cierre quedan más largas que a mediodía, con la razón de la sombra del logo: 1/tan(elevación)',
    fineRadial[fineRadial.length - 1] > fineRadial[0] &&
      Math.abs(fineRadial[fineRadial.length - 1] / fineRadial[0] - tanDe(0) / tanDe(1)) < 0.02,
    `×${(fineRadial[fineRadial.length - 1] / fineRadial[0]).toFixed(2)} medido contra ×${(tanDe(0) / tanDe(1)).toFixed(2)} de la cuenta · era ×3,6 con el arco viejo`
  )
}

// ── 3 · El barrido ──────────────────────────────────────────────────────────

section('El barrido: cuántas bandas le pasan por encima a un punto del piso')

{
  /**
   * ⚠️ **B8 · EL BARRIDO SE PARTE EN SUS DOS EJES.** Custodiaba que la fase total
   * (u + v) barrida sobre el centro fuera la de los 180° de azimut, 51 celdas
   * ±1: con el arco viejo la elevación apenas movía la fase vertical. B8 lleva
   * el sol a 2,7° y lo vuelve a subir: la fase VERTICAL hace un viaje de ida y
   * vuelta que se suma al total. La propiedad se afirma por eje, que es lo que
   * siempre fue: el barrido tangencial es del AZIMUT —los 180° del arco— y el
   * vertical es de la ELEVACIÓN, la noche bajando y volviendo a subir.
   */
  function sweptCells(point: Vec3): { readonly u: number; readonly v: number; readonly total: number } {
    let u = 0
    let v = 0
    let total = 0
    let previous: { u: number; v: number } | null = null
    for (let i = 0; i <= 400; i += 1) {
      const crossing = celosiaCrossings(point, sunDirectionAt(i / 400), LAYERS[0], 0)[0]
      if (!crossing) {
        previous = null
        continue
      }
      if (previous !== null) {
        u += Math.abs(crossing.u - previous.u)
        v += Math.abs(crossing.v - previous.v)
        total += Math.abs(crossing.u + crossing.v - (previous.u + previous.v))
      }
      previous = { u: crossing.u, v: crossing.v }
    }
    return { u, v, total }
  }

  const center = sweptCells([0, FLOOR_Y, 0])
  const rim = sweptCells([25, FLOOR_Y, 0])
  const cellWidth = (2 * Math.PI * MOIRE_NEAR_RADIUS) / fineCells(MOIRE_MISMATCH)
  check(
    'sobre el centro de la losa pasan decenas de bandas: es un barrido, no una deriva',
    center.total > 40,
    `${center.total.toFixed(1)} celdas finas = ${(center.total * cellWidth).toFixed(0)} unidades de mundo de banda pasando por encima`
  )
  check(
    'y el barrido TANGENCIAL es del ARCO: sale de los 180° de azimut, no de la deriva',
    Math.abs(center.u - (180 / 360) * fineCells(MOIRE_MISMATCH)) < 1,
    `${center.u.toFixed(1)} contra las ${((180 / 360) * fineCells(MOIRE_MISMATCH)).toFixed(1)} que predicen los 180° de barrido — el patrón está anclado al azimut del sol`
  )
  check(
    '  y el VERTICAL es de la ELEVACIÓN: la noche baja la fase y la mañana la vuelve a subir (B8)',
    center.v > 1 && center.total <= center.u + center.v + 1e-9,
    `${center.v.toFixed(1)} celdas de fase vertical, ida y vuelta · con el arco viejo eran menos de 1`
  )
  check(
    'también barre lejos del centro, aunque menos',
    rim.total > 15 && rim.total < center.total,
    `${rim.total.toFixed(1)} celdas a 25 de radio contra ${center.total.toFixed(1)} en el centro`
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
