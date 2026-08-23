/**
 * COMPROBACIONES DE S10 · la escena vaciada, las partículas y el sol.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-escena.invariant.ts
 *
 * La otra mitad de `s10-fondo.invariant.ts`. Ésta no mira la envolvente por
 * dentro: mira **qué le pasa al cuadro** cuando se borran los planos.
 *
 *   1. El instrumento de tinta, contra una medición independiente.
 *   2. **El balance de negro**, que es la cifra que este sprint tenía que
 *      publicar — incluido el techo que la envolvente no puede levantar.
 *   3. El sol: contra qué se recorta ahora, y qué le cuesta el washout.
 *
 * Las partículas —conteo, conchas y el recorte de `gl_PointSize`— están en
 * `s10-particulas.invariant.ts`.
 */
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'

import { sampleLightArc } from '../_components/choreographySampler'
import type { MutableLightLevels } from '../_components/choreographyTypes'
import { MOIRE_MISMATCH } from '../_components/probeMoire'
import { PAPER_COLOR } from '../_components/probeScene'
import {
  SUN_CORE,
  SUN_GLOW_FALLOFF,
  SUN_GLOW_OPACITY,
  SUN_RADIUS,
  SUN_SPRITE_RADIUS,
  SUN_WASHOUT_FALLOFF,
  SUN_WASHOUT_SCALE,
  sunWashoutOpacityFor,
} from '../_components/probeSun'
import { check, halfFovDeg, report, section, type Vec3 } from './harness'
import { INK_HEIGHT, INK_WIDTH, layerMeanAlpha, mask, sampleFrame } from './frameProbe'
import { levelAt, over, shadeSurface } from './shading'

const RAD = Math.PI / 180
const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

/** Las seis poses, con el azimut y la altura que el contraluz necesita saber. */
const POSES: readonly [string, number, number, number][] = [
  ['hero', 0, 0, 6.4],
  ['quiénes somos', 0.375, 130, -3.6],
  ['números', 0.5, 185, 9],
  ['trabajos', 0.625, 195, 4.5],
  ['demos', 0.75, 310, -2.6],
  ['cierre', 0.95, 360, -1.4],
]

// ── 1 · El instrumento ──────────────────────────────────────────────────────

section('La tinta del logo, contra una medición independiente')

check(
  'el aplanado del path reproduce la caja de tinta que S8b midió por otro camino',
  Math.abs(mask.x - LOGO_INK_VIEWBOX.x) < 1e-3 &&
    Math.abs(mask.y - LOGO_INK_VIEWBOX.y) < 1e-3 &&
    Math.abs(mask.width - LOGO_INK_VIEWBOX.width) < 1e-3 &&
    Math.abs(mask.height - LOGO_INK_VIEWBOX.height) < 1e-3,
  `${mask.x.toFixed(3)} ${mask.y.toFixed(3)} ${mask.width.toFixed(3)} ${mask.height.toFixed(3)} contra ${LOGO_INK_VIEWBOX.x} ${LOGO_INK_VIEWBOX.y} ${LOGO_INK_VIEWBOX.width} ${LOGO_INK_VIEWBOX.height}`
)
check(
  'la marca llena menos de la mitad de su propia caja',
  mask.fill > 0.4 && mask.fill < 0.45,
  `${(mask.fill * 100).toFixed(2)}% — medir con la caja en vez de con la tinta daría 2,3 veces de más`
)
check(
  'y la caja en mundo es la del mesh extruido, menos el bisel',
  Math.abs(INK_WIDTH - 6.849) < 0.01 && Math.abs(INK_HEIGHT - 4.765) < 0.01,
  `${INK_WIDTH.toFixed(3)} × ${INK_HEIGHT.toFixed(3)} · con bisel el mesh mide 6,863 × 4,779`
)

// ── 2 · El balance de negro ─────────────────────────────────────────────────

