/**
 * B7 · FRENTE D — EL VEREDICTO DEL TECHO DE CONTENCIÓN, DERIVADO.
 *
 * Sale de `d-lcp-anatomia.ts` por la regla de las 300 líneas, y el corte es por
 * tema: allá está la corrida —cargar, bloquear, leer— y acá está **cómo se lee
 * un delta chico sobre n pocas**, que es donde ese archivo se había equivocado.
 */

import { dos } from './b7-comun'
import { mediana } from './d-lcp-anatomia'
import type { Lectura } from './d-lcp-lectores'

/**
 * ⚠️ **EL VEREDICTO SE DERIVA DE LA DISPERSIÓN, no de la mediana sola.**
 *
 * Si la diferencia de medianas es más chica que la mitad del rango del brazo más
 * ruidoso, las dos poblaciones no están separadas y lo honesto es decir
 * «indistinguible de cero con este n», que **es una respuesta** — la que
 * sostiene la conclusión de que diferir el JS no es la palanca.
 */
export function veredictoDelTecho(cargas: readonly Lectura[], sinChunks: readonly Lectura[]): string {
  const f = (xs: readonly Lectura[]): number[] => xs.map((c) => c.fcpMs ?? 0)
  const techo = mediana(f(cargas)) - mediana(f(sinChunks))
  const dispersion = Math.max(
    Math.max(...f(cargas)) - Math.min(...f(cargas)),
    Math.max(...f(sinChunks)) - Math.min(...f(sinChunks)),
  )
  return Math.abs(techo) < dispersion / 2
    ? `INDISTINGUIBLE DE CERO con n=${cargas.length}: el techo mide ${dos(techo)} ms y la dispersión de un solo brazo llega a ${dos(dispersion)} ms. Diferir el JS no es la palanca del FCP, y ésta es la forma honesta de decirlo`
    : `${dos(techo)} ms, separado del ruido (dispersión máxima de un brazo: ${dos(dispersion)} ms)`
}
