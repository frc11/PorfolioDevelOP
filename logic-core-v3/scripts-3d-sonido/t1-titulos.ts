/**
 * 3D Y SONIDO · T1 — los títulos de volumen en el producto: t1-titulos.ts [partes]
 *
 *   `viajes`    desde el hero recién cargado, la barra a Portfolio y a Por qué develOP: el clip y la traza (el velo, el
 *               scroll y lo que el título 3D muestra cada 50 ms): durante el viaje no llega; al terminar, sí.
 *   `scroll`    la llegada de siempre, con la rueda (por Lenis), a Portfolio y a la frase: el clip.
 *   `hoja`      el negro y el blanco con la luz final: Portfolio (de noche) y la frase (de día). (La frase con el
 *               amanecer congelado al principio no llega: su texto espera al día. Medido en la primera corrida.)
 *   `costo`     en el medio de cada lectura: sin los títulos (`titulos=no`), el negro (el producto) y el blanco; la GPU
 *               de todo lo dibujado por cuadro, la de los títulos por su nombre, llamadas y triángulos.
 *   `telefono`  a 390: ningún título en la escena y el texto de siempre a la vista.
 *
 * Con la NVIDIA (`BANCO_GPU=alta`). Va a `3d-sonido/t1-titulos/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirCon, antesDeLaParte, armarClip, capturar, carpeta, correr, esperar, grabar, placaCorta, raton, rueda, viajarA, type Banco } from './banco'

const DIR = carpeta('t1-titulos')
const SECCION: Record<string, string> = { trabajos: 'portfolio', 'por-que-develop': 'frase-izquierda' }
const PARTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['viajes', 'scroll', 'hoja', 'costo', 'telefono']

interface TituloEnLaEscena {
  readonly id: string
  readonly mostrado: { readonly llegada: number; readonly salida: number }
  readonly visible: boolean
  readonly dom: { readonly izquierda: number; readonly derecha: number; readonly arriba: number; readonly abajo: number }
}

const titulos = (b: Banco): Promise<TituloEnLaEscena[]> => medir<TituloEnLaEscena[]>(b.p, 'window.__titulosDelBanco ? window.__titulosDelBanco.titulos() : []')

/** Espera a que los títulos estén armados (la escena los avisa listos: el DOM los esconde). */
async function armados(b: Banco): Promise<number> {
  for (let i = 0; i < 30; i += 1) {
    const n = await medir<number>(b.p, `document.querySelectorAll('span.escritorio\\\\:invisible').length`)
    if (n >= 3) return n
    await esperar(500)
  }
  return medir<number>(b.p, `document.querySelectorAll('span.escritorio\\\\:invisible').length`)
}

const TRAZA = (id: string): string =>
  `(() => { window.__traza = []; const t0 = performance.now(); const main = document.querySelector('[data-v3] main'); window.__muestreo = setInterval(() => { const t = (window.__titulosDelBanco ? window.__titulosDelBanco.titulos() : []).find((x) => x.id === '${id}'); window.__traza.push([Math.round(performance.now() - t0), Math.round(scrollY), main.hasAttribute('data-v3-deslizando') ? 1 : 0, t ? +t.mostrado.llegada.toFixed(3) : null, t ? (t.visible ? 1 : 0) : null]) }, 50) })()`

