/**
 * DE DÓNDE SALE EL PROGRESO — la regla vieja y la nueva, corridas sobre el mismo
 * documento modelado.
 *
 * ── El control es la regla VIEJA, y por eso está escrita acá ───────────────
 *
 * V3-B cambió el denominador del recorrido: era el alto del documento y ahora es
 * la extensión de las secciones. Afirmar *«el progreso de cada sección no se
 * movió»* contra la regla nueva sola sería comparar un número consigo mismo — la
 * afirmación sólo significa algo si al lado corre **la regla que se reemplazó**,
 * sobre el mismo documento, y se ve que ella SÍ se mueve.
 *
 * `REGLA_VIEJA` es por eso una copia deliberada de la fórmula que
 * `anclaje.ts:pantallaDeScroll` tenía antes de V3-B:
 *
 *     pantalla = PANTALLAS_DE_SCROLL × scrollY / (altoDelDocumento − ventana)
 *
 * y está marcada como copia. Es la única duplicación de este lane, y existe
 * porque un control positivo necesita la función equivocada disponible.
 *
 * ── EL DOCUMENTO MODELADO, y por qué el modelo cierra ──────────────────────
 *
 * Las ocho secciones declaran altos en `svh`, así que con una ventana de `V`
 * píxeles el bloque de secciones mide `PANTALLAS_DEL_DOCUMENTO × V`. A 1440×900
 * eso da **12 600 px** y a 375×667 da **9 338 px**, que son exactamente los dos
 * altos de documento que §7.46 publica para hoy: el modelo no se ajusta a la
 * cita, coincide con ella.
 *
 * Lo que se le suma es lo que §7.46 midió que el pie aporta cuando sale de la
 * `<section id="cierre">`: **485 px a 1440 y 746 px a 375**.
 *
 * ── ⚠️ CORRECCIÓN A §7.46 — LA CITA USA UN MODELO LINEAL, Y EL MAPEO NO LO ES ─
 *
 * **Es una corrección a la doctrina, aceptada por el dueño del proyecto al
 * cerrar V3-B, y va con las tres columnas al lado para que se pueda verificar.**
 *
 * §7.46 publica que el progreso del diferencial pasaría de 0,750 a **0,7201** a
 * 1440×900 y a **0,6906** a 375×667. Esos dos números salen de escalar el
 * PROGRESO por la razón de recorridos —`0,750 × (12 600 − 900) / (13 085 − 900)`
 * da 0,72015— o sea de suponer que el mapeo del scroll al progreso es **una
 * recta única**. No lo es desde SITIO-S9: es una **recta POR TRAMOS** sobre los
 * nudos del anclaje, y en el segmento donde cae el diferencial el ritmo local es
 * ×0,2 del compuesto, así que un corrimiento en pantallas se traduce a mucho
 * menos progreso del que la recta única predice.
 *
 * Corrida de verdad —componiendo `REGLA_VIEJA` con `progresoDePantalla`, que es
 * lo que se despachaba— la regla vieja da **0,7381** y **0,7262**.
 *
 *   | 1440×900, pie afuera | 375×667, pie afuera |
 *   | 0,750 → **0,7381**   | 0,750 → **0,7262**  |  ← la regla vieja, corrida
 *   | 0,750 → 0,7201       | 0,750 → 0,6906      |  ← lo que publica §7.46
 *   | 0,750 → **0,7500**   | 0,750 → **0,7500**  |  ← la regla nueva
 *
 * **El defecto es el mismo y sigue siendo real** —la regla vieja corre el
 * anclaje y la nueva no—; lo que cambia es su tamaño: **0,0119 y 0,0238 de
 * progreso, la mitad de lo publicado**. Se corrige la cifra, no la conclusión. Y
 * las tres columnas se imprimen juntas porque una cifra publicada que no se
 * reproduce es exactamente lo que este repo viene cazando.
 */

import { ANCLAJE } from '../anclaje'
import { PANTALLAS_DEL_DOCUMENTO, PANTALLAS_DE_SCROLL, progresoDePantalla, progresoDelScroll } from '../recorrido'

/**
 * ⚠ **COPIA DELIBERADA DE LA FÓRMULA QUE V3-B REEMPLAZÓ.** No se importa porque
 * ya no existe; no se borra porque es el control. Ver la cabecera.
 */
export function REGLA_VIEJA(scrollY: number, altoDelDocumento: number, altoDeLaVentana: number): number {
  const recorrido = altoDelDocumento - altoDeLaVentana
  if (!(recorrido > 0)) return 0
  const fraccion = scrollY / recorrido
  const acotada = fraccion < 0 ? 0 : fraccion > 1 ? 1 : fraccion
  return acotada * PANTALLAS_DE_SCROLL
}

