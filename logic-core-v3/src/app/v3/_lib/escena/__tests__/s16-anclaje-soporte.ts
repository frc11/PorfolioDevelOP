/**
 * LOS DETECTORES Y LOS AGREGADOS DE V3-E · EL ANCLA DECLARADA — funciones puras
 * de sus argumentos, para que el control positivo pueda correr **la misma**
 * contra una entrada rota.
 *
 * ── Por qué este módulo existe, con las DOS razones de siempre ─────────────
 *
 * 1. **La regla de las 300 líneas del repo.** `s16-anclaje.invariant.ts` publica
 *    seis secciones y no entra en un archivo. El corte es el que este directorio
 *    viene usando desde `s9-soporte.ts`: **los detectores y los agregados acá, y
 *    en el invariante quedan las afirmaciones y nada más.**
 * 2. **La razón que no es de tamaño:** un predicado escrito adentro del archivo
 *    que lo usa no se puede probar contra un caso roto sin duplicarlo, y un
 *    predicado duplicado no es el mismo predicado.
 *
 * ⚠ **EL «ANTES» NO ES UNA COPIA ESCRITA A MANO.** `ANCLAJE_HEREDADO` sale de
 * correr `derivarAnclaje` —la función de producción— sobre el reparto real menos
 * la declaración. Es lo que permite decir «esto se movió y esto no» sin que el
 * antes pueda desincronizarse del después.
 */

import { CHOREO_TRAMOS } from '../choreography'
import { SECCIONES } from '../../secciones'
import { ANCLAJE, TRAMOS_ANCLADOS } from '../anclaje'
import { cierreCorridoPorElAncla, derivarAnclaje, type Anclaje, type TramoAnclado } from '../anclajeDerivacion'
import { PANTALLAS_DE_SCROLL, progresoEnNudos } from '../recorrido'
import { CAJAS_DEL_DIFERENCIAL, limpioDesde } from './s13b-diferencial'
import { barridoVertical, muestra } from './s10-logo-lectura'

/** El reparto real menos la perilla: el anclaje que V3-E heredó, derivado. */
export const SIN_DECLARACION: readonly TramoAnclado[] = TRAMOS_ANCLADOS.map((t) => ({
  tramo: t.tramo,
  secciones: t.secciones,
}))
export const ANCLAJE_HEREDADO: Anclaje = derivarAnclaje(SECCIONES, CHOREO_TRAMOS, SIN_DECLARACION)

/** El índice del tramo que declara su ancla, y el valor. No se escriben dos veces. */
export const I_DECLARADO = TRAMOS_ANCLADOS.findIndex((t) => t.ancla !== undefined)
export const DECLARADA = TRAMOS_ANCLADOS[I_DECLARADO]?.ancla ?? Number.NaN

/** El progreso en el que una sección llena el cuadro, en el anclaje que se le pase. */
export function anclaDe(a: Anclaje, id: string): number {
  const g = a.geometria.find((f) => f.id === id)
  if (g === undefined) throw new Error(`sin geometría para "${id}"`)
  return progresoEnNudos(a.nudos, g.desdePantalla)
}

/**
 * LA GRILLA DEL BARRIDO DE MONOTONÍA — el rango entero, no tres muestras.
 *
 * Paso fijo sobre las trece pantallas **más los nudos con su entorno inmediato**:
 * el nudo que la declaración corre no cae en ninguna grilla regular —su pantalla
 * es irracional— y es el único punto nuevo del mapeo. Se deduplica porque los
 * nudos enteros ya están en la grilla y una muestra repetida haría fallar
 * «estrictamente creciente» sin que el mapeo tenga nada malo.
 */
