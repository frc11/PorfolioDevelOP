import { cubicBezierEase } from './bezier'
import { CHOREO_TRAMOS, LIGHT_ARC } from './choreography'
import {
  CHOREO_CHANNELS,
  CHOREO_EASE_POINTS,
  type ChoreoKeyframe,
  type MutableChoreoPose,
  type MutableLightLevels,
} from './choreographyTypes'

/**
 * La matemática de la coreografía. Puro: sin React, sin three, sin DOM.
 *
 * Se separa de `choreography.ts` porque ese archivo tiene que poder editarse
 * para calibrar el movimiento sin leer una línea de lógica. Acá está lo que no
 * se toca: el desenvuelto del ángulo, el muestreo del track, el del arco de luz
 * y la amortiguación. El evaluador de curvas está un escalón más abajo, en
 * `bezier.ts`, porque lo usan los dos muestreos y no sabe qué es un keyframe.
 *
 * Todo lo que corre por frame escribe sobre objetos que recibe, sin asignar
 * memoria: el `useFrame` no puede ir dejando basura para el recolector.
 */

// ── Ángulo ──────────────────────────────────────────────────────────────────

/** Diferencia por el camino corto: el resultado siempre cae en (−180, 180]. */
export function shortestAngleDelta(from: number, to: number): number {
  let delta = (to - from) % 360
  if (delta > 180) delta -= 360
  if (delta <= -180) delta += 360
  return delta
}

