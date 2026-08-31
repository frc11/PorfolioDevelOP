/**
 * COMPROBACIONES DE S10 · las partículas, que pasaron a ser el relleno.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-particulas.invariant.ts
 *
 * Tres cosas que no se pueden verificar mirando:
 *
 *   1. Que la deriva sea **diferencial** — una constante por concha, la interior
 *      más rápido — y que las cantidades no se desincronicen del array de conchas.
 *   2. **El recorte de `gl_PointSize`**, que es un defecto y no un efecto, y que
 *      con el campo de bokeh por dentro de la órbita no puede ocurrir.
 *   3. El número que consume el sprint del preloader: cuántas partículas quedan
 *      en cuadro en la pose inicial.
 */
import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import {
  BOKEH_BOB_AMPLITUDE,
  BOKEH_BOB_PERIOD_S,
  BOKEH_SPIN_DEG_S,
  DUST_BOB_AMPLITUDE,
  DUST_BOB_PERIOD_S,
  DUST_SPIN_DEG_S,
  MOUSE_HEIGHT_FACTOR,
} from '@/app/v3/_lib/escena/choreographyPhysics'
import {
  BOKEH_COUNT,
  BOKEH_RADIUS_BIAS,
  BOKEH_R_MAX,
  BOKEH_R_MIN,
  BOKEH_SEED,
  BOKEH_SHELLS,
  BOKEH_SIZE,
  DUST_SHELLS,
  PARTICLES_MAX,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
  PARTICLE_R_MAX,
  PARTICLE_R_MIN,
  PARTICLE_SEED,
  PARTICLE_SIZE,
  buildParticleField,
} from '@/app/v3/_lib/escena/probeParticles'
import { PROBE_DEFAULTS } from '@/app/v3/_lib/escena/probeStore'
import {
  angularOffset,
  cameraAt,
  check,
  emptyPose,
  halfFovDeg,
  report,
  section,
  type Vec3,
} from './harness'
import { track } from './frameProbe'
import { shadeUnlit } from './shading'

const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)

// ── 3 · Las partículas ──────────────────────────────────────────────────────

section('Las partículas: el relleno de la escena vacía')

const CSS_HEIGHT = 1080
const DEVICE_WIDTH = 1920 * 1.5
const DEVICE_HEIGHT = 1080 * 1.5
const DPR = 1.5
/**
 * `gl_PointSize = size × dpr × (altoCSS / 2) / profundidad`.
 *
 * Sale de `points.glsl.js` (`gl_PointSize *= scale / -mvPosition.z`) y de
 * `WebGLMaterials.refreshUniformsPoints` (`size × pixelRatio`, `scale = alto/2`).
 * **No interviene el FOV**, que es la parte contraintuitiva: un punto de tamaño S
 * a profundidad d ocupa S/(2d) del alto del viewport, sea cual sea la lente.
 */
function pointPixels(size: number, depth: number): number {
  return (size * DPR * (CSS_HEIGHT / 2)) / depth
}
/** Recorte típico de `ALIASED_POINT_SIZE_RANGE`. */
const POINT_LIMIT = 1024

