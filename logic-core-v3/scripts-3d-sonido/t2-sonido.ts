/**
 * 3D Y SONIDO · T2 — el sonido, sin oírlo: t2-sonido.ts [partes]
 *
 * No se puede escuchar desde el banco: se mide lo que se descarga y cuándo, y QUÉ sonidos se piden ante cada gesto (se
 * envuelve `Howl.prototype.play`, que howler deja en `window`). Como una persona (sin el gancho del banco de la escena).
 *
 *   `producto`   /v3 sin bandera: no hay parlante, ni howler ni el archivo se descargan, aunque se toque todo.
 *   `sitio`      /v3?pruebas=sonido=si: el parlante apagado; nada se descarga hasta prenderlo; al prenderlo, el sprite (uno)
 *                y el audio corriendo; después, los gestos: la barra (tic), un clic (clic), una foto (foto), el logo
 *                (pulso), la noche (encendido), el túnel (tunel), el amanecer con la rueda (amanecer) y el ambiente.
 *   `recuerda`   la misma, recargada: el parlante prendido, y el motor recién con la primera acción.
 *   `reducido`   con movimiento reducido: sin ambiente.
 *   `prueba`     /v3?sonidos=1: la página de prueba (captura) y cada botón.
 *   `menu`       a 390, el menú del teléfono: abrirlo y cerrarlo (el Genie: abre, cierra).
 *   `capturas`   el parlante a 1440 y a 390, sobre claro y sobre oscuro.
 *
 * Con la NVIDIA (`BANCO_GPU=alta`). Va a `3d-sonido/t2-sonido/`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirCon, antesDeLaParte, capturar, carpeta, correr, esperar, raton, rueda, viajarA, type Banco } from './banco'

const DIR = carpeta('t2-sonido')
const PARTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['producto', 'sitio', 'recuerda', 'reducido', 'prueba', 'menu', 'capturas']
const resultado: Record<string, unknown> = existsSync(`${DIR}/resultado.json`) ? (JSON.parse(readFileSync(`${DIR}/resultado.json`, 'utf8')) as Record<string, unknown>) : {}

/** Lo descargado que es del sonido: el sprite y el chunk de howler (por su texto). */
const DESCARGADO = `performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /\\/v3\\/sonido\\/|howler/i.test(n))`

/** Envuelve el `play` de howler (cuando existe) para anotar cada sonido pedido con su instante. */
const ESPIA = `(() => {
  if (!window.Howl || window.__espiaDelSonido) return !!window.Howl
  window.__espiaDelSonido = true
  window.__sonados = []
  const t0 = performance.now()
  const play = window.Howl.prototype.play
  window.Howl.prototype.play = function (s, ...resto) { if (typeof s === 'string') window.__sonados.push([Math.round(performance.now() - t0), s]); return play.call(this, s, ...resto) }
  return true
})()`

const sonados = (b: Banco): Promise<[number, string][]> => medir<[number, string][]>(b.p, 'window.__sonados || []')
const contar = (l: readonly [number, string][]): Record<string, number> => l.reduce<Record<string, number>>((c, [, s]) => ({ ...c, [s]: (c[s] ?? 0) + 1 }), {})

async function espiar(b: Banco): Promise<void> {
  for (let i = 0; i < 40; i += 1) {
    if (await medir<boolean>(b.p, ESPIA)) return
    await esperar(250)
  }
  throw new Error('howler no apareció en window')
}

async function producto(): Promise<void> {
  await antesDeLaParte('t2 producto')
  const b = await abrirCon(null, 1440, 900)
  try {
    await raton(b, [700, 48], [880, 48], 12)
    await medir(b.p, `document.querySelector('[data-pieza="barra"] a[href="#quienes-somos"]').click()`)
    await esperar(5000)
    resultado.producto = { parlante: await medir<boolean>(b.p, `!!document.querySelector('[data-pieza="control-del-sonido"]')`), descargado: await medir<string[]>(b.p, DESCARGADO), howler: await medir<boolean>(b.p, '!!window.Howl') }
  } finally {
    await b.cerrar()
  }
}

