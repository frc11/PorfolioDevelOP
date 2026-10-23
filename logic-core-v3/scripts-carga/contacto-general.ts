/**
 * [C2 · 22] EL CONTACTO GENERAL — el banco del panel que viene del fondo (teléfono y tablet), del envío con `EstadoDeEnvio` y del
 * autocompletado, con el Chrome del sistema a la vista, contra el dev o el build (`BASE`). NUNCA llama a `/api/` de verdad: todo `/api/**`
 * se intercepta con `page.route` (`/api/contacto` responde lo que pide cada paso; lo demás, cortado).
 *
 *   BASE=http://localhost:3000 ANCHOS=390,768,1024,1440 npx tsx scripts-carga/contacto-general.ts
 *
 * Por ancho (el contacto se abre con un clic programático en un `[data-abre-contacto="panel"]`):
 *   TAMAÑO  abajo de 1024 el panel mide 68 a 72 % del ancho visible y 68 a 72 % del alto (o, si el contenido pide más, hasta el 90 % y sin
 *           scroll por adentro), centrado (±2 px), con el fondo desenfocado (blur de 20 px o más). A 1024 el chrome cae en modo
 *           menú y el contacto es el panel (medido); arriba de 1024 es la placa de siempre: se mide centrada y con el fondo desenfocado y el tamaño sólo se informa.
 *   LLEGADA abajo de 1024: entra por escala y fundido (arranca chica, crece sin retroceder hasta 1, el fundido llega a 1, sin desplazarse
 *           desde abajo) y sale igual (vuelve a achicarse, sin desplazarse). Con movimiento reducido: sólo un fundido (la escala no se mueve).
 *   ENVÍO   en todos los anchos: vacío no manda nada y marca el campo (`aria-invalid`, el texto del sitio); con el servidor en error el
 *           estado pasa por formulario, carga (600 ms por lo menos) y error («Algo falló», con su línea), y el formulario vuelve con lo escrito;
 *           con el servidor bien, por la carga y el éxito («¡Recibido!», con su línea) y el panel se cierra solo. Un envío por intento.
 *   AUTOCOMPLETADO  Chrome autocompleta de verdad (`Autofill.trigger`): el fondo, el color y la tinta del texto del campo no cambian ni son
 *           el celeste del navegador; menos de dos campos llenos es «NO CORRE».
 *
 *   CONTROL=sin-escala      una hoja inyectada le saca la escala a la hoja: la LLEGADA tiene que dar FALLA abajo de 1024.
 *   CONTROL=sin-desenfoque  le saca el desenfoque al velo: el TAMAÑO (fondo difuminado) tiene que dar FALLA en todos los anchos.
 *   CONTROL=ancho-completo  la hoja a pantalla completa (la de antes): el TAMAÑO tiene que dar FALLA abajo de 1024.
 *   CONTROL=sin-mensaje     esconde el mensaje del envío: el ENVÍO tiene que dar FALLA.
 *   CONTROL=sin-arreglo     apaga el arreglo del autocompletado: el AUTOCOMPLETADO tiene que dar FALLA.
 *
 * Resultados en ~/.cache/b4-medicion/contacto-general.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type BrowserContext, type CDPSession, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '390,768,1024,1440').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const CONTROLES: Readonly<Record<string, string>> = {
  'sin-escala': '[data-pieza="contacto"] [role="dialog"] { transform: none !important; }',
  'sin-desenfoque': '[data-pieza="contacto"] [data-parte="velo"] { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
  'ancho-completo': '[data-pieza="contacto"] [role="dialog"] { width: 100vw !important; min-width: 100vw !important; min-height: 100svh !important; max-height: none !important; }',
  'sin-mensaje': '[data-parte="mensaje-del-envio"] { display: none !important; }',
  'sin-arreglo': '[data-v3] input:autofill { transition: none !important; -webkit-text-fill-color: initial !important; }',
}
if (CONTROL !== '' && !(CONTROL in CONTROLES)) throw new Error(`CONTROL=${CONTROL}: ${Object.keys(CONTROLES).join(' | ')}`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/contacto-general')
// A 1024 la barra no entra con Contacto y Login, el chrome cae en modo menu y el contacto es el panel (medido): la placa empieza arriba de 1024.
const ESCRITORIO = 1025
const DIALOGO = '[data-pieza="contacto"] [role="dialog"]'
const CELESTE = 'rgb(232, 240, 254)'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Linea {
  readonly texto: string
  /** `true` bien, `false` falla, `null` informativa o no corrió. */
  readonly bien: boolean | null
}
const lineas: Linea[] = []
const anotar = (bien: boolean | null, rotulo: string, ancho: number, detalle: string): void => {
  const marca = bien === null ? 'info ' : bien ? 'ok   ' : 'FALLA'
  const texto = `${marca} ${String(ancho)} · ${rotulo} · ${detalle}`
  console.log(texto)
  lineas.push({ texto, bien })
}

