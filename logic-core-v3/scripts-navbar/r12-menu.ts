/**
 * RETOQUE DEL NAVBAR · 1 y 2 — el menú del teléfono nace con su vidrio y se funde en el círculo del botón:
 * r12-menu.ts [clips|boton|costo] (sin argumento, todo)
 *
 *   · `clips` (→ `1-transparencia/`): a 390 × 844, abrir y cerrar sobre la zona clara (el hero de día) y la oscura
 *     (Trabajos de noche), a tiempo real y a un cuarto, y las hojas de los cuadros de la apertura y del cierre.
 *   · `boton` (→ `2-esquinas/`): el botón de cerca (ampliado ×4), abrir y cerrar con el RELOJ a un cuarto (el
 *     `requestAnimationFrame` de la página recibe el tiempo cuatro veces más lento: se ven TODAS las formas intermedias,
 *     no sólo las que el screencast alcanza a tomar), y la hoja de los últimos cuadros del cierre.
 *   · `costo` (→ `1-transparencia/`): el cuadro del clic (del `pointerdown` al primer cuadro pintado del Genie) y los
 *     cuadros largos de la apertura (Long Animation Frames), con la CPU normal y ×4, tres aperturas por corrida.
 */
import { copyFileSync, readdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, enCamaraLenta, esperar, grabar, placaCorta, type Banco } from './banco'

const BOTON = '[data-parte="boton-del-menu"]'
const CERRAR = '[data-parte="cerrar-el-menu"]'
const ZONAS = ['clara', 'oscura'] as const
type Zona = (typeof ZONAS)[number]

async function clic(b: Banco, selector: string): Promise<void> {
  const [x, y] = await medir<[number, number]>(b.p, `(() => { const r = document.querySelector('${selector}').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'] as const) {
    await b.p.conexion.enviar('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: type === 'mouseMoved' ? 0 : 1 }, b.p.sessionId)
  }
}

async function irALaZona(b: Banco, zona: Zona): Promise<void> {
  if (zona === 'clara') return
  await medir(b.p, `window.scrollTo(0, document.querySelector('[data-panel="trabajos"]').getBoundingClientRect().top + scrollY + 200)`)
  await esperar(3000)
}

/** Una hoja con `cuantos` cuadros (de la lista, en orden), recortados y ampliados, en una grilla de `columnas`. */
function hoja(dir: string, archivos: readonly string[], destino: string, recorte: string, columnas: number): void {
  const lista = archivos.map((a) => `file '${a}'\nduration 0.04`).join('\n')
  writeFileSync(`${dir}/hoja.ffconcat`, `ffconcat version 1.0\n${lista}\n`)
  const filas = Math.ceil(archivos.length / columnas)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'hoja.ffconcat', '-vf', `${recorte},tile=${String(columnas)}x${String(filas)}:padding=6:color=white`, '-frames:v', '1', destino], { cwd: dir })
}

async function clips(): Promise<void> {
  const dir = carpeta('retoque/1-transparencia')
  for (const zona of ZONAS) {
    const b = await abrir(390, 844)
    try {
      await irALaZona(b, zona)
      const crudo = `${dir}/_cuadros-${zona}`
      let [abre, cierra] = [0, 0]
      const cuadros = await grabar(b, crudo, async () => {
        await esperar(500)
        abre = Date.now()
        await clic(b, BOTON)
        await esperar(1600)
        cierra = Date.now()
        await clic(b, CERRAR)
        await esperar(1200)
      }, 390)
      // Las hojas: los cuadros desde cada clic hasta que el Genie termina (560 ms y un poco), en orden.
      const tramo = (t: number): string[] => {
        const todos = cuadros.filter((c) => c.t >= t - 20 && c.t <= t + 700).map((c) => c.archivo)
        return Array.from({ length: Math.min(24, todos.length) }, (_, k) => todos[Math.floor((k * todos.length) / Math.min(24, todos.length))])
      }
      hoja(crudo, tramo(abre), `${dir}/apertura-${zona}.png`, 'scale=195:-2', 8)
      hoja(crudo, tramo(cierra), `${dir}/cierre-${zona}.png`, 'scale=195:-2', 8)
      armarClip(crudo, cuadros, `${dir}/menu-${zona}.mp4`, `menu - zona ${zona} - abrir y cerrar - ${placaCorta(b)}`)
      enCamaraLenta(`${dir}/menu-${zona}.mp4`, `${dir}/menu-${zona}-a-un-cuarto.mp4`, 4)
    } finally {
      await b.cerrar()
    }
  }
}

/** El `requestAnimationFrame` de la página, con el tiempo `factor` veces más lento desde ahora. */
const RELOJ_LENTO = (factor: number): string => `(() => {
  const original = window.requestAnimationFrame.bind(window)
  const base = performance.now()
  window.requestAnimationFrame = (f) => original((t) => f(base + (t - base) / ${String(factor)}))
})()`

async function boton(): Promise<void> {
  const dir = carpeta('retoque/2-esquinas')
  for (const zona of ZONAS) {
    const b = await abrir(390, 844)
    try {
      await irALaZona(b, zona)
      await medir(b.p, RELOJ_LENTO(4))
      const crudo = `${dir}/_cuadros-${zona}`
      // El botón (171..219 × 16..64) con aire: 150 × 120 px de la pantalla, ampliado ×4 (el screencast entrega el cuadro
      // en píxeles CSS aunque se emule un DPR mayor).
      const recorte = 'crop=150:120:120:0,scale=600:-2:flags=lanczos'
      let [abre, cierra] = [0, 0]
      const cuadros = await grabar(b, crudo, async () => {
        await esperar(800)
        abre = Date.now()
        await clic(b, BOTON)
        await esperar(4 * 1600)
        cierra = Date.now()
        await clic(b, CERRAR)
        await esperar(4 * 1100)
      }, 390)
      // Las hojas: la primera mitad de la apertura y la segunda del cierre (la forma cerca del botón), 18 cuadros parejos.
      const genie = 4 * 560
      const parejos = (desde: number, hasta: number): string[] => {
        const todos = cuadros.filter((c) => c.t >= desde && c.t <= hasta).map((c) => c.archivo)
        return Array.from({ length: Math.min(18, todos.length) }, (_, k) => todos[Math.floor((k * todos.length) / Math.min(18, todos.length))])
      }
      hoja(crudo, parejos(abre, abre + genie / 2), `${dir}/apertura-${zona}.png`, recorte.replace('600', '300'), 6)
      hoja(crudo, parejos(cierra + genie / 2, cierra + genie + 150), `${dir}/cierre-${zona}.png`, recorte.replace('600', '300'), 6)
      // El clip ampliado, a su tiempo grabado: el reloj ya va a un cuarto.
      for (const c of readdirSync(crudo).filter((a) => a.endsWith('.jpg'))) {
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${crudo}/${c}`, '-vf', recorte, '-q:v', '3', `${crudo}/${c}`])
      }
      armarClip(crudo, cuadros, `${dir}/boton-${zona}-reloj-a-un-cuarto.mp4`, `boton x4 - ${zona} - reloj a 1/4 - ${placaCorta(b)}`)
    } finally {
      await b.cerrar()
    }
  }
  // Los de tiempo real llevados a un cuarto, también acá (la misma grabación que en 1-transparencia).
  for (const zona of ZONAS) copyFileSync(`${carpeta('retoque/1-transparencia')}/menu-${zona}-a-un-cuarto.mp4`, `${dir}/menu-${zona}-a-un-cuarto.mp4`)
}

