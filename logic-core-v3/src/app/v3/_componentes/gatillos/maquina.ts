/**
 * [B4] LA MÁQUINA DE LOS GATILLOS — pura, COMÚN al Portfolio y a Servicios: una sección anclada con `cantidad` pasos, recorridos
 * DE A UNO, obligados y sin saltear. Es la máquina del Portfolio (B1.2c a F2) sin sus números: el Portfolio la usa con sus cuatro
 * tiras (`trabajos/portfolio/rueda.ts`), Servicios con sus cuatro estados (la entrada y los tres servicios).
 *
 *   · **El paso de cada píxel**, con histéresis: el de ahora se queda mientras el píxel no pase su borde por `HISTERESIS_PX`.
 *   · **Adónde lleva un gesto** desde el paso activo: al de al lado; después del último, la salida de abajo; antes del primero, la
 *     de arriba. Nunca dos pasos de un gesto.
 *   · **La entrada atrapa el gesto** (F2): el gesto que lleva la página adentro del tramo desde afuera aterriza en el primero del
 *     sentido (bajando, el 0; subiendo, el último), por lejos que vaya; lo que queda de su impulso se descarta.
 *
 * Todo en px del tramo: 0 es donde arranca el ancla (el tope de la pista en el tope del cuadro) y cada paso mide `pasoPx`.
 */

import { RUEDA, gestoDeLaRueda, gestoDisparado, type GestoDeLaRueda } from './rueda'

/** La regla de un tramo de gatillos: cuántos pasos y cuánto mide cada uno (px del documento). */
export interface ReglaDeGatillos {
  readonly cantidad: number
  readonly pasoPx: number
  /**
   * [C2-51] La salida de abajo SIN gatillo (Servicios: del último servicio al recomendador, ítem 14). En el último paso, un gesto
   * NUEVO hacia abajo es de la página (scroll normal, no un vuelo); y ese paso se aterriza al PIE de su tramo
   * (`aterrizajeDelPasoEnElTramo`), donde el escenario está por soltarse: bajar ya mueve la página. La entrada desde abajo sigue
   * atrapando (subiendo, el gesto que entra se planta en el último). Sin la bandera (el Portfolio, Demos), lo de siempre.
   */
  readonly salidaDeAbajoLibre?: boolean
}

/** [C2-51] Lo que queda el aterrizaje del último paso antes del pie de su tramo (px): adentro del paso, sin soltar el escenario. */
export const PIE_DEL_ULTIMO_PX = 2

/** [C2-51] Si este gesto, desde este paso, sale por abajo sin gatillo. */
export const salidaLibre = (paso: number, sentido: 1 | -1, r: ReglaDeGatillos): boolean => r.salidaDeAbajoLibre === true && sentido > 0 && paso === r.cantidad - 1

/** [C2-51] Adónde aterriza un paso (px del tramo): su centro; con la salida libre, el último al pie de su tramo. */
export function aterrizajeDelPasoEnElTramo(i: number, r: ReglaDeGatillos): number {
  if (r.salidaDeAbajoLibre === true && i === r.cantidad - 1) return Math.max((i + 0.5) * r.pasoPx, r.cantidad * r.pasoPx - PIE_DEL_ULTIMO_PX)
  return (i + 0.5) * r.pasoPx
}

/** −1 antes del ancla, 0…cantidad−1 los pasos, `cantidad` después. */
export const ANTES_DEL_ANCLA = -1

export type FaseDelGatillo = 'antes' | 'adentro' | 'despues'

export function faseDe(paso: number, cantidad: number): FaseDelGatillo {
  if (paso < 0) return 'antes'
  return paso >= cantidad ? 'despues' : 'adentro'
}

/** El paso crudo de un píxel del tramo. */
export function pasoEnElTramo(px: number, r: ReglaDeGatillos): number {
  if (px < 0) return ANTES_DEL_ANCLA
  if (!(r.pasoPx > 0)) return r.cantidad
  return Math.min(r.cantidad, Math.floor(px / r.pasoPx))
}

