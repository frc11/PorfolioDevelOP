import {
  PARTICLES_MAX,
  PARTICLE_SIZE,
} from '@/app/probe-escena/_components/probeParticles'
import { PROBE_DEFAULTS } from '@/app/probe-escena/_components/probeStore'

import { introContrastAt } from './introLegibilityProbe'
import { INTRO_FALL_WORLD, type IntroMote } from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { readSource } from './introParticleProbe'
import { introParticleWindows } from './introParticleTiming'
import type { IntroTimeline } from './introTimeline'

/**
 * EL BANCO DE LA LECTURA — no es código de la aplicación.
 *
 * Lo importa `introParticleReading.invariant.ts` y **nadie más**: no hay un solo
 * `import` desde un componente, un hook o una ruta, así que no viaja a ningún
 * bundle. Es el hermano de `introParticleProbe.ts`, con una costura clara entre
 * los dos: **allá la LEGIBILIDAD** —el contraste de una mota a lo largo del
 * tiempo, que es lo que decide el margen contra la escena—, **acá la LECTURA**
 * —de qué tamaño tiene que ser una mota para que se lea como un objeto y no
 * como grano.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * LA REFERENCIA DE LECTURA ES EL CAMPO DE PUNTOS DEL PRELOADER CLÁSICO
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Sobre el mismo blanco, ese campo se lee como puntos **claramente visibles,
 * contables y con presencia propia** — que es exactamente lo que al campo del
 * intro le faltaba. De ahí se toma **la escala de visibilidad y nada más**: la
 * distribución sigue siendo la del campo proyectado, no una grilla regular.
 *
 * 🔴 **Es referencia de lectura, no de implementación**, y por eso vive en un
 * banco de medición y no en `introParticles.ts`. Nada del intro importa de acá,
 * y nada de acá se importa del clásico: `DotMatrix.tsx` arrastra `three` y
 * `@react-three/fiber`, y el preloader corre en la PRIMERA visita. Los dos
 * números se **leen del código fuente**, que es el patrón con el que
 * `introParticles.invariant.ts` custodia lo copiado de `DepthParticles.tsx`.
 */

// ── El punto del preloader clásico, medido en su propio código ──────────────

const DOT_SRC = readSource('src/components/canvas/DotMatrix.tsx')
const HERO_SRC = readSource('src/components/layout/Hero.tsx')

