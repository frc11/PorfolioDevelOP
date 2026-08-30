/**
 * EL RITMO — pantallas y momentos, como cuenta y no como prosa.
 *
 * ── Qué es un momento, y por qué no es una pantalla ────────────────────────
 *
 * SCROLL.md §6: `momentos = pantallas − pantallas pinneadas + secuencias`.
 * Cada secuencia pinneada cuenta como **UN** momento en lugar de las N
 * pantallas que consume, porque el visitante no percibe N pantallas: percibe
 * una escena que dura.
 *
 * ⚠ **Es una regla ELEGIDA, no una medición** —lo dice el propio SCROLL.md—.
 * Lo medido son las pantallas y los tramos pinneados; el mapeo de una secuencia
 * a un momento es la lectura. Se usa la misma regla que la referencia para que
 * los dos números se puedan comparar; con otra regla, ninguno de los dos
 * significaría nada.
 *
 * ── Por qué esto es un módulo y no un párrafo del reporte ──────────────────
 *
 * Regla 11 del proyecto: *una cifra que se publica en un reporte y no tiene
 * instrumento que la produzca es prosa, no medición.* "Nuestro lane tiene N
 * momentos" es exactamente esa clase de cifra. Acá está la función que la
 * produce, leyendo la misma tabla que le da el alto a cada panel — y su control
 * es que reproduce los 20,5 momentos que la referencia publicó para su home.
 */

import type { Seccion } from '../../_lib/secciones'

import { pantallasDe } from './forma'

export interface Ritmo {
  /** Pantallas nominales: la suma de los altos declarados, en unidades de viewport. */
  readonly pantallas: number
  /**
   * Las que consumen las secuencias pinneadas.
   *
   * ⚠ Cuenta las DOS formas de pinneo —`siempre` y `desde-escritorio`— porque
   * el ritmo que esta cuenta produce es **el de escritorio**, que es donde las
   * dos se comportan igual y donde la referencia midió los suyos. SCROLL.md
   * publica el ritmo de 1440 y el de 390 por separado, y con razón: a 390 su
   * home pasa de 20,5 momentos a 21,2 porque casi no le queda pinneo. El
   * nuestro abajo de 1025 es otro número, y no se mezcla con éste.
   */
  readonly pantallasPinneadas: number
  /** Cuántas secuencias pinneadas hay. */
  readonly secuencias: number
  /** `pantallas − pinneadas + secuencias`, con un decimal. */
  readonly momentos: number
}

/** Un decimal, que es la precisión con la que la referencia publicó los suyos. */
const unDecimal = (n: number): number => Math.round(n * 10) / 10

export function momentosDe(
  pantallas: number,
  pantallasPinneadas: number,
  secuencias: number,
): number {
  return unDecimal(pantallas - pantallasPinneadas + secuencias)
}

/**
 * El ritmo de un tramo del recorrido.
 *
 * Recibe la lista y no la lee de `SECCIONES` a propósito: así se puede pedir el
 * de las cuatro de este lane, el de las ocho del sitio, o el de una lista
 * sintética que sirva de control positivo.
 */
export function ritmoDe(secciones: readonly Seccion[]): Ritmo {
  const pantallas = secciones.reduce((n, s) => n + pantallasDe(s), 0)
  const pinneadas = secciones.filter((s) => s.pinneada !== undefined)
  const pantallasPinneadas = pinneadas.reduce((n, s) => n + pantallasDe(s), 0)
  return {
    pantallas: unDecimal(pantallas),
    pantallasPinneadas: unDecimal(pantallasPinneadas),
    secuencias: pinneadas.length,
    momentos: momentosDe(pantallas, pantallasPinneadas, pinneadas.length),
  }
}

/**
 * LA REFERENCIA — `home` a 1440, tal como la publicó SCROLL.md §6.
 *
 * Es el control externo de la cuenta: si `momentosDe` no reprodujera estos
 * 20,5 a partir de estas tres entradas, no estaría calculando lo que dice.
 * No es nuestro objetivo ni nuestro techo — es la vara contra la que se lee
 * nuestro número.
 */
export const RITMO_DE_LA_REFERENCIA = {
  pantallas: 23.47,
  pantallasPinneadas: 5.01,
  secuencias: 2,
  momentos: 20.5,
} as const

/**
 * Cuánto comprime un recorrido: momentos sobre pantallas.
 *
 * La referencia comprime poco en su home (0,87) y muchísimo en una página de
 * caso (3,4 momentos sobre 13,8 pantallas → 0,25). Es la cifra que dice si un
 * tramo se lee como una lista o como una escena.
 */
export function compresionDe(ritmo: Ritmo): number {
  return ritmo.pantallas === 0 ? 1 : Math.round((ritmo.momentos / ritmo.pantallas) * 1000) / 1000
}
