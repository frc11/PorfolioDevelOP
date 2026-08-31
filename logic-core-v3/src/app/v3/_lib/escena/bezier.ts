/**
 * EL EVALUADOR DE CURVAS — un cubic-bezier de CSS, resuelto.
 *
 * Salió de `choreographySampler.ts` en S6, cuando ese archivo pasó a muestrear
 * dos cosas (el track de cámara y el arco de luz) y las dos lo usan. Es la pieza
 * más "matemática" del módulo y la que menos tiene que ver con la coreografía:
 * no sabe qué es un keyframe.
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
