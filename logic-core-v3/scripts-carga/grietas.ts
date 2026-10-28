/**
 * [C2-31g] LAS GRIETAS DEL CRISTAL, CADA CELDA POR DENTRO, EN EL SITIO (`docs/rediseno/SPRINT-C2-31-grietas.md`) — contra el dev (`BASE`),
 * con el Chrome del sistema a la vista, `/api/` bloqueado y el banco de la escena (`__grietasDelBanco`, `__gpuDelBanco`). SIN CORRER
 * (lo corre el orquestador). Perfil y salida por `limpieza-del-banco.ts` (con `BANCO_FOTOS`, las fotos van ahí).
 *
 *   npx tsx scripts-carga/grietas.ts                          a 1440x900: el home (el CTA) y /v3/pagina-base, con `centro` y con `borde`
 *   LUGARES=pagina ORIGENES=borde npx tsx scripts-carga/grietas.ts     un lugar, un origen
 *   CONTROL=general npx tsx scripts-carga/grietas.ts          una grieta general para todo el muro (el defecto del sitio, por
 *                                                             `window.__defectosDeLasGrietas`): tiene que FALLAR «por celda»
 *   CONTROL=brillo-en-el-home npx tsx scripts-carga/grietas.ts   el home con brillo: tiene que FALLAR «sin brillo en el home»
 *
 * Por lugar y origen:
 *   1. EL DISPARO DE VERDAD: la página las pide cuando el título terminó de entrar; el home, bajando hasta el CTA (el enganche de B3).
 *      Se graba el ciclo por cuadro (las fases y las uniformes): en el home la luz de la uniforme queda en 0 todo el ciclo; en la página
 *      llega a 1. Las duraciones de las fases se informan (el reloj es el de B9).
 *   2. LAS FOTOS: el reloj fijado por el banco (`fijar`) en 0, 25, 50, 75 y 100 % de la formación, otra con la luz (100 % encendidas) y
 *      otra en 0 al final (lo que se mueve solo entre las dos de 0 es RUIDO y no cuenta).
 *   3. LA MEDIDA EN LA FOTO: las celdas del muro (`celdasDelMuro`) proyectadas con la cámara del cuadro (`vista`); en cada una, los píxeles
 *      que cambiaron contra la foto de 0 (la grieta) y su camino del centro al borde (el peso del centro en su triángulo del abanico):
 *      · POR CELDA: en las celdas a la vista, la grieta es ≥ 1,8 veces más densa en SU centro (s < 0,12) que en toda la celda, en ≥ 70 %;
 *      · PROGRESA: cada momento tiene más grieta que el anterior, y casi nada (≤ 10 %) más allá del frente (con `centro`, camino ≤ la
 *        formación + 0,15; con `borde`, ≥ 1 − la formación − 0,15);
 *      · SIN BRILLO EN EL HOME: con la luz, la grieta no se aclara (≤ 2 niveles en promedio); en la página sí (≥ 6: si no, el
 *        instrumento no ve la luz y la corrida es «control rojo»).
 *   4. EL COSTO por cuadro del muro (`cristal · muro`, GPU por objeto, 60 cuadros): formadas (y encendidas en la página) contra cerradas,
 *      alternadas dos veces; lo que suman las grietas, ≤ 0,1 ms (el muro de B9: ≤ 0,06 ms). Si el perfil no ve el muro, «control rojo».
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'

import { CRISTAL } from '../src/app/v3/_lib/escena/cristal/cristal'
import { celdasDelMuro } from '../src/app/v3/_lib/escena/cristal/muro'
import { FLOOR_Y } from '../src/app/v3/_lib/escena/probeScene'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const [ANCHO, ALTO] = (process.env.CUADRO ?? '1440x900').split('x').map(Number)
const LUGARES = (process.env.LUGARES ?? 'home,pagina').split(',').map((x) => x.trim()) as ('home' | 'pagina')[]
const ORIGENES = (process.env.ORIGENES ?? 'centro,borde').split(',').map((x) => x.trim())
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('c2-31-grietas')
const MOMENTOS = [0, 0.25, 0.5, 0.75, 1] as const
/** Cuánto tiene que cambiar la luminancia de un píxel (0 a 255) para contar como grieta. */
const UMBRAL = 14
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
type P = readonly [number, number]