section('El balance de negro: la escena SÍ queda más clara, y con cuánto')

/**
 * ⚠️ **Este bloque publica una cifra incómoda a propósito.**
 *
 * Los once planos suspendidos eran el 30% al 49% del cuadro en `#191917`.
 * Borrarlos sube el valor medio del cuadro entre 45 y 113 puntos, y la envolvente
 * lo recupera solo en parte. La decisión fue aceptar la escena más clara y dejar
 * el PISO como sprint propio; estos números son de dónde arranca ese sprint.
 */
{
  const rows: string[] = []
  let worstFloor = 0
  let worstFloorPose = ''
  for (const [name, at, azimuth, height] of POSES) {
    const view = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
    const empty = sampleFrame(at, view, { backdrop: false }, 200, 113)
    const withBackdrop = sampleFrame(at, view, { backdrop: true, mismatch: MOIRE_MISMATCH }, 200, 113)
    rows.push(
      `${name} tinta ${(withBackdrop.ink * 100).toFixed(1)}% · vacía ${empty.mean.toFixed(0)} → con fondo ${withBackdrop.mean.toFixed(0)}`
    )
    if (withBackdrop.floor > worstFloor) {
      worstFloor = withBackdrop.floor
      worstFloorPose = name
    }
  }

  check(
    'la envolvente baja el valor medio del cuadro en TODAS las poses',
    POSES.every(([, at, azimuth, height]) => {
      const view = { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }
      return (
        sampleFrame(at, view, { backdrop: true, mismatch: MOIRE_MISMATCH }, 120, 68).mean <
        sampleFrame(at, view, { backdrop: false }, 120, 68).mean
      )
    }),
    rows.join(' · ')
  )

  check(
    'la tinta que queda es SOLO el logo, y es poca',
    POSES.every(([, at, azimuth, height]) => {
      const sample = sampleFrame(
        at,
        { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height },
        { backdrop: true },
        120,
        68
      )
      return sample.ink < 0.26
    }),
    'entre 2,8% y 23,2% del cuadro, contra el 10,6%–73,5% que sumaban los planos'
  )

  /**
   * ⚠️ **EL TECHO.** En las poses altas el cuadro es piso, así que la envolvente
   * apenas aparece y ninguna de sus perillas puede cambiar eso. Es el número que
   * el sprint del piso tiene que heredar.
   */
  check(
    'hay poses donde la mayor parte del cuadro es PISO y el fondo no llega',
    worstFloor > 0.6,
    `la peor es ${worstFloorPose}, con ${(worstFloor * 100).toFixed(0)}% del cuadro en papel — ninguna perilla de la envolvente lo toca`
  )
}

// ── 4 · El sol ──────────────────────────────────────────────────────────────

section('El sol: contra qué se recorta ahora')

/** El valor del fondo detrás del sol: ciclorama + las dos capas de la envolvente. */
function backgroundBehindSun(progress: number, cameraAzimuthDeg: number, cameraHeight: number) {
  const view = { progress, cameraAzimuthDeg, cameraHeight }
  const backAzimuth = cameraAzimuthDeg + 180
  const normal: Vec3 = [-Math.sin(backAzimuth * RAD), 0, -Math.cos(backAzimuth * RAD)]
  const cyclorama = shadeSurface(PAPER_COLOR, normal, view, 60)
  const screen = shadeSurface('#3E3E40', normal, view, 41)
  const alphaFar = layerMeanAlpha(50)
  const alphaNear = layerMeanAlpha(102)
  return {
    cyclorama,
    withGrid: over(screen, alphaNear, over(screen, alphaFar, cyclorama)),
  }
}