/** Los bordes de un paso, en px del tramo. */
export function bordesDelPasoEnElTramo(i: number, r: ReglaDeGatillos): { readonly desde: number; readonly hasta: number } {
  if (i < 0) return { desde: Number.NEGATIVE_INFINITY, hasta: 0 }
  if (i >= r.cantidad) return { desde: r.cantidad * r.pasoPx, hasta: Number.POSITIVE_INFINITY }
  return { desde: i * r.pasoPx, hasta: (i + 1) * r.pasoPx }
}

/** La histéresis de los gatillos (la del Portfolio, `pasos.ts`): para dejar el paso de ahora hay que pasar su borde por esto. */
export const HISTERESIS_DEL_GATILLO_PX = 30

export function pasoConHisteresisEnElTramo(actual: number, px: number, r: ReglaDeGatillos): number {
  const crudo = pasoEnElTramo(px, r)
  if (crudo === actual) return actual
  const { desde, hasta } = bordesDelPasoEnElTramo(actual, r)
  if (px >= desde - HISTERESIS_DEL_GATILLO_PX && px < hasta + HISTERESIS_DEL_GATILLO_PX) return actual
  return crudo
}

/** El centro de un paso, en px del tramo: adonde vuela un gesto. */
export const centroDelPasoEnElTramo = (i: number, r: ReglaDeGatillos): number => (i + 0.5) * r.pasoPx

export type DestinoDelGesto = { readonly tipo: 'paso'; readonly indice: number } | { readonly tipo: 'despues' } | { readonly tipo: 'antes' }

/** Adónde lleva un gesto desde el paso activo (0…cantidad−1). */
export function destinoDelGesto(activo: number, sentido: 1 | -1, cantidad: number): DestinoDelGesto {
  const siguiente = activo + sentido
  if (siguiente >= cantidad) return { tipo: 'despues' }
  if (siguiente < 0) return { tipo: 'antes' }
  return { tipo: 'paso', indice: siguiente }
}

/**
 * [F2] La entrada: afuera del tramo, el gesto que lleva la página adentro (`hacia`: el destino del scroll con este gesto, px del
 * tramo) aterriza en el primero del sentido. Devuelve el paso de aterrizaje, o `null` si no entra.
 */
export function entradaDelGesto(fase: FaseDelGatillo, hacia: number, sentido: 1 | -1, r: ReglaDeGatillos): number | null {
  if (fase === 'antes' && sentido > 0 && hacia >= 0) return 0
  if (fase === 'despues' && sentido < 0 && hacia < r.cantidad * r.pasoPx) return r.cantidad - 1
  return null
}

/**
 * [C2-50] EL OBJETIVO DEL SCROLL NATIVO (abajo de 1025 no hay Lenis) — la rueda nativa anima su scroll: `scrollY` llega TARDE a lo que
 * ya pidieron las muescas anteriores. Con `scrollY + evento` la entrada no veía venir el gesto que la cruzaba, la página pasaba el
 * ancla con la inercia nativa y aterrizaba en un servicio (el bug de 390: la rueda bajando salteaba la entrada). Como el `targetScroll`
 * de Lenis, se lleva la cuenta de lo pedido: mientras las muescas lleguen seguidas (`OBJETIVO_NATIVO_MS`), el destino es lo pedido
 * hasta acá más el evento; si no, el scroll de ahora.
 */
export interface ObjetivoNativo {
  readonly y: number
  /** Hasta cuándo vale (ms): después, manda el scroll. */
  readonly hasta: number
}

export const OBJETIVO_NATIVO_MS = 450
export const SIN_OBJETIVO: ObjetivoNativo = { y: 0, hasta: Number.NEGATIVE_INFINITY }

/** Desde dónde suma un evento: lo pedido (si es reciente) o el scroll. */
export const baseDelObjetivo = (o: ObjetivoNativo, scrollY: number, ahora: number): number => (ahora < o.hasta ? o.y : scrollY)

/** Lo pedido después de un evento que la página deja pasar (acotado al documento). */
export function seguirElObjetivo(o: ObjetivoNativo, scrollY: number, px: number, ahora: number, maximo: number): ObjetivoNativo {
  return { y: Math.min(maximo, Math.max(0, baseDelObjetivo(o, scrollY, ahora) + px)), hasta: ahora + OBJETIVO_NATIVO_MS }
}

