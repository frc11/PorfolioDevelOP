/**
 * [NOCTURNO B9] LAS GRIETAS DEL CRISTAL, EN EL SITIO — contra el dev server (o el build, con `BASE`), con el Chrome del sistema a la vista,
 * `/api/` bloqueado y el banco de la escena (`__grietasDelBanco`, `__gpuDelBanco`). SIN CORRER todavía (lo corre el orquestador).
 *
 *   npx tsx scripts-carga/grietas.ts                       los tiempos y las variantes en /v3/pagina-base (el título las dispara) y en el home
 *                                                          (el disparador del banco), a 1440x900 y 390x844, con capturas para verlas solas
 *   VARIANTES=2 ANCHOS=1440x900 npx tsx scripts-carga/grietas.ts     una variante, un ancho
 *   COSTO=1 npx tsx scripts-carga/grietas.ts               además el costo por cuadro a 1440: el muro con las grietas encendidas de cada
 *                                                          variante contra `?grietas=no` (alternadas, dos veces cada una)
 *   COSTO=1 ROTULO=antes npx tsx scripts-carga/grietas.ts  en la integración SIN B9 (no hay `__grietasDelBanco`): sólo el costo del muro
 *   CTA=1 npx tsx scripts-carga/grietas.ts                 el enganche del home (con B3 y la línea de `enganches.ts`): bajando, al llegar al
 *                                                          CTA se forman; subiendo, se cierran
 *   REDUCIDO=1 npx tsx scripts-carga/grietas.ts            con movimiento reducido: el cristal no se monta (no hay grietas): lo esperado
 *   CONTROL=sin-grietas npx tsx scripts-carga/grietas.ts   el control: la página pide `?grietas=no` (tiene que dar FALLA: «sin-tramos»)
 *
 * Lo que tiene que dar (cada corrida, cada ancho y cada variante):
 * · en la página, el título las dispara (`duena` = `base`) y la luz es el acento claro de web (el token, leído en la página); en el home,
 *   neutra (`ffffff`); compactas abajo de 1024; la rejilla sin entradas de más (`sobran` 0);
 * · los tiempos, medidos por cuadro: formándose 1,5 s (± 0,12), oscuras 1 s (± 0,12), encendiéndose 0,7 s (± 0,12); al volver (el home),
 *   apagándose 0,5 s y cerrándose 1,5 s (± 0,12);
 * · el costo: lo que suma el muro con las grietas encendidas (tiempo de GPU del objeto `cristal · muro`) ≤ 0,5 ms por cuadro a 1440; el
 *   control del instrumento: el perfil tiene que ver el muro en todas las tandas (si no, «control rojo»).
 * Sale a `C:/Users/Valentino/.cache/b4-medicion/b9-grietas/`.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const VARIANTES = (process.env.VARIANTES ?? '1,2,3').split(',').map((v) => v.trim())
const COSTO = process.env.COSTO === '1'
const CTA = process.env.CTA === '1'
const REDUCIDO = process.env.REDUCIDO === '1'
const SIN_GRIETAS = process.env.CONTROL === 'sin-grietas'
const ROTULO = process.env.ROTULO ?? 'despues'
/** En la integración sin B9: sólo el costo del muro (no hay grietas que medir). */
const ANTES = ROTULO === 'antes'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('b9-grietas')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const TOL = 0.12

interface Muestra {
  readonly t: number
  readonly fase: string
  readonly f: number
  readonly l: number
}
interface Estado {
  readonly fase: string
  readonly duena: string | null
  readonly tramos: number
  readonly color: string
  readonly compacta: boolean
  readonly variante: string
  readonly rejilla: { readonly sobran: number; readonly maximoPorCelda: number; readonly entradas: number } | null
}

const estado = (p: Page): Promise<Estado | null> => p.evaluate(() => (window as unknown as { __grietasDelBanco?: { estado: () => Estado } }).__grietasDelBanco?.estado() ?? null)
const disparar = (p: Page, sentido: 'avance' | 'reversa'): Promise<void> => p.evaluate((s) => (window as unknown as { __grietasDelBanco?: { disparar: (x: string) => void } }).__grietasDelBanco?.disparar(s), sentido)
/** Graba el estado en cada cuadro durante `ms` (sin capturas en medio: congelan los pasos de render). */
const grabar = (p: Page, ms: number): Promise<Muestra[]> =>
  p.evaluate(
    (dura) =>
      new Promise<Muestra[]>((r) => {
        const w = window as unknown as { __grietasDelBanco?: { estado: () => { fase: string; formacion: number; luz: number } } }
        const lista: Muestra[] = []
        const t0 = performance.now()
        const paso = (t: number): void => {
          const e = w.__grietasDelBanco?.estado()
          if (e !== undefined) lista.push({ t: (t - t0) / 1000, fase: e.fase, f: e.formacion, l: e.luz })
          if (t - t0 < dura) requestAnimationFrame(paso)
          else r(lista)
        }
        requestAnimationFrame(paso)
      }),
    ms,
  )