{
  check(
    'hay una constante de deriva por concha, en los dos campos',
    DUST_SPIN_DEG_S.length === DUST_SHELLS.length - 1 &&
      DUST_BOB_AMPLITUDE.length === DUST_SHELLS.length - 1 &&
      DUST_BOB_PERIOD_S.length === DUST_SHELLS.length - 1 &&
      BOKEH_SPIN_DEG_S.length === BOKEH_SHELLS.length - 1 &&
      BOKEH_BOB_AMPLITUDE.length === BOKEH_SHELLS.length - 1 &&
      BOKEH_BOB_PERIOD_S.length === BOKEH_SHELLS.length - 1,
    `${DUST_SHELLS.length - 1} conchas de polvo · ${BOKEH_SHELLS.length - 1} de bokeh`
  )
  check(
    'la rotación es DIFERENCIAL: la concha interior gira más rápido',
    DUST_SPIN_DEG_S.every((spin, i) => i === 0 || Math.abs(spin) < Math.abs(DUST_SPIN_DEG_S[i - 1])) &&
      BOKEH_SPIN_DEG_S.every((spin, i) => i === 0 || Math.abs(spin) < Math.abs(BOKEH_SPIN_DEG_S[i - 1])),
    `polvo ${DUST_SPIN_DEG_S.join(' / ')} °/s · bokeh ${BOKEH_SPIN_DEG_S.join(' / ')} °/s`
  )
  check(
    'los dos campos giran en sentidos opuestos, como desde S6',
    DUST_SPIN_DEG_S[0] * BOKEH_SPIN_DEG_S[0] < 0
  )
  check(
    'los períodos de cabeceo son todos distintos entre sí',
    new Set([...DUST_BOB_PERIOD_S, ...BOKEH_BOB_PERIOD_S]).size ===
      DUST_BOB_PERIOD_S.length + BOKEH_BOB_PERIOD_S.length,
    [...DUST_BOB_PERIOD_S, ...BOKEH_BOB_PERIOD_S].join(' / ')
  )

  /**
   * ⚠️ **EL RECORTE DEL BOKEH — y por qué la palanca es `BOKEH_R_MAX`.**
   *
   * Con el campo entre 4,2 y 30 las conchas barren todos los azimuts al girar, y
   * el campo abarca los radios donde la cámara vive: tarde o temprano una
   * partícula le pasa por la lente. Medido sobre el recorrido con el mouse al
   * máximo, la distancia mínima era **0,023** — o sea 42.000 px pedidos.
   *
   * Con el campo por dentro de la órbita la separación mínima es una propiedad de
   * la geometría y no de la suerte.
   */
  const closestCamera = Math.min(...CHOREO_KEYFRAMES.map((keyframe) => keyframe.pose.distance))
  check(
    'el campo de bokeh queda entero POR DENTRO de la órbita de la cámara',
    BOKEH_R_MAX < closestCamera,
    `radio máximo ${BOKEH_R_MAX} contra una cámara que nunca baja de ${closestCamera}`
  )

  const bokeh = buildParticleField(
    BOKEH_COUNT,
    BOKEH_R_MIN,
    BOKEH_R_MAX,
    BOKEH_RADIUS_BIAS,
    BOKEH_SEED,
    -3.9,
    BOKEH_SHELLS
  )
  // La concha gira, así que una partícula visita todos los azimuts: su distancia
  // mínima a la cámara es hypot(radio horizontal − distancia, altura − altura).
  let closest = Infinity
  const pose = emptyPose()
  for (let i = 0; i <= 400; i += 1) {
    cameraAt(track, i / 400, ASPECT, pose)
    for (const mouse of [-1, 0, 1]) {
      const cameraHeight = pose.height + mouse * MOUSE_HEIGHT_FACTOR * pose.distance
      for (let k = 0; k < BOKEH_COUNT; k += 1) {
        const x = bokeh.positions[k * 3]
        const y = bokeh.positions[k * 3 + 1]
        const z = bokeh.positions[k * 3 + 2]
        for (const bob of [-BOKEH_BOB_AMPLITUDE[0], 0, BOKEH_BOB_AMPLITUDE[0]]) {
          const distance = Math.hypot(Math.hypot(x, z) - pose.distance, y + bob - cameraHeight)
          if (distance < closest) closest = distance
        }
      }
    }
  }
  const worstPixels = pointPixels(BOKEH_SIZE, closest)
  check(
    'y por eso el `gl_PointSize` del bokeh NO puede llegar al recorte del driver',
    worstPixels < POINT_LIMIT,
    `separación mínima ${closest.toFixed(2)} → ${worstPixels.toFixed(0)} px pedidos contra un recorte de ${POINT_LIMIT} · el límite se alcanzaría a ${((BOKEH_SIZE * DPR * (CSS_HEIGHT / 2)) / POINT_LIMIT).toFixed(2)} de la lente`
  )

  /**
   * El polvo SÍ puede llegar al recorte, y no se puede evitar: su campo tiene que
   * abarcar los radios de la cámara o no hay paralaje. Su techo lo pone el near
   * plane, y lo acota `PARTICLE_SIZE`.
   */
  const dustCeiling = pointPixels(PARTICLE_SIZE, 0.1)
  check(
    'el polvo puede recortarse, y su techo es el near plane — está acotado y dicho',
    dustCeiling < 2000,
    `a 0,1 de la cámara pide ${dustCeiling.toFixed(0)} px · el recorte empieza a ${((PARTICLE_SIZE * DPR * (CSS_HEIGHT / 2)) / POINT_LIMIT).toFixed(3)} de la lente`
  )

  /** El número que consume el sprint del preloader. */
  const dust = buildParticleField(
    PARTICLES_MAX,
    PARTICLE_R_MIN,
    PARTICLE_R_MAX,
    1.4,
    PARTICLE_SEED,
    -3.9,
    DUST_SHELLS
  )
  function inFrame(
    positions: Float32Array,
    shells: readonly number[],
    total: number,
    drawn: number,
    size: number
  ): { count: number; overdraw: number } {
    const cam = cameraAt(track, 0, ASPECT, emptyPose())
    const share = drawn / total
    let visible = 0
    let area = 0
    for (let s = 0; s < shells.length - 1; s += 1) {
      const from = Math.round(shells[s] * total)
      const to = from + Math.round((Math.round(shells[s + 1] * total) - from) * share)
      for (let i = from; i < to; i += 1) {
        const point: Vec3 = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]
        const offset = angularOffset(cam, point)
        if (offset.depth <= 0.1) continue
        if (Math.abs(offset.h) > half.h || Math.abs(offset.v) > half.v) continue
        visible += 1
        const px = Math.min(POINT_LIMIT, pointPixels(size, offset.depth))
        area += Math.PI * (px / 2) ** 2
      }
    }
    return { count: visible, overdraw: area / (DEVICE_WIDTH * DEVICE_HEIGHT) }
  }

  const dustFrame = inFrame(
    dust.positions,
    DUST_SHELLS,
    PARTICLES_MAX,
    PROBE_DEFAULTS.particleCount,
    PARTICLE_SIZE
  )
  const bokehFrame = inFrame(bokeh.positions, BOKEH_SHELLS, BOKEH_COUNT, BOKEH_COUNT, BOKEH_SIZE)
  check(
    'en la pose INICIAL el campo está poblado — el número que hereda el preloader',
    dustFrame.count + bokehFrame.count > 900,
    `${dustFrame.count} de polvo + ${bokehFrame.count} de bokeh = ${dustFrame.count + bokehFrame.count} en cuadro, contra 94 antes de S10`
  )
  check(
    'y el overdraw que suman es chico',
    dustFrame.overdraw + bokehFrame.overdraw < 0.15,
    `${((dustFrame.overdraw + bokehFrame.overdraw) * 100).toFixed(1)}% del cuadro a 1920×1080 con dpr 1,5 · polvo ${(dustFrame.overdraw * 100).toFixed(1)}% · bokeh ${(bokehFrame.overdraw * 100).toFixed(1)}%`
  )
  check(
    'el campo sale ordenado por radio, que es lo que hace posibles las conchas',
    (() => {
      for (let s = 0; s < DUST_SHELLS.length - 2; s += 1) {
        const cut = Math.round(DUST_SHELLS[s + 1] * PARTICLES_MAX)
        if (dust.radii[cut - 1] > dust.radii[cut]) return false
      }
      return true
    })(),
    `cortes en ${DUST_SHELLS.slice(1, -1).map((s) => dust.radii[Math.round(s * PARTICLES_MAX)].toFixed(1)).join(' y ')} de radio`
  )
  check(
    'la mota cercana es netamente más oscura que la lejana',
    shadeUnlit(PARTICLE_NEAR_COLOR) < shadeUnlit(PARTICLE_FAR_COLOR) - 100,
    `${shadeUnlit(PARTICLE_NEAR_COLOR).toFixed(0)} contra ${shadeUnlit(PARTICLE_FAR_COLOR).toFixed(0)} — la perspectiva atmosférica es lo que las hace leer como volumen`
  )
}

report('s10 · las partículas')