async function sitio(): Promise<void> {
  await antesDeLaParte('t2 sitio')
  const b = await abrirCon(null, 1440, 900, 'pruebas=sonido=si')
  const r: Record<string, unknown> = {}
  try {
    await medir(b.p, 'localStorage.removeItem("develop-v3-sonido"); localStorage.removeItem("develop-v3-sonido-volumenes")')
    await medir(b.p, 'location.reload()')
    await esperar(7000)
    r.antes = { parlante: await medir<string | null>(b.p, `document.querySelector('[data-pieza="control-del-sonido"]')?.getAttribute('aria-pressed') ?? null`), descargado: await medir<string[]>(b.p, DESCARGADO) }
    // Tocar la página (sin prender): sigue sin descargar nada.
    await raton(b, [700, 48], [880, 48], 12)
    await esperar(1000)
    r.tocandoSinPrender = await medir<string[]>(b.p, DESCARGADO)
    // Prender: un clic de verdad (CDP) sobre el parlante.
    const [x, y] = await medir<[number, number]>(b.p, `(() => { const r = document.querySelector('[data-pieza="control-del-sonido"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
    await clic(b, x, y)
    await espiar(b)
    await esperar(2500)
    r.alPrender = { parlante: await medir<string | null>(b.p, `document.querySelector('[data-pieza="control-del-sonido"]').getAttribute('aria-pressed')`), descargado: await medir<string[]>(b.p, DESCARGADO), audio: await medir<string>(b.p, 'window.Howler && window.Howler.ctx ? window.Howler.ctx.state : "sin contexto"'), recordado: await medir<string | null>(b.p, 'localStorage.getItem("develop-v3-sonido")') }
    // Los gestos, uno por uno.
    const gestos: Record<string, Record<string, number>> = {}
    const gesto = async (nombre: string, hacer: () => Promise<void>): Promise<void> => {
      const antes = (await sonados(b)).length
      await hacer()
      gestos[nombre] = contar((await sonados(b)).slice(antes))
    }
    // La barra está donde esté (en el hero, abajo): el barrido a la altura de sus ítems.
    const [x0, yb, x1] = await medir<[number, number, number]>(b.p, `(() => { const l = [...document.querySelectorAll('[data-pieza="barra-enlace"]')].map((a) => a.getBoundingClientRect()); return [l[0].left + 8, (l[0].top + l[0].bottom) / 2, l[l.length - 1].right - 8] })()`)
    await gesto('barra (el mouse pasa por los seis ítems)', () => raton(b, [x0, yb], [x1, yb], 30))
    await gesto('clic en un enlace de la barra (viaja a Quiénes somos)', async () => {
      const [ex, ey] = await medir<[number, number]>(b.p, `(() => { const r = document.querySelector('[data-pieza="barra"] a[href="#quienes-somos"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
      await clic(b, ex, ey)
      await esperar(5000)
    })
    await gesto('una foto del equipo (el mouse entra)', async () => {
      await medir(b.p, `document.querySelectorAll('[data-pieza-a="persona"]')[1].querySelector('[data-marco="dos-tomas"]').scrollIntoView({ block: 'center' })`)
      await esperar(2500)
      const c = await medir<[number, number, number, number]>(b.p, `(() => { const r = document.querySelectorAll('[data-pieza-a="persona"]')[1].querySelector('[data-marco="dos-tomas"]').getBoundingClientRect(); return [r.left, r.top, r.width, r.height] })()`)
      await raton(b, [c[0] - 40, c[1] + c[3] / 2], [c[0] + c[2] / 2, c[1] + c[3] / 2], 6)
      await esperar(800)
      await raton(b, [c[0] + c[2] / 2, c[1] + c[3] / 2], [c[0] - 40, c[1] + c[3] / 2], 6)
    })
    await gesto('el viaje a Portfolio (cae la noche, el túnel no: el viaje salta)', async () => {
      await viajarA(b, 'trabajos')
      await esperar(6500)
    })
    await gesto('la rueda por el túnel de Trabajos', async () => {
      await rueda(b, 30, 90, 720, 820)
      await esperar(2500)
    })
    await gesto('el hover del logo (el principal del pulso), en el hero', async () => {
      await medir(b.p, 'window.scrollTo(0, 0)')
      await esperar(3500)
      await raton(b, [200, 450], [720, 420], 20)
      await esperar(1500)
      await raton(b, [720, 420], [200, 450], 20)
      await esperar(1500)
    })
    await gesto('de Tu panel a Por qué develOP con la rueda (el amanecer)', async () => {
      await viajarA(b, 'tu-panel')
      await esperar(6000)
      await rueda(b, 60, 110, 720, 820)
      await esperar(4000)
    })
    r.gestos = gestos
    r.ambiente = await medir<number>(b.p, '(window.__sonados || []).filter(([, s]) => s === "dia" || s === "noche").length')
    r.todos = await sonados(b)
  } finally {
    await b.cerrar()
  }
  resultado.sitio = r
}

async function clic(b: Banco, x: number, y: number): Promise<void> {
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'] as const) await b.p.conexion.enviar('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }, b.p.sessionId)
}

async function recuerda(): Promise<void> {
  await antesDeLaParte('t2 recuerda')
  const b = await abrirCon(null, 1440, 900, 'pruebas=sonido=si')
  try {
    await medir(b.p, 'localStorage.setItem("develop-v3-sonido", "si")')
    await medir(b.p, 'location.reload()')
    await esperar(7000)
    const antes = { parlante: await medir<string | null>(b.p, `document.querySelector('[data-pieza="control-del-sonido"]')?.getAttribute('aria-pressed') ?? null`), descargado: await medir<string[]>(b.p, DESCARGADO) }
    await clic(b, 300, 600)
    await espiar(b)
    await esperar(2500)
    resultado.recuerda = { antes, despuesDeUnClic: { descargado: await medir<string[]>(b.p, DESCARGADO), audio: await medir<string>(b.p, 'window.Howler && window.Howler.ctx ? window.Howler.ctx.state : "sin contexto"') } }
    await medir(b.p, 'localStorage.removeItem("develop-v3-sonido")')
  } finally {
    await b.cerrar()
  }
}

