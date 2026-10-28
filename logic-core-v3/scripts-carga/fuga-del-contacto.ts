/**
 * [P-H30] LA FUGA DEL CONTACTO — abre y cierra el contacto N veces seguidas (el CTA del hero, con Enter y Esc), con el Chrome del sistema
 * a la vista, contra el dev y con `/api/` bloqueado (nunca envía el formulario). Después de cada cierre, con dos recolecciones de basura
 * forzadas, mide los nodos del DOM, los oyentes, el heap de JS y la memoria del lienzo (geometrías y texturas, del banco de la escena).
 * Las mediciones de anoche (sin recolectar) daban ~166 nodos más por apertura y la página caída a las ~21 a 390.
 *
 * El criterio (P-H30): 50 aperturas seguidas a 390 y a 1440, los nodos estables (±5 % entre la apertura 5 y la última, recolectado) y la
 * página sin caerse. Con `DETALLE=1`, los nodos sueltos (fuera del documento y todavía vivos), agrupados por la pieza de su raíz.
 *
 *   ANCHO=390|1440 VUELTAS=50 npx tsx scripts-carga/fuga-del-contacto.ts
 *   CONTROL=handles …    el control positivo: la espera de la sonda de anoche (`waitForSelector`, que devuelve un ElementHandle del
 *                        diálogo y la sesión lo retiene): retiene un contacto por apertura y tiene que fallar
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHO = Number(process.env.ANCHO ?? '390')
const VUELTAS = Number(process.env.VUELTAS ?? '50')
const DETALLE = process.env.DETALLE === '1'
const CONTROL = process.env.CONTROL === 'handles'
const MOVIL = ANCHO < 1024
const ALTO = ANCHO === 390 ? 844 : ANCHO === 1024 ? 768 : 900
const DIALOGO = '[data-pieza="contacto"] [role="dialog"]'
const DISPARADOR = 'a[data-pieza="cta"][data-abre-contacto="panel"]'
const TOLERANCIA = 0.05
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Medida {
  readonly vuelta: number
  readonly nodos: number
  readonly oyentes: number
  readonly heapMb: number
  readonly lienzo: string
}

async function medir(cdp: CDPSession, p: Page, vuelta: number): Promise<Medida> {
  await cdp.send('HeapProfiler.collectGarbage')
  await cdp.send('HeapProfiler.collectGarbage')
  const c = (await cdp.send('Memory.getDOMCounters')) as { readonly nodes: number; readonly jsEventListeners: number }
  const { usedSize } = (await cdp.send('Runtime.getHeapUsage')) as { readonly usedSize: number }
  const lienzo = await p.evaluate(() => {
    const f = (window as unknown as { __ranuraDelBanco?: () => { geometrias: number; texturas: number } }).__ranuraDelBanco
    const m = f?.()
    return m === undefined ? '?' : `${String(m.geometrias)}/${String(m.texturas)}`
  })
  return { vuelta, nodos: c.nodes, oyentes: c.jsEventListeners, heapMb: usedSize / 1048576, lienzo }
}

/** Los nodos sueltos (fuera del documento y vivos después de recolectar), agrupados por la pieza de su raíz suelta. */
async function sueltos(cdp: CDPSession): Promise<string> {
  await cdp.send('HeapProfiler.collectGarbage')
  const proto = (await cdp.send('Runtime.evaluate', { expression: 'Node.prototype' })) as { readonly result: { readonly objectId?: string } }
  if (proto.result.objectId === undefined) return '?'
  const { objects } = (await cdp.send('Runtime.queryObjects', { prototypeObjectId: proto.result.objectId })) as { readonly objects: { readonly objectId?: string } }
  if (objects.objectId === undefined) return '?'
  const r = (await cdp.send('Runtime.callFunctionOn', {
    objectId: objects.objectId,
    returnByValue: true,
    functionDeclaration: `function () {
      const cuenta = {}
      for (const n of this) {
        // Vienen también los prototipos (HTMLElement.prototype…): leerles una propiedad tira.
        try { if (n.isConnected || n.nodeType === 9 || n.nodeType === 11) continue } catch (e) { continue }
        let raiz = n
        while (raiz.parentNode !== null && raiz.parentNode.nodeType !== 11) raiz = raiz.parentNode
        const el = raiz.nodeType === 1 ? raiz : null
        const nombre = el === null ? '#' + raiz.nodeName : el.tagName.toLowerCase() + (el.getAttribute('data-pieza') ? '[pieza=' + el.getAttribute('data-pieza') + ']' : '') + (el.getAttribute('data-parte') ? '[parte=' + el.getAttribute('data-parte') + ']' : '') + (el.id ? '#' + el.id : '')
        cuenta[nombre] = (cuenta[nombre] || 0) + 1
      }
      return Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => v + ' ' + k).join(' · ')
    }`,
  })) as { readonly result: { readonly value?: string } }
  await cdp.send('Runtime.releaseObjectGroup', { objectGroup: '' }).catch(() => undefined)
  return r.result.value ?? '?'
}