interface Estado {
  readonly fase: string
  readonly duena: string | null
  readonly origen: string
  readonly brillo: boolean
  readonly color: string
  readonly uniformes: readonly [number, number, number, number]
}
type Banco = Window & {
  __grietasDelBanco?: {
    estado: () => Estado
    fijar: (f: { formacion: number; luz: number } | null) => void
    vista: () => number[] | null
  }
  __gpuDelBanco?: { extension: boolean; medir: (n: number, m: string) => Promise<{ pasadas: Record<string, { ms: number }> } | null> }
}

const estado = (p: Page): Promise<Estado | null> => p.evaluate(() => (window as unknown as Banco).__grietasDelBanco?.estado() ?? null)

/** Espera el disparo (la dueña es `duena` y ya no están cerradas) y graba el ciclo por cuadro durante `ms`. */
interface MuestraDelCiclo {
  readonly t: number
  readonly fase: string
  readonly x: number
  readonly y: number
}
const dispararYGrabar = (p: Page, duena: string, ms: number): Promise<MuestraDelCiclo[] | null> =>
  p.evaluate(
    ({ duena, ms }) =>
      new Promise<MuestraDelCiclo[] | null>((resolver) => {
        // [C2-31g intento 2] El banco del cristal se lee en CADA cuadro: en la página la escena se monta después del `load` (leído una vez
        // al empezar quedaba `undefined` para siempre y el disparo de la página nunca se veía: «no se dispararon (dueña base)»).
        const lista: MuestraDelCiclo[] = []
        const t0 = performance.now()
        let desde = -1
        const paso = (t: number): void => {
          const e = (window as unknown as Banco).__grietasDelBanco?.estado()
          if (desde < 0 && e !== undefined && e.duena === duena && e.fase !== 'cerradas') desde = t
          if (desde >= 0 && e !== undefined) lista.push({ t: (t - desde) / 1000, fase: e.fase, x: e.uniformes[0], y: e.uniformes[1] })
          if (desde < 0 && t - t0 > 40000) resolver(null)
          else if (desde >= 0 && t - desde > ms) resolver(lista)
          else requestAnimationFrame(paso)
        }
        requestAnimationFrame(paso)
      }),
    { duena, ms },
  )

/** Cuánto duró cada fase (s): desde la primera muestra en ella hasta la primera de la que sigue. */
function duraciones(m: readonly { readonly t: number; readonly fase: string }[]): Record<string, number> {
  const orden = ['formandose', 'oscuras', 'encendiendose', 'encendidas']
  const desde = orden.map((f) => m.find((x) => x.fase === f)?.t ?? Number.NaN)
  return Object.fromEntries(orden.slice(0, -1).map((f, i) => [f, +(desde[i + 1] - desde[i]).toFixed(3)]))
}

/** El home: hasta el comienzo de «Por qué develOP» y después de a poco, hasta que el CTA las dispara (el enganche cuenta los cruces). */
async function bajarHastaElCta(p: Page): Promise<boolean> {
  const tope = await p.evaluate(() => {
    const s = document.getElementById('por-que-develop')
    return s === null ? 0 : Math.max(0, s.getBoundingClientRect().top + scrollY - innerHeight)
  })
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), tope)
  await dormir(1500)
  for (let k = 0; k < 500; k += 1) {
    const e = await estado(p)
    if (e !== null && e.duena === 'home' && e.fase !== 'cerradas') return true
    await p.evaluate(() => window.scrollBy({ top: 120, behavior: 'instant' }))
    await dormir(80)
  }
  return false
}

async function foto(p: Page, nombre: string, formacion: number, luz: number): Promise<{ readonly archivo: string; readonly x: number }> {
  await p.evaluate((f) => (window as unknown as Banco).__grietasDelBanco?.fijar(f), { formacion, luz })
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))))
  await dormir(150)
  const e = await estado(p)
  const archivo = path.join(SALIDA, `${nombre}.png`)
  await p.screenshot({ path: archivo })
  // La captura congela los pasos de render (CLAUDE.md, «Page.captureScreenshot»): volver a emular el cuadro los destraba.
  await p.setViewportSize({ width: ANCHO, height: ALTO })
  return { archivo, x: e?.uniformes[0] ?? Number.NaN }
}

// ── La medida en la foto ────────────────────────────────────────────────────

