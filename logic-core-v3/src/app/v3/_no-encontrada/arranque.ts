/**
 * [M2] CUÁNDO ARRANCA EL LOGO QUE NO ENCAJA DE LA 404 — el encastre del error del formulario (`EncajeDelLogo`) dura un segundo y medio: si corre
 * antes de que se pueda ver, se pierde. El prototipo (`l7/lab:…/no-encaja`) lo tiraba a los 700 ms del montaje, con el preloader de la primera
 * entrada todavía tapando la página o con la pestaña en el fondo: se veía sólo el final, la pieza ya torcida afuera. Por eso «la animación no se
 * ejecuta como se debe». Ahora espera las tres cosas y, recién con las tres, el respiro de `ESPERA_MS` (el que en el formulario ocupa el volteo
 * de la tarjeta antes de que caiga la pieza).
 */
export const ARRANQUE = {
  /** Con todo a la vista, cuánto espera la primera caída (ms): que el ojo llegue a la tarjeta. */
  esperaMs: 600,
  /** Un toque a la tarjeta la vuelve a tirar: la pieza vuelve arriba y cae después de esto (ms). */
  otraVezMs: 120,
  /** Cuánto de la tarjeta tiene que estar en el cuadro. */
  enVistaMinima: 0.6,
} as const

export interface CondicionesDelArranque {
  /** La entrada del sitio está abierta: el preloader ya se fue (`_lib/entrada.ts`). */
  readonly entrada: boolean
  /** La pestaña está a la vista. */
  readonly visible: boolean
  /** La tarjeta está en el cuadro (al menos `enVistaMinima`). */
  readonly enVista: boolean
}

export const puedeArrancar = (c: CondicionesDelArranque): boolean => c.entrada && c.visible && c.enVista

/** Lo que espera un intento antes de caer: el primero, el respiro; los que pide un toque, casi nada. */
export const esperaDelIntento = (intento: number): number => (intento === 0 ? ARRANQUE.esperaMs : ARRANQUE.otraVezMs)
