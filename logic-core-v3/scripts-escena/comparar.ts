/**
 * SPRINT ESCENA — las cuatro variantes de la escena, en los mismos cinco momentos.
 * comparar.ts <ancho> <alto> <capturas|fps> [variantes separadas por coma] [cpu]
 *
 * Abre /v3 con la bandera de `_lib/escena/variante.ts` pisada ANTES de cargar la página
 * (`window.__varianteDeLaEscena`) y un contador de llamadas de dibujo de WebGL puesto por el banco
 * (se cuentan `drawArrays`/`drawElements` y sus variantes instanciadas por cuadro, sombra incluida:
 * no hay que tocar el producto para medirlo). Llega a cada momento POR SCROLL, a pasos, así la noche
 * de Trabajos cae como cae; espera a que asiente, captura y mide cuadros por segundo.
 *
 *   · `capturas` — los cinco momentos a este ancho, una captura por variante y por momento.
 *   · `fps` — cuadros por segundo y llamadas de dibujo en cada momento, con la CPU estrangulada
 *     `cpu` veces (4 para el perfil móvil).
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'

const [ANCHO, ALTO, MODO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), process.argv[4] ?? 'capturas']
const VARIANTES = (process.argv[5] ?? 'actual,v1,v2,v3').split(',')
const CPU = Number(process.argv[6] ?? 1)
const DIR = 'C:/Users/Valentino/.cache/b4-medicion/escena'

/** Cuenta las llamadas de dibujo del cuadro en curso y guarda la del último cuadro completo. */
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
  /** El píxel de scroll, sobre el documento de ese instante. */
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

/** La luminancia media de cada bloque de 30 × 30 px: las motas, que corren solas, se promedian adentro. */
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

/** Una captura, y la emulación de vuelta: capturar congela los pasos de render (CLAUDE.md). */
async function foto(b: Banco): Promise<Buffer> {
  const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(shot.data, 'base64')
}

/**
 * ESPERA A QUE LA ESCENA SE ASIENTE Y DEVUELVE LA CAPTURA.
 *
 * Primero un empujón de un píxel ida y vuelta: vuelve a disparar el scroll por si una captura
 * anterior dejó los pasos de render congelados y la escena no se enteró del último movimiento (es
 * lo que dejó el pie de V1 con la cámara de Por qué en la primera corrida). Después, dos capturas
 * a 1,5 s tienen que coincidir por bloques; si no, se espera y se repite.
 */
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

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  const filas: unknown[] = []
  for (const variante of VARIANTES) {
    const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena', antesDeCargar: `window.__varianteDeLaEscena = '${variante}'; ${CONTADOR}` })
    try {
      if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: CPU }, b.p.sessionId)
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
  if (MODO === 'fps') writeFileSync(`${DIR}/fps-${String(ANCHO)}-cpu${String(CPU)}.json`, JSON.stringify(filas, null, 2))
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