interface Imagen {
  readonly lum: Float32Array
  readonly ancho: number
  readonly alto: number
}
async function leerFoto(archivo: string): Promise<Imagen> {
  const { data, info } = await sharp(archivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const lum = new Float32Array(info.width * info.height)
  for (let i = 0; i < lum.length; i += 1) lum[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]
  return { lum, ancho: info.width, alto: info.height }
}
const cambio = (a: Imagen, b: Imagen): Uint8Array => Uint8Array.from(a.lum, (x, i) => (Math.abs(x - b.lum[i]) > UMBRAL ? 1 : 0))

interface CeldaEnLaFoto {
  readonly centro: P
  readonly vertices: readonly P[]
}
/** Las celdas proyectadas con la vista de la cámara (por columnas) sobre el lienzo; sólo las que están enteras delante de la cámara. */
function celdasEnLaFoto(m: readonly number[], lienzo: { readonly x: number; readonly y: number; readonly w: number; readonly h: number }): CeldaEnLaFoto[] {
  const R = CRISTAL.muro.radio
  const proyectar = (u: number, v: number): P | null => {
    const [x, y, z] = [Math.sin(u / R) * R, FLOOR_Y + v, Math.cos(u / R) * R]
    const w = m[3] * x + m[7] * y + m[11] * z + m[15]
    if (w <= 0.05) return null
    const cx = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w
    const cy = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w
    return [lienzo.x + ((cx + 1) / 2) * lienzo.w, lienzo.y + ((1 - cy) / 2) * lienzo.h]
  }
  const salida: CeldaEnLaFoto[] = []
  for (const c of celdasDelMuro()) {
    const n = c.poligono.length / 2
    const u = Array.from({ length: n }, (_, k) => c.poligono[k * 2])
    const v = Array.from({ length: n }, (_, k) => c.poligono[k * 2 + 1])
    const centro = proyectar(u.reduce((s, x) => s + x, 0) / n, v.reduce((s, x) => s + x, 0) / n)
    const vertices = u.map((x, k) => proyectar(x, v[k]))
    if (centro === null || vertices.some((x) => x === null)) continue
    salida.push({ centro, vertices: vertices as P[] })
  }
  return salida
}

interface Medida {
  readonly validos: number
  readonly grieta: number
  readonly centro: number
  readonly grietaEnElCentro: number
  /** El camino (0 el centro, 1 el borde) de cada píxel de grieta. */
  readonly caminos: number[]
}
/** En una celda: los píxeles que no son ruido, los de grieta y en su centro (camino < 0,12), con el camino de cada uno. */
function medirLaCelda(c: CeldaEnLaFoto, grieta: Uint8Array, ruido: Uint8Array, ancho: number, alto: number): Medida {
  const xs = c.vertices.map((p) => p[0])
  const ys = c.vertices.map((p) => p[1])
  const caminos: number[] = []
  let validos = 0
  let g = 0
  let centro = 0
  let grietaEnElCentro = 0
  for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(alto - 1, Math.ceil(Math.max(...ys))); y += 1) {
    for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(ancho - 1, Math.ceil(Math.max(...xs))); x += 1) {
      const i = y * ancho + x
      if (ruido[i] === 1) continue
      for (let k = 0; k < c.vertices.length; k += 1) {
        const a: P = [c.vertices[k][0] - c.centro[0], c.vertices[k][1] - c.centro[1]]
        const b: P = [c.vertices[(k + 1) % c.vertices.length][0] - c.centro[0], c.vertices[(k + 1) % c.vertices.length][1] - c.centro[1]]
        const q: P = [x + 0.5 - c.centro[0], y + 0.5 - c.centro[1]]
        const det = a[0] * b[1] - a[1] * b[0]
        if (Math.abs(det) < 1e-9) continue
        const wa = (q[0] * b[1] - q[1] * b[0]) / det
        const wb = (a[0] * q[1] - a[1] * q[0]) / det
        if (wa < 0 || wb < 0 || wa + wb > 1) continue
        const s = wa + wb
        validos += 1
        if (s < 0.12) centro += 1
        if (grieta[i] === 1) {
          g += 1
          caminos.push(s)
          if (s < 0.12) grietaEnElCentro += 1
        }
        break
      }
    }
  }
  return { validos, grieta: g, centro, grietaEnElCentro, caminos }
}

const juntaEnElCentro = (c: Medida): number => c.grietaEnElCentro / Math.max(1, c.centro) / Math.max(1e-9, c.grieta / Math.max(1, c.validos))
const promedio = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length)

