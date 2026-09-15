/**
 * B · LA CADENA DEL TAMAÑO, EJECUTABLE — y las palancas con su número.
 *
 *     npx tsx scripts-ancho1/b-modelo.ts
 *
 * ── Qué hace, y por qué no alcanza con leer el código ─────────────────────
 *
 * El mapa del árbol dice que el tamaño del logo en pantalla sale de
 * `altoViewportPx / (2 · tan(fov/2) · profundidad)`. Eso es una FÓRMULA; lo que
 * el reporte necesita son CIFRAS, y cifras que se puedan volver a sacar.
 *
 * Acá hay dos cosas y una sola vara:
 *
 *   1. **La producción, corrida tal cual.** `frameSceneEntry(w, h)` es la
 *      función que el preloader usa para saber dónde aterriza, y proyecta EL
 *      MISMO keyframe que la escena dibuja en el hero (`SCENE_ENTRY_POSE =
 *      CHOREO_KEYFRAMES[0].pose`). Se la llama con los diez viewports y se
 *      compara su caja contra la mancha que `a-mancha.ts` midió en el píxel.
 *   2. **Una cámara PARAMETRIZADA por `fov`,** para poder preguntar «¿y si la
 *      lente fuera otra?» sin tocar `probeScene.ts`.
 *
 * ⚠️ **EL CONTROL DE EQUIVALENCIA ES LO QUE VUELVE HONESTA A LA COPIA.** Con
 * `fovDeg = CAMERA_FOV` la cámara parametrizada tiene que devolver **lo mismo
 * que `sceneCameraAt` + `projectScenePoint`, hasta el último bit**. Es el mismo
 * mecanismo con el que `s10-logo.ts` justifica su propio muestreador. Sin eso,
 * cualquier cifra de «¿y si el fov fuera 30?» sería de otro instrumento y no
 * diría nada del sitio.
 *
 * ⚠️ **`distance` y `PROBE_SVG_SCALE` NO necesitan copia.** La distancia es un
 * campo de la pose y `frameScenePose(pose, w, h)` está exportada: se le pasa
 * `{ ...SCENE_ENTRY_POSE, distance: d }` y sale la aritmética de producción con
 * la distancia hipotética. La escala entra multiplicando la caja de mundo, así
 * que su efecto es exacto y se deriva sin barrer nada.
 *
 * Nada de esto aplica una palanca: `choreography.ts` y `probeScene.ts` no se
 * tocan. Lo que sale son números al costado de cada salida, que es lo que la
 * instrucción pide.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import {
  CAMERA_FOV,
  FRAME_TRAVEL_SAFETY,
  ORBIT_TARGET_Y,
  PROBE_SVG_SCALE,
} from '@/app/v3/_lib/escena/probeScene'
import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import type { ChoreoPose } from '@/app/v3/_lib/escena/choreographyTypes'
import { SCENE_LOGO_MESH_WORLD, projectScenePoint, sceneCameraAt } from '@/lib/scene-camera'
import { DEST_WIDTH_MARGIN, SCENE_ENTRY_POSE, frameScenePose } from '@/lib/scene-framing'

import { TEMP, TODOS, red } from './ancho1-comun'

const DEG = Math.PI / 180

// ── La cámara parametrizada por `fov`, y su control de equivalencia ─────────

type Vec3 = readonly [number, number, number]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}
function baseDeMirada(posicion: Vec3, objetivo: Vec3) {
  const z = norm(sub(posicion, objetivo))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  return { right: x, up: y, forward: [-z[0], -z[1], -z[2]] as Vec3 }
}

export interface CamaraHipotetica {
  readonly position: Vec3
  readonly right: Vec3
  readonly up: Vec3
  readonly forward: Vec3
  readonly aspect: number
  readonly tanHalfFov: number
}

/** `sceneCameraAt`, con el `fov` y la caja del mesh por parámetro. */
export function camaraCon(
  pose: ChoreoPose,
  w: number,
  h: number,
  fovDeg: number = CAMERA_FOV,
  anchoDelMesh: number = SCENE_LOGO_MESH_WORLD.width,
  altoDelMesh: number = SCENE_LOGO_MESH_WORLD.height,
): CamaraHipotetica | null {
  if (!(w > 0) || !(h > 0)) return null
  const tanHalfFov = Math.tan(((fovDeg / 2) * Math.PI) / 180)
  const aspect = w / h
  const azimuth = pose.angleDeg * DEG
  const position: Vec3 = [
    Math.sin(azimuth) * pose.distance,
    pose.height,
    Math.cos(azimuth) * pose.distance,
  ]
  const target: Vec3 = [0, ORBIT_TARGET_Y, 0]
  let base = baseDeMirada(position, target)
  if (pose.frameX !== 0 || pose.frameY !== 0) {
    const eyeDistance = Math.hypot(pose.distance, pose.height - ORBIT_TARGET_Y)
    const halfHeight = tanHalfFov * eyeDistance
    const halfWidth = halfHeight * aspect
    const travelX = Math.max(0, halfWidth - anchoDelMesh / 2) * FRAME_TRAVEL_SAFETY
    const travelY = Math.max(0, halfHeight - altoDelMesh / 2) * FRAME_TRAVEL_SAFETY
    const aim = [0, 1, 2].map(
      (i) => target[i] + base.right[i] * -pose.frameX * travelX + base.up[i] * -pose.frameY * travelY,
    ) as unknown as Vec3
    base = baseDeMirada(position, aim)
  }
  return { position, ...base, aspect, tanHalfFov }
}

