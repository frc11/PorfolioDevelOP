/**
 * LAS CUATRO SECCIONES DE ESTE LANE — qué son, y de dónde sale su superficie.
 *
 * ── La única frontera real con el lane A ───────────────────────────────────
 *
 * `_lib/secciones.ts` tiene las OCHO secciones del sitio y **lo escribe el lane
 * A**. Este lane lo CONSUME y no lo toca: es el único archivo que produciría un
 * conflicto de verdad entre los dos worktrees.
 *
 * De ahí sale una asimetría que hay que declarar y no esconder:
 *
 *   · la superficie de cada sección es **heredada** — la decide el lane A y
 *     viaja en `SECCIONES`;
 *   · la superficie que este lane necesita para diseñar está **acordada** en la
 *     instrucción (§0.2) y vive acá abajo, en `SUPERFICIE_DE_CONTRATO`.
 *
 * Mientras el lane A no aterrice, las dos tablas pueden diferir. La regla 13 del
 * proyecto dice qué hacer con eso: **se afirma lo propio y se publica lo
 * heredado.** Lo propio de este lane es que la ruta LEA la superficie de la
 * tabla en vez de escribirla; eso se afirma. Cuál es el valor de esa superficie
 * hoy es del lane A; eso se publica, con el delta a la vista.
 *
 * ── Por qué las secciones son correctas con cualquiera de las dos ──────────
 *
 * Porque ninguna pinta un color: consumen `bg-fondo`, `text-tinta` y el resto
 * de los tokens, y el bloque `[data-seccion="invertida"]` de `theme-develop.css`
 * los da vuelta solos. Una sección construida así es correcta en las tres
 * superficies por construcción, y el día que el lane A escriba `oscuro-opaco`
 * en Cierre no hay que tocar una línea. Eso es exactamente lo que la
 * arquitectura de S1 compró.
 */

import { SECCIONES, type Seccion } from '../../_lib/secciones'
import type { ModoSuperficie } from '../../_lib/superficies'

/** Las cuatro de este lane, en el orden del recorrido. */
export type IdDeSeccionB = 'servicios' | 'tu-panel' | 'por-que-develop' | 'cierre'

export const ORDEN_DE_SECCIONES_B: readonly IdDeSeccionB[] = [
  'servicios',
  'tu-panel',
  'por-que-develop',
  'cierre',
]

/**
 * La tabla de §0.2 de la instrucción. **No es la fuente de la que renderiza la
 * ruta** — es contra lo que se compara la que sí lo es.
 */
export const SUPERFICIE_DE_CONTRATO: Readonly<Record<IdDeSeccionB, ModoSuperficie>> = {
  servicios: 'papel-opaco',
  'tu-panel': 'papel-opaco',
  'por-que-develop': 'papel-transparente',
  cierre: 'oscuro-opaco',
}

/** El número de sección que la instrucción les da, para el rótulo y el reporte. */
export const NUMERO_DE_CONTRATO: Readonly<Record<IdDeSeccionB, string>> = {
  servicios: '05',
  'tu-panel': '06',
  'por-que-develop': '07',
  cierre: '08',
}

/**
 * La sección tal como la declara `_lib/secciones.ts`. Tira si no está: una
 * sección que este lane construye y la tabla del sitio no conoce es un error de
 * contrato, no un caso a manejar en tiempo de ejecución.
 */
export function seccionDe(id: IdDeSeccionB): Seccion {
  const encontrada = SECCIONES.find((s) => s.id === id)
  if (encontrada === undefined) {
    throw new Error(
      `secciones-b: la sección "${id}" no existe en _lib/secciones.ts. ` +
        'Ese archivo lo escribe el lane A y este lane no lo toca.',
    )
  }
  return encontrada
}

/** Las cuatro, en orden, leídas de la tabla del sitio. */
export function seccionesDelLane(): readonly Seccion[] {
  return ORDEN_DE_SECCIONES_B.map(seccionDe)
}

