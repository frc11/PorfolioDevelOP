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
import {
  CUADROS_DE_REANUDACION,
  ESTADO_INICIAL,
  MARGEN_DE_REANUDACION,
  escenaEnCuadro,
  siguiente,
  type EstadoDeLaEscena,
  type EventoDeLaEscena,
} from '../visibilidad'

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
  return escenaEnCuadro(p * VENTANA, 0, DOCUMENTO, VENTANA)
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
  for (let y = 0; y < total; y += 1) if (escenaEnCuadro(y, 0, DOCUMENTO, VENTANA)) vistos += 1
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

// ── LA MÁQUINA DE FASES — las casillas y sus estados de partida ─────────────

/**
 * LOS TRES ESTADOS DE PARTIDA, alcanzados CORRIENDO la máquina y no escritos.
 *
 * `SUSPENDIDA` y `REANUDANDO` salen de aplicarle eventos a `ESTADO_INICIAL`, no
 * de un literal: un literal sería un modelo paralelo de la máquina, y lo que hay
 * que probar es la máquina. Es la misma disciplina que el resto del módulo — se
 * corre la función que se despacha.
 */
export const CORRIENDO = ESTADO_INICIAL
export const ENTRA: EventoDeLaEscena = { tipo: 'cuadro', enCuadro: true }
export const SALE: EventoDeLaEscena = { tipo: 'cuadro', enCuadro: false }
export const PINTADO: EventoDeLaEscena = { tipo: 'pintado' }
export const SUSPENDIDA = siguiente(CORRIENDO, SALE)
export const REANUDANDO = siguiente(SUSPENDIDA, ENTRA)

/** fase de partida · evento · fase que sale · si el objeto es el MISMO · nombre. */
export type Casilla = readonly [EstadoDeLaEscena, EventoDeLaEscena, string, boolean, string]

/**
 * LAS NUEVE CASILLAS: fase × evento, con la fase que sale y si el objeto cambia.
 *
 * ⚠ **LA NOVENA CAMBIÓ EN SITIO-S11, y no es que se aflojó: es la casilla que
 * MIDE `CUADROS_DE_REANUDACION`.** Con la constante en 2, `reanudando + pintado`
 * dejaba la máquina en `reanudando` con la cuenta en 1; con la constante en 1
 * —bajada en SITIO-S11 citando la medición del orden de los dos `rAF` que
 * produce `_lib/__tests__/s10-raf.invariant.ts`, 28 afirmaciones y 14 controles
 * positivos— ese primer cuadro pintado YA ES el cuadro exacto, y la máquina pasa
 * a `corriendo` encendiendo la física.
 *
 * **La fase esperada NO se deriva de la constante, y es a propósito.** Escrita a
 * mano, esta fila se pone en rojo si alguien mueve el número sin venir a leer
 * por qué — que es exactamente lo que un invariante tiene que hacer. Derivada,
 * seguiría cualquier valor en silencio y dejaría de custodiar nada.
 */
export const CASILLAS: readonly Casilla[] = [
  [CORRIENDO, ENTRA, 'corriendo', true, 'corriendo + entra'],
  [CORRIENDO, SALE, 'suspendida', false, 'corriendo + sale'],
  [CORRIENDO, PINTADO, 'corriendo', true, 'corriendo + pintado (no significa nada acá)'],
  [SUSPENDIDA, ENTRA, 'reanudando', false, 'suspendida + entra'],
  [SUSPENDIDA, SALE, 'suspendida', true, 'suspendida + sale'],
  [SUSPENDIDA, PINTADO, 'suspendida', true, 'suspendida + pintado (el lazo está apagado)'],
  [REANUDANDO, ENTRA, 'reanudando', true, 'reanudando + entra (no se reinicia la cuenta)'],
  [REANUDANDO, SALE, 'suspendida', false, 'reanudando + sale (se apaga sin terminar)'],
  [REANUDANDO, PINTADO, 'corriendo', false, 'reanudando + pintado (el cuadro exacto llegó: enciende la física)'],
]
