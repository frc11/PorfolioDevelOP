/**
 * SPRINT NAVBAR V3 · T3 — el menú del teléfono de vidrio líquido: t3-menu.ts [clips|fotos|costo|teclado] (sin argumento, todo)
 *
 *   · `clips`: a 390 × 844, abrir (con el Genie desde el botón) y cerrar con su botón, sobre una zona clara (el hero de
 *     día) y sobre una oscura (Trabajos de noche); a tiempo real y a un cuarto.
 *   · `fotos`: el panel abierto en las dos zonas, el canto de arriba ampliado (el especular, el filo y, en Chromium, la
 *     refracción) y el contraste del texto medido en píxeles (el peor renglón de cada tono).
 *   · `costo`: el intervalo entre cuadros mientras abre y cierra (el Genie) y con el vidrio abierto quieto, con la CPU
 *     normal y ×4 (un teléfono de gama media).
 *   · `teclado`: Tab adentro da la vuelta sin salir, Esc cierra y el foco vuelve al botón; con movimiento reducido, el
 *     fundido sin Genie (clip).
 * Va a `navbar/t3-menu/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, enCamaraLenta, esperar, grabar, placaCorta, tecla, type Banco } from './banco'

const BOTON = '[data-parte="boton-del-menu"]'
const CERRAR = '[data-parte="cerrar-el-menu"]'

/** Un clic de verdad (el puntero del sistema), en el centro de lo que coincide con `selector`. */
async function clic(b: Banco, selector: string): Promise<void> {
  const [x, y] = await medir<[number, number]>(b.p, `(() => { const r = document.querySelector('${selector}').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'] as const) {
    await b.p.conexion.enviar('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: type === 'mouseMoved' ? 0 : 1 }, b.p.sessionId)
  }
}

/** La zona: `clara` es el hero de día; `oscura`, Trabajos de noche (la gota cae al cruzar). */
async function irALaZona(b: Banco, zona: 'clara' | 'oscura'): Promise<void> {
  if (zona === 'clara') return
  await medir(b.p, `window.scrollTo(0, document.querySelector('[data-panel="trabajos"]').getBoundingClientRect().top + scrollY + 200)`)
  await esperar(3000)
}

async function captura(b: Banco, archivo: string): Promise<void> {
  const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  writeFileSync(archivo, Buffer.from(c.data, 'base64'))
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: b.ancho, height: b.alto, deviceScaleFactor: 1, mobile: true, screenWidth: b.ancho, screenHeight: b.alto }, b.p.sessionId)
}

async function clips(): Promise<void> {
  const dir = carpeta('t3-menu')
  for (const zona of ['clara', 'oscura'] as const) {
    const b = await abrir(390, 844)
    try {
      await irALaZona(b, zona)
      const cuadros = await grabar(b, `${dir}/_cuadros-${zona}`, async () => {
        await esperar(500)
        await clic(b, BOTON)
        await esperar(1600)
        await clic(b, CERRAR)
        await esperar(1200)
      }, 390)
      armarClip(`${dir}/_cuadros-${zona}`, cuadros, `${dir}/menu-${zona}.mp4`, `menu del telefono - zona ${zona} - abrir y cerrar - ${placaCorta(b)}`)
      enCamaraLenta(`${dir}/menu-${zona}.mp4`, `${dir}/menu-${zona}-a-un-cuarto.mp4`, 4)
    } finally {
      await b.cerrar()
    }
  }
}

/** El contraste de cada renglón: la tinta del texto contra el fondo del vidrio alrededor, en los píxeles de la captura. */
const CONTRASTE = `(async () => {
  const items = [...document.querySelectorAll('#menu-movil [data-parte="item-del-menu"]')].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height] })
  return items
})()`

function contrasteEn(png: string, cajas: number[][]): { peor: number; porRenglon: number[] } {
  const salida = execFileSync('python', ['-c', `
import sys, json
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
cajas = json.loads(sys.argv[2])
def L(c):
    def ch(v):
        v = v / 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = c
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
out = []
for x, y, w, h in cajas:
    px = [L(im.getpixel((int(i), int(j)))) for i in range(int(x + 8), int(x + w - 8), 2) for j in range(int(y + 4), int(y + h - 4), 2)]
    px.sort()
    oscuro, claro = px[int(len(px) * 0.02)], px[int(len(px) * 0.98)]
    # El fondo es la mayoría (la mediana); el texto, el extremo del otro lado.
    fondo = px[len(px) // 2]
    texto = oscuro if abs(fondo - claro) < abs(fondo - oscuro) else claro
    a, b = max(fondo, texto), min(fondo, texto)
    out.append(round((a + 0.05) / (b + 0.05), 2))
print(json.dumps(out))
`, png, JSON.stringify(cajas)]).toString()
  const porRenglon = JSON.parse(salida) as number[]
  return { peor: Math.min(...porRenglon), porRenglon }
}

async function fotos(): Promise<void> {
  const dir = carpeta('t3-menu')
  const resumen: Record<string, unknown> = {}
  for (const zona of ['clara', 'oscura'] as const) {
    const b = await abrir(390, 844)
    try {
      await irALaZona(b, zona)
      await clic(b, BOTON)
      await esperar(1600)
      // Sin el anillo de foco del primer ítem (que el contraste leería como texto).
      await medir(b.p, 'document.activeElement && document.activeElement.blur()')
      await esperar(300)
      const archivo = `${dir}/abierto-${zona}.png`
      await captura(b, archivo)
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', archivo, '-vf', 'crop=200:90:0:0,scale=iw*3:-2:flags=lanczos', `${dir}/canto-${zona}.png`])
      const cajas = await medir<number[][]>(b.p, CONTRASTE)
      const estado = await medir(b.p, `(() => { const m = document.querySelector('#menu-movil'); const s = getComputedStyle(m); return { tono: m.getAttribute('data-seccion') === 'invertida' ? 'vidrio oscuro' : 'vidrio claro', lente: m.hasAttribute('data-lente'), backdrop: s.backdropFilter } })()`)
      resumen[zona] = { ...(estado as object), contraste: contrasteEn(archivo, cajas) }
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${dir}/fotos.json`, JSON.stringify(resumen, null, 1))
  console.log(JSON.stringify(resumen))
}

