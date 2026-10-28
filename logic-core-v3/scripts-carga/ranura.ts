/**
 * [B12a.3] LA RANURA DE VARIANTES, EN EL SITIO — en la ruta de prueba (`/v3/pagina-base`, la variante `prueba` y el acento de web), con
 * el banco de la escena (`__ranuraDelBanco`). Contra el dev server (o el build, con `BASE`), con el Chrome del sistema a la vista y `/api/`
 * bloqueado.
 *
 *   ANCHOS=1440x900,390x844 npx tsx scripts-carga/ranura.ts          la carga, el avance, la salida y diez idas y vueltas
 *   COSTO=1 npx tsx scripts-carga/ranura.ts                           además, el costo por cuadro con y sin la variante (en el build: D7)
 *   COSTO=1 COSTO_EN=0 npx tsx scripts-carga/ranura.ts                el costo en avance 0 (la luz en la composición)
 *   CONTROL=sin-la-senal npx tsx scripts-carga/ranura.ts              el control: el enlace no pide la salida (tiene que dar FALLA)
 *   CONTROL=pesada COSTO=1 npx tsx scripts-carga/ranura.ts            el control del costo: 0,8 ms por cuadro de más (tiene que dar FALLA)
 *   REDUCIDO=1 npx tsx scripts-carga/ranura.ts                        con movimiento reducido: quieta en su estado final y la salida inmediata
 *
 * Lo que tiene que dar:
 * · la variante se carga por su id; en avance 0 la luz es la de la composición (0,12, blanca) y la ranura es la dueña;
 * · a medio camino (avance 0,25) sube y se tiñe; en 0,5, la entera (1) con el acento; de vuelta en 0, la composición;
 * · al irse al home (el enlace pide la salida y espera), la luz baja a la composición en ~420 ms, cuadro a cuadro, teñida y sin trabarse,
 *   y recién después navega (`juzgarLaSalida`); la variante se desmonta y la ranura deja de ser la dueña (el home, intacto);
 * · diez idas y vueltas dejan la memoria del lienzo (geometrías y texturas) como estaba.
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const COSTO = process.env.COSTO === '1'
/** Dónde se mide el costo: en 0,25 la variante corre con la luz subiendo; en 0, con la luz en la composición (separa su código de la luz). */
const COSTO_EN = Number(process.env.COSTO_EN ?? '0.25')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('ranura')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Estado {
  readonly id: string | null
  readonly saliendo: boolean
  readonly duena: boolean
  readonly energia: number
  readonly color: string
  readonly geometrias: number
  readonly texturas: number
  /** Lo que duró la última salida, medido en la página (de `saliendo` al desmontaje, ms). */
  readonly salidaMs: number
}

const estado = (p: Page): Promise<Estado | null> => p.evaluate(() => (window as unknown as { __ranuraDelBanco?: () => Estado }).__ranuraDelBanco?.() ?? null)

async function esperar(p: Page, f: (e: Estado) => boolean, ms = 60000): Promise<Estado | null> {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const e = await estado(p).catch(() => null)
    if (e !== null && f(e)) return e
    await dormir(150)
  }
  return estado(p).catch(() => null)
}

const alAvance = (p: Page, f: number): Promise<void> =>
  p.evaluate((x) => {
    const b = document.querySelector('[data-intro-de-pagina]')
    const arriba = b === null ? 0 : b.getBoundingClientRect().top + scrollY
    window.scrollTo({ top: arriba + x * 1.5 * innerHeight, behavior: 'instant' })
  }, f)

async function costoPorCuadro(p: Page, cdp: CDPSession): Promise<number> {
  const metricas = async (): Promise<{ s: number; n: number }> => {
    const { metrics } = (await cdp.send('Performance.getMetrics')) as { metrics: { name: string; value: number }[] }
    return { s: metrics.find((m) => m.name === 'ScriptDuration')?.value ?? 0, n: metrics.find((m) => m.name === 'Frames')?.value ?? 0 }
  }
  const cuadros = (ms: number): Promise<number> =>
    p.evaluate(`new Promise((r) => { let n = 0; const fin = performance.now() + ${String(ms)}; const paso = (t) => { n++; if (t < fin) requestAnimationFrame(paso); else r(n) }; requestAnimationFrame(paso) })`) as Promise<number>
  const a = await metricas()
  const n = await cuadros(8000)
  const b = await metricas()
  return ((b.s - a.s) * 1000) / Math.max(1, n)
}

