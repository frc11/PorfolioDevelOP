/**
 * [C2 · 20] EL AUTOCOMPLETADO EN /v3 — el banco del arreglo global (`piezas.css`, bloque 1) en la página de prueba (`/v3/piezas`), con
 * el Chrome del sistema a la vista, contra el dev o el build (`BASE`). `/api/` cortado.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,390 npx tsx scripts-carga/autocompletado.ts
 *
 * El autocompletado lo hace Chrome de verdad, por CDP (`Autofill.trigger` con una dirección de prueba que no se guarda: el mismo camino
 * del recibo `pulido-13/k4-autocompletado.json`), en cuatro formularios: `auto-papel` y `auto-invertida` (dos píldoras y un campo con
 * fondo propio) y los dos del envío (`envio-papel`, `envio-invertida`). El criterio, por campo que quedó `:autofill`: su fondo, su color
 * y el color del texto (`-webkit-text-fill-color`) son los MISMOS que antes de autocompletar (nunca el celeste del navegador,
 * `rgb(232, 240, 254)`, ni su texto negro sobre el formulario oscuro); y por formulario, por lo menos dos campos autocompletados (si
 * no, «NO CORRE»: Chrome no llenó y no hay nada que medir).
 *
 *   CONTROL=sin-arreglo … una hoja inyectada apaga el arreglo (la transición y la tinta): tiene que dar FALLA en los cuatro.
 *
 * Resultados y capturas en ~/.cache/b4-medicion/autocompletado.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'sin-arreglo'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: sin-arreglo`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('autocompletado')
const RUTA = '/v3/piezas?preloader=no'
const FORMULARIOS = ['auto-papel', 'auto-invertida', 'envio-papel', 'envio-invertida'] as const
const CELESTE = 'rgb(232, 240, 254)'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** La dirección de prueba (no se guarda): los nombres de campo de Chrome (`components/autofill/core/browser/field_types.cc`). */
const DIRECCION = {
  fields: [
    { name: 'NAME_FULL', value: 'Ana Prueba' },
    { name: 'NAME_FIRST', value: 'Ana' },
    { name: 'NAME_LAST', value: 'Prueba' },
    { name: 'EMAIL_ADDRESS', value: 'ana@ejemplo.com' },
    { name: 'PHONE_HOME_WHOLE_NUMBER', value: '3815550000' },
  ],
}

interface Campo {
  readonly id: string
  readonly autofill: boolean
  readonly valor: string
  readonly fondo: string
  readonly color: string
  readonly relleno: string
}

const CAMPOS = (form: string): string => `(() => [...document.querySelectorAll('[data-demo="${form}"] input')].map((e) => {
  const c = getComputedStyle(e)
  return { id: e.id, autofill: e.matches(':autofill'), valor: e.value, fondo: c.backgroundColor, color: c.color, relleno: c.webkitTextFillColor }
}))()`
const campos = (p: Page, form: string): Promise<Campo[]> => p.evaluate(CAMPOS(form)) as Promise<Campo[]>

async function autocompletar(cdp: CDPSession, selector: string): Promise<string | null> {
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 })
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector })
    if (nodeId === 0) return `sin ${selector}`
    const { node } = await cdp.send('DOM.describeNode', { nodeId })
    await cdp.send('Autofill.trigger', { fieldId: node.backendNodeId, address: DIRECCION })
    return null
  } catch (e: unknown) {
    return e instanceof Error ? e.message.split('\n')[0] : String(e)
  }
}

async function formulario(p: Page, cdp: CDPSession, ancho: number, form: string): Promise<{ readonly linea: string; readonly bien: boolean | null }> {
  await p.locator(`[data-demo="${form}"]`).scrollIntoViewIfNeeded()
  await dormir(300)
  const antes = new Map((await campos(p, form)).map((c) => [c.id, c]))
  const fallo = await autocompletar(cdp, `#${form}-nombre`)
  await dormir(800)
  const despues = await campos(p, form)
  const llenos = despues.filter((c) => c.autofill)
  if (fallo !== null || llenos.length < 2) return { linea: `NO CORRE ${String(ancho)} · ${form} · Chrome no autocompletó (${fallo ?? `${String(llenos.length)} campos`}): mirarlo a mano`, bien: null }
  // Dos fondos transparentes (alfa 0) son el mismo fondo aunque el navegador deje su celeste con alfa 0 debajo; y la transición larga
  // del arreglo mueve el alfa en el quinto decimal (0,1 → 0,100003): se comparan los números con tolerancia, no el texto.
  const numeros = (x: string): number[] => (x.match(/-?[\d.]+(e-?\d+)?/g) ?? []).map(Number)
  const transparente = (x: string): boolean => x === 'transparent' || (x.startsWith('rgba') && numeros(x)[3] === 0)
  const parecidos = (x: string, y: string): boolean => {
    const a = numeros(x)
    const b = numeros(y)
    return x.split('(')[0] === y.split('(')[0] && a.length === b.length && a.every((n, i) => Math.abs(n - b[i]) <= 0.01)
  }
  const mismoFondo = (x: string, y: string): boolean => x === y || (transparente(x) && transparente(y)) || parecidos(x, y)
  const mal = llenos.filter((c) => {
    const a = antes.get(c.id)
    return a === undefined || !mismoFondo(c.fondo, a.fondo) || c.color !== a.color || c.relleno !== a.relleno || c.fondo === CELESTE
  })
  const bien = mal.length === 0
  const detalle = llenos.map((c) => `${c.id.replace(`${form}-`, '')}: fondo ${c.fondo}${antes.get(c.id)?.fondo === c.fondo ? '' : ` (antes ${antes.get(c.id)?.fondo ?? '—'})`}, texto ${c.relleno}${antes.get(c.id)?.relleno === c.relleno ? '' : ` (antes ${antes.get(c.id)?.relleno ?? '—'})`}`).join(' · ')
  return { linea: `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${form} · ${String(llenos.length)} autocompletados · ${detalle}`, bien }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean | null }[] = []
  for (const ancho of ANCHOS) {
    const movil = ancho < 1024
    const alto = movil ? 844 : 900
    const perfil = perfilDelBanco('autocompletado')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: movil,
      hasTouch: movil,
      args: [`--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}${RUTA}`, { waitUntil: 'load', timeout: 300000 })
      if (CONTROL === 'sin-arreglo') await p.addStyleTag({ content: '[data-v3] input:autofill { transition: none !important; -webkit-text-fill-color: initial !important; }' })
      await dormir(2000)
      console.log(`·     ${String(ancho)} · ${RUTA} · visible: ${String(await p.evaluate('document.visibilityState === "visible" && innerWidth > 0'))}`)
      const cdp = await ctx.newCDPSession(p)
      for (const form of FORMULARIOS) {
        const r = await formulario(p, cdp, ancho, form)
        console.log(r.linea)
        lineas.push(r)
      }
      await p.locator('[data-demo="auto-papel"]').scrollIntoViewIfNeeded()
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-autocompletado.png`) }).catch(() => undefined)
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  const corridas = lineas.filter((l) => l.bien !== null)
  console.log(`autocompletado: ${String(corridas.filter((l) => l.bien === true).length)} de ${String(corridas.length)} dentro del criterio (${String(lineas.length - corridas.length)} no corrieron)${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tienen que FALLAR todas)`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