/** La regla vieja compuesta con el mapeo real: el progreso que se despachaba. */
export function progresoViejo(scrollY: number, altoDelDocumento: number, altoDeLaVentana: number): number {
  return progresoDePantalla(REGLA_VIEJA(scrollY, altoDelDocumento, altoDeLaVentana))
}

/**
 * El progreso según la aproximación LINEAL con la que se escribió §7.46: se
 * escala el progreso de hoy por la razón de recorridos. Se conserva para poder
 * mostrar de dónde salen el 0,7201 y el 0,6906, no porque describa el mapeo.
 */
export function progresoDeLaCita(
  progresoDeHoy: number,
  documentoDeHoy: number,
  documentoConElPie: number,
  altoDeLaVentana: number,
): number {
  return (
    (progresoDeHoy * (documentoDeHoy - altoDeLaVentana)) / (documentoConElPie - altoDeLaVentana)
  )
}

/** Un caso del modelo: una ventana y lo que el pie le suma al documento. */
export interface CasoDeDocumento {
  readonly etiqueta: string
  readonly ventana: number
  /** Lo que el pie suma al documento por fuera de la tabla, medido en §7.46. */
  readonly pieAfuera: number
  /** El alto del bloque de las ocho: `PANTALLAS_DEL_DOCUMENTO × ventana`. */
  readonly secciones: number
  /** El documento con el pie afuera. */
  readonly documento: number
}

function caso(etiqueta: string, ventana: number, pieAfuera: number): CasoDeDocumento {
  const secciones = PANTALLAS_DEL_DOCUMENTO * ventana
  return { etiqueta, ventana, pieAfuera, secciones, documento: secciones + pieAfuera }
}

/**
 * LOS TRES CASOS. El primero es el documento de HOY —nada por fuera de la
 * tabla—, y los otros dos son los que §7.46 midió con el pie afuera.
 */
export const CASOS: readonly CasoDeDocumento[] = [
  caso('1440×900 · hoy', 900, 0),
  caso('1440×900 · pie afuera', 900, 485),
  caso('375×667 · pie afuera', 667, 746),
]

export interface FilaDeSeccion {
  readonly id: string
  /** El scroll en el que la sección empieza a llenar el cuadro. */
  readonly scrollY: number
  readonly conLaReglaVieja: number
  readonly conLaReglaNueva: number
  readonly deLaCita: number
}

/**
 * QUÉ PROGRESO LE TOCA A CADA SECCIÓN, con las dos reglas, en un caso.
 *
 * El `scrollY` de cada sección sale de su geometría —`desdePantalla × ventana`—
 * y **no depende de dónde esté el pie**: el pie se suma DESPUÉS de las ocho, así
 * que ninguna sección se corre por él. Eso es justamente lo que hace la
 * comparación limpia — el mismo scroll, dos reglas.
 */
export function tablaDeSecciones(c: CasoDeDocumento): readonly FilaDeSeccion[] {
  return ANCLAJE.geometria.map((g): FilaDeSeccion => {
    const scrollY = g.desdePantalla * c.ventana
    const hoy = progresoDePantalla(g.desdePantalla)
    return {
      id: g.id,
      scrollY,
      conLaReglaVieja: progresoViejo(scrollY, c.documento, c.ventana),
      conLaReglaNueva: progresoDelScroll(scrollY, 0, c.secciones, c.ventana),
      deLaCita: progresoDeLaCita(hoy, c.secciones, c.documento, c.ventana),
    }
  })
}

/** El corrimiento más grande de una tabla, con la sección en la que cae. */
export function mayorCorrimiento(
  filas: readonly FilaDeSeccion[],
  leer: (f: FilaDeSeccion) => number,
): { readonly id: string; readonly delta: number } {
  let peor = { id: '', delta: 0 }
  for (const f of filas) {
    const hoy = progresoDePantalla(
      ANCLAJE.geometria.find((g) => g.id === f.id)?.desdePantalla ?? 0,
    )
    const delta = Math.abs(leer(f) - hoy)
    if (delta > peor.delta) peor = { id: f.id, delta }
  }
  return peor
}

export function lineasDeUnCaso(c: CasoDeDocumento): readonly string[] {
  const filas = tablaDeSecciones(c)
  return [
    `${c.etiqueta} — secciones ${c.secciones} px · documento ${c.documento} px (pie afuera: +${c.pieAfuera})`,
    '  sección           scrollY     hoy     regla VIEJA   regla NUEVA   cita de §7.46',
    ...filas.map((f) => {
      const hoy = progresoDePantalla(
        ANCLAJE.geometria.find((g) => g.id === f.id)?.desdePantalla ?? 0,
      )
      return (
        `  ${f.id.padEnd(16)} ${String(f.scrollY).padStart(6)}   ${hoy.toFixed(4)}   ` +
        `${f.conLaReglaVieja.toFixed(4)}        ${f.conLaReglaNueva.toFixed(4)}        ${f.deLaCita.toFixed(4)}`
      )
    }),
  ]
}
