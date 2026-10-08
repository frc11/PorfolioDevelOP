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

import { AIRE_DEL_LOGO_SVH, DOLLY_DEL_CTA, POSES_DEL_FINAL, TIEMPOS_DEL_FINAL, arribaDelLogoEncuadrado, huecoDelLogo, progresoDelPin } from '../../_lib/escena/finalDelRecorrido'

export { huecoDelLogo }

const AIRE_SVH = AIRE_DEL_LOGO_SVH

/**
 * Cuánto sube la frase, en `svh`: la deja arriba del logo de B y de las columnas. [RETOQUE 3D] B5: 33 (era 30) y el aire
 * bajo ella 10 (era 7): las columnas quedan donde estaban y la frase 3 svh más arriba. El título de volumen, extruido y
 * visto desde la cámara de los valores, baja 23 px más que su renglón del DOM: la «g» de «elegirnos» quedaba a 16 px del
 * ícono de «Calidad que se nota».
 */
export const SUBIDA_DE_LA_FRASE_SVH = 33

/**
 * Dónde arrancan las columnas de valores: debajo de la frase ya subida —su centro queda en
 * `50 − subida`, y medio renglón de `titulo-xl` más el aire son 10 svh—. Sin esto, a 1024 ×
 * 768 las columnas angostas crecían para arriba y el primer valor le caía a la frase.
 */
const ARRIBA_DE_LOS_VALORES_SVH = 50 - SUBIDA_DE_LA_FRASE_SVH + 10

/**
 * **[FINAL 2]** El CTA va DEBAJO del logo: de día el logo es negro y la tinta también, así
 * que centrado encima no se leía. Arranca con aire bajo el pie del logo en C (77 svh) y
 * termina antes de la sombra de contacto del piso, que en C arranca al 90 % del alto: el
 * tamaño de la letra sale de ese lugar.
 */
/**
 * [NOCTURNO FINAL] D3 · cambió por pedido: el CTA va CENTRADO en la pantalla y el logo, abajo (la pose C). El lugar del CTA
 * es una franja centrada que llega hasta el aire de arriba del logo, igual hacia arriba (queda lejos de la barra): de ella
 * sale el tamaño de la letra, así entra en cualquier alto. El logo arranca al 71,4 % del alto (en cualquier ancho).
 */
// [PULIDO 1] P17-A · con la distancia de ojo (la cámara está arriba) menos el dolly-in del final: es donde el logo queda más
// grande (a 30,8; era 32), así que el CTA nunca lo pisa.
const POSE_C = POSES_DEL_FINAL.cta
export const ARRIBA_DEL_LOGO_EN_EL_CTA_SVH = arribaDelLogoEncuadrado(Math.hypot(POSE_C.distance, POSE_C.height) - DOLLY_DEL_CTA.u, POSE_C.frameY)
export const LUGAR_DEL_CTA_SVH = Math.round((ARRIBA_DEL_LOGO_EN_EL_CTA_SVH - 50 - AIRE_SVH) * 2 * 10) / 10

/**
 * [PASADA FINAL] D3 · el alto del CTA en la lista (abajo de 1024 y con menos movimiento), en `svh`: era un `70svh` escrito
 * en la clase, que s6-tokens marca (un literal con unidad y un arbitrario sin token). Ahora sale de acá, como los demás.
 */
// [NOCTURNO FINAL] D3 · una pantalla entera (era 70): el CTA queda solo y centrado en la pantalla cuando llega.
export const ALTO_DEL_CTA_EN_LISTA_SVH = 100
/**
 * [PULIDO 3B] B1 · con movimiento reducido en escritorio, dónde va el CTA quieto en la sección (svh desde su arriba): en la
 * mitad de la pose C (con la cámara en el CTA y el logo abajo; antes iba en la última pantalla, la del alejamiento al pie,
 * con el logo en el centro: el CTA quedaba encima).
 */
export const ARRIBA_DEL_CTA_QUIETO_SVH = Math.round(50 * (TIEMPOS_DEL_FINAL.cta.llega + TIEMPOS_DEL_FINAL.cta.hasta))
export const ESTILO_DE_LA_LISTA = { '--alto-del-cta-en-lista': `${String(ALTO_DEL_CTA_EN_LISTA_SVH)}svh`, '--arriba-del-cta-quieto': `${String(ARRIBA_DEL_CTA_QUIETO_SVH)}svh` } as CSSProperties

/** Las variables que leen las clases: los huecos del logo en A y en B, el techo de las columnas y el lugar del CTA. */
export const ESTILO_DEL_ESCENARIO = {
  '--lugar-del-cta': `${LUGAR_DEL_CTA_SVH.toFixed(1)}svh`,
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

/** La frase llega apenas se clava el escenario, con la cámara quieta en A. [PASADA FINAL] A3: en `frase.armada` pantallas. */
export const VENTANA_DE_LA_FRASE: Ventana = { desde: progresoDelPin(0), hasta: progresoDelPin(frase.armada) }

/**
 * Los valores entran de a pares —izquierda y derecha a la vez— mientras la cámara baja a B.
 * **[BASE]** De ABAJO hacia arriba, porque suben: primero la fila de abajo, al final la de
 * arriba (y subiendo, al revés, porque todo está atado al scroll). Abajo de 1024 la lista
 * no usa esto: llega de arriba abajo, cada pieza sobre su ventana visible.
 */
const LLEGADA_DE_LOS_VALORES = frase.hasta + 0.2
// [RETOQUE PANEL] T3 · más juntos (0,2 y 0,3; eran 0,3 y 0,4): la frase se sostiene antes y los valores entran igual.
const PASO_ENTRE_PARES = 0.2
const DURACION_DE_UN_VALOR = 0.3
export function ventanaDelValor(indice: number): Ventana {
  const fila = 2 - (indice % 3)
  const desde = LLEGADA_DE_LOS_VALORES + fila * PASO_ENTRE_PARES
  return { desde: progresoDelPin(desde), hasta: progresoDelPin(desde + DURACION_DE_UN_VALOR) }
}

/** [BASE] La frase sube ANTES de que llegue el primer valor: ningún valor comparte altura con ella mientras llega. */
export const VENTANA_DE_LA_SUBIDA_DE_LA_FRASE: Ventana = { desde: progresoDelPin(frase.hasta), hasta: ventanaDelValor(2).desde }
/** La frase y los valores se levantan juntos cuando la cámara empieza a subir a C. */
export const VENTANA_DE_LA_LEVANTADA: Ventana = { desde: progresoDelPin(valores.hasta), hasta: progresoDelPin(valores.hasta + 0.4) }

/**
 * [PULIDO 2] 5 · la transformación de «Seis razones» al CTA: del fin de los valores a la llegada del CTA. Su progreso es
 * función del pin (`ctaDelFinal/transformacion.ts`). [PULIDO 3B] B1 · del producto (las ventanas del CTA de antes se fueron
 * con él) y en tres pantallas, no una: hasta `TIEMPOS_DEL_FINAL.cta.armado`.
 */
export const VENTANA_DE_LA_TRANSFORMACION: Ventana = { desde: progresoDelPin(valores.hasta), hasta: progresoDelPin(cta.armado) }

/** Cuánto sube lo que se levanta, en `svh`. */
export const SUBIDA_DE_LA_LEVANTADA_SVH = 12
