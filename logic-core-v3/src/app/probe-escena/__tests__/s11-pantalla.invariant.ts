/**
 * COMPROBACIONES DE S11 · cómo cae la proyección en PANTALLA.
 *
 *     npx tsx src/app/probe-escena/__tests__/s11-pantalla.invariant.ts
 *
 * `s11-proyeccion` mide la celosía en unidades de mundo. Acá se la pasa a
 * píxeles, que es donde se decide si se ve: cuántas bandas de batido entran en el
 * cuadro, y si la trama se puede dibujar sin titilar.
 *
 * La envolvente dibujada tiene mipmaps y S10 los midió: 26 veces de margen sobre
 * Nyquist. **El gobo no tiene nada**: es analítico, se evalúa por fragmento y no
 * hay ninguna cadena de mipmaps que lo promedie cuando la trama deja de
 * resolverse. El filtro es de él, y ésta es la suite que lo mide y lo obliga a
 * entrar.
 *
 * Es el mismo tema que `s10-batido` cubre para la pared vista de frente, con una
 * diferencia: sobre el piso el rango de huellas es enorme —de 100 px por celda en
 * la mediana a 1,2 px en el peor rayo rasante— y lo que decide no es la mediana
 * sino la cola.
 */
import { celosiaBarAt, celosiaBarFiltered, celosiaCrossings, celosiaLayers } from '@/app/v3/_lib/escena/celosiaGeometry'
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import { sampleLightArc } from '@/app/v3/_lib/escena/choreographySampler'
import type { MutableLightLevels } from '@/app/v3/_lib/escena/choreographyTypes'
import { CELOSIA_BAR } from '@/app/v3/_lib/escena/probeCelosia'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'
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
import { rayFloor, track } from './frameProbe'
import { sunDirectionAt } from './shading'

const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)
const TAN_H = Math.tan((half.h * Math.PI) / 180)
const PX_H = 1920
const PX_V = 1080
const LAYERS = celosiaLayers(MOIRE_MISMATCH)
const RAD = Math.PI / 180
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

/** El azimut del sol en un progreso. */
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

// ── El aliasing, sobre los cinco recorridos ───────────────────────────────────

section('Aliasing: la huella sobre el piso y el filtro que la absorbe')

{
  function wrap(delta: number, cells: number): number {
    let d = delta
    while (d > cells / 2) d -= cells
    while (d < -cells / 2) d += cells
    return d
  }

  const footprints: number[] = []
  const pose = emptyPose()
  for (const variant of CHOREO_VARIANTS) {
    const built = makeTrack(variant.keyframes)
    for (let i = 0; i <= 60; i += 1) {
      const p = i / 60
      const cam = cameraAt(built, p, ASPECT, pose)
      const sun = sunDirectionAt(p)
      for (let iy = -5; iy <= 5; iy += 1) {
        for (let ix = -7; ix <= 7; ix += 1) {
          const make = (dx: number, dy: number): Vec3 => {
            const nx = ((ix + dx) / 7) * TAN_H
            const ny = ((iy + dy) / 5) * TAN_HALF_V
            const raw: Vec3 = [
              cam.forward[0] + cam.right[0] * nx + cam.up[0] * ny,
              cam.forward[1] + cam.right[1] * nx + cam.up[1] * ny,
              cam.forward[2] + cam.right[2] * nx + cam.up[2] * ny,
            ]
            const length = Math.hypot(raw[0], raw[1], raw[2])
            return [raw[0] / length, raw[1] / length, raw[2] / length]
          }
          const hitAt = (direction: Vec3): Vec3 | null => {
            const t = rayFloor(cam.position, direction)
            if (!isFinite(t)) return null
            return [
              cam.position[0] + direction[0] * t,
              cam.position[1] + direction[1] * t,
              cam.position[2] + direction[2] * t,
            ]
          }
          const base = hitAt(make(0, 0))
          if (!base) continue
          const here = celosiaCrossings(base, sun, LAYERS[0], 0)[0]
          if (!here) continue
          let footprint = 0
          for (const step of [make(7 / (PX_H / 2), 0), make(0, 5 / (PX_V / 2))]) {
            const point = hitAt(step)
            if (!point) continue
            const there = celosiaCrossings(point, sun, LAYERS[0], 0)[0]
            if (!there) continue
            footprint = Math.max(
              footprint,
              Math.abs(wrap(there.u - here.u, LAYERS[0].cells)),
              Math.abs(there.v - here.v)
            )
          }
          if (footprint > 0) footprints.push(footprint)
        }
      }
    }
  }
  footprints.sort((a, b) => a - b)
  const quantile = (f: number) =>
    footprints[Math.min(footprints.length - 1, Math.floor(f * footprints.length))]
  const worst = footprints[footprints.length - 1]
  const over = footprints.filter((value) => value > 0.5).length

  check(
    'la mediana de la huella deja la celda enorme en pantalla',
    1 / quantile(0.5) > 40,
    `mediana ${quantile(0.5).toFixed(4)} celdas/px = ${(1 / quantile(0.5)).toFixed(0)} px por celda · p99 ${(1 / quantile(0.99)).toFixed(1)} px`
  )
  check(
    'pero la cola rasante baja de Nyquist, y por eso el filtro NO es opcional',
    worst > 0.5,
    `peor rayo ${worst.toFixed(4)} celdas/px = ${(1 / worst).toFixed(1)} px por celda · barra ${(CELOSIA_BAR / worst).toFixed(2)} px · ${over} de ${footprints.length} rayos (${((over / footprints.length) * 100).toFixed(3)}%) pasan media celda`
  )

  /**
   * ⚠️ **CONTROL POSITIVO DEL FILTRO.** "El filtro promedia" es una afirmación
   * sobre algo que casi nunca ocurre, así que hay que forzarlo: con huella cero el
   * perfil tiene que ser BINARIO, y con huella de una celda tiene que valer
   * exactamente la barra — el promedio de la trama.
   */
  const hardIn = celosiaBarFiltered(0, CELOSIA_BAR, 0)
  const hardOut = celosiaBarFiltered(0.4, CELOSIA_BAR, 0)
  check(
    'control positivo — con huella cero el perfil es binario: adentro 1, afuera 0',
    Math.abs(hardIn - 1) < 1e-9 && Math.abs(hardOut) < 1e-9,
    `${hardIn.toFixed(3)} en el centro de la barra contra ${hardOut.toFixed(3)} en el hueco`
  )
  const blurredIn = celosiaBarFiltered(0, CELOSIA_BAR, 1)
  const blurredOut = celosiaBarFiltered(0.4, CELOSIA_BAR, 1)
  check(
    'control positivo — con huella de una celda el patrón se reemplaza por su propia media',
    Math.abs(blurredIn - CELOSIA_BAR) < 1e-9 && Math.abs(blurredOut - CELOSIA_BAR) < 1e-9,
    `${blurredIn.toFixed(3)} y ${blurredOut.toFixed(3)} contra una barra de ${CELOSIA_BAR} — gris parejo en vez de titileo`
  )
  check(
    'y el perfil duro y el filtrado son el mismo patrón donde se resuelve',
    Math.abs(celosiaBarAt(0.05, CELOSIA_BAR) - celosiaBarFiltered(0.05, CELOSIA_BAR, 1e-4)) < 1e-6,
    'el filtro no cambia el dibujo: solo lo apaga cuando deja de caber en un píxel'
  )
}

