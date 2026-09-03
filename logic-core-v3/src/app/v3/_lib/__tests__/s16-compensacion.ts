/**
 * EL MODELO DE LAS DOS COMPENSACIONES — cap height contra x-height.
 *
 * Vive aparte de `s16-tipografia.invariant.ts` por la regla de las 300 líneas
 * del repo, y el corte es el que ya usan `s10-medida.invariant.ts` +
 * `s10-avance.ts`: **acá está CÓMO se cuenta y allá CUÁNTO dio**, para que un
 * control positivo pueda correr la MISMA función contra una entrada equivocada
 * sin que el arnés viva adentro del archivo que mide.
 *
 * ── La tensión, en una línea ──────────────────────────────────────────────
 *
 * Chivo tiene la x-height de Instrument Sans (511 contra 510) y NO tiene su cap
 * height (686 contra 720). Un solo factor no puede igualar las dos: el que pone
 * la cap en cero se lleva la x a +5,16%. Este archivo resuelve las dos
 * compensaciones, las aplica a los ocho niveles en los cuatro anchos, y publica
 * lo que cada una le hace a la escala. **No decide nada.**
 *
 * ⚠ **ESTO ES UN MODELO, NO UNA MEDICIÓN ÓPTICA.** No hay navegador: se
 * resuelven los tokens declarados con el mismo resolvedor de `s10-css.ts` y se
 * multiplican por un factor derivado de las tablas `OS/2`. Lo que un ojo
 * humano lee sobre la pantalla no sale de acá y este archivo no lo pretende.
 */

import { METRICAS_DE_INSTRUMENT_SANS, NIVELES, NIVELES_TIPOGRAFICOS, type Nivel } from '../tipografia'
import { escalaA, terminosDe } from './s3-banda'
import { leerMetricas } from './s3-woff2'
import { FUENTE_TITULO } from './s10-avance'
import { tokenPx } from './s10-css'
import type { NivelResuelto } from './s10-mobile'

/** Las métricas de Chivo LEÍDAS del binario que /v3 sirve, no citadas. */
export const CHIVO_MEDIDO = leerMetricas(FUENTE_TITULO)

export interface Compensacion {
  readonly metrica: string
  /** Unidades sobre el em de 1000, leídas del `.woff2`. */
  readonly deChivo: number
  /** Las de la familia portadora. [citado] — no hay binario en el repo. */
  readonly deInstrumentSans: number
  /** Lo que habría que multiplicar el px para igualar la métrica. */
  readonly factor: number
  /** Cuánto se desvía Chivo hoy, en por ciento. */
  readonly desvio: number
}

function comparar(metrica: string, deChivo: number, deInstrumentSans: number): Compensacion {
  return {
    metrica,
    deChivo,
    deInstrumentSans,
    factor: deInstrumentSans / deChivo,
    desvio: ((deChivo - deInstrumentSans) / deInstrumentSans) * 100,
  }
}

/** Las dos, derivadas. `cap` primero porque es la que este frente evalúa. */
export const COMPENSACION_DE_CAP: Compensacion = comparar(
  'cap height',
  CHIVO_MEDIDO.capHeight,
  METRICAS_DE_INSTRUMENT_SANS.capHeight,
)
export const COMPENSACION_DE_X: Compensacion = comparar(
  'x-height',
  CHIVO_MEDIDO.xHeight,
  METRICAS_DE_INSTRUMENT_SANS.xHeight,
)
export const COMPENSACIONES: readonly Compensacion[] = [COMPENSACION_DE_CAP, COMPENSACION_DE_X]

/**
 * EL DESVÍO DE LAS DOS MÉTRICAS BAJO UN FACTOR, en por ciento.
 *
 * Es la pieza que hace visible la tensión: con `factor` 1 —lo que el tema hace
 * hoy— da el par (−4,72 · +0,20); con el factor de la cap da (0 · +5,16). Que
 * la suma NO baje es el resultado, y sale de acá, no de un argumento.
 */
export function desviosBajo(factor: number): { cap: number; x: number; peor: number; suma: number } {
  const cap = ((CHIVO_MEDIDO.capHeight * factor - METRICAS_DE_INSTRUMENT_SANS.capHeight) /
    METRICAS_DE_INSTRUMENT_SANS.capHeight) * 100
  const x = ((CHIVO_MEDIDO.xHeight * factor - METRICAS_DE_INSTRUMENT_SANS.xHeight) /
    METRICAS_DE_INSTRUMENT_SANS.xHeight) * 100
  return { cap, x, peor: Math.max(Math.abs(cap), Math.abs(x)), suma: Math.abs(cap) + Math.abs(x) }
}

// ── El alcance ──────────────────────────────────────────────────────────────

export type Alcance = readonly Nivel[]

