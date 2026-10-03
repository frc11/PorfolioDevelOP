/**
 * LA GEOMETRÍA DE TU PANEL — [RETOQUE PANEL] T1 · cada feature es su demo, usable en su lugar.
 *
 * El caos de imágenes chicas (SPRINT PANEL 2) se fue: una demo se lee y se usa sin zoom sólo si se dibuja a un tamaño
 * de panel de verdad. Cada una tiene la PANTALLA que necesita (px) y una FORMA que dice cuánto ancho le toca: los leads
 * (tres columnas de tarjetas) van ENTEROS, a lo ancho; las que tienen tablas (conversaciones, tickets, resultados), ANCHAS,
 * con su título al costado; el chat y los servicios, de a PAR; el proyecto y lo que sabe el chatbot, MEDIAS. Las más
 * angostas que `ANCHO_CON_BARRA` cierran la barra lateral del panel, como el panel real en una ventana angosta. El ancho de cada forma está elegido para que a
 * 1440 la demo quede a tamaño casi real (`escalaDeLaDemo`), y el ritmo alterna lados y tamaños: nada igual, nada
 * amontonado. Hasta un contenido de 72rem (un escritorio angosto) van en una columna, más anchas; abajo de 1024, a lo
 * ancho y con su alto, sin escala (el diseño del propio panel en el teléfono).
 *
 * Clases escritas enteras: el escáner de Tailwind lee este archivo tal cual.
 */

import type { PantallaDeLaDemo } from '../../_panel-vivo/DemoDelPanel'

export type FormaDeLaFeature = 'primera' | 'entera' | 'ancha' | 'par' | 'media'
export type LadoDeLaFeature = 'izquierda' | 'derecha'

export interface LugarDeLaFeature {
  readonly forma: FormaDeLaFeature
  readonly lado: LadoDeLaFeature
  /** La pantalla de panel a la que se dibuja la demo en escritorio (px). */
  readonly pantalla: PantallaDeLaDemo
  /** El alto de la demo abajo de 1024 (px): el ancho es el de la columna. */
  readonly altoAngosto: number
}

/** UNA FILA POR FEATURE, en el orden de `TARJETAS`. */
export const DISPOSICION: readonly LugarDeLaFeature[] = [
  { forma: 'primera', lado: 'derecha', pantalla: { ancho: 880, alto: 560 }, altoAngosto: 600 },
  { forma: 'entera', lado: 'izquierda', pantalla: { ancho: 1280, alto: 640 }, altoAngosto: 640 },
  { forma: 'ancha', lado: 'derecha', pantalla: { ancho: 900, alto: 560 }, altoAngosto: 620 },
  { forma: 'par', lado: 'izquierda', pantalla: { ancho: 640, alto: 580 }, altoAngosto: 680 },
  { forma: 'par', lado: 'derecha', pantalla: { ancho: 660, alto: 600 }, altoAngosto: 600 },
  { forma: 'media', lado: 'izquierda', pantalla: { ancho: 760, alto: 540 }, altoAngosto: 600 },
  { forma: 'ancha', lado: 'derecha', pantalla: { ancho: 900, alto: 560 }, altoAngosto: 620 },
  { forma: 'media', lado: 'izquierda', pantalla: { ancho: 760, alto: 560 }, altoAngosto: 560 },
]

/** El aire entre la demo y su título al costado (px; `--spacing-12`) y entre las dos de un par (`--spacing-20`: los dos degradés no se tocan). */
const AIRE = 48
const AIRE_DEL_PAR = 80

/** El ancho de la demo de cada forma, en fracción del ancho útil (en escritorio ancho, desde 72rem de contenido). */
export const ANCHO_DE_LA_FORMA: Readonly<Record<FormaDeLaFeature, (anchoUtil: number) => number>> = {
  primera: (w) => (16 / 25) * w,
  entera: (w) => w,
  ancha: (w) => ((w - AIRE) * 2) / 3,
  par: (w) => (w - AIRE_DEL_PAR) / 2,
  media: (w) => (14 / 25) * w,
}

/** Lo mismo en la columna del escritorio angosto (menos de 72rem de contenido): más anchas, una por fila. */
export const ANCHO_EN_COLUMNA: Readonly<Record<FormaDeLaFeature, (anchoUtil: number) => number>> = {
  primera: (w) => (22 / 25) * w,
  entera: (w) => w,
  ancha: (w) => (23 / 25) * w,
  par: (w) => (2 / 3) * w,
  media: (w) => (4 / 5) * w,
}

/** El contenido desde el que la composición va de costado (px): `@6xl`, 72rem. */
export const CONTENIDO_DE_LA_COMPOSICION = 1152

/** Con qué escala se ve una demo con un ancho útil dado (en escritorio). */
export function escalaDeLaDemo(lugar: LugarDeLaFeature, anchoUtil: number): number {
  const ancho = anchoUtil >= CONTENIDO_DE_LA_COMPOSICION ? ANCHO_DE_LA_FORMA[lugar.forma](anchoUtil) : ANCHO_EN_COLUMNA[lugar.forma](anchoUtil)
  return ancho / lugar.pantalla.ancho
}

