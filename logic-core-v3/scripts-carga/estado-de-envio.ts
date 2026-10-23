/**
 * [C2 · 20] EL ESTADO DE ENVÍO — el banco de `EstadoDeEnvio` en la página de prueba (`/v3/piezas`), con el Chrome del sistema a la
 * vista, contra el dev o el build (`BASE`). La respuesta del envío la da el banco con `page.route` (`/api/piezas-de-prueba`, que ni
 * existe); el resto de `/api/` se corta: nunca se llama a una `/api/` real.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,390 npx tsx scripts-carga/estado-de-envio.ts
 *
 * Por ancho (1440 × 900 con el mouse; 390 × 844 táctil), en el formulario de contacto sobre el papel (`envio-papel`), dos envíos:
 *   · ÉXITO (la respuesta a los 250 ms, antes de que la carga termine de aparecer):
 *       - ENVIANDO: la vista pasa a `carga` en ≤ 400 ms del clic (con la vuelta del clic de Playwright); el formulario se desvanece (opacidad < 0,05) y queda inerte; la carga
 *         llega a opacidad ≥ 0,95 y GIRA (≥ 3 transformadas distintas del giro), y ya gira mientras aparece (≥ 2 distintas con la
 *         opacidad entre 0,05 y 0,9); se ve por lo menos 550 ms (el mínimo es 600) aunque la respuesta llegó a los 250;
 *       - el MENSAJE: la vista pasa a `exito`, el encastre `encaja` y el texto «¡Recibido!» llega a opacidad ≥ 0,95;
 *       - la VUELTA: en ≤ 7 s del clic la vista vuelve a `formulario`, el formulario a opacidad ≥ 0,95, no inerte, y VACÍO.
 *   · ERROR (la respuesta, un 500 a los 1200 ms): lo mismo con `error`, el encastre `no-encaja` y «Algo falló»; el formulario vuelve
 *     con lo escrito (nombre, mail y mensaje).
 * Y a 1440 con movimiento reducido: la carga aparece QUIETA (el logo sin las secciones del giro).
 *
 *   CONTROL=sin-carga   … la carga escondida con una hoja inyectada: «enviando» tiene que dar FALLA.
 *   CONTROL=sin-datos   … después del error el banco borra los campos en el DOM: la vuelta del error tiene que dar FALLA.
 *
 * Capturas y resultados en ~/.cache/b4-medicion/estado-de-envio.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'sin-carga', 'sin-datos'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: sin-carga | sin-datos`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/estado-de-envio')
const RUTA = '/v3/piezas?preloader=no'
const FORM = 'envio-papel'
const ESCRITO = { nombre: 'Ana Prueba', mail: 'ana@ejemplo.com', mensaje: 'Una prueba del banco.' } as const
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Foto {
  readonly t: number
  readonly vista: string
  readonly form: number
  readonly inerte: boolean
  readonly carga: number
  readonly giro: string
  readonly secciones: number
  readonly encaje: string
  readonly mensaje: number
  readonly texto: string
  readonly nombre: string
  readonly mail: string
  readonly escrito: string
}

/** Una foto del componente: la vista, el formulario, la carga (y la transformada de su giro), el encastre, el mensaje y los campos. */
const FOTO = `(() => {
  const raiz = document.querySelector('[data-demo="${FORM}"]').closest('[data-pieza="estado-de-envio"]')
  const capa = raiz.querySelector('[data-parte="formulario"]')
  const carga = raiz.querySelector('[data-parte="carga-del-envio"]')
  const giro = carga ? carga.querySelector('[data-pieza="carga"] > span > span > span') : null
  const mensaje = raiz.querySelector('[data-parte="mensaje-del-envio"]')
  const encaje = raiz.querySelector('[data-encaje]')
  const valor = (k) => { const e = document.getElementById('${FORM}-' + k); return e ? e.value : '' }
  return {
    t: performance.now(), vista: raiz.dataset.vista || '', form: Number(getComputedStyle(capa).opacity), inerte: capa.inert === true,
    carga: carga ? Number(getComputedStyle(carga).opacity) : -1, giro: giro ? getComputedStyle(giro).transform : '',
    secciones: carga ? carga.querySelectorAll('[data-seccion-del-giro]').length : 0,
    encaje: encaje ? encaje.getAttribute('data-encaje') : '', mensaje: mensaje ? Number(getComputedStyle(mensaje).opacity) : -1,
    texto: mensaje ? mensaje.textContent : '', nombre: valor('nombre'), mail: valor('mail'), escrito: valor('mensaje'),
  }
})()`
const foto = (p: Page): Promise<Foto> => p.evaluate(FOTO) as Promise<Foto>

