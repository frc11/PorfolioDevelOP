import { decodificarPng } from '../scripts-b4/png'

import { readFileSync } from 'node:fs'

/**
 * LA SILUETA DEL LOGO EN UNA CAPTURA — componente conexa oscura más grande.
 *
 * Existe para contestar una pregunta geométrica y nada más: **¿este píxel cae
 * sobre el objeto o sobre la sala?** Es lo que separa «texto ilegible sobre
 * tinta» —un defecto— de «el instrumento marcó un borde que se movió» —un
 * artefacto—, y las dos cosas se ven igual en una tabla de contraste.
 *
 * ⚠️ **Sale de la captura de FONDO, no de la de texto.** Con el texto oculto lo
 * único oscuro y grande que queda en cuadro es el logo; con el texto encima, el
 * titular sería otra componente oscura y podría unirse a él.
 *
 * El área mínima descarta las motas de polvo, que también son oscuras y también
 * son componentes conexas.
 */

export interface Imagen {
  readonly datos: Uint8Array
  readonly ancho: number
  readonly alto: number
}

export function leerImagen(ruta: string): Imagen {
  const img = decodificarPng(readFileSync(ruta))
  return { datos: img.datos, ancho: img.ancho, alto: img.alto }
}

export interface Silueta {
  /** Máscara de un byte por píxel: 1 si el píxel pertenece a la silueta. */
  readonly dentro: Uint8Array
  readonly area: number
  /** `[minx, miny, maxx, maxy]`, o vacío si no se encontró ninguna. */
  readonly caja: readonly number[]
}

export function siluetaMasGrande(A: Imagen, tintaMaxima: number, areaMinima: number): Silueta {
  const total = A.ancho * A.alto
  const tinta = new Uint8Array(total)
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    if (Math.max(A.datos[k], A.datos[k + 1], A.datos[k + 2]) < tintaMaxima) tinta[i] = 1
  }
  const visto = new Uint8Array(total)
  const pila = new Int32Array(total)
  let mejor: { pixeles: Int32Array; n: number; caja: number[] } | null = null

  for (let i = 0; i < total; i += 1) {
    if (tinta[i] === 0 || visto[i] === 1) continue
    let tope = 0
    let n = 0
    const acumulado: number[] = []
    let minx = A.ancho
    let maxx = -1
    let miny = A.alto
    let maxy = -1
    pila[tope] = i
    tope += 1
    visto[i] = 1
    while (tope > 0) {
      tope -= 1
      const k = pila[tope]
      acumulado.push(k)
      n += 1
      const x = k % A.ancho
      const y = (k / A.ancho) | 0
      if (x < minx) minx = x
      if (x > maxx) maxx = x
      if (y < miny) miny = y
      if (y > maxy) maxy = y
      const vecinos = [
        x > 0 ? k - 1 : -1,
        x < A.ancho - 1 ? k + 1 : -1,
        y > 0 ? k - A.ancho : -1,
        y < A.alto - 1 ? k + A.ancho : -1,
      ]
      for (const v of vecinos) {
        if (v >= 0 && tinta[v] === 1 && visto[v] === 0) {
          visto[v] = 1
          pila[tope] = v
          tope += 1
        }
      }
    }
    if (n >= areaMinima && (mejor === null || n > mejor.n)) {
      mejor = { pixeles: Int32Array.from(acumulado), n, caja: [minx, miny, maxx, maxy] }
    }
  }

  const dentro = new Uint8Array(total)
  if (mejor !== null) for (const k of mejor.pixeles) dentro[k] = 1
  return { dentro, area: mejor?.n ?? 0, caja: mejor?.caja ?? [] }
}
