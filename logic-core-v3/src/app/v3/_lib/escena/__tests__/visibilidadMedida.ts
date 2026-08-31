/**
 * LO QUE S9 · VISIBILIDAD MIDE — el marcado del panel, la banda suspendida y
 * los cuadros, separados de las afirmaciones.
 *
 * Está en su propio módulo por la regla de las 300 líneas del repo, y por la
 * misma razón que `tablas.ts` está separado de `s8-escena.invariant.ts`:
 * **medir e imprimir no es afirmar nada**, y mezclar las dos cosas en un archivo
 * hace que cueste ver cuál es cuál. Lo que este módulo devuelve son números y
 * cadenas; quién los afirma es el invariante.
 *
 * ⚠ Las dos mediciones de acá **corren la función que se despacha**, no un
 * modelo paralelo de ella: la banda suspendida se muestrea llamando a
 * `escenaEnCuadro` píxel por píxel y las clases del panel salen de renderizar
 * `Panel` de verdad. Un modelo paralelo mediría el modelo.
 */

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Panel } from '../../../_componentes/Panel'
import type { Seccion } from '../../secciones'
import { ANCLAJE } from '../anclaje'
import { CUADROS_DE_REANUDACION, MARGEN_DE_REANUDACION, escenaEnCuadro } from '../visibilidad'

/**
 * EL DOCUMENTO SINTÉTICO — catorce pantallas de 900 px.
 *
 * Con estas medidas `pantallaDeScroll` vale exactamente `scrollY / 900`, así que
 * una posición expresada en pantallas se convierte multiplicando por `VENTANA` y
 * el muestreo avanza de a UN píxel. El 900 no es arbitrario: es el alto de
 * ventana con el que el proyecto mide el ritmo a escritorio (1440 × 900, el
 * mismo con el que `s8-cierre` midió el alto del Cierre).
 */
export const VENTANA = 900
export const DOCUMENTO = ANCLAJE.pantallasDelDocumento * VENTANA

/** La escena en cuadro en una posición dada **en pantallas** del recorrido. */
export function enPantalla(p: number): boolean {
  return escenaEnCuadro(p * VENTANA, DOCUMENTO, VENTANA)
}

/** El marcado real que emite el panel de una sección, y sus clases. */
export function marcadoDelPanel(seccion: Seccion): { readonly html: string; readonly clases: string } {
  const html = renderToStaticMarkup(createElement(Panel, { seccion }))
  return { html, clases: /class="([^"]*)"/.exec(html)?.[1] ?? '' }
}

export type Banda = {
  /** Fracción del recorrido con el lazo apagado, MUESTREADA sobre la función. */
  readonly conMargen: number
  /** La misma fracción si el margen fuera cero. Es lo que el margen cuesta. */
  readonly sinMargen: number
}

/**
 * Cuánto del recorrido queda suspendido.
 *
 * `conMargen` se muestrea de a un píxel sobre `escenaEnCuadro`; `sinMargen` se
 * calcula de las ventanas derivadas, que es la única forma de medir la variante
 * que NO se despacha. Los dos números juntos son el precio del margen.
 */
export function medirBanda(): Banda {
  const total = Math.round(DOCUMENTO - VENTANA) + 1
  let vistos = 0
  for (let y = 0; y < total; y += 1) if (escenaEnCuadro(y, DOCUMENTO, VENTANA)) vistos += 1
  const ancho = ANCLAJE.ventanasDeLaEscena.reduce((n, [a, b]) => n + (b - a), 0)
  return { conMargen: 1 - vistos / total, sinMargen: 1 - ancho / ANCLAJE.pantallasDeScroll }
}

/**
 * ⚠ **LOS SUPUESTOS, DECLARADOS.** `HZ` es la pantalla de 60 Hz; `SEGUNDOS` es
 * una pasada completa del recorrido de 13 pantallas en un minuto —4,6 s por
 * pantalla, un scroll de lectura— y **es un supuesto, no una medición**: nadie
 * cronometró una pasada real. La fórmula queda escrita al lado del número para
 * que cambiar el supuesto sea cambiar un factor y no rehacer la cuenta.
 */
export const HZ = 60
export const SEGUNDOS_DE_UNA_PASADA = 60

/** Cuadros que no se dibujan en una pasada: `HZ × SEGUNDOS × banda`. */
export function cuadrosDeUnaPasada(banda: Banda): number {
  return Math.round(HZ * SEGUNDOS_DE_UNA_PASADA * banda.conMargen)
}

/**
 * Y EL CASO QUE MÁS IMPORTA, QUE NO ES EL RECORRIDO: una página **quieta**
 * adentro de una sección opaca. Hoy la escena dibuja 60 cuadros por segundo
 * para siempre, mirando una sala que ningún píxel muestra; suspendida dibuja
 * cero. El número es por minuto y no tiene tope: crece con el tiempo que alguien
 * deje la pestaña ahí.
 */
export const CUADROS_DE_UN_MINUTO_QUIETO = HZ * 60

/** Cuántas veces se reanuda en una pasada de punta a punta. */
export const REANUDACIONES_POR_PASADA = ANCLAJE.ventanasDeLaEscena.length - 1

export function imprimirCuadros(banda: Banda): void {
  const costo = 100 * (banda.sinMargen - banda.conMargen)
  console.log(`  banda suspendida SIN margen:                ${(100 * banda.sinMargen).toFixed(1)}% del recorrido`)
  console.log(`  banda suspendida CON margen de ${MARGEN_DE_REANUDACION} pantallas: ${(100 * banda.conMargen).toFixed(1)}%`)
  console.log(`  el margen cuesta ${costo.toFixed(1)} puntos de banda`)
  console.log(
    `  pasada de ${SEGUNDOS_DE_UNA_PASADA}s a ${HZ}Hz (supuesto declarado): ` +
      `${cuadrosDeUnaPasada(banda)} de ${HZ * SEGUNDOS_DE_UNA_PASADA} cuadros NO se dibujan`,
  )
  console.log(
    `  lo que cuesta el mecanismo: ${REANUDACIONES_POR_PASADA} reanudación por pasada × ` +
      `${CUADROS_DE_REANUDACION} cuadros sin física = ${REANUDACIONES_POR_PASADA * CUADROS_DE_REANUDACION}`,
  )
  console.log(
    `  PÁGINA QUIETA en la banda opaca: ${CUADROS_DE_UN_MINUTO_QUIETO} cuadros por minuto, ` +
      'hoy dibujados, pasan a CERO',
  )
}