export interface Proyeccion {
  readonly xPx: number
  readonly yPx: number
  readonly depth: number
  readonly pxPerWorld: number
}

/** `projectScenePoint`, con el `fov` que la cámara trae. */
export function proyectarCon(c: CamaraHipotetica, punto: Vec3, w: number, h: number): Proyeccion | null {
  const v = sub(punto, c.position)
  const depth = dot(v, c.forward)
  if (!(depth > 0)) return null
  const ndcX = dot(v, c.right) / depth / (c.tanHalfFov * c.aspect)
  const ndcY = dot(v, c.up) / depth / c.tanHalfFov
  return {
    xPx: (0.5 + ndcX / 2) * w,
    yPx: (0.5 - ndcY / 2) * h,
    depth,
    pxPerWorld: h / (2 * c.tanHalfFov * depth),
  }
}

export interface CajaProyectada {
  readonly centroX: number
  readonly centroY: number
  readonly anchoPx: number
  readonly altoPx: number
  readonly izquierda: number
  readonly derecha: number
  readonly recorte: number
  readonly profundidad: number
  readonly pxPorMundo: number
}

/** La caja de la TINTA del logo tal como la ve una cámara hipotética. */
export function cajaDeLaTinta(
  pose: ChoreoPose,
  w: number,
  h: number,
  fovDeg: number = CAMERA_FOV,
  escala: number = PROBE_SVG_SCALE,
): CajaProyectada | null {
  const mesh = {
    width: SCENE_LOGO_MESH_WORLD.width * (escala / PROBE_SVG_SCALE),
    height: SCENE_LOGO_MESH_WORLD.height * (escala / PROBE_SVG_SCALE),
  }
  const c = camaraCon(pose, w, h, fovDeg, mesh.width, mesh.height)
  if (!c) return null
  const centro = proyectarCon(c, [0, ORBIT_TARGET_Y, 0], w, h)
  if (!centro) return null
  const pxPorUnidadDeViewBox = centro.pxPerWorld * escala
  const crudoAncho = LOGO_INK_VIEWBOX.width * pxPorUnidadDeViewBox
  const crudoAlto = LOGO_INK_VIEWBOX.height * pxPorUnidadDeViewBox
  const tope = DEST_WIDTH_MARGIN * w
  const recorte = crudoAncho > tope ? tope / crudoAncho : 1
  const anchoPx = crudoAncho * recorte
  return {
    centroX: centro.xPx,
    centroY: centro.yPx,
    anchoPx,
    altoPx: crudoAlto * recorte,
    izquierda: centro.xPx - anchoPx / 2,
    derecha: centro.xPx + anchoPx / 2,
    recorte,
    profundidad: centro.depth,
    pxPorMundo: centro.pxPerWorld,
  }
}

// ── El control de equivalencia ──────────────────────────────────────────────

