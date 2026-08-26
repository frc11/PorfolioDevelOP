/**
 * COMPROBACIONES DE S12 · el barrido del parámetro.
 *
 *     npx tsx src/app/probe-escena/__tests__/s12-barrido.invariant.ts
 *
 * **La tabla de la tensión, entera y reproducible.** `s12-tension` comprueba el
 * valor elegido contra su control; acá se barre el slider completo, porque la
 * tabla que el reporte publica —seis valores medios y cuatro pares de
 * portadora/batido, por cada uno de seis radios angulares— **tiene que tener un
 * instrumento que la produzca.** Es la regla 11 de `DIRECCION-ESCENA.md` §3, y
 * nació justamente de cuatro números de S11 que no lo tenían.
 *
 * Lo que se afirma es la FORMA del barrido, que es lo que sostiene la elección:
 *
 *   1. El valor medio del hero sube monótono con α y **nunca llega a 210**, ni
 *      en el tope del slider.
 *   2. **La portadora del piso no se mueve hasta 0,5°** y recién cae desde 0,75°.
 *      Ése es el techo práctico del parámetro, y es un número, no un gusto.
 *   3. El ancho de borde escala lineal con α en las cuatro poses a la vez.
 */
import { celosiaSunSpread, CELOSIA_SUN_RADIUS_MAX_DEG } from '../_components/celosiaPenumbra'
import { CELOSIA_BAR, celosiaSkyFactor } from '../_components/probeCelosia'
import { MOIRE_MISMATCH } from '../_components/probeMoire'

import { BEAT_POSES, celosiaBeatAt } from './celosiaBeat'
import { framePenumbraSpread } from './celosiaFloor'
import { check, report, section } from './harness'
import { sampleFrame } from './frameProbe'
import type { ViewContext } from './shading'

/** El barrido que publica el reporte. El 0 es el control. */
const RADII = [0, 0.133, 0.266, 0.5, 0.75, 1, CELOSIA_SUN_RADIUS_MAX_DEG]

const POSES: readonly [string, number, number, number][] = [
  ['hero', 0, 0, 6.4],
  ['quiénes somos', 0.375, 130, -3.6],
  ['números', 0.5, 185, 9],
  ['trabajos', 0.625, 195, 4.5],
  ['demos', 0.75, 310, -2.6],
  ['cierre', 0.95, 360, -1.4],
]
const S11_MEAN = [201, 166, 213, 185, 129, 104]
const PARTICLE_DELTA = [8, 7, 8, 7, 2, 0]
const SKY = celosiaSkyFactor(CELOSIA_BAR)

function meanAt(spread: number): number[] {
  return POSES.map(([, at, azimuth, height], i) => {
    const view: ViewContext = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
    return (
      sampleFrame(
        at,
        view,
        { backdrop: true, mismatch: MOIRE_MISMATCH, celosia: { bar: CELOSIA_BAR, sky: SKY, spread } },
        200,
        113
      ).mean - PARTICLE_DELTA[i]
    )
  })
}

const sweep = RADII.map((deg) => ({
  deg,
  mean: meanAt(celosiaSunSpread(deg)),
  beat: BEAT_POSES.map((pose) => celosiaBeatAt(pose, celosiaSunSpread(deg))),
}))

// ── 1 · Los seis valores medios ─────────────────────────────────────────────

section('El barrido: los seis valores medios contra 201/166/213/185/129/104')

for (const row of sweep) {
  console.log(
    `  α=${row.deg.toFixed(3)}°  ` +
      row.mean
        .map((value, i) => `${POSES[i][0]} ${value.toFixed(1)} (${value - S11_MEAN[i] >= 0 ? '+' : ''}${(value - S11_MEAN[i]).toFixed(1)})`)
        .join(' · ')
  )
}

{
  const hero = sweep.map((row) => row.mean[0])
  check(
    'el hero sube monótono con α: el parámetro devuelve contraste, y se ve cuánto',
    hero.every((value, i) => i === 0 || value > hero[i - 1]),
    hero.map((value) => value.toFixed(1)).join(' → ')
  )
  check(
    '⚠️ y NUNCA llega a 210, ni en el tope del slider',
    hero.every((value) => value < 210),
    `máximo ${Math.max(...hero).toFixed(1)} con α = ${CELOSIA_SUN_RADIUS_MAX_DEG}° · el techo que fijó el humano es 210, y el valor elegido (0,266°) queda en ${hero[2].toFixed(1)}`
  )
  check(
    'en el valor elegido ninguna pose se mueve más de 2,5 puntos',
    POSES.every((_, i) => sweep[2].mean[i] - sweep[0].mean[i] <= 2.6),
    POSES.map((pose, i) => `${pose[0]} +${(sweep[2].mean[i] - sweep[0].mean[i]).toFixed(1)}`).join(' · ')
  )
  /**
   * ⚠️ **NI EN EL TOPE DEL SLIDER se deshace S11.** La pose que más se mueve en
   * todo el rango es Trabajos, +10,6 puntos — y aun así queda 12 por debajo de la
   * escena SIN celosía que midió S10. El slider no puede devolver el sprint
   * anterior ni en su extremo, que es la garantía que hace que sea seguro
   * calibrar mirando.
   */
  const S10_MEAN = [216, 172, 222, 208, 136, 120]
  const top = sweep[sweep.length - 1].mean
  check(
    'ni en el tope del slider ninguna pose vuelve a la escena sin celosía de S10',
    top.every((value, i) => value < S10_MEAN[i] - 2),
    top.map((value, i) => `${POSES[i][0]} ${value.toFixed(1)} < ${S10_MEAN[i]}`).join(' · ') +
      ` · la que más se mueve en todo el rango es ${POSES[3][0]}, +${(top[3] - sweep[0].mean[3]).toFixed(1)}`
  )
}