/** Cuánto duró cada fase (s): desde la primera muestra en ella hasta la primera de la que sigue. */
function duraciones(m: readonly Muestra[], orden: readonly string[]): Record<string, number> {
  const desde = orden.map((f) => m.find((x) => x.fase === f)?.t ?? Number.NaN)
  const salida: Record<string, number> = {}
  for (let i = 0; i < orden.length - 1; i += 1) salida[orden[i]] = desde[i + 1] - desde[i]
  return salida
}
const IDA = ['formandose', 'oscuras', 'encendiendose', 'encendidas']
const VUELTA = ['apagandose', 'cerrandose', 'cerradas']
const ESPERADO: Record<string, number> = { formandose: 1.5, oscuras: 1, encendiendose: 0.7, apagandose: 0.5, cerrandose: 1.5 }
const tiemposMal = (d: Record<string, number>): string[] => Object.entries(d).filter(([f, s]) => !(Math.abs(s - (ESPERADO[f] ?? Number.NaN)) <= TOL)).map(([f, s]) => `${f}=${s.toFixed(3)}`)

async function abrir(ancho: number, alto: number): Promise<{ readonly p: Page; readonly cerrar: () => Promise<void> }> {
  const perfil = perfilDelBanco('b9-grietas')
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
  await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  return { p, cerrar: () => ctx.close() }
}

