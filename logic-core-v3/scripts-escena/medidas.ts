/**
 * SPRINT ESCENA 3 — las mediciones. medidas.ts <contraste|reducido|tactil|todas>
 *
 *   · `contraste` — el contraste del texto con el pulso pasando por debajo, de día (hero) y de noche
 *     (Trabajos), con la atenuación sobre el texto y sin ella (`mascara=no`). Se captura la caja del
 *     texto cada ~150 ms durante varios pulsos; por captura el contraste es el del glifo (percentil 5
 *     de día, 95 de noche) contra el fondo (la mediana). Sin anillo es la mediana de la serie; en el
 *     pico del anillo, su peor valor.
 *   · `reducido` — E6 con movimiento reducido: una captura en medio de un scroll rápido, con y sin
 *     `prefers-reduced-motion`. Con reducido no tiene que haber estela.
 *   · `tactil` — E7 con puntero táctil (emulado) y con movimiento reducido: el empuje tiene que quedar
 *     en cero. Con clip, porque lo que se mueve se juzga en clip.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { DIR3, PUNTO_DEL_CURSOR, escenaViva, grabar, mover, topeMas } from './banco-escena'

const DIR = `${DIR3}/medidas`
const QUE = process.argv[2] ?? 'todas'

const lineal = (c: number): number => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly texto: string
}

/** El contraste WCAG entre el glifo (percentil 5 de día, 95 de noche) y el fondo local (la mediana), dentro de una caja. */
function contrasteEn(img: { ancho: number; alto: number; datos: Uint8Array }, c: Caja, noche: boolean): number {
  const l: number[] = []
  for (let y = c.y; y < c.y + c.alto; y += 1) {
    for (let x = c.x; x < c.x + c.ancho; x += 1) {
      if (x < 0 || y < 0 || x >= img.ancho || y >= img.alto) continue
      const i = (y * img.ancho + x) * 4
      l.push(0.2126 * lineal(img.datos[i]) + 0.7152 * lineal(img.datos[i + 1]) + 0.0722 * lineal(img.datos[i + 2]))
    }
  }
  l.sort((a, b) => a - b)
  const en = (q: number): number => l[Math.min(l.length - 1, Math.floor(q * l.length))]
  const glifo = noche ? en(0.95) : en(0.05)
  const fondo = en(0.5)
  return (Math.max(glifo, fondo) + 0.05) / (Math.min(glifo, fondo) + 0.05)
}

/** Cada elemento de texto visible del panel, por separado: el anillo cambia el fondo LOCAL. */
async function cajasDelPanel(b: Banco, panel: string): Promise<Caja[]> {
  return medir<Caja[]>(
    b.p,
    `[...document.querySelectorAll('[data-panel="${panel}"] :is(h1, h2, h3, p, a)')].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 20 && r.height > 8 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && s.visibility !== 'hidden' && e.textContent.trim() !== '' && ![...e.children].some((h) => h.matches('p, h1, h2, h3')) && (() => { let o = 1; for (let a = e; a; a = a.parentElement) o *= Number(getComputedStyle(a).opacity); const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return o > 0.5 && c !== null && (c === e || e.contains(c)) })() }).map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), ancho: Math.round(r.width), alto: Math.round(r.height), texto: e.textContent.trim().slice(0, 28) } })`,
  )
}

interface SerieDeUnTexto {
  readonly texto: string
  readonly sinAnillo: number
  readonly enElPico: number
}

/** Una serie por elemento de texto: la mediana es «sin anillo» y el mínimo, «en el pico del anillo». */
async function serieDeContraste(pedido: string, noche: boolean, nombre: string): Promise<{ muestras: number; textos: SerieDeUnTexto[] }> {
  const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'` })
  try {
    if (noche) await scrollHasta(b, await topeMas('trabajos', 0)(b))
    const cajas = await cajasDelPanel(b, noche ? 'trabajos' : 'hero')
    if (cajas.length === 0) throw new Error('no hay texto visible para medir')
    await esperar(1500)
    const series: number[][] = cajas.map(() => [])
    let peor = { valor: Infinity, png: Buffer.alloc(0) }
    const t0 = Date.now()
    while (Date.now() - t0 < 12000) {
      const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
      await b.emular()
      const png = Buffer.from(shot.data, 'base64')
      const img = decodificarPng(png)
      cajas.forEach((c, k) => series[k].push(contrasteEn(img, c, noche)))
      const minimo = Math.min(...series.map((v) => v[v.length - 1]))
      if (minimo < peor.valor) peor = { valor: minimo, png }
    }
    writeFileSync(`${DIR}/contraste-peor-${nombre}.png`, peor.png)
    const redondo = (v: number): number => Math.round(v * 100) / 100
    return {
      muestras: series[0].length,
      textos: cajas.map((c, k) => {
        const o = [...series[k]].sort((a, z) => a - z)
        return { texto: c.texto, sinAnillo: redondo(o[Math.floor(o.length / 2)]), enElPico: redondo(o[0]) }
      }),
    }
  } finally {
    await b.cerrar()
  }
}