/** Un cuadro de la salida: ms desde el clic, la luz que dejó la variante, su color, si la ranura es la dueña y la ruta. */
interface Cuadro {
  readonly t: number
  readonly e: number
  readonly c: string
  readonly d: boolean
  readonly ruta: string
}

/** El control: el enlace no pide la salida (la de antes: la variante sale recién cuando el preset cambia, con el home montándose). */
const SIN_LA_SENAL = process.env.CONTROL === 'sin-la-senal'
/** El control del costo: la página gasta 0,8 ms de CPU por cuadro sólo en las medidas «con» (como una variante cara): tiene que dar FALLA. */
const CONTROL_PESADA = process.env.CONTROL === 'pesada'
/** Con movimiento reducido: la variante en su estado final, quieta, en cualquier avance, y la salida inmediata (≤ 100 ms). */
const REDUCIDO = process.env.REDUCIDO === '1'

// Sin comillas invertidas adentro: es el texto de un script de página.
const GRABAR_LA_SALIDA = `(() => {
  const w = window
  const cuadros = []
  w.__salidaGrabada = cuadros
  let t0 = -1
  document.addEventListener('click', () => { if (t0 < 0) t0 = performance.now() }, { capture: true, once: true })
  const paso = (t) => {
    const r = w.__ranuraDelBanco ? w.__ranuraDelBanco() : null
    if (t0 >= 0 && r !== null) cuadros.push({ t: t - t0, e: r.energia, c: r.color, d: r.duena, ruta: location.pathname })
    if (t0 < 0 || t - t0 < 2400) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
})()`

/**
 * La salida, juzgada cuadro a cuadro (P-H29d: «la variante baja en ~420 ms antes del velo»):
 * · llega a la composición (la luz en 0,12 exacta: la curva 1 − (1 − t)³ queda a 0,002 de ella al 87 % del camino) entre 400 y 600 ms
 *   después del clic;
 * · la navegación pasa DESPUÉS (la ruta cambia con la luz ya en la composición);
 * · sin cuadros trabados mientras baja (ningún hueco de más de 50 ms): se ve bajar, no saltar;
 * · baja siempre (nunca sube) y, mientras está encendida (> 0,2), sigue teñida (no se pone blanca de golpe);
 * · la ranura es la dueña de la luz hasta la composición (no se la pasa al final a mitad de camino).
 */