const visible = (p: Page): Promise<boolean> => p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const informe: Record<string, unknown> = { rotulo: ROTULO, cuando: new Date().toISOString(), reducido: REDUCIDO, control: process.env.CONTROL ?? null }
  const fallas: string[] = []
  for (const [ancho, alto] of ANCHOS) {
    const { p, cerrar } = await abrir(ancho, alto)
    try {
      for (const variante of ANTES ? [] : VARIANTES) {
        const pedida = SIN_GRIETAS ? 'no' : variante
        const clave = `${String(ancho)}-${variante}`
        // ── La página: el título las dispara al terminar de entrar; se graba desde la carga.
        await p.goto(`${BASE}/v3/pagina-base?grietas=${pedida}`, { waitUntil: 'load', timeout: 240000 })
        if (!(await visible(p))) fallas.push(`${clave}: la pestaña no está a la vista (las mediciones dan cero)`)
        const enLaPagina = await grabar(p, 16000) // [NOCTURNO] 16 s: en el dev, en la primera visita el título llega tarde (las grietas nacieron a los 11,3 s)
        const e = await estado(p)
        if (REDUCIDO) {
          if (e !== null) fallas.push(`${clave}: con movimiento reducido hay cristal (no se esperaba)`)
          informe[`pagina-${clave}`] = { sinCristal: e === null }
          continue
        }
        const token = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-acento-web-claro').trim().toLowerCase().replace('#', ''))
        const d = duraciones(enLaPagina, IDA)
        const mal = tiemposMal(d)
        if (e === null) fallas.push(`${clave}: sin __grietasDelBanco`)
        else {
          if (e.duena !== 'base') fallas.push(`${clave}: el título no las disparó (duena ${String(e.duena)})`)
          if (e.tramos === 0) fallas.push(`${clave}: sin-tramos`)
          if (e.color !== token) fallas.push(`${clave}: la luz no es el acento (${e.color} contra ${token})`)
          if (e.compacta !== ancho < 1024) fallas.push(`${clave}: compacta ${String(e.compacta)} a ${String(ancho)}`)
          if ((e.rejilla?.sobran ?? 0) > 0) fallas.push(`${clave}: la rejilla no alcanzó`)
        }
        if (mal.length > 0) fallas.push(`${clave}: tiempos en la página ${mal.join(', ')}`)
        await p.screenshot({ path: path.join(SALIDA, `pagina-${clave}-encendidas.png`) })
        informe[`pagina-${clave}`] = { duraciones: d, estado: e, token }
        // ── El home: neutras, con el disparador del banco (el enganche del CTA se prueba con CTA=1); ida y vuelta.
        await p.goto(`${BASE}/v3?grietas=${pedida}`, { waitUntil: 'load', timeout: 240000 })
        await dormir(4000)
        await disparar(p, 'avance')
        const ida = await grabar(p, 4500)
        const eh = await estado(p)
        await p.screenshot({ path: path.join(SALIDA, `home-${clave}-encendidas.png`) })
        await disparar(p, 'reversa')
        const vuelta = await grabar(p, 2800)
        const dIda = duraciones(ida, IDA)
        const dVuelta = duraciones(vuelta, VUELTA)
        const malHome = [...tiemposMal(dIda), ...tiemposMal(dVuelta)]
        if (eh === null || eh.color !== 'ffffff' || eh.duena !== 'home') fallas.push(`${clave}: en el home no son neutras (${JSON.stringify(eh)})`)
        if (eh !== null && eh.tramos === 0) fallas.push(`${clave}: sin-tramos en el home`)
        if (malHome.length > 0) fallas.push(`${clave}: tiempos en el home ${malHome.join(', ')}`)
        informe[`home-${clave}`] = { ida: dIda, vuelta: dVuelta, estado: eh }
        console.log(clave, JSON.stringify({ pagina: d, ida: dIda, vuelta: dVuelta }))
      }

      // ── El enganche del CTA del home (B3): bajando de a poco hasta que se forman; después, subiendo hasta que se cierran.
      if (CTA && !REDUCIDO && !ANTES) {
        await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 240000 })
        await dormir(4000)
        const bajar = async (paso: number): Promise<number | null> => {
          for (let k = 0; k < 600; k += 1) {
            await p.evaluate((d) => window.scrollBy({ top: d, behavior: 'instant' }), paso)
            await dormir(70)
            const e = await estado(p)
            const listo = paso > 0 ? e !== null && e.duena === 'home' && e.fase !== 'cerradas' : e !== null && (e.fase === 'apagandose' || e.fase === 'cerrandose' || e.fase === 'cerradas')
            if (listo) return p.evaluate(() => scrollY)
          }
          return null
        }
        const enLaIda = await bajar(120)
        await dormir(4000)
        await p.screenshot({ path: path.join(SALIDA, `cta-${String(ancho)}-encendidas.png`) })
        const enLaVuelta = enLaIda === null ? null : await bajar(-120)
        if (enLaIda === null) fallas.push(`${String(ancho)}: el CTA del home no las dispara (¿está la línea en enganches.ts?)`)
        if (enLaIda !== null && enLaVuelta === null) fallas.push(`${String(ancho)}: subiendo no se cierran`)
        informe[`cta-${String(ancho)}`] = { enLaIda, enLaVuelta }
      }

      // ── El costo por cuadro, a 1440: el muro con las grietas encendidas contra `no`, alternadas.
      if (COSTO && ancho >= 1024 && !REDUCIDO) {
        const tandas: Record<string, number[]> = {}
        let controlRojo = false
        for (const vuelta of [0, 1]) {
          for (const v of ANTES ? ['antes'] : [...VARIANTES, 'no']) {
            await p.goto(`${BASE}/v3/pagina-base?grietas=${v}`, { waitUntil: 'load', timeout: 240000 })
            await dormir(9000)
            const medida = await p.evaluate(async () => {
              const g = (window as unknown as { __gpuDelBanco?: { extension: boolean; medir: (n: number, m: string) => Promise<{ pasadas: Record<string, { ms: number; veces: number }> } | null> } }).__gpuDelBanco
              if (g === undefined || !g.extension) return null
              const o = await g.medir(60, 'objetos')
              return o?.pasadas['cristal · muro']?.ms ?? -1
            })
            if (medida === null || medida < 0) controlRojo = true
            ;(tandas[v] ??= []).push(medida ?? Number.NaN)
            console.log('costo', vuelta, v, medida)
          }
        }
        const media = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length)
        const sin = media(tandas.no ?? [])
        const suma: Record<string, number> = {}
        for (const v of ANTES ? [] : VARIANTES) {
          suma[v] = media(tandas[v] ?? []) - sin
          if (!(suma[v] <= 0.5)) fallas.push(`costo: la ${v} suma ${suma[v].toFixed(3)} ms por cuadro (> 0,5)`)
        }
        if (controlRojo) fallas.push('CONTROL ROJO: el perfil no ve el muro del cristal (sin extensión o sin el objeto)')
        informe[`costo-${String(ancho)}`] = { tandas, sin, suma, controlRojo }
      }
    } finally {
      await cerrar()
    }
  }
  informe.fallas = fallas
  const archivo = path.join(SALIDA, `grietas-${ROTULO}.json`)
  writeFileSync(archivo, JSON.stringify(informe, null, 2))
  console.log(fallas.length === 0 ? 'OK' : `FALLA:\n  ${fallas.join('\n  ')}`, '→', archivo)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
