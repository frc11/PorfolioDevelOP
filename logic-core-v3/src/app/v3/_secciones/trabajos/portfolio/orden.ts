/**
 * [B1.2c] EL ORDEN DE LA ENTRADA Y DE LA SALIDA — puro (plan §13, punto 2; [B1.2d] §14, A10).
 *
 * [B1.2d] Cuatro piezas se prenden y se apagan, cada una cuando le toca: la CÁMARA (la pose del Portfolio y el oscurecido), el
 * ENCABEZADO («Portfolio» y su bajada), la BARRA (la píldora de la navegación se corre a la columna, A1) y el PANEL. En B1.2c el panel
 * entraba con la cámara y el título llegaba recién cuando el panel terminaba: se leían juntos. Ahora:
 *
 *   entrando   la cámara → el título (cuando la cámara llegó: así queda de frente en el plano del logo) → el primer tiempo de la barra
 *              (el borde izquierdo se estira) → el panel, cuando el título va por el 80 % de su llegada (`ORDEN.solape`: el 20 % que se
 *              pisan), A LA PAR del segundo tiempo de la barra: la píldora se contrae y le deja el lugar ([B1.2d] A2.2)
 *   saliendo   al revés: el panel → [F3] la barra, cuando el panel terminó de salir (la expansión que la devuelve y la contracción
 *              final: en A2.2 iba a la par de la salida del panel y se le metía encima un instante) → la caída del título, que arranca
 *              cuando al panel le falta ese mismo 20 % → la cámara, con el título caído entero
 *
 * Primero lo que se apaga y después lo que se prende. Cada pieza recuerda CUÁNDO cambió (`Cambios`), y cada cambio espera lo que le
 * toca desde ahí: si lo pedido se da vuelta a mitad de camino se vuelve a decidir con la misma regla, y el panel nunca entra antes
 * del 80 % del título aunque el título haya llegado recién. Con movimiento reducido, todo de una.
 *
 * En el teléfono (las historias, B1.3) el encabezado se pide en la aproximación y no con el panel: la misma regla deja que el título
 * caiga antes de que entre la historia y que vuelva después de que se fue.
 */

import { CORRIMIENTO } from '../../../_chrome/barra/corrimiento'
import { PERSECUCION_DEL_PESO_S } from '../../../_lib/escena/portfolioEnLaEscena'

export interface Orden {
  readonly camara: boolean
  readonly encabezado: boolean
  readonly barra: boolean
  readonly panel: boolean
}

export type PiezaDelOrden = keyof Orden

export const AFUERA: Orden = { camara: false, encabezado: false, barra: false, panel: false }
export const ADENTRO: Orden = { camara: true, encabezado: true, barra: true, panel: true }

/**
 * Lo que tarda en llegar la cámara, lo que tarda el panel (el de su clase: 700 ms), lo que dura el corrimiento de la barra (sus dos
 * tiempos, `_chrome/barra/corrimiento.ts`) y la fracción del título que se pisa con el panel.
 */
export const ORDEN = { camaraS: PERSECUCION_DEL_PESO_S, panelS: 0.7, barraS: (2 * CORRIMIENTO.tiempoMs) / 1000, solape: 0.2, barraPrimerTiempoS: CORRIMIENTO.tiempoMs / 1000 } as const

/** Lo que dura la salida que se ve (s): el panel se va y, desde que al panel le falta el solape, el título cae entero. */
export const duracionDeLaSalida = (tituloS: number): number => ORDEN.panelS + (1 - ORDEN.solape) * tituloS

/** Cuándo cambió cada pieza (s); `-Infinity`: hace mucho. */
export type Cambios = Readonly<Record<PiezaDelOrden, number>>
export const NUNCA: Cambios = { camara: -Infinity, encabezado: -Infinity, barra: -Infinity, panel: -Infinity }

export interface CambioDelOrden {
  readonly pieza: PiezaDelOrden
  readonly valor: boolean
  /** Cuándo puede ocurrir (s, en el mismo reloj que `Cambios`). */
  readonly en: number
}

const APAGADO: readonly PiezaDelOrden[] = ['panel', 'encabezado', 'barra', 'camara']
const PRENDIDO: readonly PiezaDelOrden[] = ['camara', 'encabezado', 'barra', 'panel']

/**
 * Lo que espera una pieza para apagarse (o `null` si todavía no puede: otra se tiene que apagar antes). `pildoraConElPanel`: el defecto
 * de F3 (la barra a la par de la salida del panel, como en A2.2), sólo para el control positivo del arnés.
 */
function apagado(p: PiezaDelOrden, actual: Orden, c: Cambios, tituloS: number, pildoraConElPanel: boolean): number | null {
  const panelAfuera = c.panel + ORDEN.panelS
  switch (p) {
    case 'panel':
      return -Infinity
    case 'encabezado':
      return actual.panel ? null : c.panel + ORDEN.panelS - ORDEN.solape * tituloS
    case 'barra':
      // [F3] Con el panel ya afuera: la píldora vuelve sin cruzarse nunca con él.
      return actual.panel ? null : c.panel + (pildoraConElPanel ? 0 : ORDEN.panelS)
    case 'camara':
      return actual.panel || actual.encabezado ? null : Math.max(panelAfuera, c.encabezado + tituloS)
  }
}

