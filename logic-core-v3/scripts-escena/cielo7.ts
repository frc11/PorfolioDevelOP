/**
 * SPRINT ESCENA 7 — T2, cuánto cielo deja la formación: cielo7.ts
 *
 * En cada punto del recorrido, la máscara de la formación sale como en `formacion.ts`: la escena sola con
 * todo, sin la formación y sin el logo, dos veces (sólo cuentan los píxeles quietos). Por columna, el cielo
 * es lo que queda ARRIBA de la copia más alta (lo que se ve a través de la trama), menos el logo que lo
 * tape. Las columnas sin ninguna copia a la vista (el logo delante, o la formación fuera del cuadro) se
 * cuentan aparte. Escribe `escena7/formacion/cielo.json` y los controles `cielo-<dónde>.png`.
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { contrasteDeLaFormacion, type Tomas } from './contraste-formacion'
import { abrir7, carpeta7 } from './banco7'
import { scrollDe } from './foto7'
import { escenaSola } from './logo'

const DONDES = [
  ['hero', '0'],
  ['quienes-somos', 'quienes-somos+0.15'],
  ['numeros-de-noche', '3900'],
  ['trabajos-de-noche', 'trabajos+0'],
  ['por-que-develop', 'por-que-develop+0.7'],
  ['pie', 'pie'],
] as const

async function tomas(b: Banco): Promise<Tomas> {
  const toma = async (formacion: boolean, logo: boolean): Promise<Buffer> => {
    await medir(b.p, `window.__formacionDelBanco.mostrar(${String(formacion)}, ${String(logo)})`)
    return escenaSola(b)
  }
  const t = { a: await toma(true, true), sinFormacion: await toma(false, true), sinLogo: await toma(true, false) }
  await medir(b.p, 'window.__formacionDelBanco.mostrar(true, true)')
  return t
}

/** Del control de las máscaras (formación en naranja, logo en azul): el cielo por columna. */
function cieloDelControl(png: string): { cielo: number; columnasSinCopias: number; alturaMedia: number } {
  const img = decodificarPng(readFileSync(png))
  const { ancho, alto, datos } = img
  const es = (p: number, r: number, g: number, b: number): boolean => datos[p * 4] === r && datos[p * 4 + 1] === g && datos[p * 4 + 2] === b
  let cielo = 0
  let columnas = 0
  let sin = 0
  let tope = 0
  for (let x = 0; x < ancho; x += 1) {
    let y0 = -1
    for (let y = 0; y < alto; y += 1) {
      if (es(y * ancho + x, 255, 150, 0)) {
        y0 = y
        break
      }
    }
    if (y0 < 0) {
      sin += 1
      continue
    }
    columnas += 1
    tope += y0
    for (let y = 0; y < y0; y += 1) if (!es(y * ancho + x, 40, 90, 255)) cielo += 1
  }
  return { cielo: Math.round((cielo / (Math.max(1, columnas) * alto)) * 1000) / 10, columnasSinCopias: sin, alturaMedia: Math.round(tope / Math.max(1, columnas)) }
}

async function principal(): Promise<void> {
  const dir = carpeta7('formacion')
  const filas: unknown[] = []
  const b = await abrir7('producto')
  try {
    for (const [nombre, donde] of DONDES) {
      const y = donde === 'pie' ? await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight') : await scrollDe(b, donde)
      await scrollHasta(b, y)
      await esperar(2500)
      const camara = await medir<number[]>(b.p, 'window.__polvoDelBanco.camara()')
      const control = `${dir}/cielo-${nombre}.png`
      contrasteDeLaFormacion(await tomas(b), await tomas(b), control)
      const cielo = cieloDelControl(control)
      // La mirada: cuántos grados sube o baja la cámara.
      const mira = Math.round((Math.asin(Math.max(-1, Math.min(1, camara[4]))) * 180 * 10) / Math.PI) / 10
      const fila = { donde: nombre, y, miraGrados: mira, cieloPorciento: cielo.cielo, bordeDeLaFormacionPx: cielo.alturaMedia, columnasSinCopias: cielo.columnasSinCopias }
      filas.push(fila)
      console.log(JSON.stringify(fila))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/cielo.json`, JSON.stringify(filas, null, 1))
}

if (process.argv[1]?.endsWith('cielo7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
