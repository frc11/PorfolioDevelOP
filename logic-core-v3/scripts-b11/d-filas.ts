/**
 * D · LAS FILAS DE `CONTRASTE_CONTRA_LA_ESCENA`, DERIVADAS DEL BARRIDO DE B11 —
 * la peor de los tres anchos, nunca escrita a mano.
 *
 *     npx tsx scripts-b11/d-filas.ts --etiqueta=despues
 *
 * Es `scripts-b8/d-filas-de-acceso.ts` con dos diferencias: lee los tres
 * JSON de `b-bloques.ts` (uno por ancho) y publica, por (sección, tinta), la
 * PEOR lectura entre los tres, con el ancho, el bloque y la posición en que
 * cae. Lo que sale de acá es lo que se transcribe a `s10-acceso-escena.ts`:
 * cada fila con su recibo, y con el ancho que la firma.
 */

import { readFileSync } from 'node:fs'

import { ALFA_CASI, COLOR } from '../src/app/v3/_lib/__tests__/s10-acceso-color'

import { PERFILES_DE_B11, RAIZ_DE_SALIDAS, argumento } from './b11-comun'

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

const hexDe = (rgb: readonly [number, number, number]): string => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
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

interface Lectura {
  readonly perfil: string
  readonly bloque: Bloque
  readonly bloques: number
  readonly fallan: number
  readonly posiciones: number
}

function principal(): void {
  const etiqueta = argumento('etiqueta', 'antes')
  const perfiles = argumento('perfil', PERFILES_DE_B11.map((p) => p.id).join(',')).split(',')
  /** (sección, tinta) → la peor lectura por ancho. */
  const filas = new Map<string, Lectura[]>()
  for (const perfil of perfiles) {
    const ruta = `${RAIZ_DE_SALIDAS}/bloques-${etiqueta}-${perfil}.json`
    const json = JSON.parse(readFileSync(ruta, 'utf8')) as { readonly secciones: readonly Seccion[] }
    for (const s of json.secciones) {
      if (!s.superficieAlMedir.endsWith('transparente')) continue
      const grupos = new Map<string, Bloque[]>()
      for (const b of s.peorPorBloque) {
        const token = TOKENS[hexDe(b.tinta)] ?? `rgb(${b.tinta.join(',')})`
        const clave = `${s.id}|${token}@${alfaDe(b.opacidad)}`
        grupos.set(clave, [...(grupos.get(clave) ?? []), b])
      }
      for (const [clave, bloques] of grupos) {
        const peor = bloques.reduce((a, b) => (b.peorContraste < a.peorContraste ? b : a))
        filas.set(clave, [...(filas.get(clave) ?? []), { perfil, bloque: peor, bloques: bloques.length, fallan: bloques.filter((b) => !b.pasaAA).length, posiciones: s.posiciones.length }])
      }
    }
  }
  console.log(`filas derivadas de bloques-${etiqueta}-{${perfiles.join(',')}}.json — la PEOR de los anchos manda\n`)
  for (const [clave, lecturas] of filas) {
    const [seccion, tinta] = clave.split('|')
    const peor = lecturas.reduce((a, b) => (b.bloque.peorContraste < a.bloque.peorContraste ? b : a))
    const b = peor.bloque
    const porAncho = lecturas.map((l) => `${l.perfil}: ${l.bloque.peorContraste.toFixed(2)} (${l.fallan}/${l.bloques})`).join(' · ')
    console.log(`  { seccion: '${seccion}', tinta: '${tinta}', razon: ${b.peorContraste.toFixed(2)},`)
    console.log(`    instrumento: 'B11 — b-bloques ${etiqueta}, ${peor.perfil}×, paso 0,25: ${peor.bloques} bloques en ${peor.posiciones} posiciones, ${peor.fallan} bajo AA; el peor es «${b.texto.slice(0, 40)}» en y=${b.scrollY} (${b.pixelesDeGlifo} px de glifo, ${b.bajoAA} bajo AA${b.opacidad < 0.98 ? `, a plena ${b.peorAPlena.toFixed(2)}` : ''}). Por ancho: ${porAncho}' }`)
  }
}

principal()
