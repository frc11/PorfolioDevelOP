/**
 * COMPROBACIONES DE S10 · dónde está la envolvente de rendijas.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-fondo.invariant.ts
 *
 * La primera de las tres suites de la envolvente, y la que verifica que las dos
 * capas **quepan donde tienen que caber**: más lejos que la cámara más lejana,
 * más cerca que el ciclorama, y con las bandas lo bastante altas para que sus
 * bordes no entren nunca en cuadro. Más la forma de la celda, que es de donde
 * sale todo lo demás.
 *
 * Las otras dos: `s10-batido.invariant.ts` (qué produce el desajuste y el
 * aliasing) y `s10-tramas.invariant.ts` (las texturas y el orden de dibujo).
 */
import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import {
  MOIRE_COARSE_CELLS,
  MOIRE_FAR_BOTTOM,
  MOIRE_FAR_RADIUS,
  MOIRE_FAR_TOP,
  MOIRE_MISMATCH,
  MOIRE_MISMATCH_MAX,
  MOIRE_NEAR_BOTTOM,
  MOIRE_NEAR_RADIUS,
  MOIRE_NEAR_TOP,
  fineCells,
  verticalPitch,
  verticalRepeat,
} from '@/app/v3/_lib/escena/probeMoire'
import { celosiaCrossings, celosiaLayers } from '@/app/v3/_lib/escena/celosiaGeometry'
import {
  FLOOR_Y,
  TAN_HALF_V,
  cameraAt,
  check,
  emptyPose,
  halfFovDeg,
  report,
  section,
  type Vec3,
} from './harness'
import { cycloramaRadius, rayCylinderInside, rayFloor, track } from './frameProbe'

const ASPECT = 16 / 9
const half = halfFovDeg(ASPECT)
const TAN_H = Math.tan((half.h * Math.PI) / 180)

const FINE_CELLS = fineCells(MOIRE_MISMATCH)

// ── 1 · La geometría: dónde entran las dos capas ────────────────────────────

section('Las dos capas caben donde tienen que caber')

{
  const farthestCamera = Math.max(...CHOREO_KEYFRAMES.map((keyframe) => keyframe.pose.distance))
  check(
    'la capa fina queda más lejos que la cámara más lejana del recorrido',
    MOIRE_NEAR_RADIUS > farthestCamera + 5,
    `capa fina en ${MOIRE_NEAR_RADIUS}, cámara máxima en ${farthestCamera}`
  )
  check(
    'la gruesa está DETRÁS de la fina, que es lo que produce el paralaje',
    MOIRE_FAR_RADIUS > MOIRE_NEAR_RADIUS,
    `${MOIRE_NEAR_RADIUS} → ${MOIRE_FAR_RADIUS}, separación ${MOIRE_FAR_RADIUS - MOIRE_NEAR_RADIUS}`
  )
  /**
   * ⚠️ **Reemplaza a "el sol queda por DELANTE de las dos" (S10).**
   *
   * Aquel comparaba `SUN_RADIUS` (34) con el radio de la capa fina, y protegía
   * que el CUERPO del sol se dibujara adelante de la envolvente. S11 borró el
   * cuerpo: el sol dejó de tener radio. Lo que hay que proteger ahora es lo
   * contrario y es más fuerte — que la luz llegue **de afuera**, o sea que el
   * rayo al sol salga cruzando las dos capas. Si alguien acercara un radio o
   * bajara un tope, esto lo ve.
   */
  {
    const layers = celosiaLayers(MOIRE_MISMATCH)
    const noon: readonly [number, number, number] = [
      Math.sin(-42 * (Math.PI / 180)) * Math.cos(36 * (Math.PI / 180)),
      Math.sin(36 * (Math.PI / 180)),
      Math.cos(-42 * (Math.PI / 180)) * Math.cos(36 * (Math.PI / 180)),
    ]
    const center: readonly [number, number, number] = [0, FLOOR_Y, 0]
    const crossings = layers.map((layer) => celosiaCrossings(center, noon, layer, 0))
    check(
      'la luz llega de AFUERA: el rayo al sol sale cruzando las dos capas',
      crossings.every((found) => found.length === 1),
      `sale por y = ${crossings
        .map((found, i) => `${(FLOOR_Y + noon[1] * found[0].t).toFixed(1)} (r=${layers[i].radius})`)
        .join(' y ')} — las bandas van de ${layers[0].bottom} a ${layers[0].top} y de ${layers[1].bottom} a ${layers[1].top}`
    )
  }

  // El ciclorama es una superficie de revolución: cerca del piso está en radio 39
  // y se abre hacia arriba. Cada capa tiene que arrancar donde ya hay lugar.
  const nearRoom = cycloramaRadius(MOIRE_NEAR_BOTTOM)
  const farRoom = cycloramaRadius(MOIRE_FAR_BOTTOM)
  check(
    'la capa fina entra por dentro del ciclorama en su borde inferior',
    MOIRE_NEAR_RADIUS < nearRoom,
    `${MOIRE_NEAR_RADIUS} contra un ciclorama en ${nearRoom.toFixed(1)} a y=${MOIRE_NEAR_BOTTOM}`
  )
  check(
    'y la gruesa también, que es lo que le fija el borde de abajo',
    MOIRE_FAR_RADIUS < farRoom,
    `${MOIRE_FAR_RADIUS} contra ${farRoom.toFixed(1)} a y=${MOIRE_FAR_BOTTOM} — a y=−4 el ciclorama está en ${cycloramaRadius(-4).toFixed(1)}, o sea que ahí no entraría`
  )
}

