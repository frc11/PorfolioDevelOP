/**
 * EL MAPEO DEL RECORRIDO CONTRA LAS OCHO PANTALLAS REALES — derivado, y
 * **PROVISIONAL**.
 *
 * ⚠️ **ESTE MÓDULO NO CIERRA §7.2 DE `DIRECCION-ESCENA.md`. LA MIDE.**
 *
 * La pregunta *"cómo se ata el recorrido al scroll real"* está declarada
 * ABIERTA desde S9 y sigue abierta: lo que hay acá es el mapeo más conservador
 * que se puede defender —una recta— puesto para que la escena se pueda montar y
 * mirar, más la tabla que muestra por qué la recta no alcanza. **La decisión de
 * composición es del humano.**
 *
 * ── LA CONTRADICCIÓN, con sus dos cifras ───────────────────────────────────
 *
 * `choreography.ts` declara `CHOREO_SCREENS = 8` y compone sus seis tramos
 * sobre múltiplos exactos de 1/8. `_lib/secciones.ts` declara ocho secciones
 * cuyas alturas suman **CATORCE** pantallas. Las dos cifras son datos del repo
 * y este módulo las lee: no hay ninguna escrita a mano acá.
 *
 * Consecuencia directa: el recorrido corre a **8/14 = 0,571** de su ritmo
 * compuesto — cada pantalla de coreografía dura **1,75** pantallas de scroll—.
 * Y hay dos desalineaciones que no son de ritmo sino de contenido:
 *
 *   1. **Los nombres no coinciden.** La coreografía tiene un tramo `demos` que
 *      no es ninguna de las ocho secciones, y las ocho tienen `servicios`,
 *      `tu-panel` y `por qué develOP`, que no son ninguno de los seis tramos.
 *   2. **§2.4 dice que la escena se APAGA después del cierre, entran servicios
 *      y tu panel, y VUELVE para el diferencial.** La coreografía no tiene esa
 *      forma: es monótona de 0 a 1 y su tramo `cierre` es el último.
 *
 * ── EL MAPEO PROVISIONAL: una recta sobre el scroll del documento ──────────
 *
 * `progreso = scrollY / (alto del documento − alto de la ventana)`.
 *
 * Es el más conservador que hay y por eso es el que se elige mientras nadie
 * decida: **es exactamente lo que dice el contrato** —*"el progreso sale del
 * scroll de la página y no de un control"*— sin agregar una sola decisión
 * encima. Es monótono, no deforma ningún tramo, no inventa un punto de anclaje
 * por sección y no toca `CHOREO_SCREENS`, ni los tramos, ni las alturas de la
 * tabla.
 *
 * Lo que cuesta está medido y es el motivo del freno — ver
 * `__tests__/s8-tinta.invariant.ts`: con esta recta, **`por-que-develop` —una
 * de las dos únicas secciones que dejan ver la escena— llena el cuadro en
 * p = 12/13 = 0,923**, que cae adentro del tramo `cierre`, donde la sala está
 * en penumbra.
 *
 * ── Por qué la ventana se resta ────────────────────────────────────────────
 *
 * Porque el scroll de un documento llega hasta `alto − ventana`, no hasta
 * `alto`: normalizar contra el alto entero dejaría el progreso final en
 * 13/14 = 0,929 y el último keyframe del recorrido no se alcanzaría nunca.
 */

import { SECCIONES } from '../secciones'
import { CHOREO_SCREENS, CHOREO_TRAMOS } from './choreography'

/** Una pantalla es `100svh`. La unidad en la que la tabla declara sus altos. */
const SVH_POR_PANTALLA = 100

/**
 * Cuántas pantallas mide un `alto` de la tabla.
 *
 * Tira con una unidad que no sea `svh`: un alto que este módulo no sabe leer es
 * un error del que hay que enterarse, no un cero que se propaga hasta un
 * recorrido mal repartido.
 */
export function pantallasDe(alto: string): number {
  const m = /^(\d+(?:\.\d+)?)svh$/.exec(alto)
  if (m === null) throw new Error(`alto que este módulo no sabe leer: ${alto}`)
  return Number(m[1]) / SVH_POR_PANTALLA
}

/** Las catorce. Derivadas de la tabla, nunca escritas. */
export const PANTALLAS_DEL_DOCUMENTO = SECCIONES.reduce((n, s) => n + pantallasDe(s.alto), 0)

/**
 * El recorrido de scroll: el documento menos la ventana. La ventana vale UNA
 * pantalla por definición de `svh`.
 */
export const PANTALLAS_DE_SCROLL = PANTALLAS_DEL_DOCUMENTO - 1

