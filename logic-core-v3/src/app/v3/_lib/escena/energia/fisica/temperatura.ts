/**
 * [PULIDO 16] N2 · LA TEMPERATURA DEL GAS — el puente entre la física y lo que hace el usuario (`docs/rediseno/PLASMA.md`). Un
 * número de 0 (calma) a 1 (lo más caliente): SUBE con la velocidad del scroll, con las ondas del logo (los anillos del pulso y el
 * principal), con el clic y con la descarga del puntero; BAJA sola hacia la calma. Caliente: más agitación, más arcos, más
 * ionización y los enlaces se rompen; en calma se forman moléculas, los iones recapturan y todo se ordena.
 * EL AUTOLÍMITE: lo crudo se satura con una tangente hiperbólica (nunca pasa del techo), calentar cuesta más cuanto más caliente
 * está, y se enfría más rápido cuanto más caliente está: la escena no se satura nunca. Pura (la prueba la corre en Node).
 */
export const TEMPERATURA = {
  /** La calma (a dónde vuelve) y el techo (el autolímite: nunca lo pasa). */
  base: 0.14,
  techo: 1,
  /** En cuánto vuelve a la calma (s; más rápido cuanto más caliente: `baja / (1 + valor)`). */
  baja: 2.6,
  /** El scroll: cuánto calienta por segundo cada pantalla por segundo de scroll, y desde cuántas pantallas por segundo ya no suma. */
  scroll: { porPantalla: 0.55, tope: 4 },
  /** Lo que calienta cada cosa, de una vez: un anillo del pulso del logo (por su amplitud), el principal, el clic, la descarga, un arco. */
  anillo: 0.06,
  principal: 0.12,
  pulso: 0.35,
  descarga: 0.45,
  arco: 0.012,
} as const

export interface Temperatura {
  /** Lo acumulado, sin saturar, y lo que vale (saturado: 0 a `techo`). */
  crudo: number
  valor: number
}

export function crearTemperatura(): Temperatura {
  return { crudo: TEMPERATURA.base, valor: TEMPERATURA.base }
}

const saturar = (crudo: number): number => TEMPERATURA.techo * Math.tanh(Math.max(0, crudo) / TEMPERATURA.techo)

/** Calienta de una vez: cuesta más cuanto más caliente está (lo que falta hasta el techo). */
export function calentar(t: Temperatura, cuanto: number): void {
  t.crudo += cuanto * Math.max(0, 1 - t.valor / TEMPERATURA.techo)
  t.valor = saturar(t.crudo)
}

/** Un paso: el scroll calienta (pantallas por segundo), y lo acumulado vuelve a la calma. */
export function pasoDeLaTemperatura(t: Temperatura, dt: number, pantallasPorSegundo: number): void {
  const s = TEMPERATURA.scroll
  calentar(t, s.porPantalla * Math.min(Math.abs(pantallasPorSegundo), s.tope) * dt)
  const tau = TEMPERATURA.baja / (1 + t.valor)
  t.crudo = TEMPERATURA.base + (t.crudo - TEMPERATURA.base) * Math.exp(-dt / tau)
  t.valor = saturar(t.crudo)
}

/** Fuerza la temperatura (el banco: la escena caliente para medir y capturar). */
export function ponerTemperatura(t: Temperatura, valor: number): void {
  const v = Math.min(TEMPERATURA.techo * 0.999, Math.max(0, valor))
  t.crudo = TEMPERATURA.techo * Math.atanh(v / TEMPERATURA.techo)
  t.valor = v
}