/** Lo que se MUESTRA en cada paso: antes del ancla, el primero; después, el último (el escenario se va con él). */
export const vistaDelPasoEnElTramo = (paso: number, cantidad: number): number => Math.min(cantidad - 1, Math.max(0, paso))

/**
 * Lo que hace la máquina con un evento de la rueda (el modelo entero, puro: el gancho `useGatillos` lo cumple y el invariante lo
 * corre con un reloj de mentira):
 *
 *   `pagina`   afuera del tramo y sin entrar: la página es de la página (el gesto queda dado: si el tramo llega en el medio, ese
 *              gesto ya no da un paso).
 *   `entrada`  afuera, y este evento lleva la página adentro: se traga y vuela al primero del sentido (F2).
 *   `tragar`   adentro con un salto en vuelo o la transición corriendo (F1): se traga y el gesto queda dado (la ráfaga se descarta).
 *   `paso`     adentro y libre: el gesto de la rueda (`gestoDeLaRueda`) dice si este evento completa un paso, y hacia dónde.
 */
export type DecisionDeLaRueda =
  | { readonly tipo: 'pagina' }
  | { readonly tipo: 'entrada'; readonly paso: number }
  | { readonly tipo: 'tragar' }
  | { readonly tipo: 'paso'; readonly sentido: 1 | -1 | null }

export interface MomentoDeLaRueda {
  readonly paso: number
  readonly enVuelo: boolean
  readonly ocupado: boolean
  readonly gesto: GestoDeLaRueda
  /** El evento (px, con su `deltaMode` ya resuelto) y cuándo (ms). */
  readonly px: number
  readonly ahora: number
  /** Adónde lleva la página este evento (px del tramo): el destino de Lenis más el evento, o el scroll más el evento. */
  readonly hacia: number
}

export function decidirLaRueda(m: MomentoDeLaRueda, r: ReglaDeGatillos): { readonly decision: DecisionDeLaRueda; readonly gesto: GestoDeLaRueda } {
  const fase = faseDe(m.paso, r.cantidad)
  if (!m.enVuelo && fase !== 'adentro') {
    const paso = entradaDelGesto(fase, m.hacia, m.px > 0 ? 1 : -1, r)
    return { decision: paso === null ? { tipo: 'pagina' } : { tipo: 'entrada', paso }, gesto: gestoDisparado(m.ahora) }
  }
  if (m.enVuelo || m.ocupado) return { decision: { tipo: 'tragar' }, gesto: gestoDisparado(m.ahora) }
  // [C2-51] La salida de abajo libre: un gesto NUEVO hacia abajo desde el último (o uno de la página que sigue) es de la página. Lo que
  // queda del gesto que trajo hasta el último (ya dio su paso) se sigue tragando: la inercia no se lleva el servicio recién llegado.
  if (salidaLibre(m.paso, m.px > 0 ? 1 : -1, r) && (m.ahora - m.gesto.ultimo > RUEDA.quietoMs || !m.gesto.disparado))
    return { decision: { tipo: 'pagina' }, gesto: { acumulado: 0, ultimo: m.ahora, disparado: false } }
  const g = gestoDeLaRueda(m.gesto, m.px, m.ahora)
  return { decision: { tipo: 'paso', sentido: g.sentido }, gesto: g.gesto }
}

/**
 * Una tecla que scrollea (no Inicio ni Fin): adentro, un paso por tecla apretada (su repetición no); afuera, la de la página.
 * [C2-51] `libre`: la tecla baja desde el último con la salida libre (`salidaLibre`): es de la página, salvo con la transición corriendo.
 */
export function decidirLaTecla(paso: number, cantidad: number, enVuelo: boolean, ocupado: boolean, repetida: boolean, libre = false): 'pagina' | 'tragar' | 'paso' {
  if (!enVuelo && faseDe(paso, cantidad) !== 'adentro') return 'pagina'
  if (libre && !enVuelo && !ocupado) return 'pagina'
  return repetida || enVuelo || ocupado ? 'tragar' : 'paso'
}
