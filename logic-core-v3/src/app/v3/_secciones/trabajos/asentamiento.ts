/**
 * LA MESETA DE LOS PLANOS — **cada proyecto llega, SE QUEDA, y sale.**
 *
 * ── El defecto que arregla, medido ────────────────────────────────────────
 *
 * B2 dejó el reparto de los tres planos en tercios del recorrido y no pudo
 * construir la meseta. La consecuencia se midió con scroll real a 1920×1080 en
 * el puerto 3001, barriendo `[7560, 11880]` de 20 en 20 px con tres cuadros de
 * espera por muestra:
 *
 *     scrollY 8640   los TRES planos en `visibility: hidden`
 *     scrollY 9720   los TRES planos en `visibility: hidden`
 *     scrollY 10800 → 11880   los TRES, durante 1080 px seguidos
 *
 * Los dos primeros son los que B2 publicó. **El tercero no estaba reportado y
 * es el más grande:** el recorrido de P7 cierra en `scrollY` 10800 —donde el pin
 * suelta— con el último plano ya en opacidad 0, así que la sección se va con su
 * escenario vacío durante **una pantalla entera**. Es el mismo defecto, en el
 * borde que no tiene un plano siguiente que lo tape.
 *
 * ── Por qué el defecto existe, en una línea ───────────────────────────────
 *
 * Porque la salida del plano `i` termina **exactamente** donde arranca la
 * llegada del plano `i+1`, y en ese punto los dos valen `autoAlpha: 0`. Que se
 * toquen sin superponerse es lo que produce el cuadro vacío: no hay meseta y no
 * hay cruce.
 *
 * ── La forma del arreglo ──────────────────────────────────────────────────
 *
 * El tramo de cada plano se parte en tres, y el tercero SE DESBORDA al tramo
 * siguiente a propósito:
 *
 *     u ∈ [0 · llegada]        el plano viene, de `local` 0 al CORTE de P7
 *     u ∈ [llegada · 1]        LA MESETA: `local` clavado en el corte, quieto
 *     u ∈ [1 · 1+salida]       se va, del corte a 1 — **mientras el siguiente
 *                              ya está llegando**
 *
 * `u` es la posición dentro del tramo del plano (`progreso · planos − índice`),
 * o sea el mismo tramo que `_contrato/secuencia.ts` produce; lo único que esta
 * sección agrega es el remapeo, que es exactamente lo que `saturarEn` del
 * contrato hace para Servicios, Tu panel y el Cierre. **Ningún valor de P7 se
 * toca:** ni una clave, ni una curva, ni una duración, ni el escalonado.
 *
 * ── De dónde salen las tres fracciones. Ninguna se elige ──────────────────
 *
 *   · **la meseta** — de `FUSION_DEL_CENSO`: el censo de acontecimientos funde
 *     dos grupos separados por 240 px o menos, así que una banda quieta más
 *     corta que eso **no se lee como que algo se quedó**. Es el mismo umbral que
 *     las otras tres secciones usan para derivar su asentamiento. Sobre un tramo
 *     de una pantalla da 240/1080 = 2/9 del tramo.
 *   · **la llegada** — lo que queda del tramo: `1 − meseta`.
 *   · **la salida** — la que hace que el gesto corra a **velocidad de scroll
 *     constante** de punta a punta: la llegada consume `corte` de la ventana de
 *     P7 en `llegada` de tramo, así que la salida consume `1 − corte` en
 *     `llegada · (1 − corte) / corte`. No es un número nuevo: es el mismo ritmo
 *     que ya tiene la llegada, prolongado.
 *
 * Con esas tres, el desborde de la salida (0,1296 de tramo) cae adentro de la
 * llegada del plano siguiente (0,7778): **los dos están pintados a la vez en
 * todo el cruce**, que es la propiedad que el defecto pedía.
 *
 * ⚠️ **LO QUE ESTA FORMA NO DA, Y SE REPORTA: el ÚLTIMO plano no sale.** Su
 * salida caería en `p > 1`, que es scroll que este recorrido no tiene —el ancla
 * de P7 cierra cuando el pin suelta— y el progreso satura en 1. O sea que el
 * tercer proyecto se queda en su meseta mientras la sección se va. Es lo
 * contrario del defecto de 1080 px de arriba y **es la única salida que no toca
 * el ancla**: para que los tres salieran adentro del recorrido, los tramos
 * tendrían que dejar de medir un tercio cada uno, y ese reparto es una decisión
 * medida de B2 que esta instrucción manda respetar.
 */

import { ALTO_DE_CALIBRACION, CORTE_DE_TRAMOS, FUSION_DEL_CENSO, saturarEn } from '../_contrato/asentamiento'
import { pantallasDe, seccionDe } from '../_contrato/forma'

/** El id de la sección, para leer su alto de la tabla del recorrido. */
export const ID_DE_LA_SECCION = 'trabajos'

/** El corte llegada/salida de P7, intermediado por el contrato. La sección no
 *  lee `_lib/motion/`: `s7-contrato` §3 lo prohíbe y la regla no se afloja. */
export const CORTE_DE_P7 = CORTE_DE_TRAMOS.P7

/** Lo que produce la derivación, junto, para que el instrumento lo publique. */
export interface MesetaDeLosPlanos {
  /** Cuánto scroll mide el tramo de UN plano, a la altura de calibración. */
  readonly tramoEnPx: number
  readonly fraccionDeLaMeseta: number
  readonly fraccionDeLaLlegada: number
  readonly fraccionDeLaSalida: number
  /** De la posición dentro del tramo al progreso local de P7. */
  readonly remapear: (u: number) => number
}

/**
 * LA DERIVACIÓN. `planos` entra como parámetro y no se lee de `geometria.ts`
 * para que no haya un ciclo entre los dos módulos: allá vive el reparto, acá el
 * asentamiento, y el reparto es el que llama.
 */
export function mesetaDeLosPlanos(planos: number): MesetaDeLosPlanos {
  if (!Number.isInteger(planos) || planos < 1) {
    throw new Error(`meseta: los planos tienen que ser un entero ≥ 1, vino ${planos}`)
  }
  const tramoEnPx = (pantallasDe(seccionDe(ID_DE_LA_SECCION)) * ALTO_DE_CALIBRACION) / planos
  const fraccionDeLaMeseta = FUSION_DEL_CENSO / tramoEnPx
  const fraccionDeLaLlegada = 1 - fraccionDeLaMeseta
  const fraccionDeLaSalida = (fraccionDeLaLlegada * (1 - CORTE_DE_P7)) / CORTE_DE_P7
  const llegada = saturarEn(fraccionDeLaLlegada)
  const salida = saturarEn(fraccionDeLaSalida)
  return {
    tramoEnPx,
    fraccionDeLaMeseta,
    fraccionDeLaLlegada,
    fraccionDeLaSalida,
    // Los dos `saturarEn` del contrato, sumados: el primero lleva el `local` de
    // 0 al corte y ahí se clava —eso ES la meseta—; el segundo no arranca hasta
    // que `u` pasa 1, o sea hasta el tramo siguiente, y lo lleva del corte a 1.
    remapear: (u: number): number => CORTE_DE_P7 * llegada(u) + (1 - CORTE_DE_P7) * salida(u - 1),
  }
}