interface Medida {
  readonly forma: string
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly ancho: number
  readonly alto: number
  readonly scrollH: number
  readonly clientH: number
  readonly filtro: string
}
const MEDIR = `(() => {
  const d = document.querySelector('${DIALOGO}')
  const raiz = document.querySelector('[data-pieza="contacto"]')
  const velo = document.querySelector('[data-pieza="contacto"] [data-parte="velo"]')
  if (!d || !raiz || !velo) return null
  const r = d.getBoundingClientRect()
  const c = getComputedStyle(velo)
  return { forma: raiz.getAttribute('data-forma') || '?', x: r.left, y: r.top, w: r.width, h: r.height, ancho: document.documentElement.clientWidth, alto: window.innerHeight, scrollH: d.scrollHeight, clientH: d.clientHeight, filtro: c.backdropFilter || c.webkitBackdropFilter || 'none' }
})()`
const medir = (p: Page): Promise<Medida | null> => p.evaluate(MEDIR) as Promise<Medida | null>

/** Muestrea cada cuadro la escala, la opacidad y el desplazamiento vertical de la hoja (`[t, escala, opacidad, ty]`) mientras exista. */
const MUESTREAR = `(() => {
  window.__muestras = []
  const t0 = performance.now()
  const paso = () => {
    const d = document.querySelector('${DIALOGO}')
    if (d) {
      const c = getComputedStyle(d)
      const m = new DOMMatrixReadOnly(c.transform === 'none' ? undefined : c.transform)
      window.__muestras.push([performance.now() - t0, m.a, Number(c.opacity), m.f])
    }
    window.__cuadro = requestAnimationFrame(paso)
  }
  paso()
})()`
type Muestra = readonly [number, number, number, number]
const muestras = (p: Page): Promise<Muestra[]> => p.evaluate('window.__muestras') as Promise<Muestra[]>
const marca = (p: Page): Promise<number> => p.evaluate('window.__muestras.length') as Promise<number>

async function abrir(p: Page): Promise<void> {
  await p.evaluate(MUESTREAR)
  await p.evaluate(`document.querySelector('[data-abre-contacto="panel"]').click()`)
  await p.locator(DIALOGO).waitFor({ state: 'attached', timeout: 10000 })
}

/** Espera a que la hoja quede quieta: la misma caja en dos lecturas seguidas y la escala en 1. */
async function asentada(p: Page): Promise<Medida | null> {
  let anterior = ''
  for (let i = 0; i < 60; i++) {
    await dormir(150)
    const m = await medir(p)
    if (m === null) continue
    const huella = `${m.x.toFixed(1)}|${m.y.toFixed(1)}|${m.w.toFixed(1)}|${m.h.toFixed(1)}`
    const ms = await muestras(p)
    const ultima = ms[ms.length - 1]
    if (huella === anterior && ultima !== undefined && ultima[1] > 0.999 && ultima[2] > 0.999) return m
    anterior = huella
  }
  return medir(p)
}

async function cerrar(p: Page): Promise<void> {
  await p.keyboard.press('Escape')
  await p.locator(DIALOGO).waitFor({ state: 'detached', timeout: 10000 })
  await dormir(300)
}

const en = (n: number, desde: number, hasta: number): boolean => n >= desde && n <= hasta
const pct = (n: number): string => `${(n * 100).toFixed(1)} %`

