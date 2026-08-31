import { MOIRE_NEAR_BOTTOM, MOIRE_NEAR_RADIUS, MOIRE_NEAR_TOP } from '@/app/v3/_lib/escena/probeMoire'

import {
  FLOOR_Y,
  LOGO_H,
  LOGO_W,
  cameraAt,
  emptyPose,
  halfFovDeg,
  segmentBoxDistance,
  type Track,
  type Vec3,
} from './harness'

/**
 * QUÉ TAPA A QUÉ — la geometría de oclusión de la escena.
 *
 * Nació en S9 midiendo contra los planos suspendidos. **S10 los borró, y el
 * instrumento se quedó**: las dos preguntas que contesta no eran de un sprint.
 *
 * - **¿Hay algo entre la cámara y el logo?** Hoy la respuesta es no, y hace falta
 *   MEDIRLO, no suponerlo.
 * - **¿Cuánto espacio libre queda por detrás del logo?** Es lo que el efecto Star
 *   Wars va a necesitar saber cuando se construya, y conviene que lo lea del
 *   mismo instrumento y no de un número copiado de un reporte.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ LA LISTA DE OCLUYENTES ESTÁ VACÍA, Y POR ESO HAY UN CONTROL POSITIVO
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Una comprobación que verifica "cero pasadas" contra una escena sin geometría
 * **no puede fallar**, y una comprobación que no puede fallar no comprueba nada:
 * quedaría verde por vacía, y seguiría verde el día que alguien agregue una masa
 * que sí tape el logo.
 *
 * Por eso el módulo exporta `syntheticOccluder()`: una losa de prueba que se
 * pone a mano entre la cámara y el logo. `s9-composicion.invariant.ts` la usa
 * para verificar que el instrumento **detecta** una oclusión antes de afirmar que
 * la escena real no tiene ninguna. Los dos chequeos van juntos o ninguno vale.
 *
 * Vive en `__tests__` y no en `_components` a propósito: es instrumento de
 * medición, no código de la escena. Nada de `/probe-escena` lo importa.
 */

const RAD = Math.PI / 180
const ASPECT = 16 / 9

/** Una caja orientada, con el orden YXZ que usa `InstancedBars`. */
export type OccluderBox = {
  readonly label: string
  readonly position: Vec3
  readonly scale: Vec3
  readonly rotation: Vec3
  /** Radio horizontal al eje. Si es mayor que la cámara, queda detrás del logo. */
  readonly radius: number
}

/**
 * LOS OCLUYENTES DE LA ESCENA. **Vacía desde S10.**
 *
 * Hasta S9 esto era `PLANE_PLACEMENTS`: once losas entre radio 11,8 y 22 que
 * tapaban el logo en cinco ventanas del recorrido (9,7% del progreso) y que en
 * p=0,200 y p=0,300 ocupaban el cuadro entero. Se borraron con su archivo.
 *
 * Queda como array y no como constante `[]` en el sitio de uso para que agregar
 * una familia nueva sea una línea acá y todo lo demás siga midiendo solo.
 */
export const SCENE_OCCLUDERS: readonly OccluderBox[] = []

/**
 * Una losa de prueba, puesta a mano en un azimut y un radio. **Solo para el
 * control positivo** — la escena no la contiene.
 *
 * Se la encara al centro, que es la orientación en la que una losa tapa lo
 * máximo posible: si el instrumento no la detecta así, no detecta nada.
 */
export function syntheticOccluder(
  azimuthDeg: number,
  radius: number,
  width = 14,
  height = 11
): OccluderBox {
  const azimuth = azimuthDeg * RAD
  return {
    label: `sintético en ${azimuthDeg}° a radio ${radius}`,
    position: [Math.sin(azimuth) * radius, 0, Math.cos(azimuth) * radius],
    scale: [width, height, 0.09],
    rotation: [0, azimuth, 0],
    radius,
  }
}

/**
 * Cuántas muestras necesita `segmentBoxDistance` para no SALTEAR una caja fina.
 *
 * El test marcha el segmento y mide punto contra caja, así que si el paso es más
 * grande que el espesor de la losa puede pasar de largo sin tocarla: con 120
 * muestras sobre 19 unidades el paso es 0,16 y una losa de 0,09 se cuela entre
 * dos muestras. Eso no es un margen de error, es un falso negativo — el chequeo
 * diría "no hay oclusión" con la cara tapada.
 *
 * Se deriva del semieje más chico de la caja, con dos muestras por espesor: para
 * una losa de 0,09 sobre un rayo de 19 son 845 muestras en vez de 120.
 *
 * ⚠️ **Y esto NO es una mejora preventiva: el control positivo de S10 lo encontró
 * fallando.** Una losa encarada al centro entre la cámara y el logo daba 55% de
 * oclusión donde tenía que dar 100%.
 *
 * La consecuencia alcanza hacia atrás, y hay que decirla: **las dos cifras que S9
 * publicó con este instrumento salieron del muestreo viejo** — el "9,8% del
 * recorrido con el entorno cruzando por delante, en cinco ventanas" y el
 * "corredor libre de ±29°, exclusivo de Trabajos y Números". El error solo puede
 * ir en una dirección —una muestra que se saltea la losa pierde un choque, nunca
 * inventa uno—, así que las dos **subestimaban la oclusión**. Cuánto más, no se
 * puede saber: los planos ya no existen para volver a medirlos. Las cifras de S10
 * salieron de acá ya arreglado.
 */
