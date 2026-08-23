/**
 * COMPROBACIONES DE S10 · qué produce el desajuste, y el aliasing.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-batido.invariant.ts
 *
 * Dos cosas que no se pueden verificar mirando:
 *
 *   1. **El batido**: qué produce el desajuste, en mundo y en píxeles, y qué pasa
 *      cuando se lo pone en cero. Es la parte donde el enunciado del 2:1 hay que
 *      medirlo y no razonarlo — con las capas separadas en profundidad, la
 *      cancelación exacta no ocurre.
 *   2. **El aliasing en las DOS direcciones.** Una trama de cuadrados tiene líneas
 *      en dos ejes: el análisis de S7 sobre rendijas verticales cubría uno solo. Y
 *      el riesgo real no es el período sino el GROSOR del trazo.
 */
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import {
  MOIRE_COARSE_CELLS,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_LINE_DEG,
  MOIRE_MISMATCH,
  MOIRE_NEAR_BOTTOM,
  MOIRE_NEAR_RADIUS,
  MOIRE_NEAR_TOP,
  fineCells,
  lineDuty,
} from '../_components/probeMoire'
import {
  TAN_HALF_V,
  cameraAt,
  check,
  emptyPose,
  halfFovDeg,
  makeTrack,
  report,
  section,
  type Vec3,
} from './harness'
import { rayCylinderInside, rayFloor, sampleFrame, track } from './frameProbe'

const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)
const TAN_H = Math.tan((half.h * Math.PI) / 180)
const PX_V = 1080
const PX_H = 1920

const FINE_CELLS = fineCells(MOIRE_MISMATCH)

// ── 3 · El batido, medido sobre el recorrido real ───────────────────────────

section('El batido: textura, paralaje, y qué pasa en cero')

/**
 * El paso aparente de una celda, en píxeles, sobre el rayo que va al centro del
 * cuadro. Es la magnitud de la que sale todo: el cociente proyectado, el batido y
 * el margen de aliasing.
 */
function apparentPitch(progress: number, radius: number, cells: number, bottom: number, top: number) {
  const pose = emptyPose()
  const cam = cameraAt(track, progress, ASPECT, pose)
  const dir = cam.forward
  const t = rayCylinderInside(cam.position, dir, radius, bottom, top)
  if (!isFinite(t)) return null
  const px: Vec3 = [
    cam.position[0] + dir[0] * t,
    cam.position[1] + dir[1] * t,
    cam.position[2] + dir[2] * t,
  ]
  const n: Vec3 = [-px[0] / radius, 0, -px[2] / radius]
  const cosH = Math.abs(n[0] * dir[0] + n[2] * dir[2])
  const cosV = Math.sqrt(Math.max(0, 1 - dir[1] * dir[1]))
  const worldPerPixel = (2 * TAN_HALF_V * t) / PX_V
  const world = (2 * Math.PI * radius) / cells
  return { h: (world * cosH) / worldPerPixel, v: (world * cosV) / worldPerPixel }
}

function projectedRatio(progress: number, mismatch: number) {
  const coarse = apparentPitch(progress, MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS, MOIRE_FAR_BOTTOM, MOIRE_FAR_TOP)
  const fine = apparentPitch(progress, MOIRE_NEAR_RADIUS, fineCells(mismatch), MOIRE_NEAR_BOTTOM, MOIRE_NEAR_TOP)
  if (!coarse || !fine) return null
  return { h: coarse.h / fine.h, v: coarse.v / fine.v, coarsePx: coarse.h }
}

