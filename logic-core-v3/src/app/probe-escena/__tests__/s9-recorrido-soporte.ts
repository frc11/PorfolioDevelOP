/**
 * EL SOPORTE DE `s9-recorrido.invariant.ts` — los instrumentos, sin las
 * afirmaciones.
 *
 * ── Por qué está partido (V3-E) ────────────────────────────────────────────
 *
 * Por la regla de las 300 líneas del repo. V3-E reescribió las cuatro
 * comprobaciones que describían la decisión vieja —el sostén del hero— y cada
 * una necesitó su instrumento y su control positivo: el archivo pasó de 262 a
 * 440 líneas. El corte es el mismo que usan `s9-instrumentos.ts` y
 * `s7-recorridos-soporte.ts` en este mismo repo, y por la misma razón: acá está
 * **cómo se mide** y al lado **cuánto dio y qué se afirma de eso**.
 *
 * Nada de acá afirma nada. Si un instrumento devolviera vacío o cero de gusto,
 * quien lo detecta es el control positivo del invariante; ése es el reparto.
 */
import type { ChoreoKeyframe, ChoreoTramo } from '@/app/v3/_lib/escena/choreographyTypes'

// ── La forma del recorrido ──────────────────────────────────────────────────

/** La firma de una pose, para compararlas por valor y no por objeto. */
export function firma(keyframe: ChoreoKeyframe): string {
  const { angleDeg, height, distance, frameX, frameY } = keyframe.pose
  return `${angleDeg}|${height}|${distance}|${frameX}|${frameY}`
}

/** Un par de nombres: de qué keyframe a cuál. */
export type Par = readonly [string, string]

/**
 * Los sostenes que el array TIENE, derivados: todo keyframe cuya pose repite
 * EXACTAMENTE la del anterior.
 *
 * Se deriva y no se declara porque una tabla escrita a mano sólo puede fallar en
 * un sentido —quejarse de lo que le falta— y el sentido que importa acá es el
 * otro: un sostén que VUELVE a aparecer sin que nadie lo declare.
 */
export function sostenesDerivados(keyframes: readonly ChoreoKeyframe[]): Par[] {
  return keyframes.flatMap((keyframe, i) =>
    i > 0 && firma(keyframes[i - 1]) === firma(keyframe)
      ? [[keyframes[i - 1].name, keyframe.name] as Par]
      : []
  )
}

/** Los pares, en un renglón legible. Vacío se dice, no se calla. */
export function comoTexto(pares: readonly Par[]): string {
  return pares.length === 0 ? '(ninguno)' : pares.map(([from, to]) => `${from} → ${to}`).join(' · ')
}

/**
 * ¿El keyframe de cada tramo cae en el borde que la tabla le asigna?
 *
 * `borde` es `from` o `to`, y ahí está toda la gracia: la misma función contesta
 * por los cinco tramos que CIERRAN en su pose y por el del hero, que la tiene en
 * la APERTURA. Correrla con el borde cambiado es el control positivo — si diera
 * verde con los dos, no estaría mirando el borde.
 */
export function enElBorde(
  tabla: readonly Par[],
  borde: 'from' | 'to',
  tramos: readonly ChoreoTramo[],
  porNombre: ReadonlyMap<string, ChoreoKeyframe>
): { ok: boolean; detalle: string } {
  let ok = true
  const detalle: string[] = []
  for (const [tramoName, keyframeName] of tabla) {
    const tramo = tramos.find((candidate) => candidate.name === tramoName)
    const keyframe = porNombre.get(keyframeName)
    if (!tramo || !keyframe || keyframe.at !== tramo[borde]) ok = false
    detalle.push(`${tramoName} → ${keyframe?.at ?? '?'}`)
  }
  return { ok, detalle: detalle.join(' · ') }
}
