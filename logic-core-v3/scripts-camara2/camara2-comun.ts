/**
 * BANCO DE CAMARA-2 — mover UN SOLO keyframe, medido y no aplicado.
 *
 * ── ⚠️ LA PRIMERA CORRECCIÓN, Y CAMBIA EL SPRINT ─────────────────────────
 *
 * La hipótesis dice *«alejar únicamente su keyframe … podría dar la misma mejora
 * sin tocar las otras siete»*. **Eso es exactamente lo que CAMARA-1 midió.**
 * `d-simulacion.ts` y `e-gate.ts` de aquel bloque reemplazan UNA cadena —la
 * línea de la pose del hero, que aparece una sola vez en `choreography.ts`— y
 * ninguna otra. Las otras siete distancias nunca se tocaron: en la corrida del
 * gate con `distance: 40`, `trabajos` y `cierre` siguieron dando 3,7 y 4,7
 * bandas, que son sus valores de siempre.
 *
 * O sea que «d=34 global» en el reporte de CAMARA-1 quiere decir **en todos los
 * ANCHOS** (porque `choreography.ts` tiene un número por keyframe y no sabe de
 * viewport), no en todos los keyframes. Los 19 rojos y las 16,3 bandas ya son
 * el resultado de mover el hero solo.
 *
 * Lo que este banco agrega es lo que aquél no preguntó: **hasta dónde se puede
 * alejar el hero antes de que cada pared se cruce**, una por una.
 *
 * ── ⚠️ LA COPIA DE LA FÓRMULA DEL BATIDO, declarada ──────────────────────
 *
 * `phaseGradient` y `sunAzimuthAt` viven como funciones LOCALES dentro de
 * `s11-pantalla.invariant.ts` y no se exportan. Reimplementarlas acá es una
 * copia, y una copia sin control es una fórmula que se arregla en un lado solo.
 * El control está en `a-moire.ts` §0: esta composición tiene que reproducir
 * **los números que el invariante publica** —hero 108 px de celda, 626 px de
 * batido, 3,1 bandas a 16/9 con la distancia de hoy— y los de la corrida del
 * gate de CAMARA-1, que fue con `distance: 40` —celda 34 px, batido 118 px,
 * 16,3 bandas—. Si no los reproduce, el banco no mide lo mismo que el gate y no
 * sirve para decidir nada. **El control ya cobró una pieza**: la primera versión
 * leó ese «34» como si fuera la distancia y no el tamaño de la celda, y salió
 * «NO COINCIDE» en el primer intento.
 *
 * Todo lo demás —`celosiaCrossings`, `celosiaLayers`, `sampleLightArc`,
 * `rayFloor`, `cameraAt`, `sunDirectionAt`— se IMPORTA de donde ya vive.
 */

import { celosiaCrossings, celosiaLayers } from '@/app/v3/_lib/escena/celosiaGeometry'
import { sampleLightArc } from '@/app/v3/_lib/escena/choreographySampler'
import type { MutableLightLevels } from '@/app/v3/_lib/escena/choreographyTypes'
import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'
import { rayFloor } from '@/app/probe-escena/__tests__/frameProbe'
import { sunDirectionAt } from '@/app/probe-escena/__tests__/shading'
import { TAN_HALF_V, cameraAt, emptyPose, halfFovDeg, makeTrack, type Track, type Vec3 } from '@/app/probe-escena/__tests__/harness'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/camara2'
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/camara2'

/** El keyframe que este bloque mueve. Es el único. */
export const HERO = CHOREO_KEYFRAMES[0]

/**
 * ⚠️ **EL GUARDIÁN DE CONTAMINACIÓN, y no es ceremonia: esto ya pasó.**
 *
 * Dos scripts de este banco ESCRIBEN `choreography.ts` y lo restauran al cerrar
 * (`d-simulacion.ts` y `e-gate.ts` de CAMARA-1). Cualquier medición que corra
 * mientras uno de ellos tiene el árbol tocado lee la distancia MODIFICADA como
 * si fuera la de hoy. En este bloque salió una tabla de saltos del preloader con
 * **todos los valores en cero** y «hoy = 25,75»: se lee perfecta y no mide nada.
 *
 * Por eso la distancia de hoy se DECLARA y se comprueba. Un árbol tocado tiene
 * que ser una falla ruidosa, no una tabla plausible.
 */
export const DISTANCIA_DECLARADA_DEL_HERO = 19

export function exigirArbolLimpio(): void {
  if (HERO.pose.distance !== DISTANCIA_DECLARADA_DEL_HERO) {
    throw new Error(
      `el arbol esta TOCADO: el hero tiene distance ${HERO.pose.distance} y se declaro ` +
        `${DISTANCIA_DECLARADA_DEL_HERO}. Otro script del banco lo esta escribiendo; esperar a que restaure.`,
    )
  }
}

