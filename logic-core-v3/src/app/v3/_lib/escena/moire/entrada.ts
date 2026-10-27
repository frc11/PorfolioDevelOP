/**
 * [C2-31m] LA ENTRADA DEL MOIRÉ — puro: de dónde sale la posición que corre la rendija. Por defecto, el mouse (el puntero de la
 * órbita, `punteroDeLaOrbita`); además, una posición de AFUERA con el mismo rango, pensada para la inclinación del teléfono.
 *
 * **El rango es el del mouse** (el puntero de r3f, `INCLINACION_DEL_TELEFONO` de `giroscopio.ts`): `x` de −1 (borde izquierdo) a 1
 * (borde derecho) e `y` de −1 (abajo) a 1 (arriba); 0 es el centro. Lo de fuera de rango se acota y lo que no es un número vale 0.
 * La de afuera pasa por lo MISMO que el mouse: el amortiguador (`perseguirAlPuntero`, `MOUSE_TAU`) y el tope (`corrimientoPorElMouse`),
 * así un teléfono inclinado hasta el borde corre la trama lo mismo que el mouse en el borde de la ventana.
 *
 * **Cómo la conecta la tarea 81** (todavía sin conectar): en cada lectura del sensor, `fijarLaEntradaDelMoire(INCLINACION_DEL_TELEFONO)`
 * (en `giroscopio.ts`, después de escribir la inclinación); al apagarlo, `fijarLaEntradaDelMoire(null)` y vuelve a mandar el mouse.
 * Con movimiento reducido el mouse no mueve la trama, pero una entrada de afuera sí (sólo existe si alguien prendió el movimiento a mano).
 */
export const RANGO_DE_LA_ENTRADA = { min: -1, max: 1 } as const

export interface PosicionDeLaEntrada {
  readonly x: number
  readonly y: number
}

const ENTRADA = { x: 0, y: 0, deAfuera: false }

const acotar = (v: number): number => (Number.isFinite(v) ? Math.min(RANGO_DE_LA_ENTRADA.max, Math.max(RANGO_DE_LA_ENTRADA.min, v)) : 0)

/** Fija la entrada de afuera (`x`, `y` en el rango del mouse) o, con `null`, la suelta: vuelve a mandar el mouse. */
export function fijarLaEntradaDelMoire(p: PosicionDeLaEntrada | null): void {
  if (p === null) {
    ENTRADA.deAfuera = false
    ENTRADA.x = 0
    ENTRADA.y = 0
    return
  }
  ENTRADA.x = acotar(p.x)
  ENTRADA.y = acotar(p.y)
  ENTRADA.deAfuera = true
}

/** ¿Hay una entrada de afuera fijada? */
export function hayEntradaDeAfuera(): boolean {
  return ENTRADA.deAfuera
}

/** La posición de este cuadro: la de afuera si hay una; si no, la del mouse (sin copiarla). */
export function laEntradaDelMoire(mouse: PosicionDeLaEntrada): PosicionDeLaEntrada {
  return ENTRADA.deAfuera ? ENTRADA : mouse
}
