/**
 * EL MODELO DE ALTO DE `por-que-develop` — el instrumento de §8, arreglado.
 *
 * ═══ POR QUÉ EXISTE: EL ÁRBITRO ESTABA CIEGO ══════════════════════════════
 *
 * B1 midió que la sección se pasaba de su pantalla y bajó
 * `ALTO_MINIMO_DEL_BLOQUE_SVH` de 55 a 50; B2 volvió a medir y encontró que
 * **seguía pasándose 23,70 px a 1440×900** (923,70 en una ventana de 900), y
 * además que **el modelo de P5 de `s7-por-que-develop.invariant` §8 no podía
 * ver el defecto**: derivaba el alto del bloque de `ALTO_MINIMO_DEL_BLOQUE_SVH`
 * —o sea del PISO declarado, 450 px— cuando el bloque renderiza el mayor entre
 * su piso y su contenido, y su contenido medía **475,19**.
 *
 * Las consecuencias de esa ceguera, las dos:
 *
 *   · **subestimaba el bloque en 25,19 px**, que es más que el desborde entero;
 *   · y por lo tanto un modelo de la sección alimentado con ese número daba
 *     **898,52 px** —o sea *entra*— para una sección que medía 923,70. El
 *     instrumento decía verde sobre el defecto que había que arreglar.
 *
 * ⚠️ **La cifra de B2 —«subestima el defecto en un 50 %»— NO se reproduce, y se
 * declara** (regla 11: toda cifra con su instrumento). Contra el bloque real la
 * subestimación es de 25,19 px sobre 475,19, o sea el **5,30 %**; contra el
 * desborde de 23,70 px la ceguera es del **100 %**, porque el modelo no lo veía
 * en absoluto. Ninguna de las dos da 50. Lo que sí se sostiene, y es lo que
 * importaba, es la conclusión: **el árbitro subestimaba y por eso no podía
 * arbitrar.**
 *
 * ── Qué es un modelo acá, y qué NO ────────────────────────────────────────
 *
 * Un invariante no hace layout: no puede saber en cuántas líneas cae un titular
 * ni cuánto mide una tarjeta. Así que las piezas que dependen del texto entran
 * **MEDIDAS**, con su instrumento y su fecha, y las que son estructura entran
 * **derivadas de los tokens**, leídas del tema. La tabla de abajo dice cuál es
 * cuál, pieza por pieza, para que nadie confunda una medición con una cuenta.
 *
 * Es la misma forma que `s10-mobile` usa para el ancho de la pastilla: un
 * modelo con sus entradas declaradas, que se puede discutir número por número.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { tokenPx } from '../../_lib/__tests__/s10-css'
import { rangoDeScroll, rangoDegenerado } from '../../_lib/motion/anclas'
import { PATRONES } from '../../_lib/motion/patrones'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { ALTO_MINIMO_DEL_BLOQUE, ALTO_MINIMO_DEL_BLOQUE_SVH } from './contenido'

/** El viewport de la medición de la referencia: 1440×900. */
export const ANCHO = 1440
export const VIEWPORT = 900

/** El piso duro de P5: abajo de esto su rango sale negativo y el patrón se lee
 *  como un salto. No es una elección, es dónde `alto − 0,4·viewport` da cero. */
export const PISO_DE_P5_SVH = 40

export type OrigenDeLaPieza = 'medido' | 'token'

export interface PiezaDelAlto {
  readonly nombre: string
  readonly px: number
  readonly origen: OrigenDeLaPieza
}

/**
 * LAS PIEZAS MEDIDAS, a 1440×900, con scroll real y la receta de
 * `docs/rediseno/MEDICION-NAVEGADOR.md` (puerto 3001, `visibilityState`
 * verificado, `dpr` 1). Son las que dependen del texto y del corte de línea, o
 * sea las que ningún render de servidor puede computar.
 */
export const MEDIDO = {
  /** El rótulo de la columna lateral: `data-panel` → primer hijo de la caja. */
  rotulo: 11,
  /** El titular en cuatro líneas, con su `pt` de despeje de la pastilla. */
  titular: 276.13,
  /** La bajada, acotada a 2 de 3 de la medida. */
  bajada: 65.39,
  /**
   * Lo que la lista de P5 mide POR SU CONTENIDO, sin el piso.
   *
   * ⚠ **Es la entrada que el modelo viejo no tenía**, y la que hace que sea un
   * árbitro. Los dos valores, con la misma medición:
   *
   *     antes de B4-A   475,19   sangría de la tarjeta en `--spacing-4`
   *     después         443,20   sangría en `--spacing-2` (4 × 8 px menos)
   */
  bloqueAntes: 475.19,
  bloqueDespues: 443.2,
} as const

/** Las costuras del apilado: `pt`, `pb` y los tres `gap` entre las cuatro
 *  piezas. Salen de los tokens del tema, no de un número escrito. */
export function estructura(): PiezaDelAlto[] {
  const costura = tokenPx('--spacing-4', ANCHO)
  return [
    { nombre: 'relleno de arriba (--spacing-4)', px: costura, origen: 'token' },
    { nombre: 'relleno de abajo (--spacing-8)', px: tokenPx('--spacing-8', ANCHO), origen: 'token' },
    { nombre: 'tres costuras (--spacing-4)', px: 3 * costura, origen: 'token' },
  ]
}

