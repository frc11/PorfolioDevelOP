/**
 * [B1] EL RELOJ DEL VACÍO, sacado del túnel con los mismos valores — lo único del túnel que Demos seguía leyendo.
 *
 * La llegada de Demos (`entrada.ts`) se cuenta con la fracción del vacío: la recta que en la sección de antes arrancaba con la
 * salida (3.882 px de la regla, de 6.813) y llenaba el cuadro en `PX_DEL_VACIO`. El túnel se fue al archivo
 * (`_archivo/tunel-portfolio/`) y el vacío ya no se dibuja (el panel del Portfolio se retrae en ese tramo), pero el reloj es el
 * mismo número sobre el mismo `mostrado` (la fracción de 6.813): el título de Demos sube donde subía y el último libro se asienta
 * donde se asentaba. `mostrado` lo da la cola de la sección nueva (`portfolio/pasos.ts`, `mostradoDeDemos`). s76 compara estos
 * valores contra los del túnel archivado.
 */

/** Lo que tardaba el vacío en llenar el cuadro, en px de la regla (`PX_DEL_VACIO` del túnel: la rampa de la última captura). */
export const PX_DEL_VACIO = 969.0485880962069

/** Los px de la regla de la sección de antes (717svh + 40 de solape): la unidad de `mostrado`. */
export const PX_DE_LA_SECCION_DE_HOY = 6813

/** Dónde arrancaba el vacío (y la salida), en px de la regla. */
export const ARRANQUE_DEL_VACIO = 3882

/** Dónde arranca el espacio de Demos: la salida terminada (1.131 después), la sala sola. */
export const ARRANQUE_DEL_ESPACIO_DE_DEMOS = ARRANQUE_DEL_VACIO + 1131

/**
 * [CIERRE] 1B · LA LLEGADA DE LOS DEMOS DURA EL DOBLE DE SCROLL — arranca con el vacío al 60 % (cuando sube el título) y desde ahí
 * su reloj corre a la mitad (`lenta`).
 */
export const LLEGADA_DE_LOS_DEMOS = { desde: 0.6, lenta: 2 } as const

/** Dónde termina la llegada, en fracciones del vacío sin su tope: 0,6 + 0,4 × 2 = 1,4. */
export const FIN_DE_LA_LLEGADA_EN_EL_VACIO = LLEGADA_DE_LOS_DEMOS.desde + (1 - LLEGADA_DE_LOS_DEMOS.desde) * LLEGADA_DE_LOS_DEMOS.lenta

/** El fin de la llegada de los demos, en px de la regla. */
export const PX_DEL_FIN_DE_LA_LLEGADA = ARRANQUE_DEL_VACIO + FIN_DE_LA_LLEGADA_EN_EL_VACIO * PX_DEL_VACIO

/** La fracción del vacío sin su tope (pasa de 1 después de que el vacío llenaba el cuadro), para un `mostrado`. */
export function vacioSinTope(mostrado: number): number {
  return (mostrado * PX_DE_LA_SECCION_DE_HOY - ARRANQUE_DEL_VACIO) / PX_DEL_VACIO
}
