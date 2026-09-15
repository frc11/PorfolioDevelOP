/**
 * EL BANCO DE MEDICIÓN DE S7 — la geometría del recorrido, sin three y sin DOM.
 *
 * S6 corrió 37 comprobaciones estáticas y no las dejó en el repo: los números de
 * su reporte no se pueden volver a verificar. Éstas sí quedan, y corren con el
 * mismo runner que el resto de los `.invariant.ts` del repo:
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-recorridos.invariant.ts
 *     npx tsx src/app/probe-escena/__tests__/s7-luz.invariant.ts
 *
 * Reimplementa la cámara —posición, base de pantalla y encuadre— en lugar de
 * importar `cameraFraming.ts`, por una sola razón: ese módulo importa `three`,
 * que en node arrastra el paquete entero para hacer tres productos vectoriales.
 * La aritmética es idéntica y está anotada contra su fuente.
 *
 * ── ⚠️ LOS VALORES DE LA LENTE YA NO SE COPIAN: SE CONSUMEN ────────────────
 *
 * Hasta acá este bloque escribía `35`, `0.88`, `7.168` y `-(0.007 * 1024) / 2 -
 * 0.72` a mano, con la razón *«se repite para no arrastrar three»*. **Esa razón
 * era falsa y se puede comprobar en una línea:** `probeScene.ts` no importa
 * `three` —su única importación es `@/lib/logo-footprint`, que no importa
 * nada—, y cinco instrumentos de esta misma carpeta ya lo importan para sacar
 * colores (`celosiaBeat.ts`, `frameProbe.ts`, `s11-piso`, `s11-sin-sol`,
 * `shading.ts`). Lo que arrastra `three` es `cameraFraming.ts`, que es otro
 * archivo y sigue sin importarse: la reimplementación de la CÁMARA se queda,
 * la copia de los NÚMEROS se va.
 *
 * De esa copia colgaban dieciséis instrumentos —`s10-logo` y `s16-encuadre`
 * incluidos—, así que un fov movido en `probeScene.ts` y no acá los dejaba a
 * todos verdes midiendo la lente vieja. El guardián de que no vuelva está en
 * `_lib/escena/__tests__/s16-arnes.invariant.ts`, con su control positivo.
 *
 * Los nombres y los valores no cambian: son las MISMAS constantes, al bit.
 */
import { buildTrack, sampleTrack } from '@/app/v3/_lib/escena/choreographySampler'
import type { ChoreoKeyframe, MutableChoreoPose } from '@/app/v3/_lib/escena/choreographyTypes'
import { CAMERA_FOV, FLOOR_Y, FRAME_TRAVEL_SAFETY } from '@/app/v3/_lib/escena/probeScene'
import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

/** `CAMERA_FOV` de `probeScene.ts`. No se copia: se consume. */
export const FOV = CAMERA_FOV
export const TAN_HALF_V = Math.tan(((FOV / 2) * Math.PI) / 180)
/** `FRAME_TRAVEL_SAFETY` y `FLOOR_Y` de `probeScene.ts`, tal cual. */
export { FLOOR_Y, FRAME_TRAVEL_SAFETY }
/**
 * La caja del logo extruido: el CUADRADO de 1024 del SVG llevado a mundo,
 * 7,168 × 7,168 × 0,56.
 *
 * ⚠️ **Que sea `LOGO_BOX_WORLD` no cierra §7.15 de `DIRECCION-ESCENA.md`.** Ese
 * pendiente pregunta otra cosa —si el arnés debería usar la caja del MESH
 * medido (6,863 × 4,779), que es la que el rig le pasa a `aimWithFraming`— y
 * sigue abierto. Acá sólo deja de estar escrito el mismo número dos veces.
 */
export const LOGO_W = LOGO_BOX_WORLD
export const LOGO_H = LOGO_BOX_WORLD

export type Vec3 = readonly [number, number, number]

export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const len = (a: Vec3): number => Math.sqrt(dot(a, a))
export const norm = (a: Vec3): Vec3 => {
  const l = len(a)
  return [a[0] / l, a[1] / l, a[2] / l]
}
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

