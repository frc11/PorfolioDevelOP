/**
 * SPRINT ESCENA 10 — T2 · de qué tamaño se ve el video de Servicios: t2-tamano.ts [anchos]
 *
 * Para elegir la menor resolución que se vea igual: a cada ancho de ventana (alto 16:10 o 16:9), el tamaño del video en
 * px CSS con Servicios en pantalla. Va a `escena10/t2-video/tamano.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { abrir, carpeta } from './banco'

const ANCHOS: readonly (readonly [number, number])[] = (process.argv[2] ?? '1440x900 1920x1080 2560x1440 1280x800')
  .split(' ')
  .map((s) => s.split('x').map(Number) as [number, number])

async function principal(): Promise<void> {
  const filas: unknown[] = []
  for (const [ancho, alto] of ANCHOS) {
    const b = await abrir('producto', ancho, alto)
    try {
      await medir(b.p, `(() => { const v = document.querySelector('video[data-pieza="video-de-servicio"]'); v.scrollIntoView({ block: 'center' }); return true })()`)
      await esperar(2500)
      const r = await medir<unknown>(b.p, `(() => { const v = document.querySelector('video[data-pieza="video-de-servicio"]'); const r = v.getBoundingClientRect(); return { ancho: ${String(ancho)}, alto: ${String(alto)}, video: [Math.round(r.width), Math.round(r.height)], fuente: [v.videoWidth, v.videoHeight], dpr: devicePixelRatio } })()`)
      filas.push(r)
      console.log(JSON.stringify(r))
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${carpeta('t2-video')}/tamano.json`, JSON.stringify(filas, null, 1))
}

if (process.argv[1]?.endsWith('t2-tamano.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
