/**
 * LA GEOMETRÍA DE TU PANEL — [PASADA FINAL] B1 · el caos ordenado del sprint nocturno (una TABLA escrita a mano), con las
 * demos USABLES en su lugar.
 *
 * Cada feature flota en la columna y el tamaño de su fila (SPRINT PANEL 2: nada se sortea, el desorden es el de la
 * tabla) y adentro se ve el PANEL ENTERO a escala: la demo se dibuja a su pantalla (px) y se escala con `transform` al
 * ancho de la tarjeta, así casi nunca hace falta scrollear adentro. Ningún módulo a lo ancho (la rueda quedaba atrapada
 * y costaba scrollear la página); tarjetas más chicas que las de RETOQUE PANEL T1 (del 64 al 100 % del ancho) y más
 * grandes que las del nocturno (miniaturas inertes, del 22 al 42 %): del 42 al 56 %. Las pantallas son más altas que las
 * del retoque (de 700 a 800 px): se ve más panel; lo que es más largo que eso (un chat, una lista de tareas, un catálogo)
 * scrollea adentro sólo con el puntero encima y mientras tenga recorrido (`_panel-vivo/rueda.ts`).
 *
 * Las columnas y los anchos van en % del ancho útil; la separación, en `svh`, para que la densidad —2 o 3 features en
 * pantalla— se sostenga con cualquier alto. El modelo de abajo es el que `s6-tu-panel` barre (nunca más de tres a la
 * vez, ningún título bajo otra imagen, ninguna fuera del cuadro). Hasta 72rem de contenido (un escritorio angosto) van
 * en una columna, con el eco del caos en los anchos alternados; abajo de 1024, a lo ancho y con su alto, sin escala.
 *
 * Clases escritas enteras: el escáner de Tailwind lee este archivo tal cual.
 */

import type { NivelDeTitular } from '../../_componentes/tipografia/Titular'
import type { PantallaDeLaDemo } from '../../_panel-vivo/DemoDelPanel'

// ── Las clases de tamaño ───────────────────────────────────────────────────

export type ClaseDeTamano = 's' | 'm' | 'l'

export interface Tamano {
  /** Ancho, en % del ancho útil. */
  readonly ancho: number
  readonly nivel: NivelDeTitular
  /** Velocidad de profundidad: las más grandes, un poco más rápidas (más cerca). */
  readonly velocidad: number
}

export const TAMANOS: Readonly<Record<ClaseDeTamano, Tamano>> = {
  s: { ancho: 42, nivel: 'titulo-s', velocidad: 0.05 },
  m: { ancho: 48, nivel: 'titulo-m', velocidad: 0.08 },
  l: { ancho: 56, nivel: 'titulo-m', velocidad: 0.11 },
}

// ── La tabla ───────────────────────────────────────────────────────────────

export interface FilaDelCaos {
  /** Dónde arranca, en % del ancho útil. */
  readonly columna: number
  readonly tamano: ClaseDeTamano
  /** Cuánto más abajo que la ANTERIOR arranca, en svh. La primera, desde el tope. */
  readonly separacion: number
  /** La pantalla de panel a la que se dibuja la demo (px): la tarjeta tiene su proporción y la escala a su ancho. */
  readonly pantalla: PantallaDeLaDemo
  /** El alto de la demo abajo de 1024 (px): el ancho es el de la columna, sin escala. */
  readonly altoAngosto: number
}

/**
 * UNA FILA POR FEATURE, en el orden de `TARJETAS`. Retocala acá: el barrido de `s6-tu-panel` dice enseguida si una fila
 * nueva rompe la convivencia (más de tres a la vez, un título tapado, algo fuera del cuadro).
 *
 * La primera llega en el 60 % derecho, al lado del encabezado (el 30 % izquierdo). La última queda asentada al final:
 * velocidad 0, en el flujo, antes del cierre. Las pantallas (px) son más altas que las de RETOQUE PANEL T1: se ve más
 * panel; los leads, con sus tres columnas, piden la más ancha.
 */
