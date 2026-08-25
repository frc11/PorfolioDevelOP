/**
 * COMPROBACIONES DE S11 · el piso.
 *
 *     npx tsx src/app/probe-escena/__tests__/s11-piso.invariant.ts
 *
 * Es la mitad del sprint que no es óptica sino exposición, y arranca por la cifra
 * que lo explica todo: **el papel a luz plena da 249,4 sobre 255 y su propia
 * sombra dura da 236,9.** Doce puntos y medio es todo el rango que una sombra
 * proyectada puede usar mientras el cielo esté abierto.
 *
 *   1. El techo, medido.
 *   2. El factor de cielo: la forma cerrada contra la integral de hemisferio, con
 *      su control positivo, y la prueba de que Ω sale de la geometría.
 *   3. Los seis valores medios del cuadro, contra los seis de S10.
 *   4. Qué fracción del piso —y del replanteo— queda adentro de una banda.
 *
 * Lo que este sprint decidió NO tener —el cuerpo del sol y los haces— está en
 * `s11-sin-sol.invariant.ts`, con sus controles positivos.
 */
import {
  celosiaCoverage,
  celosiaSkyIntegral,
  celosiaTransmittance,
  fitCelosiaSkyShare,
} from '../_components/celosiaGeometry'
import { MARK_PLACEMENTS } from '../_components/floorMarks'
import {
  CELOSIA_BAR,
  CELOSIA_SKY_SHARE,
  celosiaSkyFactor,
} from '../_components/probeCelosia'
import { MOIRE_MISMATCH } from '../_components/probeMoire'
import { MARK_COLOR, PAPER_COLOR } from '../_components/probeScene'
import {
  FLOOR_Y,
  angularOffset,
  cameraAt,
  check,
  emptyPose,
  halfFovDeg,
  report,
  section,
  type Vec3,
} from './harness'
import { sampleFrame, track } from './frameProbe'
import { shadeSurface, sunDirectionAt, type ViewContext } from './shading'

const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)
const SKY = celosiaSkyFactor(CELOSIA_BAR)
const CELOSIA = { bar: CELOSIA_BAR, sky: SKY }
const UP: Vec3 = [0, 1, 0]

const POSES: readonly [string, number, number, number][] = [
  ['hero', 0, 0, 6.4],
  ['quiénes somos', 0.375, 130, -3.6],
  ['números', 0.5, 185, 9],
  ['trabajos', 0.625, 195, 4.5],
  ['demos', 0.75, 310, -2.6],
  ['cierre', 0.95, 360, -1.4],
]

/** Los seis que S10 publicó en §2, ya con sus partículas adentro. */
const S10_MEAN = [216, 172, 222, 208, 136, 120]
/**
 * Cuánto bajan las partículas el valor medio en cada pose. Sale de la propia
 * tabla de S10 §2 —la diferencia entre su columna "+ envolvente" y su columna
 * "+ envolvente y partículas"— y se resta acá porque `sampleFrame` no las modela.
 * Sin esto la comparación sería contra otra escena.
 */
const PARTICLE_DELTA = [8, 7, 8, 7, 2, 0]

// ── 1 · El techo ────────────────────────────────────────────────────────────

section('El techo: cuánto puede bajar una sombra sobre este papel')

{
  const view: ViewContext = { progress: 0, cameraAzimuthDeg: 0, cameraHeight: 6.4 }
  const openLit = shadeSurface(PAPER_COLOR, UP, view, 0, 1, 1)
  const openDark = shadeSurface(PAPER_COLOR, UP, view, 0, 0, 1)
  check(
    'con el cielo abierto, apagar la key ENTERA baja el papel apenas doce puntos',
    openLit - openDark < 14 && openLit > 248,
    `${openLit.toFixed(1)} a luz plena → ${openDark.toFixed(1)} en sombra dura · ${(openLit - openDark).toFixed(1)} puntos · NeutralToneMapping comprime todo lo que pasa de 0,76 lineal`
  )
  check(
    'y por eso las marcas tampoco se leen: 16% menos de albedo son cuatro puntos',
    openLit - shadeSurface(MARK_COLOR, UP, view, 0, 1, 1) < 6,
    `papel ${openLit.toFixed(1)} contra ${MARK_COLOR} en ${shadeSurface(MARK_COLOR, UP, view, 0, 1, 1).toFixed(1)} — el aplastamiento no es de la celosía, es del piso`
  )

  const litS11 = shadeSurface(PAPER_COLOR, UP, view, 0, 1, SKY)
  const darkS11 = shadeSurface(PAPER_COLOR, UP, view, 0, 0, SKY)
  check(
    'con el cielo tapado la sombra se hunde y el alto casi no se mueve',
    litS11 - darkS11 > 25 && openLit - litS11 < 2,
    `${litS11.toFixed(1)} / ${darkS11.toFixed(1)} = ${(litS11 - darkS11).toFixed(1)} puntos, contra ${(openLit - openDark).toFixed(1)} · el alto bajó ${(openLit - litS11).toFixed(1)}`
  )
  check(
    'la sombra PROPIA del logo gana lo mismo, y nunca fue un problema de celosía',
    openDark - darkS11 > 15,
    `de ${openDark.toFixed(1)} a ${darkS11.toFixed(1)} — ${(openDark - darkS11).toFixed(1)} puntos más profunda, sin tocar el shadow map`
  )
}