function tamano(ancho: number, m: Medida | null): void {
  if (m === null) return anotar(false, 'TAMAÑO', ancho, 'el diálogo no apareció')
  const fa = m.w / m.ancho
  const fh = m.h / m.alto
  const centrado = Math.abs(m.x + m.w / 2 - m.ancho / 2) <= 2 && Math.abs(m.y + m.h / 2 - m.alto / 2) <= 2
  const px = Number(/blur\(([\d.]+)px\)/.exec(m.filtro)?.[1] ?? '0')
  const desenfoque = px >= 20
  const detalle = `${m.forma} · ancho ${pct(fa)} · alto ${pct(fh)}${m.scrollH > m.clientH + 1 ? ' (con scroll por adentro)' : ''} · centrado ${centrado ? 'sí' : `NO (${(m.x + m.w / 2 - m.ancho / 2).toFixed(1)}, ${(m.y + m.h / 2 - m.alto / 2).toFixed(1)})`} · fondo ${m.filtro}`
  if (ancho >= ESCRITORIO) return anotar(m.forma === 'placa' && centrado && desenfoque, 'TAMAÑO (escritorio: la placa, el tamaño sólo se informa)', ancho, detalle)
  const altoBien = en(fh, 0.68, 0.72) || (fh > 0.72 && fh <= 0.905 && m.scrollH <= m.clientH + 1)
  anotar(m.forma === 'panel' && en(fa, 0.68, 0.72) && altoBien && centrado && desenfoque, 'TAMAÑO', ancho, detalle)
}

function llegada(ancho: number, entrada: readonly Muestra[], salida: readonly Muestra[]): void {
  if (ancho >= ESCRITORIO) return anotar(null, 'LLEGADA', ancho, 'escritorio: la placa 3D de siempre (no es el panel)')
  const minEscala = Math.min(...entrada.map((s) => s[1]))
  const finEscala = entrada.filter((s) => s[1] > 0.99).map((s) => s[0])[0]
  const sube = entrada.every((s, i) => i === 0 || s[1] >= (entrada[i - 1]?.[1] ?? 0) - 0.005)
  const sinDesplazarse = [...entrada, ...salida].every((s) => Math.abs(s[3]) < 2)
  const fundido = entrada[0] !== undefined && entrada[0][2] < 0.5 && (entrada[entrada.length - 1]?.[2] ?? 0) > 0.999
  const entra = minEscala < 0.3 && sube && finEscala !== undefined && en(finEscala, 700, 2400) && fundido && sinDesplazarse
  anotar(entra, 'LLEGADA (entra)', ancho, `escala de ${minEscala.toFixed(2)} a 1${finEscala === undefined ? ' (nunca llegó)' : ` en ${finEscala.toFixed(0)} ms`} · ${sube ? 'sin retroceder' : 'RETROCEDE'} · fundido ${fundido ? 'sí' : 'NO'} · ${sinDesplazarse ? 'sin desplazarse' : 'SE DESPLAZA'}`)
  const minSalida = Math.min(...salida.map((s) => s[1]))
  const baja = salida.every((s, i) => i === 0 || s[1] <= (salida[i - 1]?.[1] ?? 1) + 0.005)
  anotar(salida.length > 3 && minSalida < 0.5 && baja, 'LLEGADA (sale igual)', ancho, `escala hasta ${minSalida.toFixed(2)} · ${baja ? 'sin retroceder' : 'RETROCEDE'} · ${String(salida.length)} cuadros`)
}

/** Un envío del formulario: el estado se anota cada vez que cambia (`data-vista`). */
const OBSERVAR_VISTAS = `(() => {
  window.__vistas = []
  const el = document.querySelector('[data-pieza="estado-de-envio"]')
  if (!el) return
  window.__vistas.push([performance.now(), el.getAttribute('data-vista')])
  new MutationObserver(() => window.__vistas.push([performance.now(), el.getAttribute('data-vista')])).observe(el, { attributes: true, attributeFilter: ['data-vista'] })
})()`
const vistas = (p: Page): Promise<[number, string][]> => p.evaluate('window.__vistas') as Promise<[number, string][]>
const MENSAJE = `(() => {
  const m = document.querySelector('${DIALOGO} [data-parte="mensaje-del-envio"]')
  if (!m) return null
  const c = getComputedStyle(m)
  return { texto: m.textContent || '', opacidad: Number(c.opacity), visible: c.display !== 'none' && m.getClientRects().length > 0 }
})()`
const mensajeVisto = (p: Page): Promise<{ texto: string; opacidad: number; visible: boolean } | null> => p.evaluate(MENSAJE) as Promise<{ texto: string; opacidad: number; visible: boolean } | null>