{
  // Demos y el cierre, que es donde el sol está en cuadro.
  const demos = backgroundBehindSun(0.75, 310, -2.6)
  const cierre = backgroundBehindSun(0.95, 360, -1.4)
  check(
    'la envolvente le da al sol el contraste que S7 no tenía',
    255 - demos.withGrid > 90 && 255 - cierre.withGrid > 140,
    `demos: pared ${demos.cyclorama.toFixed(0)} → con trama ${demos.withGrid.toFixed(0)}, o sea ${(255 - demos.withGrid).toFixed(0)} puntos · cierre: ${cierre.cyclorama.toFixed(0)} → ${cierre.withGrid.toFixed(0)}, ${(255 - cierre.withGrid).toFixed(0)} puntos · S7 publicó 41`
  )

  /**
   * El washout es aditivo: suma `255 × opacidad × máscara` sobre lo que haya
   * detrás. Se mide justo AFUERA del núcleo, que es donde el halo del sol ya cayó
   * y la trama vuelve a asomar — el anillo que este disco existe para limpiar.
   */
  function washoutAt(progress: number, background: number, opacityScale: number) {
    const level = levelAt(progress)
    // Radio de muestra: 1,5 núcleos, o sea afuera del disco duro.
    const sample = 1.5
    const halo =
      SUN_GLOW_OPACITY *
      Math.pow(Math.max(0, 1 - (sample * SUN_CORE) / 1) / (1 - SUN_CORE), SUN_GLOW_FALLOFF)
    const withHalo = over(255, halo, background)
    const washMask = Math.pow(Math.max(0, 1 - sample / SUN_WASHOUT_SCALE), SUN_WASHOUT_FALLOFF)
    const added = 255 * sunWashoutOpacityFor(level) * (opacityScale / 1) * washMask
    return Math.min(255, withHalo + added)
  }

  const off = washoutAt(0.75, demos.withGrid, 0)
  const on = washoutAt(0.75, demos.withGrid, 1)
  const full = washoutAt(0.75, demos.withGrid, 255 / (255 * sunWashoutOpacityFor(levelAt(0.75))))
  check(
    'el washout arranca BAJO: suma poco y por eso cuesta poco contraste',
    255 - on > 60 && on > off,
    `afuera del núcleo el fondo va de ${off.toFixed(0)} sin washout a ${on.toFixed(0)} con el default · contraste del núcleo ${(255 - off).toFixed(0)} → ${(255 - on).toFixed(0)} puntos · a plena opacidad quedaría en ${(255 - full).toFixed(0)}`
  )
  check(
    'y a plena opacidad el costo sería el que se decidió no pagar',
    255 - full < 255 - on,
    `${(255 - full).toFixed(0)} puntos contra ${(255 - on).toFixed(0)} — la perilla está en el panel`
  )
}

section('La sombra se alarga, que es la otra mitad del tiempo pasando')

{
  const top = INK_HEIGHT / 2
  const floor = -(0.007 * 1024) / 2 - 0.72
  const lengths: number[] = []
  for (const p of [0, 0.5, 0.75, 0.875, 0.95, 1]) {
    sampleLightArc(p, arc)
    lengths.push((top - floor) / Math.tan(arc.elevationDeg * RAD))
  }
  const grows = lengths.every((value, i) => i === 0 || value >= lengths[i - 1])
  check(
    'la sombra del borde superior del logo crece de punta a punta del recorrido',
    grows && lengths[lengths.length - 1] > lengths[0] * 3,
    `${lengths.map((value) => value.toFixed(1)).join(' → ')} unidades de mundo · ×${(lengths[lengths.length - 1] / lengths[0]).toFixed(1)}`
  )

  const sunHalf = (Math.atan(SUN_SPRITE_RADIUS / SUN_RADIUS) * 180) / Math.PI
  check(
    'y el halo del sol sigue midiendo más que el cuadro: nunca entra entero',
    sunHalf * 2 > half.v * 2,
    `${(sunHalf * 2).toFixed(0)}° de diámetro contra un cuadro de ${(half.v * 2).toFixed(0)}° de alto`
  )
}

report('s10 · la escena vaciada')