// ── El batido en píxeles, pose por pose ──────────────────────────────────────

section('El batido proyectado, en píxeles de pantalla')

/**
 * El mismo método que S10 usó para la pared (§3.3): se toma el rayo al piso más
 * cercano al centro del cuadro, se mide el paso proyectado ahí y se lo pasa a
 * píxeles con el mundo-por-píxel de esa profundidad, sobre 1920×1080.
 */
{
  const POSES: readonly [string, number][] = [
    ['hero', 0],
    ['números', 0.5],
    ['trabajos', 0.625],
    ['cierre', 0.95],
  ]
  const rows: string[] = []
  let worstBands = 0
  let bestBands = Infinity
  for (const [name, at] of POSES) {
    const cam = cameraAt(track, at, ASPECT, emptyPose())
    const sun = sunDirectionAt(at)
    let hit: Vec3 | null = null
    let depth = 0
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
        hit = [cam.position[0] + dir[0] * t, cam.position[1] + dir[1] * t, cam.position[2] + dir[2] * t]
        depth = t
        break
      }
    }
    if (!hit) continue
    const azimuth = sunAzimuthAt(at)
    const tangent: Vec3 = [Math.cos(azimuth), 0, -Math.sin(azimuth)]
    const g = LAYERS.map((layer) => phaseGradient(hit, sun, layer, tangent))
    const worldPerPixel = (2 * TAN_HALF_V * depth) / PX_V
    const cellPx = 1 / g[0] / worldPerPixel
    const beatPx = 1 / Math.abs(g[0] - 2 * g[1]) / worldPerPixel
    const bands = PX_H / beatPx
    worstBands = Math.max(worstBands, bands)
    bestBands = Math.min(bestBands, bands)
    rows.push(`${name} celda ${cellPx.toFixed(0)}px · batido ${beatPx.toFixed(0)}px = ${bands.toFixed(1)} bandas`)
  }
  check(
    'el batido entra en el cuadro entre dos y cinco bandas: se lee como banda, no como textura',
    bestBands > 1.5 && worstBands < 6,
    rows.join(' · ')
  )
  check(
    'y la celda proyectada mide decenas de píxeles: la trama del piso es GRANDE',
    rows.length === 4,
    'contra las 24,9 celdas a lo ancho del cuadro que la capa fina dibuja sobre la pared'
  )
}

report('s11 · la proyección en pantalla')