async function muestrear(p: Page, ms: number, pasoMs = 40): Promise<Foto[]> {
  const serie: Foto[] = []
  const fin = Date.now() + ms
  while (Date.now() < fin) {
    serie.push(await foto(p))
    await dormir(pasoMs)
  }
  return serie
}

async function llenar(p: Page): Promise<void> {
  await p.locator(`[data-demo="${FORM}"]`).scrollIntoViewIfNeeded()
  await p.fill(`#${FORM}-nombre`, ESCRITO.nombre)
  await p.fill(`#${FORM}-mail`, ESCRITO.mail)
  await p.fill(`#${FORM}-mensaje`, ESCRITO.mensaje)
}

/** Un envío entero: llena, envía y muestrea hasta la vuelta. Devuelve la línea del resultado. */
async function envio(p: Page, ancho: number, tipo: 'exito' | 'error', respuesta: { estado: number; ms: number }, pedida: { estado: number; ms: number }): Promise<{ readonly linea: string; readonly bien: boolean }> {
  pedida.estado = respuesta.estado
  pedida.ms = respuesta.ms
  await llenar(p)
  const t0 = (await foto(p)).t
  await p.click(`[data-demo="${FORM}"] button[type="submit"]`)
  const serie: Foto[] = []
  // Hasta el mensaje (con el error, el banco del control borra los campos ahí) y después hasta la vuelta.
  // La vuelta se cuenta desde la respuesta (el error llega a los 1200 ms): 6,5 s para el encastre, los ~3 s del mensaje y el fundido.
  const fin = Date.now() + respuesta.ms + 7000
  let borrado = false
  while (Date.now() < fin) {
    const f = await foto(p)
    serie.push(f)
    if (CONTROL === 'sin-datos' && tipo === 'error' && !borrado && f.vista === 'error') {
      await p.evaluate(`document.querySelectorAll('[data-demo="${FORM}"] input, [data-demo="${FORM}"] textarea').forEach((e) => { e.value = '' })`)
      borrado = true
    }
    if (f.vista === 'formulario' && serie.some((x) => x.vista === tipo) && f.form >= 0.95) break
    await dormir(40)
  }
  const cargando = serie.filter((f) => f.vista === 'carga')
  const primeraCarga = cargando[0]
  const giros = new Set(cargando.filter((f) => f.carga > 0).map((f) => f.giro))
  const aparece = new Set(cargando.filter((f) => f.carga > 0.05 && f.carga < 0.9).map((f) => f.giro))
  const cargaMs = cargando.length > 0 ? cargando[cargando.length - 1].t - cargando[0].t : 0
  const enviandoBien =
    primeraCarga !== undefined && primeraCarga.t - t0 <= 400 && cargando.some((f) => f.form < 0.05 && f.inerte) && cargando.some((f) => f.carga >= 0.95) && giros.size >= 3 && aparece.size >= 2 && cargaMs >= 550
  const conMensaje = serie.filter((f) => f.vista === tipo)
  const textoEsperado = tipo === 'exito' ? '¡Recibido!' : 'Algo falló'
  const mensajeBien = conMensaje.some((f) => f.mensaje >= 0.95 && f.texto.includes(textoEsperado)) && conMensaje.some((f) => f.encaje === (tipo === 'exito' ? 'encaja' : 'no-encaja')) && conMensaje.every((f) => f.encaje === '' || f.encaje === (tipo === 'exito' ? 'encaja' : 'no-encaja'))
  const ultima = serie[serie.length - 1]
  const datosBien = tipo === 'exito' ? ultima.nombre === '' && ultima.mail === '' && ultima.escrito === '' : ultima.nombre === ESCRITO.nombre && ultima.mail === ESCRITO.mail && ultima.escrito === ESCRITO.mensaje
  const vueltaBien = ultima.vista === 'formulario' && ultima.form >= 0.95 && !ultima.inerte && ultima.t - t0 <= respuesta.ms + 6500 && datosBien
  const bien = enviandoBien && mensajeBien && vueltaBien
  const linea =
    `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${tipo} (respuesta ${String(respuesta.estado)} a los ${String(respuesta.ms)} ms)` +
    ` · enviando ${enviandoBien ? 'ok' : 'FALLA'} (a la carga en ${primeraCarga === undefined ? '—' : `${(primeraCarga.t - t0).toFixed(0)} ms`}, formulario ${cargando.some((f) => f.form < 0.05 && f.inerte) ? 'ido e inerte' : 'A LA VISTA'}, carga máx ${Math.max(-1, ...cargando.map((f) => f.carga)).toFixed(2)}, ${String(giros.size)} transformadas del giro, ${String(aparece.size)} mientras aparece, ${cargaMs.toFixed(0)} ms a la vista)` +
    ` · mensaje ${mensajeBien ? 'ok' : 'FALLA'} («${conMensaje.find((f) => f.texto !== '')?.texto ?? ''}», encastre ${conMensaje[0]?.encaje ?? '—'})` +
    ` · vuelta ${vueltaBien ? 'ok' : 'FALLA'} (${ultima.vista} a los ${(ultima.t - t0).toFixed(0)} ms, opacidad ${ultima.form.toFixed(2)}, campos ${JSON.stringify([ultima.nombre, ultima.mail, ultima.escrito])})`
  return { linea, bien }
}