/** `<sphereGeometry args={[0.025, 16, 16]} />` — el radio de mundo del punto. */
const DOT_RADIUS_MATCH = /<sphereGeometry args=\{\[([0-9.]+),/.exec(DOT_SRC)
/** El paso de la grilla en el instante en que los puntos APARECEN (progress 0). */
const DOT_SPACING_MATCH = /const DOT_SPACING_SPARSE = ([0-9.]+);/.exec(DOT_SRC)
/** `camera={{ position: [0, 0, isSplitLayout ? 15 : 13], fov: isSplitLayout ? 35 : 30 }}` */
const CAMERA_MATCH =
  /camera=\{\{ position: \[0, 0, isSplitLayout \? ([0-9.]+) : [0-9.]+\], fov: isSplitLayout \? ([0-9.]+) :/.exec(
    HERO_SRC
  )

export const CLASSIC_READ: {
  readonly dotRadiusWorld: number
  readonly spacingWorld: number
  readonly cameraDepth: number
  readonly cameraFovDeg: number
  readonly sourceBytes: number
} = {
  dotRadiusWorld: DOT_RADIUS_MATCH ? Number(DOT_RADIUS_MATCH[1]) : NaN,
  spacingWorld: DOT_SPACING_MATCH ? Number(DOT_SPACING_MATCH[1]) : NaN,
  cameraDepth: CAMERA_MATCH ? Number(CAMERA_MATCH[1]) : NaN,
  cameraFovDeg: CAMERA_MATCH ? Number(CAMERA_MATCH[2]) : NaN,
  sourceBytes: DOT_SRC.length + HERO_SRC.length,
}

/** Cuántos píxeles CSS mide una unidad de mundo del clásico, a su profundidad. */
function classicPxPerWorld(viewportHeightPx: number): number {
  const halfHeight =
    Math.tan(((CLASSIC_READ.cameraFovDeg / 2) * Math.PI) / 180) * CLASSIC_READ.cameraDepth
  return viewportHeightPx / (2 * halfHeight)
}

/**
 * 🔴 **EL UMBRAL DE VISIBILIDAD DE S14, MITAD TAMAÑO.** El diámetro del punto
 * del clásico proyectado en esta ventana: **4,28 px en 1440×810**.
 *
 * Es una esfera de radio `dotRadiusWorld` a `cameraDepth` de la cámara, con la
 * misma aritmética que cualquier otro tamaño angular. En reposo mide eso; con la
 * ola del clásico —escala 0,7 a 1,3 y profundidad ±1,5— barre de 2,7 a 6,2 px,
 * así que el valor en reposo es el centro de su propia banda.
 */
export function classicDotPx(viewportHeightPx: number): number {
  return 2 * CLASSIC_READ.dotRadiusWorld * classicPxPerWorld(viewportHeightPx)
}

/** El paso de la grilla del clásico en píxeles CSS: **81 px en 1440×810**. */
export function classicPitchPx(viewportHeightPx: number): number {
  return CLASSIC_READ.spacingWorld * classicPxPerWorld(viewportHeightPx)
}

// ── El umbral de visibilidad ────────────────────────────────────────────────

/** El contraste de una mota contra el papel con el campo entero y quieto. */
export function fullDensityContrast(timeline: IntroTimeline, mote: IntroMote): number {
  return introContrastAt(timeline, mote, introParticleWindows(timeline).inEndS)
}

/**
 * 🔴 **LA OTRA MITAD DEL UMBRAL: 3:1.**
 *
 * `LEGIBLE` = 1,10 responde otra pregunta —"¿todavía se distingue algo del
 * fondo?"— y por eso gobierna el cruce contra la escena, donde lo conservador es
 * exigir de más. Acá la pregunta es "¿esto se LEE como un objeto?", y para eso
 * 1,10 es demasiado permisivo: **con 1,10 las 76 motas de bokeh contarían como
 * visibles** con 1,13:1 de contraste, que son justamente las que el humano
 * describió como "están, pero apenas se distinguen del fondo".
 *
 * 3:1 no es un número elegido para que dé: es **el mínimo de WCAG 2.1 SC 1.4.11
 * (Non-text Contrast) para un objeto gráfico**, que es exactamente lo que una
 * mota es. El repo ya declara WCAG AA como su piso, y el bokeh queda muy por
 * debajo: entre 1,13 y 3 no hay una sola mota de ninguno de los dos campos, así
 * que el corte no es sensible a dónde se ponga adentro de esa banda.
 */
export const READABLE_CONTRAST = 3

/**
 * 🔴 **EL UMBRAL DE VISIBILIDAD, DECLARADO.** Una mota del intro es *visible* si
 *
 *  1. **llega al diámetro del punto del clásico** en la misma ventana — la
 *     escala de lectura que el sprint manda tomar de ahí —, **y**
 *  2. **su contraste contra el papel llega a `READABLE_CONTRAST`** (3:1),
 *     medido en densidad completa.
 *
 * Las dos mitades hacen falta y ninguna sola alcanza: sin la primera contaría
 * una mota oscura de un píxel, sin la segunda contaría el bokeh entero.
 *
 * Se cuenta **en el instante de densidad completa**, que es donde el campo está
 * entero y quieto y donde el humano lo juzgó.
 */
export function isReadable(
  timeline: IntroTimeline,
  mote: IntroMote,
  viewportHeightPx: number
): boolean {
  return (
    mote.sizePx >= classicDotPx(viewportHeightPx) &&
    fullDensityContrast(timeline, mote) >= READABLE_CONTRAST
  )
}

/**
 * Cuánto papel tapa un campo, en porcentaje del cuadro. La suma de los discos
 * sin descontar solapes: es una cota superior y sirve para comparar repartos.
 */
export function inkCoverage(
  motes: readonly IntroMote[],
  viewportWidthPx: number,
  viewportHeightPx: number,
  kind?: IntroMote['kind']
): number {
  const area = viewportWidthPx * viewportHeightPx
  return (
    motes
      .filter((mote) => kind === undefined || mote.kind === kind)
      .reduce((sum, mote) => sum + Math.PI * (mote.sizePx / 2) ** 2, 0) / area
  )
}

/** El paso medio de un campo: la raíz del área por mota. Compara densidades. */
export function meanPitchPx(
  motes: readonly IntroMote[],
  viewportWidthPx: number,
  viewportHeightPx: number
): number {
  return Math.sqrt((viewportWidthPx * viewportHeightPx) / motes.length)
}

// ── Los dos repartos, construidos por el mismo constructor ──────────────────

/**
 * El reparto que S13 embarcaba: el tamaño de mundo de la escena y la fracción
 * que el probe trae de default. **No son dos literales copiados de un reporte**
 * — los produce el repo, y por eso la columna "antes" de S14 es una medición y
 * no una cita. Que reproduzcan las cifras publicadas se comprueba.
 */
export const S13_DUST_SIZE = PARTICLE_SIZE
export const S13_DUST_SHARE = PROBE_DEFAULTS.particleCount / PARTICLES_MAX

/** El campo tal como S13 lo dejaba. */
export const s13Field = (width: number, height: number) =>
  buildIntroParticles(width, height, INTRO_FALL_WORLD, S13_DUST_SIZE, S13_DUST_SHARE)

/** Y el que S14 embarca. */
export const introField = (width: number, height: number) =>
  buildIntroParticles(width, height)

export const dustSizes = (motes: readonly IntroMote[]) =>
  motes.filter((mote) => mote.kind === 'dust').map((mote) => mote.sizePx)

/** Las tres ventanas que S13 ya mide, y contra las que S14 se reporta. */
export const READING_WINDOWS: readonly (readonly [number, number])[] = [
  [1440, 810],
  [1920, 1080],
  [390, 844],
]