{
  const circumference = 2 * Math.PI * MOIRE_FAR_RADIUS
  check(
    'el desajuste ES la cantidad de bandas de batido en una vuelta',
    MOIRE_MISMATCH > 0,
    `${MOIRE_MISMATCH} bandas · período ${(360 / MOIRE_MISMATCH).toFixed(0)}° de arco · ${(circumference / MOIRE_MISMATCH).toFixed(1)} de mundo sobre la capa gruesa · ${(MOIRE_COARSE_CELLS / MOIRE_MISMATCH).toFixed(0)} celdas gruesas por período`
  )

  let minRatio = Infinity
  let maxRatio = 0
  let minBeatPx = Infinity
  let maxBeatPx = 0
  let minVertical = Infinity
  let maxVertical = 0
  for (let i = 0; i <= 200; i += 1) {
    const ratio = projectedRatio(i / 200, MOIRE_MISMATCH)
    if (!ratio) continue
    minRatio = Math.min(minRatio, ratio.h)
    maxRatio = Math.max(maxRatio, ratio.h)
    minVertical = Math.min(minVertical, ratio.v)
    maxVertical = Math.max(maxVertical, ratio.v)
    const beat = ratio.coarsePx / Math.abs(ratio.h - 2)
    minBeatPx = Math.min(minBeatPx, beat)
    maxBeatPx = Math.max(maxBeatPx, beat)
  }

  check(
    'el paralaje SUBE el cociente aparente por encima del de textura',
    minRatio > FINE_CELLS / MOIRE_COARSE_CELLS,
    `textura ${(FINE_CELLS / MOIRE_COARSE_CELLS).toFixed(3)} → proyectado ${minRatio.toFixed(3)} a ${maxRatio.toFixed(3)} (vertical ${minVertical.toFixed(3)} a ${maxVertical.toFixed(3)})`
  )
  check(
    'y el batido queda entre una y dos bandas a lo ancho del cuadro',
    PX_H / maxBeatPx >= 0.8 && PX_H / minBeatPx <= 2.5,
    `período de ${minBeatPx.toFixed(0)} a ${maxBeatPx.toFixed(0)} px, o sea ${(PX_H / maxBeatPx).toFixed(1)} a ${(PX_H / minBeatPx).toFixed(1)} bandas en 1920 px`
  )

  /**
   * ⚠️ **El enunciado del 2:1 vale para tramas COPLANARES, y acá no lo son.**
   *
   * Con las dos tramas sobre la misma superficie —lo que hizo S7— un cociente de
   * 2 exacto anula el batido: el término |f_fina − 2·f_gruesa| se va a cero.
   * Separadas en profundidad la proyección deja de conservar el cociente, así que
   * **en `MOIRE_MISMATCH = 0` el batido no desaparece**: lo produce el paralaje.
   *
   * Esto no es una licencia para dejar el desajuste en cero — es la razón por la
   * que el default NO es cero y por la que el slider llega hasta ahí: en 0 se ve
   * cuánto aporta cada mitad.
   */
  let zeroMin = Infinity
  let zeroMax = 0
  for (let i = 0; i <= 200; i += 1) {
    const ratio = projectedRatio(i / 200, 0)
    if (!ratio) continue
    zeroMin = Math.min(zeroMin, ratio.h)
    zeroMax = Math.max(zeroMax, ratio.h)
  }
  check(
    'con desajuste 0 la TEXTURA queda en 2:1 exacto',
    fineCells(0) === 2 * MOIRE_COARSE_CELLS,
    `${fineCells(0)} = 2 × ${MOIRE_COARSE_CELLS}`
  )
  check(
    'pero el cociente PROYECTADO sigue lejos de 2: el paralaje lo rompe',
    zeroMin > 2.01,
    `${zeroMin.toFixed(3)} a ${zeroMax.toFixed(3)} con las capas separadas ${MOIRE_FAR_RADIUS - MOIRE_NEAR_RADIUS} unidades`
  )
}

// ── 4 · El aliasing, en las dos direcciones ─────────────────────────────────

section('Aliasing: las dos tramas, los dos ejes, los cinco recorridos')

