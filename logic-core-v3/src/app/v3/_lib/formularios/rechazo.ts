/**
 * [PULIDO 10] J5 · EL RECHAZO DE UN FORMULARIO (los dos: el del pie y el panel de Contacto) — cuando el envío falla, la placa se
 * hunde y vuelve con un resorte amortiguado, Enviar pasa a «Reintentar» con un giro chico, el error sale de atrás del botón en
 * su renglón, los campos quedan como estaban y el foco va a Reintentar; suena el pulso (grave y corto). Con movimiento
 * reducido, sin resorte ni giro.
 *
 * El resorte es UNO para los dos formularios (la misma curva): la respuesta a un golpe de un resorte amortiguado, normalizada a
 * su hundimiento máximo: baja rápido, vuelve pasándose apenas y se asienta.
 */
export const RECHAZO = {
  /** Cuánto se hunde (px de la placa del pie; en el panel, su `translateZ`) y cuánto dura (s). */
  hondoPx: 26,
  s: 0.9,
  /** La amortiguación (más, se asienta antes) y las vueltas del resorte en la duración. */
  amortiguacion: 4.2,
  vueltas: 1.6,
  /** En la hoja de abajo del teléfono (sin profundidad): cuánto se achica en el fondo del hundimiento. */
  escala: 0.035,
  /** El giro de Reintentar: desde canto (−90°) a de frente, en s. */
  giroS: 0.38,
} as const

export const REINTENTAR = 'Reintentar'

const pico = ((): number => {
  let m = 0
  for (let k = 0; k <= 400; k += 1) m = Math.max(m, crudo(k / 400))
  return m
})()

function crudo(u: number): number {
  return Math.exp(-RECHAZO.amortiguacion * u) * Math.sin(2 * Math.PI * RECHAZO.vueltas * u)
}

/** Cuánto está hundida la placa en `u` (0 a 1 de la duración): 0 al empezar, 1 en el fondo, un poco negativa al pasarse, ~0 al final. */
export function hundidoDelRechazo(u: number): number {
  if (u <= 0 || u >= 1) return 0
  return crudo(u) / pico
}

/** La curva en cuadros, para Motion (`animate(valor, cuadros, { duration: RECHAZO.s, ease: 'linear' })`), ya escalada. */
export function cuadrosDelRechazo(escala: number, cuantos = 24): number[] {
  return Array.from({ length: cuantos + 1 }, (_, k) => hundidoDelRechazo(k / cuantos) * escala)
}
