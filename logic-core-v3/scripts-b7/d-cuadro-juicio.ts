/**
 * B7 · FRENTE D — CÓMO SE JUZGAN LOS CUADROS DE `d-cuadro-largo.ts`.
 *
 * El tercer archivo del instrumento, y el corte es por naturaleza: en
 * `d-cuadro-lectores.ts` está **lo que corre en el navegador**, acá **lo que
 * convierte marcas de tiempo en una afirmación**, y en `d-cuadro-largo.ts` la
 * corrida y el reporte. Se separó cuando el instrumento pasó las 300 líneas del
 * repo, y quedó mejor: las dos decisiones que deciden el veredicto —cómo se
 * valida el control y cómo se mide la localización— se leen juntas y sin el
 * ruido del manejo del navegador.
 */

import { dos } from './b7-comun'
import type { Barrido } from './d-cuadro-lectores'

/** El umbral de «cuadro largo» de B5: 20 ms. */
export const CUADRO_LARGO_MS = 20
/** Dónde cayó el cuadro largo de B5, en píxeles de documento. */
export const Y_SOSPECHOSO = 10_500
export const VENTANA_SOSPECHOSA_PX = 600

export interface Resumen {
  readonly brazo: string
  readonly corrida: number
  readonly cuadros: number
  readonly fpsMediana: number
  readonly fpsP05: number
  readonly fpsMinimo: number
  readonly peorMs: number
  readonly indiceDelPeor: number
  readonly yDelPeor: number
  readonly cuadrosLargos: number
  readonly largosCercaDelSospechoso: number
  /** Cuántos cuadros del barrido cayeron DENTRO de la región. Es el denominador. */
  readonly cuadrosEnLaRegion: number
  /** ⚠️ Si el brazo NO pasó por la región, su «0 cerca de y=10.500» no dice nada. */
  readonly visitoElSospechoso: boolean
  /** El hueco en el cuadro donde el control inyecta su bloqueo. `null` si no hay bloqueo. */
  readonly msEnElCuadroDelBloqueo: number | null
  readonly yInicial: number
  readonly yFinal: number
  /** El peor cuadro medido en CUADROS DE PANTALLA perdidos: `peorMs / mediana`. */
  readonly peorEnVsyncs: number
  readonly eventosDeRueda: number | null
  readonly bloqueoInyectadoEnElCuadro: number | null
}

