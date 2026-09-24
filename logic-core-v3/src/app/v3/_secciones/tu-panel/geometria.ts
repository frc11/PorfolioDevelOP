/**
 * LA GEOMETRÍA DE TU PANEL — el caos ordenado, como TABLA escrita a mano.
 *
 * SPRINT PANEL 2. Nada se sortea en tiempo de ejecución (rompería la
 * hidratación): cada feature tiene su fila, y el desorden es el de la tabla.
 * Lo único ordenado es que todas suben en línea recta.
 *
 * Las columnas y los anchos van en % del ancho útil; la separación, en `svh`
 * (alto de pantalla), para que la densidad —2 o 3 features en pantalla— se
 * sostenga con cualquier alto. El modelo de abajo es el que los invariantes
 * barren; el barrido del navegador confirma que el DOM coincide.
 *
 * Clases escritas enteras: el escáner de Tailwind lee este archivo tal cual.
 */

import type { NivelDeTitular } from '../../_componentes/tipografia/Titular'

// ── Las clases de tamaño ───────────────────────────────────────────────────

export type ClaseDeTamano = 'xs' | 's' | 'm' | 'l'

export interface Tamano {
  /** Ancho, en % del ancho útil. Ninguna pasa del 45 %. */
  readonly ancho: number
  readonly nivel: NivelDeTitular
  /** Velocidad de profundidad: las más grandes, un poco más rápidas. */
  readonly velocidad: number
}

/**
 * MÓVIL 2: cuánto crecen las imágenes de las features en el portátil (1024). Es el
 * máximo que el propio modelo del caos deja pasar a 960 × 768 —nunca más de 3 a la vez,
 * ningún título tapado, ninguna afuera del 98 %—, con las de la derecha corridas hacia
 * adentro lo que crecen: 1,07 pasa y 1,08 ya tapa un título (barrido de a 0,01).
 */
export const ESCALA_DE_LAS_FEATURES_A_1024 = 1.07

export const TAMANOS: Readonly<Record<ClaseDeTamano, Tamano>> = {
  xs: { ancho: 22, nivel: 'titulo-s', velocidad: 0.03 },
  s: { ancho: 28, nivel: 'titulo-s', velocidad: 0.05 },
  m: { ancho: 35, nivel: 'titulo-m', velocidad: 0.08 },
  l: { ancho: 42, nivel: 'titulo-m', velocidad: 0.11 },
}

// ── La tabla ───────────────────────────────────────────────────────────────

export interface FilaDelCaos {
  /** Dónde arranca, en % del ancho útil. */
  readonly columna: number
  readonly tamano: ClaseDeTamano
  /** Cuánto más abajo que la ANTERIOR arranca, en svh. La primera, desde el tope. */
  readonly separacion: number
}

/**
 * UNA FILA POR FEATURE, en el orden de `TARJETAS`. Retocala acá: el barrido de
 * `s6-tu-panel` dice enseguida si una fila nueva rompe la convivencia (más de
 * tres a la vez, un título tapado, algo fuera del cuadro).
 *
 * La primera llega en el 60 % derecho, al lado del encabezado (el 30 % izquierdo).
 * La última queda asentada al final: velocidad 0, en el flujo, antes del cierre.
 */
export const TABLA_DEL_CAOS: readonly FilaDelCaos[] = [
  { columna: 52, tamano: 'l', separacion: 14 },
  { columna: 6, tamano: 's', separacion: 62 },
  { columna: 60, tamano: 'm', separacion: 44 },
  { columna: 29, tamano: 'xs', separacion: 52 },
  { columna: 55, tamano: 'l', separacion: 36 },
  { columna: 3, tamano: 'm', separacion: 58 },
  { columna: 50, tamano: 's', separacion: 46 },
  { columna: 6, tamano: 'l', separacion: 54 },
]

/** El encabezado ocupa el 30 % izquierdo. */
export const ANCHO_DEL_ENCABEZADO = 30