async function reducido(): Promise<void> {
  await antesDeLaParte('t2 reducido')
  const b = await abrirCon(null, 1440, 900, 'pruebas=sonido=si', true)
  try {
    await medir(b.p, 'localStorage.setItem("develop-v3-sonido", "si")')
    await medir(b.p, 'location.reload()')
    await esperar(7000)
    await clic(b, 300, 600)
    await espiar(b)
    await esperar(4000)
    resultado.reducido = { ambiente: await medir<number>(b.p, '(window.__sonados || []).filter(([, s]) => s === "dia" || s === "noche").length') }
    await medir(b.p, 'localStorage.removeItem("develop-v3-sonido")')
  } finally {
    await b.cerrar()
  }
}

async function prueba(): Promise<void> {
  await antesDeLaParte('t2 prueba')
  const b = await abrirCon(null, 1440, 900, 'sonidos=1')
  try {
    await esperar(1500)
    const r0 = await medir<string[]>(b.p, DESCARGADO)
    await capturar(b, `${DIR}/pagina-de-prueba-sin-cargar.png`)
    const boton = async (texto: string, n = 0): Promise<void> => {
      const [x, y] = await medir<[number, number]>(b.p, `(() => { const e = [...document.querySelectorAll('[data-pieza="prueba-de-sonidos"] button')].filter((x) => x.textContent.trim() === '${texto}')[${String(n)}]; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
      await clic(b, x, y)
    }
    await boton('Cargar los sonidos')
    await espiar(b)
    await esperar(2500)
    for (let i = 0; i < 9; i += 1) {
      await boton('Sonar', i)
      await esperar(i === 5 || i === 6 ? 1500 : 500)
    }
    await boton('Bucle', 0)
    await esperar(1500)
    await medir(b.p, `document.querySelector('[data-pieza="prueba-de-sonidos"]').scrollTop = 0`)
    await capturar(b, `${DIR}/pagina-de-prueba.png`)
    resultado.prueba = { antesDeCargar: r0, sonados: await sonados(b) }
  } finally {
    await b.cerrar()
  }
}
async function menu(): Promise<void> {
  await antesDeLaParte('t2 menu')
  const b = await abrirCon(null, 390, 844, 'pruebas=sonido=si')
  try {
    await medir(b.p, 'localStorage.setItem("develop-v3-sonido", "si")')
    await medir(b.p, 'location.reload()')
    await esperar(7000)
    await clic(b, 195, 600)
    await espiar(b)
    await esperar(2500)
    const centro = (sel: string): Promise<[number, number]> => medir<[number, number]>(b.p, `(() => { const r = document.querySelector('${sel}').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`)
    const antes = (await sonados(b)).length
    const [bx, by] = await centro('[data-parte="boton-del-menu"]')
    await clic(b, bx, by)
    await esperar(1500)
    const [cx, cy] = await centro('[data-parte="cerrar-el-menu"]')
    await clic(b, cx, cy)
    await esperar(1500)
    resultado.menu = contar((await sonados(b)).slice(antes))
    await medir(b.p, 'localStorage.removeItem("develop-v3-sonido")')
  } finally {
    await b.cerrar()
  }
}

async function capturas(): Promise<void> {
  await antesDeLaParte('t2 capturas')
  for (const [ancho, alto] of [[1440, 900], [390, 844]] as const) {
    const b = await abrirCon(null, ancho, alto, 'pruebas=sonido=si')
    try {
      for (const [id, nombre] of [['hero', 'claro'], ['trabajos', 'oscuro']] as const) {
        if (id === 'trabajos') {
          await medir(b.p, `document.getElementById('trabajos').scrollIntoView({ block: 'start' })`)
          await esperar(5000)
        }
        const r = await medir<[number, number, number, number]>(b.p, `(() => { const a = document.querySelector('[data-pieza="control-del-sonido"]').getBoundingClientRect(); const i = document.querySelector('[data-pieza="infinito-del-recorrido"]').getBoundingClientRect(); const x = Math.min(a.left, i.left) - 24, y = Math.min(a.top, i.top) - 24; return [x, y, Math.max(a.right, i.right) + 24 - x, Math.max(a.bottom, i.bottom) + 24 - y] })()`)
        await capturar(b, `${DIR}/parlante-${String(ancho)}-${nombre}.png`, r.map((v) => Math.round(v)) as [number, number, number, number])
      }
    } finally {
      await b.cerrar()
    }
  }
}

correr(async () => {
  const partes: Record<string, () => Promise<void>> = { producto, sitio, recuerda, reducido, prueba, menu, capturas }
  for (const p of PARTES) {
    await partes[p]()
    writeFileSync(`${DIR}/resultado.json`, JSON.stringify(resultado, null, 1))
  }
  console.log(JSON.stringify(resultado, null, 1).slice(0, 4000))
})
