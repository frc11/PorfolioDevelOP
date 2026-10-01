/**
 * SPRINT INTERFAZ 2 · T4 — el indicador de recorrido (`recorrido=logo` y `recorrido=reloj`).
 *
 *   `clips`: para cada variante, la página entera con la rueda (el clip entero y la esquina ampliada ×2), y la
 *            navegación: el clic en el punto de Trabajos, el clic en el TRAZO (o en el disco) a la altura de Por qué
 *            develOP, y el teclado (Tab hasta el indicador y Enter).
 *   `foco`:    el anillo de foco en un punto (captura de la esquina).
 *
 * Uso: `npx tsx scripts-interfaz2/t4-recorrido.ts [clips|foco]` (sin argumento, los dos).
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, esperar, grabar, raton, rueda, tecla, type Banco } from './banco'

const VARIANTES = ['logo', 'reloj'] as const
const PUNTO = (id: string): string => `[data-pieza="recorrido"] a[href="#${id}"]`

/** La esquina del indicador, ampliada ×2 (un clip aparte del clip entero). */
function esquina(origen: string, destino: string): void {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origen, '-vf', 'crop=iw*0.32:ih*0.24:iw*0.68:ih*0.76,scale=trunc(iw*2/2)*2:-2', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', destino])
}

async function centro(b: Banco, selector: string): Promise<[number, number]> {
  const c = await medir<[number, number] | null>(b.p, `(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
  if (c === null) throw new Error(`no está ${selector}`)
  return c
}

async function clicEn(b: Banco, [x, y]: [number, number]): Promise<void> {
  await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x: Math.round(x), y: Math.round(y), button: 'left', buttons: 1, clickCount: 1 }, b.p.sessionId)
  await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x: Math.round(x), y: Math.round(y), button: 'left', buttons: 0, clickCount: 1 }, b.p.sessionId)
}

async function clips(): Promise<void> {
  const dir = carpeta('t4-recorrido')
  for (const v of VARIANTES) {
    const b = await abrir(1440, 900, { pedido: `producto,recorrido=${v}` })
    try {
      await raton(b, [700, 500], [700, 450], 2, 30)
      await esperar(1500)
      // 1 · la página entera con la rueda
      const recorrida = await grabar(b, `${dir}/_cuadros-${v}`, async () => {
        await esperar(600)
        for (let k = 0; k < 90; k += 1) {
          await rueda(b, 3, 40)
          await esperar(120)
        }
        await esperar(1500)
      }, 1200)
      armarClip(`${dir}/_cuadros-${v}`, recorrida, `${dir}/${v}-recorrido.mp4`, `recorrido=${v} - la pagina entera con la rueda - ${b.placa.includes('NVIDIA') ? 'NVIDIA' : b.placa}`)
      esquina(`${dir}/${v}-recorrido.mp4`, `${dir}/${v}-recorrido-esquina.mp4`)
      // 2 · navegar: el punto de Trabajos, el trazo/disco en el tramo de Por qué develOP, el teclado
      const navegada = await grabar(b, `${dir}/_cuadros-${v}-nav`, async () => {
        await esperar(500)
        const trabajos = await centro(b, PUNTO('trabajos'))
        await raton(b, [700, 450], trabajos, 14, 16)
        await esperar(500)
        await clicEn(b, trabajos)
        await esperar(4200)
        // El tramo de Por qué develOP: entre su punto y el del Cierre (en el trazo) o a esa hora del disco.
        const pq = await centro(b, PUNTO('por-que-develop'))
        const ci = await centro(b, PUNTO('cierre'))
        const medio: [number, number] = v === 'logo' ? [pq[0] + (ci[0] - pq[0]) * 0.15, pq[1] + (ci[1] - pq[1]) * 0.15] : [(pq[0] + ci[0]) / 2, (pq[1] + ci[1]) / 2]
        await raton(b, trabajos, medio, 10, 16)
        await esperar(400)
        await clicEn(b, medio)
        await esperar(4200)
        // El teclado: el foco al indicador (Shift+Tab desde el final del documento sería largo): foco al primer punto y Tab.
        await medir(b.p, `document.querySelector('${PUNTO('hero')}').focus()`)
        await tecla(b, 'Tab')
        await tecla(b, 'Tab')
        await esperar(700)
        await tecla(b, 'Enter')
        await esperar(4200)
      }, 1200)
      armarClip(`${dir}/_cuadros-${v}-nav`, navegada, `${dir}/${v}-navegar.mp4`, `recorrido=${v} - clic en un punto, clic en el trazo, teclado`)
      console.log(v, 'listo', JSON.stringify(await medir(b.p, `(() => ({ y: Math.round(scrollY), actual: document.querySelector('[data-pieza="recorrido"] [aria-current]')?.getAttribute('aria-label') }))()`)))
    } finally {
      await b.cerrar()
    }
  }
}

async function foco(): Promise<void> {
  const dir = carpeta('t4-recorrido/foco')
  for (const v of VARIANTES) {
    const b = await abrir(1440, 900, { pedido: `producto,recorrido=${v}` })
    try {
      await esperar(1500)
      await medir(b.p, `document.querySelector('${PUNTO('hero')}').focus()`)
      await tecla(b, 'Tab')
      await esperar(900)
      const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
      writeFileSync(`${dir}/${v}-foco.png`, Buffer.from(c.data, 'base64'))
      const enfocado = await medir<string | null>(b.p, `document.activeElement && document.activeElement.getAttribute('aria-label')`)
      console.log(v, 'foco en', enfocado)
    } finally {
      await b.cerrar()
    }
  }
}

correr(async () => {
  const que = process.argv[2]
  if (que === undefined || que === 'foco') await foco()
  if (que === undefined || que === 'clips') await clips()
})
