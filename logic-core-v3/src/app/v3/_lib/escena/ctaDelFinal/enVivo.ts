/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL EN VIVO — se llega al CTA con una transformación desde «Seis razones» ([PULIDO 4] C1: la de
 * `cruce`, recuperada, y la metamorfosis de los seis valores en la frase: `transformacion.ts`). Esto es lo que el DOM
 * (`_componentes/ctaDelFinal/`) le dice a la escena (`EscenaDelCta.tsx`) y lo que la escena le devuelve. Sin `three`: lo
 * importa el DOM.
 */

/**
 * Un renglón de texto del DOM que la escena reemplaza: su elemento y lo que sube su pieza en la lectura (fracción del cuadro).
 */
export interface RenglonDelCta {
  readonly el: HTMLElement
  readonly subida: number
}

export const CTA_EN_VIVO = {
  /**
   * Cuánto avanzó la transformación (0 a 1), función pura del scroll: en el escenario, su ventana del pin; en la lista,
   * la caja del CTA entrando en la pantalla. Con movimiento reducido, 1.
   */
  progreso: 0,
  /** De dónde sale el cruce: los renglones de «Seis razones» (en el escenario, los de la frase de volumen; en la lista, su copia). */
  origen: (): readonly RenglonDelCta[] => [],
  /**
   * [PULIDO 4] C1 · los seis valores que se transforman en la frase: en el escenario, la caja de cada valor (la escena mide
   * sus letras y su ícono y los sigue en cada cuadro); en la lista, la copia de su título en el bloque clavado.
   */
  valores: [null, null, null, null, null, null] as (HTMLElement | null)[],
  /** [PULIDO 3B] B1 · los renglones de la frase del CTA en el DOM (sus dos mitades y el destacado): ahí se arma la frase. */
  frase: [null, null, null] as (HTMLElement | null)[],
  /** El texto del CTA en el DOM (en la fuente del registro 1 del hero): ahí termina el cruce. */
  destino: null as HTMLElement | null,
  /** La caja que el DOM mide en cada cuadro: la del escenario (pegajosa) o la de la lista (va con la página). */
  donde: 'escenario' as 'escenario' | 'lista',
  /** En la lista, cuánto se ve el origen antes de transformarse (`entradaEnLaLista`); en el escenario, 1. */
  entrada: 1,
  /** El puntero sobre el CTA (sólo con mouse: con el dedo no hay hover). */
  hover: false,
}

/** Los títulos de volumen que la transformación reemplaza desde que arranca: la frase. */
export const FRASE_DE_VOLUMEN = ['frase-izquierda', 'frase-derecha'] as const

/** La escena armó y compiló las letras del CTA: recién ahí el DOM esconde su texto (sin WebGL, se sigue leyendo el del DOM). */
let listo = false
const oyentes = new Set<() => void>()
export function marcarElCtaListo(v: boolean): void {
  if (listo === v) return
  listo = v
  for (const f of oyentes) f()
}
export const ctaListo = (): boolean => listo
export function suscribirAlCta(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

/** El DOM cambió sus lugares (montó la rama del escenario o la de la lista, o cambió el tamaño): la escena se vuelve a armar. */
let versionDelLugar = 0
const oyentesDelLugar = new Set<() => void>()
export function avisarDelLugar(): void {
  versionDelLugar += 1
  for (const f of oyentesDelLugar) f()
}
export const versionDelLugarDelCta = (): number => versionDelLugar
export function suscribirAlLugarDelCta(f: () => void): () => void {
  oyentesDelLugar.add(f)
  return () => {
    oyentesDelLugar.delete(f)
  }
}

/**
 * [PULIDO 4] C1 · 5 · EL CTA NO SE VE EN UN VIAJE: durante un viaje del menú el recorrido pasa por la sección en un segundo
 * (del pie a Inicio, por ejemplo) y el CTA aparecía y desaparecía. Mientras dura un viaje, nada del CTA se dibuja (ni la
 * escena ni el DOM): ningún viaje termina adentro de la transformación (los del menú llegan al arranque de las secciones).
 */
export const ctaVisibleEnElViaje = (viajando: boolean): boolean => !viajando
