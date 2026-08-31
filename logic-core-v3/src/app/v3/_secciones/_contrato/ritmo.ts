/**
 * EL RITMO — pantallas y momentos, como cuenta y no como prosa.
 *
 * ── Qué es un momento, y por qué no es una pantalla ───────────────────────
 *
 * SCROLL.md §6: `momentos = pantallas − pantallas pinneadas + secuencias`.
 *
 * ⚠ **Es una regla ELEGIDA, no una medición** —lo dice el propio SCROLL.md—.
 * Lo medido son las pantallas y los tramos pinneados; el mapeo a momentos es la
 * lectura. Se usa la misma regla que la referencia para que los dos números se
 * puedan comparar; con otra regla, ninguno de los dos significaría nada.
 *
 * ═══ LA DIVERGENCIA ENTRE LOS DOS CONTRATOS, Y QUIÉN TENÍA RAZÓN ══════════
 *
 * Los dos lanes escribieron esta cuenta y **no dan el mismo número**, porque
 * entendieron distinto qué son las "pantallas pinneadas":
 *
 *   · el lane A contaba **la sección entera**: Trabajos son 300svh, o sea 3;
 *   · el lane B contaba **el recorrido del pin**: 300svh de sección menos la
 *     pantalla del hijo `sticky`, o sea 2.
 *
 * **Gana el lane B, y no por criterio sino porque es lo que la referencia
 * midió.** SCROLL.md §4 publica la fórmula con la que se sacó el número:
 *
 *     inicioPegado = topDoc(elemento) − top
 *     finPegado    = topDoc(contenedor) + alto(contenedor) − alto(elemento) − top
 *     rangoPegado  = finPegado − inicioPegado
 *
 * o sea `alto del contenedor − alto del elemento pegado`. Con el `sticky` de
 * `h-svh` que emite `Seccion.tsx`, eso es exactamente `pantallas − 1`.
 *
 * El caso que lo confirma es `case@1440`, el más extremo de la tabla: 13,81
 * pantallas nominales, **11,40 pinneadas**, 1 secuencia → 3,4 momentos. Con la
 * lectura del lane A las pinneadas habrían sido las del contenedor entero y el
 * número no habría cerrado.
 *
 * **Consecuencia sobre las cifras publicadas:** el ritmo del lane A pasa de 5 a
 * 6 momentos, y el de las ocho cambia con él. No es que el sitio haya cambiado:
 * es que una de las dos cuentas estaba mal, y ésta es la corrección.
 *
 * ── Por qué esto es un módulo y no un párrafo del reporte ─────────────────
 *
 * Regla 11 del proyecto: *una cifra que se publica en un reporte y no tiene
 * instrumento que la produzca es prosa, no medición.* "El home tiene N
 * momentos" es exactamente esa clase de cifra. Acá está la función que la
 * produce, leyendo la misma tabla que le da el alto a cada panel — y su control
 * es que reproduce los 20,5 momentos que la referencia publicó para su home.
 */

import type { Seccion } from '../../_lib/secciones'

import { pantallasDe } from './forma'

/**
 * El hijo `sticky` de una sección pinneada mide UNA pantalla.
 *
 * No es una convención: es la clase que `Seccion.tsx` emite (`h-svh`) para las
 * dos secciones pinneadas del sitio, y `s7-ritmo` la afirma sobre el marcado
 * renderizado en vez de confiar en esta constante. Un pin cuyo hijo midiera
 * otra cosa haría que esta cuenta mintiera sin que nada fallara.
 */
export const PANTALLAS_DEL_STICKY = 1

export interface Ritmo {
  /** Pantallas nominales: la suma de los altos declarados, en viewports. */
  readonly pantallas: number
  /**
   * Las que consume el PIN: por sección pinneada, su alto menos la pantalla del
   * hijo pegado.
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

/** Lo que el pin de UNA sección consume, o 0 si no está pinneada. */
export function pantallasPinneadasDe(seccion: Seccion): number {
  if (seccion.pinneada === undefined) return 0
  return Math.max(0, pantallasDe(seccion) - PANTALLAS_DEL_STICKY)
}

/**
 * El ritmo de un tramo del recorrido.
 *
 * Recibe la lista y no la lee de `SECCIONES` a propósito: así se puede pedir el
 * de las ocho del sitio, el de un tramo, o el de una lista sintética que sirva
 * de control positivo.
 */
export function ritmoDe(secciones: readonly Seccion[]): Ritmo {
  const pantallas = secciones.reduce((n, s) => n + pantallasDe(s), 0)
  const pinneadas = secciones.filter((s) => s.pinneada !== undefined)
  const pantallasPinneadas = secciones.reduce((n, s) => n + pantallasPinneadasDe(s), 0)
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
  fuente: 's0/SCROLL.md §6 — home @1440, viewport 900',
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