/** Del `pointerdown` del botón al primer cuadro con el Genie a la vista, y los cuadros largos de la apertura. */
const ESPIA = `(() => {
  window.__lof = []
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lof.push({ ms: Math.round(e.duration), desdeElClic: Math.round(e.startTime - window.__clic), estiloYDisposicion: Math.round(e.startTime + e.duration - e.styleAndLayoutStart), scripts: e.scripts.map((x) => x.invoker + ' ' + x.sourceFunctionName + ' ' + Math.round(x.duration)) }) }).observe({ type: 'long-animation-frame' })
  window.__clic = 0; window.__primero = 0
  document.addEventListener('pointerdown', () => { window.__lof = []; window.__clic = performance.now() }, { capture: true })
  document.querySelector('${BOTON}').addEventListener('pointerdown', () => {
    window.__clic = performance.now(); window.__primero = 0; window.__lof = []
    const capa = document.querySelector('[data-parte="genie-del-menu"]').parentElement
    const mirar = (t) => { if (getComputedStyle(capa).visibility === 'visible') window.__primero = t; else requestAnimationFrame(mirar) }
    requestAnimationFrame(mirar)
  }, { capture: true })
})()`
const MUESTREO = `(() => { window.__iv = []; window.__lentos = []; let a = performance.now(); const paso = (t) => { if (t - a > 20) window.__lentos.push([Math.round(t - a), Math.round(a - window.__clic)]); window.__iv.push(t - a); a = t; window.__muestreo = requestAnimationFrame(paso) }; window.__muestreo = requestAnimationFrame(paso) })()`
const CORTAR = `(() => { cancelAnimationFrame(window.__muestreo); const v = window.__iv.slice(1); const o = [...v].sort((x, y) => x - y); return { cuadros: v.length, p50: Math.round(o[Math.floor(o.length / 2)] * 10) / 10, max: Math.round(o[o.length - 1] * 10) / 10, mas33: v.filter((x) => x > 33.4).length, delClicAlPrimerCuadro: window.__primero > window.__clic ? Math.round(window.__primero - window.__clic) : null, lentosYDesdeElClic: window.__lentos, largos: window.__lof.filter((d) => d.ms >= 50) } })()`

async function costo(): Promise<void> {
  const dir = carpeta('retoque/1-transparencia')
  const salida: Record<string, unknown> = {}
  for (const cpu of [1, 4]) {
    const b = await abrir(390, 844, { cpu })
    try {
      await medir(b.p, ESPIA)
      const medicion: Record<string, unknown> = { placa: placaCorta(b) }
      for (let vuelta = 0; vuelta < 3; vuelta += 1) {
        await medir(b.p, MUESTREO)
        await clic(b, BOTON)
        await esperar(900)
        medicion[`abrir-${String(vuelta + 1)}`] = await medir(b.p, CORTAR)
        await esperar(800)
        await medir(b.p, MUESTREO)
        await clic(b, CERRAR)
        await esperar(900)
        medicion[`cerrar-${String(vuelta + 1)}`] = await medir(b.p, CORTAR)
        await esperar(800)
      }
      salida[`cpu x${String(cpu)}`] = medicion
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${dir}/costo.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida))
}

correr(async () => {
  const que = process.argv[2]
  if (que === undefined || que === 'costo') await costo()
  if (que === undefined || que === 'clips') await clips()
  if (que === undefined || que === 'boton') await boton()
})
