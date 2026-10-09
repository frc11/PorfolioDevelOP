import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datosNormal from '../../../_fuentes/archivo-normal-cta.json'
import datosNormalFuerte from '../../../_fuentes/archivo-normal-cta-fuerte.json'

/**
 * [PULIDO 5] D1 · LAS FUENTES DE LA FRASE Y DEL CTA DEL FINAL, CON SU KERNING — Archivo del TTF variable entero, en wdth 100
 * ([PULIDO 6] E1 · `?ancho=expandido` se borró; `scripts-retoque/fuentes-3d.py`): la frase en 600 (un peso de título) y el destacado y «HABLANOS» en 900 (el más
 * pesado). Cada letra va en su avance MÁS el kerning del par con la anterior (los pares del GPOS de la fuente, en sus
 * unidades: `kerning` del JSON) y el interletrado ajustado de display (`TRACKING_DEL_CTA`, em). Puras: el invariante las mide.
 */

export interface FuenteConKerning {
  readonly fuente: Font
  /** Los pares (dos caracteres) y cuánto se corre la segunda letra, en unidades de la fuente. */
  readonly kerning: Readonly<Record<string, number>>
}

type DatosConKerning = FontData & { readonly kerning?: Readonly<Record<string, number>> }
const conKerning = (datos: DatosConKerning): FuenteConKerning => ({ fuente: new Font(datos), kerning: datos.kerning ?? {} })

export const FUENTES_DEL_CTA: { readonly frase: FuenteConKerning; readonly fuerte: FuenteConKerning } = {
  frase: conKerning(datosNormal as DatosConKerning),
  fuerte: conKerning(datosNormalFuerte as DatosConKerning),
}

/** El interletrado de display (em): apretado, más en el peso más pesado. */
export const TRACKING_DEL_CTA = { frase: -0.012, fuerte: -0.02 } as const

export interface Avances {
  /** La x (em, desde el comienzo del renglón) de cada carácter que no es espacio. */
  readonly x: number[]
  /** El ancho del renglón (em): del comienzo al final del avance de la última letra. */
  readonly ancho: number
}

/** Dónde va cada letra de `texto` (em): su avance, el kerning con la anterior y el interletrado. */
export function avancesDe(f: FuenteConKerning, texto: string, tracking: number): Avances {
  const { glyphs, resolution } = f.fuente.data
  const x: number[] = []
  let a = 0
  let anterior = ''
  for (const c of texto) {
    if (anterior !== '') a += ((f.kerning[anterior + c] ?? 0) / resolution) + tracking
    if (c.trim() !== '') x.push(a)
    a += (glyphs[c]?.ha ?? 0) / resolution
    anterior = c
  }
  return { x, ancho: a }
}