/** El alto que ocupa en el cuadro la demo de cada fila (px, en escritorio): la composición entera, para medir su largo. */
export function altoDeLaDemo(lugar: LugarDeLaFeature, anchoUtil: number): number {
  return lugar.pantalla.alto * escalaDeLaDemo(lugar, anchoUtil)
}

// ── Las clases ─────────────────────────────────────────────────────────────

/** La fila de cada forma (el `<li>`): a lo ancho abajo de 1024; en escritorio, su ancho y su lado; en columna, más ancha. */
export const CLASE_DE_LA_FILA: Readonly<Record<FormaDeLaFeature, Readonly<Record<LadoDeLaFeature, string>>>> = {
  primera: { izquierda: 'escritorio:w-16/25 escritorio:@max-6xl:w-22/25', derecha: 'escritorio:ml-auto escritorio:w-16/25 escritorio:@max-6xl:w-22/25' },
  entera: { izquierda: 'escritorio:w-full', derecha: 'escritorio:w-full' },
  ancha: { izquierda: 'escritorio:w-full', derecha: 'escritorio:w-full' },
  par: {
    izquierda: 'escritorio:w-[calc(50%-var(--spacing-20)/2)] escritorio:@max-6xl:w-2/3',
    derecha: 'escritorio:mt-[var(--spacing-20)] escritorio:w-[calc(50%-var(--spacing-20)/2)] escritorio:@max-6xl:mt-0 escritorio:@max-6xl:ml-auto escritorio:@max-6xl:w-2/3',
  },
  media: { izquierda: 'escritorio:w-full', derecha: 'escritorio:w-full' },
}

/** Cómo se reparten la demo y su título adentro de la fila: uno abajo del otro, o de costado (en escritorio ancho). */
const DE_COSTADO = 'escritorio:flex-row escritorio:items-end escritorio:gap-[var(--spacing-12)] escritorio:@max-6xl:flex-col escritorio:@max-6xl:items-stretch escritorio:@max-6xl:gap-[calc(var(--sangrado)+var(--spacing-3))]'
const DE_COSTADO_A_LA_DERECHA = 'escritorio:flex-row-reverse escritorio:items-end escritorio:gap-[var(--spacing-12)] escritorio:@max-6xl:flex-col escritorio:@max-6xl:items-stretch escritorio:@max-6xl:gap-[calc(var(--sangrado)+var(--spacing-3))]'
export const CLASE_DEL_REPARTO: Readonly<Record<FormaDeLaFeature, Readonly<Record<LadoDeLaFeature, string>>>> = {
  primera: { izquierda: '', derecha: '' },
  entera: { izquierda: '', derecha: '' },
  ancha: { izquierda: DE_COSTADO, derecha: DE_COSTADO_A_LA_DERECHA },
  par: { izquierda: '', derecha: '' },
  media: { izquierda: DE_COSTADO, derecha: DE_COSTADO_A_LA_DERECHA },
}

/** La demo de cada forma, adentro de su fila (en escritorio). */
export const CLASE_DE_LA_DEMO: Readonly<Record<FormaDeLaFeature, string>> = {
  primera: 'escritorio:w-full',
  entera: 'escritorio:w-full',
  ancha: 'escritorio:w-2/3 escritorio:shrink-0 escritorio:@max-6xl:w-23/25',
  par: 'escritorio:w-full',
  media: 'escritorio:w-14/25 escritorio:shrink-0 escritorio:@max-6xl:w-4/5',
}

/** El título de cada forma: abajo de su demo, o al costado (en escritorio ancho), apoyado abajo. */
export const CLASE_DEL_TITULO: Readonly<Record<FormaDeLaFeature, string>> = {
  primera: '',
  entera: '',
  ancha: 'escritorio:flex-1 escritorio:pb-[var(--spacing-6)] escritorio:@max-6xl:pb-0',
  par: '',
  media: 'escritorio:flex-1 escritorio:pb-[var(--spacing-6)] escritorio:@max-6xl:pb-0',
}

/** El ancho de la imagen de respaldo en el cuadro (vw), para su `sizes`. */
export const VW_DE_LA_FORMA: Readonly<Record<FormaDeLaFeature, number>> = { primera: 62, entera: 96, ancha: 64, par: 48, media: 54 }

/**
 * El corrimiento de profundidad del fondo, en px: 0 con la pieza centrada en la pantalla; abajo del centro se la empuja
 * más abajo y arriba, más arriba (el fondo va negativo: más lento que el scroll, más lejos).
 */
export function corrimientoDeProfundidad(centroEnPantalla: number, altoDePantalla: number, velocidad: number): number {
  return velocidad * (centroEnPantalla - altoDePantalla / 2)
}

/** RECURSOS · El anclaje horizontal de cada captura de respaldo (el marco le recorta los costados). Clases enteras. */
export const CLASE_DE_ENCUADRE = {
  izquierda: 'object-left-top',
  centro: 'object-top',
  derecha: 'object-right-top',
} as const
