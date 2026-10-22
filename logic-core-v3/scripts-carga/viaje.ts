/**
 * [B12b] EL VIAJE DESDE EL CTA DE UN SERVICIO DEL HOME HASTA SU PÁGINA — el Chrome del sistema a la vista contra el dev o el build (`BASE`),
 * `/api/` bloqueado, el patrón de `velo.ts`. Por ancho: el home, la sección Servicios en el primer servicio (Desarrollo web), el puntero
 * encima de su CTA (la precarga) y un clic; el viaje hasta `/v3/pagina-base` (hoy, el destino de los tres).
 *
 *   BASE=http://localhost:3004 ANCHOS=1440,390 npx tsx scripts-carga/viaje.ts
 *
 * El criterio, por ancho:
 *   · 0 cuadros en blanco: un cuadro del screencast (casi, 97 %) de un solo color CLARO (el papel o el blanco) entre el clic y la página
 *     quieta (+450 ms). Los oscuros planos se informan (la escena de noche puede ser casi plana en el teléfono), no cuentan;
 *   · la escena cubrió (el velo en `data-modo="viaje"`, nunca la banda) y el cambio de ruta pasó con el papel ya arriba y la cámara llegada
 *     (`__viajeDelBanco`: la cámara en 1 y la noche en 1 en el cuadro del cambio);
 *   · la llegada en la composición inicial: el centro del logo (la silueta, `__siluetaDelBanco`) a ± 1 % del centro del hueco que deja el
 *     DOM de la intro, medido EN el cuadro en que la página aparece (`v3:velo-destapa`) y otra vez 1,5 s después (asentada). Si el logo es más
 *     ancho que el cuadro (el teléfono), su x no se mide (como `composicion.ts`). Abajo de 1024 se informa: el hueco va debajo del título y
 *     el marco del viaje no lo tiene (un reencuadre corto al llegar, declarado en el SPRINT);
 *   · los sonidos: uno al salir (cuando el papel empieza a subir) y otro al llegar (cuando aparece la página), pedidos al bus una vez cada
 *     uno y en ese orden (`__viajeDelBanco().sonidos`). Con el sonido apagado (el defecto) el bus no tiene motor: no suena nada;
 *   · el total, del clic a la página quieta (un dato: ~1,5 s de viaje + la espera a la escena + el montaje).
 *
 *   CONTROL=velo …       `?viaje=velo`: el velo de siempre (la banda): «la escena cubrió» tiene que dar FALLA;
 *   CONTROL=sin-tapar …  la página nueva entra a la vista con el scroll del home (`paginaTapada.ts`): cuadros en blanco (el papel del fondo);
 *   CONTROL=sin-hueco …  sin el marco del viaje (`HuecoDelViaje`): la cámara llega con el logo centrado y se corre después; la llegada, FALLA.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'
import sharp from 'sharp'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'velo', 'sin-tapar', 'sin-hueco'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: velo, sin-tapar o sin-hueco`)
const DESTINO = '/v3/pagina-base'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/viaje')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Registro {
  readonly t: number
  readonly ruta: string
  readonly fase: string
  readonly modo: string
  readonly viaje: string
  readonly camara: number
  readonly noche: number
}

interface Llegada {
  readonly cuando: 'destapa' | 'asentada'
  readonly logo: { readonly izq: number; readonly der: number; readonly arriba: number; readonly abajo: number } | null
  readonly hueco: { readonly izq: number; readonly der: number; readonly arriba: number; readonly abajo: number } | null
  readonly ancho: number
  readonly alto: number
}

/** En la página (sobrevive a la navegación cliente): un registro por cuadro y la llegada medida en el cuadro del destape. */
const GRABAR = `(() => {
  window.__name = window.__name || ((f) => f)
  const log = (window.__cuadrosDelViaje = [])
  const cuadro = () => {
    const v = document.querySelector('[data-pieza="velo-de-navegacion"]')
    const b = window.__viajeDelBanco ? window.__viajeDelBanco() : null
    log.push({ t: performance.timeOrigin + performance.now(), ruta: location.pathname, fase: v ? v.getAttribute('data-fase') : 'sin velo', modo: v ? v.getAttribute('data-modo') || '' : '', viaje: b ? b.fase : '', camara: b ? b.camara : -1, noche: b ? b.noche : -1 })
    if (log.length > 4000) log.splice(0, 2000)
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
  const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom } }
  const silueta = () => {
    const s = window.__siluetaDelBanco ? window.__siluetaDelBanco(4) : null
    if (!s || s.ocupadas.length === 0) return null
    let [izq, der, arriba, abajo] = [Infinity, -Infinity, Infinity, -Infinity]
    for (const i of s.ocupadas) { const [x, y] = [(i % s.cols) * s.celda, Math.floor(i / s.cols) * s.celda]; izq = Math.min(izq, x); der = Math.max(der, x + s.celda); arriba = Math.min(arriba, y); abajo = Math.max(abajo, y + s.celda) }
    return { izq, der, arriba, abajo }
  }
  const llegadas = (window.__llegadasDelViaje = [])
  const medir = (cuando) => llegadas.push({ cuando, logo: silueta(), hueco: caja(document.querySelector('[data-intro-de-pagina] [data-parte="hueco-del-logo"]')), ancho: innerWidth, alto: innerHeight })
  addEventListener('v3:velo-destapa', () => { medir('destapa'); setTimeout(() => medir('asentada'), 1500) })
})()`

