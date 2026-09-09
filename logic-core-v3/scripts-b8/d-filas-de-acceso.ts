/**
 * LAS FILAS DE `CONTRASTE_CONTRA_LA_ESCENA`, DERIVADAS DEL BARRIDO — no escritas.
 *
 *     npx tsx scripts-b8/d-filas-de-acceso.ts [etiqueta]
 *
 * Lee `docs/rediseno/outputs/b8/c-las-ocho-<etiqueta>.json` y, por cada
 * sección que deja ver la escena, agrupa los bloques por la tinta que llevan
 * —el `rgb()` capturado se traduce al token del tema, y la opacidad efectiva
 * al alfa que el modelo de `s10-acceso-color` reconoce— y publica la PEOR
 * lectura de cada (sección, tinta) con el bloque, la posición y el instrumento.
 * Es lo que se transcribe a `s10-acceso-escena.ts`: cada fila con su recibo.
 */

import { readFileSync } from 'node:fs'

import { ALFA_CASI, COLOR } from '../src/app/v3/_lib/__tests__/s10-acceso-color'

interface Bloque {
  readonly clave: string
  readonly texto: string
  readonly tinta: readonly [number, number, number]
  readonly opacidad: number
  readonly scrollY: number
  readonly pixelesDeGlifo: number
  readonly peorContraste: number
  readonly peorAPlena: number
  readonly pasaAA: boolean
  readonly bajoAA: number
}

interface Seccion {
  readonly id: string
  readonly superficieAlMedir: string
  readonly peorPorBloque: readonly Bloque[]
  readonly posiciones: readonly { readonly scrollY: number }[]
}

const etiqueta = process.argv[2] ?? 'despues'
const ruta = `docs/rediseno/outputs/b8/c-las-ocho-${etiqueta}.json`
const json = JSON.parse(readFileSync(ruta, 'utf8')) as { readonly secciones: readonly Seccion[] }

const hexDe = (rgb: readonly [number, number, number]): string =>
  `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
const TOKENS: Readonly<Record<string, string>> = {
  [COLOR.tintaClara.toUpperCase()]: '--color-tinta',
  [COLOR.tintaInvertida.toUpperCase()]: '--color-tinta',
  [COLOR.media.toUpperCase()]: '--color-tinta-media',
  [COLOR.mediaInvertida.toUpperCase()]: '--color-tinta-media',
  [COLOR.tenue.toUpperCase()]: '--color-tinta-tenue',
  [COLOR.tenueInvertida.toUpperCase()]: '--color-tinta-tenue',
  [COLOR.acentoWeb.toUpperCase()]: '--color-acento',
  [COLOR.acentoIa.toUpperCase()]: '--color-acento',
  [COLOR.acentoSoftware.toUpperCase()]: '--color-acento',
}
const alfaDe = (opacidad: number): number => (Math.abs(opacidad - ALFA_CASI) < 0.02 ? ALFA_CASI : opacidad >= 0.98 ? 1 : Math.round(opacidad * 100) / 100)

console.log(`filas derivadas de ${ruta}\n`)
for (const s of json.secciones) {
  if (!s.superficieAlMedir.endsWith('transparente')) continue
  const grupos = new Map<string, Bloque[]>()
  for (const b of s.peorPorBloque) {
    const token = TOKENS[hexDe(b.tinta)] ?? `rgb(${b.tinta.join(',')})`
    const clave = `${token}@${alfaDe(b.opacidad)}`
    grupos.set(clave, [...(grupos.get(clave) ?? []), b])
  }
  console.log(`── ${s.id} (${s.superficieAlMedir}) · ${s.peorPorBloque.length} bloques en ${s.posiciones.length} posiciones`)
  for (const [clave, bloques] of grupos) {
    const peor = bloques.reduce((a, b) => (b.peorContraste < a.peorContraste ? b : a))
    const fallan = bloques.filter((b) => !b.pasaAA)
    const rango = `${Math.min(...bloques.map((b) => b.peorContraste)).toFixed(2)}–${Math.max(...bloques.map((b) => b.peorContraste)).toFixed(2)}`
    console.log(
      `   ${clave.padEnd(28)} ${bloques.length} bloques · peor ${peor.peorContraste.toFixed(2)}:1 «${peor.texto.slice(0, 40)}» en y=${peor.scrollY} (${peor.pixelesDeGlifo} px de glifo, ${peor.bajoAA} bajo AA${peor.opacidad < 0.98 ? `, a plena ${peor.peorAPlena.toFixed(2)}` : ''}) · ${fallan.length} fallan AA · rango ${rango}`,
    )
  }
}
