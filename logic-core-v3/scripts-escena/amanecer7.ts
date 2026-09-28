/**
 * SPRINT ESCENA 7 — T11, el amanecer en cada momento: amanecer7.ts [carpeta]
 *
 * Con la bandera, baja hasta que Tu panel deja ver la sala (arranca el amanecer) y sigue hasta que el borde
 * de Tu panel queda arriba (`MIRADA` del cuadro), para que se vea la sala; ahí congela el amanecer en cada
 * momento y saca una foto. Va a `escena7/amanecer/cuadros/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { foto } from './banco-escena'
import { abrir7, carpeta7 } from './banco7'

const CARPETA = process.argv[2] ?? 'amanecer/cuadros'
/** Dónde queda el borde de Tu panel para mirar: arriba del cuadro, la sala entera a la vista. */
const MIRADA = 0.12
export const MOMENTOS_DEL_AMANECER = [
  [0, 'noche'],
  [0.6, 'se-apagan-las-estrellas'],
  [1.9, 'resplandor-contraluz'],
  [3.2, 'frente-en-la-formacion'],
  [4.4, 'frente-en-las-primeras-filas'],
  [4.9, 'rayos-por-la-trama'],
  [5.8, 'el-piso-vivo'],
  [6.7, 'por-ultimo-el-logo'],
  [7.8, 'dia'],
] as const

async function principal(): Promise<void> {
  const dir = carpeta7(CARPETA)
  const b = await abrir7('producto,amanecer')
  try {
    const puerta = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 0.8) })()`)
    const mirada = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * ${String(MIRADA)}) })()`)
    await scrollHasta(b, puerta - 400)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(0)')
    await scrollHasta(b, mirada)
    for (const [s, nombre] of MOMENTOS_DEL_AMANECER) {
      await medir(b.p, `window.__amanecerDelBanco.congelar(${String(s)})`)
      await esperar(1200)
      writeFileSync(`${dir}/${String(s).replace('.', '_')}-${nombre}.png`, await foto(b))
      console.log(JSON.stringify({ s, nombre, estado: await medir<unknown>(b.p, 'window.__amanecerDelBanco.estado()') }))
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('amanecer7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
