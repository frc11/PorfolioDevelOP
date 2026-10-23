/**
 * [C2 · 71t] EL FAQ DEL TELÉFONO Y LA TABLET (la tarea 71 §6) — el acordeón de vidrio después del pie. El Chrome del sistema a la vista
 * contra el dev o el build (`BASE`), táctil (`isMobile`, `hasTouch`), `/api/` bloqueado. Por ancho (390 × 844 y 768 × 1024) y ruta:
 *
 *   BASE=http://localhost:3000 ANCHOS=390,768 RUTAS=/v3,/v3/pagina-base npx tsx scripts-carga/faq-telefono.ts
 *
 * Los criterios (todo acotado a la lista, `[data-faq-del-pie="lista"]`):
 *   · TOQUE: tocar la primera pregunta la abre (`aria-expanded`, su respuesta sin `inert`, con alto y su texto a la vista), con el
 *     despliegue (alguna muestra del alto, cuadro a cuadro, a mitad de camino); tocar otra la abre y cierra la primera (una a la vez);
 *     tocarla de nuevo la cierra (alto 0); con menos movimiento (emulado) se abre de golpe (ninguna muestra a mitad de camino);
 *   · VIDRIO: en el estilo computado del panel, el desenfoque (`backdrop-filter` con un `blur` mayor que 0), el tinte semitransparente
 *     (alfa < 1), el borde de luz (`box-shadow` de adentro) y el reflejo (`::before` con un degradé); la raíz, sin fondo (transparente);
 *   · DESBORDE: ni el documento (`scrollWidth` ≤ el ancho) ni ninguna pieza de la lista se sale del ancho, cerrada y con la respuesta
 *     más larga abierta;
 *   · FOTO: con la respuesta más larga abierta, el panel a la vista (≥ 60 % de lo que entra en el cuadro) y la respuesta en el cuadro; la
 *     captura en `~/.cache/b4-medicion/faq-telefono/`.
 * Imprime también los altos de la lista (cerrada y con la más larga abierta) y del documento (el layout y el desborde): la REGLA DE ALTURAS.
 *
 *   CONTROL=sin-toque    los toques no llegan a la lista: tiene que FALLAR «toque»;
 *   CONTROL=sin-vidrio   el panel sin desenfoque, sin filo, sin reflejo y opaco: tiene que FALLAR «vidrio»;
 *   CONTROL=desborde     el panel más ancho que la pantalla: tiene que FALLAR «desborde»;
 *   CONTROL=foto-fuera   la foto con la lista fuera del cuadro: tiene que FALLAR «foto».
 */
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '390,768').split(',').map(Number)
const RUTAS = (process.env.RUTAS ?? '/v3,/v3/pagina-base').split(',')
const CONTROL = process.env.CONTROL ?? ''
const CONTROLES = ['', 'sin-toque', 'sin-vidrio', 'desborde', 'foto-fuera'] as const
if (!(CONTROLES as readonly string[]).includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: ${CONTROLES.filter(Boolean).join(' | ')}`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/faq-telefono')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const LISTA = '[data-faq-del-pie="lista"]'
const ALTOS: Readonly<Record<number, number>> = { 390: 844, 768: 1024 }

/** Lo que cada control rompe, inyectado antes de que cargue la página. */
const ROMPER: Readonly<Record<string, string>> = {
  'sin-toque': `window.addEventListener('click', (e) => { const t = e.target; if (t instanceof Element && t.closest('${LISTA} button')) { e.stopImmediatePropagation(); e.preventDefault() } }, true);`,
  'sin-vidrio': `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '${LISTA} [data-material="vidrio"] { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; box-shadow: none !important; background-color: var(--color-fondo) !important } ${LISTA} [data-material="vidrio"]::before { background-image: none !important }'; document.head.appendChild(s) });`,
  desborde: `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '${LISTA} [data-material="vidrio"] { width: calc(100vw + 48px) !important; max-width: none !important }'; document.head.appendChild(s) });`,
}

/** El panel, la raíz y el reflejo, en el estilo computado. */
const VIDRIO = `(() => {
  const l = document.querySelector('${LISTA}')
  const v = l ? l.querySelector('[data-material="vidrio"]') : null
  if (!l || !v) return null
  const c = getComputedStyle(v)
  const filtro = c.backdropFilter && c.backdropFilter !== 'none' ? c.backdropFilter : (c.webkitBackdropFilter || 'none')
  const blur = /blur\\(([\\d.]+)px\\)/.exec(filtro)
  const alfa = (color) => {
    const m = /rgba?\\(([^)]*)\\)/.exec(color) || /color\\([a-z-]+ ([^)]*)\\)/.exec(color)
    if (!m) return 1
    const partes = m[1].split('/')
    if (partes.length > 1) return Number(partes[1].trim())
    const comas = m[1].split(',')
    return comas.length === 4 ? Number(comas[3]) : 1
  }
  return {
    desenfoque: blur ? Number(blur[1]) : 0,
    alfa: alfa(c.backgroundColor),
    filo: c.boxShadow.includes('inset'),
    reflejo: getComputedStyle(v, '::before').backgroundImage.includes('linear-gradient'),
    raiz: getComputedStyle(l).backgroundColor,
    raizSinFondo: alfa(getComputedStyle(l).backgroundColor) === 0,
    tono: v.getAttribute('data-seccion') === 'invertida' ? 'oscuro' : 'claro',
  }
})()`
interface Vidrio {
  readonly desenfoque: number
  readonly alfa: number
  readonly filo: boolean
  readonly reflejo: boolean
  readonly raiz: string
  readonly raizSinFondo: boolean
  readonly tono: string
}

/** El documento y cada pieza de la lista contra el ancho del cuadro (medio px de tolerancia por el redondeo). */
const DESBORDE = `(() => {
  const l = document.querySelector('${LISTA}')
  const ancho = innerWidth
  const doc = document.documentElement.scrollWidth
  const fuera = l ? [...l.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < -0.5 || r.right > ancho + 0.5) }).length : -1
  return { ancho, doc, fuera }
})()`
interface Desborde {
  readonly ancho: number
  readonly doc: number
  readonly fuera: number
}
const desbordeBien = (d: Desborde): boolean => d.fuera === 0 && d.doc <= d.ancho

/** El estado de la pregunta `i`: abierta, el alto de su respuesta y si su texto está en el cuadro. */
const estado = (i: number): string => `(() => {
  const l = document.querySelector('${LISTA}')
  const b = l ? l.querySelectorAll('button')[${String(i)}] : null
  const r = b ? document.getElementById(b.getAttribute('aria-controls') || '') : null
  if (!b || !r || !l.contains(r)) return null
  const t = r.querySelector('p') || r
  const rt = t.getBoundingClientRect()
  return { abierta: b.getAttribute('aria-expanded') === 'true', inerte: r.inert, alto: r.getBoundingClientRect().height, aLaVista: rt.height > 0 && rt.top < innerHeight && rt.bottom > 0 && getComputedStyle(t).opacity !== '0' }
})()`
interface Estado {
  readonly abierta: boolean
  readonly inerte: boolean
  readonly alto: number
  readonly aLaVista: boolean
}
const leerEstado = async (p: Page, i: number): Promise<Estado | null> => (await p.evaluate(estado(i))) as Estado | null

/** Lleva la pregunta `i` a una altura del cuadro (lejos de lo fijo de abajo: la barra, el chat) y la toca. */
async function tocar(p: Page, i: number, alturaDelCuadro = 0.35): Promise<void> {
  await p.evaluate(`(() => {
    const b = document.querySelector('${LISTA}').querySelectorAll('button')[${String(i)}]
    const r = b.getBoundingClientRect()
    window.scrollBy({ top: r.top + r.height / 2 - innerHeight * ${String(alturaDelCuadro)}, behavior: 'instant' })
  })()`)
  await dormir(150)
  await p.locator(`${LISTA} button`).nth(i).tap({ timeout: 10000 })
}

/** Toca la pregunta `i` y muestrea el alto de su respuesta cuadro a cuadro durante `ms`. */
async function tocarYMuestrear(p: Page, i: number, ms = 900): Promise<readonly number[]> {
  await p.evaluate(`(() => {
    const l = document.querySelector('${LISTA}')
    const r = document.getElementById(l.querySelectorAll('button')[${String(i)}].getAttribute('aria-controls'))
    const serie = []
    window.__altosDelFaq = serie
    const hasta = performance.now() + ${String(ms + 400)}
    const paso = () => { serie.push(r.getBoundingClientRect().height); if (performance.now() < hasta) requestAnimationFrame(paso) }
    requestAnimationFrame(paso)
  })()`)
  await tocar(p, i)
  await dormir(ms + 500)
  return (await p.evaluate('window.__altosDelFaq || []')) as number[]
}
/** Con despliegue: alguna muestra entre el 10 % y el 90 % del alto final; de golpe, ninguna. */
const aMitad = (serie: readonly number[], final: number): number => serie.filter((h) => h > final * 0.1 && h < final * 0.9).length

const alturas = (): string => `(() => {
  const l = document.querySelector('${LISTA}')
  return { lista: l ? l.getBoundingClientRect().height : 0, layout: document.documentElement.offsetHeight, desborde: document.documentElement.scrollHeight }
})()`
interface Alturas {
  readonly lista: number
  readonly layout: number
  readonly desborde: number
}

async function correr(p: Page, ancho: number, ruta: string): Promise<{ readonly linea: string; readonly bien: boolean }> {
  const n = (x: number): string => x.toFixed(0)
  await p.waitForSelector(LISTA, { state: 'attached', timeout: 60000 })
  // La lista arriba del cuadro (en el home, después del pie: el encastre ya corrió al pasar por el fondo del layout).
  await p.evaluate('window.scrollTo({ top: document.documentElement.offsetHeight - innerHeight, behavior: "instant" })')
  await dormir(4000)
  await p.evaluate(`(() => { const r = document.querySelector('${LISTA}').getBoundingClientRect(); window.scrollBy({ top: r.top - 16, behavior: 'instant' }) })()`)
  await dormir(1500)
  const cerrada = (await p.evaluate(alturas())) as Alturas

  // VIDRIO
  const v = (await p.evaluate(VIDRIO)) as Vidrio | null
  const vidrioBien = v !== null && v.desenfoque > 0 && v.alfa < 1 && v.filo && v.reflejo && v.raizSinFondo
  const dCerrada = (await p.evaluate(DESBORDE)) as Desborde

  // TOQUE: la primera se abre desplegándose; otra la reemplaza; tocada de nuevo, se cierra.
  const largos = (await p.evaluate(`[...document.querySelector('${LISTA}').querySelectorAll('button')].map((b) => (document.getElementById(b.getAttribute('aria-controls')) || b).textContent.length)`)) as number[]
  const larga = largos.indexOf(Math.max(...largos))
  const otra = larga === 0 ? 1 : larga
  const serie = await tocarYMuestrear(p, 0)
  const e0 = await leerEstado(p, 0)
  const abre = e0 !== null && e0.abierta && !e0.inerte && e0.alto > 20 && e0.aLaVista
  const despliega = e0 !== null && aMitad(serie, e0.alto) > 0
  await tocar(p, otra)
  await dormir(900)
  const e0b = await leerEstado(p, 0)
  const eOtra = await leerEstado(p, otra)
  const unaPorVez = e0b !== null && !e0b.abierta && e0b.inerte && e0b.alto < 1 && eOtra !== null && eOtra.abierta && eOtra.alto > 20
  const dAbierta = otra === larga ? ((await p.evaluate(DESBORDE)) as Desborde) : null
  const abierta = (await p.evaluate(alturas())) as Alturas
  await tocar(p, otra)
  await dormir(900)
  const eCerrada = await leerEstado(p, otra)
  const cierra = eCerrada !== null && !eCerrada.abierta && eCerrada.alto < 1
  // Con menos movimiento: de golpe.
  await p.emulateMedia({ reducedMotion: 'reduce' })
  await dormir(600)
  const serieReducida = await tocarYMuestrear(p, 0, 600)
  const e0r = await leerEstado(p, 0)
  const deGolpe = e0r !== null && e0r.abierta && e0r.alto > 20 && aMitad(serieReducida, e0r.alto) === 0
  await tocar(p, 0)
  await dormir(400)
  await p.emulateMedia({ reducedMotion: 'no-preference' })
  await dormir(600)
  const toqueBien = abre && despliega && unaPorVez && cierra && deGolpe

  // DESBORDE (con la más larga abierta, si no se abrió arriba)
  let dLarga = dAbierta
  if (dLarga === null) {
    await tocar(p, larga)
    await dormir(900)
    dLarga = (await p.evaluate(DESBORDE)) as Desborde
    await tocar(p, larga)
    await dormir(900)
  }
  const desbordeOk = desbordeBien(dCerrada) && desbordeBien(dLarga)

  // FOTO (al final: una captura congela los pasos de render de la página, y después de ella no se mide nada más)
  await tocar(p, larga, 0.2)
  await dormir(1000)
  if (CONTROL === 'foto-fuera') await p.evaluate('window.scrollTo({ top: 0, behavior: "instant" })')
  await dormir(300)
  const encuadre = (await p.evaluate(`(() => {
    const v = document.querySelector('${LISTA} [data-material="vidrio"]')
    const r = v.getBoundingClientRect()
    const visto = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0))
    return visto / Math.min(r.height, innerHeight)
  })()`)) as number
  const eFoto = await leerEstado(p, larga)
  const archivo = path.join(SALIDA, `${String(ancho)}${ruta.replaceAll('/', '-')}-acordeon${CONTROL === '' ? '' : `-${CONTROL}`}.png`)
  await p.screenshot({ path: archivo, fullPage: false })
  const peso = statSync(archivo).size
  const fotoBien = encuadre >= 0.6 && eFoto !== null && eFoto.abierta && eFoto.aLaVista && peso > 10000

  const bien = toqueBien && vidrioBien && desbordeOk && fotoBien
  const linea =
    `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${ruta}` +
    ` · toque ${toqueBien ? 'ok' : 'FALLA'} (abre ${abre ? 'sí' : 'NO'}, despliegue ${String(aMitad(serie, e0?.alto ?? 0))} cuadros a mitad, una a la vez ${unaPorVez ? 'sí' : 'NO'}, cierra ${cierra ? 'sí' : 'NO'}, reducido ${deGolpe ? 'de golpe' : 'NO de golpe'})` +
    ` · vidrio ${vidrioBien ? 'ok' : 'FALLA'} (${v === null ? 'sin panel' : `blur ${String(v.desenfoque)} px, alfa ${v.alfa.toFixed(2)}, filo ${v.filo ? 'sí' : 'NO'}, reflejo ${v.reflejo ? 'sí' : 'NO'}, raíz ${v.raiz}, tono ${v.tono}`})` +
    ` · desborde ${desbordeOk ? 'ok' : 'FALLA'} (documento ${String(dCerrada.doc)}/${String(dCerrada.ancho)}, piezas fuera ${String(dCerrada.fuera)} cerrada, ${String(dLarga.fuera)} con la más larga)` +
    ` · foto ${fotoBien ? 'ok' : 'FALLA'} (${(encuadre * 100).toFixed(0)} % del panel, ${path.basename(archivo)}, ${String(Math.round(peso / 1024))} KB)` +
    ` · altos: lista ${n(cerrada.lista)} cerrada, ${n(abierta.lista)} con la ${String(otra)} abierta; layout ${n(cerrada.layout)}, desborde ${n(cerrada.desborde)}`
  return { linea, bien }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean }[] = []
  for (const ancho of ANCHOS) {
    const alto = ALTOS[ancho] ?? 844
    for (const ruta of RUTAS) {
      const perfil = path.join(os.homedir(), `.cache/b4-medicion/faq-telefono-perfil-${String(Date.now())}`)
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
        await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; ${ROMPER[CONTROL] ?? ''} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
        const p = ctx.pages()[0] ?? (await ctx.newPage())
        await p.route('**/api/**', (r) => r.abort())
        await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
        await dormir(7000)
        console.log(`·     ${String(ancho)} · ${ruta} · visible: ${String(await p.evaluate('document.visibilityState'))}, ancho ${String(await p.evaluate('innerWidth'))}`)
        const r = await correr(p, ancho, ruta)
        console.log(r.linea)
        lineas.push(r)
      } catch (e: unknown) {
        const linea = `FALLA ${String(ancho)} · ${ruta} · el banco se cortó: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`
        console.log(linea)
        lineas.push({ linea, bien: false })
      } finally {
        await ctx.close()
      }
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  const esperado = CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR «${CONTROL === 'sin-toque' ? 'toque' : CONTROL === 'sin-vidrio' ? 'vidrio' : CONTROL === 'desborde' ? 'desborde' : 'foto'}» en cada corrida)`
  console.log(`faq-telefono: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} corridas dentro del criterio${esperado}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
