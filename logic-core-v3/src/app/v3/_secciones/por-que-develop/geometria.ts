/**
 * LA GEOMETRÍA DE «POR QUÉ develOP» — cuándo entra cada pieza y cuánto lugar deja el
 * logo. **[FINAL]**
 *
 * Las ventanas son fracciones del PIN de la sección (0 al clavarse, 1 al soltarse) y
 * salen de los mismos tiempos que mueven la cámara (`_lib/escena/finalDelRecorrido.ts`):
 * la frase llega con la cámara quieta en A, los valores mientras baja a B, y la frase y
 * los valores se levantan juntos cuando sube a C, que es cuando llega el CTA.
 *
 * El hueco del logo tampoco se elige: sale de la pose y de su ancho medido (ver abajo). La
 * frase y los valores se apoyan a los costados de ese ancho, así que no le pasan por
 * encima en ningún ancho de escritorio.
 */

import type { CSSProperties } from 'react'

import { AIRE_DEL_LOGO_SVH, POSES_DEL_FINAL, TIEMPOS_DEL_FINAL, huecoDelLogo, pieDelLogo, progresoDelPin } from '../../_lib/escena/finalDelRecorrido'

export { huecoDelLogo }

const AIRE_SVH = AIRE_DEL_LOGO_SVH

/** Cuánto sube la frase, en `svh`: la deja arriba del logo de B y de las columnas. */
export const SUBIDA_DE_LA_FRASE_SVH = 30

/**
 * Dónde arrancan las columnas de valores: debajo de la frase ya subida —su centro queda en
 * `50 − subida`, y medio renglón de `titulo-xl` más el aire son 7 svh—. Sin esto, a 1024 ×
 * 768 las columnas angostas crecían para arriba y el primer valor le caía a la frase.
 */
const ARRIBA_DE_LOS_VALORES_SVH = 50 - SUBIDA_DE_LA_FRASE_SVH + 7

/**
 * **[FINAL 2]** El CTA va DEBAJO del logo: de día el logo es negro y la tinta también, así
 * que centrado encima no se leía. Arranca con aire bajo el pie del logo en C (77 svh) y
 * termina antes de la sombra de contacto del piso, que en C arranca al 90 % del alto: el
 * tamaño de la letra sale de ese lugar.
 */
export const ARRIBA_DEL_CTA_SVH = pieDelLogo(POSES_DEL_FINAL.cta.distance) + AIRE_SVH
export const ABAJO_DEL_CTA_SVH = 4

/** Las variables que leen las clases: los huecos del logo en A y en B, el techo de las columnas y el lugar del CTA. */
export const ESTILO_DEL_ESCENARIO = {
  '--arriba-del-cta': `${ARRIBA_DEL_CTA_SVH.toFixed(1)}svh`,
  '--lugar-del-cta': `${(100 - ARRIBA_DEL_CTA_SVH - ABAJO_DEL_CTA_SVH).toFixed(1)}svh`,
  // [FINAL 3] La frase usa el hueco de B (el más ancho): así cada mitad arranca donde arranca su columna de valores.
  '--hueco-de-la-frase': `${huecoDelLogo(POSES_DEL_FINAL.valores.distance).toFixed(1)}svh`,
  '--hueco-de-los-valores': `${huecoDelLogo(POSES_DEL_FINAL.valores.distance).toFixed(1)}svh`,
  '--arriba-de-los-valores': `${String(ARRIBA_DE_LOS_VALORES_SVH)}svh`,
  '--abajo-de-los-valores': `${String(AIRE_SVH)}svh`,
} as CSSProperties

const { frase, valores, cta } = TIEMPOS_DEL_FINAL

/** Una ventana del pin: la pieza va de 0 a 1 entre `desde` y `hasta`. */
export interface Ventana {
  readonly desde: number
  readonly hasta: number
}

/** La frase llega apenas se clava el escenario, con la cámara quieta en A. */
export const VENTANA_DE_LA_FRASE: Ventana = { desde: progresoDelPin(0), hasta: progresoDelPin(0.45) }

/**
 * Los valores entran de a pares —izquierda y derecha a la vez— mientras la cámara baja a B.
 * **[BASE]** De ABAJO hacia arriba, porque suben: primero la fila de abajo, al final la de
 * arriba (y subiendo, al revés, porque todo está atado al scroll). Abajo de 1024 la lista
 * no usa esto: llega de arriba abajo, cada pieza sobre su ventana visible.
 */
const LLEGADA_DE_LOS_VALORES = frase.hasta + 0.2
const PASO_ENTRE_PARES = 0.3
const DURACION_DE_UN_VALOR = 0.4
export function ventanaDelValor(indice: number): Ventana {
  const fila = 2 - (indice % 3)
  const desde = LLEGADA_DE_LOS_VALORES + fila * PASO_ENTRE_PARES
  return { desde: progresoDelPin(desde), hasta: progresoDelPin(desde + DURACION_DE_UN_VALOR) }
}

/** [BASE] La frase sube ANTES de que llegue el primer valor: ningún valor comparte altura con ella mientras llega. */
export const VENTANA_DE_LA_SUBIDA_DE_LA_FRASE: Ventana = { desde: progresoDelPin(frase.hasta), hasta: ventanaDelValor(2).desde }
/** La frase y los valores se levantan juntos cuando la cámara empieza a subir a C. */
export const VENTANA_DE_LA_LEVANTADA: Ventana = { desde: progresoDelPin(valores.hasta), hasta: progresoDelPin(valores.hasta + 0.4) }

/** El CTA llega mientras se levantan, y queda armado antes de que la cámara termine de subir. */
export const VENTANA_DEL_CTA: Ventana = { desde: progresoDelPin(valores.hasta + 0.2), hasta: progresoDelPin(cta.llega - 0.15) }
/** El destacado y el botón, un poco después de la frase del CTA. */
export const VENTANA_DEL_DESTACADO: Ventana = { desde: progresoDelPin(valores.hasta + 0.35), hasta: progresoDelPin(cta.llega) }

/** Cuánto sube lo que se levanta, en `svh`. */
export const SUBIDA_DE_LA_LEVANTADA_SVH = 12