export function pantallasDelBarrido(paso = 0.001): readonly number[] {
  const entorno = [-1e-6, -1e-9, 0, 1e-9, 1e-6]
  const todas = [
    ...Array.from({ length: Math.round(PANTALLAS_DE_SCROLL / paso) + 1 }, (_, i) => i * paso),
    ...ANCLAJE.nudos.flatMap((n) => entorno.map((d) => n.pantalla + d)),
  ]
    .filter((p) => p >= 0 && p <= PANTALLAS_DE_SCROLL)
    .sort((a, b) => a - b)
  return todas.filter((p, i) => i === 0 || p !== todas[i - 1])
}

/** Estrictamente creciente. Un empate no alcanza: el progreso no se estanca. */
export function creceEstrictamente(valores: readonly number[]): boolean {
  return valores.every((v, i) => i === 0 || v > valores[i - 1])
}

/** El error máximo de la vuelta `x → ida → vuelta → x`, con las dos funciones por argumento. */
export function errorDeLaVuelta(
  ida: (x: number) => number,
  vuelta: (y: number) => number,
  muestras: readonly number[],
): number {
  return Math.max(...muestras.map((x) => Math.abs(vuelta(ida(x)) - x)))
}

/** La superposición mínima del titular con la rejilla de PUBLICACIÓN (300 × 220). */
export function superposicionFina(caja: (typeof CAJAS_DEL_DIFERENCIAL)[number], progreso: number): number {
  return barridoVertical(muestra(progreso, caja.ventana.aspecto), caja.x0, caja.x1, caja.alto, 100).minima
}

/**
 * EL BORDE DE ABAJO DE LA VENTANA CON EL TITULAR ESCALADO — el escalón medido.
 *
 * El criterio del titular es binario, así que su borde no se desplaza suave: se
 * queda quieto hasta que la caja crece lo suficiente y entonces salta. Se mide
 * sobre el cuadro que manda —el primero de la lista es el más angosto y es el que
 * fija el borde— con la caja escalada por un factor.
 */
export function bordeConTitularEscalado(factor: number): number {
  const base = CAJAS_DEL_DIFERENCIAL[0]
  return limpioDesde({ ...base, alto: base.alto * factor }, 0.625, 1)
}

/** Cuánto se corre el ancla de una sección si el tramo declarara otro valor. */
export function corrimientoDe(id: string, ancla: number): number {
  const otro = derivarAnclaje(
    SECCIONES,
    CHOREO_TRAMOS,
    TRAMOS_ANCLADOS.map((t, i) => (i === I_DECLARADO ? { ...t, ancla } : t)),
  )
  return anclaDe(otro, id) - anclaDe(ANCLAJE_HEREDADO, id)
}

/**
 * LOS CUATRO CASOS QUE LOS GUARDIANES DE LA DECLARACIÓN TIENEN QUE RECHAZAR.
 *
 * Cada uno es una función que **tiene que tirar**. Van juntos y en una tabla
 * porque un guardián que nadie corre contra su caso es un `if` que no se sabe si
 * discrimina, y `controlPositivo` cuenta como fallado el predicado que tira.
 */
export function casosQueElGuardianRechaza(): readonly (readonly [string, () => unknown])[] {
  const tramo = CHOREO_TRAMOS[I_DECLARADO]
  return [
    [
      'un ancla EN EL BORDE del tramo (ahí se hereda, no se declara)',
      () => cierreCorridoPorElAncla(tramo.from, tramo, 12, 13),
    ],
    ['un ancla FUERA del tramo', () => cierreCorridoPorElAncla(tramo.to + 0.01, tramo, 12, 13)],
    ['un tramo SIN pantallas propias', () => cierreCorridoPorElAncla(DECLARADA, tramo, 13, 13)],
    [
      'una declaración en el PRIMER tramo, que no tiene cierre anterior que correr',
      () =>
        derivarAnclaje(
          SECCIONES,
          CHOREO_TRAMOS,
          TRAMOS_ANCLADOS.map((t, i) => (i === 0 ? { ...t, ancla: 0.06 } : t)),
        ),
    ],
  ]
}
