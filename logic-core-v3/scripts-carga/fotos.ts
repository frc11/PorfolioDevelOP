/**
 * [F1–F5] FOTOS DEL SITIO, PARA MIRAR — una ruta a un ancho, una secuencia de acciones y una captura en cada `foto`. Contra el dev server,
 * con el Chrome del sistema a la vista (como `matriz.ts`) y `/api/` bloqueado. Escribe en `~/.cache/b4-medicion/fotos/`.
 *
 *   RUTA='/v3#quienes-somos' ANCHO=1440 ALTO=900 PASOS='rueda:500*5,espera:3500,foto:garage' npx tsx scripts-carga/fotos.ts
 *
 * Los pasos, separados por coma: `rueda:<px>[*<veces>]` (una muesca cada 50 ms), `espera:<ms>`, `foto:<nombre>`, `px:<px de la regla del
 * Portfolio>` (un salto del scroll nativo), `tap:<x>/<y>`, `tecla:<tecla>`, `mouse:<x>/<y>` y, con el dedo (`tactil.ts`), `dedo:<dy>` (el
 * scroll táctil) y `desliz:<dx>/<dy>` (un deslice desde el medio). `MOVIL=1`: táctil.
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

import { deslizar, desplazarConElDedo, tocar } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const RUTA = process.env.RUTA ?? '/v3'
const ANCHO = Number(process.env.ANCHO ?? '1440')
const ALTO = Number(process.env.ALTO ?? '900')
const MOVIL = process.env.MOVIL === '1'
/** `REDUCIDO=1`: con movimiento reducido. */
const REDUCIDO = process.env.REDUCIDO === '1'
const PASOS = (process.env.PASOS ?? 'foto:inicio').split(',').map((p) => p.trim()).filter((p) => p !== '')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/fotos')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/fotos-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    isMobile: MOVIL,
    hasTouch: MOVIL,
    reducedMotion: REDUCIDO ? 'reduce' : 'no-preference',
    args: ['--force_high_performance_gpu', `--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    const cdp = await ctx.newCDPSession(p)
    await cdp.send('Network.enable')
    await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
    const [camino = '/v3', hash = ''] = RUTA.split('#')
    const separador = camino.includes('?') ? '&' : '?'
    await p.goto(`${BASE}${camino ?? ''}${separador}diag=carga${hash === '' ? '' : `#${hash}`}`, { waitUntil: 'load', timeout: 240000 })
    const t0 = Date.now()
    while (Date.now() - t0 < 60000) {
      const lista = await p.evaluate(() => (window as unknown as { __v3diag?: { pulso: () => { escenaLista: boolean } } }).__v3diag?.pulso().escenaLista === true).catch(() => false)
      if (lista) break
      await dormir(250)
    }
    await dormir(3000)
    await p.mouse.move(ANCHO * 0.2, ALTO * 0.55)
    for (const paso of PASOS) {
      const [accion = '', valor = ''] = paso.split(':')
      if (accion === 'rueda') {
        const [px = '100', veces = '1'] = valor.split('*')
        for (let k = 0; k < Number(veces); k++) {
          await p.mouse.wheel(0, Number(px))
          await dormir(50)
        }
      } else if (accion === 'espera') await dormir(Number(valor))
      else if (accion === 'tecla') await p.keyboard.press(valor)
      else if (accion === 'mouse') {
        const [x = '0', y = '0'] = valor.split('/')
        await p.mouse.move(Number(x), Number(y), { steps: 4 })
      } else if (accion === 'tap') {
        const [x = '0', y = '0'] = valor.split('/')
        await tocar(cdp, Number(x), Number(y))
      } else if (accion === 'dedo') {
        // `dedo:<dy>`: el scroll táctil del navegador (con su inercia), desde el medio del cuadro.
        await desplazarConElDedo(cdp, ANCHO / 2, ALTO / 2, Number(valor))
      } else if (accion === 'desliz') {
        // `desliz:<dx>/<dy>`: un deslice del dedo desde el medio del cuadro (sobre las historias: cambia o sale).
        const [dx = '0', dy = '0'] = valor.split('/')
        await deslizar(cdp, ANCHO / 2, ALTO / 2, Number(dx), Number(dy))
      } else if (accion === 'px') {
        await p.evaluate((x) => {
          const panel = document.querySelector('[data-panel="trabajos"]')
          if (panel === null) return
          const tope = panel.getBoundingClientRect().top + scrollY
          window.scrollTo({ top: tope - innerHeight + (x * innerHeight) / 900, behavior: 'instant' })
        }, Number(valor))
      } else if (accion === 'pausa') {
        // `pausa:`: [F7] el botón de pausa del panel: si se ve (opacidad y caja), si recibe el mouse (lo de arriba en su centro), si tiene el
        // foco del teclado (`:focus-visible`) y su estado (`aria-pressed`); y si el video corre.
        console.log(JSON.stringify(await p.evaluate(() => {
          const b = [...document.querySelectorAll<HTMLElement>('[data-pieza="panel-del-portfolio"] [data-pieza="boton-pausa"]')].find((x) => x.getClientRects().length > 0) ?? null
          const v = [...document.querySelectorAll<HTMLVideoElement>('[data-video-del-portfolio]')].find((x) => x.getAttribute('src') !== null) ?? null
          if (b === null) return { existe: false, corre: v !== null && !v.paused }
          const r = b.getBoundingClientRect()
          const arriba = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          return { existe: true, seVe: Number(getComputedStyle(b).opacity) > 0.05 && r.width * r.height > 4, opacidad: Number(getComputedStyle(b).opacity), caja: [Math.round(r.width), Math.round(r.height)], recibeElMouse: arriba === b || b.contains(arriba), enfocado: document.activeElement === b, focoVisible: b.matches(':focus-visible'), apretado: b.getAttribute('aria-pressed'), corre: v !== null && !v.paused }
        })))
      } else if (accion === 'tab-a-la-pausa') {
        // `tab-a-la-pausa:`: el foco en lo anterior a la pausa (en el orden del Tab) y un Tab de verdad.
        await p.keyboard.press('Shift')
        await p.evaluate(() => {
          const b = [...document.querySelectorAll<HTMLElement>('[data-pieza="panel-del-portfolio"] [data-pieza="boton-pausa"]')].find((x) => x.getClientRects().length > 0)
          const lista = [...document.querySelectorAll<HTMLElement>('a[href], button, input, textarea, select, [tabindex]')].filter((e) => e.tabIndex >= 0 && e.getClientRects().length > 0 && !(e as HTMLButtonElement).disabled)
          const i = b === undefined ? -1 : lista.indexOf(b)
          if (i > 0) lista[i - 1]?.focus({ preventScroll: true })
        })
        await p.keyboard.press('Tab')
      } else if (accion === 'formulario') {
        // `formulario:`: [F6] si el formulario de «la tuya» está en perspectiva (la variante 3D: `data-forma="3d"` o un rotateY).
        console.log(JSON.stringify(await p.evaluate(() => {
          const campo = document.querySelector('[data-tira="la-tuya"] input, [data-tira="la-tuya"] textarea')
          let girado = false
          for (let e = campo?.parentElement ?? null; e !== null && e.getAttribute('data-tira') !== 'la-tuya'; e = e.parentElement) if (/matrix3d|rotate/.test(getComputedStyle(e).transform) || e.style.transform.includes('rotate')) girado = true
          return { variante3d: document.querySelector('[data-forma="3d"]') !== null, girado, hayCampo: campo !== null }
        })))
      } else if (accion === 'encima') {
        // `encima:`: qué hay arriba en el medio del cuadro, con y sin los pointer-events forzados (para la sonda de las historias).
        console.log(JSON.stringify(await p.evaluate(() => {
          const quien = (e: Element | null): string => { const v: string[] = []; for (let x = e; x !== null && v.length < 6; x = x.parentElement) v.push(`${x.tagName}${x.id === '' ? '' : `#${x.id}`}${x.getAttribute('data-pieza') === null ? '' : `[${x.getAttribute('data-pieza') ?? ''}]`}${x.getAttribute('data-capa') === null ? '' : `{${x.getAttribute('data-capa') ?? ''}}`}.${(typeof x.className === 'string' ? x.className : '').slice(0, 40)}`); return v.join(' < ') }
          const sin = quien(document.elementFromPoint(innerWidth / 2, innerHeight / 2))
          const st = document.createElement('style')
          st.textContent = '* { pointer-events: auto !important; }'
          document.head.appendChild(st)
          const con = quien(document.elementFromPoint(innerWidth / 2, innerHeight / 2))
          st.remove()
          return { sin, con }
        })))
      } else if (accion === 'titulo') {
        // `titulo:`: cómo está el encabezado del Portfolio (la subida, el titular y sus recortes), para diagnosticar.
        console.log(JSON.stringify(await p.evaluate(() => {
          const sub = document.querySelector('[data-parte="subida-del-encabezado"]')
          const h2 = document.querySelector('[data-pieza="encabezado-del-portfolio"] h2')
          const cadena: { tag: string; transform: string; opacity: string; overflow: string; clip: string }[] = []
          for (let e: Element | null = h2; e !== null && e !== sub?.parentElement; e = e.parentElement) {
            const c = getComputedStyle(e)
            cadena.push({ tag: `${e.tagName}${e.getAttribute('data-pieza') ?? e.getAttribute('data-parte') ?? ''}`, transform: c.transform, opacity: c.opacity, overflow: c.overflow, clip: c.clipPath })
          }
          const r = h2?.getBoundingClientRect()
          return { h2: r === undefined ? null : [Math.round(r.top), Math.round(r.bottom)], cadena }
        })))
      } else if (accion === 'foto') {
        const archivo = path.join(SALIDA, `${valor}-${String(ANCHO)}.png`)
        await p.screenshot({ path: archivo })
        const estado = await p.evaluate(() => {
          const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
          const h = document.querySelector('[data-pieza="historias"]')
          return `paso ${e?.getAttribute('data-paso') ?? '?'} · panel ${e?.getAttribute('data-panel-adentro') ?? '?'} · encabezado ${e?.getAttribute('data-encabezado') ?? '?'} · barra ${e?.getAttribute('data-barra') ?? '?'} · historia ${h?.getAttribute('data-indice') ?? '-'} · y ${String(Math.round(scrollY))}`
        })
        console.log(`${archivo} · ${estado}`)
      }
    }
  } finally {
    await ctx.close()
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
