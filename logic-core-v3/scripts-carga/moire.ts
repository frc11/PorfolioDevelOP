/**
 * [C2-31m] EL MOIRÉ DEL MOUSE SIN LÍNEAS NEGRAS EN EL PISO, SU ENTRADA Y SU COSTO — `/v3` a 1440×900 con el Chrome del sistema a la
 * vista, el banco de la escena (`__entornoDeLaEscena`: publica `__moireDelBanco`, `__pisoDelBanco` y `__gpuDelBanco`) y `/api/`
 * bloqueado. SIN CORRER todavía (lo corre el orquestador).
 *
 * El defecto (captura `lote3/01`): con `?moire=mouse`, en Quiénes somos, líneas negras horizontales en el piso cerca del cursor. Eran
 * los costados de los bloques que la simulación del piso levantaba en una loma bajo el puntero (`piso/PisoVivo.tsx`,
 * `LOMA_DEL_CURSOR`), no la trama. Por toma (el moiré del producto y, para el diagnóstico, SIN la trama: `fondo=cristal`), en
 * Quiénes somos y con el mouse en un punto FIJO del piso (`PUNTO`, a la izquierda del logo, donde estaba en la captura):
 *   · el mouse llega al punto despacio y queda quieto 1,2 s (menos que los 2,5 s en que el piso de antes soltaba la loma): foto
 *     `recien` y su recorte ampliado;
 *   · LÍNEAS: en una franja alrededor del cursor (sin el círculo del cursor), las filas de píxeles con una corrida horizontal de
 *     `CORRIDA` px o más casi negras (más oscuras que `OSCURO` × la mediana de la franja, el piso blanco). Se cuenta igual en la foto
 *     `quieto` (5 s más, con el mouse quieto: la loma de antes ya bajó), la referencia del mismo cuadro;
 *   · el estado: la presencia del cursor en el piso (`__pisoDelBanco`) y el corrimiento de la rendija (`__moireDelBanco`).
 * Criterios (con el moiré):
 *   · SIN LÍNEAS: filas con línea en `recien` a lo sumo `TOLERANCIA` más que en `quieto`, y la presencia del cursor en el piso < 0,05;
 *   · LA RENDIJA SIGUE AL MOUSE: con el mouse fuera del centro, la textura corrida (|x| e |y| > 0);
 *   · LA ENTRADA DE AFUERA (sólo si la escena la publica): `fijarLaEntrada` con la posición del mouse da el mismo corrimiento (2 %);
 *     con la opuesta, el corrimiento opuesto; con `null`, vuelve al del mouse;
 *   · EL COSTO: el tiempo de GPU de la trama por cuadro (`trama gruesa` + `zócalo`, 60 cuadros) ≤ 0,12 ms (B8: la gruesa ~0,05 y la
 *     fina ~0,06) y sin `trama fina`; se informa también el piso vivo, su simulación y el cuadro entero.
 * Diagnóstico (no falla): las líneas con y sin la trama (si las dos tomas dan lo mismo, la trama no es la causa).
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/moire.ts                  (ROTULO=despues; BANCO_FOTOS=<carpeta>)
 *   CONTROL=con-lineas npx tsx scripts-carga/moire.ts                          el piso de antes (`__defectosDeLaIntro`): tiene que fallar SIN LÍNEAS
 *   ANTES=1 ROTULO=antes npx tsx scripts-carga/moire.ts                         contra la integración sin la 31m (pide `moire=mouse`): las fotos de antes
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'

import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const [ANCHO, ALTO] = [Number(process.env.ANCHO ?? 1440), Number(process.env.ALTO ?? 900)]
const CONTROL = process.env.CONTROL ?? ''
const ANTES = process.env.ANTES === '1'
const ROTULO = process.env.ROTULO ?? (ANTES ? 'antes' : CONTROL === '' ? 'despues' : CONTROL)
const SALIDA = salidaDelBanco(`moire-${ROTULO}`)
/** El punto del piso donde queda el mouse (fracción del cuadro): a la izquierda del logo y debajo de la frase, como en la captura. */
const PUNTO = { x: 0.3, y: 0.76 } as const
/** La franja que se mira alrededor del cursor (px a cada lado) y el círculo del cursor de la sala, que no cuenta (px de radio). */
const FRANJA = { x: 130, y: 70, cursor: 30 } as const
/** Una fila «tiene línea» si tiene una corrida de `CORRIDA` px más oscuros que `OSCURO` × la mediana de la franja. */
const [OSCURO, CORRIDA, TOLERANCIA] = [0.7, 24, 2]
const TOPE_TRAMA_MS = 0.12
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Lineas { readonly filas: number; readonly corridaMasLarga: number; readonly mediana: number }
interface EstadoDeLaEscena { readonly visible: string; readonly ancho: number; readonly presencia: number | null; readonly gruesa: number[] | null; readonly conEntrada: boolean }
interface Costo { readonly pasadas: Record<string, number>; readonly cuadroMs: number | null; readonly sinExtension: boolean }

