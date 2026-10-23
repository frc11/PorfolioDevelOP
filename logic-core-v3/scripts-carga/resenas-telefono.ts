/**
 * [C2-70t] EL CARRUSEL DE LAS RESEÑAS EN EL TELÉFONO Y LA TABLET — el Chrome del sistema a la vista contra el dev (`BASE`), táctil
 * (`isMobile`, `hasTouch`), `/api/` bloqueado. Por ancho (390 × 844 y 768 × 1024):
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/resenas-telefono.ts
 *   ANCHOS=390x844 …                       (uno solo)
 *   CONTROL=quieto …                       (la deriva apagada: el `scrollTo` de las listas no hace nada) → tiene que FALLAR «deriva»
 *   CONTROL=con-flechas …                  (inyecta un botón de flecha en el bloque) → tiene que FALLAR «sin flechas»
 *
 * Baja hasta la lista (`[data-pieza="resenas-en-lista"]`, la pista en el 45 % del cuadro) y mide:
 *   · AVISO: con el carrusel en pantalla, «Deslizá para ver más» a la vista (`data-estado="visible"`, opacidad ≥ 0,9);
 *   · SIN FLECHAS: ningún botón ni chevrón de flecha en el bloque;
 *   · DERIVA: 4 s de `scrollLeft` por cuadro (desenvuelto en el bucle): se mueve solo, despacio (10–60 px/s) y parejo (ningún cuadro corre
 *     más de 4 px ni para atrás; cada ventana de 250 ms entre 0,4 y 1,6 veces la media);
 *   · TARJETAS: las que se ven, con opacidad 1 (ellas y sus caras, y el producto de sus ancestros hasta el bloque) y su retrato cargado
 *     (`naturalWidth > 0` y pedido por la página); «Ver trabajo» es un enlace (`<a>`) a `#portfolio-…`, del dedo y del puntero (fuera del
 *     teclado y del lector: la parada de cada reseña es la del lector);
 *   · EL DEDO: un deslice (de 80 % a 20 % del ancho, 250 ms) la mueve ≥ 80 px; después queda quieta y la deriva sigue DESDE AHÍ (nunca
 *     para atrás, sin volver al camino de antes; al final, más adelante que donde la dejó el dedo);
 *   · EL AVISO SE VA: después del deslice, `data-estado="ido"` y opacidad < 0,05;
 *   · EL TECLADO: el enlace del lector de la primera reseña toma el foco visible y aparece en el cuadro (la pastilla);
 *   · FUERA DE PANTALLA: con la pista fuera del cuadro, la deriva no corre (2 s sin moverse).
 * Imprime además el alto del bloque (la REGLA DE ALTURAS: el bloque se anota como tramo) y saca una foto al final en
 * `~/.cache/b4-medicion/resenas-telefono/<ancho>.png` (las fotos van al final: una captura congela los pasos de render).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

import { deslizar } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '390x844,768x1024').split(',').map((a) => a.split('x').map(Number) as [number, number])
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'quieto', 'con-flechas'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: quieto | con-flechas`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/resenas-telefono')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const BLOQUE = '[data-pieza="resenas-en-lista"]'
const PISTA = `${BLOQUE} [data-parte="pista"]`
const AVISO = `${BLOQUE} [data-parte="aviso-del-carrusel"]`

/** CONTROL=quieto: el `scrollTo` de las listas no hace nada (la deriva escribe la pista con él; el dedo no lo usa). */
const SIN_DERIVA = `(() => { HTMLUListElement.prototype.scrollTo = function () {} })()`

type Muestra = readonly [number, number]
interface Criterio {
  readonly nombre: string
  readonly bien: boolean
  readonly detalle: string
}