/** Una pista con la distancia del HERO cambiada, sobre una copia del array. */
export function pistaConHeroEn(distancia: number): Track {
  return makeTrack(
    CHOREO_KEYFRAMES.map((k) => (k.name === HERO.name ? { ...k, pose: { ...k.pose, distance: distancia } } : k)),
  )
}

const LAYERS = celosiaLayers(MOIRE_MISMATCH)
const RAD = Math.PI / 180
const arco: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

/** COPIA DECLARADA de `s11-pantalla.invariant.ts`. Ver el docblock del archivo. */
function azimutDelSol(p: number): number {
  sampleLightArc(p, arco)
  return arco.azimuthDeg * RAD
}

/** COPIA DECLARADA de `s11-pantalla.invariant.ts`. Ver el docblock del archivo. */
function gradienteDeFase(punto: Vec3, sol: Vec3, capa: (typeof LAYERS)[number], paso: Vec3): number {
  const eps = 0.002
  const aca = celosiaCrossings(punto, sol, capa, 0)[0]
  const alla = celosiaCrossings([punto[0] + paso[0] * eps, punto[1], punto[2] + paso[2] * eps], sol, capa, 0)[0]
  if (!aca || !alla) return Number.NaN
  return Math.hypot((alla.u - aca.u) / eps, (alla.v - aca.v) / eps)
}

export interface Batido {
  /** La celda de la trama proyectada, en píxeles de pantalla. */
  readonly celdaPx: number
  /** El batido —el moiré— en píxeles de pantalla. */
  readonly batidoPx: number
  /** Cuántas bandas de batido entran a lo ancho del cuadro. La cifra de la regla. */
  readonly bandas: number
  /** La distancia de la cámara al primer impacto contra el piso. */
  readonly profundidad: number
}

/**
 * EL BATIDO EN UN PROGRESO, con una pista dada y un cuadro dado.
 *
 * ⚠ **El cuadro entra por parámetro y no es un detalle.** El invariante del gate
 * mide a **1920×1080** (16/9), que es escritorio. La palanca de este bloque vive
 * ABAJO de 1025, o sea en cuadros verticales, donde `PX_H` es chico y el aspecto
 * es otro. Medir sólo a 16/9 contestaría por una ventana en la que la palanca no
 * se aplica.
 */
export function batidoEn(pista: Track, progreso: number, anchoPx: number, altoPx: number): Batido | null {
  const aspecto = anchoPx / altoPx
  const cam = cameraAt(pista, progreso, aspecto, emptyPose())
  const sol = sunDirectionAt(progreso)
  let impacto: Vec3 | null = null
  let profundidad = 0
  for (let k = 0; k <= 20; k += 1) {
    const ny = -(k / 20) * TAN_HALF_V
    const crudo: Vec3 = [
      cam.forward[0] + cam.up[0] * ny,
      cam.forward[1] + cam.up[1] * ny,
      cam.forward[2] + cam.up[2] * ny,
    ]
    const largo = Math.hypot(crudo[0], crudo[1], crudo[2])
    const dir: Vec3 = [crudo[0] / largo, crudo[1] / largo, crudo[2] / largo]
    const t = rayFloor(cam.position, dir)
    if (isFinite(t)) {
      impacto = [cam.position[0] + dir[0] * t, cam.position[1] + dir[1] * t, cam.position[2] + dir[2] * t]
      profundidad = t
      break
    }
  }
  if (impacto === null) return null
  const azimut = azimutDelSol(progreso)
  const tangente: Vec3 = [Math.cos(azimut), 0, -Math.sin(azimut)]
  const g = LAYERS.map((capa) => gradienteDeFase(impacto, sol, capa, tangente))
  const mundoPorPixel = (2 * TAN_HALF_V * profundidad) / altoPx
  const celdaPx = 1 / g[0] / mundoPorPixel
  const batidoPx = 1 / Math.abs(g[0] - 2 * g[1]) / mundoPorPixel
  return { celdaPx, batidoPx, bandas: anchoPx / batidoPx, profundidad }
}

/** El cuadro del gate: 16/9 a 1920×1080. */
export const CUADRO_DEL_GATE = { ancho: 1920, alto: 1080 } as const

/**
 * LA VENTANA DE LA REGLA. El mensaje del invariante dice «entre dos y cinco»; la
 * condición que corre es `bestBands > 1.5 && worstBands < 6`. Se publican las dos
 * y se decide contra la ESTRICTA, que es la que el texto promete.
 */
export const BANDAS_PROSA = { min: 2, max: 5 } as const
export const BANDAS_AFIRMADAS = { min: 1.5, max: 6 } as const

export function dos(n: number): number {
  return Number(n.toFixed(2))
}
export function uno(n: number): number {
  return Number(n.toFixed(1))
}

export function argumento(nombre: string, defecto: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`))
  return a === undefined ? defecto : a.slice(nombre.length + 3)
}

export { halfFovDeg }
