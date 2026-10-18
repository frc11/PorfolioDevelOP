/**
 * [SERVICIOS M2a] CÓMO ENTRAN LOS TRES PANELES DEL PRECIO — puro (sin react ni next), para probarlo en Node.
 *
 * El progreso es el del `Bloque` del home con P2 sobre la sección alta (0 cuando su tope asoma por abajo, 1 cuando el anclaje suelta),
 * y de él sale la entrada de cada panel, de 0 (afuera) a 1 (en su lugar). Es scrub: subiendo, deshace el camino.
 *
 * Tres coreografías, para calibrar con Valentino. Producción ve SOLO la fiel al boceto (`a`); las otras dos existen detrás de la bandera
 * de desarrollo `?precio=a|b|c`, que en producción no existe (`coreografiaDe` ignora la consulta).
 *   · `a` — en orden: un tercio del recorrido por panel (la Simple mientras la sección sube, la Mediana y la Premium durante el
 *           anclaje), cada uno llega al 70 % de su tercio y queda quieto el resto (`tramoDeSecuencia` y `saturarEn` del contrato);
 *   · `b` — la Mediana primero, sola, en la primera mitad; la Simple y la Premium juntas en la segunda;
 *   · `c` — en cascada: los tres se solapan, cada uno arranca un quinto después del anterior y tarda tres quintos.
 */

import { saturarEn } from '../../_secciones/_contrato/asentamiento'
import { tramoDeSecuencia } from '../../_secciones/_contrato/secuencia'

export const COREOGRAFIAS_DEL_PRECIO = ['a', 'b', 'c'] as const
export type CoreografiaDelPrecio = (typeof COREOGRAFIAS_DEL_PRECIO)[number]

/** La que ve producción: la fiel al boceto. */
export const COREOGRAFIA_DE_PRODUCCION: CoreografiaDelPrecio = 'a'

/** El nombre de la bandera en la consulta (`?precio=b`). */
export const BANDERA_DEL_PRECIO = 'precio'

const LLEGA_EN = saturarEn(0.7)
const acotar = (v: number): number => Math.min(1, Math.max(0, v))

export function entradaDelPanel(coreografia: CoreografiaDelPrecio, panel: 0 | 1 | 2, progreso: number): number {
  if (coreografia === 'a') {
    const { indice, local } = tramoDeSecuencia(progreso, 3)
    return indice > panel ? 1 : indice < panel ? 0 : LLEGA_EN(local)
  }
  if (coreografia === 'b') {
    const { indice, local } = tramoDeSecuencia(progreso, 2)
    const turno = panel === 1 ? 0 : 1
    return indice > turno ? 1 : indice < turno ? 0 : LLEGA_EN(local)
  }
  return acotar((progreso - panel * 0.2) / 0.6)
}

/**
 * La coreografía según la consulta. Solo en desarrollo la bandera cuenta; en producción es siempre la fiel, aunque la url diga otra
 * cosa: la bandera no existe ahí.
 */
export function coreografiaDe(consulta: string, enDesarrollo: boolean): CoreografiaDelPrecio {
  if (!enDesarrollo) return COREOGRAFIA_DE_PRODUCCION
  const pedida = new URLSearchParams(consulta).get(BANDERA_DEL_PRECIO)
  return COREOGRAFIAS_DEL_PRECIO.find((c) => c === pedida) ?? COREOGRAFIA_DE_PRODUCCION
}
