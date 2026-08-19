import {
  CHOREO_CHANNELS,
  CHOREO_EASE_POINTS,
  CHOREO_TRAMOS,
  type ChoreoKeyframe,
  type MutableChoreoPose,
} from './choreography'

/**
 * La matemática de la coreografía. Puro: sin React, sin three, sin DOM.
 *
 * Se separa de `choreography.ts` porque ese archivo tiene que poder editarse
 * para calibrar el movimiento sin leer una línea de lógica. Acá está lo que no
 * se toca: el evaluador de bezier, el desenvuelto del ángulo, el muestreo del
 * track y la amortiguación.
 *
 * Todo lo que corre por frame escribe sobre objetos que recibe, sin asignar
 * memoria: el `useFrame` no puede ir dejando basura para el recolector.
 */

// ── Bezier ──────────────────────────────────────────────────────────────────

/**
 * Un cubic-bezier de CSS es una curva de (0,0) a (1,1) con dos puntos de
 * control; `MOTION_EASE` guarda exactamente esos cuatro números. Para evaluarla
 * hay que invertir x(t) —no hay forma cerrada— y recién ahí leer y(t).
 *
 * `component` y `slope` son la Bernstein de grado 3 con P0=0 y P3=1, ya
 * simplificada.
 */
function bezierComponent(a: number, b: number, t: number): number {
  const u = 1 - t
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t
}

function bezierSlope(a: number, b: number, t: number): number {
  const u = 1 - t
  return 3 * u * u * a + 6 * u * t * (b - a) + 3 * t * t * (1 - b)
}

const NEWTON_ITERATIONS = 8
const NEWTON_EPSILON = 1e-6
const BISECTION_ITERATIONS = 24

/**
 * Evalúa la curva en `x` ∈ [0,1].
 *
 * Newton-Raphson desde `t = x` —que para curvas de easing razonables converge
 * en dos o tres pasos— con bisección como red: si la pendiente se acerca a cero
 * (curvas con tramos casi planos, que las hay), Newton diverge y hay que
 * caerse a un método que no puede fallar.
 *
 * Corre UNA vez por frame: los siete canales de un mismo segmento comparten el
 * `t` resultante.
 */
export function cubicBezierEase(
  points: readonly [number, number, number, number],
  x: number
): number {
  if (x <= 0) return 0
  if (x >= 1) return 1

  const [x1, y1, x2, y2] = points

  let t = x
  for (let i = 0; i < NEWTON_ITERATIONS; i += 1) {
    const error = bezierComponent(x1, x2, t) - x
    if (Math.abs(error) < NEWTON_EPSILON) return bezierComponent(y1, y2, t)

    const slope = bezierSlope(x1, x2, t)
    if (Math.abs(slope) < NEWTON_EPSILON) break

    t -= error / slope
    if (t < 0 || t > 1) break
  }

  let low = 0
  let high = 1
  t = x
  for (let i = 0; i < BISECTION_ITERATIONS; i += 1) {
    const value = bezierComponent(x1, x2, t)
    if (Math.abs(value - x) < NEWTON_EPSILON) break
    if (value > x) high = t
    else low = t
    t = (low + high) / 2
  }

  return bezierComponent(y1, y2, t)
}

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
 * Barrido lineal: son 17 keyframes y corre una vez por frame. Una búsqueda
 * binaria acá sería más código para ahorrar catorce comparaciones.
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
  const raw = span > 0 ? (clamped - from.at) / span : 1

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