async function principal(): Promise<void> {
  const informe: Record<string, unknown> = { cuando: new Date().toISOString(), cuadro: `${String(ANCHO)}x${String(ALTO)}`, control: CONTROL || null }
  const fallas: string[] = []
  const rojos: string[] = []
  for (const lugar of LUGARES) {
    for (const origen of ORIGENES) {
      const clave = `${lugar}-${origen}`
      const ctx = await chromium.launchPersistentContext(perfilDelBanco('c2-31-grietas'), {
        executablePath: CHROME,
        headless: false,
        viewport: { width: ANCHO, height: ALTO },
        deviceScaleFactor: 1,
        args: ['--force_high_performance_gpu', `--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
      })
      const defecto = CONTROL === 'general' || CONTROL === 'brillo-en-el-home' ? `window.__defectosDeLasGrietas = '${CONTROL}';` : ''
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; ${defecto} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      await ctx.route('**/api/**', (r) => r.fulfill({ status: 204, body: '' }))
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      try {
        // ── 1 · El disparo de verdad y el ciclo.
        await p.goto(lugar === 'home' ? `${BASE}/v3?grietas=${origen}` : `${BASE}/v3/pagina-base?grietas=${origen}`, { waitUntil: 'load', timeout: 240000 })
        if (!(await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0))) fallas.push(`${clave}: la pestaña no está a la vista (las mediciones dan cero)`)
        if (lugar === 'home') {
          await dormir(4000)
          if (!(await bajarHastaElCta(p))) fallas.push(`${clave}: el CTA del home no las dispara`)
        }
        const ciclo = await dispararYGrabar(p, lugar === 'home' ? 'home' : 'base', 4200)
        const e = await estado(p)
        if (ciclo === null || e === null) {
          fallas.push(`${clave}: no se dispararon (${e === null ? 'sin __grietasDelBanco' : `dueña ${String(e.duena)}, fase ${e.fase}`})`)
          continue
        }
        if (e.origen !== origen) fallas.push(`${clave}: el origen es ${e.origen}`)
        const luzMaxima = Math.max(...ciclo.map((x) => x.y))
        if (lugar === 'home' && (luzMaxima > 0 || e.brillo)) fallas.push(`${clave}: SIN BRILLO EN EL HOME: la luz de la uniforme llegó a ${luzMaxima.toFixed(2)} (brillo ${String(e.brillo)})`)
        if (lugar === 'pagina' && luzMaxima < 0.99) fallas.push(`${clave}: en la página la luz no llegó (${luzMaxima.toFixed(2)})`)
        informe[`${clave}-ciclo`] = { duraciones: duraciones(ciclo), luzMaxima, estado: e }

        // ── 2 · Las fotos, con el reloj fijado (la cámara quieta: sin scroll ni mouse).
        await dormir(800)
        const vista = await p.evaluate(() => (window as unknown as Banco).__grietasDelBanco?.vista() ?? null)
        const lienzo = await p.evaluate(() => {
          const c = [...document.querySelectorAll('canvas')].map((x) => x.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0]
          return c === undefined ? null : { x: c.left, y: c.top, w: c.width, h: c.height }
        })
        const fotos: { readonly archivo: string; readonly x: number }[] = []
        for (const f of MOMENTOS) fotos.push(await foto(p, `${clave}-${String(Math.round(f * 100))}`, f, 0))
        const conLuz = await foto(p, `${clave}-100-luz`, 1, 1)
        const otraDeCero = await foto(p, `${clave}-0-otra`, 0, 0)
        const vistaDespues = await p.evaluate(() => (window as unknown as Banco).__grietasDelBanco?.vista() ?? null)
        if (vista === null || lienzo === null || vistaDespues === null) {
          fallas.push(`${clave}: sin la vista de la cámara o sin lienzo`)
          continue
        }
        if (vista.some((x, i) => Math.abs(x - vistaDespues[i]) > 1e-4)) rojos.push(`${clave}: la cámara se movió durante las fotos (la medida no vale)`)

        // ── 3 · La medida en la foto.
        const [cero, ...resto] = await Promise.all([fotos[0], ...fotos.slice(1), conLuz, otraDeCero].map((x) => leerFoto(x.archivo)))
        const ruido = cambio(cero, resto[resto.length - 1])
        const celdas = celdasEnLaFoto(vista, lienzo)
        const porMomento = resto.slice(0, 4).map((img) => {
          const g = cambio(img, cero)
          return celdas.map((c) => medirLaCelda(c, g, ruido, cero.ancho, cero.alto))
        })
        const enteras = porMomento[3]
        const aLaVista = enteras.map((c, i) => ({ c, i })).filter(({ c }) => c.validos >= 400 && c.grieta / c.validos >= 0.03)
        const juntas = aLaVista.map(({ c }) => juntaEnElCentro(c))
        const porCelda = aLaVista.length >= 4 && juntas.filter((j) => j >= 1.8).length >= 0.7 * aLaVista.length
        if (!porCelda) fallas.push(`${clave}: POR CELDA: ${String(juntas.filter((j) => j >= 1.8).length)} de ${String(aLaVista.length)} celdas a la vista con la grieta juntándose en su centro (hace falta el 70 %)`)
        const cuentas = porMomento.map((l) => aLaVista.reduce((s, { i }) => s + l[i].grieta, 0))
        const fuera = porMomento.slice(0, 3).map((l, k) => {
          const x = fotos[k + 1].x
          const caminos = aLaVista.flatMap(({ i }) => l[i].caminos)
          const pasados = caminos.filter((s) => (origen === 'borde' ? s < 1 - x - 0.15 : s > x + 0.15)).length
          return pasados / Math.max(1, caminos.length)
        })
        if (!cuentas.every((n, k) => k === 0 || n > cuentas[k - 1])) fallas.push(`${clave}: PROGRESA: la grieta no crece de un momento al otro (${cuentas.join(' → ')})`)
        if (fuera.some((x) => x > 0.1)) fallas.push(`${clave}: EL SENTIDO: grieta más allá del frente (${fuera.map((x) => `${(100 * x).toFixed(0)} %`).join(', ')})`)
        // Sin brillo en el home: con la luz, los píxeles de la grieta no se aclaran; en la página, sí (el control del instrumento).
        const grietaEntera = cambio(resto[3], cero)
        const luzMedia = promedio(Array.from(grietaEntera.keys()).filter((i) => grietaEntera[i] === 1 && ruido[i] === 0).map((i) => resto[4].lum[i] - resto[3].lum[i]))
        if (lugar === 'home' && luzMedia > 2) fallas.push(`${clave}: SIN BRILLO EN EL HOME: con la luz, la grieta se aclara ${luzMedia.toFixed(1)} niveles`)
        if (lugar === 'pagina' && luzMedia < 6) rojos.push(`${clave}: la luz de la página no se ve en la foto (${luzMedia.toFixed(1)} niveles): el instrumento no ve el brillo`)
        informe[`${clave}-foto`] = { celdas: celdas.length, aLaVista: aLaVista.length, juntaEnElCentro: juntas.map((j) => +j.toFixed(2)), cuentas, fueraDelFrente: fuera, luzMedia, formacionQueSeVe: fotos.map((x) => x.x) }

        // ── 4 · El costo por cuadro del muro: formadas (encendidas en la página) contra cerradas, alternadas.
        const tandas: Record<'cerradas' | 'formadas', number[]> = { cerradas: [], formadas: [] }
        for (const vuelta of [0, 1]) {
          for (const como of ['cerradas', 'formadas'] as const) {
            await p.evaluate((f) => (window as unknown as Banco).__grietasDelBanco?.fijar(f), como === 'cerradas' ? { formacion: 0, luz: 0 } : { formacion: 1, luz: 1 })
            await dormir(700)
            const ms = await p.evaluate(async () => {
              const g = (window as unknown as Banco).__gpuDelBanco
              if (g === undefined || !g.extension) return null
              const o = await g.medir(60, 'objetos')
              return o?.pasadas['cristal · muro']?.ms ?? -1
            })
            if (ms === null || ms < 0) rojos.push(`${clave}: el perfil no ve el muro del cristal (vuelta ${String(vuelta)}, ${como})`)
            else tandas[como].push(ms)
          }
        }
        const suma = promedio(tandas.formadas) - promedio(tandas.cerradas)
        if (tandas.formadas.length > 0 && !(suma <= 0.1)) fallas.push(`${clave}: EL COSTO: las grietas suman ${suma.toFixed(3)} ms por cuadro al muro (> 0,1)`)
        informe[`${clave}-costo`] = { tandas, muroConGrietasMs: +promedio(tandas.formadas).toFixed(4), sumanMs: +suma.toFixed(4) }
        console.log(clave, JSON.stringify({ ciclo: informe[`${clave}-ciclo`], foto: informe[`${clave}-foto`], costo: informe[`${clave}-costo`] }))
      } finally {
        await ctx.close()
      }
    }
  }
  informe.fallas = fallas
  informe.controlRojo = rojos
  const archivo = path.join(SALIDA, `grietas${CONTROL ? `-${CONTROL}` : ''}.json`)
  writeFileSync(archivo, JSON.stringify(informe, null, 2))
  if (rojos.length > 0) console.log(`CONTROL ROJO:\n  ${rojos.join('\n  ')}`)
  console.log(fallas.length === 0 ? 'OK' : `FALLA:\n  ${fallas.join('\n  ')}`, '→', archivo)
  if (fallas.length > 0 || rojos.length > 0) process.exitCode = 1
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
