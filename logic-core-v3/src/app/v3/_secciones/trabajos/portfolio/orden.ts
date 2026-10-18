/**
 * [B1.2c] EL ORDEN DE LA ENTRADA Y DE LA SALIDA — puro (plan §13, punto 2).
 *
 * Dos cosas se prenden y se apagan: la ESCENA (el panel, la cámara del Portfolio y el oscurecido) y el ENCABEZADO («Portfolio» y su
 * bajada). En B1.2b iban juntas y la cámara volvía antes de que terminara la caída del título. Ahora van de a una, siempre en este
 * orden: primero lo que se apaga y después lo que se prende; entre lo que se apaga, el encabezado antes que la escena (el título cae
 * entero y recién después vuelven la cámara y el oscurecido, mientras el panel se retrae); entre lo que se prende, la escena antes
 * que el encabezado (primero llega la cámara y después aparece el título). Cada paso espera a que termine el anterior. Con movimiento
 * reducido, todo de una.
 *
 * En el teléfono (las historias, B1.3) el encabezado se pide en la aproximación y no con el panel: la misma regla deja que el título
 * caiga antes de que entre la historia y que vuelva después de que se fue.
 */

import { PERSECUCION_DEL_PESO_S } from '../../../_lib/escena/portfolioEnLaEscena'

export interface Orden {
  readonly escena: boolean
  readonly encabezado: boolean
}

export const AFUERA: Orden = { escena: false, encabezado: false }

/** Lo que tarda en llegar la cámara (y entrar el panel) y lo que tarda en irse el panel (el de su clase: 700 ms). */
export const ORDEN = { camaraS: PERSECUCION_DEL_PESO_S, panelS: 0.7 } as const

export interface PasoDelOrden {
  readonly estado: Orden
  /** Cuánto esperar antes del paso siguiente (s). */
  readonly esperaS: number
}

/** El paso siguiente hacia lo pedido (`null`: ya está). `caidaS`: lo que tarda en caer el título (con el 3D, su mínimo). */
export function siguientePaso(actual: Orden, pedido: Orden, caidaS: number, reducido: boolean): PasoDelOrden | null {
  if (actual.escena === pedido.escena && actual.encabezado === pedido.encabezado) return null
  if (reducido) return { estado: pedido, esperaS: 0 }
  if (actual.encabezado && !pedido.encabezado) return { estado: { ...actual, encabezado: false }, esperaS: caidaS }
  if (actual.escena && !pedido.escena) return { estado: { ...actual, escena: false }, esperaS: ORDEN.panelS }
  if (!actual.escena && pedido.escena) return { estado: { ...actual, escena: true }, esperaS: ORDEN.camaraS }
  return { estado: { ...actual, encabezado: true }, esperaS: 0 }
}

/** Todos los pasos de una vez (para los tests): la secuencia de estados y el reloj de cada uno. */
export function recorridoDelOrden(desde: Orden, pedido: Orden, caidaS: number, reducido = false): readonly { readonly estado: Orden; readonly enS: number }[] {
  const salida: { readonly estado: Orden; readonly enS: number }[] = []
  let actual = desde
  let reloj = 0
  for (let p = siguientePaso(actual, pedido, caidaS, reducido); p !== null; p = siguientePaso(actual, pedido, caidaS, reducido)) {
    salida.push({ estado: p.estado, enS: reloj })
    actual = p.estado
    reloj += p.esperaS
  }
  return salida
}