/** La proporción del marco de cada feature: horizontal, 16:10. */
export const RELACION_DEL_MARCO = 16 / 10

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
 * Las cajas de cada feature en px, con el caos arrancando en y = 0. El título se
 * modela con su alto de dos renglones más la etiqueta y los espacios (del DOM:
 * `--spacing-3` + renglones + `--spacing-2` + `Micro`).
 */
export function cajasDelCaos(anchoUtil: number, altoDePantalla: number, tabla: readonly FilaDelCaos[] = TABLA_DEL_CAOS, escala = 1): CajaDeFeature[] {
  const tops = arranques(tabla)
  return tabla.map((fila, i) => {
    const t = TAMANOS[fila.tamano]
    // MÓVIL 2: `escala` agranda las imágenes (a 1024, `ESCALA_DE_LAS_FEATURES_A_1024`).
    const ancho = (t.ancho / 100) * anchoUtil * escala
    const altoImagen = ancho / RELACION_DEL_MARCO
    const arriba = (tops[i] / 100) * altoDePantalla
    const renglon = t.nivel === 'titulo-m' ? 35 : 22
    const imagen = { izquierda: (fila.columna / 100) * anchoUtil, arriba, ancho, alto: altoImagen }
    const titulo = { izquierda: imagen.izquierda, arriba: arriba + altoImagen, ancho, alto: 12 + 2 * renglon + 8 + 11 }
    return { imagen, titulo, velocidad: velocidadDe(i, tabla) }
  })
}

/**
 * El corrimiento de profundidad, en px: 0 con la feature centrada en la pantalla;
 * abajo del centro se la empuja más abajo y arriba, más arriba, así que las de
 * velocidad mayor cruzan la pantalla más rápido (parecen más cerca).
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

/** Lo que mira el barrido en una posición: cuántas se ven, y qué título tapa qué imagen. */
export function convivenciaEn(cajas: readonly CajaDeFeature[], altoDePantalla: number): { visibles: number; tapados: string[] } {
  const visibles = cajas.filter((c) => c.titulo.arriba + c.titulo.alto > 0 && c.imagen.arriba < altoDePantalla).length
  const tapados: string[] = []
  cajas.forEach((a, i) =>
    cajas.forEach((b, j) => {
      if (i !== j && seCruzan(a.titulo, b.imagen)) tapados.push(`título ${i + 1} bajo imagen ${j + 1}`)
    }),
  )
  return { visibles, tapados }
}

/** Ninguna feature se sale por los costados (con el título corrido 32 px del hover). */
export function fueraDelCuadro(tabla: readonly FilaDelCaos[] = TABLA_DEL_CAOS): number[] {
  return tabla.flatMap((f, i) => (f.columna < 0 || f.columna + TAMANOS[f.tamano].ancho > 98 ? [i + 1] : []))
}

// ── El parallax interno de la imagen (sprint 1, medido en nk) ─────────────

/** La imagen mide 130 % del alto de su marco: el sobrante es lo que puede viajar. */
export const ALTO_DE_LA_IMAGEN = 1.3

/** nk viaja 1,3 veces el «recorrido justo» (0,1515 px/px con marco de 571 y viewport de 900). */
export const VELOCIDAD_DEL_PARALLAX = 1.3

/** Cuánto se corre la imagen dentro de su marco. Acotado: el borde nunca entra al marco. */
export function corrimientoDelParallax(arriba: number, altoDelMarco: number, altoDeLaPantalla: number): number {
  const sobrante = (ALTO_DE_LA_IMAGEN - 1) * altoDelMarco
  const recorrido = altoDeLaPantalla + altoDelMarco
  const progreso = (altoDeLaPantalla - arriba) / recorrido
  const crudo = -sobrante / 2 + (progreso - 0.5) * sobrante * VELOCIDAD_DEL_PARALLAX
  return Math.min(0, Math.max(-sobrante, crudo))
}

// ── Móvil ──────────────────────────────────────────────────────────────────

/**
 * Abajo de 1025, una columna con el eco del caos: anchos que alternan 88 % y
 * 72 %, pegados a izquierda y derecha. Sin parallax.
 */
export function claseMovil(indice: number): string {
  return indice % 2 === 0 ? 'w-22/25' : 'ml-auto w-18/25'
}