async function esperarVista(p: Page, vista: string, ms: number): Promise<boolean> {
  const hasta = Date.now() + ms
  while (Date.now() < hasta) {
    if ((await p.locator(`${DIALOGO} [data-pieza="estado-de-envio"][data-vista="${vista}"]`).count()) > 0) return true
    await dormir(100)
  }
  return false
}

async function mensajeDe(p: Page, esperado: readonly string[]): Promise<{ bien: boolean; texto: string }> {
  const hasta = Date.now() + 5000
  let texto = ''
  while (Date.now() < hasta) {
    const m = await mensajeVisto(p)
    texto = m?.texto ?? ''
    if (m !== null && m.visible && m.opacidad > 0.9 && esperado.every((e) => m.texto.includes(e))) return { bien: true, texto }
    await dormir(150)
  }
  return { bien: false, texto }
}

async function envio(p: Page, ancho: number, servidor: { modo: 'ok' | 'error' }, pedidos: readonly unknown[]): Promise<void> {
  await abrir(p)
  await asentada(p)
  // El envío es con Enter en el campo del contacto (el envío implícito del formulario): el botón puede quedar bajo el pliegue del panel.
  const medio = p.locator(`${DIALOGO} input[name="medio"]`)
  // 1 · vacío: no manda nada, marca el campo y no pasa por la carga.
  await p.evaluate(OBSERVAR_VISTAS)
  await medio.press('Enter')
  await dormir(900)
  const marcados = await p.locator(`${DIALOGO} [aria-invalid="true"]`).count()
  const textoDelError = (await p.locator(`${DIALOGO} #contacto-error-medio`).textContent().catch(() => null)) ?? ''
  const vacio = (await vistas(p)).map((v) => v[1])
  anotar(pedidos.length === 0 && marcados >= 1 && textoDelError.includes('Un email o un teléfono.') && !vacio.includes('carga'), 'ENVÍO vacío', ancho, `${String(pedidos.length)} pedidos · ${String(marcados)} campo(s) marcado(s) · «${textoDelError}» · vistas ${vacio.join('>')}`)
  // 2 · con el servidor en error: carga (600 ms por lo menos), el error con su línea y el formulario de vuelta con lo escrito.
  servidor.modo = 'error'
  await medio.fill('ana@ejemplo.com')
  await p.evaluate(OBSERVAR_VISTAS)
  await medio.press('Enter')
  const cargo = await esperarVista(p, 'carga', 2000)
  const error = await esperarVista(p, 'error', 6000)
  const msgError = await mensajeDe(p, ['Algo falló', 'No se pudo enviar. Probá de nuevo en un rato o escribinos por WhatsApp.'])
  const volvio = await esperarVista(p, 'formulario', 8000)
  const escrito = await medio.inputValue()
  const abierta = (await p.locator(DIALOGO).count()) > 0
  const v = await vistas(p)
  const tCarga = v.find((x) => x[1] === 'carga')?.[0] ?? 0
  const tError = v.find((x) => x[1] === 'error')?.[0] ?? 0
  anotar(cargo && error && msgError.bien && volvio && escrito === 'ana@ejemplo.com' && abierta && pedidos.length === 1 && tError - tCarga >= 590, 'ENVÍO con error', ancho, `carga ${String(cargo)} (${(tError - tCarga).toFixed(0)} ms) · error ${String(error)} · mensaje ${msgError.bien ? 'ok' : `NO («${msgError.texto}»)`} · formulario de vuelta ${String(volvio)} con «${escrito}» · panel abierto ${String(abierta)} · ${String(pedidos.length)} pedido(s)`)
  // 3 · con el servidor bien: carga, éxito con su línea y el panel se cierra solo.
  servidor.modo = 'ok'
  await p.evaluate(OBSERVAR_VISTAS)
  await medio.press('Enter')
  const cargo2 = await esperarVista(p, 'carga', 2000)
  const exito = await esperarVista(p, 'exito', 6000)
  const msgExito = await mensajeDe(p, ['¡Recibido!', 'Ya lo estamos leyendo. Te contestamos pronto.'])
  const inicio = Date.now()
  const cerro = await p.locator(DIALOGO).waitFor({ state: 'detached', timeout: 9000 }).then(() => true, () => false)
  anotar(cargo2 && exito && msgExito.bien && cerro && pedidos.length === 2, 'ENVÍO con éxito', ancho, `carga ${String(cargo2)} · éxito ${String(exito)} · mensaje ${msgExito.bien ? 'ok' : `NO («${msgExito.texto}»)`} · el panel se cerró solo ${String(cerro)} (${String(Date.now() - inicio)} ms después del mensaje) · ${String(pedidos.length)} pedido(s)`)
  await dormir(500)
}