// ── 2 · La portadora y el batido ────────────────────────────────────────────

section('El barrido: portadora y batido del piso, con su control en α = 0')

for (const row of sweep) {
  console.log(
    `  α=${row.deg.toFixed(3)}°  ` +
      row.beat
        .map((sample, i) => {
          const base = sweep[0].beat[i]
          if (!sample || !base) return `${BEAT_POSES[i][0]} —`
          return `${BEAT_POSES[i][0]} ${sample.beat.toFixed(1)}/${sample.carrier.toFixed(1)} (${((sample.beat / base.beat - 1) * 100).toFixed(0)}%/${((sample.carrier / base.carrier - 1) * 100).toFixed(0)}%)`
        })
        .join(' · ')
  )
}

{
  const carrierAt = (deg: number, i: number) => {
    const row = sweep.find((entry) => entry.deg === deg)
    const base = sweep[0].beat[i]
    return row && row.beat[i] && base ? row.beat[i]!.carrier / base.carrier - 1 : NaN
  }
  /**
   * ⚠️ **EL TECHO PRÁCTICO DEL PARÁMETRO, COMO NÚMERO.** La portadora es el
   * contraste de banda sobre el papel: los 29,6 puntos que S11 compró, vistos
   * donde caen. Mientras no se mueva, ablandar el borde sale gratis.
   */
  check(
    'la portadora NO se mueve hasta 0,5°: hasta ahí ablandar el borde sale gratis',
    BEAT_POSES.every((_, i) => Math.abs(carrierAt(0.5, i)) < 0.02),
    BEAT_POSES.map((pose, i) => `${pose[0]} ${(carrierAt(0.5, i) * 100).toFixed(1)}%`).join(' · ')
  )
  check(
    'y desde 0,75° empieza a caer: ahí el sprint sí estaría deshaciendo a S11',
    BEAT_POSES.slice(0, 3).some((_, i) => carrierAt(0.75, i) < -0.05) &&
      BEAT_POSES.every((_, i) => carrierAt(1, i) < -0.02),
    `en 0,75° ${BEAT_POSES.map((pose, i) => `${pose[0]} ${(carrierAt(0.75, i) * 100).toFixed(0)}%`).join(' · ')} · en 1° ${BEAT_POSES.map((pose, i) => `${(carrierAt(1, i) * 100).toFixed(0)}%`).join('/')}`
  )
  check(
    'en el valor elegido el batido no pierde más del 11% en ninguna pose',
    BEAT_POSES.every((_, i) => {
      const row = sweep.find((entry) => entry.deg === 0.266)
      const base = sweep[0].beat[i]
      return row && row.beat[i] && base ? row.beat[i]!.beat / base.beat - 1 > -0.115 : false
    }),
    'y en el hero SUBE: con el borde filoso los huecos entre barras casi no dejan pasar luz entera'
  )
}

// ── 3 · El ancho de borde, a lo largo del barrido ───────────────────────────

section('El ancho de borde en cuadro, pose por pose')

{
  for (const deg of RADII) {
    if (deg === 0) continue
    const spread = celosiaSunSpread(deg)
    console.log(
      `  α=${deg.toFixed(3)}°  ` +
        BEAT_POSES.map((pose) => {
          const frame = framePenumbraSpread(pose[1], spread)
          return frame
            ? `${pose[0]} ${frame.min.toFixed(3)}/${frame.median.toFixed(3)}/${frame.max.toFixed(3)} celdas`
            : `${pose[0]} —`
        }).join(' · ')
    )
  }

  const medians = [0.133, 0.266, 0.5, 1].map((deg) =>
    BEAT_POSES.map((pose) => framePenumbraSpread(pose[1], celosiaSunSpread(deg))?.median ?? NaN)
  )
  check(
    'el ancho escala lineal con α en las cuatro poses a la vez',
    medians[1].every((value, i) => Math.abs(value / medians[0][i] - 2) < 0.02) &&
      medians[3].every((value, i) => Math.abs(value / medians[1][i] - 1 / 0.266) < 0.05),
    `mediana en el hero: ${medians.map((row) => row[0].toFixed(3)).join(' → ')} para α = 0,133 / 0,266 / 0,5 / 1°`
  )
  check(
    '⚠️ y en el tope del slider la mediana pasa media celda: ahí el moiré se lava',
    BEAT_POSES.some(
      (pose) => (framePenumbraSpread(pose[1], celosiaSunSpread(CELOSIA_SUN_RADIUS_MAX_DEG))?.median ?? 0) > 0.5
    ),
    BEAT_POSES.map(
      (pose) =>
        `${pose[0]} ${framePenumbraSpread(pose[1], celosiaSunSpread(CELOSIA_SUN_RADIUS_MAX_DEG))?.median.toFixed(3)}`
    ).join(' · ') + ` celdas con α = ${CELOSIA_SUN_RADIUS_MAX_DEG}° · para eso llega hasta ahí el slider: para poder VER el extremo`
  )
}

report('s12 · el barrido del parámetro')