/** Las filas con una línea casi negra horizontal en la franja alrededor de (cx, cy), en la foto. */
async function lineasEn(png: Buffer, cx: number, cy: number): Promise<Lineas> {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const [w, h, c] = [info.width, info.height, info.channels]
  const lum = (x: number, y: number): number => {
    const i = (y * w + x) * c
    return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
  }
  const [x0, x1, y0, y1] = [Math.max(0, cx - FRANJA.x), Math.min(w - 1, cx + FRANJA.x), Math.max(0, cy - FRANJA.y), Math.min(h - 1, cy + FRANJA.y)]
  const enElCursor = (x: number, y: number): boolean => (x - cx) ** 2 + (y - cy) ** 2 < FRANJA.cursor ** 2
  const valores: number[] = []
  for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) if (!enElCursor(x, y)) valores.push(lum(x, y))
  valores.sort((a, b) => a - b)
  const mediana = valores[Math.floor(valores.length / 2)] ?? 0
  let [filas, corridaMasLarga] = [0, 0]
  for (let y = y0; y <= y1; y += 1) {
    let [corrida, mejor] = [0, 0]
    for (let x = x0; x <= x1; x += 1) {
      corrida = !enElCursor(x, y) && lum(x, y) < OSCURO * mediana ? corrida + 1 : 0
      mejor = Math.max(mejor, corrida)
    }
    if (mejor >= CORRIDA) filas += 1
    corridaMasLarga = Math.max(corridaMasLarga, mejor)
  }
  return { filas, corridaMasLarga, mediana }
}

/** El scroll del documento (por el LAYOUT) con el que la frase de Quiénes somos queda al 45 % del cuadro (o el comienzo de la sección). */
const destinoEnQuienesSomos = (p: Page): Promise<number> =>
  p.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('[data-panel="quienes-somos"]')
    if (panel === null) return -1
    const candidatos = [...panel.querySelectorAll<HTMLElement>('h2, h3, p, span, div')].filter((e) => (e.textContent ?? '').includes('algo distinto') && e.offsetHeight > 0)
    const frase = candidatos.sort((a, b) => a.offsetHeight - b.offsetHeight)[0] ?? panel
    let y = 0
    for (let e: HTMLElement | null = frase; e !== null; e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null) y += e.offsetTop
    return frase === panel ? y : y + frase.offsetHeight / 2 - 0.45 * window.innerHeight
  })

/** Con la rueda hasta el scroll pedido (pasos de hasta 120 px) y quieto 2 s para que la cámara asiente. */
async function ruedaHasta(p: Page, destino: number): Promise<void> {
  for (let k = 0; k < 300; k += 1) {
    const y = await p.evaluate(() => window.scrollY)
    const falta = destino - y
    if (Math.abs(falta) < 40) break
    await p.mouse.wheel(0, Math.sign(falta) * Math.min(120, Math.max(30, Math.abs(falta))))
    await dormir(70)
  }
  await dormir(2000)
}

const estado = (p: Page): Promise<EstadoDeLaEscena> =>
  p.evaluate(() => {
    const w = window as unknown as {
      __pisoDelBanco?: { estado: () => { presencia: number } }
      __moireDelBanco?: { estado: () => { gruesa?: number[] }; fijarLaEntrada?: unknown }
    }
    const piso = w.__pisoDelBanco?.estado() ?? null
    const moire = w.__moireDelBanco?.estado() ?? null
    return { visible: document.visibilityState, ancho: window.innerWidth, presencia: piso === null ? null : piso.presencia, gruesa: moire?.gruesa ?? null, conEntrada: typeof w.__moireDelBanco?.fijarLaEntrada === 'function' }
  })

const fijarLaEntrada = (p: Page, e: { x: number; y: number } | null): Promise<void> =>
  p.evaluate((v) => {
    const w = window as unknown as { __moireDelBanco?: { fijarLaEntrada?: (q: { x: number; y: number } | null) => void } }
    w.__moireDelBanco?.fijarLaEntrada?.(v)
  }, e)