async function contexto(ancho: number, reducido: boolean): Promise<{ readonly p: Page; readonly cerrar: () => Promise<void>; readonly pedida: { estado: number; ms: number } }> {
  const movil = ancho < 1024
  const alto = movil ? 844 : 900
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/envio-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    reducedMotion: reducido ? 'reduce' : 'no-preference',
    args: [`--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const pedida = { estado: 200, ms: 250 }
  await p.route('**/api/**', async (r) => {
    if (r.request().url().includes('/api/piezas-de-prueba')) {
      await dormir(pedida.ms)
      await r.fulfill({ status: pedida.estado, contentType: 'application/json', body: '{}' })
      return
    }
    await r.abort()
  })
  await p.goto(`${BASE}${RUTA}`, { waitUntil: 'load', timeout: 300000 })
  if (CONTROL === 'sin-carga') await p.addStyleTag({ content: '[data-parte="carga-del-envio"] { opacity: 0 !important; }' })
  await dormir(2500)
  return { p, pedida, cerrar: () => ctx.close() }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean }[] = []
  for (const ancho of ANCHOS) {
    const { p, pedida, cerrar } = await contexto(ancho, false)
    try {
      const visible = (await p.evaluate('document.visibilityState === "visible" && innerWidth > 0')) as boolean
      console.log(`·     ${String(ancho)} · ${RUTA} · visible: ${String(visible)}`)
      for (const [tipo, respuesta] of [['exito', { estado: 200, ms: 250 }], ['error', { estado: 500, ms: 1200 }]] as const) {
        const r = await envio(p, ancho, tipo, { ...respuesta }, pedida)
        console.log(r.linea)
        lineas.push(r)
        await dormir(800)
      }
      // Una sola captura, al final: una captura en medio congela los pasos de render (CLAUDE.md, «Page.captureScreenshot»).
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-despues-del-error.png`) }).catch(() => undefined)
    } finally {
      await cerrar()
    }
  }
  // Movimiento reducido: la carga aparece quieta (sin las secciones del giro).
  if (ANCHOS.includes(1440)) {
    const { p, pedida, cerrar } = await contexto(1440, true)
    try {
      pedida.estado = 200
      pedida.ms = 1500
      await llenar(p)
      await p.click(`[data-demo="${FORM}"] button[type="submit"]`)
      const serie = await muestrear(p, 1200)
      const conCarga = serie.filter((f) => f.vista === 'carga' && f.carga > 0)
      const bien = conCarga.length > 0 && conCarga.every((f) => f.secciones === 0 && f.giro === '')
      const linea = `${bien ? 'ok   ' : 'FALLA'} 1440 · reducido · la carga ${conCarga.length === 0 ? 'NO APARECIÓ' : conCarga.every((f) => f.secciones === 0) ? 'quieta (el logo sin girar)' : 'GIRANDO'}`
      console.log(linea)
      lineas.push({ linea, bien })
    } finally {
      await cerrar()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  console.log(`estado de envío: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR ${CONTROL === 'sin-carga' ? '«enviando»' : 'la vuelta del error'})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