/** Las MISMAS tres cifras de B4-B y de B5 (mediana, p05, mínimo), derivadas acá. */
export function resumir(brazo: string, corrida: number, b: Barrido, eventosDeRueda: number | null): Resumen {
  const dt: number[] = []
  let peor = 0
  let indiceDelPeor = 0
  for (let i = 1; i < b.cuadros.length; i += 1) {
    const d = b.cuadros[i].t - b.cuadros[i - 1].t
    dt.push(d)
    if (d > peor) {
      peor = d
      indiceDelPeor = i
    }
  }
  const ordenado = [...dt].sort((a, b2) => a - b2)
  const medianaMs = ordenado[Math.floor(ordenado.length * 0.5)]
  const fps = (d: number): number => (d > 0 ? 1000 / d : 0)
  const enLaRegion = (y: number): boolean => Math.abs(y - Y_SOSPECHOSO) <= VENTANA_SOSPECHOSA_PX
  const largos = dt.map((d, i) => ({ d, y: b.cuadros[i + 1].y })).filter((x) => x.d > CUADRO_LARGO_MS)
  return {
    brazo,
    corrida,
    cuadros: b.cuadros.length,
    fpsMediana: dos(fps(medianaMs)),
    fpsP05: dos(fps(ordenado[Math.floor(ordenado.length * 0.95)])),
    fpsMinimo: dos(fps(ordenado[ordenado.length - 1])),
    peorMs: dos(peor),
    indiceDelPeor,
    yDelPeor: b.cuadros[indiceDelPeor]?.y ?? -1,
    cuadrosLargos: largos.length,
    largosCercaDelSospechoso: largos.filter((x) => enLaRegion(x.y)).length,
    cuadrosEnLaRegion: b.cuadros.filter((c) => enLaRegion(c.y)).length,
    visitoElSospechoso: b.cuadros.some((c) => enLaRegion(c.y)),
    /**
     * ⚠️ El control NO se juzga por el peor cuadro de la corrida: se juzga por
     * el hueco EN EL CUADRO donde se inyectó. Una corrida ruidosa puede traer un
     * cuadro de 700 ms en cualquier otro lado y dar «lo vio» sin haber visto
     * nada. Pasó, y por eso esta línea existe.
     *
     * ⚠️ Y el índice es `N − 1`, no `N`, y también se pagó: el lector bloquea
     * cuando `marcas.length === N`, o sea **después** de empujar la marca de
     * índice `N − 1`; el hueco aparece entre esa marca y la siguiente, que es
     * `dt[N − 1]` porque `dt[k] = cuadros[k+1].t − cuadros[k].t`. Con `dt[N]` el
     * control leía el cuadro de al lado y reportaba 13,3 ms —o sea un cuadro
     * normal— sobre un bloqueo de 40 ms que sí había ocurrido.
     */
    msEnElCuadroDelBloqueo:
      b.bloqueoInyectadoEnElCuadro === null ? null : dos(dt[b.bloqueoInyectadoEnElCuadro - 1] ?? -1),
    yInicial: b.cuadros[0]?.y ?? -1,
    yFinal: b.cuadros[b.cuadros.length - 1]?.y ?? -1,
    // La mediana ES el período de refresco de la pantalla. Un cuadro «largo» no
    // toma valores continuos: es un múltiplo entero de ese período.
    peorEnVsyncs: dos(peor / medianaMs),
    eventosDeRueda,
    bloqueoInyectadoEnElCuadro: b.bloqueoInyectadoEnElCuadro,
  }
}

export interface Localizacion {
  readonly largos: number
  readonly enLaRegion: number
  readonly esperadosEnLaRegion: number
  readonly corridasConUno: string
  readonly localiza: boolean
}

/**
 * ⚠️ **LA PREGUNTA NO ES «¿HUBO UN CUADRO LARGO EN LA REGIÓN?» SINO «¿HUBO MÁS
 * DE LOS QUE TOCABAN?».**
 *
 * La región son 1.200 px de un recorrido de 15.300, o sea que unos cuantos
 * cuadros largos repartidos al azar caen ahí por pura aritmética. Contar
 * presencias haría que una corrida ruidosa —y las hubo: cuadros sueltos de 93 y
 * de 120 ms, en los dos brazos y en cualquier `y`— «confirmara» una localización
 * que no existe.
 *
 * El denominador correcto es **cuántos CUADROS del barrido cayeron en la
 * región**, que no es la proporción de píxeles: la velocidad no es uniforme y un
 * tramo lento pasa más cuadros ahí. Con eso, lo esperado por azar es
 * `largos × (cuadrosEnLaRegión / cuadros)`, y la localización se afirma sólo si
 * lo observado lo supera con holgura **y** se repite en dos de tres corridas,
 * que es la vara que la propia cifra de B5 declaró.
 */
export function localizacion(fs: readonly Resumen[]): Localizacion {
  const cuadros = fs.reduce((a, f) => a + f.cuadros, 0)
  const enRegion = fs.reduce((a, f) => a + f.cuadrosEnLaRegion, 0)
  const largos = fs.reduce((a, f) => a + f.cuadrosLargos, 0)
  const observados = fs.reduce((a, f) => a + f.largosCercaDelSospechoso, 0)
  const esperados = cuadros === 0 ? 0 : (largos * enRegion) / cuadros
  const corridasConUno = fs.filter((f) => f.largosCercaDelSospechoso > 0).length
  return {
    largos,
    enLaRegion: observados,
    esperadosEnLaRegion: dos(esperados),
    corridasConUno: `${corridasConUno}/${fs.length}`,
    localiza: corridasConUno >= 2 && observados > 2 * esperados && observados >= 2,
  }
}
