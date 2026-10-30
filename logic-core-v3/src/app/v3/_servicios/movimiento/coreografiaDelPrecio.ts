/**
 * [SERVICIOS M2a] CÓMO ENTRAN LOS TRES PANELES DEL PRECIO — puro (sin react ni next), para probarlo en Node.
 *
 * El progreso es el del `Bloque` del home con P2 sobre la sección alta (0 cuando su tope asoma por abajo, 1 cuando el anclaje suelta),
 * y de él sale la entrada de cada panel, de 0 (afuera) a 1 (en su lugar). Es scrub: subiendo, deshace el camino.
 *
 * Una sola coreografía (la `b` del M2a, elegida por Valentino): la Mediana primero, sola, en la primera mitad del recorrido; la Simple y
 * la Premium juntas, desde los dos lados, en la segunda. Cada turno llega al 70 % de su mitad y queda quieto el resto (`tramoDeSecuencia`
 * y `saturarEn` del contrato).
 */

import { saturarEn } from '../../_secciones/_contrato/asentamiento'
import { tramoDeSecuencia } from '../../_secciones/_contrato/secuencia'

const LLEGA_EN = saturarEn(0.7)

/** El turno de cada panel: la Mediana (1) en el primero; la Simple (0) y la Premium (2), juntas, en el segundo. */
const TURNO: Readonly<Record<0 | 1 | 2, number>> = { 0: 1, 1: 0, 2: 1 }

export function entradaDelPanel(panel: 0 | 1 | 2, progreso: number): number {
  const { indice, local } = tramoDeSecuencia(progreso, 2)
  const turno = TURNO[panel]
  return indice > turno ? 1 : indice < turno ? 0 : LLEGA_EN(local)
}
