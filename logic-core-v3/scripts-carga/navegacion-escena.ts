/**
 * [C2-21] IR A OTRA SECCIÓN CON LA BARRA, DESDE LA ESCENA OSCURA — el Chrome del sistema a la vista contra el dev o el build (`BASE`),
 * `/api/` bloqueado, una sola carga de documento por ancho. Los recorridos (con Enter sobre el ítem de la barra: el mouse queda quieto en
 * una esquina, así la cámara no lo sigue en el medio de la medición):
 *
 *   · al Portfolio y desde el Portfolio a cada sección: Home → Portfolio → Quiénes somos → Portfolio → Servicios → Portfolio → Panel →
 *     Portfolio → Por qué develOP → Portfolio → Home (cada «→ Portfolio» desde una sección de día es también un recorrido medido);
 *   · desde Demos (un salto nativo al ancla `#demos`, quieto 3 s) a cada sección de la barra.
 *
 * Por recorrido, un registro por cuadro (el rAF de la página): el velo del `<main>` (`data-v3-deslizando`), la opacidad del `<main>` y la
 * cámara en el mundo (`__camaraDelBanco`, del banco de la escena). El criterio:
 *   · el título (todo lo del `<main>`, y los títulos 3D, que en un viaje no llegan) con opacidad 0 desde que el velo terminó de cubrir
 *     hasta que el velo se va;
 *   · en el cuadro en que el velo se va (el título empieza a aparecer), la cámara en su pose asentada (la de 2,5 s después) a ± 1 %: la
 *     distancia entre las dos posiciones contra la distancia al logo, más el ángulo entre las dos miradas (radianes);
 *   · a un destino de papel opaco (Servicios, el Panel) la sala no se ve: su cámara se informa, no cuenta.
 *   Un dato: cuánto se movió la cámara (del clic a la asentada) y el tiempo del clic al título.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,1024 npx tsx scripts-carga/navegacion-escena.ts
 *   CONTROL=sin-arreglo …   `window.__defectosDeLaLlegada = 'sin-espera,sin-soltar'` (el título en el acto y el Portfolio que suelta la
 *                           cámara recién al salir del pin, como antes): los recorridos desde el Portfolio tienen que FALLAR.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'sin-arreglo'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: sin-arreglo`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/navegacion-escena')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Los ítems de la barra (`data-nav-id`) y su nombre. */
const SECCIONES = { hero: 'Home', 'quienes-somos': 'Quiénes somos', trabajos: 'Portfolio', servicios: 'Servicios', 'tu-panel': 'Panel', 'por-que-develop': 'Por qué develOP' } as const
type IdDeSeccion = keyof typeof SECCIONES
/** Los destinos de papel opaco: la sala no se ve, la cámara se informa. */
const DE_PAPEL: readonly IdDeSeccion[] = ['servicios', 'tu-panel']
const TOLERANCIA = 0.01

interface Cuadro {
  readonly t: number
  readonly velo: boolean
  readonly opacidad: number
  readonly p: readonly number[] | null
  readonly d: readonly number[] | null
}