interface Foto {
  readonly t: number
  readonly plano: number
  readonly color: readonly [number, number, number]
  readonly jpeg: Buffer
}

/** Qué fracción del cuadro es de un solo color (cuantizado), y cuál (la de `velo.ts`). */
async function planitud(jpeg: Buffer): Promise<{ readonly plano: number; readonly color: readonly [number, number, number] }> {
  const { data, info } = await sharp(jpeg).resize(96, 60, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const cuenta = new Map<number, number>()
  const n = info.width * info.height
  for (let i = 0; i < n; i += 1) {
    const k = ((data[i * 3] ?? 0) >> 3) * 1024 + ((data[i * 3 + 1] ?? 0) >> 3) * 32 + ((data[i * 3 + 2] ?? 0) >> 3)
    cuenta.set(k, (cuenta.get(k) ?? 0) + 1)
  }
  let [mejor, clave] = [0, 0]
  for (const [k, c] of cuenta) {
    if (c > mejor) [mejor, clave] = [c, k]
  }
  return { plano: mejor / n, color: [((clave >> 10) & 31) * 8 + 4, ((clave >> 5) & 31) * 8 + 4, (clave & 31) * 8 + 4] }
}

const esClaro = (c: readonly [number, number, number]): boolean => c.every((v) => v > 200)

/** El CTA del primer servicio que está a la vista (hay uno por panel, por pantalla suelta y en el recomendador). */
async function ctaALaVista(p: Page): Promise<{ readonly x: number; readonly y: number } | null> {
  return p.evaluate(() => {
    for (const el of document.querySelectorAll('[data-viaje-del-servicio="web"]')) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    return null
  })
}

/** Al primer servicio: desde 1024 la barra viaja a Servicios y una muesca entra Desarrollo web; abajo, su pantalla suelta (sin Lenis). */
async function alPrimerServicio(p: Page, movil: boolean): Promise<void> {
  if (movil) {
    await p.evaluate(() => document.querySelector('[data-pieza="pantalla-de-servicio"]')?.scrollIntoView({ block: 'center', behavior: 'instant' }))
    await dormir(2500)
    return
  }
  const caja = await p.locator('[data-pieza="barra"] [data-nav-id="servicios"]').first().boundingBox()
  if (caja === null) throw new Error('no está «Servicios» en la barra')
  await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2)
  await p.mouse.down()
  await p.mouse.up()
  await dormir(4000)
  await p.mouse.move(400, 450)
  // [NOCTURNO] El viaje de la barra puede dejar la sección antes de la entrada: de a una muesca (cada una es un paso), hasta web.
  for (let i = 0; i < 3 && (await ctaALaVista(p)) === null; i++) {
    await p.mouse.wheel(0, 120)
    await dormir(3500)
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean }[] = []
  for (const ancho of ANCHOS) {
    const alto = ancho < 1024 ? 844 : 900
    const movil = ancho < 1024
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/viaje-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: movil,
      hasTouch: movil,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__defectosDelViaje = ${JSON.stringify(CONTROL === 'velo' ? '' : CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const cdp: CDPSession = await ctx.newCDPSession(p)
      await p.goto(`${BASE}/v3${CONTROL === 'velo' ? '?viaje=velo' : ''}`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      const placa = await p.evaluate(() => {
        const gl = document.createElement('canvas').getContext('webgl')
        const info = gl?.getExtension('WEBGL_debug_renderer_info')
        return gl === null || gl === undefined || info === null || info === undefined ? 'sin WebGL' : String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      })
      console.log(`·     ${String(ancho)} · la placa: ${placa}`)
      await alPrimerServicio(p, movil)
      const cta = await ctaALaVista(p)
      if (cta === null) throw new Error(`${String(ancho)}: ningún CTA de web a la vista`)
      await p.mouse.move(cta.x, cta.y)
      await dormir(1500)
      await p.evaluate(GRABAR)
      // El screencast, del clic a la página quieta.
      const pendientes: Promise<Foto>[] = []
      const alCuadro = (params: { data: string; sessionId: number }): void => {
        void cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => undefined)
        const t = Date.now()
        const jpeg = Buffer.from(params.data, 'base64')
        pendientes.push(planitud(jpeg).then((x) => ({ t, jpeg, ...x })))
      }
      cdp.on('Page.screencastFrame', alCuadro)
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 })
      await dormir(300)
      const alClic = await p.evaluate(() => performance.timeOrigin + performance.now())
      await p.mouse.down()
      await p.mouse.up()
      // El puntero quieto en el medio (la cámara sigue al mouse: la llegada se mide sin su desplazamiento).
      await p.mouse.move(ancho / 2, alto / 2, { steps: 8 })
      const t0 = Date.now()
      let visto = false
      while (Date.now() - t0 < 10000) {
        const e = await p.evaluate(() => {
          const log = (window as unknown as { __cuadrosDelViaje?: { fase: string; ruta: string }[] }).__cuadrosDelViaje ?? []
          const u = log[log.length - 1]
          return { fase: u?.fase ?? '', ruta: u?.ruta ?? '', alguna: log.some((r) => r.fase !== 'quieto') }
        })
        if (e.alguna) visto = true
        if (visto && e.fase === 'quieto' && e.ruta === DESTINO) break
        await dormir(50)
      }
      await dormir(1800)
      await cdp.send('Page.stopScreencast')
      cdp.off('Page.screencastFrame', alCuadro)
      const fotos = await Promise.all(pendientes)
      const registros = await p.evaluate(() => [...((window as unknown as { __cuadrosDelViaje?: Registro[] }).__cuadrosDelViaje ?? [])])
      const llegadas = await p.evaluate(() => [...((window as unknown as { __llegadasDelViaje?: Llegada[] }).__llegadasDelViaje ?? [])])
      const sonidos = await p.evaluate(() => (window as unknown as { __viajeDelBanco?: () => { sonidos: { cual: string; t: number }[] } }).__viajeDelBanco?.().sonidos ?? [])
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-llegada${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
      writeFileSync(path.join(SALIDA, `crudo-${String(ancho)}${CONTROL === '' ? '' : `-${CONTROL}`}.json`), JSON.stringify({ alClic, registros: registros.filter((r) => r.t >= alClic - 50), llegadas, sonidos }))

      // ── El juicio ──────────────────────────────────────────────────────────
      const r = registros.filter((x) => x.t >= alClic - 50)
      const quieto = r.find((x, k) => k > 0 && x.fase === 'quieto' && x.ruta === DESTINO && (r[k - 1]?.fase ?? '') !== 'quieto')
      const total = (quieto?.t ?? Number.NaN) - alClic
      const conViaje = r.some((x) => x.modo === 'viaje') && !r.some((x) => x.fase !== 'quieto' && x.modo === 'banda')
      const iCambio = r.findIndex((x, k) => k > 0 && x.ruta === DESTINO && (r[k - 1]?.ruta ?? '') !== DESTINO)
      const cambio = iCambio < 0 ? undefined : r[iCambio - 1]
      const cambioLlegado = cambio !== undefined && cambio.camara >= 0.999 && cambio.noche >= 0.999
      let enBlanco = 0
      let oscurosPlanos = 0
      for (const f of fotos.filter((x) => x.t >= alClic - 50 && x.t <= (quieto?.t ?? Infinity) + 450)) {
        if (f.plano < 0.97) continue
        if (esClaro(f.color)) {
          if (enBlanco < 4) writeFileSync(path.join(SALIDA, `en-blanco-${String(ancho)}-${String(enBlanco)}${CONTROL === '' ? '' : `-${CONTROL}`}.jpg`), f.jpeg)
          enBlanco += 1
        } else oscurosPlanos += 1
      }
      const enSuHueco = (l: Llegada | undefined): { readonly dx: number; readonly dy: number; readonly desborda: boolean } | null => {
        if (l === undefined || l.logo === null || l.hueco === null) return null
        const desborda = l.logo.der - l.logo.izq > l.ancho
        const cx = (k: { izq: number; der: number }): number => (k.izq + k.der) / 2
        const cy = (k: { arriba: number; abajo: number }): number => (k.arriba + k.abajo) / 2
        return { dx: desborda ? 0 : Math.abs(cx(l.logo) - cx(l.hueco)) / l.ancho, dy: Math.abs(cy(l.logo) - cy(l.hueco)) / l.alto, desborda }
      }
      const enDestape = enSuHueco(llegadas.find((l) => l.cuando === 'destapa'))
      const asentada = enSuHueco(llegadas.find((l) => l.cuando === 'asentada'))
      const llegadaBien = enDestape !== null && asentada !== null && enDestape.dx <= 0.01 && enDestape.dy <= 0.01 && asentada.dx <= 0.01 && asentada.dy <= 0.01
      const sale = sonidos.filter((s) => s.cual === 'sale')
      const llega = sonidos.filter((s) => s.cual === 'llega')
      const sonidosBien = sale.length === 1 && llega.length === 1 && (sale[0]?.t ?? 0) < (llega[0]?.t ?? 0)
      // Abajo de 1024 la llegada se informa (el reencuadre corto del hueco de la 1, declarado): no entra en el criterio.
      const bien = conViaje && cambioLlegado && enBlanco === 0 && (movil || llegadaBien) && sonidosBien
      const pct = (v: number): string => `${(v * 100).toFixed(2)} %`
      const linea =
        `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · el CTA de web → ${DESTINO} · total ${total.toFixed(0)} ms` +
        ` · ${conViaje ? 'cubrió la escena (data-modo=viaje)' : 'NO cubrió la escena (la banda)'} · el cambio de ruta ${cambio === undefined ? 'no se vio' : `con la cámara en ${cambio.camara.toFixed(3)} y la noche en ${cambio.noche.toFixed(3)}`}` +
        ` · screencast: ${String(fotos.length)} cuadros, ${String(enBlanco)} en blanco (${String(oscurosPlanos)} oscuros planos, un dato)` +
        ` · el logo en su hueco al aparecer la página: ${enDestape === null ? 'sin medir' : `${enDestape.desborda ? 'x sin medir (más ancho que el cuadro)' : pct(enDestape.dx)} en x, ${pct(enDestape.dy)} en y`}; asentada: ${asentada === null ? 'sin medir' : `${pct(asentada.dx)} en x, ${pct(asentada.dy)} en y`}${movil ? ' (abajo de 1024, un dato)' : ''}` +
        ` · los sonidos: ${sonidos.map((s) => s.cual).join(' → ') || 'ninguno'}`
      console.log(linea)
      lineas.push({ linea, bien })
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  console.log(`viaje: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} anchos dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR)`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
