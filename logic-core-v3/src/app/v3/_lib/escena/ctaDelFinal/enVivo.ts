/**
 * [PULIDO 2] 5 · EL CTA DEL FINAL EN VIVO — se llega al CTA con una transformación desde «Seis razones» ([PULIDO 3B] B1: una
 * sola, la del producto: `transformacion.ts`). Esto es lo que el DOM (`_componentes/ctaDelFinal/`) le dice a la escena
 * (`EscenaDelCta.tsx`) y lo que la escena le devuelve. Sin `three`: lo importa el DOM.
 */

/**
 * Un renglón de texto del DOM que la escena reemplaza: su elemento y lo que sube su pieza en la lectura (fracción del cuadro).
 * [PULIDO 3B] B1 · con `texto`, el elemento sólo da el lugar (el texto no está en el DOM ahí: el origen de la lista, sin copia).
 */
export interface RenglonDelCta {
  readonly el: HTMLElement
  readonly subida: number
  readonly texto?: string
}

export const CTA_EN_VIVO = {
  /**
   * Cuánto avanzó la transformación (0 a 1), función pura del scroll: en el escenario, su ventana del pin; en la lista,
   * la caja del CTA entrando en la pantalla. Con movimiento reducido, 1.
   */
  progreso: 0,
  /** De dónde sale: los renglones de «Seis razones» (en el escenario, los de la frase de volumen; en la lista, su copia). */
  origen: (): readonly RenglonDelCta[] => [],
  /** [PULIDO 3B] B1 · los renglones de la frase del CTA en el DOM (sus dos mitades y el destacado): ahí se arma la frase. */
  frase: [null, null, null] as (HTMLElement | null)[],
  /** El texto del CTA en el DOM (en la fuente del registro 1 del hero): ahí termina la transformación. */
  destino: null as HTMLElement | null,
  /** La caja que el DOM mide en cada cuadro: la del escenario (pegajosa) o la de la lista (va con la página). */
  donde: 'escenario' as 'escenario' | 'lista',
  /** En la lista, cuánto se ve la frase antes de transformarse (`entradaEnLaLista`); en el escenario, 1. */
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