async function viajes(): Promise<void> {
  await antesDeLaParte('t1 viajes')
  const b = await abrirCon('producto', 1440, 900)
  const resumen: Record<string, unknown> = {}
  try {
    await raton(b, [720, 820], [720, 820])
    for (const id of ['trabajos', 'por-que-develop']) {
      await medir(b.p, 'location.reload()')
      await esperar(7000)
      await armados(b)
      await medir(b.p, TRAZA(SECCION[id]))
      const crudo = `${DIR}/_cuadros`
      const cuadros = await grabar(b, crudo, async () => {
        await esperar(300)
        await viajarA(b, id)
        await esperar(6500)
      }, 1200)
      const t = await medir<[number, number, number, number | null, number | null][]>(b.p, 'clearInterval(window.__muestreo), window.__traza')
      armarClip(crudo, cuadros, `${DIR}/viaje-a-${id}.mp4`, `T1 hero -> ${id} (barra) - 1440 - ${placaCorta(b)}`)
      writeFileSync(`${DIR}/traza-viaje-a-${id}.json`, JSON.stringify(t))
      const conVelo = t.filter((m) => m[2] === 1)
      const finDelVelo = conVelo.length === 0 ? null : conVelo[conVelo.length - 1][0]
      const maxEnElViaje = Math.max(0, ...conVelo.map((m) => m[3] ?? 0))
      const despues = t.filter((m) => finDelVelo !== null && m[0] > finDelVelo)
      const empieza = despues.find((m) => (m[3] ?? 0) > 0.01)
      const llega = despues.find((m) => (m[3] ?? 0) >= 0.999)
      resumen[id] = { velo: conVelo.length === 0 ? null : [conVelo[0][0], finDelVelo], llegadaMaximaConElVelo: maxEnElViaje, empiezaALlegarMs: empieza?.[0] ?? null, llegaMs: llega?.[0] ?? null }
      console.log(id, JSON.stringify(resumen[id]))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${DIR}/viajes.json`, JSON.stringify(resumen, null, 1))
}

/** El scroll del nudo de cada sección (adonde llega el viaje): se mide viajando. */
async function nudos(b: Banco): Promise<Record<string, number>> {
  const y: Record<string, number> = {}
  for (const id of ['trabajos', 'por-que-develop']) {
    await viajarA(b, id)
    await esperar(5000)
    y[id] = await medir<number>(b.p, 'Math.round(scrollY)')
  }
  return y
}

async function scroll(): Promise<void> {
  await antesDeLaParte('t1 scroll')
  const b = await abrirCon('producto', 1440, 900)
  try {
    await raton(b, [720, 820], [720, 820])
    await armados(b)
    const y = await nudos(b)
    for (const id of ['trabajos', 'por-que-develop']) {
      await medir(b.p, `window.scrollTo(0, ${String(y[id] - 900)})`)
      await esperar(4000)
      const crudo = `${DIR}/_cuadros`
      const cuadros = await grabar(b, crudo, async () => {
        await esperar(300)
        await rueda(b, 9, 110, 720, 820)
        await esperar(3200)
      }, 1200)
      armarClip(crudo, cuadros, `${DIR}/scroll-a-${id}.mp4`, `T1 la llegada de siempre (rueda) - ${id} - 1440 - ${placaCorta(b)}`)
    }
  } finally {
    await b.cerrar()
  }
}

/** La caja de un título (o de las dos mitades de la frase) en el cuadro, con aire. */
function recorteDe(t: readonly TituloEnLaEscena[], ids: readonly string[], aire: number): [number, number, number, number] {
  const cajas = t.filter((x) => ids.includes(x.id)).map((x) => x.dom)
  const x0 = Math.max(0, Math.min(...cajas.map((c) => c.izquierda)) - aire)
  const y0 = Math.max(0, Math.min(...cajas.map((c) => c.arriba)) - aire)
  const x1 = Math.min(1440, Math.max(...cajas.map((c) => c.derecha)) + aire)
  const y1 = Math.min(900, Math.max(...cajas.map((c) => c.abajo)) + aire)
  return [Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0)]
}

async function hoja(): Promise<void> {
  await antesDeLaParte('t1 hoja')
  const fotos: Record<string, string> = {}
  for (const material of ['negro', 'blanco'] as const) {
    const b = await abrirCon(material === 'negro' ? 'producto' : 'producto,titulos=blanco', 1440, 900)
    try {
      await raton(b, [720, 860], [720, 860])
      await armados(b)
      for (const [id, momento] of [['trabajos', 'noche'], ['por-que-develop', 'dia']] as const) {
        await viajarA(b, id)
        await esperar(6500)
        const t = await titulos(b)
        const ids = id === 'trabajos' ? ['portfolio'] : ['frase-izquierda', 'frase-derecha']
        const archivo = `${DIR}/_${material}-${id}-${momento}.png`
        await capturar(b, archivo, recorteDe(t, ids, id === 'trabajos' ? 160 : 90))
        fotos[`${material}-${id}-${momento}`] = archivo
        writeFileSync(`${DIR}/_${material}-${id}-${momento}.json`, JSON.stringify(t.filter((x) => ids.includes(x.id))))
      }
    } finally {
      await b.cerrar()
    }
  }
  // La hoja: dos columnas (negro | blanco), una fila por momento, con su rótulo.
  const filas = ['trabajos-noche', 'por-que-develop-dia']
  const entradas = filas.flatMap((f) => [fotos[`negro-${f}`], fotos[`blanco-${f}`]])
  const rotulos = filas.flatMap((f) => [`negro - ${f}`, `blanco - ${f}`])
  const args = entradas.flatMap((e) => ['-i', e])
  const cadenas = entradas.map((_, i) => `[${String(i)}:v]scale=700:-2,pad=720:ih+40:10:36:black,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${rotulos[i]}':x=12:y=8:fontsize=20:fontcolor=white[v${String(i)}]`)
  const pares = filas.map((_, k) => `[v${String(2 * k)}][v${String(2 * k + 1)}]hstack=inputs=2[f${String(k)}]`)
  const filtro = `${cadenas.join(';')};${pares.join(';')};${filas.map((_, k) => `[f${String(k)}]`).join('')}vstack=inputs=${String(filas.length)}[s]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args, '-filter_complex', filtro, '-map', '[s]', '-frames:v', '1', `${DIR}/hoja-negro-blanco.png`])
}

const COSTO = `(async () => {
  const g = window.__gpuDelBanco
  let cuadros = 0
  let sigue = true
  const contar = () => { if (!sigue) return; cuadros += 1; requestAnimationFrame(contar) }
  requestAnimationFrame(contar)
  g.grabar()
  await new Promise((r) => setTimeout(r, 2000))
  sigue = false
  const lista = await g.parar()
  const total = lista.reduce((s, [, ms]) => s + (Number.isFinite(ms) ? ms : 0), 0)
  const objetos = await g.medir(60, 'objetos')
  const titulos = objetos === null ? null : Object.entries(objetos.pasadas).filter(([n]) => n.startsWith('titulo de volumen')).reduce((s, [, p]) => s + p.ms, 0)
  const d = window.__dibujos
  return { cuadros, gpuMsPorCuadro: +(total / Math.max(1, cuadros)).toFixed(3), titulosMsPorCuadro: titulos === null ? null : +titulos.toFixed(4), llamadas: d.ultimo, triangulos: Math.round(d.ultimosTriangulos) }
})()`

async function costo(): Promise<void> {
  const salida: Record<string, Record<string, unknown>> = {}
  let placa = ''
  for (const pedido of ['producto,titulos=no', 'producto', 'producto,titulos=blanco']) {
    await antesDeLaParte(`t1 costo ${pedido}`)
    const b = await abrirCon(pedido, 1440, 900, '', false, true)
    placa = placaCorta(b)
    const fila: Record<string, unknown> = {}
    try {
      await raton(b, [720, 860], [720, 860])
      await armados(b)
      for (const id of ['trabajos', 'por-que-develop']) {
        await viajarA(b, id)
        await esperar(6000)
        fila[id] = await medir(b.p, COSTO)
      }
    } finally {
      await b.cerrar()
    }
    salida[pedido] = fila
    console.log(pedido, JSON.stringify(fila))
  }
  writeFileSync(`${DIR}/costo-${placa}-1440.json`, JSON.stringify({ placa, salida }, null, 1))
}

async function telefono(): Promise<void> {
  await antesDeLaParte('t1 telefono')
  const b = await abrirCon('producto', 390, 844)
  try {
    const estado = await medir<{ registrados: number; invisibles: number; titular: string; visible: string }>(
      b.p,
      `(() => { const h = document.querySelector('[data-pieza="cartel"] h2'); h.scrollIntoView({ block: 'center' }); const s = h.querySelector('span.block span.block, span.block'); return { registrados: window.__titulosDelBanco ? window.__titulosDelBanco.titulos().length : 0, invisibles: [...document.querySelectorAll('span')].filter((e) => getComputedStyle(e).visibility === 'hidden' && /Portfolio|razones|elegirnos/.test(e.textContent || '')).length, titular: h.textContent, visible: s ? getComputedStyle(s).visibility : 'sin span' } })()`,
    )
    await esperar(2500)
    await capturar(b, `${DIR}/telefono-390-portfolio.png`)
    writeFileSync(`${DIR}/telefono-390.json`, JSON.stringify(estado, null, 1))
    console.log('telefono', JSON.stringify(estado))
  } finally {
    await b.cerrar()
  }
}

correr(async () => {
  const partes: Record<string, () => Promise<void>> = { viajes, scroll, hoja, costo, telefono }
  for (const p of PARTES) await partes[p]()
})