export const TABLA_DEL_CAOS: readonly FilaDelCaos[] = [
  { columna: 42, tamano: 'l', separacion: 14, pantalla: { ancho: 1000, alto: 720 }, altoAngosto: 640 },
  { columna: 4, tamano: 'l', separacion: 82, pantalla: { ancho: 1100, alto: 800 }, altoAngosto: 680 },
  { columna: 50, tamano: 'm', separacion: 82, pantalla: { ancho: 960, alto: 780 }, altoAngosto: 660 },
  { columna: 14, tamano: 's', separacion: 78, pantalla: { ancho: 760, alto: 720 }, altoAngosto: 680 },
  { columna: 42, tamano: 'l', separacion: 78, pantalla: { ancho: 1000, alto: 720 }, altoAngosto: 680 },
  { columna: 2, tamano: 'm', separacion: 82, pantalla: { ancho: 920, alto: 780 }, altoAngosto: 660 },
  { columna: 54, tamano: 's', separacion: 36, pantalla: { ancho: 820, alto: 700 }, altoAngosto: 640 },
  { columna: 6, tamano: 'l', separacion: 70, pantalla: { ancho: 1000, alto: 720 }, altoAngosto: 600 },
]

/** El encabezado ocupa el 30 % izquierdo. */
export const ANCHO_DEL_ENCABEZADO = 30

/** El contenido desde el que el caos flota (px): `@6xl`, 72rem. Antes, una columna. */
export const CONTENIDO_DEL_CAOS = 1152

/** Dónde arranca cada feature, en svh desde el tope del caos. */
export function arranques(tabla: readonly FilaDelCaos[] = TABLA_DEL_CAOS): number[] {
  const tops: number[] = []
  tabla.forEach((fila, i) => tops.push((i === 0 ? 0 : tops[i - 1]) + fila.separacion))
  return tops
}

/** La velocidad de profundidad de cada fila. La última, asentada: 0. */
export function velocidadDe(indice: number, tabla: readonly FilaDelCaos[] = TABLA_DEL_CAOS): number {
  return indice === tabla.length - 1 ? 0 : TAMANOS[tabla[indice].tamano].velocidad
}

/** La proporción del marco de una fila: la de su pantalla (horizontal). */
export const proporcionDe = (fila: FilaDelCaos): number => fila.pantalla.ancho / fila.pantalla.alto

/** En la columna (el escritorio angosto y el teléfono): anchos que alternan 88 % y 72 %, pegados a izquierda y derecha. */
export function anchoEnColumna(indice: number): number {
  return indice % 2 === 0 ? 22 / 25 : 18 / 25
}

/** Con qué escala se ve la demo de una fila: en el caos, su ancho de tabla; en la columna, el ancho alternado. */
export function escalaDeLaDemo(indice: number, anchoUtil: number, tabla: readonly FilaDelCaos[] = TABLA_DEL_CAOS): number {
  const fila = tabla[indice]
  const ancho = anchoUtil >= CONTENIDO_DEL_CAOS ? (TAMANOS[fila.tamano].ancho / 100) * anchoUtil : anchoEnColumna(indice) * anchoUtil
  return ancho / fila.pantalla.ancho
}

// ── El modelo que barren los invariantes ───────────────────────────────────

export interface Rect {
  readonly izquierda: number
  readonly arriba: number
  readonly ancho: number
  readonly alto: number
}

export interface CajaDeFeature {
  readonly imagen: Rect
  readonly titulo: Rect
  readonly velocidad: number
}

/**
 * Las cajas de cada feature en px, con el caos arrancando en y = 0. El título se modela con su alto de dos renglones más
 * la etiqueta y los espacios (del DOM: `--spacing-3` + renglones + `--spacing-2` + `Micro`).
 */
export function cajasDelCaos(anchoUtil: number, altoDePantalla: number, tabla: readonly FilaDelCaos[] = TABLA_DEL_CAOS): CajaDeFeature[] {
  const tops = arranques(tabla)
  return tabla.map((fila, i) => {
    const t = TAMANOS[fila.tamano]
    const ancho = (t.ancho / 100) * anchoUtil
    const altoImagen = ancho / proporcionDe(fila)
    const arriba = (tops[i] / 100) * altoDePantalla
    const renglon = t.nivel === 'titulo-m' ? 35 : 22
    const imagen = { izquierda: (fila.columna / 100) * anchoUtil, arriba, ancho, alto: altoImagen }
    const titulo = { izquierda: imagen.izquierda, arriba: arriba + altoImagen, ancho, alto: 12 + 2 * renglon + 8 + 11 }
    return { imagen, titulo, velocidad: velocidadDe(i, tabla) }
  })
}

/**
 * El corrimiento de profundidad, en px: 0 con la pieza centrada en la pantalla; abajo del centro se la empuja más abajo
 * y arriba, más arriba, así que las de velocidad mayor cruzan la pantalla más rápido (parecen más cerca). El fondo va
 * negativo: más lento que el scroll, más lejos.
 */
