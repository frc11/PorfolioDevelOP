/**
 * COPIA ATRIBUIDA DE `scripts-b6/glifo-alfa.ts` (B6-A, rama `v3/escena-viva`, 21b9d89e).
 *
 * B6-A no es ancestro de `v3/luz` y este banco no puede importarlo. Es el MISMO
 * instrumento con el prefijo de atributo cambiado a `b8`; cuando las ramas se
 * mergeen, este archivo se borra a favor del original (ver `b8-comun.ts`).
 */
/**
 * EL CONTRASTE BAJO EL GLIFO, CON OPACIDAD — y la varianza de la escena.
 *
 * ── Qué hereda de B5 y qué agrega ─────────────────────────────────────────
 *
 * La máscara es la de `scripts-b5/glifo.ts`, sin cambios: sale de la captura
 * **T** (texto sobre fondo plano, con la escena en `visibility: hidden`), un
 * píxel es glifo si se aparta más de `UMBRAL_DE_GLIFO` de la mediana de SU caja,
 * y el fondo contra el que se mide es la captura **A** (tinta apagada). Con
 * opacidad 1 este módulo tiene que dar EXACTAMENTE lo que da el de B5, y
 * `banco-b6.invariant.ts` lo comprueba.
 *
 * Lo que agrega es la opacidad. Un texto con `opacity: 0.6` —`opacity-casi`, el
 * texto secundario del sistema— no se pinta con su color: se pinta con
 * **0,6 × tinta + 0,4 × lo que haya detrás**, píxel por píxel. Sobre un fondo
 * plano eso es una cuenta de una vez; sobre la escena es una cuenta por píxel,
 * porque lo que hay detrás cambia con cada glifo. La función de B5 recibía un
 * color y lo comparaba contra cada fondo: acá el color se compone contra cada
 * fondo ANTES de comparar. Es lo que el navegador pinta, redondeado a 8 bits.
 *
 * ── La varianza: cuánta escena ATRAVIESA un panel ────────────────────────
 *
 * Un velo deja pasar «algo» de la escena: la forma de ponerle número es la
 * varianza de luminancia dentro de la región del panel, en la captura con el
 * panel puesto (A, sin tinta) contra la captura sin panel (S). Detrás de un
 * panel opaco la varianza es cero — ése es el control. Se mide sobre la
 * luminancia relativa (0–1), que es la magnitud del contraste, y no sobre el
 * gris del archivo.
 */

import { AA_TEXTO_GRANDE, AA_TEXTO_NORMAL, contraste, luminancia } from '../scripts-b4/color'
import type { CajaDeTexto, LecturaDeGlifo } from '../scripts-b5/glifo'
import type { Imagen } from '../scripts-b5/silueta'

export { leerImagen, siluetaMasGrande, type Imagen, type Silueta } from '../scripts-b5/silueta'

/** El mismo umbral que B1 publicó y B5 heredó. No se toca. */
export const UMBRAL_DE_GLIFO = 24

export interface Region {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
}

export function acotarCaja(caja: CajaDeTexto, img: { readonly ancho: number; readonly alto: number }): Region {
  return {
    x0: Math.max(0, Math.floor(caja.x)),
    y0: Math.max(0, Math.floor(caja.y)),
    x1: Math.min(img.ancho, Math.ceil(caja.x + caja.ancho)),
    y1: Math.min(img.alto, Math.ceil(caja.y + caja.alto)),
  }
}

function mediana(v: number[]): number {
  v.sort((a, b) => a - b)
  return v[Math.floor(v.length / 2)]
}

export interface Mascara {
  /** Índices de píxel (fila × ancho + columna) clasificados como glifo. */
  readonly indices: Int32Array
  /** El papel de la PRIMERA caja, publicado para poder desconfiar de él. */
  readonly papel: readonly [number, number, number]
}

