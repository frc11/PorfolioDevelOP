/**
 * PASADA FINAL · D2 — EL TACHADO QUE DESPINTA, EN 3D Y EN 2D: npx tsx scripts-pasada/d2-tachado.ts
 *
 * En Quiénes somos (1440×900), busca en el scroll los puntos donde el tachado del DOM va por 0, la mitad y el final
 * (`--trazo-despinte` en `[data-trazo="tachado"]`), y en cada uno captura la caja de «lo mismo de siempre» y mide el
 * gris de sus letras (la media de los píxeles más oscuros de la caja). Lo hace en el producto (3D) y con `titulos=no`
 * (el DOM): el 3D tiene que aclararse como el 2D. Va a `~/.cache/b4-medicion/pasada-final/d2/`. Pide el servidor.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { captura, esperar } from '../scripts-viajes/banco'

const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/pasada-final/d2'

/** La media de luminancia (0 a 255) del 20 % de píxeles más oscuros de un PNG recortado (gris de 8 bits, vía ffmpeg). */
function grisDeLasLetras(png: string): number {
  const crudo = `${png}.gray`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-f', 'rawvideo', '-pix_fmt', 'gray', crudo])
  const datos = [...readFileSync(crudo)].sort((a, b) => a - b)
  const n = Math.max(1, Math.floor(datos.length * 0.2))
  return Math.round(datos.slice(0, n).reduce((s, v) => s + v, 0) / n)
}

async function una(pedido: string, rotulo: string): Promise<Record<string, unknown>[]> {
  const b = await abrir(pedido, 1440, 900)
  const filas: Record<string, unknown>[] = []
  try {
    await mover(b, 8, 450)
    const inicio = await medir<number>(b.p, `(() => { const s = document.querySelector('[data-panel="quienes-somos"]'); return Math.round(s.getBoundingClientRect().top + scrollY) })()`)
    const metas = [0, 0.5, 1]
    let k = 0
    for (let y = inicio - 600; y < inicio + 4000 && k < metas.length; y += 20) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(60)
      const d = await medir<number>(b.p, `(() => { const el = [...document.querySelectorAll('[data-trazo="tachado"]')].find((e) => e.getBoundingClientRect().width > 0); if (!el) return -1; const v = getComputedStyle(el).getPropertyValue('--trazo-despinte'); return v === '' ? -1 : Number(v) })()`)
      if (d < 0 || d < metas[k] - 0.02) continue
      await esperar(2200)
      const despues = await medir<number>(b.p, `Number(getComputedStyle([...document.querySelectorAll('[data-trazo="tachado"]')].find((e) => e.getBoundingClientRect().width > 0)).getPropertyValue('--trazo-despinte'))`)
      const caja = await medir<{ x: number; y: number; w: number; h: number }>(b.p, `(() => { const r = [...document.querySelectorAll('[data-trazo="tachado"]')].find((e) => e.getBoundingClientRect().width > 0).getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } })()`)
      const png = `${SALIDA}/${rotulo}-${String(metas[k])}.png`
      await captura(b, png)
      // La caja, dentro del cuadro (si quedó afuera, la medición no vale y se anota).
      const [x0, y0] = [Math.max(0, caja.x), Math.max(0, caja.y)]
      const [w0, h0] = [Math.min(1440 - x0, caja.w), Math.min(900 - y0, caja.h)]
      if (w0 < 8 || h0 < 8) {
        filas.push({ rotulo, meta: metas[k], y, despinte: +despues.toFixed(2), caja, gris: null })
        console.log('caja fuera del cuadro', JSON.stringify(caja))
        k += 1
        continue
      }
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-vf', `crop=${String(w0)}:${String(h0)}:${String(x0)}:${String(y0)}`, `${png}.caja.png`])
      filas.push({ rotulo, meta: metas[k], y, despinte: +despues.toFixed(2), caja, gris: grisDeLasLetras(`${png}.caja.png`) })
      console.log(JSON.stringify(filas[filas.length - 1]))
      k += 1
    }
  } finally {
    await b.cerrar()
  }
  return filas
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const filas = [...(await una('producto', '3d')), ...(await una('producto,titulos=no', '2d'))]
  writeFileSync(`${SALIDA}/tachado.json`, JSON.stringify(filas, null, 1))
}

if (process.argv[1]?.endsWith('d2-tachado.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
