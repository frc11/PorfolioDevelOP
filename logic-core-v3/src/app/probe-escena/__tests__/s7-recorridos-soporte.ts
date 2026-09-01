/**
 * LA REFERENCIA CONGELADA DE S6 Y LOS DETECTORES DE `s7-recorridos.invariant.ts`.
 *
 * ── ⚠️ POR QUÉ SE PARTIÓ, Y POR DÓNDE (SITIO-S10) ──────────────────────────
 *
 * El invariante estaba en **293 líneas**, o sea con siete de margen, y darle los
 * controles positivos que le faltaban lo llevó a 329. Se partió con la costura
 * de naturaleza que el repo ya usa: de un lado **la tabla de referencia y los
 * detectores puros**, del otro **las afirmaciones y sus entradas equivocadas**.
 *
 * ⚠️ **Y la mitad que importa de esa costura:** cada detector recibe la lista por
 * PARÁMETRO. El invariante corría 44 afirmaciones sin un solo control positivo
 * —nada probaba que sus detectores supieran decir que NO— y con los bucles en
 * línea no había forma de darles una entrada rota sin duplicar el bucle. Ahora
 * `ROTO` corre por la MISMA función que los cuatro recorridos de verdad.
 *
 * ⚠️ **Este archivo NO termina en `.invariant.ts` a propósito** (regla 14): un
 * módulo de apoyo con ese sufijo entraría a la lista de instrumentos huérfanos
 * sin tener nada que correr.
 */
import type { ChoreoKeyframe } from '@/app/v3/_lib/escena/choreographyTypes'
import { PROBE_RANGES } from '@/app/v3/_lib/escena/probeStore'
import { VARIANT_CALIBRADA_KEYFRAMES } from '../_components/variantCalibrada'

// ── Las 23 poses de S6, congeladas ──────────────────────────────────────────

/**
 * El recorrido tal cual lo dejó S6, con las 21 posiciones calibradas por el
 * humano y los 2 derivados de S4. **Es la referencia contra la que se verifica
 * que ni S7 ni S9 tocaron una sola pose.** Si esta tabla y el archivo divergen,
 * uno de los dos está mal y hay que mirar cuál.
 */
export const S6_POSES: readonly (readonly [string, number, number, number, number, number, number])[] = [
  ['entrada · mirada alta', 0, 0, 9, 15, 0.9, 0],
  ['hero', 0.125, 0, 0, 11, 0.75, 0],
  ['hero · sostén', 0.188, 0, 0, 11, 0.75, 0],
  ['quiénes somos · persona 1', 0.25, 0, 5, 9, -0.8, 0],
  ['quiénes somos · persona 1 · sostén', 0.293, 0, 5, 9, -0.8, 0],
  ['persona 2 · cruce (apex)', 0.335, 0, 4.5431, 10.7012, -0.1568, 0],
  ['quiénes somos · persona 2', 0.375, 0, 5, 9, 0.8, 0],
  ['quiénes somos · persona 2 · sostén', 0.395, 0, 2.6492, 9.8298, 0.5698, 0],
  ['números · baja la altura', 0.445, 0, -3.9, 9, 0.4762, 0],
  ['números · sube y se aleja', 0.491, 0, 1, 11, 0.0129, 0],
  ['números', 0.5, 0, 1, 14.1, 0, 0],
  ['números · sostén', 0.563, 0, 0, 12, 0, 0],
  ['portfolio', 0.625, 45, 6, 7, -1, 0],
  ['portfolio · sostén', 0.643, 45, 6, 7, -1, 0],
  ['demos · giro ¼', 0.679, 135, 3.9, 7, -0.5, 0],
  ['demos · giro ½', 0.697, 180, -3.9, 8, 0, 0.1],
  ['demos · giro ¾', 0.715, 225, -3.9, 7, -0.5, 0],
  ['demos', 0.75, 315, -3.9, 7, 1, 0],
  ['demos · sostén', 0.788, 315, -3.9, 7, 1, 0],
  ['final · se levanta', 0.825, 315, 4.5, 7, 1, 0],
  ['final · gira', 0.85, 360, 4.5, 8, 0, 0],
  ['cierre · sostén', 0.89, 360, 1.5, 16, 0, 0],
  ['cierre', 1, 360, 1.5, 16, 0, 0],
]

/** Los siete arcos que S7 agregó. */
export const S7_ARCS: readonly string[] = [
  'hero · arco de bajada',
  'quiénes somos · arco de entrada',
  'números · arco de caída',
  'números · deriva en arco',
  'portfolio · arco de aproximación',
  'final · arco de subida',
  'cierre · arco de retirada',
]

/** El recorrido de S6 reconstruido: la calibrada MENOS los siete arcos. */
export const WITHOUT_ARCS = VARIANT_CALIBRADA_KEYFRAMES.filter(
  (keyframe) => !S7_ARCS.includes(keyframe.name)
)

// ── Los detectores, con la lista por parámetro ──────────────────────────────

export const atsCrecientes = (ks: readonly ChoreoKeyframe[]): boolean =>
  ks.every((k, i) => i === 0 || k.at > ks[i - 1].at)

export const fueraDeRango = (ks: readonly ChoreoKeyframe[]): string[] =>
  ks
    .filter(
      ({ pose }) =>
        !(
          pose.height >= PROBE_RANGES.height.min &&
          pose.height <= PROBE_RANGES.height.max &&
          pose.distance >= PROBE_RANGES.distance.min &&
          pose.distance <= PROBE_RANGES.distance.max &&
          Math.abs(pose.frameX) <= 1 &&
          Math.abs(pose.frameY) <= 1
        )
    )
    .map((k) => k.name)

/**
 * Qué poses se movieron respecto de una tabla de referencia. Las DOS listas
 * entran por parámetro: es lo que permite darle una referencia corrida a
 * propósito y comprobar que la comparación la ve.
 */
export function seMovieron(
  vivas: readonly ChoreoKeyframe[],
  ref: typeof S6_POSES
): string[] {
  const movidas: string[] = []
  for (let i = 0; i < Math.min(vivas.length, ref.length); i += 1) {
    const live = vivas[i]
    const [name, at, angleDeg, height, distance, frameX, frameY] = ref[i]
    const same =
      live.name === name &&
      live.at === at &&
      live.pose.angleDeg === angleDeg &&
      live.pose.height === height &&
      live.pose.distance === distance &&
      live.pose.frameX === frameX &&
      live.pose.frameY === frameY
    if (!same) movidas.push(live.name)
  }
  return movidas
}

// ── Las entradas deliberadamente equivocadas ────────────────────────────────

/** Un recorrido FABRICADO que viola las dos: `at` que no avanza y pose fuera de rango. */
export const ROTO: readonly ChoreoKeyframe[] = [
  { name: 'sana', at: 0, pose: { angleDeg: 0, height: 0, distance: 9, frameX: 0, frameY: 0 } },
  { name: 'rota', at: 0, pose: { angleDeg: 0, height: 9e3, distance: 9e3, frameX: 4, frameY: 4 } },
]

/** La referencia de S6 con UN milímetro de mundo corrido en la primera altura. */
export const REF_CORRIDA: typeof S6_POSES = S6_POSES.map((fila, i) =>
  i === 0 ? ([fila[0], fila[1], fila[2], fila[3] + 0.001, fila[4], fila[5], fila[6]] as const) : fila
)