export function corrimientoDeProfundidad(centroEnPantalla: number, altoDePantalla: number, velocidad: number): number {
  return velocidad * (centroEnPantalla - altoDePantalla / 2)
}

/** Las cajas como se ven con el caos corrido `scroll` px hacia arriba. */
export function cajasEn(cajas: readonly CajaDeFeature[], scroll: number, altoDePantalla: number): CajaDeFeature[] {
  return cajas.map((c) => {
    const centro = c.imagen.arriba + (c.imagen.alto + c.titulo.alto) / 2 - scroll
    const d = corrimientoDeProfundidad(centro, altoDePantalla, c.velocidad) - scroll
    return { ...c, imagen: { ...c.imagen, arriba: c.imagen.arriba + d }, titulo: { ...c.titulo, arriba: c.titulo.arriba + d } }
  })
}

const seCruzan = (a: Rect, b: Rect): boolean =>
  a.izquierda < b.izquierda + b.ancho && b.izquierda < a.izquierda + a.ancho && a.arriba < b.arriba + b.alto && b.arriba < a.arriba + a.alto

/**
 * Lo que mira el barrido en una posición: cuántas se ven, qué título tapa qué imagen y qué imágenes se pisan. Un cruce
 * cuenta sólo si alguna de las dos cajas está en el cuadro: fuera de él la profundidad las corre distinto y nadie lo ve.
 */
export function convivenciaEn(cajas: readonly CajaDeFeature[], altoDePantalla: number): { visibles: number; tapados: string[]; pisadas: string[] } {
  const enElCuadro = (r: Rect): boolean => r.arriba + r.alto > 0 && r.arriba < altoDePantalla
  const visibles = cajas.filter((c) => c.titulo.arriba + c.titulo.alto > 0 && c.imagen.arriba < altoDePantalla).length
  const tapados: string[] = []
  const pisadas: string[] = []
  cajas.forEach((a, i) =>
    cajas.forEach((b, j) => {
      if (i !== j && seCruzan(a.titulo, b.imagen) && (enElCuadro(a.titulo) || enElCuadro(b.imagen))) tapados.push(`título ${i + 1} bajo imagen ${j + 1}`)
      if (i < j && seCruzan(a.imagen, b.imagen) && (enElCuadro(a.imagen) || enElCuadro(b.imagen))) pisadas.push(`imagen ${i + 1} con imagen ${j + 1}`)
    }),
  )
  return { visibles, tapados, pisadas }
}

/** Ninguna feature se sale por los costados. */
export function fueraDelCuadro(tabla: readonly FilaDelCaos[] = TABLA_DEL_CAOS): number[] {
  return tabla.flatMap((f, i) => (f.columna < 0 || f.columna + TAMANOS[f.tamano].ancho > 98 ? [i + 1] : []))
}

// ── Las clases ─────────────────────────────────────────────────────────────

/** El ancho de la columna de cada fila (todo ancho; en el caos lo pisa el de la tabla). Clases enteras. */
export function claseEnColumna(indice: number): string {
  return indice % 2 === 0 ? 'w-22/25 escritorio:@max-6xl:w-22/25' : 'ml-auto w-18/25 escritorio:@max-6xl:w-18/25'
}

/** Dónde flota cada fila en el caos (desde 72rem de contenido); en la columna angosta, en el flujo. La última, en el flujo siempre. */
export const CLASE_DEL_LUGAR = {
  flota: 'escritorio:absolute escritorio:top-[var(--y)] escritorio:left-[var(--x)] escritorio:w-[var(--w)] escritorio:@max-6xl:static escritorio:@max-6xl:top-auto escritorio:@max-6xl:left-auto',
  asentada: 'escritorio:ml-[var(--x)] escritorio:w-[var(--w)] escritorio:@max-6xl:ml-0',
} as const

/** El ancho de la imagen de respaldo en el cuadro (vw), para su `sizes`: el de su tamaño. */
export const vwDe = (fila: FilaDelCaos): number => TAMANOS[fila.tamano].ancho

/** RECURSOS · El anclaje horizontal de cada captura de respaldo (el marco le recorta los costados). Clases enteras. */
export const CLASE_DE_ENCUADRE = {
  izquierda: 'object-left-top',
  centro: 'object-top',
  derecha: 'object-right-top',
} as const