/** La máscara de glifo de B5, caja por caja, sobre la captura T. */
export function mascaraDeGlifo(T: Imagen, cajas: readonly CajaDeTexto[]): Mascara {
  const indices: number[] = []
  let papel: [number, number, number] | null = null
  for (const caja of cajas) {
    const r = acotarCaja(caja, T)
    if (r.x1 <= r.x0 || r.y1 <= r.y0) continue
    const muestras: number[][] = [[], [], []]
    for (let y = r.y0; y < r.y1; y += 1) {
      for (let x = r.x0; x < r.x1; x += 1) {
        const k = (y * T.ancho + x) * 4
        muestras[0].push(T.datos[k])
        muestras[1].push(T.datos[k + 1])
        muestras[2].push(T.datos[k + 2])
      }
    }
    const p: [number, number, number] = [mediana(muestras[0]), mediana(muestras[1]), mediana(muestras[2])]
    if (papel === null) papel = p
    for (let y = r.y0; y < r.y1; y += 1) {
      for (let x = r.x0; x < r.x1; x += 1) {
        const k = (y * T.ancho + x) * 4
        const dT = Math.max(Math.abs(T.datos[k] - p[0]), Math.abs(T.datos[k + 1] - p[1]), Math.abs(T.datos[k + 2] - p[2]))
        if (dT > UMBRAL_DE_GLIFO) indices.push(y * T.ancho + x)
      }
    }
  }
  return { indices: Int32Array.from(indices), papel: papel ?? [0, 0, 0] }
}

/** Compone un canal de tinta sobre un canal de fondo con una alfa, a 8 bits: lo que la pantalla pinta. */
function mezclar(tinta: number, fondo: number, alfa: number): number {
  return Math.round(alfa * tinta + (1 - alfa) * fondo)
}

/**
 * El contraste bajo el glifo, con la tinta compuesta sobre CADA fondo con su
 * opacidad. Con `opacidad = 1` es la función de B5, número por número.
 */
export function contrasteBajoElGlifoConOpacidad(
  T: Imagen,
  A: Imagen,
  cajas: readonly CajaDeTexto[],
  tintaRgb: readonly [number, number, number],
  opacidad: number,
  textoGrande: boolean,
): LecturaDeGlifo & { readonly mascara: Mascara } {
  if (T.ancho !== A.ancho || T.alto !== A.alto) throw new Error('la máscara y el fondo no tienen el mismo tamaño')
  const mascara = mascaraDeGlifo(T, cajas)
  const lumTintaPlena = luminancia(tintaRgb[0], tintaRgb[1], tintaRgb[2])
  const razones = new Float64Array(mascara.indices.length)
  for (let i = 0; i < mascara.indices.length; i += 1) {
    const k = mascara.indices[i] * 4
    const fondo = [A.datos[k], A.datos[k + 1], A.datos[k + 2]] as const
    const lumFondo = luminancia(fondo[0], fondo[1], fondo[2])
    const lumTinta =
      opacidad >= 1
        ? lumTintaPlena
        : luminancia(mezclar(tintaRgb[0], fondo[0], opacidad), mezclar(tintaRgb[1], fondo[1], opacidad), mezclar(tintaRgb[2], fondo[2], opacidad))
    razones[i] = contraste(lumTinta, lumFondo)
  }
  const ordenadas = Array.from(razones).sort((a, b) => a - b)
  const umbral = textoGrande ? AA_TEXTO_GRANDE : AA_TEXTO_NORMAL
  const en = (q: number): number =>
    ordenadas.length === 0 ? Number.NaN : ordenadas[Math.min(ordenadas.length - 1, Math.floor(q * ordenadas.length))]
  const dos = (n: number): number => Math.round(n * 100) / 100
  return {
    pixelesDeGlifo: ordenadas.length,
    papel: mascara.papel,
    peorContraste: ordenadas.length === 0 ? Number.NaN : dos(ordenadas[0]),
    p1Contraste: dos(en(0.01)),
    medianaContraste: dos(en(0.5)),
    bajoAA: ordenadas.filter((r) => r < umbral).length,
    umbralAA: umbral,
    mascara,
  }
}