const costo = (p: Page): Promise<Costo> =>
  p.evaluate(async () => {
    const g = (window as unknown as { __gpuDelBanco?: { extension: boolean; medir: (n: number, m: string) => Promise<{ pasadas: Record<string, { ms: number }> } | null> } }).__gpuDelBanco
    if (g === undefined || !g.extension) return { pasadas: {}, cuadroMs: null, sinExtension: true }
    const o = await g.medir(60, 'objetos')
    const pasadas: Record<string, number> = {}
    for (const [n, v] of Object.entries(o?.pasadas ?? {})) if (/trama|zócalo|piso|simulaci/.test(n)) pasadas[n] = Math.round(v.ms * 10000) / 10000
    const c = await g.medir(60, 'cuadro')
    const entera = c?.pasadas['escena entera']?.ms
    return { pasadas, cuadroMs: entera === undefined ? null : Math.round(entera * 1000) / 1000, sinExtension: false }
  })

async function toma(nombre: string, pedido: string): Promise<Record<string, unknown>> {
  const perfil = perfilDelBanco('moire')
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    args: [`--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = ${JSON.stringify(pedido)}; window.__defectosDeLaIntro = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    await p.mouse.move(ANCHO / 2, ALTO / 2)
    await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
    await dormir(8000)
    const placa = await p.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2')
      const e = gl?.getExtension('WEBGL_debug_renderer_info')
      return gl && e ? String(gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) : 'sin dato'
    })
    const destino = await destinoEnQuienesSomos(p)
    if (destino < 0) return { nombre, error: 'no encontré Quiénes somos' }
    await ruedaHasta(p, destino)
    // El mouse llega despacio al punto fijo y queda quieto.
    const [mx, my] = [Math.round(ANCHO * PUNTO.x), Math.round(ALTO * PUNTO.y)]
    await p.mouse.move(mx, my, { steps: 40 })
    await dormir(1200)
    const fotoRecien = await p.screenshot()
    const eRecien = await estado(p)
    await dormir(5000)
    const fotoQuieto = await p.screenshot()
    const eQuieto = await estado(p)
    const archivo = (m: string): string => path.join(SALIDA, `${ROTULO}-${nombre}-${m}.png`)
    writeFileSync(archivo('recien'), fotoRecien)
    writeFileSync(archivo('quieto'), fotoQuieto)
    // El recorte de la franja, ampliado tres veces (para mirarlo a ojo).
    const recorte = { left: Math.max(0, mx - 2 * FRANJA.x), top: Math.max(0, my - 2 * FRANJA.y), width: Math.min(4 * FRANJA.x, ANCHO - Math.max(0, mx - 2 * FRANJA.x)), height: Math.min(4 * FRANJA.y, ALTO - Math.max(0, my - 2 * FRANJA.y)) }
    await sharp(fotoRecien).extract(recorte).resize(recorte.width * 3, recorte.height * 3, { kernel: 'nearest' }).toFile(archivo('recien-zoom'))
    const [lRecien, lQuieto] = [await lineasEn(fotoRecien, mx, my), await lineasEn(fotoQuieto, mx, my)]
    const fila: Record<string, unknown> = { nombre, pedido, placa, punto: [mx, my], recien: { lineas: lRecien, estado: eRecien }, quieto: { lineas: lQuieto, estado: eQuieto } }
    // La entrada de afuera, con la posición del mouse y con la opuesta (sólo si la escena la publica).
    if (eQuieto.conEntrada) {
      const puntero = { x: (mx / ANCHO) * 2 - 1, y: 1 - (my / ALTO) * 2 }
      await fijarLaEntrada(p, puntero)
      await dormir(2500)
      const igual = (await estado(p)).gruesa
      await fijarLaEntrada(p, { x: -puntero.x, y: -puntero.y })
      await dormir(3000)
      const opuesta = (await estado(p)).gruesa
      await fijarLaEntrada(p, null)
      await dormir(3000)
      const devuelta = (await estado(p)).gruesa
      fila.entrada = { puntero, conElMouse: eQuieto.gruesa, igual, opuesta, devuelta }
    }
    fila.costo = await costo(p)
    return fila
  } finally {
    await ctx.close()
  }
}

async function main(): Promise<void> {
  const fallas: string[] = []
  const conMoire = await toma('con-moire', ANTES ? 'producto,moire=mouse' : 'producto')
  const sinMoire = await toma('sin-moire', ANTES ? 'producto,moire=mouse,fondo=cristal' : 'producto,fondo=cristal')
  const informe: Record<string, unknown> = { rotulo: ROTULO, control: CONTROL, cuadro: `${String(ANCHO)}x${String(ALTO)}`, conMoire, sinMoire }
  type Toma = { recien?: { lineas: Lineas; estado: EstadoDeLaEscena }; quieto?: { lineas: Lineas; estado: EstadoDeLaEscena }; entrada?: { conElMouse: number[] | null; igual: number[] | null; opuesta: number[] | null; devuelta: number[] | null }; costo?: Costo; error?: string }
  const c = conMoire as Toma
  const s = sinMoire as Toma
  if (c.error !== undefined || c.recien === undefined || c.quieto === undefined) fallas.push(`con el moiré: ${c.error ?? 'sin medida'}`)
  else {
    const { recien, quieto } = c
    if (recien.estado.visible !== 'visible' || !(recien.estado.ancho > 0)) fallas.push(`la pestaña no está a la vista (${recien.estado.visible}): la medida no vale`)
    const demas = recien.lineas.filas - quieto.lineas.filas
    const presencia = recien.estado.presencia ?? Number.NaN
    const sinLineas = demas <= TOLERANCIA && presencia < 0.05
    console.log(`${sinLineas ? 'ok   ' : 'FALLA'} SIN LÍNEAS: filas con línea junto al cursor ${String(recien.lineas.filas)} (quieto 5 s después, ${String(quieto.lineas.filas)}; de más ${String(demas)}, tope ${String(TOLERANCIA)}) · corrida más larga ${String(recien.lineas.corridaMasLarga)} px · la presencia del cursor en el piso ${presencia.toFixed(3)}`)
    if (!sinLineas) fallas.push('SIN LÍNEAS')
    const g = recien.estado.gruesa
    const sigue = g !== null && Math.abs(g[0]) > 1e-4 && Math.abs(g[1]) > 1e-4
    console.log(`${sigue ? 'ok   ' : 'FALLA'} LA RENDIJA SIGUE AL MOUSE: corrimiento ${g === null ? 'sin dato' : g.map((v) => v.toFixed(4)).join(', ')}`)
    if (!sigue) fallas.push('LA RENDIJA SIGUE AL MOUSE')
    if (c.entrada !== undefined) {
      const { conElMouse, igual, opuesta, devuelta } = c.entrada
      const cerca = (a: number[] | null, b: number[] | null, signo: number): boolean => a !== null && b !== null && a.every((v, i) => Math.abs(v - signo * b[i]) <= 0.02 * Math.max(Math.abs(b[i]), 1e-3))
      const bien = cerca(igual, conElMouse, 1) && cerca(opuesta, conElMouse, -1) && cerca(devuelta, conElMouse, 1)
      console.log(`${bien ? 'ok   ' : 'FALLA'} LA ENTRADA DE AFUERA: con el mouse ${JSON.stringify(conElMouse)} · la misma posición de afuera ${JSON.stringify(igual)} · la opuesta ${JSON.stringify(opuesta)} · suelta ${JSON.stringify(devuelta)}`)
      if (!bien) fallas.push('LA ENTRADA DE AFUERA')
    } else if (!ANTES) fallas.push('la escena no publica la entrada de afuera (`__moireDelBanco.fijarLaEntrada`)')
    const k = c.costo
    if (k === undefined || k.sinExtension) console.log('     EL COSTO: sin la extensión del cronómetro de la GPU (no se mide)')
    else {
      const trama = (k.pasadas['trama gruesa'] ?? 0) + (k.pasadas['zócalo'] ?? 0)
      const conFina = k.pasadas['trama fina'] !== undefined
      const barato = trama <= TOPE_TRAMA_MS && (ANTES || !conFina)
      console.log(`${barato ? 'ok   ' : 'FALLA'} EL COSTO: la trama ${trama.toFixed(4)} ms por cuadro (tope ${String(TOPE_TRAMA_MS)}) · ${JSON.stringify(k.pasadas)} · el cuadro entero ${String(k.cuadroMs)} ms`)
      if (!barato) fallas.push('EL COSTO')
    }
  }
  if (s.recien !== undefined && s.quieto !== undefined && c.recien !== undefined && c.quieto !== undefined) {
    const [dc, ds] = [c.recien.lineas.filas - c.quieto.lineas.filas, s.recien.lineas.filas - s.quieto.lineas.filas]
    console.log(`     diagnóstico · las líneas de más con la trama ${String(dc)} y sin ella ${String(ds)}: ${Math.abs(dc - ds) <= TOLERANCIA ? 'iguales (la trama no es la causa)' : 'distintas'}`)
  }
  informe.fallas = fallas
  const archivo = path.join(SALIDA, `moire-${ROTULO}.json`)
  writeFileSync(archivo, JSON.stringify(informe, null, 2))
  console.log(`moire: ${fallas.length === 0 ? 'todo en verde' : `FALLA: ${fallas.join(' · ')}`}${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que fallar SIN LÍNEAS)`} → ${archivo}`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
