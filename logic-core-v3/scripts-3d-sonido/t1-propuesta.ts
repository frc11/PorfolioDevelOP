/**
 * 3D Y SONIDO · T1 — la propuesta: qué otros títulos irían en 3D, con una captura SIMULADA de cada uno: t1-propuesta.ts
 *
 *   `capturar`  A 1440 × 900, el producto en Quiénes somos, Servicios, Tu panel y el Cierre: el título que se ve (el texto
 *               más grande de la sección a la vista, con sus renglones, su caja y su cuerpo), una captura con el título y
 *               otra sin él (invisible).
 *   `simular`   Sobre la captura sin el título, el título extruido con three (la Chivo en 400, el espesor y el bisel de los
 *               títulos de volumen, el negro satinado; de noche, las tapas grises del logo de noche), un poco girado para
 *               que se lea el volumen; y la hoja actual | simulada. NO es la escena del sitio: es un estudio parecido.
 *
 * La página de la simulación (`sim.html`, three y la fuente con todos los glifos) vive fuera del repo, en `SIM` (se sirve
 * con `python -m http.server`). Va a `3d-sonido/t1-titulos/propuesta/`.
 */
import { execFileSync, spawn } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'

import { irA, medir } from '../scripts-b4/navegador'
import { abrirCon, antesDeLaParte, capturar, carpeta, correr, esperar, raton, viajarA, type Banco } from './banco'

const DIR = carpeta('t1-titulos/propuesta')
const SIM = process.env.SIM ?? ''
/** Cada sección, cómo se llega y su título entero (el que se lee al llegar; no el texto de fondo de Tu panel). */
const SECCIONES: readonly (readonly [string, string, 'barra' | 'scroll', string])[] = [
  ['quienes-somos', 'Quiénes somos', 'barra', 'Queremos hacer algo distinto, no lo mismo de siempre'],
  ['servicios', 'Servicios', 'barra', 'Nuestros servicios'],
  ['tu-panel', 'Tu panel', 'barra', 'Tu Panel'],
  ['cierre', 'El Cierre', 'scroll', 'Lo que sigue lo armamos con vos'],
]

interface Titulo {
  readonly renglones: readonly string[]
  readonly izquierda: number
  readonly base: number
  readonly cuerpo: number
  readonly interlinea: number
}

/** El título de la sección (el elemento visible más chico con ese texto, sin contar espacios; no el `sr-only`): sus renglones, su caja y su cuerpo. */
const TITULO = (id: string, comienzo: string): string => `(() => {
  const s = document.getElementById('${id}')
  const candidatos = [...s.querySelectorAll('h1, h2, h3, p, span, div')].filter((e) => {
    const r = e.getBoundingClientRect()
    const st = getComputedStyle(e)
    return r.width > 4 && r.bottom > 0 && r.top < innerHeight && st.visibility === 'visible' && e.textContent.replace(/\\s+/g, '').startsWith('${comienzo}'.replace(/\\s+/g, ''))
  })
  candidatos.sort((a, b) => a.textContent.length - b.textContent.length || a.getBoundingClientRect().width - b.getBoundingClientRect().width)
  const el = candidatos[0]
  if (!el) return null
  const palabras = []
  const recorrer = (n) => { if (n.nodeType === 3) { const re = /\\S+/g; let m; while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const c = r.getBoundingClientRect(); if (c.width > 0) palabras.push([m[0], c.left, c.top, c.bottom]) } } else n.childNodes.forEach(recorrer) }
  recorrer(el)
  const renglones = []
  for (const p of palabras) { const r = renglones.find((x) => Math.abs(x.top - p[2]) < 6); if (r) r.palabras.push(p[0]); else renglones.push({ top: p[2], bottom: p[3], izq: p[1], palabras: [p[0]] }) }
  const cuerpo = parseFloat(getComputedStyle(el).fontSize)
  window.__elDelTitulo = el
  return { renglones: renglones.map((r) => r.palabras.join(' ')), izquierda: Math.min(...renglones.map((r) => r.izq)), base: renglones[0].bottom - 0.22 * cuerpo, cuerpo, interlinea: renglones.length > 1 ? renglones[1].top - renglones[0].top : cuerpo * 1.1 }
})()`

async function irALaSeccion(b: Banco, id: string, como: 'barra' | 'scroll'): Promise<void> {
  if (como === 'barra') await viajarA(b, id)
  else await medir(b.p, `document.getElementById('${id}').scrollIntoView({ block: 'start' })`)
  await esperar(6000)
}

async function capturarTodo(): Promise<void> {
  await antesDeLaParte('t1 propuesta')
  const b = await abrirCon('producto', 1440, 900)
  const titulos: Record<string, Titulo | null> = {}
  try {
    await raton(b, [720, 880], [720, 880])
    for (const [id, , como, comienzo] of SECCIONES) {
      await irALaSeccion(b, id, como)
      const t = await medir<Titulo | null>(b.p, TITULO(id, comienzo))
      titulos[id] = t
      await capturar(b, `${DIR}/actual-${id}.png`)
      if (t !== null) {
        await medir(b.p, `window.__elDelTitulo.style.visibility = 'hidden'`)
        await esperar(400)
        await capturar(b, `${DIR}/_sin-titulo-${id}.png`)
        await medir(b.p, `window.__elDelTitulo.style.visibility = ''`)
      }
      console.log(id, JSON.stringify(t))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${DIR}/titulos.json`, JSON.stringify(titulos, null, 1))
}

async function simular(): Promise<void> {
  if (SIM === '') throw new Error('falta SIM (la carpeta de sim.html)')
  const titulos = JSON.parse(readFileSync(`${DIR}/titulos.json`, 'utf8')) as Record<string, Titulo | null>
  const luces = Object.fromEntries((process.env.LUCES ?? '').split(',').filter(Boolean).map((p) => p.split('='))) as Record<string, string>
  const servidor = spawn('python', ['-m', 'http.server', '8765'], { cwd: SIM, stdio: 'ignore' })
  const b = await abrirCon(null, 1440, 900)
  try {
    for (const [id, nombre] of SECCIONES) {
      const t = titulos[id]
      if (t === null || t === undefined) continue
      copyFileSync(`${DIR}/_sin-titulo-${id}.png`, `${SIM}/fondo-${id}.png`)
      const q = new URLSearchParams({ img: `fondo-${id}.png`, texto: t.renglones.map((r) => r.replace(/ ([,.;:])/g, '$1')).join('|'), x: String(t.izquierda), base: String(t.base), cuerpo: String(t.cuerpo), interlinea: String(t.interlinea), luz: luces[id] ?? 'dia', rotulo: `${nombre} - simulado (no es la escena del sitio)` })
      await irA(b.p, `http://localhost:8765/sim.html?${q.toString()}`)
      for (let i = 0; i < 40 && !(await medir<boolean>(b.p, 'window.__listo === true')); i += 1) await esperar(250)
      await capturar(b, `${DIR}/simulada-${id}.png`)
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${DIR}/actual-${id}.png`, '-i', `${DIR}/simulada-${id}.png`, '-filter_complex', '[0:v]scale=720:-2[a];[1:v]scale=720:-2[b];[a][b]hstack=inputs=2', '-frames:v', '1', `${DIR}/${id}-actual-y-simulada.png`])
    }
  } finally {
    await b.cerrar()
    servidor.kill()
  }
}

correr(async () => {
  const parte = process.argv[2] ?? 'capturar'
  if (parte === 'capturar') await capturarTodo()
  else await simular()
})