/**
 * Cuánto se estira el recorrido, con las DOS lecturas — porque difieren y la
 * diferencia es exactamente una pantalla.
 *
 * `ESTIRAMIENTO_DE_DOCUMENTO` compara alto contra alto: 14 pantallas de tabla
 * contra las 8 que la coreografía declara.
 * `ESTIRAMIENTO_DE_SCROLL` compara recorrido contra recorrido: las 13 pantallas
 * que el documento efectivamente scrollea contra esas mismas 8.
 *
 * ⚠ Cuál de las dos es "la" cifra depende de si las 8 pantallas de
 * `CHOREO_SCREENS` son 8 de documento o 8 de scroll, y **`choreography.ts` no
 * lo dice**. Se publican las dos en vez de elegir: la ambigüedad es del dato,
 * no de la cuenta, y esconderla adentro de un número sería inventar la decisión
 * que este módulo existe para no tomar.
 */
export const ESTIRAMIENTO_DE_DOCUMENTO = PANTALLAS_DEL_DOCUMENTO / CHOREO_SCREENS
export const ESTIRAMIENTO_DE_SCROLL = PANTALLAS_DE_SCROLL / CHOREO_SCREENS

/** Lo que le toca a una sección del recorrido, con el mapeo provisional. */
export type TramoDeSeccion = {
  readonly id: string
  /** Pantallas de scroll acumuladas antes de esta sección. */
  readonly desdePantalla: number
  readonly altoEnPantallas: number
  /** Progreso en el que el borde de arriba de la sección toca el de la ventana. */
  readonly llenaDesde: number
  /** Progreso en el que el borde de abajo lo toca. Con altos de 1 pantalla, igual al anterior. */
  readonly llenaHasta: number
  /** Progreso en el que la sección **empieza a verse** (entra por abajo). */
  readonly seVeDesde: number
  /** Progreso en el que **deja de verse** (sale por arriba). */
  readonly seVeHasta: number
  /** Si esta sección deja ver la escena. Sale de la tabla, no de acá. */
  readonly dejaVerLaEscena: boolean
}

const acotar01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * La tabla, derivada. Ocho filas, una por sección, en el orden del recorrido.
 *
 * `llena` es el intervalo en el que la sección ocupa la ventana entera —su
 * borde de arriba ya pasó y el de abajo todavía no—; `seVe` es el intervalo en
 * el que aparece en pantalla aunque sea parcialmente. Los dos hacen falta: el
 * primero dice qué pose le toca a la sección, el segundo dice sobre qué rango
 * de la escena tiene que ser legible su texto.
 */
export const MAPEO_PROVISIONAL: readonly TramoDeSeccion[] = (() => {
  const filas: TramoDeSeccion[] = []
  let acumulado = 0
  for (const seccion of SECCIONES) {
    const alto = pantallasDe(seccion.alto)
    filas.push({
      id: seccion.id,
      desdePantalla: acumulado,
      altoEnPantallas: alto,
      llenaDesde: acotar01(acumulado / PANTALLAS_DE_SCROLL),
      llenaHasta: acotar01((acumulado + alto - 1) / PANTALLAS_DE_SCROLL),
      seVeDesde: acotar01((acumulado - 1) / PANTALLAS_DE_SCROLL),
      seVeHasta: acotar01((acumulado + alto) / PANTALLAS_DE_SCROLL),
      dejaVerLaEscena: seccion.superficie === 'papel-transparente',
    })
    acumulado += alto
  }
  return filas
})()

/** Qué tramo de la coreografía le toca a un progreso. `-1` si ninguno. */
export function tramoEn(progreso: number): string {
  const tramo = CHOREO_TRAMOS.find((t) => progreso >= t.from && progreso <= t.to)
  return tramo?.name ?? 'ninguno'
}

/**
 * El progreso del recorrido a partir del scroll de la página.
 *
 * ⚠ **Los tres argumentos entran; no se leen de `window` acá.** Es lo que
 * permite que el invariante corra la MISMA función sin DOM, y es además la
 * mitad de la lección de `CLAUDE.md` sobre medir scroll con la pestaña oculta:
 * quien llama es el que tiene que decidir si sus números valen.
 *
 * Con un documento que no scrollea —o con la pestaña oculta, donde el alto da
 * cero— devuelve 0, que es la pose del hero: el lado seguro.
 */
export function progresoDelScroll(
  scrollY: number,
  altoDelDocumento: number,
  altoDeLaVentana: number,
): number {
  const recorrido = altoDelDocumento - altoDeLaVentana
  if (!(recorrido > 0)) return 0
  return acotar01(scrollY / recorrido)
}