async function autocompletado(p: Page, cdp: CDPSession, ancho: number): Promise<void> {
  await abrir(p)
  await asentada(p)
  const CAMPOS = `(() => [...document.querySelectorAll('${DIALOGO} input:not([type="checkbox"])')].map((e) => {
    const c = getComputedStyle(e)
    return { id: e.getAttribute('name') || '', autofill: e.matches(':autofill'), fondo: c.backgroundColor, color: c.color, relleno: c.webkitTextFillColor }
  }))()`
  type Campo = { id: string; autofill: boolean; fondo: string; color: string; relleno: string }
  const antes = new Map(((await p.evaluate(CAMPOS)) as Campo[]).map((c) => [c.id, c]))
  let fallo: string | null = null
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 })
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `${DIALOGO} input[name="nombre"]` })
    const { node } = await cdp.send('DOM.describeNode', { nodeId })
    await cdp.send('Autofill.trigger', {
      fieldId: node.backendNodeId,
      address: { fields: [{ name: 'NAME_FULL', value: 'Ana Prueba' }, { name: 'EMAIL_ADDRESS', value: 'ana@ejemplo.com' }, { name: 'COMPANY_NAME', value: 'Prueba SA' }] },
    })
  } catch (e: unknown) {
    fallo = e instanceof Error ? e.message.split('\n')[0] ?? 'error' : String(e)
  }
  await dormir(900)
  const llenos = ((await p.evaluate(CAMPOS)) as Campo[]).filter((c) => c.autofill)
  if (fallo !== null || llenos.length < 2) anotar(null, 'AUTOCOMPLETADO', ancho, `NO CORRE · Chrome no autocompletó (${fallo ?? `${String(llenos.length)} campos`}): mirarlo a mano`)
  else {
    const numeros = (x: string): number[] => (x.match(/-?[\d.]+(e-?\d+)?/g) ?? []).map(Number)
    const igual = (x: string, y: string): boolean => x === y || (x.split('(')[0] === y.split('(')[0] && numeros(x).length === numeros(y).length && numeros(x).every((n, i) => Math.abs(n - (numeros(y)[i] ?? 0)) <= 0.01)) || ([x, y].every((z) => z === 'transparent' || numeros(z)[3] === 0))
    const mal = llenos.filter((c) => {
      const a = antes.get(c.id)
      return a === undefined || !igual(c.fondo, a.fondo) || c.color !== a.color || c.relleno !== a.relleno || c.fondo === CELESTE
    })
    anotar(mal.length === 0, 'AUTOCOMPLETADO', ancho, `${String(llenos.length)} campos autocompletados · ${llenos.map((c) => `${c.id}: fondo ${c.fondo}, texto ${c.relleno}`).join(' · ')}${mal.length > 0 ? ` · CAMBIARON: ${mal.map((c) => c.id).join(', ')}` : ''}`)
  }
  await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-autocompletado.png`) }).catch(() => undefined)
  await cerrar(p)
}

async function reducido(p: Page, ancho: number): Promise<void> {
  await p.emulateMedia({ reducedMotion: 'reduce' })
  await p.reload({ waitUntil: 'load', timeout: 300000 })
  await dormir(2500)
  await abrir(p)
  const m = await asentada(p)
  const entrada = await muestras(p)
  const k = await marca(p)
  await cerrar(p)
  const salida = (await muestras(p)).slice(k)
  // En escritorio es la hoja de arriba (su desplazamiento dura 0 s: el primer cuadro puede verla afuera); la escala no se mueve en ningún ancho.
  const sinEscala = [...entrada, ...salida].every((s) => s[1] > 0.999 && (ancho >= ESCRITORIO || Math.abs(s[3]) < 2))
  const fundido = entrada[0] !== undefined && entrada[0][2] < 1 && (entrada[entrada.length - 1]?.[2] ?? 0) > 0.999
  const rapido = (entrada.find((s) => s[2] > 0.999)?.[0] ?? 99999) < 900
  // La hoja de arriba de escritorio no cambio en esta tarea (sin fundido propio con movimiento reducido): ahi el fundido no se exige.
  anotar(m !== null && sinEscala && (fundido || ancho >= ESCRITORIO) && rapido && (ancho >= ESCRITORIO ? m.forma === 'hoja' : m.forma === 'panel'), 'MOVIMIENTO REDUCIDO', ancho, `${m?.forma ?? '?'} · sin escala ni desplazamiento ${String(sinEscala)} · fundido ${String(fundido)} · listo ${rapido ? 'rápido' : 'LENTO'}`)
  await p.emulateMedia({ reducedMotion: 'no-preference' })
}

async function porAncho(ancho: number): Promise<void> {
  const movil = ancho < ESCRITORIO
  const alto = ancho === 1024 ? 768 : ancho === 768 ? 1024 : movil ? 844 : 900
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/contacto-general-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx: BrowserContext = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    reducedMotion: 'no-preference',
    locale: 'es-AR',
    args: [`--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  try {
    await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    // NUNCA el API real: `/api/contacto` responde lo que pide cada paso y todo lo demás de `/api/` se corta.
    const servidor: { modo: 'ok' | 'error' } = { modo: 'error' }
    const pedidos: unknown[] = []
    await p.route('**/api/**', async (r) => {
      const pedido = r.request()
      if (pedido.method() === 'POST' && pedido.url().includes('/api/contacto')) {
        pedidos.push(JSON.parse(pedido.postData() ?? '{}'))
        if (servidor.modo === 'ok') await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
        else await r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false,"error":"prueba"}' })
      } else await r.abort()
    })
    await p.goto(`${BASE}/v3?preloader=no`, { waitUntil: 'load', timeout: 300000 })
    await p.waitForSelector('[data-v3]', { timeout: 120000 })
    await dormir(3500)
    if (CONTROL !== '') await p.addStyleTag({ content: CONTROLES[CONTROL] ?? '' })
    const visible = await p.evaluate('document.visibilityState === "visible" && innerWidth > 0')
    anotar(null, 'VENTANA', ancho, `visible: ${String(visible)} · ${String(ancho)}×${String(alto)}`)
    if (visible !== true) return anotar(null, 'TODO', ancho, 'NO CORRE · la pestaña está oculta (toda medición da cero): mirarlo con la ventana a la vista')
    // 1 · tamaño, llegada y salida.
    await abrir(p)
    const m = await asentada(p)
    const entrada = await muestras(p)
    tamano(ancho, m)
    await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-abierto.png`) }).catch(() => undefined)
    // `Page.captureScreenshot` congela los pasos de render (CLAUDE.md): se vuelve a medir el cuadro antes de seguir.
    await p.setViewportSize({ width: ancho, height: alto })
    const k = await marca(p)
    await cerrar(p)
    llegada(ancho, entrada, (await muestras(p)).slice(k))
    // 2 · el autocompletado y el envío.
    const cdp = await ctx.newCDPSession(p)
    await autocompletado(p, cdp, ancho)
    await envio(p, ancho, servidor, pedidos)
    // 3 · con movimiento reducido (último: recarga la página).
    await reducido(p, ancho)
  } finally {
    await ctx.close()
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const ancho of ANCHOS) await porAncho(ancho)
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.texto).join('\n'))
  const medidas = lineas.filter((l) => l.bien !== null)
  const fallas = medidas.filter((l) => l.bien === false).length
  console.log(`contacto-general: ${String(medidas.length - fallas)} de ${String(medidas.length)} dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR lo que dice arriba)`}`)
  if (CONTROL === '' ? fallas > 0 : fallas === 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
