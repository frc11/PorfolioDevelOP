/**
 * EL ASENTAMIENTO — la primitiva compartida: **saturar un progreso local para
 * que lo que entra llegue a verse QUIETO antes de que el tramo se acabe.**
 *
 * ── ⚠️ POR QUÉ EXISTE, Y QUÉ DICE QUE HAYA TENIDO QUE EXISTIR ─────────────
 *
 * **Tres frentes que no podían verse entre sí llegaron al mismo mecanismo, con
 * el mismo cuerpo, en la misma corrida.** Servicios, Tu panel y el Cierre
 * escribieron cada uno su `asentamiento.ts` sin conocer el de los otros —cada
 * frente tenía prohibido escribir fuera de sus carpetas— y los tres salieron con
 * las mismas tres constantes del censo, la misma `asentar` y las mismas dos
 * funciones de medición, carácter por carácter.
 *
 * **Eso no es un dato sobre los frentes: es un dato sobre el problema.** Tres
 * secciones sin relación entre sí tenían el MISMO defecto —un canal cuya ventana
 * cierra en el píxel exacto donde su tramo se acaba, así que nunca llega a verse
 * quieto— y la única forma de arreglarlo era la misma. Cuando tres soluciones
 * independientes convergen carácter por carácter, lo que falta no es
 * coordinación entre quienes las escribieron: **es una primitiva que el contrato
 * no tenía.** El ancla de un canal ADENTRO de un tramo era implícita —el tramo
 * entero— y no había dónde declararla. Este archivo es esa primitiva, y llega
 * después del hecho porque el hecho fue el que la descubrió.
 *
 * La duplicación, además, tiene un modo de falla concreto: `PASO_DEL_CENSO` es el
 * paso del instrumento de `B2-DELTAS.md` §0, y el día que ese paso cambie hay que
 * cambiarlo en tres lugares **sin que nada avise si se olvida uno**.
 *
 * Acá queda **lo que las tres comparten**. Lo que NO comparten —de dónde sale
 * la fracción de cada una— se queda en su sección, porque es lo único que es
 * una decisión de esa sección:
 *
 *     servicios   la banda quieta sobre el tramo de la secuencia pinneada
 *     tu panel    el sobrepaso de la lista sobre su rango de ancla
 *     cierre      el sobrepaso del titular sobre su rango de revelado
 *
 * ⚠ **Las dos funciones de MEDICIÓN no están acá**, están en
 * `_invariantes/asentamiento.ts`: sólo las usan los invariantes, y en este
 * módulo viajarían al bundle del cliente. Es la misma costura de siempre —acá
 * se produce, allá se mide— y además es lo que hace que `s5-peso` no pague por
 * ellas.
 */

import { acotar01 } from '../../_lib/acotar'

/**
 * EL PASO DEL CENSO DE ACONTECIMIENTOS, en píxeles de scroll.
 *
 * No es una constante de composición: es la resolución del instrumento con el
 * que este bloque mide (`B2-DELTAS.md` §0). Vive acá porque las tres secciones
 * que derivan su banda quieta la necesitan, y porque tiene que haber **un solo
 * lugar** donde cambiarla el día que el censo cambie de paso.
 */
export const PASO_DEL_CENSO = 120

/**
 * EL UMBRAL DE FUSIÓN DEL CENSO. Dos grupos de aterrizajes separados por dos
 * pasos o menos **se leen como uno solo**. O sea: una banda quieta más corta
 * que esto no separa dos acontecimientos, los une — que es exactamente el
 * defecto que el asentamiento existe para no tener.
 */
export const FUSION_DEL_CENSO = 2 * PASO_DEL_CENSO

/**
 * EL ALTO CON EL QUE SE CALIBRÓ, en píxeles. Es la ventana de la medición de
 * `B2-DELTAS.md` (1920×1080). Las fracciones que las secciones derivan de acá
 * son adimensionales, así que **el remapeo no depende del alto real de la
 * ventana**; lo que sí depende es la cifra de píxeles que se publica al lado.
 */
export const ALTO_DE_CALIBRACION = 1080

/**
 * EL REMAPEO, como fábrica: dado qué fracción del tramo ocupa la ARMADA,
 * devuelve la función que satura el progreso local ahí.
 *
 * `acotar01` va dos veces y las dos hacen falta: la de adentro protege de un
 * progreso que llegue fuera de rango, y la de afuera es la que **satura** —es
 * la que hace que de `fraccion` en adelante el número no se mueva más—.
 *
 * ⚠ **No toca un solo valor de un patrón.** P2, P3, P4, P5 y P7 conservan sus
 * claves, su curva, su duración y su escalonado: lo único que cambia es el
 * RECORRIDO DE SCROLL sobre el que se consumen, que es lo que un ancla hace en
 * cualquier otra sección. Acá el ancla de un canal adentro de un tramo era
 * implícita —el tramo entero— y pasa a estar escrita.
 *
 * Tira con una fracción fuera de `(0, 1]`: con 0 el remapeo sería una división
 * por cero y con más de 1 nunca saturaría, o sea que no habría asentamiento y
 * la sección seguiría teniendo el defecto sin que nada fallara.
 */
export function saturarEn(fraccion: number): (local: number) => number {
  if (!(fraccion > 0 && fraccion <= 1)) {
    throw new Error(`asentamiento: la fracción de armada tiene que caer en (0, 1]: recibió ${fraccion}`)
  }
  return (local: number): number => acotar01(acotar01(local) / fraccion)
}
