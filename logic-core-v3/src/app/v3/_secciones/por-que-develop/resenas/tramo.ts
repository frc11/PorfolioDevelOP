/**
 * [NOCTURNO B2] EL TRAMO DE LAS RESEÑAS EN EL PIN DE «POR QUÉ develOP» — puro (lo recorre `s83`).
 *
 * El tramo se INSERTA en el sostén de la pose B (la pantalla 2,5 del pin de siempre: los seis valores ya llegaron, el último termina en 2,5)
 * y dura `PANTALLAS_DE_LAS_RESENAS`. `secciones.ts` no se toca (REGLA DE ALTURAS):
 *   · el DOM: el escenario suma un espaciador (el pin crece) y todo lo que ya existía ve el pin DE SIEMPRE (`pinSinLasResenas`): antes del
 *     tramo igual, adentro quieto en la inserción, después corrido las pantallas del tramo;
 *   · la escena: el tramo se anota con `anotarTramo` y la sala lo ve como `LARGO_SIN_ESTIRAR_PX` de la regla (la cámara queda en el sostén
 *     de B mientras se leen las reseñas).
 * Adentro, el avance `r` (0 a 1) reparte los momentos: el título se da vuelta, los valores se van, el aro entra, se lee, y la última media
 * pantalla es la del CTA (B3). Sin B3, en esa media pantalla todo se rebobina y el CTA de siempre sigue como estaba.
 */

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../../_lib/navegacion'
import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../../../_lib/secciones'
import type { TramoEstirado } from '../../../_lib/escena/tramoEstirado'

export const PANTALLAS_DE_LAS_RESENAS = 4
/** Los dos títulos de volumen de las reseñas: las mitades que reemplazan a las de la frase (a cada lado del logo). */
export const TITULOS_DE_LAS_RESENAS = ['resenas-izquierda', 'resenas-derecha'] as const
export const INSERCION_DE_LAS_RESENAS = 2.5

const PIN_DE_SIEMPRE = PANTALLAS_DE_POR_QUE_DEVELOP - 1
const PIN_CON_LAS_RESENAS = PIN_DE_SIEMPRE + PANTALLAS_DE_LAS_RESENAS

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const tramo = (x: number, desde: number, dura: number): number => acotar01((x - desde) / dura)
const suave = (u: number): number => u * u * (3 - 2 * u)

/** El alto que el escenario suma después de su caja clavada (svh): con él la sección mide lo de siempre más el tramo. */
export const ALTO_DEL_ESPACIADOR_SVH = (PANTALLAS_DE_POR_QUE_DEVELOP - 1 + PANTALLAS_DE_LAS_RESENAS) * 100

/** El pin de siempre (0 a 1, en sus pantallas) desde el pin del bloque con el tramo adentro. */
export function pinSinLasResenas(pin: number): number {
  const s = acotar01(pin) * PIN_CON_LAS_RESENAS
  const i = INSERCION_DE_LAS_RESENAS
  const viejo = s <= i ? s : s <= i + PANTALLAS_DE_LAS_RESENAS ? i : s - PANTALLAS_DE_LAS_RESENAS
  return viejo / PIN_DE_SIEMPRE
}

/** El avance del tramo (0 a 1) con el pin del bloque. */
export function avanceDeLasResenas(pin: number): number {
  return tramo(acotar01(pin) * PIN_CON_LAS_RESENAS, INSERCION_DE_LAS_RESENAS, PANTALLAS_DE_LAS_RESENAS)
}

/** Los momentos del tramo (fracciones del avance): ~0,5 pantalla el título, ~0,5 los valores, ~1 la entrada, ~1,5 para leer, ~0,5 el CTA. */
export const MOMENTOS_DE_LAS_RESENAS = {
  giro: [0, 0.125],
  disolucion: [0.125, 0.25],
  entrada: [0.25, 0.5],
  lectura: [0.5, 0.875],
  cta: [0.875, 1],
} as const

/** Sin B3, el rebobinado en la media pantalla del CTA: el aro sale, los valores vuelven y el título se da vuelta al revés (en ese orden). */
export const REBOBINADO = { entrada: [0.875, 0.055], disolucion: [0.93, 0.035], giro: [0.965, 0.035] } as const

/** `?resenas=gatillo`: el título, los valores y la entrada son una animación por tiempo (s), con estos tramos de ella. */
export const GATILLO = { duracionS: 2.8, giro: [0, 0.3], disolucion: [0.25, 0.3], entrada: [0.5, 0.5], entra: 0.02, sale: 0.005 } as const