section('Los bordes de banda nunca entran en cuadro')

{
  const pose = emptyPose()
  let highestNear = -Infinity
  let highestFar = -Infinity
  for (let i = 0; i <= 400; i += 1) {
    const cam = cameraAt(track, i / 400, ASPECT, pose)
    for (let ix = -6; ix <= 6; ix += 1) {
      const nx = (ix / 6) * TAN_H
      const raw: Vec3 = [
        cam.forward[0] + cam.right[0] * nx + cam.up[0] * TAN_HALF_V,
        cam.forward[1] + cam.right[1] * nx + cam.up[1] * TAN_HALF_V,
        cam.forward[2] + cam.right[2] * nx + cam.up[2] * TAN_HALF_V,
      ]
      const length = Math.hypot(raw[0], raw[1], raw[2])
      const dir: Vec3 = [raw[0] / length, raw[1] / length, raw[2] / length]
      // La banda se ignora a propósito: lo que se mide es hasta qué ALTURA barre
      // el borde superior del cuadro, para después compararlo con el tope.
      for (const radius of [MOIRE_NEAR_RADIUS, MOIRE_FAR_RADIUS]) {
        const t = rayCylinderInside(cam.position, dir, radius, -1e6, 1e6)
        if (!isFinite(t) || t > rayFloor(cam.position, dir)) continue
        const y = cam.position[1] + dir[1] * t
        if (radius === MOIRE_NEAR_RADIUS) highestNear = Math.max(highestNear, y)
        else highestFar = Math.max(highestFar, y)
      }
    }
  }
  check(
    'el borde superior del cuadro nunca pasa el tope de la capa fina',
    highestNear < MOIRE_NEAR_TOP,
    `barre hasta y=${highestNear.toFixed(1)} contra un tope en ${MOIRE_NEAR_TOP}`
  )
  check(
    'ni el de la gruesa',
    highestFar < MOIRE_FAR_TOP,
    `barre hasta y=${highestFar.toFixed(1)} contra un tope en ${MOIRE_FAR_TOP}`
  )
}

// ── 2 · Las celdas y el desajuste ───────────────────────────────────────────

section('Las celdas: cuadradas en su superficie y cuadradas en ángulo')

{
  for (const [label, radius, cells, bottom, top] of [
    ['gruesa', MOIRE_FAR_RADIUS, MOIRE_COARSE_CELLS, MOIRE_FAR_BOTTOM, MOIRE_FAR_TOP],
    ['fina', MOIRE_NEAR_RADIUS, FINE_CELLS, MOIRE_NEAR_BOTTOM, MOIRE_NEAR_TOP],
  ] as const) {
    const horizontal = (2 * Math.PI * radius) / cells
    const vertical = verticalPitch(radius, cells)
    check(
      `${label}: la celda es cuadrada sobre la superficie`,
      Math.abs(horizontal - vertical) < 1e-9,
      `${horizontal.toFixed(3)} × ${vertical.toFixed(3)} de mundo · ${(360 / cells).toFixed(3)}° de ángulo · ${verticalRepeat(radius, cells, top - bottom).toFixed(2)} filas en la banda`
    )
  }

  check(
    'la trama fina es el doble de la gruesa MÁS el desajuste',
    FINE_CELLS === 2 * MOIRE_COARSE_CELLS + MOIRE_MISMATCH,
    `${FINE_CELLS} = 2 × ${MOIRE_COARSE_CELLS} + ${MOIRE_MISMATCH}`
  )
  const ratio = FINE_CELLS / MOIRE_COARSE_CELLS
  check(
    'y el cociente de textura queda apenas corrido de 2',
    ratio > 2 && ratio < 2.3,
    `${ratio.toFixed(4)} — la lectura "cuatro cuadraditos en un cuadrado" se conserva`
  )
  check(
    'las dos cuentas son enteras: el mosaico cierra alrededor del cilindro',
    Number.isInteger(FINE_CELLS) && Number.isInteger(MOIRE_COARSE_CELLS),
    'si no cerraran habría una costura vertical en el punto de empalme'
  )
  check(
    'el slider llega hasta 0, que es donde el batido de TEXTURA desaparece',
    MOIRE_MISMATCH >= 0 && MOIRE_MISMATCH <= MOIRE_MISMATCH_MAX,
    `default ${MOIRE_MISMATCH}, rango 0..${MOIRE_MISMATCH_MAX}`
  )
}

report('s10 · dónde está la envolvente')
