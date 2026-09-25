/**
 * SPRINT ESCENA 4 — los clips: lo que se mueve se juzga en video. clips4.ts <qué> [variante]
 *
 *   · `ruta <L1|L2>` — el recorrido de cámara con la formación (hero → Trabajos, y Por qué → pie):
 *     la profundidad se lee con el paralaje.
 *   · `mirada <L1|L2>` — F-mirada: el cursor entra al logo, se queda y sale.
 *   · `peso-cursor`, `peso-scroll` — el logo con peso: hacia el cursor, y el frenazo de un scroll fuerte.
 *   · `membrana-onda`, `membrana-lente` — la cúpula: la onda del principal, y la lente del cursor.
 *   · `estrellas` — la noche quieta (el polvo se mueve, las estrellas no) y el atardecer que las enciende.
 *   · `moire <hoy|M1a|M1b|M2|M3|M4|M5>` — el mismo gesto para cada variante: quieto, barrido del
 *     cursor, hover dentro y fuera del logo (el principal), scroll a Quiénes somos y de vuelta.
 *   · `preloader` — una primera visita de verdad (sin marca de sesión y sin `webdriver`).
 *
 * El cursor va como un punto rojo que sólo existe en la captura (`PUNTO_DEL_CURSOR`).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir } from '../scripts-b4/navegador'
import { RESTITUIR_EL_GATE } from '../scripts-b4/a-observador'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { PUNTO_DEL_CURSOR, escenaViva, grabar, mover, topeMas, viajarElPuntero } from './banco-escena'
import { DIR4 } from './formacion'

const [QUE, VARIANTE] = [process.argv[2] ?? '', process.argv[3] ?? '']
const PRODUCTO = 'E1,E4,E6,E7'

async function abrir(pedido: string, ancho = 1440, alto = 900): Promise<Banco> {
  return abrirBanco(ancho, alto, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${PUNTO_DEL_CURSOR}` })
}

function carpeta(nombre: string): string {
  const dir = `${DIR4}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

/** Un scroll suave de `desde` a `hasta` en `ms`, con la curva de ida y vuelta de siempre. */
function scrollSuave(b: Banco, desde: number, hasta: number, ms: number): Promise<unknown> {
  return medir(
    b.p,
    `new Promise((listo) => { const t0 = performance.now(); const paso = () => { const u = Math.min(1, (performance.now() - t0) / ${String(ms)}); const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; window.scrollTo(0, ${String(desde)} + (${String(hasta)} - ${String(desde)}) * e); if (u < 1) requestAnimationFrame(paso); else listo(1) }; requestAnimationFrame(paso) })`,
  )
}

/** Un punto de la zona donde el logo da hover (E4), recorriendo una grilla. */
async function puntoDelLogo(b: Banco, zona: readonly [number, number, number, number]): Promise<[number, number]> {
  const [x0, y0, x1, y1] = zona
  const dentro: [number, number][] = []
  for (let j = 0; j <= 8; j += 1) {
    for (let i = 0; i <= 8; i += 1) {
      const x = x0 + ((x1 - x0) * i) / 8
      const y = y0 + ((y1 - y0) * j) / 8
      await mover(b, x, y)
      await esperar(220)
      if ((await escenaViva(b))?.hover === true) dentro.push([x, y])
    }
  }
  if (dentro.length === 0) throw new Error('no encontré el logo: ningún punto de la zona dio hover')
  const media = (k: 0 | 1): number => Math.round(dentro.reduce((s, p) => s + p[k], 0) / dentro.length)
  // El punto con hover más cercano al centro de los que dieron hover.
  const c: [number, number] = [media(0), media(1)]
  return dentro.reduce((mejor, p) => (Math.hypot(p[0] - c[0], p[1] - c[1]) < Math.hypot(mejor[0] - c[0], mejor[1] - c[1]) ? p : mejor))
}

