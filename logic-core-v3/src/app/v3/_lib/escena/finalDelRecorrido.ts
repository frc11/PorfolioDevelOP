/**
 * EL FINAL DEL RECORRIDO — los cinco tiempos de «Por qué develOP» y el pie, sobre el
 * scroll. **[FINAL]**
 *
 * La escena se extiende con la coreografía de siempre: el tramo `cierre` corre sobre
 * «Por qué develOP» con su ancla declarada, y adentro de él los keyframes caen donde este
 * archivo dice. No hay un segundo sistema: el progreso de cada tiempo SALE de la recta del
 * tramo —el ancla en el arranque del pin, 1 en el último píxel de scroll—, así que la
 * sección, la cámara y el arco leen la misma cuenta.
 *
 *     A · frase        frontal y centrado; se alcanza ESCONDIDO detrás de Tu Panel
 *     B · valores      más cerca y desde abajo (contrapicado)
 *     C · CTA          el mismo plano; la cámara sube hasta quedar derecha
 *     D · alejamiento  de golpe, lejos (la excepción declarada al techo de velocidad)
 *     E · pie          plano abierto, el logo en el centro
 *
 * Las medidas salen de nk.studio a 1440 × 900 (`docs/rediseno/SPRINT-FINAL.md`, fase 0):
 * la barra de nk mide 343 px en la frase, 580 en los valores, 665 al nivelarse y 172 en el
 * pie, y el alejamiento la achica ×3,9 en 50 px de scroll. Acá se traducen a distancia con
 * el logo de 4,78 de tinta y 35° de campo: de frente ocupa `7,58 / d` del alto del cuadro.
 *
 * No importa nada de la escena: lo leen `choreography.ts`, `anclaje.ts` y `lightArc.ts`, y
 * los tres dependerían de él en círculo si importara a alguno.
 */

import { PANTALLAS_DE_POR_QUE_DEVELOP } from '../secciones'

/**
 * EL ANCLA DE «POR QUÉ develOP»: el progreso en que la sección llena el cuadro, que es
 * donde arranca su pin. Es la de V3-E (0,8525) y se declara acá para que el anclaje, el
 * arco y los keyframes la lean de un solo lugar.
 */
export const ANCLA_DE_POR_QUE_DEVELOP = 0.8525

/**
 * LOS TIEMPOS, en pantallas contadas desde el arranque del pin (la sección llena el
 * cuadro en 0). Cada uno dice dónde se LLEGA a su pose y hasta dónde se SOSTIENE.
 *
 * ⚠️ La frase llega en −1: es la pantalla en que la sección asoma por el pie del cuadro.
 * Su pose se alcanza en el nudo del tramo anterior, escondida detrás de Tu Panel, así que
 * el primer cuadro en que se ve la escena ya es A.
 */
export const TIEMPOS_DEL_FINAL = {
  frase: { llega: -1, hasta: 0.5 },
  valores: { llega: 1.5, hasta: 1.8 },
  cta: { llega: 2.7, hasta: PANTALLAS_DE_POR_QUE_DEVELOP - 1 },
  // El alejamiento D es el camino de `cta.hasta` a `pie.llega`: un cuarto de pantalla.
  pie: { llega: PANTALLAS_DE_POR_QUE_DEVELOP - 1 + 0.25, hasta: PANTALLAS_DE_POR_QUE_DEVELOP },
} as const

/** El progreso del recorrido en una pantalla del final (contada desde el arranque del pin). */
export function progresoDelFinal(pantalla: number): number {
  return ANCLA_DE_POR_QUE_DEVELOP + ((1 - ANCLA_DE_POR_QUE_DEVELOP) * pantalla) / PANTALLAS_DE_POR_QUE_DEVELOP
}

/** Las poses de los cinco tiempos (D es el camino entre C y E). */
export const POSES_DEL_FINAL = {
  frase: { angleDeg: 360, height: 1.6, distance: 20, frameX: 0, frameY: 0 },
  // A 16 y no a los 12 que da nk: la barra de nk es angosta y nuestro logo es ancho (medido en
  // contrapicado a 14: 797 × 547 px a 1440 × 900), así que a 1024 × 768 los valores de los
  // costados no entraban. Contrapicado de 11°; el piso admite −3,584 a 16.
  valores: { angleDeg: 360, height: -3.2, distance: 16, frameX: 0, frameY: 0 },
  cta: { angleDeg: 360, height: 0, distance: 16, frameX: 0, frameY: 0 },
  pie: { angleDeg: 360, height: 5, distance: 40, frameX: 0, frameY: 0 },
} as const

/**
 * El progreso del pin de la sección (0 al clavarse, 1 al soltarse) en una pantalla del
 * final. Es la cuenta con la que la sección reparte sus piezas sobre el mismo scroll que
 * la cámara.
 */
export function progresoDelPin(pantalla: number): number {
  return pantalla / (PANTALLAS_DE_POR_QUE_DEVELOP - 1)
}

/**
 * EL HUECO QUE EL LOGO DEJA en el cuadro, en `svh`: su medio ancho más el aire. El ancho sale
 * medido —a 14, en el contrapicado de B, mide 797 px de un cuadro de 900 (0,886 del alto), y
 * el alto del cuadro a esa distancia es `0,6306 × 14` de mundo: `7,82 / 0,6306 = 12,4`—, así
 * que la frase, los valores y el pie se apoyan a los costados del logo en cualquier ancho.
 */
const ANCHO_DEL_LOGO_POR_DISTANCIA = 12.4
export const AIRE_DEL_LOGO_SVH = 3
export function huecoDelLogo(distancia: number): number {
  return Math.round((ANCHO_DEL_LOGO_POR_DISTANCIA / distancia / 2) * 1000) / 10 + AIRE_DEL_LOGO_SVH
}

/**
 * **[FINAL 2]** Dónde termina el logo por abajo, en `svh` desde arriba del cuadro, de frente y
 * centrado. Medido en C (a 16): del 26 % al 74 % del alto en 1024×768, 1280×720, 1440×900 y
 * 1920×1080 —el campo es vertical, así que no depende del ancho—: `0,48 × 16 = 7,68`.
 */
const ALTO_DEL_LOGO_POR_DISTANCIA = 7.68
export function pieDelLogo(distancia: number): number {
  return 50 + Math.round((ALTO_DEL_LOGO_POR_DISTANCIA / distancia / 2) * 1000) / 10
}