function sampleCount(from: Vec3, to: Vec3, box: OccluderBox): number {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2])
  const thinnest = Math.min(box.scale[0], box.scale[1], box.scale[2]) / 2
  const needed = Math.ceil(length / Math.max(1e-3, thinnest * 0.5))
  return Math.min(4000, Math.max(120, needed))
}

/** Malla de 49 puntos sobre la caja del logo: la silueta que se puede tapar. */
const GRID: readonly (readonly [number, number])[] = (() => {
  const points: [number, number][] = []
  for (let i = -3; i <= 3; i += 1) {
    for (let j = -3; j <= 3; j += 1) points.push([(i / 3) * (LOGO_W / 2), (j / 3) * (LOGO_H / 2)])
  }
  return points
})()

/** Fracción de la silueta del logo que un ocluyente tapa, en este progreso. */
export function logoOcclusionAt(
  track: Track,
  progress: number,
  occluders: readonly OccluderBox[] = SCENE_OCCLUDERS
): number {
  if (occluders.length === 0) return 0

  const pose = emptyPose()
  const cam = cameraAt(track, progress, ASPECT, pose)
  const radius = Math.hypot(cam.position[0], cam.position[2])
  let hit = 0

  for (const [u, v] of GRID) {
    const target: Vec3 = [
      cam.right[0] * u + cam.up[0] * v,
      cam.right[1] * u + cam.up[1] * v,
      cam.right[2] * u + cam.up[2] * v,
    ]
    for (const box of occluders) {
      // Si el ocluyente está MÁS LEJOS que la cámara, queda detrás del logo por
      // construcción y no puede estorbar.
      if (box.radius >= radius) continue
      const distance = segmentBoxDistance(
        cam.position,
        target,
        box.position,
        [box.scale[0] / 2, box.scale[1] / 2, box.scale[2] / 2],
        box.rotation,
        sampleCount(cam.position, target, box)
      )
      if (distance <= 0) {
        hit += 1
        break
      }
    }
  }

  return hit / GRID.length
}

/**
 * Se mide DESDE EL LOGO hacia el fondo —el lado opuesto a la cámara, por donde
 * vienen los proyectos—: un cono de semiángulo creciente alrededor del eje
 * óptico, con rayos que salen del origen y llegan hasta el borde de la escena.
 */
export function backCone(
  track: Track,
  progress: number,
  occluders: readonly OccluderBox[] = SCENE_OCCLUDERS,
  reach = 30
): number {
  const pose = emptyPose()
  const cam = cameraAt(track, progress, ASPECT, pose)
  const half = halfFovDeg(ASPECT)
  const limit = Math.max(half.h, half.v)
  if (occluders.length === 0) return limit

  for (let deg = 1; deg <= limit; deg += 1) {
    for (let k = 0; k < 36; k += 1) {
      const angle = (k / 36) * Math.PI * 2
      const tan = Math.tan(deg * RAD)
      const direction: Vec3 = [
        cam.forward[0] + (cam.right[0] * Math.cos(angle) + cam.up[0] * Math.sin(angle)) * tan,
        cam.forward[1] + (cam.right[1] * Math.cos(angle) + cam.up[1] * Math.sin(angle)) * tan,
        cam.forward[2] + (cam.right[2] * Math.cos(angle) + cam.up[2] * Math.sin(angle)) * tan,
      ]
      const length = Math.hypot(direction[0], direction[1], direction[2])
      const far: Vec3 = [
        (direction[0] / length) * reach,
        (direction[1] / length) * reach,
        (direction[2] / length) * reach,
      ]
      for (const box of occluders) {
        const distance = segmentBoxDistance(
          [0, 0, 0],
          far,
          box.position,
          [box.scale[0] / 2, box.scale[1] / 2, box.scale[2] / 2],
          box.rotation,
          sampleCount([0, 0, 0], far, box)
        )
        if (distance <= 0) return deg - 1
      }
    }
  }
  return limit
}

/**
 * PROFUNDIDAD LIBRE desde el logo hacia el fondo, sobre el eje óptico.
 *
 * S9 publicaba 34 para Trabajos y lo atribuía a "la pantalla de rendijas en 38,
 * no un plano". Sin los planos el límite es siempre uno de dos, y cuál manda
 * depende de la pose: **la envolvente** cuando la cámara mira nivelada o hacia
 * arriba, y **el piso** cuando mira hacia abajo — que es lo que pasa en el hero y
 * en Números, donde el eje óptico se clava en el papel mucho antes de llegar a la
 * pared.
 */
export function backDepth(
  track: Track,
  progress: number,
  screenRadius = MOIRE_NEAR_RADIUS
): { depth: number; limit: 'envolvente' | 'piso' } {
  const pose = emptyPose()
  const cam = cameraAt(track, progress, ASPECT, pose)
  const dir = cam.forward

  // Contra el cilindro de la envolvente, desde adentro.
  let screen = Infinity
  const a = dir[0] * dir[0] + dir[2] * dir[2]
  if (a > 1e-12) {
    const t = Math.sqrt((screenRadius * screenRadius) / a)
    const y = dir[1] * t
    if (y >= MOIRE_NEAR_BOTTOM && y <= MOIRE_NEAR_TOP) screen = t
  }

  // Contra el papel (disco de radio 34 a la altura del piso).
  let floor = Infinity
  if (Math.abs(dir[1]) > 1e-9) {
    const t = FLOOR_Y / dir[1]
    if (t > 1e-4 && Math.hypot(dir[0] * t, dir[2] * t) <= 34) floor = t
  }

  return floor < screen
    ? { depth: floor, limit: 'piso' }
    : { depth: screen, limit: 'envolvente' }
}