/** La serie de `scrollLeft` por cuadro durante `ms` (en la página), con el ancho de una copia para desenvolver el bucle. */
async function grabar(p: Page, ms: number, alEmpezar?: () => Promise<void>): Promise<{ muestras: Muestra[]; copia: number }> {
  await p.evaluate(
    ({ sel, ms }) => {
      const w = window as unknown as { __muestrasDeLaPista?: [number, number][]; __listasDeLaPista?: boolean }
      const ul = document.querySelector(sel)
      w.__muestrasDeLaPista = []
      w.__listasDeLaPista = false
      if (!(ul instanceof HTMLElement)) return
      const t0 = performance.now()
      const cuadro = (t: number): void => {
        w.__muestrasDeLaPista?.push([t - t0, ul.scrollLeft])
        if (t - t0 < ms) requestAnimationFrame(cuadro)
        else w.__listasDeLaPista = true
      }
      requestAnimationFrame(cuadro)
    },
    { sel: PISTA, ms },
  )
  if (alEmpezar !== undefined) await alEmpezar()
  const t0 = Date.now()
  while (Date.now() - t0 < ms + 5000 && !(await p.evaluate(() => (window as unknown as { __listasDeLaPista?: boolean }).__listasDeLaPista === true))) await dormir(200)
  return p.evaluate((sel) => {
    const ul = document.querySelector(sel)
    const primera = ul?.firstElementChild
    const copia = ul?.querySelector('[data-copia]')
    return {
      muestras: (window as unknown as { __muestrasDeLaPista?: [number, number][] }).__muestrasDeLaPista ?? [],
      copia: primera instanceof HTMLElement && copia instanceof HTMLElement ? copia.offsetLeft - primera.offsetLeft : 0,
    }
  }, PISTA)
}

/** Desenvuelve el bucle: un salto para atrás de más de media copia es la vuelta, no un retroceso. */
function desenvolver(muestras: readonly Muestra[], copia: number): Muestra[] {
  let suma = 0
  return muestras.map(([t, x], i) => {
    if (i > 0 && copia > 0 && x - muestras[i - 1][1] < -copia / 2) suma += copia
    return [t, x + suma] as const
  })
}

function deriva(muestras: readonly Muestra[]): Criterio {
  if (muestras.length < 30) return { nombre: 'deriva', bien: false, detalle: `${String(muestras.length)} muestras` }
  const dur = (muestras[muestras.length - 1][0] - muestras[0][0]) / 1000
  const media = (muestras[muestras.length - 1][1] - muestras[0][1]) / dur
  const pasos = muestras.slice(1).map(([, x], i) => x - muestras[i][1])
  const maximo = Math.max(...pasos)
  const minimo = Math.min(...pasos)
  const ventanas: number[] = []
  for (let a = muestras[0][0]; a + 250 <= muestras[muestras.length - 1][0]; a += 250) {
    const i = muestras.findIndex(([t]) => t >= a)
    const j = muestras.findIndex(([t]) => t >= a + 250)
    if (i >= 0 && j > i) ventanas.push((muestras[j][1] - muestras[i][1]) / ((muestras[j][0] - muestras[i][0]) / 1000))
  }
  const parejo = ventanas.every((v) => v >= media * 0.4 && v <= media * 1.6)
  const bien = media >= 10 && media <= 60 && maximo <= 4 && minimo >= -0.5 && parejo
  return { nombre: 'deriva', bien, detalle: `media ${media.toFixed(1)} px/s, paso máx ${maximo.toFixed(2)} px, mín ${minimo.toFixed(2)} px, ventanas de 250 ms ${ventanas.map((v) => v.toFixed(0)).join('/')}` }
}

async function llevarALaPista(p: Page): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await p.evaluate((sel) => {
      const ul = document.querySelector(sel)
      if (ul === null) return
      const r = ul.getBoundingClientRect()
      window.scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight * 0.45, behavior: 'instant' })
    }, PISTA)
    await dormir(1500)
  }
}