const MUESTREO = `(() => { window.__iv = []; let a = performance.now(); const paso = (t) => { window.__iv.push(t - a); a = t; window.__muestreo = requestAnimationFrame(paso) }; window.__muestreo = requestAnimationFrame(paso) })()`
const CORTAR = `(() => { cancelAnimationFrame(window.__muestreo); const v = window.__iv.slice(1).sort((x, y) => x - y); const q = (p) => Math.round(v[Math.min(v.length - 1, Math.floor(v.length * p))] * 10) / 10; return { cuadros: v.length, p50: q(0.5), p95: q(0.95), max: Math.round(v[v.length - 1] * 10) / 10, mas33: v.filter((x) => x > 33.4).length } })()`

async function costo(): Promise<void> {
  const dir = carpeta('t3-menu')
  const salida: Record<string, unknown> = {}
  for (const cpu of [1, 4]) {
    const b = await abrir(390, 844, { cpu })
    try {
      const medicion: Record<string, unknown> = { placa: placaCorta(b) }
      for (let vuelta = 0; vuelta < 2; vuelta += 1) {
        await medir(b.p, MUESTREO)
        await clic(b, BOTON)
        await esperar(700)
        medicion[`abrir-${String(vuelta)}`] = await medir(b.p, CORTAR)
        await medir(b.p, MUESTREO)
        await esperar(2000)
        medicion[`abierto-quieto-${String(vuelta)}`] = await medir(b.p, CORTAR)
        await medir(b.p, MUESTREO)
        await clic(b, CERRAR)
        await esperar(700)
        medicion[`cerrar-${String(vuelta)}`] = await medir(b.p, CORTAR)
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

async function teclado(): Promise<void> {
  const dir = carpeta('t3-menu')
  const b = await abrir(390, 844)
  const salida: Record<string, unknown> = {}
  try {
    await medir(b.p, `document.querySelector('${BOTON}').focus()`)
    await tecla(b, 'Enter')
    await esperar(1500)
    const recorrido: string[] = []
    for (let k = 0; k < 9; k += 1) {
      recorrido.push(await medir<string>(b.p, `(() => { const a = document.activeElement; return (a?.getAttribute('aria-label') || a?.textContent || a?.tagName || '').trim() })()`))
      await tecla(b, 'Tab')
      await esperar(80)
    }
    salida.tabAdentro = recorrido
    salida.dentroDelDialogo = await medir<boolean>(b.p, `!!document.activeElement?.closest('#menu-movil')`)
    await tecla(b, 'Escape')
    await esperar(1200)
    salida.escCierra = await medir<boolean>(b.p, `getComputedStyle(document.querySelector('#menu-movil')).visibility === 'hidden' && document.querySelector('${BOTON}').getAttribute('aria-expanded') === 'false'`)
    salida.focoVuelveAlBoton = await medir<boolean>(b.p, `document.activeElement === document.querySelector('${BOTON}')`)
  } finally {
    await b.cerrar()
  }
  const r = await abrir(390, 844, { reducido: true, anchoTolerado: 12 })
  try {
    const cuadros = await grabar(r, `${dir}/_cuadros-reducido`, async () => {
      await esperar(400)
      await clic(r, BOTON)
      await esperar(1200)
      await clic(r, CERRAR)
      await esperar(900)
    }, 390)
    armarClip(`${dir}/_cuadros-reducido`, cuadros, `${dir}/menu-movimiento-reducido.mp4`, `menu del telefono - movimiento reducido (fundido) - ${placaCorta(r)}`)
    salida.reducidoSinGenie = await medir<boolean>(r.p, '!document.querySelector(\'[data-parte="genie-del-menu"]\')')
  } finally {
    await r.cerrar()
  }
  writeFileSync(`${dir}/teclado.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida))
}

correr(async () => {
  const que = process.argv[2]
  if (que === undefined || que === 'fotos') await fotos()
  if (que === undefined || que === 'teclado') await teclado()
  if (que === undefined || que === 'costo') await costo()
  if (que === undefined || que === 'clips') await clips()
})