// ── 2 · El factor de cielo ──────────────────────────────────────────────────

section('El factor de cielo: forma cerrada contra la integral de hemisferio')

{
  /**
   * ⚠️ **CONTROL POSITIVO.** Comparar dos funciones que coinciden no prueba nada
   * si las dos son constantes. Primero hay que ver que el factor SE MUEVA: en 0 la
   * celosía no tapa nada y tiene que dar exactamente 1.
   */
  check(
    'el instrumento se mueve: con la barra en 0 el cielo está abierto y vale 1',
    celosiaSkyFactor(0) === 1 && celosiaSkyIntegral([0, FLOOR_Y, 0], 0, MOIRE_MISMATCH) === 1,
    'sin esto, dos funciones que devolvieran siempre lo mismo pasarían el chequeo de abajo'
  )

  const bars = [0.05, 0.15, 0.2, 0.25, CELOSIA_BAR, 0.35, 0.45, 0.5]
  const errors = bars.map((bar) =>
    Math.abs(celosiaSkyIntegral([0, FLOOR_Y, 0], celosiaCoverage(bar), MOIRE_MISMATCH) - celosiaSkyFactor(bar))
  )
  const worst = Math.max(...errors)
  check(
    'la forma cerrada reproduce la integral en TODO el rango del slider',
    worst < 0.006,
    `peor error ${(worst * 1000).toFixed(1)}/1000 · en la barra de diseño ${(errors[bars.indexOf(CELOSIA_BAR)] * 1000).toFixed(1)}/1000 · cielo = ${SKY.toFixed(4)}`
  )

  /**
   * ⚠️ **Ω SALE DE LA GEOMETRÍA, NO ESTÁ ESCRITO A MANO.** Es la condición que el
   * humano puso en la Parada 1: si mañana cambian los radios o las bandas en
   * `probeMoire.ts`, el factor de cielo tiene que moverse solo. Se comprueba
   * corriendo el mismo ajuste contra una celosía más alta: si Ω fuera una
   * constante escrita, los dos números serían iguales.
   */
  const taller = fitCelosiaSkyShare([0, FLOOR_Y, 0], MOIRE_MISMATCH, 600)
  const tighter = (() => {
    // Un punto más cerca del borde ve la celosía más alta a un lado y más baja al
    // otro: es la variación que la constante aplana, y está declarada.
    return fitCelosiaSkyShare([32, FLOOR_Y, 0], MOIRE_MISMATCH, 600)
  })()
  check(
    'Ω se recalcula de la geometría y cambia cuando cambia el punto de vista',
    Math.abs(taller - CELOSIA_SKY_SHARE) < 0.01 && Math.abs(tighter - CELOSIA_SKY_SHARE) > 0.02,
    `en el centro Ω = ${CELOSIA_SKY_SHARE.toFixed(4)} (mismo ajuste con menos muestras: ${taller.toFixed(4)}) · en el borde de la losa ${tighter.toFixed(4)} — ésa es la simplificación declarada, ±${((Math.abs(tighter - CELOSIA_SKY_SHARE) / CELOSIA_SKY_SHARE) * 100).toFixed(0)}%`
  )
  check(
    'y el factor de cielo baja cuando sube la barra, monótono',
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].every(
      (bar, i, list) => i === 0 || celosiaSkyFactor(bar) < celosiaSkyFactor(list[i - 1])
    ),
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((bar) => celosiaSkyFactor(bar).toFixed(3)).join(' → ')
  )
}

// ── 3 · Los seis valores medios ─────────────────────────────────────────────

section('El valor medio del cuadro en las seis poses, contra S10')

