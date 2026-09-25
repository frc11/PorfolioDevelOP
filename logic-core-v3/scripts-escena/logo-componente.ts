/**
 * SPRINT ESCENA 2 — el logo como la MANCHA OSCURA CONEXA MÁS GRANDE de la escena sola.
 * logo-componente.ts <nombre> [<nombre>...]
 *
 * `logo.ts` mide toda la tinta por debajo de una luminancia; eso suma lo que no es el logo (el
 * distintivo del dev abajo a la izquierda, las zonas oscuras de la celosía y de la sombra del sol en
 * ACTUAL). Acá se queda sólo con la componente conexa más grande de esa tinta (vecindad de 4), que es
 * el logo, y da su caja, su centro y su área, para cada toma guardada por `logo.ts`.
 */
import { readFileSync } from 'node:fs'

import { decodificarPng } from '../scripts-b4/png'

const DIR = 'C:/Users/Valentino/.cache/b4-medicion/escena2/logo'
const UMBRAL = 60

export interface Mancha {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
  readonly cx: number
  readonly cy: number
  readonly area: number
}

export function manchaMayor(png: Buffer): Mancha {
  const img = decodificarPng(png)
  const { ancho, alto, datos } = img
  const oscuro = new Uint8Array(ancho * alto)
  for (let p = 0; p < ancho * alto; p += 1) {
    const i = p * 4
    oscuro[p] = 0.2126 * datos[i] + 0.7152 * datos[i + 1] + 0.0722 * datos[i + 2] < UMBRAL ? 1 : 0
  }
  const visto = new Uint8Array(ancho * alto)
  let mejor: Mancha | null = null
  const pila: number[] = []
  for (let inicio = 0; inicio < ancho * alto; inicio += 1) {
    if (oscuro[inicio] === 0 || visto[inicio] === 1) continue
    let [x0, y0, x1, y1, sx, sy, n] = [Infinity, Infinity, -Infinity, -Infinity, 0, 0, 0]
    visto[inicio] = 1
    pila.push(inicio)
    while (pila.length > 0) {
      const p = pila.pop() as number
      const x = p % ancho
      const y = (p - x) / ancho
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
      sx += x; sy += y; n += 1
      for (const q of [x > 0 ? p - 1 : -1, x < ancho - 1 ? p + 1 : -1, y > 0 ? p - ancho : -1, y < alto - 1 ? p + ancho : -1]) {
        if (q < 0 || oscuro[q] === 0 || visto[q] === 1) continue
        visto[q] = 1
        pila.push(q)
      }
    }
    if (mejor === null || n > mejor.area) mejor = { x0, y0, x1, y1, cx: Math.round((sx / n) * 10) / 10, cy: Math.round((sy / n) * 10) / 10, area: n }
  }
  if (mejor === null) throw new Error('no hay tinta')
  return mejor
}

if (process.argv[1]?.endsWith('logo-componente.ts')) {
  for (const nombre of process.argv.slice(2)) {
    for (const momento of ['por-que-develop', 'pie']) {
      const tomas = [0, 1, 2].map((t) => manchaMayor(readFileSync(`${DIR}/${nombre}-${momento}-1440-${String(t)}.png`)))
      console.log(JSON.stringify({ nombre, momento, tomas }))
    }
  }
}