function controlDeEquivalencia(): { readonly ok: boolean; readonly peor: number; readonly casos: number } {
  let peor = 0
  let casos = 0
  for (const p of TODOS) {
    const mia = camaraCon(SCENE_ENTRY_POSE, p.ancho, p.alto)
    const suya = sceneCameraAt(SCENE_ENTRY_POSE, p.ancho, p.alto)
    if (!mia || !suya) continue
    for (const punto of [
      [0, ORBIT_TARGET_Y, 0],
      [3.4, 2.4, 0],
      [-3.4, -2.4, 0.5],
    ] as const) {
      const a = proyectarCon(mia, punto, p.ancho, p.alto)
      const b = projectScenePoint(suya, punto, p.ancho, p.alto)
      if (!a || !b) continue
      casos += 1
      peor = Math.max(
        peor,
        Math.abs(a.xPx - b.xPx),
        Math.abs(a.yPx - b.yPx),
        Math.abs(a.pxPerWorld - b.pxPerWorld),
      )
    }
    const cajaMia = cajaDeLaTinta(SCENE_ENTRY_POSE, p.ancho, p.alto)
    const cajaSuya = frameScenePose(SCENE_ENTRY_POSE, p.ancho, p.alto)
    if (cajaMia && cajaSuya) {
      casos += 1
      peor = Math.max(
        peor,
        Math.abs(cajaMia.centroX - cajaSuya.centerXPx),
        Math.abs(cajaMia.centroY - cajaSuya.centerYPx),
        Math.abs(cajaMia.anchoPx - cajaSuya.inkWidthPx),
        Math.abs(cajaMia.altoPx - cajaSuya.inkHeightPx),
      )
    }
  }
  return { ok: peor < 1e-9, peor, casos }
}

// ── La salida ───────────────────────────────────────────────────────────────

interface FilaMedida {
  readonly perfil: string
  readonly ancho: number
  readonly alto: number
  readonly mancha: { readonly hay: boolean; readonly x0: number; readonly x1: number; readonly anchoPx: number }
  readonly bordeSeguroX: number
  readonly tintaHasta: number
}

const ACUMULADO = path.join(TEMP, 'mancha.json')
const medidas: FilaMedida[] = existsSync(ACUMULADO) ? (JSON.parse(readFileSync(ACUMULADO, 'utf8')) as FilaMedida[]) : []
const medidaDe = (w: number, h: number) => medidas.find((m) => m.ancho === w && m.alto === h)

const HERO = CHOREO_KEYFRAMES[0]
const salida: Record<string, unknown> = {}

console.log('═══ LA CADENA, con sus constantes ═══')
console.log(`  CAMERA_FOV (VERTICAL)            ${CAMERA_FOV}°           probeScene.ts:208`)
console.log(`  PROBE_SVG_SCALE                  ${PROBE_SVG_SCALE}        probeScene.ts:27`)
console.log(`  FRAME_TRAVEL_SAFETY              ${FRAME_TRAVEL_SAFETY}         probeScene.ts:231`)
console.log(`  DEST_WIDTH_MARGIN                ${DEST_WIDTH_MARGIN}         scene-framing.ts:57 (SOLO el preloader)`)
console.log(`  keyframe «${HERO.name}»  at ${HERO.at}          ${JSON.stringify(HERO.pose)}   choreography.ts`)
console.log(`  caja de la TINTA (viewBox)       ${LOGO_INK_VIEWBOX.width} × ${LOGO_INK_VIEWBOX.height}`)
console.log(`  caja de la TINTA (mundo)         ${red(LOGO_INK_VIEWBOX.width * PROBE_SVG_SCALE, 4)} × ${red(LOGO_INK_VIEWBOX.height * PROBE_SVG_SCALE, 4)}`)
console.log(`  caja del MESH (mundo, con bisel) ${red(SCENE_LOGO_MESH_WORLD.width, 4)} × ${red(SCENE_LOGO_MESH_WORLD.height, 4)}`)
console.log(`  distancia ojo→objetivo           ${red(Math.hypot(HERO.pose.distance, HERO.pose.height - ORBIT_TARGET_Y), 4)}`)

const control = controlDeEquivalencia()
console.log(
  `\n═══ CONTROL DE EQUIVALENCIA ═══\n  la cámara parametrizada contra la de producción, ${control.casos} comparaciones: ` +
    `peor diferencia ${control.peor.toExponential(3)} → ${control.ok ? 'IDÉNTICAS' : '🔴 NO COINCIDEN'}`,
)
if (!control.ok) throw new Error('la cámara parametrizada no reproduce la de producción: ninguna cifra de abajo vale')
salida.control = control