/** Qué fracción de los píxeles de glifo cae adentro de una silueta (el logo). */
export function fraccionSobreLaSilueta(mascara: Mascara, dentro: Uint8Array): number {
  if (mascara.indices.length === 0) return Number.NaN
  let n = 0
  for (const k of mascara.indices) if (dentro[k] === 1) n += 1
  return n / mascara.indices.length
}

export interface EstadisticaDeLuminancia {
  readonly pixeles: number
  /** Luminancia relativa (0–1, lineal): la magnitud del contraste WCAG. */
  readonly media: number
  readonly varianza: number
  readonly desvio: number
  readonly minimo: number
  readonly maximo: number
  readonly p01: number
  readonly p99: number
  /**
   * El gris en el espacio de la pantalla (0–255, con gamma): la magnitud sobre
   * la que un velo `rgba(…, α)` actúa LINEALMENTE. Un velo de alfa α deja un
   * desvío de (1−α) del original acá, y bastante menos en luminancia lineal,
   * porque la curva de gamma comprime los oscuros. Se publican los dos.
   */
  readonly grisMedio: number
  readonly grisDesvio: number
}

const SIN_PIXELES: EstadisticaDeLuminancia = {
  pixeles: 0, media: Number.NaN, varianza: Number.NaN, desvio: Number.NaN, minimo: Number.NaN, maximo: Number.NaN,
  p01: Number.NaN, p99: Number.NaN, grisMedio: Number.NaN, grisDesvio: Number.NaN,
}

function mediaYDesvio(valores: readonly number[]): { media: number; varianza: number } {
  let suma = 0
  for (const v of valores) suma += v
  const media = suma / valores.length
  let s2 = 0
  for (const v of valores) s2 += (v - media) * (v - media)
  return { media, varianza: s2 / valores.length }
}

/** La luminancia relativa de una región, resumida. `excluir` saca píxeles (los glifos) de la cuenta. */
export function estadisticaDeLuminancia(img: Imagen, region: Region, excluir?: Uint8Array): EstadisticaDeLuminancia {
  const valores: number[] = []
  const grises: number[] = []
  for (let y = Math.max(0, region.y0); y < Math.min(img.alto, region.y1); y += 1) {
    for (let x = Math.max(0, region.x0); x < Math.min(img.ancho, region.x1); x += 1) {
      const i = y * img.ancho + x
      if (excluir !== undefined && excluir[i] === 1) continue
      const k = i * 4
      valores.push(luminancia(img.datos[k], img.datos[k + 1], img.datos[k + 2]))
      grises.push(0.2126 * img.datos[k] + 0.7152 * img.datos[k + 1] + 0.0722 * img.datos[k + 2])
    }
  }
  if (valores.length === 0) return SIN_PIXELES
  const { media, varianza } = mediaYDesvio(valores)
  const gris = mediaYDesvio(grises)
  const ordenados = valores.slice().sort((a, b) => a - b)
  const en = (q: number): number => ordenados[Math.min(ordenados.length - 1, Math.floor(q * ordenados.length))]
  return {
    pixeles: valores.length,
    media,
    varianza,
    desvio: Math.sqrt(varianza),
    minimo: ordenados[0],
    maximo: ordenados[ordenados.length - 1],
    p01: en(0.01),
    p99: en(0.99),
    grisMedio: gris.media,
    grisDesvio: Math.sqrt(gris.varianza),
  }
}

/** Una máscara de un byte por píxel con los glifos de varias máscaras, para excluirlos. */
export function unionDeMascaras(total: number, mascaras: readonly Mascara[]): Uint8Array {
  const dentro = new Uint8Array(total)
  for (const m of mascaras) for (const k of m.indices) dentro[k] = 1
  return dentro
}
