/**
 * SPRINT ESCENA 7 — la tabla de costo por ticket. costo7.ts
 *
 * Todo lo aprobado quedó encendido en el producto, así que cada ticket se mide como la DIFERENCIA entre el
 * producto y el producto con ese ticket apagado (`X=no`), en el momento donde se ve; las pruebas con
 * bandera (T11, T13), al revés: el producto con la prueba prendida. Por caso: llamadas de dibujo,
 * triángulos y puntos del último cuadro, las pasadas que no son la escena (las dos simulaciones) con su
 * tiempo de GPU, y el cuadro medio y el p95 (topado por el monitor: sirve para ver saltos, no el techo).
 * Escribe `escena7/costo.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { CONTADOR, DIR7, ESPIA_DE_SALTOS } from './banco-escena'
import { ERRORES } from './formacion'
import { scrollDe } from './foto7'

/** Los puntos y las líneas del último cuadro (el `CONTADOR` sólo cuenta triángulos). */
const PUNTOS = `(() => {
  window.__puntos = { cuadro: 0, ultimo: 0, lineas: 0, ultimasLineas: 0 }
  for (const Ctx of [WebGL2RenderingContext, WebGLRenderingContext]) {
    for (const nombre of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const original = Ctx.prototype[nombre]
      if (typeof original !== 'function') continue
      Ctx.prototype[nombre] = function (...args) {
        const cantidad = nombre.startsWith('drawArrays') ? args[2] : args[1]
        const instancias = nombre.endsWith('Instanced') ? args[args.length - 1] : 1
        if (args[0] === 0) window.__puntos.cuadro += cantidad * instancias
        if (args[0] === 1 || args[0] === 3) window.__puntos.lineas += cantidad * instancias
        return original.apply(this, args)
      }
    }
  }
  const cerrar = () => {
    window.__puntos.ultimo = window.__puntos.cuadro
    window.__puntos.ultimasLineas = window.__puntos.lineas
    window.__puntos.cuadro = 0
    window.__puntos.lineas = 0
    requestAnimationFrame(cerrar)
  }
  requestAnimationFrame(cerrar)
})()`

/** El cuadro medio y el p95 en 120 cuadros (ms). */
const CUADROS = `new Promise((r) => {
  const t = []
  let antes = performance.now()
  const paso = (ahora) => {
    t.push(ahora - antes)
    antes = ahora
    if (t.length < 121) requestAnimationFrame(paso)
    else {
      const s = t.slice(1).sort((a, b) => a - b)
      r({ medio: Math.round((s.reduce((a, b) => a + b, 0) / s.length) * 100) / 100, p95: Math.round(s[Math.floor(s.length * 0.95)] * 100) / 100 })
    }
  }
  requestAnimationFrame(paso)
})`

interface Caso {
  readonly ticket: string
  readonly efecto: string
  readonly pedido: string
  /** Scroll en px o `<sección>+<pantallas>`; `amanecer` es la mirada de T11 (amanecer7.ts). */
  readonly donde: string
  /** Lo que se hace antes de medir (una expresión). */
  readonly antes?: string
  /** Una expresión que devuelve la medida de la pasada que no es la escena. */
  readonly pasada?: string
}

const FISICA = 'window.__fisicaDelBanco.medir(60)'
const PISO = 'window.__pisoDelBanco.medir(60)'
const NOCHE_CON_CIELO = '3900'
const TRABAJOS = 'trabajos+0'
const QUIENES = 'quienes-somos+0.15'

