import { PLANE_PLACEMENTS, SUSPENDED_PLANES } from '../_components/probeArchitecture'

import {
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
 * QUÉ TAPA A QUÉ — la geometría de oclusión contra los planos suspendidos.
 *
 * Sale de `s9-composicion.invariant.ts` porque las dos preguntas que contesta
 * dejaron de ser de un sprint:
 *
 * - **¿Hay un plano entre la cámara y el logo?** Desde S9 la respuesta correcta
 *   no es siempre "no": el recorrido definitivo pide explícitamente que el
 *   entorno cruce por delante en Quiénes somos. Lo que hace falta es MEDIRLO,
 *   no prohibirlo.
 * - **¿Cuánto espacio libre queda por detrás del logo?** Es lo que el efecto
 *   Star Wars va a necesitar saber cuando se construya, y conviene que lo lea
 *   del mismo instrumento y no de un número copiado de un reporte.
 *
 * Vive en `__tests__` y no en `_components` a propósito: es instrumento de
 * medición, no código de la escena. Nada de `/probe-escena` lo importa.
 */

const RAD = Math.PI / 180
const ASPECT = 16 / 9

/** Fracción de la silueta del logo que un plano suspendido tapa. */
const GRID: readonly (readonly [number, number])[] = (() => {
  const points: [number, number][] = []
  for (let i = -3; i <= 3; i += 1) {
    for (let j = -3; j <= 3; j += 1) points.push([(i / 3) * (LOGO_W / 2), (j / 3) * (LOGO_H / 2)])
  }
  return points
})()

export function logoOcclusionAt(track: Track, progress: number): number {
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
    for (let j = 0; j < PLANE_PLACEMENTS.length; j += 1) {
      if (SUSPENDED_PLANES[j].radius >= radius) continue
      const placement = PLANE_PLACEMENTS[j]
      const distance = segmentBoxDistance(
        cam.position,
        target,
        placement.position as Vec3,
        [placement.scale[0] / 2, placement.scale[1] / 2, placement.scale[2] / 2],
        (placement.rotation ?? [0, 0, 0]) as Vec3,
        120
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
export function backCone(track: Track, progress: number, reach = 30): number {
  const pose = emptyPose()
  const cam = cameraAt(track, progress, ASPECT, pose)
  const half = halfFovDeg(ASPECT)
  const limit = Math.max(half.h, half.v)
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
      for (let j = 0; j < PLANE_PLACEMENTS.length; j += 1) {
        const placement = PLANE_PLACEMENTS[j]
        const distance = segmentBoxDistance(
          [0, 0, 0],
          far,
          placement.position as Vec3,
          [placement.scale[0] / 2, placement.scale[1] / 2, placement.scale[2] / 2],
          (placement.rotation ?? [0, 0, 0]) as Vec3,
          200
        )
        if (distance <= 0) return deg - 1
      }
    }
  }
  return limit
}
