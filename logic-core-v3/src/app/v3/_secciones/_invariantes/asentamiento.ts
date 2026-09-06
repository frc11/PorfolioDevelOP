/**
 * LO QUE SE MIDE DE UN ASENTAMIENTO — separado de lo que se produce.
 *
 * ⚠ **ESTÁ ACÁ Y NO EN `_contrato/asentamiento.ts` POR DOS RAZONES, Y LAS DOS
 * IMPORTAN.**
 *
 * 1. **La costura de siempre del repo:** acá se mide, allá se produce. Un
 *    control positivo tiene que poder correr LA MISMA función contra un remapeo
 *    deliberadamente roto —la identidad, o uno que retrocede— y eso no se puede
 *    si la medición vive adentro de la afirmación.
 * 2. **El peso.** Estas dos funciones sólo las llaman invariantes. En el módulo
 *    del contrato viajarían al grafo del cliente, y `s5-peso` pesa lo propio de
 *    `/v3` contra un techo declarado. Las tres secciones las tenían copiadas ahí
 *    —tres veces— y el `tree-shaking` las sacaba; que las saque no es razón para
 *    escribirlas donde no van.
 *
 * Las dos reciben el REMAPEO como argumento y no lo importan: es lo que permite
 * que cada sección mida el suyo con el mismo instrumento.
 */

/**
 * Cuántas muestras se toman sobre `[0, 1]`. 601 y no 600: con 601 el paso es
 * exactamente `1/600` y las dos puntas del intervalo caen en una muestra, así
 * que `remapeo(0)` y `remapeo(1)` entran en la cuenta.
 */
export const MUESTRAS_DEL_RANGO = 601

/**
 * QUÉ FRACCIÓN DEL RANGO PASA SIN QUE EL REMAPEO SE MUEVA. **Eso es el
 * aterrizaje, medido sobre el remapeo y no sobre la pantalla.**
 *
 * Compara con `===` y no con un épsilon a propósito: lo que se afirma es que el
 * número **no cambia**, no que cambie poco. Un remapeo que se mueve por un
 * flotante en el último dígito no produce un aterrizaje — produce un elemento
 * que sigue escribiendo estilo, que es exactamente lo que el censo ve.
 */
export function fraccionAsentada(
  remapeo: (local: number) => number,
  muestras: number = MUESTRAS_DEL_RANGO,
): number {
  let quietos = 0
  let anterior = remapeo(0)
  for (let i = 1; i < muestras; i += 1) {
    const actual = remapeo(i / (muestras - 1))
    if (actual === anterior) quietos += 1
    anterior = actual
  }
  return quietos / (muestras - 1)
}

/**
 * ¿EL REMAPEO NUNCA RETROCEDE? Es la condición que los nueve patrones asumen y
 * que el recorrido entero declara: un progreso que retrocede desarma un canal
 * mientras el visitante sigue bajando.
 */
export function esMonotono(
  remapeo: (local: number) => number,
  muestras: number = MUESTRAS_DEL_RANGO,
): boolean {
  let anterior = remapeo(0)
  for (let i = 1; i < muestras; i += 1) {
    const actual = remapeo(i / (muestras - 1))
    if (actual < anterior) return false
    anterior = actual
  }
  return true
}
