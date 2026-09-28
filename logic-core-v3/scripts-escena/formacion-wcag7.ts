/**
 * SPRINT ESCENA 7 — el texto con la formación y sin ella, en contraste WCAG. formacion-wcag7.ts "<variantes>" <carpeta>
 *
 * Lo de `formacion-wcag6.ts` sobre las variantes pedidas (con la formación encendida en el producto):
 * en la misma carga y el mismo cuadro, una toma con la formación, otra sin (`__formacionDelBanco`) y
 * otra con (el ruido). Por cada elemento de texto a la vista, la razón WCAG de `wcag6.ts`. Vale el peor
 * elemento y la peor caída de un mismo elemento. Va a `escena7/<carpeta>/texto-wcag-1440.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import type { Banco } from '../scripts-viajes/banco'
import { MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'
import { abrir7, carpeta7 } from './banco7'
import { cajasConColor } from './fondos6'
import { wcag } from './wcag6'

const VARIANTES = (process.argv[2] ?? 'producto').split(' ').filter(Boolean)
const CARPETA = process.argv[3] ?? 'formacion'

async function toma(b: Banco): Promise<Buffer> {
  await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(0)))))')
  const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(s.data, 'base64')
}

async function principal(): Promise<void> {
  const filas: unknown[] = []
  for (const variante of VARIANTES) {
    const b = await abrir7(variante)
    try {
      const sello = await selloDeCarga(b)
      for (const momento of MOMENTOS) {
        await capturarMomento(b, momento, sello)
        const cajas = (await cajasConColor(b)) as Parameters<typeof wcag>[1]
        const con = wcag(await toma(b), cajas)
        await medir(b.p, 'window.__formacionDelBanco.mostrar(false, true)')
        const sin = wcag(await toma(b), cajas)
        await medir(b.p, 'window.__formacionDelBanco.mostrar(true, true)')
        const otra = wcag(await toma(b), cajas)
        const caida = (a: typeof con, z: typeof con): { texto: string; caida: number } =>
          a.map((e, i) => ({ texto: e.texto, caida: (1 - e.razon / z[i].razon) * 100 })).reduce((x, y) => (y.caida > x.caida ? y : x), { texto: '-', caida: 0 })
        const minimo = (r: typeof con): number => Math.min(...r.map((e) => e.razon))
        const fila = {
          variante,
          momento: momento.nombre,
          textos: cajas.length,
          conFormacion: minimo(con),
          sinFormacion: minimo(sin),
          peorCaida: caida(con, sin),
          ruido: caida(otra, con).caida,
          bajoAA: con.filter((e) => e.razon < e.aa).map((e) => `${e.texto} ${String(e.razon)}`),
        }
        filas.push(fila)
        console.log(JSON.stringify(fila))
      }
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${carpeta7(CARPETA)}/texto-wcag-1440.json`, JSON.stringify(filas, null, 1))
}

if (process.argv[1]?.endsWith('formacion-wcag7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
