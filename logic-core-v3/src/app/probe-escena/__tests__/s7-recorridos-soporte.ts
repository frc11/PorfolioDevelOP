/**
 * LOS DETECTORES DE `s7-recorridos.invariant.ts`.
 *
 * ── ⚠️ POR QUÉ SE PARTIÓ, Y POR DÓNDE (SITIO-S10) ──────────────────────────
 *
 * El invariante estaba en **293 líneas**, o sea con siete de margen, y darle los
 * controles positivos que le faltaban lo llevó a 329. Se partió con la costura
 * de naturaleza que el repo ya usa: de un lado **los detectores puros**, del
 * otro **las afirmaciones y sus entradas equivocadas**.
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

// ── Las entradas deliberadamente equivocadas ────────────────────────────────

/** Un recorrido FABRICADO que viola las dos: `at` que no avanza y pose fuera de rango. */
export const ROTO: readonly ChoreoKeyframe[] = [
  { name: 'sana', at: 0, pose: { angleDeg: 0, height: 0, distance: 9, frameX: 0, frameY: 0 } },
  { name: 'rota', at: 0, pose: { angleDeg: 0, height: 9e3, distance: 9e3, frameX: 4, frameY: 4 } },
]
