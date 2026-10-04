/**
 * PASADA FINAL · 0 — LAS LLEGADAS DE PORTFOLIO, GRABADAS: npx tsx scripts-pasada/p0-variantes.ts [actual|e9|e10|3ds|lejos …]
 *
 * Para cada una (sin nombre, todas): abre /v3 con la prueba (`producto,portfolio=…`; `actual` sin ella), mide dónde el
 * título de Portfolio empieza a llegar y dónde está entero, y graba la llegada con el MISMO gesto que el clip aprobado de
 * ESCENA 10 (`scripts-escena10/t3-clips.ts`: parado 500 px antes de terminar, scroll suave de 4 s hasta el medio de la
 * lectura). Saca una hoja de cuadros (10 por segundo, el segundo de la llegada) para compararla con la de entonces. Va a
 * `~/.cache/b4-medicion/pasada-final/p0/`. Pide el servidor de desarrollo y `BANCO_GPU=alta`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { grabar, mover } from '../scripts-escena/banco-escena'
import { scrollSuave } from '../scripts-escena/clips6'
import { abrir } from '../scripts-escena10/banco'
import { esperar, scrollHasta } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [1440, 900]
const PUNTERO: readonly [number, number] = [720, 700]
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/pasada-final/p0'
const TODAS = ['actual', 'e9', 'e10', '3ds', 'lejos'] as const

interface Lectura { id: string; llegada: number; salida: number; mostrado: { llegada: number; salida: number }; visible: boolean }
type B = Awaited<ReturnType<typeof abrir>>

async function portfolio(b: B): Promise<Lectura | null> {
  const t = await medir<Lectura[] | null>(b.p, `(window.__titulosDelBanco ? window.__titulosDelBanco.titulos() : null)`)
  return t?.find((x) => x.id === 'portfolio') ?? null
}

async function una(variante: string): Promise<Record<string, unknown>> {
  const b = await abrir(variante === 'actual' ? 'producto' : `producto,portfolio=${variante}`, ANCHO, ALTO)
  try {
    await mover(b, PUNTERO[0], PUNTERO[1])
    const tope = await medir<number>(b.p, `(() => { const s = document.querySelector('[data-panel="trabajos"]'); return s ? Math.round(s.getBoundingClientRect().top + scrollY) : -1 })()`)
    const marcada = await medir<string | null>(b.p, `(document.querySelector('[data-variante-de-portfolio]') ? document.querySelector('[data-variante-de-portfolio]').getAttribute('data-variante-de-portfolio') : null)`)
    let [desde, entera] = [-1, -1]
    for (let y = Math.max(0, tope - 500); y <= tope + 900; y += 20) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(80)
      const t = await portfolio(b)
      if (t === null) continue
      if (desde < 0 && t.llegada > 0) desde = y
      if (entera < 0 && t.llegada >= 0.999) {
        entera = y
        break
      }
    }
    if (entera < 0) throw new Error(`${variante}: no se midió la ventana`)
    await scrollHasta(b, entera - 500)
    await esperar(3000)
    const destino = `${SALIDA}/${variante}`
    await grabar(b, destino, async () => {
      await esperar(600)
      await scrollSuave(b, entera - 500, entera + 480, 4000)
      await esperar(1800)
    }, ANCHO)
    // La hoja: 2 s desde que empieza el gesto (10 cuadros por segundo), recortada a la zona del título.
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1.4', '-t', '2.0', '-i', `${destino}.mp4`, '-vf', 'fps=5,crop=1000:420:160:120,scale=400:-2,tile=5x2', '-frames:v', '1', `${destino}-hoja.png`])
    const final = await portfolio(b)
    return { variante, marcada, tope, desde, entera, final: final === null ? null : { llegada: final.mostrado.llegada, visible: final.visible } }
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const pedidas = process.argv.slice(2).filter((a) => (TODAS as readonly string[]).includes(a))
  const resultados: Record<string, unknown>[] = []
  for (const v of pedidas.length > 0 ? pedidas : TODAS) {
    resultados.push(await una(v))
    console.log(JSON.stringify(resultados[resultados.length - 1]))
  }
  writeFileSync(`${SALIDA}/variantes.json`, JSON.stringify(resultados, null, 1))
}

if (process.argv[1]?.endsWith('p0-variantes.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