/**
 * Cuándo termina de VERSE lo que se apagó (s): la caída del título, la salida del panel y la vuelta de la barra. Lo que se prende
 * espera eso («cada paso espera a que termine el anterior»: en el teléfono el título cae entero y recién después entra la historia).
 */
function finDeLoApagado(actual: Orden, c: Cambios, tituloS: number): number {
  return Math.max(
    actual.encabezado ? -Infinity : c.encabezado + tituloS,
    actual.panel ? -Infinity : c.panel + ORDEN.panelS,
    actual.barra ? -Infinity : c.barra + ORDEN.barraS,
  )
}

/**
 * Lo que espera una pieza para prenderse (o `null` si todavía no puede), según lo pedido. La cámara la pide el título (para quedar de
 * frente en el plano del logo), no el panel: sin título (las historias) el panel no la espera.
 */
function prendido(p: PiezaDelOrden, actual: Orden, pedido: Orden, c: Cambios, tituloS: number): number | null {
  const base = finDeLoApagado(actual, c, tituloS)
  const camaraLista = pedido.camara ? (actual.camara ? c.camara + ORDEN.camaraS : null) : -Infinity
  const tituloAlOchenta = pedido.encabezado ? (actual.encabezado ? c.encabezado + (1 - ORDEN.solape) * tituloS : null) : -Infinity
  switch (p) {
    case 'camara':
      return base
    case 'encabezado':
      return camaraLista === null ? null : Math.max(base, camaraLista)
    case 'barra':
      // [A2.2] Sólo el primer tiempo va antes del panel: el segundo es a la par de su entrada.
      return tituloAlOchenta === null ? null : Math.max(base, tituloAlOchenta - ORDEN.barraPrimerTiempoS)
    case 'panel': {
      const barraLista = pedido.barra ? (actual.barra ? c.barra + ORDEN.barraPrimerTiempoS : null) : -Infinity
      if (tituloAlOchenta === null || barraLista === null) return null
      return Math.max(base, tituloAlOchenta, barraLista)
    }
  }
}

/**
 * El cambio siguiente hacia lo pedido y cuándo puede ocurrir (`null`: ya está). `tituloS`: lo que tarda el título en llegar (y en
 * caer: con el 3D, su mínimo). Las apagadas van antes que las prendidas; entre las que pueden, la que puede antes.
 */
export function siguienteCambio(actual: Orden, cambios: Cambios, pedido: Orden, ahora: number, tituloS: number, reducido: boolean, pildoraConElPanel = false): CambioDelOrden | null {
  const apagar = APAGADO.filter((p) => actual[p] && !pedido[p])
  const prender = PRENDIDO.filter((p) => !actual[p] && pedido[p])
  if (apagar.length === 0 && prender.length === 0) return null
  if (reducido) {
    const p = apagar[0] ?? prender[0]
    return { pieza: p, valor: pedido[p], en: ahora }
  }
  const candidatos = apagar.length > 0
    ? apagar.map((p) => ({ pieza: p, valor: false, en: apagado(p, actual, cambios, tituloS, pildoraConElPanel) }))
    : prender.map((p) => ({ pieza: p, valor: true, en: prendido(p, actual, pedido, cambios, tituloS) }))
  let mejor: CambioDelOrden | null = null
  for (const k of candidatos) {
    if (k.en === null) continue
    const en = Math.max(ahora, k.en)
    if (mejor === null || en < mejor.en) mejor = { pieza: k.pieza, valor: k.valor, en }
  }
  return mejor
}

/** Todos los cambios de una vez, con un reloj (para los tests): la secuencia de estados y el segundo de cada uno, desde `desde`. */
export function recorridoDelOrden(
  desde: Orden,
  pedido: Orden,
  tituloS: number,
  reducido = false,
  cambiosDeAntes: Cambios = NUNCA,
  pildoraConElPanel = false,
): readonly { readonly estado: Orden; readonly enS: number }[] {
  const salida: { readonly estado: Orden; readonly enS: number }[] = []
  let actual = desde
  let cambios = cambiosDeAntes
  let reloj = 0
  for (let c = siguienteCambio(actual, cambios, pedido, reloj, tituloS, reducido, pildoraConElPanel); c !== null; c = siguienteCambio(actual, cambios, pedido, reloj, tituloS, reducido, pildoraConElPanel)) {
    reloj = c.en
    actual = { ...actual, [c.pieza]: c.valor }
    cambios = { ...cambios, [c.pieza]: reloj }
    salida.push({ estado: actual, enS: reloj })
  }
  return salida
}