console.log('\n═══ LA PRODUCCIÓN, viewport por viewport ═══')
console.log('  viewport     aspecto   profundidad  px/mundo   tinta ancho   izquierda   centro    recorte  |  medido: mancha x0…x1 (ancho)')
const filas = TODOS.map((p) => {
  const caja = cajaDeLaTinta(SCENE_ENTRY_POSE, p.ancho, p.alto)
  const m = medidaDe(p.ancho, p.alto)
  if (!caja) throw new Error(`sin caja en ${p.id}`)
  const fila = {
    viewport: `${p.ancho}×${p.alto}`,
    ancho: p.ancho,
    alto: p.alto,
    aspecto: red(p.ancho / p.alto, 4),
    profundidad: red(caja.profundidad, 4),
    pxPorMundo: red(caja.pxPorMundo, 4),
    tintaAnchoPx: red(caja.anchoPx, 1),
    tintaAltoPx: red(caja.altoPx, 1),
    izquierdaPx: red(caja.izquierda, 1),
    derechaPx: red(caja.derecha, 1),
    centroXPx: red(caja.centroX, 1),
    recorte: red(caja.recorte, 4),
    fraccionDelAncho: red(caja.anchoPx / p.ancho, 4),
    manchaMedidaX0: m?.mancha.hay ? m.mancha.x0 : null,
    manchaMedidaX1: m?.mancha.hay ? m.mancha.x1 : null,
    manchaMedidaAncho: m?.mancha.hay ? m.mancha.anchoPx : null,
    bordeSeguroMedido: m?.bordeSeguroX ?? null,
  }
  console.log(
    `  ${fila.viewport.padEnd(11)} ${fila.aspecto.toFixed(3).padStart(7)}   ${fila.profundidad.toFixed(3).padStart(10)}  ${fila.pxPorMundo.toFixed(3).padStart(8)}  ` +
      `${fila.tintaAnchoPx.toFixed(1).padStart(11)}   ${fila.izquierdaPx.toFixed(1).padStart(9)}   ${fila.centroXPx.toFixed(1).padStart(7)}   ${fila.recorte.toFixed(3).padStart(7)}  |  ` +
      (fila.manchaMedidaX0 === null ? 'sin escena' : `${fila.manchaMedidaX0}…${fila.manchaMedidaX1} (${fila.manchaMedidaAncho})`),
  )
  return fila
})
salida.produccion = filas

console.log('\n═══ LA LEY, comprobada ═══')
const parejas = [
  [TODOS.find((p) => p.ancho === 1280 && p.alto === 800)!, TODOS.find((p) => p.ancho === 1440 && p.alto === 900)!],
  [TODOS.find((p) => p.ancho === 1920 && p.alto === 1080)!, TODOS.find((p) => p.ancho === 2560 && p.alto === 1440)!],
  [TODOS.find((p) => p.ancho === 1600 && p.alto === 900)!, TODOS.find((p) => p.ancho === 1920 && p.alto === 1080)!],
]
const ley = parejas.map(([a, b]) => {
  const ca = cajaDeLaTinta(SCENE_ENTRY_POSE, a.ancho, a.alto)!
  const cb = cajaDeLaTinta(SCENE_ENTRY_POSE, b.ancho, b.alto)!
  const f = {
    par: `${a.ancho}×${a.alto} → ${b.ancho}×${b.alto}`,
    mismoAspecto: Math.abs(a.ancho / a.alto - b.ancho / b.alto) < 1e-9,
    razonDeAncho: red(b.ancho / a.ancho, 4),
    razonDeAlto: red(b.alto / a.alto, 4),
    razonDeLaTinta: red(cb.anchoPx / ca.anchoPx, 4),
    fraccionA: red(ca.anchoPx / a.ancho, 4),
    fraccionB: red(cb.anchoPx / b.ancho, 4),
  }
  console.log(
    `  ${f.par.padEnd(24)} aspecto ${f.mismoAspecto ? 'IGUAL' : 'distinto'} · ancho ×${f.razonDeAncho} · alto ×${f.razonDeAlto} · ` +
      `la tinta ×${f.razonDeLaTinta}  →  fracción del ancho ${(f.fraccionA * 100).toFixed(2)} % → ${(f.fraccionB * 100).toFixed(2)} %`,
  )
  return f
})
salida.ley = ley

const DESTINO = path.join(TEMP, 'modelo.json')
writeFileSync(DESTINO, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
console.log(`\n→ ${DESTINO}`)
