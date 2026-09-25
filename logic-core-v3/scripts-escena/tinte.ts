/**
 * SPRINT ESCENA 2 — cuánto tiñe una variante: el color medio de la franja de abajo (piso y bruma,
 * sin el logo) contra BASE, en los cinco momentos. tinte.ts <variante> [ancho]
 */
import { readFileSync } from 'node:fs'

import { decodificarPng } from '../scripts-b4/png'

const DIR = 'C:/Users/Valentino/.cache/b4-medicion/escena2/entorno'
const [VARIANTE, ANCHO] = [process.argv[2] ?? "E3", process.argv[3] ?? "1440"]
const [DESDE, HASTA] = [Number(process.argv[4] ?? 0.62), Number(process.argv[5] ?? 0.95)]

function medio(archivo: string): [number, number, number] {
  const img = decodificarPng(readFileSync(archivo))
  const suma = [0, 0, 0]
  let n = 0
  for (let y = Math.round(img.alto * DESDE); y < Math.round(img.alto * HASTA); y += 2) {
    for (let x = 0; x < img.ancho; x += 2) {
      const i = (y * img.ancho + x) * 4
      suma[0] += img.datos[i]; suma[1] += img.datos[i + 1]; suma[2] += img.datos[i + 2]
      n += 1
    }
  }
  return [suma[0] / n, suma[1] / n, suma[2] / n]
}

for (const m of ['hero', 'quienes-somos', 'trabajos-de-noche', 'por-que-develop', 'pie']) {
  const a = medio(`${DIR}/${m}-${ANCHO}-base.png`)
  const b = medio(`${DIR}/${m}-${ANCHO}-${VARIANTE}.png`)
  const f = (c: number[]): string => c.map((v) => v.toFixed(1)).join(' / ')
  console.log(`${m.padEnd(18)} base ${f(a)}  ${VARIANTE} ${f(b)}  dif ${f(b.map((v, i) => v - a[i]))}`)
}