async function main(): Promise<void> {
  const perfil = perfilDelBanco('fuga')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    isMobile: MOVIL,
    hasTouch: MOVIL,
    // Sin las animaciones de Windows (TeamViewer las apaga) el Chrome pide movimiento reducido: se mide el sitio con movimiento.
    reducedMotion: 'no-preference',
    locale: 'es-AR',
    args: ['--force_high_performance_gpu', `--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  // El banco de la escena (publica la memoria del lienzo) y la intro ya vista; el defecto, si se pide.
  await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  let caida = false
  p.on('crash', () => {
    caida = true
  })
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
  await p.waitForSelector('[data-v3]', { timeout: 120000 })
  await dormir(5000)
  const boton = p.locator(DISPARADOR).first()
  await boton.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await dormir(2000)
  const medidas: Medida[] = []
  let noAbrio = 0
  for (let v = 1; v <= VUELTAS && !caida; v++) {
    try {
      await boton.focus()
      await p.keyboard.press('Enter')
      // Con `locator.waitFor` y no `waitForSelector`: éste devuelve un ElementHandle del diálogo que la sesión del protocolo retiene hasta
      // liberarlo (la sonda de anoche medía su propia fuga: el diálogo retenido por «DevTools console», visto en una foto del heap).
      const esperar = CONTROL ? p.waitForSelector(DIALOGO, { state: 'attached', timeout: 10000 }) : p.locator(DIALOGO).waitFor({ state: 'attached', timeout: 10000 })
      const abrio = await esperar.then(
        () => true,
        () => false,
      )
      if (!abrio) {
        noAbrio += 1
        continue
      }
      await dormir(1600)
      await p.keyboard.press('Escape')
      await p.locator(DIALOGO).waitFor({ state: 'detached', timeout: 10000 })
      await dormir(900)
      if (v === 1 || v % 5 === 0 || v === VUELTAS) {
        const m = await medir(cdp, p, v)
        medidas.push(m)
        console.log(`  ${String(ANCHO)} · vuelta ${String(v)}: nodos ${String(m.nodos)} · oyentes ${String(m.oyentes)} · heap ${m.heapMb.toFixed(1)} MB · lienzo ${m.lienzo}`)
        if (DETALLE && (v === 5 || v === VUELTAS)) console.log(`    sueltos: ${await sueltos(cdp)}`)
      }
    } catch (e) {
      if (caida) break
      throw e
    }
  }
  const base = medidas.find((m) => m.vuelta === 5) ?? medidas[0]
  const ultima = medidas[medidas.length - 1]
  const crece = base === undefined || ultima === undefined ? Number.NaN : (ultima.nodos - base.nodos) / base.nodos
  const bien = !caida && noAbrio === 0 && Number.isFinite(crece) && Math.abs(crece) <= TOLERANCIA && ultima?.vuelta === VUELTAS
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${String(ANCHO)}${CONTROL ? ' [control: la espera con handles]' : ''} · ${String(ultima?.vuelta ?? 0)} de ${String(VUELTAS)} aperturas${caida ? ' · LA PÁGINA SE CAYÓ' : ''}${noAbrio > 0 ? ` · ${String(noAbrio)} no abrieron` : ''} · nodos ${String(base?.nodos ?? '?')} → ${String(ultima?.nodos ?? '?')} (${Number.isFinite(crece) ? `${(crece * 100).toFixed(1)} %` : '?'}; criterio ±${String(TOLERANCIA * 100)} %)`)
  await ctx.close().catch(() => undefined)
  if (!bien) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
