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
import {
  MOUSE_HEIGHT_FACTOR,
  MOUSE_TAU,
  SETTLE_EPSILON,
  SETTLE_TAU,
} from '@/app/v3/_lib/escena/choreographyPhysics'
import { buildTrack, sampleTrack } from '@/app/v3/_lib/escena/choreographySampler'
import type { ChoreoKeyframe, ChoreoTramo } from '@/app/v3/_lib/escena/choreographyTypes'
import { FLOOR_Y, type Track, emptyPose, makeTrack, speedAt } from './harness'

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

// ── La velocidad ────────────────────────────────────────────────────────────

/** El máximo de `speedAt` en una ventana de progreso, muestreada uniforme. */
export function velocidadMaxima(pista: Track, desde: number, hasta: number, pasos = 200): number {
  let maximo = 0
  for (let i = 0; i <= pasos; i += 1) {
    maximo = Math.max(maximo, speedAt(pista, desde + ((hasta - desde) * i) / pasos))
  }
  return maximo
}

/**
 * La pista de ANTES de V3-B: la misma, con el sostén del hero repuesto.
 *
 * Es la entrada del control positivo de la velocidad del arranque. El sostén se
 * RECONSTRUYE —copia exacta de la pose del hero en el `to` de su tramo, que es
 * lo que era— en vez de escribirse a mano: una pose escrita acá podría no ser la
 * que se sacó, y el control estaría comparando contra una invención.
 *
 * Devuelve `null` si falta el keyframe o el tramo, para que el invariante pueda
 * decir «no se pudo reconstruir» en vez de dar verde sobre una pista vacía.
 */
export function pistaConSostenDelHero(
  keyframes: readonly ChoreoKeyframe[],
  tramos: readonly ChoreoTramo[]
): Track | null {
  const hero = keyframes.find((keyframe) => keyframe.name === 'hero')
  const tramo = tramos.find((candidate) => candidate.name === 'hero')
  if (!hero || !tramo) return null
  return makeTrack([
    hero,
    {
      at: tramo.to,
      name: 'hero · sostén (reconstruido)',
      ease: 'shift',
      turn: 'literal',
      pose: { ...hero.pose },
    },
    ...keyframes.slice(1),
  ])
}

// ── El piso ─────────────────────────────────────────────────────────────────

/**
 * La altura mínima segura a una distancia dada.
 *
 * El offset de mouse baja la cámara `MOUSE_HEIGHT_FACTOR × distancia`, así que
 * el piso DEPENDE DE LA DISTANCIA: `FLOOR_Y + MOUSE_HEIGHT_FACTOR × distancia`.
 */
export function limiteDelPiso(distance: number): number {
  return FLOOR_Y + MOUSE_HEIGHT_FACTOR * distance
}

/** La holgura contra el papel de cada pose, con el mouse abajo del todo. */
export function holguraMinimaEstatica(keyframes: readonly ChoreoKeyframe[]): {
  holgura: number
  nombre: string
} {
  let holgura = Infinity
  let nombre = ''
  for (const keyframe of keyframes) {
    const gap = keyframe.pose.height - MOUSE_HEIGHT_FACTOR * keyframe.pose.distance - FLOOR_Y
    if (gap < holgura) {
      holgura = gap
      nombre = keyframe.name
    }
  }
  return { holgura, nombre }
}

/** La persecución del rig: `1 − e^(−dt/τ)`, con su banda muerta. */
function damp(current: number, target: number, tau: number, epsilon: number, dt: number): number {
  if (tau <= 0 || dt <= 0) return target
  const diff = target - current
  if (Math.abs(diff) <= epsilon) return target
  return current + diff * (1 - Math.exp(-dt / tau))
}

/**
 * La holgura con INERCIA. La altura y la distancia se persiguen con τ distintos
 * (0,24 y 0,26), así que un frame puede combinar una altura ya baja con una
 * distancia todavía alta — que es exactamente el peor caso para el piso. Se
 * barre el progreso a diez velocidades, en los dos sentidos, con el mouse
 * clavado abajo del todo.
 *
 * La persecución es una combinación convexa, así que NUNCA sobrepasa el
 * objetivo. Lo único que puede empeorar el margen es el desfasaje entre los dos
 * canales, y es lo que esto mide.
 */
export function holguraConInercia(
  keyframes: readonly ChoreoKeyframe[],
  settleScale: number
): { gap: number; at: number } {
  const simulated = buildTrack(keyframes)
  const target = emptyPose()
  const live = emptyPose()
  const dt = 1 / 60
  let worst = Infinity
  let worstAt = 0
  for (const speed of [0.02, 0.05, 0.1, 0.2, 0.35, 0.6, 1, 2, 5, 20]) {
    for (const direction of [1, -1]) {
      let progress = direction > 0 ? 0 : 1
      sampleTrack(simulated, progress, target)
      live.height = target.height
      live.distance = target.distance
      let mouse = 0
      const steps = Math.ceil(1 / (speed * dt)) + 300
      for (let i = 0; i < steps; i += 1) {
        progress = Math.min(1, Math.max(0, progress + direction * speed * dt))
        sampleTrack(simulated, progress, target)
        live.height = damp(
          live.height,
          target.height,
          SETTLE_TAU.height * settleScale,
          SETTLE_EPSILON.height,
          dt
        )
        live.distance = damp(
          live.distance,
          target.distance,
          SETTLE_TAU.distance * settleScale,
          SETTLE_EPSILON.distance,
          dt
        )
        mouse = damp(mouse, -1, MOUSE_TAU, 1e-6, dt)
        const gap = live.height + mouse * MOUSE_HEIGHT_FACTOR * live.distance - FLOOR_Y
        if (gap < worst) {
          worst = gap
          worstAt = progress
        }
      }
    }
  }
  return { gap: worst, at: worstAt }
}