const GRABAR = `(() => {
  window.__name = window.__name || ((f) => f)
  if (window.__cuadrosDeLaNavegacion) return
  const log = (window.__cuadrosDeLaNavegacion = [])
  const cuadro = () => {
    const main = document.querySelector('[data-v3] main')
    const c = window.__camaraDelBanco ? window.__camaraDelBanco() : null
    log.push({ t: performance.now(), velo: main ? main.hasAttribute('data-v3-deslizando') : false, opacidad: main ? Number(getComputedStyle(main).opacity) : 1, p: c ? c.p : null, d: c ? c.d : null })
    if (log.length > 6000) log.splice(0, 3000)
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

/** El desvío entre dos cámaras: la distancia entre las posiciones contra la distancia de la segunda al logo, más el ángulo entre las miradas. */
function desvio(a: Cuadro, b: Cuadro): number {
  if (a.p === null || b.p === null || a.d === null || b.d === null) return Number.NaN
  const [ax = 0, ay = 0, az = 0] = a.p
  const [bx = 0, by = 0, bz = 0] = b.p
  const [adx = 0, ady = 0, adz = 0] = a.d
  const [bdx = 0, bdy = 0, bdz = 0] = b.d
  const escala = Math.max(1e-3, Math.hypot(bx, by, bz))
  const punto = Math.max(-1, Math.min(1, adx * bdx + ady * bdy + adz * bdz))
  return Math.hypot(ax - bx, ay - by, az - bz) / escala + Math.acos(punto)
}

const ahora = (p: Page): Promise<number> => p.evaluate(() => performance.now())

/** Un viaje con Enter sobre el ítem de la barra; devuelve los cuadros desde el clic hasta 2,5 s después de que el velo se fue. */
async function viajar(p: Page, id: IdDeSeccion): Promise<{ readonly clic: number; readonly cuadros: Cuadro[] } | null> {
  const enfocado = await p.evaluate((sel) => {
    const el = document.querySelector<HTMLElement>(sel)
    if (el === null) return false
    el.focus({ preventScroll: true })
    return document.activeElement === el
  }, `[data-pieza="barra"] [data-pieza="barra-enlace"][data-nav-id="${id}"]`)
  if (!enfocado) return null
  await dormir(300)
  const clic = await ahora(p)
  await p.keyboard.press('Enter')
  const t0 = Date.now()
  let vioElVelo = false
  let fin: number | null = null
  while (Date.now() - t0 < 9000) {
    const u = await p.evaluate(() => {
      const main = document.querySelector('[data-v3] main')
      return { velo: main !== null && main.hasAttribute('data-v3-deslizando'), t: performance.now() }
    })
    if (u.velo) vioElVelo = true
    if (vioElVelo && !u.velo) {
      fin = u.t
      break
    }
    await dormir(40)
  }
  if (fin === null) return { clic, cuadros: [] }
  await dormir(2500)
  const cuadros = await p.evaluate((desde) => ((window as unknown as { __cuadrosDeLaNavegacion?: Cuadro[] }).__cuadrosDeLaNavegacion ?? []).filter((c) => c.t >= desde - 20), clic)
  return { clic, cuadros }
}

interface Juicio {
  readonly linea: string
  readonly bien: boolean
  readonly cuenta: boolean
}

function juzgar(ancho: number, desde: string, id: IdDeSeccion, v: { readonly clic: number; readonly cuadros: Cuadro[] } | null): Juicio {
  const nombre = `${desde} → ${SECCIONES[id]}`
  const papel = DE_PAPEL.includes(id)
  if (v === null) return { linea: `FALLA ${String(ancho)} · ${nombre} · no se encontró el ítem de la barra`, bien: false, cuenta: true }
  const c = v.cuadros
  const iVelo = c.findIndex((x) => x.velo)
  const iTitulo = iVelo < 0 ? -1 : c.findIndex((x, k) => k > iVelo && !x.velo)
  const final = c[c.length - 1]
  if (iVelo < 0 || iTitulo < 0 || final === undefined) return { linea: `FALLA ${String(ancho)} · ${nombre} · el viaje no se vio (velo ${iVelo < 0 ? 'nunca' : 'sin irse'})`, bien: false, cuenta: true }
  const veloPuesto = c[iVelo]
  const titulo = c[iTitulo]
  const alClic = c[0]
  if (veloPuesto === undefined || titulo === undefined || alClic === undefined) return { linea: `FALLA ${String(ancho)} · ${nombre} · sin cuadros`, bien: false, cuenta: true }
  // El título en 0 desde que el velo terminó de cubrir (su fundido, 300 ms + margen) hasta que se va.
  const cubierto = c.slice(iVelo, iTitulo).filter((x) => x.t >= veloPuesto.t + 450)
  const tituloEnCero = cubierto.every((x) => x.opacidad <= 0.01)
  const enElTitulo = desvio(titulo, final)
  const antesDelFinal = [...c].reverse().find((x) => x.t <= final.t - 400)
  const asentada = antesDelFinal === undefined ? Number.NaN : desvio(antesDelFinal, final)
  const movio = desvio(alClic, final)
  const camaraBien = Number.isFinite(enElTitulo) && enElTitulo <= TOLERANCIA
  const bien = tituloEnCero && (papel || camaraBien)
  const pct = (x: number): string => (Number.isFinite(x) ? `${(x * 100).toFixed(2)} %` : 'sin medir')
  const linea =
    `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${nombre} · del clic al título ${(titulo.t - v.clic).toFixed(0)} ms` +
    ` · el título ${tituloEnCero ? 'en 0 hasta que el velo se fue' : 'SE VIO ANTES'} · la cámara en el título a ${pct(enElTitulo)} de la asentada${papel ? ' (papel opaco: un dato)' : ` (tope ${pct(TOLERANCIA)})`}` +
    ` · asentada: ${pct(asentada)} en los últimos 400 ms · se movió ${pct(movio)} desde el clic`
  return { linea, bien, cuenta: true }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: Juicio[] = []
  for (const ancho of ANCHOS) {
    const alto = 900
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/navegacion-escena-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      const defectos = CONTROL === 'sin-arreglo' ? 'sin-espera,sin-soltar' : ''
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__defectosDeLaLlegada = ${JSON.stringify(defectos)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      // El mouse en una esquina, quieto todo el banco: ni el hover del Portfolio ni el seguimiento de la cámara se mueven.
      await p.mouse.move(2, 2)
      await dormir(7000)
      const modo = await p.evaluate(() => document.querySelector('[data-pieza="barra"]')?.getAttribute('data-modo') ?? '')
      const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
      console.log(`·     ${String(ancho)} · la barra en modo «${modo}», la pestaña ${visible ? 'a la vista' : 'OCULTA (las medidas no valen)'}`)
      if (modo !== 'barra') {
        lineas.push({ linea: `·     ${String(ancho)} · sin la barra de escritorio (modo «${modo}»): no se mide`, bien: true, cuenta: false })
        continue
      }
      await p.evaluate(GRABAR)
      // 1 · Al Portfolio y desde el Portfolio a cada sección.
      let desde = 'Home'
      for (const id of ['quienes-somos', 'servicios', 'tu-panel', 'por-que-develop', 'hero'] as const) {
        const ida = await viajar(p, 'trabajos')
        lineas.push(juzgar(ancho, desde, 'trabajos', ida))
        console.log(lineas[lineas.length - 1]?.linea)
        const vuelta = await viajar(p, id)
        lineas.push(juzgar(ancho, 'Portfolio', id, vuelta))
        console.log(lineas[lineas.length - 1]?.linea)
        desde = SECCIONES[id]
      }
      // 2 · Desde Demos a cada sección.
      for (const id of Object.keys(SECCIONES) as IdDeSeccion[]) {
        const hay = await p.evaluate(() => {
          const ancla = document.getElementById('demos')
          if (ancla === null) return false
          window.scrollTo({ top: ancla.getBoundingClientRect().top + scrollY, behavior: 'instant' })
          return true
        })
        if (!hay) {
          lineas.push({ linea: `FALLA ${String(ancho)} · Demos → ${SECCIONES[id]} · no hay ancla #demos`, bien: false, cuenta: true })
          continue
        }
        await dormir(3000)
        lineas.push(juzgar(ancho, 'Demos', id, await viajar(p, id)))
        console.log(lineas[lineas.length - 1]?.linea)
      }
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-ultima${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  const medidos = lineas.filter((l) => l.cuenta)
  // Los que el control tiene que tirar: desde el Portfolio a un destino donde la sala se ve.
  const desdeElPortfolio = medidos.filter((l) => l.linea.includes(' · Portfolio → ') && !l.linea.includes('papel opaco'))
  console.log(`navegacion-escena: ${String(medidos.filter((l) => l.bien).length)} de ${String(medidos.length)} recorridos dentro del criterio (desde el Portfolio a la sala: ${String(desdeElPortfolio.filter((l) => l.bien).length)} de ${String(desdeElPortfolio.length)})${CONTROL === '' ? '' : ` · CONTROL=${CONTROL}: los de desde el Portfolio tienen que FALLAR`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