function juzgarLaSalida(cuadros: readonly Cuadro[]): { readonly llegaMs: number; readonly navegaMs: number; readonly huecoMs: number; readonly fallas: readonly string[] } {
  const COMPOSICION = 0.12
  const llega = cuadros.find((q) => Math.abs(q.e - COMPOSICION) < 1e-6)
  const navega = cuadros.find((q) => q.ruta === '/v3')
  const llegaMs = llega?.t ?? Number.NaN
  const navegaMs = navega?.t ?? Number.NaN
  const bajando = cuadros.filter((q) => q.t <= (llega?.t ?? Number.POSITIVE_INFINITY))
  let huecoMs = 0
  let sube = false
  for (let i = 1; i < bajando.length; i++) {
    const a = bajando[i - 1]
    const b = bajando[i]
    if (a === undefined || b === undefined) continue
    huecoMs = Math.max(huecoMs, b.t - a.t)
    if (b.e > a.e + 0.002) sube = true
  }
  const fallas: string[] = []
  if (REDUCIDO ? !(llegaMs <= 100) : !(llegaMs >= 400 && llegaMs <= 600)) fallas.push('tiempo')
  if (!(navegaMs >= llegaMs)) fallas.push('navega-antes')
  if (huecoMs > 50) fallas.push('trabada')
  if (sube) fallas.push('sube')
  if (bajando.some((q) => q.e > 0.2 && q.c === 'ffffff')) fallas.push('blanca-de-golpe')
  if (bajando.some((q) => !q.d)) fallas.push('suelta-a-mitad')
  return { llegaMs, navegaMs, huecoMs, fallas }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('ranura')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: REDUCIDO ? 'reduce' : 'no-preference',
      isMobile: ancho < 1024,
      hasTouch: ancho < 1024,
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    const fallas: string[] = []
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1'); if (sessionStorage.getItem('ranura:sin') === '1') window.__ranuraSinVariante = true } catch (e) {} try { const ms = Number(sessionStorage.getItem('ranura:pesada') || '0'); if (ms > 0) { const paso = () => { const fin = performance.now() + ms; while (performance.now() < fin) { /* el control del costo */ } requestAnimationFrame(paso) }; requestAnimationFrame(paso) } } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      const cdp = await ctx.newCDPSession(p)
      await cdp.send('Network.enable')
      await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
      await cdp.send('Performance.enable')
      await p.goto(`${BASE}/v3/pagina-base`, { waitUntil: 'load', timeout: 240000 })
      const cargada = await esperar(p, (e) => e.id === 'prueba')
      await dormir(2500)
      if (cargada?.id !== 'prueba') fallas.push('no-cargo')
      // El avance: la composición, a medio camino, la entera y de vuelta.
      const enElAvance: Record<string, Estado | null> = {}
      for (const f of [0, 0.25, 0.5, 0]) {
        await alAvance(p, f)
        await dormir(1200)
        enElAvance[String(f)] = await estado(p)
        await p.screenshot({ path: path.join(SALIDA, `avance-${String(f)}-${String(ancho)}.png`) })
      }
      const e0 = enElAvance['0']
      const e25 = enElAvance['0.25']
      const e5 = enElAvance['0.5']
      // Con movimiento reducido, el estado final quieto en cualquier avance: la luz entera y teñida desde arriba.
      if (REDUCIDO) {
        if ([e0, e25, e5].some((e) => e === null || Math.abs(e.energia - 1) > 0.005 || e.color === 'ffffff' || !e.duena)) fallas.push('reducido-no-quieto')
      } else if (e0 === null || Math.abs(e0.energia - 0.12) > 0.005 || e0.color !== 'ffffff' || !e0.duena) fallas.push('composicion')
      if (!REDUCIDO && (e25 === null || !(e25.energia > 0.3 && e25.energia < 0.9) || e25.color === 'ffffff')) fallas.push('medio-camino')
      if (!REDUCIDO && (e5 === null || Math.abs(e5.energia - 1) > 0.005 || e5.color === 'ffffff')) fallas.push('entera')
      // El costo por cuadro, con y sin la variante, en `COSTO_EN` (la variante corriendo).
      let costo: { con: number; sin: number; aa: number } | null = null
      if (COSTO) {
        // Cada medida, recién recargada (el mismo punto de partida) y alternadas, con y sin: la bandera viaja en sessionStorage (la lee
        // el script de inicio; puesta en `window`, la recarga la borraba y «sin» medía también con la variante).
        const medir = async (sinVariante: boolean): Promise<number> => {
          await p.evaluate(([s, pesada]) => {
            sessionStorage.setItem('ranura:sin', s ? '1' : '0')
            sessionStorage.setItem('ranura:pesada', !s && pesada ? '0.8' : '0')
          }, [sinVariante, CONTROL_PESADA] as const)
          await p.reload({ waitUntil: 'load' })
          await esperar(p, (e) => e.duena && (sinVariante ? e.id === null : e.id === 'prueba'))
          await dormir(2500)
          const e = await estado(p)
          if (e === null || (sinVariante ? e.id !== null : e.id !== 'prueba')) fallas.push('costo-mal-armado')
          await alAvance(p, COSTO_EN)
          await dormir(1500)
          return costoPorCuadro(p, cdp)
        }
        const con1 = await medir(false)
        const sin1 = await medir(true)
        const con2 = await medir(false)
        const sin2 = await medir(true)
        costo = { con: (con1 + con2) / 2, sin: (sin1 + sin2) / 2, aa: Math.abs(con1 - con2) }
        if (costo.con - costo.sin > 0.5) fallas.push('presupuesto')
        await p.evaluate(() => {
          sessionStorage.setItem('ranura:sin', '0')
          sessionStorage.setItem('ranura:pesada', '0')
        })
        await p.reload({ waitUntil: 'load' })
        await esperar(p, (e) => e.id === 'prueba')
        await dormir(2500)
      }
      // La salida: al home por el enlace, grabada cuadro a cuadro EN la página (un rAF): la luz, el color, la dueña y la ruta.
      await alAvance(p, 0.5)
      await dormir(1500)
      const antes = await estado(p)
      if (SIN_LA_SENAL) await p.evaluate(() => ((window as unknown as { __ranuraSinLaSenal: boolean }).__ranuraSinLaSenal = true))
      await p.evaluate(GRABAR_LA_SALIDA)
      await p.locator('a[href="/v3"]').first().click()
      await dormir(2600)
      const muestras = (await p.evaluate(() => (window as unknown as { __salidaGrabada: readonly Cuadro[] }).__salidaGrabada)) ?? []
      const salida = juzgarLaSalida(muestras)
      const final = await esperar(p, (e) => e.id === null, 8000)
      const libero = final?.duena === false
      if (salida.fallas.length > 0 || !libero) fallas.push(`salida(${[...salida.fallas, ...(libero ? [] : ['no-solto'])].join('+')})`)
      // Diez idas y vueltas: la memoria del lienzo al final, contra la de antes.
      await p.goBack()
      await esperar(p, (e) => e.id === 'prueba')
      await dormir(1500)
      const memAntes = await estado(p)
      for (let k = 0; k < 10; k++) {
        await p.locator('a[href="/v3"]').first().click()
        await esperar(p, (e) => e.id === null, 5000)
        await dormir(600)
        await p.goBack()
        await esperar(p, (e) => e.id === 'prueba', 10000)
        await dormir(600)
      }
      const memDespues = await estado(p)
      if (memAntes === null || memDespues === null || memDespues.geometrias > memAntes.geometrias || memDespues.texturas > memAntes.texturas) fallas.push('memoria')
      appendFileSync(path.join(SALIDA, 'ranura.jsonl'), `${JSON.stringify({ ancho, alto, cargada, enElAvance, costo, antes, muestras, memAntes, memDespues, fallas })}\n`)
      console.log(`${fallas.length === 0 ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · energía ${[e0, e25, e5].map((e) => e?.energia.toFixed(3) ?? '?').join(' → ')} · color ${[e0, e25, e5].map((e) => e?.color ?? '?').join(' → ')} · salida: a la composición en ${salida.llegaMs.toFixed(0)} ms, navega a los ${salida.navegaMs.toFixed(0)}, hueco máximo ${salida.huecoMs.toFixed(0)} ms (suelta ${String(libero)}) · memoria ${String(memAntes?.geometrias)}/${String(memAntes?.texturas)} → ${String(memDespues?.geometrias)}/${String(memDespues?.texturas)}${costo === null ? '' : ` · costo ${costo.con.toFixed(3)} ms/cuadro con la variante, ${costo.sin.toFixed(3)} sin (Δ ${(costo.con - costo.sin).toFixed(3)}; A/A entre las dos con ${costo.aa.toFixed(3)})`}${fallas.length === 0 ? '' : ` · ${fallas.join(',')}`}`)
      if (fallas.length > 0) malas += 1
    } finally {
      await ctx.close()
    }
  }
  console.log(`ranura: ${String(ANCHOS.length - malas)} de ${String(ANCHOS.length)} anchos bien`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