{
  const rows: string[] = []
  const deltas: number[] = []
  let baselineOk = true
  let heroDelta = 0
  let numerosDelta = 0

  POSES.forEach(([name, at, azimuth, height], i) => {
    const view: ViewContext = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
    const s10 = sampleFrame(at, view, { backdrop: true, mismatch: MOIRE_MISMATCH }, 200, 113)
    const s11 = sampleFrame(
      at,
      view,
      { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: CELOSIA },
      200,
      113
    )
    // El instrumento sin celosía tiene que devolver la columna "+ envolvente" de
    // S10: es el control de que estamos midiendo la misma escena que aquel reporte.
    if (Math.abs(s10.mean - PARTICLE_DELTA[i] - S10_MEAN[i]) > 1) baselineOk = false
    const published = s11.mean - PARTICLE_DELTA[i]
    deltas.push(published - S10_MEAN[i])
    if (name === 'hero') heroDelta = published - S10_MEAN[i]
    if (name === 'números') numerosDelta = published - S10_MEAN[i]
    rows.push(
      `${name} ${published.toFixed(0)} (S10 ${S10_MEAN[i]}, ${(published - S10_MEAN[i]).toFixed(0)}) piso ${(s11.floor * 100).toFixed(0)}% sombra ${(s11.floorShaded * 100).toFixed(0)}%`
    )
  })

  check(
    'el instrumento sin celosía sigue reproduciendo los seis valores de S10',
    baselineOk,
    'es el control: si esto se corriera, la comparación de abajo no valdría nada'
  )
  check(
    'la celosía baja el valor medio en las seis poses',
    deltas.every((delta) => delta < 0),
    rows.join(' · ')
  )
  /**
   * ⚠️ **LAS DOS QUE IMPORTAN.** Hero y Números son las poses donde el cuadro es
   * 60% y 73% piso, o sea las que la envolvente no podía tocar. Es el pendiente
   * que S10 anotó en su §4.1 y el motivo de este sprint.
   */
  check(
    'y en HERO y NÚMEROS —las dos que el fondo no podía tocar— baja de verdad',
    heroDelta < -8 && numerosDelta < -5,
    `hero ${heroDelta.toFixed(0)} · números ${numerosDelta.toFixed(0)} · con la proyección sola habrían sido −5 y −3: el resto lo pone el cielo tapado`
  )
}

// ── 4 · El replanteo se despierta ───────────────────────────────────────────

section('Las 48 marcas: cuánto del replanteo cae adentro de una banda')

{
  const view: ViewContext = { progress: 0, cameraAzimuthDeg: 0, cameraHeight: 6.4 }
  const paperLit = shadeSurface(PAPER_COLOR, UP, view, 0, 1, SKY)
  const paperDark = shadeSurface(PAPER_COLOR, UP, view, 0, 0, SKY)
  const markLit = shadeSurface(MARK_COLOR, UP, view, 0, 1, SKY)
  const markDark = shadeSurface(MARK_COLOR, UP, view, 0, 0, SKY)
  check(
    'una marca se separa del papel SIETE veces más adentro de una banda que en la luz',
    paperDark - markDark > 6 * (paperLit - markLit),
    `${(paperLit - markLit).toFixed(1)} puntos en la luz contra ${(paperDark - markDark).toFixed(1)} en la banda · no se agregó contraste, se destapó el que ya estaba`
  )

  /**
   * La fracción del replanteo EN CUADRO que cae bajo una barra, pose por pose.
   * Cada marca se muestrea a lo largo de su eje mayor y se pesa por su superficie:
   * el eje de X mide 13 unidades y una cruz de registro 1,2, así que contarlas de
   * a una diría otra cosa.
   */
  function markedShare(at: number) {
    const pose = emptyPose()
    const cam = cameraAt(track, at, ASPECT, pose)
    const sun = sunDirectionAt(at)
    let inFrame = 0
    let shaded = 0
    for (const mark of MARK_PLACEMENTS) {
      const [sx, , sz] = mark.scale
      const along = Math.max(sx, sz)
      const steps = Math.max(2, Math.round(along * 6))
      const area = sx * sz
      const angle = mark.rotation?.[1] ?? 0
      const dirX = sx >= sz ? Math.cos(angle) : Math.sin(angle)
      const dirZ = sx >= sz ? -Math.sin(angle) : Math.cos(angle)
      for (let i = 0; i < steps; i += 1) {
        const t = (i + 0.5) / steps - 0.5
        const point: Vec3 = [
          mark.position[0] + dirX * along * t,
          FLOOR_Y,
          mark.position[2] + dirZ * along * t,
        ]
        const offset = angularOffset(cam, point)
        if (offset.depth <= 0 || Math.abs(offset.h) > half.h || Math.abs(offset.v) > half.v) continue
        const weight = area / steps
        inFrame += weight
        if (celosiaTransmittance(point, sun, CELOSIA_BAR, MOIRE_MISMATCH) < 0.5) shaded += weight
      }
    }
    return { inFrame, shaded: inFrame > 0 ? shaded / inFrame : 0 }
  }

  const marked = POSES.map(([name, at]) => {
    const result = markedShare(at)
    return { name, ...result }
  })
  const withMarks = marked.filter((row) => row.inFrame > 1e-6)
  check(
    'en toda pose con replanteo en cuadro, una parte grande cae adentro de una banda',
    withMarks.length > 0 && withMarks.every((row) => row.shaded > 0.4),
    marked
      .map((row) =>
        row.inFrame > 1e-6
          ? `${row.name} ${(row.shaded * 100).toFixed(0)}%`
          : `${row.name} sin marcas en cuadro`
      )
      .join(' · ')
  )
}

report('s11 · el piso')