/** Envuelve a [0, 360). Solo para PUBLICAR: la cámara usa el desenvuelto. */
export function wrapAngle360(angle: number): number {
  const wrapped = angle % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

// ── El track ────────────────────────────────────────────────────────────────

export type ChoreoTrack = {
  readonly keyframes: readonly ChoreoKeyframe[]
  /**
   * Ángulo DESENVUELTO de cada keyframe, en grados acumulados. Se precomputa
   * una sola vez al construir el track, y el muestreo es un lerp plano sobre
   * esta tabla.
   *
   * Precomputar y no acumular por frame es lo que garantiza que el ángulo en
   * `at = 0,750` sea exactamente 302,0 SIEMPRE — una acumulación frame a frame
   * derivaría con el tiempo y con el framerate.
   */
  readonly unwrappedAngles: readonly number[]
}

/**
 * Construye el track: valida el orden y resuelve el desenvuelto del ángulo.
 *
 * `turn: 'short'` (default) toma el camino corto entre keyframes consecutivos.
 * `turn: 'literal'` respeta la diferencia tal cual está escrita — es lo que
 * hace que el tramo de 360° dé la vuelta entera.
 */
export function buildTrack(keyframes: readonly ChoreoKeyframe[]): ChoreoTrack {
  if (keyframes.length < 2) {
    throw new Error('choreography: hacen falta al menos dos keyframes.')
  }

  const unwrapped: number[] = [keyframes[0].pose.angleDeg]

  for (let i = 1; i < keyframes.length; i += 1) {
    const previous = keyframes[i - 1]
    const current = keyframes[i]

    if (current.at <= previous.at) {
      throw new Error(
        `choreography: los keyframes tienen que ir en orden de progreso creciente ("${current.name}" en ${current.at} viene después de "${previous.name}" en ${previous.at}).`
      )
    }

    const delta =
      current.turn === 'literal'
        ? current.pose.angleDeg - previous.pose.angleDeg
        : shortestAngleDelta(previous.pose.angleDeg, current.pose.angleDeg)

    unwrapped.push(unwrapped[i - 1] + delta)
  }

  return { keyframes, unwrappedAngles: unwrapped }
}

/**
 * Índice del keyframe de LLEGADA del segmento que contiene a `progress` (o sea:
 * el segmento va de `index - 1` a `index`). Nunca devuelve 0.
 *
 * Barrido lineal: son dieciséis keyframes y corre una vez por frame. Una
 * búsqueda binaria acá sería más código para ahorrar trece comparaciones.
 */
export function segmentIndexAt(track: ChoreoTrack, progress: number): number {
  const { keyframes } = track
  for (let i = 1; i < keyframes.length; i += 1) {
    if (progress <= keyframes[i].at) return i
  }
  return keyframes.length - 1
}

/** Índice del keyframe más cercano al progreso. Es lo que el simulador nombra. */
export function nearestKeyframeIndex(track: ChoreoTrack, progress: number): number {
  const { keyframes } = track
  let best = 0
  let bestDistance = Math.abs(progress - keyframes[0].at)

  for (let i = 1; i < keyframes.length; i += 1) {
    const distance = Math.abs(progress - keyframes[i].at)
    if (distance < bestDistance) {
      best = i
      bestDistance = distance
    }
  }

  return best
}

/** Índice del tramo que contiene al progreso. Los tramos cubren [0,1] sin huecos. */
export function tramoIndexAt(progress: number): number {
  for (let i = 0; i < CHOREO_TRAMOS.length; i += 1) {
    if (progress <= CHOREO_TRAMOS[i].to) return i
  }
  return CHOREO_TRAMOS.length - 1
}

/**
 * Muestrea el track en `progress` y ESCRIBE sobre `out`.
 *
 * Devuelve el ángulo desenvuelto en `out.angleDeg` (puede pasarse de 360, y
 * tiene que hacerlo: es lo que da la vuelta entera). Envolverlo es tarea de
 * quien lo publique.
 */
export function sampleTrack(
  track: ChoreoTrack,
  progress: number,
  out: MutableChoreoPose
): void {
  const { keyframes, unwrappedAngles } = track

  const clamped = progress <= 0 ? 0 : progress >= 1 ? 1 : progress
  const index = segmentIndexAt(track, clamped)
  const from = keyframes[index - 1]
  const to = keyframes[index]

  const span = to.at - from.at
  // Acotado a [0,1], y no es defensa gratuita: desde S5 el `at` del primer y del
  // último keyframe se puede mover con el editor. Con el primero en 0,05 el
  // progreso 0 cae ANTES del segmento y da una fracción negativa; `linear` no
  // pasa por `cubicBezierEase` —que ya recorta— así que extrapolaría la pose
  // hacia afuera del track. Un `min`/`max` lo cierra para los dos extremos.
  const unclamped = span > 0 ? (clamped - from.at) / span : 1
  const raw = unclamped <= 0 ? 0 : unclamped >= 1 ? 1 : unclamped

  const ease = to.ease ?? 'shift'
  const t = ease === 'linear' ? raw : cubicBezierEase(CHOREO_EASE_POINTS[ease], raw)

  for (const channel of CHOREO_CHANNELS) {
    if (channel === 'angleDeg') continue
    const a = from.pose[channel]
    out[channel] = a + (to.pose[channel] - a) * t
  }

  const a = unwrappedAngles[index - 1]
  out.angleDeg = a + (unwrappedAngles[index] - a) * t
}

// ── El arco de luz ──────────────────────────────────────────────────────────

/**
 * Muestrea `LIGHT_ARC` en `progress` y ESCRIBE sobre `out`.
 *
 * Misma máquina que el track de cámara —bordes, recorte de la fracción y el
 * mismo evaluador de bezier— sobre una tabla propia. **No comparte los
 * keyframes a propósito**: la luz tiene su forma y sus puntos de quiebre, y
 * atarla a los de la cámara la obligaría a inventar un valor cada vez que se
 * agrega un keyframe de pose, que es exactamente el problema que S6 vino a
 * resolver.
 *
 * Desde S7 devuelve además **dónde está el sol** (azimut y elevación), que es
 * lo mismo que decir dónde está la luz principal: los cuatro canales describen
 * un solo objeto. Ver `LIGHT_ARC` en `choreography.ts`.
 *
 * No pasa por el editor: el arco no es editable desde el panel, así que la tabla
 * se lee directo del módulo igual que los tramos.
 */
export function sampleLightArc(progress: number, out: MutableLightLevels): void {
  const first = LIGHT_ARC[0]

  // Un arco de un solo punto es una luz constante, no un error: se contesta con
  // ese punto en vez de indexar fuera del array.
  if (LIGHT_ARC.length < 2) {
    out.level = first.level
    out.kelvin = first.kelvin
    out.azimuthDeg = first.azimuthDeg
    out.elevationDeg = first.elevationDeg
    return
  }

  const clamped = progress <= 0 ? 0 : progress >= 1 ? 1 : progress

  let index = 1
  while (index < LIGHT_ARC.length - 1 && clamped > LIGHT_ARC[index].at) index += 1

  const from = LIGHT_ARC[index - 1]
  const to = LIGHT_ARC[index]

  const span = to.at - from.at
  const unclamped = span > 0 ? (clamped - from.at) / span : 1
  const raw = unclamped <= 0 ? 0 : unclamped >= 1 ? 1 : unclamped

  const ease = to.ease ?? 'shift'
  const t = ease === 'linear' ? raw : cubicBezierEase(CHOREO_EASE_POINTS[ease], raw)

  out.level = from.level + (to.level - from.level) * t
  out.kelvin = from.kelvin + (to.kelvin - from.kelvin) * t
  // El azimut se interpola LINEALMENTE y no por el camino corto: el arco es
  // acotado por diseño (92° en todo el recorrido) y nunca cruza el ±180 donde
  // un desenvuelto haría falta. Un sol que tomara "el camino corto" podría dar
  // media vuelta de golpe si alguien escribiera dos stops muy separados; con la
  // interpolación directa, lo que se escribe es lo que se recorre.
  out.azimuthDeg = from.azimuthDeg + (to.azimuthDeg - from.azimuthDeg) * t
  out.elevationDeg = from.elevationDeg + (to.elevationDeg - from.elevationDeg) * t
}

// ── Amortiguación ───────────────────────────────────────────────────────────

/**
 * Persecución amortiguada, independiente del framerate.
 *
 * `1 − e^(−dt/τ)` es la fracción de la distancia que se cubre en este frame:
 * a τ segundos se cubrió el 63%, a 3τ el 95%. Que sea exponencial en `dt` y no
 * lineal es lo que hace que τ signifique lo mismo a 30 que a 144 fps — con un
 * `lerp(current, target, k)` de `k` fijo, la inercia cambiaría con el monitor.
 *
 * `epsilon` es el umbral de asentamiento: una exponencial nunca llega, y sin
 * cortarla el store se escribiría eternamente con micras que nadie ve.
 *
 * `tau <= 0` significa "sin inercia": va directo al objetivo. Es el extremo
 * izquierdo del slider de inercia y el camino de `prefers-reduced-motion`.
 */
export function dampTowards(
  current: number,
  target: number,
  tau: number,
  epsilon: number,
  dt: number
): number {
  if (tau <= 0 || dt <= 0) return target

  const diff = target - current
  if (Math.abs(diff) <= epsilon) return target

  return current + diff * (1 - Math.exp(-dt / tau))
}