async function medir(p: Page, cdp: CDPSession, ancho: number, alto: number): Promise<Criterio[]> {
  const criterios: Criterio[] = []
  const t0 = Date.now()
  while (Date.now() - t0 < 60000 && !(await p.evaluate((s) => document.querySelector(s) !== null, PISTA).catch(() => false))) await dormir(250)
  await dormir(5000)
  const entorno = await p.evaluate(() => ({ visible: document.visibilityState, ancho: innerWidth }))
  console.log(`·     ${String(ancho)}x${String(alto)} · pestaña ${entorno.visible}, innerWidth ${String(entorno.ancho)}`)
  if (entorno.visible !== 'visible' || entorno.ancho <= 0) return [{ nombre: 'entorno', bien: false, detalle: 'la pestaña no está visible: ninguna medición vale' }]
  await llevarALaPista(p)
  await dormir(1500)

  // El aviso, con el carrusel en pantalla.
  const aviso = await p.evaluate((s) => {
    const a = document.querySelector(s)
    return a === null ? null : { estado: a.getAttribute('data-estado'), opacidad: Number(getComputedStyle(a).opacity), texto: a.textContent?.trim() ?? '' }
  }, AVISO)
  criterios.push({ nombre: 'aviso a la vista', bien: aviso !== null && aviso.estado === 'visible' && aviso.opacidad >= 0.9 && aviso.texto === 'Deslizá para ver más', detalle: JSON.stringify(aviso) })

  // Sin flechas (CONTROL=con-flechas inyecta una).
  if (CONTROL === 'con-flechas') {
    await p.evaluate((s) => {
      const b = document.querySelector(s)
      b?.insertAdjacentHTML('beforeend', '<button type="button" aria-label="Reseña siguiente"><svg class="lucide lucide-chevron-right" viewBox="0 0 24 24"></svg></button>')
    }, BLOQUE)
  }
  const flechas = await p.evaluate((s) => {
    const b = document.querySelector(s)
    if (b === null) return -1
    return b.querySelectorAll('button, svg.lucide-chevron-left, svg.lucide-chevron-right, [aria-label*="anterior" i], [aria-label*="siguiente" i]').length
  }, BLOQUE)
  criterios.push({ nombre: 'sin flechas', bien: flechas === 0, detalle: `${String(flechas)} botones o chevrones de flecha` })

  // La deriva sola.
  const quieta = await grabar(p, 4000)
  const serie = desenvolver(quieta.muestras, quieta.copia)
  criterios.push(deriva(serie))

  // Las tarjetas que se ven: opacas, con su retrato, y su botón.
  const tarjetas = await p.evaluate(
    async ({ bloque, pista }) => {
      const b = document.querySelector(bloque)
      const ul = document.querySelector(pista)
      if (b === null || ul === null) return []
      const vistas = [...ul.querySelectorAll('[data-pieza="resena-en-lista"]')].filter((li) => {
        const r = li.getBoundingClientRect()
        return r.right > 1 && r.left < innerWidth - 1 && r.bottom > 0 && r.top < innerHeight
      })
      const out = []
      for (const li of vistas) {
        let efectiva = 1
        for (let e: Element | null = li; e !== null && e !== b.parentElement; e = e.parentElement) efectiva *= Number(getComputedStyle(e).opacity)
        const cara = li.querySelector('span[style*="background-image"]')
        const propias = [...li.querySelectorAll('*')].every((e) => Number(getComputedStyle(e).opacity) === 1 || e.closest('[data-pieza="cta"]') !== null)
        const url = cara === null ? '' : (/url\("?([^")]+)"?\)/.exec(getComputedStyle(cara).backgroundImage)?.[1] ?? '')
        let ancho = 0
        if (url !== '') {
          const img = new Image()
          img.src = url
          await img.decode().catch(() => undefined)
          ancho = img.naturalWidth
        }
        const pedida = url !== '' && performance.getEntriesByName(url).length > 0
        const a = li.querySelector('a[data-pieza="cta"]')
        const copia = li.hasAttribute('data-copia')
        out.push({
          copia,
          efectiva: Math.round(efectiva * 1000) / 1000,
          propias,
          foto: url.split('/').pop() ?? '',
          naturalWidth: ancho,
          pedida,
          enlace: a === null ? null : { etiqueta: a.tagName, href: a.getAttribute('href'), tab: (a as HTMLElement).tabIndex, escondido: a.closest('[aria-hidden="true"]') !== null },
        })
      }
      return out
    },
    { bloque: BLOQUE, pista: PISTA },
  )
  const tarjetasBien = tarjetas.length > 0 && tarjetas.every((t) => t.efectiva === 1 && t.propias && t.naturalWidth > 0 && t.pedida)
  criterios.push({ nombre: 'tarjetas opacas con su foto', bien: tarjetasBien, detalle: tarjetas.map((t) => `${t.foto}${t.copia ? '(copia)' : ''} op ${String(t.efectiva)}${t.propias ? '' : ' (adentro < 1)'} foto ${String(t.naturalWidth)}px${t.pedida ? '' : ' (no pedida)'}`).join(' · ') })
  const botonesBien = tarjetas.length > 0 && tarjetas.every((t) => t.enlace !== null && t.enlace.etiqueta === 'A' && /^#portfolio-[a-z-]+$/.test(t.enlace.href ?? '') && t.enlace.tab === -1 && t.enlace.escondido)
  criterios.push({ nombre: '«Ver trabajo» enlace al Portfolio', bien: botonesBien, detalle: JSON.stringify(tarjetas.map((t) => t.enlace)) })

  // El dedo: un deslice sobre la tarjeta, y la deriva después.
  const caja = await p.evaluate((s) => {
    const r = document.querySelector(s)?.getBoundingClientRect()
    return r === undefined ? null : { y: r.top + r.height * 0.35, w: innerWidth }
  }, PISTA)
  if (caja === null) return [...criterios, { nombre: 'dedo', bien: false, detalle: 'sin pista' }]
  const conDedo = await grabar(p, 7500, async () => {
    await dormir(600)
    await deslizar(cdp, caja.w * 0.8, caja.y, -caja.w * 0.6, 0, 250)
  })
  const s = desenvolver(conDedo.muestras, conDedo.copia)
  // El tiempo del deslice en la serie: la primera muestra que corre más de 3 px en un cuadro (el dedo).
  const iDedo = s.findIndex(([, x], i) => i > 0 && x - s[i - 1][1] > 3)
  const antes = iDedo > 0 ? s[iDedo - 1][1] : Number.NaN
  const tDedo = iDedo > 0 ? s[iDedo][0] : Number.NaN
  const despues = s.filter(([t]) => t > tDedo)
  const maximoTrasElDedo = Math.max(...despues.filter(([t]) => t < tDedo + 1500).map(([, x]) => x))
  // Donde la dejó el dedo: la primera vez que queda 500 ms sin moverse más de 1 px.
  let iQuieta = -1
  for (let i = 0; i < despues.length && iQuieta < 0; i++) {
    const tramo = despues.filter(([t]) => t >= despues[i][0] && t <= despues[i][0] + 500)
    if (tramo.length > 10 && Math.max(...tramo.map(([, x]) => x)) - Math.min(...tramo.map(([, x]) => x)) <= 1) iQuieta = i
  }
  const dejada = iQuieta >= 0 ? despues[iQuieta][1] : Number.NaN
  const tras = iQuieta >= 0 ? despues.slice(iQuieta) : []
  const sinRetroceso = tras.slice(1).every(([, x], i) => x - tras[i][1] >= -0.5)
  const final = s.length > 0 ? s[s.length - 1][1] : Number.NaN
  const mueve = maximoTrasElDedo - antes >= 80
  const sigueDesdeAhi = iQuieta >= 0 && sinRetroceso && final > dejada + 10 && final - dejada < 60 * ((s[s.length - 1][0] - despues[iQuieta][0]) / 1000) + 2
  criterios.push({ nombre: 'el dedo la mueve', bien: iDedo > 0 && mueve, detalle: `antes ${antes.toFixed(0)} → ${maximoTrasElDedo.toFixed(0)} px (el dedo a los ${tDedo.toFixed(0)} ms)` })
  criterios.push({ nombre: 'la deriva sigue desde ahí', bien: sigueDesdeAhi, detalle: `quieta en ${dejada.toFixed(0)} px, al final ${final.toFixed(0)} px, ${sinRetroceso ? 'sin retroceso' : 'CON retroceso'}` })

  // El aviso se va con el primer deslizamiento.
  await dormir(800)
  const avisoDespues = await p.evaluate((sel) => {
    const a = document.querySelector(sel)
    return a === null ? null : { estado: a.getAttribute('data-estado'), opacidad: Number(getComputedStyle(a).opacity) }
  }, AVISO)
  criterios.push({ nombre: 'el aviso se va', bien: avisoDespues !== null && avisoDespues.estado === 'ido' && avisoDespues.opacidad < 0.05, detalle: JSON.stringify(avisoDespues) })

  // El teclado: la parada de cada reseña es su enlace del lector, que con el foco aparece como la pastilla (a la vista, en el cuadro). Una
  // tecla antes: el foco de un script después del dedo no es «visible».
  await p.keyboard.press('Shift')
  const foco = await p.evaluate((sel) => {
    const a = document.querySelector(`${sel} [data-pieza="resenas-para-el-lector"] a[href^="#portfolio-"]`)
    if (!(a instanceof HTMLElement)) return null
    a.focus()
    const r = a.getBoundingClientRect()
    const res = { enfocado: document.activeElement === a, visible: a.matches(':focus-visible'), enElCuadro: r.width > 20 && r.height > 10 && r.top >= 0 && r.bottom <= innerHeight, href: a.getAttribute('href') }
    a.blur()
    return res
  }, BLOQUE)
  criterios.push({ nombre: 'el teclado (la pastilla del lector)', bien: foco !== null && foco.enfocado && foco.visible && foco.enElCuadro, detalle: JSON.stringify(foco) })

  // Fuera de pantalla no corre.
  await p.evaluate(() => window.scrollBy({ top: -1.5 * innerHeight, behavior: 'instant' }))
  await dormir(2600)
  const fuera1 = await p.evaluate((sel) => document.querySelector(sel)?.scrollLeft ?? Number.NaN, PISTA)
  await dormir(2000)
  const fuera2 = await p.evaluate((sel) => document.querySelector(sel)?.scrollLeft ?? Number.NaN, PISTA)
  criterios.push({ nombre: 'fuera de pantalla, quieta', bien: Math.abs(fuera2 - fuera1) < 1, detalle: `${fuera1.toFixed(1)} → ${fuera2.toFixed(1)} px en 2 s` })

  // El alto del bloque (REGLA DE ALTURAS) y la foto, al final.
  await llevarALaPista(p)
  const altos = await p.evaluate((sel) => {
    const b = document.querySelector(sel)
    const li = b?.querySelector('[data-pieza="resena-en-lista"]')
    const av = b?.querySelector('[data-parte="aviso-del-carrusel"]')
    return { bloque: b instanceof HTMLElement ? b.offsetHeight : 0, tarjeta: li instanceof HTMLElement ? li.offsetHeight : 0, aviso: av instanceof HTMLElement ? av.offsetHeight : 0 }
  }, BLOQUE)
  console.log(`·     alto del bloque ${String(altos.bloque)} px (tarjeta con su botón ${String(altos.tarjeta)}, aviso ${String(altos.aviso)})`)
  await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
  return criterios
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: string[] = []
  let fallas = 0
  for (const [ancho, alto] of ANCHOS) {
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/resenas-telefono-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      if (CONTROL === 'quieto') await ctx.addInitScript(SIN_DERIVA)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const cdp = await ctx.newCDPSession(p)
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      const criterios = await medir(p, cdp, ancho, alto)
      for (const c of criterios) {
        const linea = `${c.bien ? 'ok   ' : 'FALLA'} ${String(ancho)}x${String(alto)} · ${c.nombre}: ${c.detalle}`
        console.log(linea)
        lineas.push(linea)
        if (!c.bien) fallas += 1
      }
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.join('\n'))
  const esperado = CONTROL === 'quieto' ? ' (CONTROL=quieto: tiene que FALLAR «deriva» y «la deriva sigue desde ahí»)' : CONTROL === 'con-flechas' ? ' (CONTROL=con-flechas: tiene que FALLAR «sin flechas»)' : ''
  console.log(`resenas-telefono: ${String(lineas.length - fallas)} de ${String(lineas.length)} criterios dentro${esperado}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
