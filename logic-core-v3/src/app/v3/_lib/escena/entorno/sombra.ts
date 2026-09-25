/**
 * [ESCENA 3] LA SOMBRA CON FÍSICA — pura: (altura del logo, instante del último principal) →
 * escala y opacidad de la mancha de contacto.
 *
 * La mancha es la oclusión de contacto de siempre (`ContactOcclusion.tsx`); esto sólo le dice
 * cuánto. Se comporta como la sombra de un cielo amplio sobre un objeto que flota:
 *
 * - **altura**: si el logo sube, la mancha se achica y se aclara; si baja, crece y se marca. Es
 *   relativa a la altura de REPOSO, medida una vez sobre la geometría (sin la vira), así que con el
 *   logo en su lugar vale 1 y 1: la base limpia no cambia en Por qué ni en el pie.
 * - **pulso principal**: una contracción leve y breve, en el mismo instante en que nace el anillo
 *   principal, y vuelve sola.
 *
 * Nada de sombra proyectada: no hay mapa de sombras y no depende del sol.
 */

export const SOMBRA = {
  /** Exponentes de la respuesta a la altura: escala ∝ (h0/h)^e, opacidad ∝ (h0/h)^e. */
  exponenteDeEscala: 0.5,
  exponenteDeOpacidad: 1,
  /** Límites, para que un valor raro no la haga desaparecer ni tapar el piso. */
  escalaMin: 0.6,
  escalaMax: 1.4,
  opacidadMin: 0.3,
  opacidadMax: 1.5,
  /** La contracción con el pulso principal: cuánto, cuándo llega al fondo y cuánto dura. */
  contraccion: 0.12,
  contraccionPicoS: 0.16,
  contraccionDuraS: 0.9,
} as const

export interface EstadoDeLaSombra {
  readonly escala: number
  readonly opacidad: number
}

const acotar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

/** Cuánto se contrae la mancha a `s` segundos del principal: sube rápido, vuelve lento, 0 fuera. */
export function contraccionEn(s: number, c: typeof SOMBRA = SOMBRA): number {
  if (!(s >= 0) || s >= c.contraccionDuraS) return 0
  if (s < c.contraccionPicoS) {
    const u = s / c.contraccionPicoS
    return c.contraccion * u * u * (3 - 2 * u)
  }
  const u = (s - c.contraccionPicoS) / (c.contraccionDuraS - c.contraccionPicoS)
  return c.contraccion * (1 - u * u * (3 - 2 * u))
}

/**
 * @param altura cuánto flota ahora el punto más bajo del logo sobre el papel.
 * @param reposo cuánto flota en reposo (medido sobre la geometría, sin la vira).
 * @param desdeElPrincipal segundos desde el último pulso principal (`Infinity` si no hubo).
 */
export function sombraEn(altura: number, reposo: number, desdeElPrincipal: number, c: typeof SOMBRA = SOMBRA): EstadoDeLaSombra {
  const h = Math.max(0.05, altura)
  const razon = Math.max(0.05, reposo) / h
  const contraida = 1 - contraccionEn(desdeElPrincipal, c)
  return {
    escala: acotar(Math.pow(razon, c.exponenteDeEscala), c.escalaMin, c.escalaMax) * contraida,
    opacidad: acotar(Math.pow(razon, c.exponenteDeOpacidad), c.opacidadMin, c.opacidadMax),
  }
}
