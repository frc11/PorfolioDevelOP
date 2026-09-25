/**
 * SPRINT ESCENA 2 — las ideas del entorno, en los mismos cinco momentos.
 * entorno.ts <ancho> <alto> <capturas|fps|clip> [variantes separadas por espacio] [cpu]
 *
 * Una variante es `base` (todas las banderas apagadas) o ideas unidas con `+` (`E1`, `E1+E2+E3+E6`).
 * Abre /v3 con esas banderas pisadas ANTES de cargar la página (`window.__entornoDeLaEscena`, ver
 * `_lib/escena/entorno.ts`) y el contador de llamadas de dibujo del banco anterior, y llega a cada
 * momento POR SCROLL, a pasos: la noche de Trabajos cae como cae.
 *
 *   · `capturas` — una captura por momento, después de que la escena se asiente (`asentada`).
 *   · `fps` — cuadros por segundo, llamadas de dibujo y triángulos por momento, con la CPU
 *     estrangulada `cpu` veces (4 para el perfil móvil).
 *   · `clip` — un clip corto por variante, con el gesto que muestra la idea: el pulso y los
 *     anillos quietos en su momento; el polvo con un tirón de scroll, frenada y vuelta.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'

const [ANCHO, ALTO, MODO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), process.argv[4] ?? 'capturas']
const VARIANTES = (process.argv[5] ?? 'base').split(' ').filter(Boolean)
const CPU = Number(process.argv[6] ?? 1)
const DIR = 'C:/Users/Valentino/.cache/b4-medicion/escena2/entorno'

const banderas = (variante: string): string => (variante === 'base' ? '' : variante.split('+').join(','))

/** Cuenta las llamadas de dibujo y los triángulos del último cuadro completo (de `comparar.ts`). */
const CONTADOR = `(() => {
  window.__dibujos = { cuadro: 0, ultimo: 0, triangulos: 0, ultimosTriangulos: 0 }
  for (const Ctx of [WebGL2RenderingContext, WebGLRenderingContext]) {
    for (const nombre of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const original = Ctx.prototype[nombre]
      if (typeof original !== 'function') continue
      Ctx.prototype[nombre] = function (...args) {
        window.__dibujos.cuadro += 1
        const cantidad = nombre.startsWith('drawArrays') ? args[2] : args[1]
        const instancias = nombre.endsWith('Instanced') ? args[args.length - 1] : 1
        if (args[0] === 4) window.__dibujos.triangulos += (cantidad / 3) * instancias
        return original.apply(this, args)
      }
    }
  }
  const cerrar = () => {
    window.__dibujos.ultimo = window.__dibujos.cuadro
    window.__dibujos.ultimosTriangulos = window.__dibujos.triangulos
    window.__dibujos.cuadro = 0
    window.__dibujos.triangulos = 0
    requestAnimationFrame(cerrar)
  }
  requestAnimationFrame(cerrar)
})()`

interface Momento {
  readonly nombre: string
  readonly y: (b: Banco) => Promise<number>
}

const topeMas = (id: string, pantallas: number) => (b: Banco): Promise<number> =>
  medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return Math.round(r.top + scrollY + ${String(pantallas)} * innerHeight) })()`)

const MOMENTOS: readonly Momento[] = [
  { nombre: 'hero', y: async () => 0 },
  { nombre: 'quienes-somos', y: topeMas('quienes-somos', 0.15) },
  { nombre: 'trabajos-de-noche', y: topeMas('trabajos', 0) },
  { nombre: 'por-que-develop', y: topeMas('por-que-develop', 0.7) },
  { nombre: 'pie', y: (b) => medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight') },
]

function bloques(png: Buffer): number[] {
  const img = decodificarPng(png)
  const salida: number[] = []
  for (let by = 0; by + 30 <= img.alto; by += 30) {
    for (let bx = 0; bx + 30 <= img.ancho; bx += 30) {
      let suma = 0
      for (let y = by; y < by + 30; y += 1) for (let x = bx; x < bx + 30; x += 1) {
        const i = (y * img.ancho + x) * 4
        suma += 0.2126 * img.datos[i] + 0.7152 * img.datos[i + 1] + 0.0722 * img.datos[i + 2]
      }
      salida.push(suma / 900)
    }
  }
  return salida
}

async function foto(b: Banco): Promise<Buffer> {
  const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(shot.data, 'base64')
}

/** El empujón de un píxel y dos capturas a 1,5 s que coinciden por bloques (de `comparar.ts`). */
async function asentada(b: Banco): Promise<{ png: Buffer; ms: number; intentos: number }> {
  const t0 = Date.now()
  await medir(b.p, 'new Promise((r) => { const y = scrollY; window.scrollTo(0, y - 1); setTimeout(() => { window.scrollTo(0, y); setTimeout(() => r(0), 120) }, 120) })')
  let antes = await foto(b)
  for (let intento = 1; intento <= 8; intento += 1) {
    await esperar(1500)
    const ahora = await foto(b)
    const a = bloques(antes)
    const c = bloques(ahora)
    let suma = 0
    for (let i = 0; i < a.length; i += 1) suma += Math.abs(a[i] - c[i])
    if (suma / a.length < 1.5) return { png: ahora, ms: Date.now() - t0, intentos: intento }
    antes = ahora
  }
  return { png: antes, ms: Date.now() - t0, intentos: 9 }
}

async function fps(b: Banco): Promise<number> {
  return medir<number>(b.p, `new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(Math.round((n / ((performance.now() - t0) / 1000)) * 10) / 10) }; requestAnimationFrame(f) })`)
}

/** Graba la pantalla mientras corre `gesto`, y arma un mp4 con la cadencia real de los cuadros. */
async function grabar(b: Banco, nombre: string, gesto: () => Promise<void>): Promise<void> {
  const cuadros = `${DIR}/cuadros-${nombre}`
  rmSync(cuadros, { recursive: true, force: true })
  mkdirSync(cuadros, { recursive: true })
  let n = 0
  let grabando = true
  b.p.conexion.al('Page.screencastFrame', (params) => {
    // Un cuadro que llega después de parar ya no es de este clip.
    if (!grabando) return
    writeFileSync(`${cuadros}/c${String(n).padStart(5, '0')}.jpg`, Buffer.from(params.data as string, 'base64'))
    n += 1
    void b.p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, b.p.sessionId)
  })
  const t0 = Date.now()
  await b.p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: ANCHO, maxHeight: ALTO, everyNthFrame: 1 }, b.p.sessionId)
  await gesto()
  await b.p.conexion.enviar('Page.stopScreencast', {}, b.p.sessionId)
  grabando = false
  await esperar(300)
  const segundos = (Date.now() - t0) / 1000
  const cadencia = Math.max(1, Math.round((n / segundos) * 10) / 10)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(cadencia), '-i', `${cuadros}/c%05d.jpg`, '-vf', 'scale=1200:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${DIR}/clip-${nombre}.mp4`])
  rmSync(cuadros, { recursive: true, force: true })
  console.log(JSON.stringify({ clip: nombre, cuadros: n, segundos: Math.round(segundos * 10) / 10, cadencia }))
}

