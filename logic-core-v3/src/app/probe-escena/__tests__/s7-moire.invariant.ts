/**
 * COMPROBACIONES DE S7 · el moiré y el camino de vuelta al archivo.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-moire.invariant.ts
 *
 * Dos cosas que no se pueden verificar mirando: que la trama de rendijas esté
 * muy por encima del límite de muestreo en los CUATRO recorridos —el aliasing
 * no se ve hasta que se ve— y que el exportador siga devolviendo el archivo
 * byte por byte, que es lo único que garantiza que calibrar no pierda el
 * razonamiento escrito.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CHOREO_KEYFRAMES } from '../_components/choreography'
import { CHOREO_VARIANTS, VARIANT_DEFINITIVA } from '../_components/choreographyVariants'
import { buildKeyframesSource } from '../_components/choreographyExport'
import { createChoreoEditor } from '../_components/choreographyEditor'
import { SUN_CORE, createSunSpriteData } from '../_components/probeSun'
import {
  MOIRE_BOTTOM,
  MOIRE_DOT_COLUMNS,
  MOIRE_RADIUS,
  MOIRE_SLATS,
  MOIRE_SLAT_DUTY,
  MOIRE_SLAT_SLANT,
  MOIRE_TOP,
  createSlatSpriteData,
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

const RAD = Math.PI / 180

// ── 6 · El moiré ────────────────────────────────────────────────────────────

section('El moiré contra el aliasing')

{
  const circumference = 2 * Math.PI * MOIRE_RADIUS
  const slatPitch = circumference / MOIRE_SLATS
  const beatBands = Math.abs(MOIRE_DOT_COLUMNS - MOIRE_SLATS)
  const beatPitch = circumference / beatBands
  check(
    'el batido es mucho más grueso que las tramas que lo producen',
    beatPitch / slatPitch >= 8,
    `${beatBands} bandas en la vuelta · paso ${beatPitch.toFixed(1)} contra ${slatPitch.toFixed(2)} de la rendija`
  )

  const maxCameraDistance = Math.max(
    ...CHOREO_VARIANTS.flatMap((variant) => variant.keyframes.map((k) => k.pose.distance))
  )
  check(
    'la pantalla queda siempre más lejos que la cámara más lejana',
    MOIRE_RADIUS > maxCameraDistance + 5,
    `pantalla en ${MOIRE_RADIUS}, cámara máxima en ${maxCameraDistance}`
  )

  // Píxeles por período de rendija, en el peor rayo del peor recorrido.
  function hitCylinder(origin: Vec3, dir: Vec3): number | null {
    const a = dir[0] * dir[0] + dir[2] * dir[2]
    if (a <= 1e-9) return null
    const b = 2 * (origin[0] * dir[0] + origin[2] * dir[2])
    const c = origin[0] * origin[0] + origin[2] * origin[2] - MOIRE_RADIUS * MOIRE_RADIUS
    const disc = b * b - 4 * a * c
    if (disc < 0) return null
    const t = (-b + Math.sqrt(disc)) / (2 * a)
    return t > 1e-4 ? t : null
  }

  let worstPx = Infinity
  let worstVariant = ''
  for (const variant of CHOREO_VARIANTS) {
    const track = makeTrack(variant.keyframes)
    const pose = emptyPose()
    const half = halfFovDeg(16 / 9)
    const tanH = Math.tan(half.h * RAD)
    for (let i = 0; i <= 300; i += 1) {
      const cam = cameraAt(track, i / 300, 16 / 9, pose)
      for (let iy = -3; iy <= 3; iy += 1) {
        for (let ix = -6; ix <= 6; ix += 1) {
          const nx = (ix / 6) * tanH
          const ny = (iy / 3) * TAN_HALF_V
          const d: Vec3 = [
            cam.forward[0] + cam.right[0] * nx + cam.up[0] * ny,
            cam.forward[1] + cam.right[1] * nx + cam.up[1] * ny,
            cam.forward[2] + cam.right[2] * nx + cam.up[2] * ny,
          ]
          const l = Math.hypot(d[0], d[1], d[2])
          const dir: Vec3 = [d[0] / l, d[1] / l, d[2] / l]
          const t = hitCylinder(cam.position, dir)
          if (t === null) continue
          const y = cam.position[1] + dir[1] * t
          if (y < MOIRE_BOTTOM || y > MOIRE_TOP) continue
          const px: Vec3 = [
            cam.position[0] + dir[0] * t,
            y,
            cam.position[2] + dir[2] * t,
          ]
          const n: Vec3 = [-px[0] / MOIRE_RADIUS, 0, -px[2] / MOIRE_RADIUS]
          const cosInc = Math.abs(n[0] * dir[0] + n[2] * dir[2])
          const worldPerPixel = (2 * TAN_HALF_V * t) / 1080
          const pixels = (slatPitch * cosInc) / worldPerPixel
          if (pixels < worstPx) {
            worstPx = pixels
            worstVariant = variant.label
          }
        }
      }
    }
  }
  check(
    'el peor período de rendija de los CUATRO recorridos está muy por encima de Nyquist',
    worstPx > 16,
    `${worstPx.toFixed(1)} px (en ${worstVariant}) contra un límite de 2 px — ${(worstPx / 2).toFixed(0)}× de margen`
  )
}

section('Las dos tramas generadas')

{
  const size = 64
  const slats = createSlatSpriteData(size, MOIRE_SLAT_DUTY, MOIRE_SLAT_SLANT)
  const alphaAt = (x: number, y: number) => slats[(y * size + x) * 4 + 1] / 255

  let topZero = true
  let bottomZero = true
  for (let x = 0; x < size; x += 1) {
    if (alphaAt(x, 0) > 0.02) bottomZero = false
    if (alphaAt(x, size - 1) > 0.02) topZero = false
  }
  check('la trama de rendijas se desvanece en el borde de abajo', bottomZero)
  check('y en el de arriba: la pantalla no tiene bordes duros', topZero)

  const middle = Math.floor(size / 2)
  let open = 0
  for (let x = 0; x < size; x += 1) if (alphaAt(x, middle) > 0.5) open += 1
  check(
    'en el medio de la banda la rendija tiene el ancho que dice tener',
    Math.abs(open / size - MOIRE_SLAT_DUTY) < 0.08,
    `${((open / size) * 100).toFixed(0)}% contra un duty de ${(MOIRE_SLAT_DUTY * 100).toFixed(0)}%`
  )

  const sun = createSunSpriteData(64, SUN_CORE, 0.5, 2.4)
  const sunAlpha = (x: number, y: number) => sun[(y * 64 + x) * 4 + 3] / 255
  check('el núcleo del sol es opaco en el centro', sunAlpha(32, 32) > 0.99)
  check('el halo se apaga del todo en el borde', sunAlpha(0, 32) < 0.02)
  const coreEdge = Math.round(32 + SUN_CORE * 32)
  check(
    'hay un escalón entre el disco y el halo: es lo que lo hace leer como fuente',
    sunAlpha(coreEdge - 3, 32) - sunAlpha(coreEdge + 3, 32) > 0.2,
    `${sunAlpha(coreEdge - 3, 32).toFixed(2)} adentro contra ${sunAlpha(coreEdge + 3, 32).toFixed(2)} afuera`
  )
}

// ── 7 · El camino de vuelta al archivo ──────────────────────────────────────

section('El export devuelve el archivo')

{
  const editor = createChoreoEditor()
  const emitted = buildKeyframesSource(editor.keyframes, VARIANT_DEFINITIVA)

  const source = readFileSync(
    join(process.cwd(), 'src/app/probe-escena/_components/choreography.ts'),
    'utf8'
  )
  const start = source.indexOf('/**\n * El recorrido.')
  const constIndex = source.indexOf('export const CHOREO_KEYFRAMES')
  const end = source.indexOf('\n]\n', constIndex)
  const onFile = start >= 0 && end >= 0 ? `${source.slice(start, end + 3)}` : ''

  check(
    'exportar la definitiva sin tocar nada devuelve el bloque del archivo, byte por byte',
    emitted === onFile,
    `${emitted.length} bytes emitidos contra ${onFile.length} en el archivo`
  )

  editor.setVariant('intima')
  const intima = buildKeyframesSource(editor.keyframes, editor.variant)
  check(
    'exportar una variante NO emite el nombre del recorrido definitivo',
    intima.includes('export const VARIANT_INTIMA_KEYFRAMES') &&
      !intima.includes('export const CHOREO_KEYFRAMES'),
    'pegar una variante sobre `choreography.ts` pisaría la coreografía definitiva'
  )
  check('el censo del doc cuenta las poses de la variante activa', intima.includes('24 keyframes'))

  editor.setVariant('definitiva')
  check('volver a la definitiva no perdió su sesión', editor.keyframes.length === CHOREO_KEYFRAMES.length)
  check('y sigue sin estar sucia', editor.dirty === false)
}

report('s7 · moiré y export')