export type CameraFrame = {
  readonly position: Vec3
  readonly right: Vec3
  readonly up: Vec3
  readonly forward: Vec3
  readonly eyeDistance: number
  readonly pose: Readonly<MutableChoreoPose>
}

/**
 * La base que `Object3D.lookAt` construye: `z = normalize(eye − target)`,
 * `x = normalize(cross(up, z))`, `y = cross(z, x)`.
 */
function lookAtBasis(position: Vec3, target: Vec3) {
  const z = norm(sub(position, target))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  return { right: x, up: y, forward: [-z[0], -z[1], -z[2]] as Vec3 }
}

export type Track = ReturnType<typeof buildTrack>

export function makeTrack(keyframes: readonly ChoreoKeyframe[]): Track {
  return buildTrack(keyframes)
}

export function emptyPose(): MutableChoreoPose {
  return { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
}

/** La cámara en un progreso, con el encuadre ya aplicado. Igual que el loop. */
export function cameraAt(
  track: Track,
  progress: number,
  aspect: number,
  out: MutableChoreoPose
): CameraFrame {
  sampleTrack(track, progress, out)
  const az = (out.angleDeg * Math.PI) / 180
  const position: Vec3 = [Math.sin(az) * out.distance, out.height, Math.cos(az) * out.distance]
  const base = lookAtBasis(position, [0, 0, 0])
  const eyeDistance = Math.hypot(out.distance, out.height)

  if (out.frameX === 0 && out.frameY === 0) {
    return { position, ...base, eyeDistance, pose: { ...out } }
  }

  const halfHeight = TAN_HALF_V * eyeDistance
  const travelX = Math.max(0, halfHeight * aspect - LOGO_W / 2) * FRAME_TRAVEL_SAFETY
  const travelY = Math.max(0, halfHeight - LOGO_H / 2) * FRAME_TRAVEL_SAFETY

  const aim: Vec3 = [
    base.right[0] * -out.frameX * travelX + base.up[0] * -out.frameY * travelY,
    base.right[1] * -out.frameX * travelX + base.up[1] * -out.frameY * travelY,
    base.right[2] * -out.frameX * travelX + base.up[2] * -out.frameY * travelY,
  ]

  const aimed = lookAtBasis(position, aim)
  return { position, ...aimed, eyeDistance, pose: { ...out } }
}

/** Offsets angulares de un punto respecto del eje óptico, en grados. */
export function angularOffset(cam: CameraFrame, point: Vec3) {
  const v = sub(point, cam.position)
  const depth = dot(v, cam.forward)
  const x = dot(v, cam.right)
  const y = dot(v, cam.up)
  return {
    h: (Math.atan2(x, depth) * 180) / Math.PI,
    v: (Math.atan2(y, Math.hypot(x, depth)) * 180) / Math.PI,
    depth,
    distance: len(v),
  }
}

export function halfFovDeg(aspect: number) {
  return { v: FOV / 2, h: (Math.atan(TAN_HALF_V * aspect) * 180) / Math.PI }
}

/** Alto de cuadro a la distancia de órbita. La unidad de velocidad de S6. */
export function frameHeight(distance: number): number {
  return 2 * TAN_HALF_V * distance
}

/** Velocidad instantánea, en alturas de cuadro por unidad de progreso. */
export function speedAt(track: Track, p: number, h = 5e-4): number {
  const pose = emptyPose()
  const lo = Math.max(0, p - h)
  const hi = Math.min(1, p + h)
  const a = cameraAt(track, lo, 16 / 9, pose)
  const da = a.pose.distance
  const pa = a.position
  const b = cameraAt(track, hi, 16 / 9, pose)
  const db = b.pose.distance
  const move = Math.hypot(b.position[0] - pa[0], b.position[1] - pa[1], b.position[2] - pa[2])
  return move / (hi - lo) / frameHeight((da + db) / 2)
}

/** Desvío máximo del camino respecto de la recta que une sus dos extremos. */
export function bowBetween(track: Track, from: number, to: number, steps = 300): number {
  const pose = emptyPose()
  const points: Vec3[] = []
  for (let i = 0; i <= steps; i += 1) {
    points.push(cameraAt(track, from + ((to - from) * i) / steps, 16 / 9, pose).position)
  }
  const a = points[0]
  const b = points[points.length - 1]
  const ab = sub(b, a)
  const abLen = len(ab)
  if (abLen < 1e-6) return 0

  let max = 0
  for (const p of points) {
    const ap = sub(p, a)
    const t = dot(ap, ab) / (abLen * abLen)
    const d = Math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t, ap[2] - ab[2] * t)
    if (d > max) max = d
  }
  return max
}