/** El gesto de cada clip. */
async function clip(b: Banco, variante: string): Promise<void> {
  const nombre = `${variante}-${String(ANCHO)}`
  if (variante.includes('E5')) {
    await scrollHasta(b, await topeMas('por-que-develop', 0.7)(b))
    await grabar(b, nombre, () => esperar(9000))
    return
  }
  if (variante.includes('E7')) {
    // Un barrido del puntero sobre el hero, ida y vuelta, y quietud: el polvo se corre y vuelve.
    const mover = (x: number, y: number): Promise<unknown> => b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }, b.p.sessionId)
    await grabar(b, nombre, async () => {
      await esperar(600)
      for (let i = 0; i <= 60; i += 1) { await mover(ANCHO * (0.35 + 0.5 * (i / 60)), ALTO * (0.3 + 0.25 * Math.sin(i / 9))); await esperar(16) }
      await esperar(1800)
      for (let i = 60; i >= 0; i -= 1) { await mover(ANCHO * (0.35 + 0.5 * (i / 60)), ALTO * 0.45); await esperar(12) }
      await esperar(2400)
    })
    return
  }
  if (variante.includes('E4')) {
    await grabar(b, nombre, () => esperar(13000))
    return
  }
  // E6 (y cualquier otra): un tirón de scroll hacia Quiénes somos, frenada, vuelta rápida y quietud.
  const destino = await topeMas('quienes-somos', 0.15)(b)
  await grabar(b, nombre, async () => {
    await esperar(800)
    await medir(b.p, `(async () => { for (let y = 0; y <= ${String(destino)}; y += 140) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)) } return 1 })()`)
    await esperar(2200)
    await medir(b.p, `(async () => { for (let y = ${String(destino)}; y >= 0; y -= 220) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 16)) } window.scrollTo(0, 0); return 1 })()`)
    await esperar(2600)
  })
}

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  const filas: unknown[] = []
  for (const variante of VARIANTES) {
    const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena2', antesDeCargar: `window.__entornoDeLaEscena = '${banderas(variante)}'; ${CONTADOR}` })
    try {
      if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: CPU }, b.p.sessionId)
      if (MODO === 'clip') {
        await clip(b, variante)
        continue
      }
      for (const momento of MOMENTOS) {
        const y = await momento.y(b)
        await scrollHasta(b, y)
        if (MODO === 'capturas') {
          const quieta = await asentada(b)
          writeFileSync(`${DIR}/${momento.nombre}-${String(ANCHO)}-${variante}.png`, quieta.png)
          console.log(JSON.stringify({ variante, momento: momento.nombre, y, asentoMs: quieta.ms, intentos: quieta.intentos }))
          continue
        }
        const cuadros = await fps(b)
        const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
        const fila = { ancho: ANCHO, cpu: CPU, variante, momento: momento.nombre, fps: cuadros, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos) }
        filas.push(fila)
        console.log(JSON.stringify(fila))
      }
    } finally {
      await b.cerrar()
    }
  }
  if (MODO === 'fps') writeFileSync(`${DIR}/fps-${String(ANCHO)}-cpu${String(CPU)}-${VARIANTES.join('_')}.json`, JSON.stringify(filas, null, 2))
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