export interface DivergenciaDeSuperficie {
  readonly id: IdDeSeccionB
  readonly contrato: ModoSuperficie
  readonly enLaTabla: ModoSuperficie
}

/**
 * Dónde difiere hoy la tabla del sitio de la tabla acordada.
 *
 * Devuelve la lista y no un booleano a propósito: "hay 2 divergencias" no dice
 * cuáles, y lo que hay que poder leer en el reporte es la fila.
 */
export function divergenciasDeSuperficie(): readonly DivergenciaDeSuperficie[] {
  return ORDEN_DE_SECCIONES_B.map((id) => ({
    id,
    contrato: SUPERFICIE_DE_CONTRATO[id],
    enLaTabla: seccionDe(id).superficie,
  })).filter((fila) => fila.contrato !== fila.enLaTabla)
}

/**
 * El ritmo declarado de este lane, derivado de las alturas de la tabla.
 *
 * `momentos = pantallas − pantallas pinneadas + secuencias`, que es la regla de
 * `SCROLL.md` §6. **Es una regla elegida, no una medición** — el propio SCROLL.md
 * lo declara así — y acá se hereda tal cual para poder comparar contra su
 * número. Lo medido allá son las pantallas y los tramos.
 *
 * ⚠️ La altura es un `min-height`: el contenido puede pasarla. Esta cuenta es la
 * del recorrido DECLARADO, y el reporte tiene que decir eso.
 */
export interface RitmoDeSeccion {
  readonly id: IdDeSeccionB
  readonly pantallas: number
  readonly pantallasPinneadas: number
  readonly secuencias: number
  readonly momentos: number
}

const RE_SVH = /^(\d+(?:[.,]\d+)?)svh$/

/** `'300svh'` → 3. Tira con cualquier otra unidad: no se adivina un alto. */
export function pantallasDe(alto: string): number {
  const m = RE_SVH.exec(alto.trim())
  if (m === null) {
    throw new Error(`secciones-b: el alto "${alto}" no está en svh y el ritmo no se puede derivar.`)
  }
  return Number.parseFloat(m[1].replace(',', '.')) / 100
}

/**
 * El hijo `sticky` de una sección pinneada mide una pantalla, así que lo pinneado
 * es todo el recorrido menos esa pantalla. Es la misma cuenta que documenta
 * `PanelPinneado`: 300svh de sección con un hijo de 100svh son 200svh de pin.
 */
export const PANTALLAS_DEL_STICKY = 1

export function ritmoDe(id: IdDeSeccionB): RitmoDeSeccion {
  const seccion = seccionDe(id)
  const pantallas = pantallasDe(seccion.alto)
  const pinneada = seccion.pinneada !== undefined
  const pantallasPinneadas = pinneada ? Math.max(0, pantallas - PANTALLAS_DEL_STICKY) : 0
  const secuencias = pinneada ? 1 : 0
  return {
    id,
    pantallas,
    pantallasPinneadas,
    secuencias,
    momentos: pantallas - pantallasPinneadas + secuencias,
  }
}

export interface RitmoDelLane {
  readonly filas: readonly RitmoDeSeccion[]
  readonly pantallas: number
  readonly momentos: number
}

export function ritmoDelLane(): RitmoDelLane {
  const filas = ORDEN_DE_SECCIONES_B.map(ritmoDe)
  return {
    filas,
    pantallas: filas.reduce((n, f) => n + f.pantallas, 0),
    momentos: filas.reduce((n, f) => n + f.momentos, 0),
  }
}

/**
 * El ritmo de la home de la referencia, para tener contra qué comparar.
 * `[medido]` en `s0/SCROLL.md` §6 y `s0/LAYOUT.md` §3.5, a 1440×900.
 *
 * ⚠️ Es la home ENTERA — ocho secciones — contra las CUATRO de este lane. La
 * comparación es parcial por construcción y el reporte tiene que decirlo.
 */
export const RITMO_DE_LA_REFERENCIA = {
  pantallasNominales: 23.47,
  momentosReales: 20.5,
  fuente: 's0/SCROLL.md §6 — home @1440, viewport 900',
} as const