export interface EstadoDeLasResenas {
  /** El giro del título (0, «Seis razones»; 1, «Lo que dicen nuestros clientes»). */
  readonly giro: number
  /** Cuánto se fueron los valores (0, en su lugar; 1, idos). */
  readonly disolucion: number
  /** La entrada del aro (0, afuera; 1, armado). */
  readonly entrada: number
}

/**
 * El estado con el avance `r` y, con el gatillo, su animación por tiempo `disparo` (0 a 1; `null`, atado al scroll). `conCta`: con B3 la
 * media pantalla del CTA no rebobina (la toma el CTA).
 */
export function estadoDelAvance(r: number, disparo: number | null, conCta = false): EstadoDeLasResenas {
  const M = MOMENTOS_DE_LAS_RESENAS
  const base =
    disparo === null
      ? { giro: tramo(r, M.giro[0], M.giro[1] - M.giro[0]), disolucion: tramo(r, M.disolucion[0], M.disolucion[1] - M.disolucion[0]), entrada: tramo(r, M.entrada[0], M.entrada[1] - M.entrada[0]) }
      : { giro: tramo(disparo, GATILLO.giro[0], GATILLO.giro[1]), disolucion: tramo(disparo, GATILLO.disolucion[0], GATILLO.disolucion[1]), entrada: tramo(disparo, GATILLO.entrada[0], GATILLO.entrada[1]) }
  if (conCta) return base
  const R = REBOBINADO
  return {
    giro: base.giro * (1 - tramo(r, R.giro[0], R.giro[1])),
    disolucion: base.disolucion * (1 - tramo(r, R.disolucion[0], R.disolucion[1])),
    entrada: base.entrada * (1 - tramo(r, R.entrada[0], R.entrada[1])),
  }
}

/** El gatillo: adónde va la animación con el avance `r` (1, entró al tramo; 0, salió por arriba), con un margen para no titilar. */
export function objetivoDelGatillo(r: number, previo: 0 | 1): 0 | 1 {
  if (previo === 0) return r > GATILLO.entra ? 1 : 0
  return r < GATILLO.sale ? 0 : 1
}

/** El ángulo del giro del título (rad, con la curva de la casa): la frase va de 0 a π; el título de las reseñas, de −π a 0. */
export function angulosDelGiro(giro: number): { readonly frase: number; readonly resenas: number } {
  const a = Math.PI * suave(acotar01(giro))
  return { frase: a, resenas: a - Math.PI }
}

/**
 * EL TRAMO PARA LA ESCENA (REGLA DE ALTURAS, `_lib/escena/tramoEstirado.ts`): arranca en la inserción —en px de la regla desde que asoma
 * el panel, una pantalla antes del pin, más lo que el pin está corrido del tope del panel (`corrido`, px de la regla)— y la escena ve sus
 * cuatro pantallas (más esos px) como `LARGO_SIN_ESTIRAR_PX`. La `k` es igual en todo ancho de escritorio (el tramo es de pantallas enteras).
 */
export const LARGO_SIN_ESTIRAR_PX = 9
// Estirado mide lo que medía (los 9 px) más el tramo: después del tramo la escena ve el scroll de siempre, sin deriva.
export const K_DE_LAS_RESENAS = (PANTALLAS_DE_LAS_RESENAS * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA + LARGO_SIN_ESTIRAR_PX) / LARGO_SIN_ESTIRAR_PX

export function tramoDeLasResenas(panel: Element, corrido = 0): TramoEstirado {
  const R = ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
  return { panel, k: K_DE_LAS_RESENAS, arranque: R + corrido + INSERCION_DE_LAS_RESENAS * R, largo: LARGO_SIN_ESTIRAR_PX }
}

/** La bandera de la entrada: `?resenas=scroll` (por defecto: todo atado al scroll) o `?resenas=gatillo`. */
export type VarianteDeLasResenas = 'scroll' | 'gatillo'
export const varianteDeLaBandera = (valor: string | null): VarianteDeLasResenas => (valor === 'gatillo' ? 'gatillo' : 'scroll')
/** `?resenas-arrastre=si`: arrastrar con el mouse gira el aro con inercia. */
export const arrastreDeLaBandera = (valor: string | null): boolean => valor === 'si'