/** El piso del bloque de P5, en píxeles a este viewport. */
export const pisoDelBloque = (): number => (VIEWPORT * ALTO_MINIMO_DEL_BLOQUE_SVH) / 100

/**
 * EL ALTO DE LA SECCIÓN, modelado. El bloque de P5 aporta **el mayor entre su
 * piso y su contenido** — que es lo que `min-height` hace y lo que el modelo
 * viejo no miraba.
 */
export function altoModelado(contenidoDelBloque: number): PiezaDelAlto[] {
  return [
    ...estructura(),
    { nombre: 'rótulo', px: MEDIDO.rotulo, origen: 'medido' },
    { nombre: 'titular', px: MEDIDO.titular, origen: 'medido' },
    { nombre: 'bajada', px: MEDIDO.bajada, origen: 'medido' },
    {
      nombre: `bloque de P5 (piso ${pisoDelBloque()} · contenido ${contenidoDelBloque})`,
      px: Math.max(pisoDelBloque(), contenidoDelBloque),
      origen: 'medido',
    },
  ]
}

export const sumar = (piezas: readonly PiezaDelAlto[]): number =>
  Math.round(piezas.reduce((n, p) => n + p.px, 0) * 100) / 100

/**
 * §8 DEL INVARIANTE — el rango de P5 y el alto de la sección, con el modelo
 * arreglado. Vive acá y no en el invariante porque ése ya estaba en 300 líneas y
 * porque la comprobación y su aritmética son la misma pieza.
 */
export function afirmarElAltoYElRango(): void {
  titulo('8 · El rango de P5 y el ALTO de la sección — el modelo, arreglado (B4-A)')

  const P5 = PATRONES.P5
  const P1 = PATRONES.P1
  const alto = Math.max(pisoDelBloque(), MEDIDO.bloqueDespues)
  const caja = { topDoc: 5000, alto }
  const rango = rangoDeScroll(P5.anclas, caja, VIEWPORT)

  console.log(`  a un viewport de ${VIEWPORT}px, ${ALTO_MINIMO_DEL_BLOQUE} son ${pisoDelBloque()}px de PISO; el bloque renderiza ${MEDIDO.bloqueDespues}px de contenido, así que mide ${alto}`)
  console.log(`  el ancla de P5 mide alto − 0,4·viewport → rango de ${rango.fin - rango.inicio}px de scroll`)
  console.log(`  EL ALTO QUE HACE FALTA: más de ${PISO_DE_P5_SVH}svh. Por debajo de ahí el rango sale negativo y el patrón se lee como un salto.`)

  afirmar(!rangoDegenerado(P5.anclas, caja, VIEWPORT), `el bloque de ${alto}px no degenera`)
  afirmarIgual(rango.fin - rango.inicio, alto - 0.4 * VIEWPORT, 'y el rango es exactamente `alto − 0,4·viewport`')
  afirmar(!rangoDegenerado(P1.anclas, { topDoc: 5000, alto: 120 }, VIEWPORT), 'P1 no puede degenerar: su rango es `alto + 160px`')
  controlPositivo('un bloque de 30svh SÍ degenera', { topDoc: 5000, alto: VIEWPORT * 0.3 }, (c: { topDoc: number; alto: number }) => !rangoDegenerado(P5.anclas, c, VIEWPORT))
  controlPositivo(`y uno de exactamente ${PISO_DE_P5_SVH}svh también, porque el rango queda en cero`, { topDoc: 5000, alto: (VIEWPORT * PISO_DE_P5_SVH) / 100 }, (c: { topDoc: number; alto: number }) => !rangoDegenerado(P5.anclas, c, VIEWPORT))

  // ── EL ALTO, que es lo que el modelo viejo no podía arbitrar ──────────────
  const declarado = pantallasDe(seccionDe('por-que-develop')) * VIEWPORT
  const ahora = altoModelado(MEDIDO.bloqueDespues)
  const antes = altoModelado(MEDIDO.bloqueAntes)
  for (const p of ahora) console.log(`    ${p.origen === 'medido' ? '📏' : '🔧'} ${p.nombre.padEnd(46)} ${p.px}`)
  afirmar(
    sumar(ahora) <= declarado,
    `LA SECCIÓN ENTRA EN SU PANTALLA a ${ANCHO}×${VIEWPORT}: ${sumar(ahora)} px modelados contra ${declarado} declarados`,
    `${(declarado - sumar(ahora)).toFixed(2)} px de aire — el mínimo alcanzable sin bajar el piso de P5, que es lo que impide que su rango degenere`,
  )
  afirmar(
    sumar(antes) > declarado,
    `  y el modelo REPRODUCE el defecto que B2 midió: con el bloque de antes da ${sumar(antes)} px`,
    `B2 midió 923,70 en el navegador — 0,01 de redondeo de las tres piezas medidas. El modelo VIEJO daba ${sumar(altoModelado(pisoDelBloque()))} y decía que entraba.`,
  )
  controlPositivo(
    'el modelo viejo —el bloque derivado del PISO en vez del alto real— NO ve el desborde',
    pisoDelBloque(),
    (contenido: number) => sumar(altoModelado(contenido)) > declarado,
  )
}