/**
 * LOS NIVELES DE DISPLAY, DERIVADOS DE LA TABLA Y NO ESCRITOS.
 *
 * El discriminador es el interletrado por defecto: `titulo` es el que
 * `COMPONENTS.md` §2.1 midió sobre los componentes de display, y `texto` el del
 * régimen de lectura. Escribir `['titulo-l','titulo-xl']` a mano habría sido una
 * cardinalidad de las que ya se rompieron tres veces en este proyecto.
 */
export const NIVELES_DE_DISPLAY: Alcance = NIVELES.filter(
  (n) => NIVELES_TIPOGRAFICOS[n].interletrado === 'titulo',
)

export const NINGUNO: Alcance = []
export const LOS_OCHO: Alcance = NIVELES

/** La escala resuelta a un ancho con el factor aplicado sólo dentro del alcance. */
export function escalaCompensadaA(ancho: number, factor: number, alcance: Alcance): NivelResuelto[] {
  return escalaA(ancho).map((n) =>
    alcance.includes(n.nivel) ? { ...n, px: n.px * factor } : n,
  )
}

// ── Los catorce valores declarados ──────────────────────────────────────────

export interface ValorDeclarado {
  readonly donde: string
  readonly px: number
}

/**
 * LOS CATORCE VALORES QUE UNA COMPENSACIÓN TOCARÍA — los ocho tokens fijos y
 * los seis pisos de `clamp()`. **Derivados de la hoja**, no transcritos: es la
 * misma cuenta que `REPORTE-S0.md` §(b) publicó como «se mueven 0 de 14», y
 * reproducirla con el instrumento es lo que la convierte en verificable.
 *
 * Los techos NO entran: salen de la recta, así que se mueven solos con el piso
 * y el ancla. Contarlos sería contar dos veces el mismo grado de libertad.
 */
export function valoresDeclarados(): ValorDeclarado[] {
  const salida: ValorDeclarado[] = NIVELES.map((n) => ({
    donde: NIVELES_TIPOGRAFICOS[n].token,
    px: tokenPx(NIVELES_TIPOGRAFICOS[n].token, 0),
  }))
  for (const n of NIVELES) {
    const terminos = terminosDe(n)
    if (terminos !== null) salida.push({ donde: `piso de --text-fluido-${n}`, px: terminos.piso })
  }
  return salida
}

export interface Movimiento {
  readonly donde: string
  readonly de: number
  readonly a: number
}

/** Los valores declarados que CAMBIAN de entero al aplicar el factor. */
export function valoresQueSeMueven(factor: number, valores = valoresDeclarados()): Movimiento[] {
  return valores
    .filter((v) => Math.round(v.px * factor) !== Math.round(v.px))
    .map((v) => ({ donde: v.donde, de: Math.round(v.px), a: Math.round(v.px * factor) }))
}

/** El desplazamiento más grande, en px, sobre los valores declarados. */
export function desplazamientoMaximo(factor: number, valores = valoresDeclarados()): number {
  return Math.max(...valores.map((v) => Math.abs(v.px * factor - v.px)))
}

// ── La tinta vertical: qué mide el ojo, en píxeles ──────────────────────────

export interface TintaVertical {
  readonly nivel: Nivel
  readonly ancho: number
  /** El tamaño del nivel a ese ancho, ya compensado. */
  readonly px: number
  /** Déficit de cap height contra Instrument Sans, en px. Positivo = más chica. */
  readonly deficitDeCap: number
  /** Exceso de x-height contra Instrument Sans, en px. Positivo = más grande. */
  readonly excesoDeX: number
}

/**
 * LA MISMA MEDICIÓN EN PÍXELES, y no en por ciento — y las dos NO ordenan
 * igual, que es el resultado que este frente entrega.
 *
 * La referencia de comparación es SIEMPRE el nivel SIN compensar renderizado en
 * Instrument Sans: es el tamaño óptico que los 14 valores anotaron. Compensar
 * mueve la tinta de Chivo, nunca la vara.
 */
export function tintaVerticalDe(nivel: Nivel, ancho: number, factor: number): TintaVertical {
  const base = escalaA(ancho).find((n) => n.nivel === nivel)
  if (base === undefined) throw new Error(`nivel desconocido: ${nivel}`)
  const px = base.px * factor
  const em = CHIVO_MEDIDO.unidadesPorEm
  return {
    nivel,
    ancho,
    px,
    deficitDeCap:
      (base.px * METRICAS_DE_INSTRUMENT_SANS.capHeight - px * CHIVO_MEDIDO.capHeight) / em,
    excesoDeX: (px * CHIVO_MEDIDO.xHeight - base.px * METRICAS_DE_INSTRUMENT_SANS.xHeight) / em,
  }
}

/** El peor desvío de una de las dos métricas, en px, en ese nivel y ancho. */
export function peorDesvioEnPx(nivel: Nivel, ancho: number, factor: number): number {
  const t = tintaVerticalDe(nivel, ancho, factor)
  return Math.max(Math.abs(t.deficitDeCap), Math.abs(t.excesoDeX))
}