async function contraste(): Promise<void> {
  const filas: unknown[] = []
  // Opcional: `medidas.ts contraste <dia|noche> <pedido>` corre una sola condición.
  const [soloMomento, soloPedido] = [process.argv[3], process.argv[4]]
  for (const noche of [false, true]) {
    if (soloMomento !== undefined && soloMomento !== (noche ? 'noche' : 'dia')) continue
    for (const [nombre, pedido] of [['sin atenuación', 'E1,E4,E6,E7,mascara=no'], ['con atenuación (producto)', 'producto'], ['sin pulso (base)', 'base']] as const) {
      if (soloPedido !== undefined && soloPedido !== pedido) continue
      const archivo = `${noche ? 'noche' : 'dia'}-${pedido.replace(/[,=]/g, '_')}`
      const r = await serieDeContraste(pedido, noche, archivo)
      for (const t of r.textos) {
        const fila = { momento: noche ? 'noche · Trabajos' : 'día · hero', condicion: nombre, texto: t.texto, sinAnillo: t.sinAnillo, enElPico: t.enElPico, caida: `${(((t.sinAnillo - t.enElPico) / t.sinAnillo) * 100).toFixed(1)} %`, muestras: r.muestras }
        filas.push(fila)
        console.log(JSON.stringify(fila))
      }
    }
  }
  writeFileSync(`${DIR}/contraste${soloMomento === undefined ? '' : `-${soloMomento}-${(soloPedido ?? 'todas').replace(/[,=]/g, '_')}`}.json`, JSON.stringify(filas, null, 2))
}

async function reducido(): Promise<void> {
  for (const conReducido of [false, true]) {
    const b = await abrirBanco(1440, 900, { perfil: 'escena3', reducido: conReducido, antesDeCargar: "window.__entornoDeLaEscena = 'producto'" })
    try {
      const destino = await topeMas('quienes-somos', 0.15)(b)
      // A mitad del tirón de scroll: la captura sale con la cámara viajando.
      await medir(b.p, `(async () => { for (let y = 0; y <= ${String(Math.round(destino * 0.6))}; y += 140) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)) } return 1 })()`)
      const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
      await b.emular()
      const nombre = `${DIR}/e6-en-pleno-scroll-${conReducido ? 'reducido' : 'normal'}.png`
      writeFileSync(nombre, Buffer.from(shot.data, 'base64'))
      const v = await escenaViva(b)
      console.log(JSON.stringify({ reducido: conReducido, estela: v?.estela ?? null, captura: nombre }))
    } finally {
      await b.cerrar()
    }
  }
}

async function tactil(): Promise<void> {
  for (const caso of ['tactil', 'reducido'] as const) {
    const b = await abrirBanco(1440, 900, { perfil: 'escena3', reducido: caso === 'reducido', antesDeCargar: `window.__entornoDeLaEscena = 'producto'; ${PUNTO_DEL_CURSOR}` })
    try {
      if (caso === 'tactil') {
        await b.p.conexion.enviar('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }, b.p.sessionId)
        await b.p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }, { name: 'prefers-reduced-motion', value: 'no-preference' }] }, b.p.sessionId)
      }
      let maximo = 0
      let hover = false
      const r = await grabar(b, `${DIR}/e7-${caso}`, async () => {
        await esperar(600)
        for (let i = 0; i <= 70; i += 1) {
          const x = 160 + (1120 * i) / 70
          if (caso === 'tactil') {
            const tipo = i === 0 ? 'touchStart' : i === 70 ? 'touchEnd' : 'touchMove'
            await b.p.conexion.enviar('Input.dispatchTouchEvent', { type: tipo, touchPoints: tipo === 'touchEnd' ? [] : [{ x, y: 770 }] }, b.p.sessionId)
          } else {
            await mover(b, x, 770)
          }
          const v = await escenaViva(b)
          maximo = Math.max(maximo, v?.empuje ?? 0)
          hover = hover || (v?.hover ?? false)
          await esperar(16)
        }
        await esperar(1500)
      }, 720)
      console.log(JSON.stringify({ caso, empujeMaximo: Math.round(maximo * 1000) / 1000, hoverAlgunaVez: hover, clip: r }))
    } finally {
      await b.cerrar()
    }
  }
}

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  if (QUE === 'contraste' || QUE === 'todas') await contraste()
  if (QUE === 'reducido' || QUE === 'todas') await reducido()
  if (QUE === 'tactil' || QUE === 'todas') await tactil()
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