{
  let worst = { fineH: Infinity, fineV: Infinity, coarseH: Infinity, coarseV: Infinity }
  let where = ''
  const pose = emptyPose()

  for (const variant of CHOREO_VARIANTS) {
    const built = makeTrack(variant.keyframes)
    for (let i = 0; i <= 200; i += 1) {
      const cam = cameraAt(built, i / 200, ASPECT, pose)
      for (let iy = -3; iy <= 3; iy += 1) {
        for (let ix = -6; ix <= 6; ix += 1) {
          const raw: Vec3 = [
            cam.forward[0] + cam.right[0] * ((ix / 6) * TAN_H) + cam.up[0] * ((iy / 3) * TAN_HALF_V),
            cam.forward[1] + cam.right[1] * ((ix / 6) * TAN_H) + cam.up[1] * ((iy / 3) * TAN_HALF_V),
            cam.forward[2] + cam.right[2] * ((ix / 6) * TAN_H) + cam.up[2] * ((iy / 3) * TAN_HALF_V),
          ]
          const length = Math.hypot(raw[0], raw[1], raw[2])
          const dir: Vec3 = [raw[0] / length, raw[1] / length, raw[2] / length]
          const floor = rayFloor(cam.position, dir)

          for (const [tag, radius, cells, bottom, top] of [
            ['fine', MOIRE_NEAR_RADIUS, FINE_CELLS, MOIRE_NEAR_BOTTOM, MOIRE_NEAR_TOP],
            ['coarse', MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS, MOIRE_FAR_BOTTOM, MOIRE_FAR_TOP],
          ] as const) {
            const t = rayCylinderInside(cam.position, dir, radius, bottom, top)
            if (!isFinite(t) || t > floor) continue
            const px: Vec3 = [
              cam.position[0] + dir[0] * t,
              cam.position[1] + dir[1] * t,
              cam.position[2] + dir[2] * t,
            ]
            const n: Vec3 = [-px[0] / radius, 0, -px[2] / radius]
            const cosH = Math.abs(n[0] * dir[0] + n[2] * dir[2])
            const cosV = Math.sqrt(Math.max(0, 1 - dir[1] * dir[1]))
            const worldPerPixel = (2 * TAN_HALF_V * t) / PX_V
            const world = (2 * Math.PI * radius) / cells
            const h = (world * cosH) / worldPerPixel
            const v = (world * cosV) / worldPerPixel
            if (tag === 'fine') {
              if (h < worst.fineH) {
                worst = { ...worst, fineH: h }
                where = `${variant.label} p=${(i / 200).toFixed(3)}`
              }
              worst = { ...worst, fineV: Math.min(worst.fineV, v) }
            } else {
              worst = { ...worst, coarseH: Math.min(worst.coarseH, h), coarseV: Math.min(worst.coarseV, v) }
            }
          }
        }
      }
    }
  }

  check(
    'el peor período de la trama FINA está muy por encima de Nyquist, en los dos ejes',
    Math.min(worst.fineH, worst.fineV) > 16,
    `horizontal ${worst.fineH.toFixed(1)} px (${where}) · vertical ${worst.fineV.toFixed(1)} px · Nyquist 2 px → ${(Math.min(worst.fineH, worst.fineV) / 2).toFixed(0)}× de margen`
  )
  check(
    'y el de la gruesa, más todavía',
    Math.min(worst.coarseH, worst.coarseV) > worst.fineH,
    `horizontal ${worst.coarseH.toFixed(1)} px · vertical ${worst.coarseV.toFixed(1)} px`
  )

  /**
   * El riesgo real de una trama de LÍNEAS no es el período sino el grosor: la
   * línea es el 5,5% de la celda fina y el 2,7% de la gruesa, así que es ella la
   * que primero cae bajo el muestreo.
   */
  const fineLine = worst.fineH * lineDuty(FINE_CELLS)
  const coarseLine = worst.coarseH * lineDuty(MOIRE_COARSE_CELLS)
  check(
    'y el TRAZO, que es lo más fino que hay, sigue arriba de Nyquist en el peor rayo',
    Math.min(fineLine, coarseLine) > 2,
    `trazo fino ${fineLine.toFixed(2)} px · trazo grueso ${coarseLine.toFixed(2)} px — abajo de eso el mipmap lo promedia a gris en vez de dejarlo titilar`
  )
  check(
    'las dos capas llevan el MISMO trazo en ángulo, que es lo que hace el sitio',
    Math.abs(lineDuty(FINE_CELLS) * (360 / FINE_CELLS) - MOIRE_LINE_DEG) < 1e-9 &&
      Math.abs(lineDuty(MOIRE_COARSE_CELLS) * (360 / MOIRE_COARSE_CELLS) - MOIRE_LINE_DEG) < 1e-9,
    `${MOIRE_LINE_DEG}° en las dos = ${(lineDuty(FINE_CELLS) * 100).toFixed(1)}% de la celda fina y ${(lineDuty(MOIRE_COARSE_CELLS) * 100).toFixed(1)}% de la gruesa — 1 px sobre 32 y sobre 64 en HeroBackground`
  )
}

// ── 5 · Cuánto cuadro cubre la envolvente ───────────────────────────────────

section('Cobertura: el overdraw que este sprint suma')

{
  const POSES: readonly [string, number, number, number][] = [
    ['hero', 0, 0, 6.4],
    ['quiénes somos', 0.375, 130, -3.6],
    ['números', 0.5, 185, 9],
    ['trabajos', 0.625, 195, 4.5],
    ['demos', 0.75, 310, -2.6],
    ['cierre', 0.95, 360, -1.4],
  ]
  const rows: string[] = []
  let worstNear = 0
  let worstFar = 0
  for (const [name, at, azimuth, height] of POSES) {
    const sample = sampleFrame(
      at,
      { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height },
      { backdrop: true, mismatch: MOIRE_MISMATCH },
      160,
      90
    )
    worstNear = Math.max(worstNear, sample.nearLayer)
    worstFar = Math.max(worstFar, sample.farLayer)
    rows.push(`${name} ${(sample.nearLayer * 100).toFixed(0)}/${(sample.farLayer * 100).toFixed(0)}%`)
  }
  check(
    'las dos capas nunca cubren más que el cuadro entero',
    worstNear <= 1 && worstFar <= 1,
    `fina/gruesa por pose: ${rows.join(' · ')}`
  )
  check(
    'y hay poses donde la envolvente casi no se ve, porque el cuadro es piso',
    Math.min(...POSES.map(([, at, azimuth, height]) =>
      sampleFrame(at, { progress: at, cameraAzimuthDeg: azimuth, cameraHeight: height }, { backdrop: true }, 120, 68).nearLayer
    )) < 0.25,
    'es el techo que ninguna perilla del fondo puede levantar — ver S10-FONDO.md §2'
  )
}

report('s10 · el batido y el aliasing')