/**
 * Distancia mínima entre un segmento y una CAJA ORIENTADA.
 *
 * Una esfera envolvente no sirve para este chequeo: los planos suspendidos son
 * losas de 0,09 de espesor y hasta 21 de ancho, así que su esfera tiene diez
 * veces el volumen de la losa y da falsos positivos por todos lados. Se hace
 * bien: se lleva el segmento al marco local de la caja y ahí el problema es
 * punto-contra-AABB.
 *
 * El giro se interpreta en orden **YXZ**, igual que `InstancedBars`: `R = Ry ·
 * Rx · Rz`. Para ir al marco local se aplica la transpuesta.
 */
export function segmentBoxDistance(
  a: Vec3,
  b: Vec3,
  center: Vec3,
  half: Vec3,
  rotation: Vec3,
  samples = 240
): number {
  const [rx, ry, rz] = rotation
  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const cz = Math.cos(rz)
  const sz = Math.sin(rz)

  // R = Ry · Rx · Rz, por columnas.
  const m: readonly Vec3[] = [
    [cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz],
    [-cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz],
    [sy * cx, -sx, cy * cx],
  ]

  let best = Infinity
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const world: Vec3 = [
      a[0] + (b[0] - a[0]) * t - center[0],
      a[1] + (b[1] - a[1]) * t - center[1],
      a[2] + (b[2] - a[2]) * t - center[2],
    ]
    // Rᵀ · v: cada componente local es el producto con una COLUMNA de R.
    const local: Vec3 = [
      world[0] * m[0][0] + world[1] * m[0][1] + world[2] * m[0][2],
      world[0] * m[1][0] + world[1] * m[1][1] + world[2] * m[1][2],
      world[0] * m[2][0] + world[1] * m[2][1] + world[2] * m[2][2],
    ]
    const dx = Math.max(0, Math.abs(local[0]) - half[0])
    const dy = Math.max(0, Math.abs(local[1]) - half[1])
    const dz = Math.max(0, Math.abs(local[2]) - half[2])
    const distance = Math.hypot(dx, dy, dz)
    if (distance < best) best = distance
  }
  return best
}

// ── El corredor de comprobaciones ───────────────────────────────────────────

let passed = 0
const failures: string[] = []

export function check(label: string, condition: boolean, detail = ''): void {
  if (condition) {
    passed += 1
    console.log(`  ok  ${label}${detail ? `  · ${detail}` : ''}`)
    return
  }
  failures.push(`${label}${detail ? `  · ${detail}` : ''}`)
  console.log(`  FALLA  ${label}${detail ? `  · ${detail}` : ''}`)
}

export function section(title: string): void {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 66 - title.length))}`)
}

/**
 * Cierra la corrida.
 *
 * ⚠️ **La guarda de «cero comprobaciones» la agregó SITIO-S8, al cablear estos
 * invariantes al gate del repo.** `cerrar()` —el arnés del track del SITIO— la
 * tiene desde S4: un invariante sin afirmaciones sale VERDE y es indistinguible
 * de uno que verificó algo. Acá no estaba, y mientras estos archivos se corrían
 * a mano no importaba demasiado; metidos en `npm run verificar`, un lane que
 * puede pasar por vacío es un gate que miente.
 */
export function report(suite: string): void {
  console.log(`\n${suite}: ${passed} en verde, ${failures.length} en rojo`)
  if (failures.length > 0) {
    for (const failure of failures) console.log(`  ✗ ${failure}`)
    process.exitCode = 1
  }
  if (passed === 0) {
    console.log('  FALLA  cero comprobaciones. Un invariante sin comprobaciones es verde por vacío.')
    process.exitCode = 1
  }
}