function concatenar(partes: readonly string[], destino: string): void {
  const lista = partes.map((p) => `-i ${p}`).join(' ').split(' ')
  const filtro = `${partes.map((_, i) => `[${String(i)}:v]`).join('')}concat=n=${String(partes.length)}:v=1[v]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...lista, '-filter_complex', filtro, '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
  for (const p of partes) rmSync(p, { force: true })
}

/** Recorta una franja del clip y la agranda: para lo que es chico (las estrellas). */
function franja(origen: string, destino: string, y: number, alto: number, x = 0, ancho = 1200): void {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origen, '-vf', `crop=${String(ancho)}:${String(alto)}:${String(x)}:${String(y)},scale=${String(ancho * 2)}:-2:flags=neighbor`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
}

async function ruta(lectura: string): Promise<void> {
  const dir = carpeta('formacion')
  const b = await abrir(`${PRODUCTO},${lectura}`)
  try {
    const trabajos = await topeMas('trabajos', 0)(b)
    const porQue = await topeMas('por-que-develop', 0)(b)
    const pie = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
    await esperar(1500)
    const a = await grabar(b, `${dir}/ruta-${lectura}-a`, async () => {
      await esperar(1200)
      await scrollSuave(b, 0, trabajos, 11000)
      await esperar(1500)
    })
    await scrollHasta(b, porQue)
    const c = await grabar(b, `${dir}/ruta-${lectura}-b`, async () => {
      await esperar(1000)
      await scrollSuave(b, porQue, pie, 9000)
      await esperar(1500)
    })
    concatenar([`${dir}/ruta-${lectura}-a.mp4`, `${dir}/ruta-${lectura}-b.mp4`], `${dir}/ruta-${lectura}.mp4`)
    console.log(JSON.stringify({ clip: `ruta-${lectura}`, a, b: c }))
  } finally {
    await b.cerrar()
  }
}

async function mirada(lectura: string): Promise<void> {
  const dir = carpeta('formacion')
  const b = await abrir(`${PRODUCTO},${lectura},mirada`)
  try {
    await scrollHasta(b, await topeMas('quienes-somos', 0.15)(b))
    const fuera: [number, number] = [1380, 860]
    // En Quiénes somos el logo queda a la izquierda del centro, de perfil.
    const logo = await puntoDelLogo(b, [520, 180, 900, 580])
    await mover(b, fuera[0], fuera[1])
    await esperar(4500)
    const r = await grabar(b, `${dir}/mirada-${lectura}`, async () => {
      await esperar(1500)
      await viajarElPuntero(b, fuera, logo, 700)
      await esperar(5500)
      await viajarElPuntero(b, logo, fuera, 700)
      await esperar(5000)
    })
    console.log(JSON.stringify({ clip: `mirada-${lectura}`, logo, ...r }))
  } finally {
    await b.cerrar()
  }
}

async function pesoCursor(): Promise<void> {
  const dir = carpeta('logo-peso')
  const b = await abrir(`${PRODUCTO},peso`)
  try {
    await mover(b, 700, 700)
    await esperar(1500)
    const r = await grabar(b, `${dir}/cursor`, async () => {
      await esperar(1000)
      await viajarElPuntero(b, [700, 700], [1380, 450], 900)
      await esperar(2200)
      await viajarElPuntero(b, [1380, 450], [620, 460], 700)
      await esperar(2200)
      await viajarElPuntero(b, [620, 460], [960, 90], 600)
      await esperar(2000)
      await viajarElPuntero(b, [960, 90], [960, 860], 700)
      await esperar(2000)
      // Al centro de la pantalla el objetivo es cero: vuelve a la pose de reposo. (Que vuelva a cero al
      // salir el cursor de la ventana lo afirma s30 §3: el mouse del banco no sabe salir de la ventana.)
      await viajarElPuntero(b, [960, 860], [720, 450], 600)
      await esperar(3500)
    })
    console.log(JSON.stringify({ clip: 'peso-cursor', ...r }))
  } finally {
    await b.cerrar()
  }
}

async function pesoScroll(): Promise<void> {
  const dir = carpeta('logo-peso')
  const b = await abrir(`${PRODUCTO},peso`)
  try {
    const destino = await topeMas('quienes-somos', 0.15)(b)
    await esperar(1500)
    const r = await grabar(b, `${dir}/scroll-y-frenada`, async () => {
      await esperar(1000)
      // Fuerte y de golpe: 160 px por cuadro, y se corta.
      await medir(b.p, `(async () => { for (let y = 0; y <= ${String(destino)}; y += 160) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)) } window.scrollTo(0, ${String(destino)}); return 1 })()`)
      await esperar(3000)
      await medir(b.p, `(async () => { for (let y = ${String(destino)}; y >= 0; y -= 160) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)) } window.scrollTo(0, 0); return 1 })()`)
      await esperar(3000)
      // Y uno suave, para comparar: casi no lo mueve.
      await scrollSuave(b, 0, destino, 4000)
      await esperar(2500)
    })
    console.log(JSON.stringify({ clip: 'peso-scroll', ...r }))
  } finally {
    await b.cerrar()
  }
}

async function membranaOnda(): Promise<void> {
  const dir = carpeta('membrana')
  const b = await abrir(`${PRODUCTO},membrana`)
  try {
    const fuera: [number, number] = [1380, 860]
    const logo = await puntoDelLogo(b, [700, 240, 1260, 660])
    await mover(b, fuera[0], fuera[1])
    await esperar(4500)
    const r = await grabar(b, `${dir}/onda-del-principal`, async () => {
      await esperar(1500)
      await viajarElPuntero(b, fuera, logo, 600)
      await esperar(4000)
      await viajarElPuntero(b, logo, fuera, 600)
      await esperar(4500)
    })
    console.log(JSON.stringify({ clip: 'membrana-onda', logo, ...r }))
  } finally {
    await b.cerrar()
  }
}

async function membranaLente(): Promise<void> {
  const dir = carpeta('membrana')
  const b = await abrir(`${PRODUCTO},membrana`)
  try {
    await scrollHasta(b, await topeMas('por-que-develop', 0.7)(b))
    await mover(b, 80, 820)
    await esperar(1500)
    const r = await grabar(b, `${dir}/lente-del-cursor`, async () => {
      await esperar(1000)
      await viajarElPuntero(b, [80, 820], [120, 200], 700)
      await viajarElPuntero(b, [120, 200], [1320, 200], 5500)
      await esperar(1200)
      for (let i = 0; i <= 90; i += 1) {
        const a = (i / 90) * Math.PI * 2
        await mover(b, 720 + 260 * Math.cos(a), 330 + 160 * Math.sin(a))
        await esperar(30)
      }
      await esperar(2500)
    })
    console.log(JSON.stringify({ clip: 'membrana-lente', ...r }))
  } finally {
    await b.cerrar()
  }
}

async function estrellas(): Promise<void> {
  const dir = carpeta('estrellas')
  for (const [nombre, pedido] of [['con', `${PRODUCTO},estrellas`], ['sin', PRODUCTO]] as const) {
    const b = await abrir(pedido)
    try {
      const trabajos = await topeMas('trabajos', 0)(b)
      if (nombre === 'con') {
        // El atardecer: de la última pantalla de Números a Trabajos, despacio.
        const desde = trabajos - 1300
        await scrollHasta(b, desde)
        await esperar(1500)
        const a = await grabar(b, `${dir}/atardecer`, async () => {
          await esperar(800)
          await scrollSuave(b, desde, trabajos, 9000)
          await esperar(2000)
        })
        console.log(JSON.stringify({ clip: 'estrellas-atardecer', ...a }))
      } else {
        await scrollHasta(b, trabajos)
      }
      await esperar(2500)
      const q = await grabar(b, `${dir}/noche-quieta-${nombre}`, () => esperar(7000), 1440)
      franja(`${dir}/noche-quieta-${nombre}.mp4`, `${dir}/noche-quieta-${nombre}-franja-x2.mp4`, 0, 300, 720, 720)
      rmSync(`${dir}/noche-quieta-${nombre}.mp4`, { force: true })
      console.log(JSON.stringify({ clip: `estrellas-noche-${nombre}`, ...q }))
    } finally {
      await b.cerrar()
    }
  }
}

async function moire(variante: string): Promise<void> {
  const dir = carpeta('moire')
  const pedido = variante === 'hoy' ? PRODUCTO : `${PRODUCTO},moire=${variante}`
  const b = await abrir(pedido)
  try {
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    const fuera: [number, number] = [1380, 860]
    const logo = await puntoDelLogo(b, [700, 240, 1260, 660])
    await mover(b, fuera[0], fuera[1])
    await esperar(4500)
    const r = await grabar(b, `${dir}/moire-${variante}`, async () => {
      await esperar(3000)
      // El barrido del cursor por la trama (M5).
      await viajarElPuntero(b, fuera, [100, 150], 800)
      await viajarElPuntero(b, [100, 150], [1340, 150], 3500)
      // El hover: entra y sale, dos principales (M3).
      await viajarElPuntero(b, [1340, 150], logo, 600)
      await esperar(2500)
      await viajarElPuntero(b, logo, fuera, 600)
      await esperar(2500)
      // El scroll a Quiénes somos y de vuelta (M2 y M4).
      await scrollSuave(b, 0, quienes, 2500)
      await esperar(2500)
      await scrollSuave(b, quienes, 0, 2500)
      await esperar(2500)
    })
    console.log(JSON.stringify({ clip: `moire-${variante}`, ...r }))
  } finally {
    await b.cerrar()
  }
}

/** Una primera visita de verdad: sin la marca de sesión y con `webdriver` en falso, que es lo que arma el intro. */
async function preloader(): Promise<void> {
  const dir = carpeta('preloader')
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/escena4-preloader', ancho: 1480, alto: 1040 })
  try {
    const p = await abrirPagina(chrome)
    const s = p.sessionId
    await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 900 }, s)
    await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }, s)
    await p.conexion.enviar('Network.setCacheDisabled', { cacheDisabled: true }, s)
    await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `${RESTITUIR_EL_GATE}; try { sessionStorage.removeItem('home:intro') } catch (e) {}` }, s)
    const b: Banco = { p, ancho: 1440, alto: 900, emular: () => Promise.resolve(), cerrar: () => cerrarPagina(p) }
    let lectura: unknown = null
    const r = await grabar(b, `${dir}/primera-visita`, async () => {
      await irA(p, 'about:blank', { marcaDeIntro: false })
      await irA(p, 'http://localhost:3000/v3', { marcaDeIntro: false })
      await esperar(300)
      lectura = await medir(p, `({ webdriver: navigator.webdriver, armo: document.documentElement.hasAttribute('data-home-intro'), overlay: document.querySelector('[data-home-intro-overlay]') !== null, marca: sessionStorage.getItem('home:intro') })`)
      await esperar(5000)
    })
    console.log(JSON.stringify({ clip: 'preloader', ...r, lectura }))
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

async function principal(): Promise<void> {
  if (QUE === 'ruta') return ruta(VARIANTE || 'L1')
  if (QUE === 'mirada') return mirada(VARIANTE || 'L1')
  if (QUE === 'peso-cursor') return pesoCursor()
  if (QUE === 'peso-scroll') return pesoScroll()
  if (QUE === 'membrana-onda') return membranaOnda()
  if (QUE === 'membrana-lente') return membranaLente()
  if (QUE === 'estrellas') return estrellas()
  if (QUE === 'moire') return moire(VARIANTE || 'hoy')
  if (QUE === 'preloader') return preloader()
  throw new Error(`no sé qué es «${QUE}»`)
}

if (process.argv[1]?.endsWith('clips4.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