const CASOS: readonly Caso[] = [
  { ticket: '—', efecto: 'producto (hero)', pedido: 'producto', donde: '0', pasada: `Promise.all([${FISICA}, ${PISO}])` },
  { ticket: '—', efecto: 'producto (quienes-somos)', pedido: 'producto', donde: QUIENES },
  { ticket: '—', efecto: 'producto (noche con cielo, numeros)', pedido: 'producto', donde: NOCHE_CON_CIELO },
  { ticket: '—', efecto: 'producto (trabajos de noche)', pedido: 'producto', donde: TRABAJOS },
  { ticket: 'T2', efecto: 'sin formacion (hero)', pedido: 'producto,formacion=no', donde: '0' },
  { ticket: 'T2', efecto: 'sin formacion (noche con cielo)', pedido: 'producto,formacion=no', donde: NOCHE_CON_CIELO },
  { ticket: 'T3', efecto: 'sin cielo (noche con cielo)', pedido: 'producto,cielo=no', donde: NOCHE_CON_CIELO },
  { ticket: 'T4+T7', efecto: 'sin la fisica del polvo (hero)', pedido: 'producto,posarse=no', donde: '0' },
  { ticket: 'T5', efecto: 'sin piso vivo (hero)', pedido: 'producto,piso=no', donde: '0' },
  { ticket: 'T6', efecto: 'sin inercia (hero)', pedido: 'producto,inercia=no', donde: '0' },
  { ticket: 'T8', efecto: 'sin niebla (quienes-somos)', pedido: 'producto,niebla=no', donde: QUIENES },
  { ticket: 'T9', efecto: 'sin encendido (trabajos de noche)', pedido: 'producto,encendido=no', donde: TRABAJOS },
  { ticket: 'T10', efecto: 'sin nitidez (hero)', pedido: 'producto,nitidez=no', donde: '0' },
  { ticket: 'T12', efecto: 'sin rebote ni sombras de motas (trabajos de noche)', pedido: 'producto,rebote=no', donde: TRABAJOS },
  { ticket: 'T11', efecto: 'producto en la mirada del amanecer (sin la prueba)', pedido: 'producto', donde: 'amanecer' },
  { ticket: 'T11', efecto: 'amanecer, clavado en los rayos (4,9 s)', pedido: 'producto,amanecer', donde: 'amanecer', antes: 'window.__amanecerDelBanco.congelar(4.9)' },
  { ticket: 'T13', efecto: 'fibras (hero)', pedido: 'producto,fibras', donde: '0' },
  { ticket: 'T13', efecto: 'estrella fugaz, cruzando (noche con cielo)', pedido: 'producto,fugaz', donde: NOCHE_CON_CIELO, antes: 'window.__fugazDelBanco.ya(0.5)' },
  { ticket: 'T13', efecto: 'enfoque, buscando (hero)', pedido: 'producto,enfoque', donde: '0', antes: 'window.__enfoqueDelBanco.ya()' },
  { ticket: 'T13', efecto: 'grano (hero)', pedido: 'producto,grano', donde: '0' },
]

/** La mirada de T11: pasa por la puerta (arranca el amanecer) y deja el borde de Tu panel arriba. */
async function alAmanecer(b: Banco, conAmanecer: boolean): Promise<void> {
  const borde = (k: number): Promise<number> => medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * ${String(k)}) })()`)
  const puerta = await borde(0.8)
  const mirada = await borde(0.12)
  await scrollHasta(b, puerta - 400)
  if (conAmanecer) await medir(b.p, 'window.__amanecerDelBanco.congelar(0)')
  await scrollHasta(b, mirada)
}

async function principal(): Promise<void> {
  const filas: Record<string, unknown>[] = []
  const solo = process.argv[2]
  for (const caso of CASOS.filter((c) => solo === undefined || c.ticket === solo)) {
    const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${caso.pedido}'; ${CONTADOR}; ${PUNTOS}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
    try {
      if (caso.donde === 'amanecer') await alAmanecer(b, caso.pedido.includes('amanecer'))
      else await scrollHasta(b, await scrollDe(b, caso.donde))
      await esperar(2500)
      if (caso.antes !== undefined) {
        await medir(b.p, caso.antes)
        await esperar(300)
      }
      const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
      const puntos = await medir<{ ultimo: number; ultimasLineas: number }>(b.p, 'window.__puntos')
      const cuadro = await medir<unknown>(b.p, CUADROS)
      const pasada = caso.pasada === undefined ? null : await medir<unknown>(b.p, caso.pasada)
      const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
      const fila = { ...caso, y: await medir<number>(b.p, 'Math.round(scrollY)'), llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos), puntos: puntos.ultimo, vertLineas: puntos.ultimasLineas, cuadro, pasada, errores: errores.slice(0, 3) }
      filas.push(fila)
      console.log(JSON.stringify(fila))
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${DIR7}/costo${solo === undefined ? '' : `-${solo}`}.json`, JSON.stringify(filas, null, 1))
}

if (process.argv[1]?.endsWith('costo7.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
