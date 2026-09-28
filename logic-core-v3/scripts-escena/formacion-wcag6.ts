/**
 * SPRINT ESCENA 6 · 2 — el texto con la formación y sin ella, en contraste WCAG. formacion-wcag6.ts
 *
 * En la misma carga y el mismo cuadro: una toma con la formación, otra sin (`__formacionDelBanco`) y
 * otra con (el ruido: el polvo y la trama se mueven entre tomas). Por cada elemento de texto a la
 * vista, la razón WCAG de `wcag6.ts`. Vale el peor elemento y la peor caída de un mismo elemento.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, type Banco } from '../scripts-viajes/banco'
import { CONTADOR, DIR6, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'
import { cajasConColor } from './fondos6'
import { wcag } from './wcag6'

async function toma(b: Banco): Promise<Buffer> {
  await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(0)))))')
  const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(s.data, 'base64')
}

async function principal(): Promise<void> {
  const filas: unknown[] = []
  for (const variante of ['producto,formacion', 'producto,formacion,fallas=no']) {
    const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${variante}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}` })
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
  writeFileSync(`${DIR6}/formacion/texto-wcag-1440.json`, JSON.stringify(filas, null, 1))
}

if (process.argv[1]?.endsWith('formacion-wcag6.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
