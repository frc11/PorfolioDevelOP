/**
 * [B12a.8 · P-H33] EL CONTRASTE DEL TEXTO DE LA INTRO SOBRE LA ESCENA — `/v3/pagina-base` con el Chrome del sistema a la vista, el banco de la
 * escena y `/api/` bloqueado, el mouse quieto en el medio. A 1440, 1024, 768 y 390, en los avances 0, 0,5 y 1.
 *
 *   npx tsx scripts-carga/contraste-de-la-intro.ts          (CONTROL=sin-sombra: la intro sin la sombra de sus letras)
 *
 * Por cada texto de la intro a la vista (el `h1` cuando el DOM es el visible, la bajada, la etiqueta y el párrafo de «de qué se trata»):
 * · la máscara de sus glifos: una captura con todo lo demás escondido, el lienzo apagado, el fondo negro y el texto blanco (sin sombra);
 * · el fondo real debajo: `CAPTURAS` capturas con el texto transparente (la sombra de las letras se queda: es fondo), con la escena viva;
 * · en cada píxel de la máscara y cada captura, la razón WCAG del color del texto contra el fondo.
 * El criterio (P-H33): AA en el 95 % de los píxeles del texto (4,5:1; el `h1`, texto grande, 3:1; se informan los dos).
 * Desde 1024 el título es el de volumen (el `h1` del DOM apagado): sus píxeles (las caras 3D, en la máscara del `h1`) contra la misma escena
 * sin títulos (`titulos=no` en el banco), captura por captura.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type BrowserContext, type Page } from '@playwright/test'
import sharp from 'sharp'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const AVANCES = (process.env.AVANCES ?? '0,0.5,1').split(',').map(Number)
const PANTALLAS = Number(process.env.PANTALLAS ?? '2.5')
const CAPTURAS = Number(process.env.CAPTURAS ?? '6')
const CONTROL = process.env.CONTROL ?? ''
const COMPOSICION = process.env.COMPOSICION ?? ''
/** [B12a.8] T5 · una de las opciones sin velo (`?legibilidad=luz|motas`), o ninguna. */
const LEGIBILIDAD = process.env.LEGIBILIDAD ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('contraste-de-la-intro')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const OBJETIVOS = [
  { nombre: 'h1 (1)', sel: '[data-intro-de-pagina] h1 [data-parte="titulo-1"]', grande: true },
  { nombre: 'h1 (2)', sel: '[data-intro-de-pagina] h1 [data-parte="titulo-2"]', grande: true },
  { nombre: 'bajada', sel: '[data-intro-de-pagina] [data-parte="tramo-del-titulo"] h1 + div', grande: false },
  { nombre: 'etiqueta', sel: '[data-intro-de-pagina] [data-parte="de-que-se-trata"] [data-pieza="etiqueta-de-seccion"]', grande: false },
  { nombre: 'de qué se trata', sel: '[data-intro-de-pagina] [data-parte="de-que-se-trata"] p[data-pieza="texto"]', grande: false },
] as const

const MARCA = 'data-objetivo-de-contraste'
const ESTILO_DE_LA_MASCARA = `html, body { background: #000 !important; } canvas { visibility: hidden !important; }
body * { visibility: hidden !important; text-shadow: none !important; }
body *::before, body *::after { visibility: hidden !important; }
[${MARCA}], [${MARCA}] * { visibility: visible !important; color: #fff !important; -webkit-text-fill-color: #fff !important; opacity: 1 !important; text-shadow: none !important; text-decoration-color: #fff !important; }
[${MARCA}]::before, [${MARCA}] *::before, [${MARCA}]::after, [${MARCA}] *::after { visibility: hidden !important; }`
const ESTILO_TRANSPARENTE = `[${MARCA}], [${MARCA}] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; }`

const lineal = (c: number): number => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const luminancia = (r: number, g: number, b: number): number => 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
const razon = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

async function crudo(png: Buffer): Promise<{ readonly datos: Buffer; readonly ancho: number; readonly alto: number }> {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return { datos: data, ancho: info.width, alto: info.height }
}

async function contexto(ancho: number, alto: number, entorno: string): Promise<{ readonly ctx: BrowserContext; readonly p: Page }> {
  const perfil = perfilDelBanco('contraste-intro')
  rmSync(perfil, { recursive: true, force: true })
  const movil = ancho < 1024
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
  await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = ${JSON.stringify(entorno)}; window.__defectosDeLaIntro = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  const busqueda = new URLSearchParams({ ...(COMPOSICION === '' ? {} : { composicion: COMPOSICION }), ...(LEGIBILIDAD === '' ? {} : { legibilidad: LEGIBILIDAD }) }).toString()
  await p.goto(`${BASE}/v3/pagina-base${busqueda === '' ? '' : `?${busqueda}`}`, { waitUntil: 'load', timeout: 300000 })
  await p.mouse.move(ancho / 2, alto / 2)
  // [B12a.8] T5 · Para explorar una opción (`ESTILO`): una hoja de más, antes de medir (no es parte del criterio).
  if (process.env.ESTILO !== undefined) await p.addStyleTag({ content: process.env.ESTILO })
  // El control: la misma intro sin la sombra de sus letras (P-H33; [B12a.8] T5: ya no hay velo).
  if (CONTROL === 'sin-sombra') await p.addStyleTag({ content: '[data-intro-de-pagina] * { text-shadow: none !important; }' })
  const t0 = Date.now()
  while (Date.now() - t0 < 60000) {
    const listo = await p.evaluate((sinTitulos) => {
      const w = window as unknown as { __titulosDelBanco?: { titulos: () => { id: string; llegada: number }[] }; __avanceDeLaIntro?: () => number }
      if (typeof w.__avanceDeLaIntro !== 'function') return false
      if (window.innerWidth < 1024 || sinTitulos) return true
      return (w.__titulosDelBanco?.titulos() ?? []).some((t) => t.id.startsWith('pagina-') && t.llegada > 0.99)
    }, entorno.includes('titulos=no'))
    if (listo) break
    await dormir(300)
  }
  await dormir(2500)
  return { ctx, p }
}

/** Con la llave apagada la bajada y «de qué se trata» son su marcador: se les pone un relleno del largo del real. Devuelve cuántos. */
const RELLENO = 'Texto de relleno del largo de una bajada real: dos o tres renglones que dicen qué hace el servicio y para quién, con palabras de largo normal.'
const rellenar = (p: Page): Promise<number> =>
  p.evaluate((largo) => {
    let n = 0
    for (const el of document.querySelectorAll('[data-intro-de-pagina] p')) {
      if ((el.textContent ?? '').trim() === '[TEXTO]') {
        el.textContent = largo
        n += 1
      }
    }
    return n
  }, RELLENO)

/** El relleno cambia el alto de la columna (y, centrada, la mueve): el cuadro 1 px más alto y de vuelta, para que la escena coloque de nuevo el título. */
async function recolocar(p: Page): Promise<void> {
  const v = p.viewportSize()
  if (v === null) return
  await p.setViewportSize({ width: v.width, height: v.height + 1 })
  await dormir(400)
  await p.setViewportSize(v)
  await dormir(2500)
}

async function irAlAvance(p: Page, f: number, alto: number): Promise<void> {
  const arriba = await p.evaluate(() => {
    const b = document.querySelector('[data-intro-de-pagina]')
    return b === null ? 0 : b.getBoundingClientRect().top + scrollY
  })
  // De a pasos (el título cae por el scroll, no por un salto), y quieto.
  const desde = await p.evaluate(() => window.scrollY)
  const hasta = arriba + f * PANTALLAS * alto
  for (let i = 1; i <= 8; i += 1) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), desde + ((hasta - desde) * i) / 8)
    await dormir(80)
  }
  await dormir(1600)
  const n = await rellenar(p)
  if (n > 0) await recolocar(p)
}

/** Las capturas del cuadro entero (el fondo de la escena cambia: varias, separadas). */
async function capturas(p: Page, n: number): Promise<Buffer[]> {
  const fotos: Buffer[] = []
  for (let i = 0; i < n; i += 1) {
    fotos.push(await p.screenshot({ type: 'png' }))
    await dormir(280)
  }
  return fotos
}

interface Resultado {
  readonly ancho: number
  readonly avance: number
  readonly nombre: string
  readonly pixeles: number
  readonly aa: number
  readonly sobre45: number
  readonly sobre3: number
  readonly p5: number
  readonly peor: number
  readonly bien: boolean
  /** Un dato que no cuenta en el criterio. */
  readonly informativo?: true
}

function percentil(v: number[], q: number): number {
  if (v.length === 0) return Number.NaN
  const s = [...v].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(q * s.length))] ?? Number.NaN
}

function resumir(ancho: number, avance: number, nombre: string, grande: boolean, razones: number[]): Resultado {
  const n = razones.length
  const sobre45 = n === 0 ? Number.NaN : razones.filter((r) => r >= 4.5).length / n
  const sobre3 = n === 0 ? Number.NaN : razones.filter((r) => r >= 3).length / n
  const aa = grande ? sobre3 : sobre45
  return { ancho, avance, nombre, pixeles: n, aa, sobre45, sobre3, p5: percentil(razones, 0.05), peor: razones.reduce((m, r) => (r < m ? r : m), Number.POSITIVE_INFINITY), bien: n === 0 || aa >= 0.95 }
}

/** La máscara de un objetivo (los índices de píxel de sus glifos) y el color de su texto; vacía si no está a la vista. */
async function mascara(p: Page, sel: string, erosion: number): Promise<{ readonly indices: number[]; readonly color: [number, number, number] | null; readonly visible: boolean }> {
  const marca = await p.evaluate(
    ({ sel, MARCA }) => {
      const els = [...document.querySelectorAll<HTMLElement>(sel)].filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight
      })
      document.querySelectorAll(`[${MARCA}]`).forEach((el) => el.removeAttribute(MARCA))
      els.forEach((el) => el.setAttribute(MARCA, ''))
      const el = els[0]
      if (el === undefined) return null
      const c = getComputedStyle(el).color.match(/[\d.]+/g)?.map(Number) ?? []
      return { color: [c[0] ?? 0, c[1] ?? 0, c[2] ?? 0] as [number, number, number], opacidad: Number(getComputedStyle(el).opacity) }
    },
    { sel, MARCA },
  )
  if (marca === null) return { indices: [], color: null, visible: false }
  const estilo = await p.addStyleTag({ content: ESTILO_DE_LA_MASCARA })
  await dormir(120)
  const { datos, ancho, alto } = await crudo(await p.screenshot({ type: 'png' }))
  await estilo.evaluate((el) => (el as Element).remove())
  await dormir(120)
  // Lo que el chrome tapa (los botones y la píldora, fijos encima del contenido): esos píxeles del texto no se ven, no cuentan.
  const tapados = await p.evaluate(() =>
    [...document.querySelectorAll('a, button, [data-parte="pastilla"]')]
      .filter((el) => {
        // Sólo lo que se ve (el menú del teléfono cerrado sigue en el layout, escondido).
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false
        for (let n: Element | null = el; n !== null; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return true
        return false
      })
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({ x0: r.left - 2, x1: r.right + 2, y0: r.top - 2, y1: r.bottom + 2 })),
  )
  const tapado = (x: number, y: number): boolean => tapados.some((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1)
  const blanco = new Uint8Array(ancho * alto)
  for (let i = 0; i < ancho * alto; i += 1) blanco[i] = luminancia(datos[i * 3] ?? 0, datos[i * 3 + 1] ?? 0, datos[i * 3 + 2] ?? 0) > 0.5 ? 1 : 0
  const indices: number[] = []
  for (let y = erosion; y < alto - erosion; y += 1) {
    for (let x = erosion; x < ancho - erosion; x += 1) {
      const i = y * ancho + x
      if (blanco[i] !== 1 || tapado(x, y)) continue
      let adentro = true
      for (let dy = -erosion; dy <= erosion && adentro; dy += 1) for (let dx = -erosion; dx <= erosion && adentro; dx += 1) if (blanco[i + dy * ancho + dx] !== 1) adentro = false
      if (adentro) indices.push(i)
    }
  }
  return { indices, color: marca.color, visible: marca.opacidad > 0.5 }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const resultados: Resultado[] = []
  for (const [ancho, alto] of ANCHOS) {
    const { ctx, p } = await contexto(ancho, alto, process.env.ENTORNO ?? 'producto')
    try {
      for (const f of AVANCES) {
        await irAlAvance(p, f, alto)
        await p.screenshot({ path: path.join(SALIDA, `c${COMPOSICION || 'x'}${LEGIBILIDAD === '' ? '' : `-${LEGIBILIDAD}`}-${String(ancho)}-avance-${String(f)}${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
        for (const o of OBJETIVOS) {
          const m = await mascara(p, o.sel, o.nombre === 'h1 (1)' ? 2 : o.grande ? 1 : 0)
          if (m.indices.length === 0 || m.color === null) continue
          const razones: number[] = []
          if (m.visible) {
            // El texto del DOM: su color contra el fondo real (el texto transparente; su sombra queda).
            const estilo = await p.addStyleTag({ content: ESTILO_TRANSPARENTE })
            await dormir(150)
            const fondos = await Promise.all((await capturas(p, CAPTURAS)).map(crudo))
            await estilo.evaluate((el) => (el as Element).remove())
            const lt = luminancia(...m.color)
            for (const fo of fondos) for (const i of m.indices) razones.push(razon(lt, luminancia(fo.datos[i * 3] ?? 0, fo.datos[i * 3 + 1] ?? 0, fo.datos[i * 3 + 2] ?? 0)))
            resultados.push(resumir(ancho, f, o.nombre, o.grande, razones))
          } else if (ancho >= 1024 && o.grande) {
            // El título en volumen: sus píxeles (las caras) contra el fondo real de atrás: la misma página con las letras apagadas (la escena
            // queda: `__titulosDelBanco.sinLasLetras`), captura por captura, alternadas.
            const conTitulo: Awaited<ReturnType<typeof crudo>>[] = []
            const escena: Awaited<ReturnType<typeof crudo>>[] = []
            for (let k = 0; k < CAPTURAS; k += 1) {
              conTitulo.push(await crudo(await p.screenshot({ type: 'png' })))
              await p.evaluate(() => (window as unknown as { __titulosDelBanco?: { sinLasLetras: (si: boolean) => void } }).__titulosDelBanco?.sinLasLetras(true))
              await dormir(60)
              escena.push(await crudo(await p.screenshot({ type: 'png' })))
              await p.evaluate(() => (window as unknown as { __titulosDelBanco?: { sinLasLetras: (si: boolean) => void } }).__titulosDelBanco?.sinLasLetras(false))
              await dormir(220)
            }
            if (process.env.DEPURAR === '1') {
              const ancho2 = conTitulo[0]?.ancho ?? 0
              const alto2 = conTitulo[0]?.alto ?? 0
              const masc = Buffer.alloc(ancho2 * alto2 * 3)
              for (const i of m.indices) masc.fill(255, i * 3, i * 3 + 3)
              await sharp(masc, { raw: { width: ancho2, height: alto2, channels: 3 } }).png().toFile(path.join(SALIDA, `depurar-${String(ancho)}-mascara.png`))
              await sharp(conTitulo[0]?.datos ?? Buffer.alloc(0), { raw: { width: ancho2, height: alto2, channels: 3 } }).png().toFile(path.join(SALIDA, `depurar-${String(ancho)}-con.png`))
              await sharp(escena[0]?.datos ?? Buffer.alloc(0), { raw: { width: ancho2, height: alto2, channels: 3 } }).png().toFile(path.join(SALIDA, `depurar-${String(ancho)}-sin.png`))
            }
            // [B12a.8] T5 · El criterio es el de siempre (la máscara del glifo con su erosión: el borde antialiasado de los trazos finos cuenta).
            // El cuerpo de la letra (2 px de erosión) va como dato: a 1280 en la 1, «web» da 94,6 % con el borde y 98,2 % sin él; abajo de 1280 el
            // cuerpo de la parte liviana se queda en unos pocos píxeles y no mide nada.
            const cuerpo = await mascara(p, o.sel, 2)
            const deLa = (indices: readonly number[]): number[] => {
              const r: number[] = []
              conTitulo.forEach((a, k) => {
                const b = escena[k]
                if (b === undefined) return
                for (const i of indices) r.push(razon(luminancia(a.datos[i * 3] ?? 0, a.datos[i * 3 + 1] ?? 0, a.datos[i * 3 + 2] ?? 0), luminancia(b.datos[i * 3] ?? 0, b.datos[i * 3 + 1] ?? 0, b.datos[i * 3 + 2] ?? 0)))
              })
              return r
            }
            for (const r of deLa(m.indices)) razones.push(r)
            resultados.push(resumir(ancho, f, `${o.nombre} en volumen`, o.grande, razones))
            if (o.nombre !== 'h1 (1)') resultados.push({ ...resumir(ancho, f, `${o.nombre} vol. cuerpo`, o.grande, deLa(cuerpo.indices)), informativo: true })
          }
        }
      }
    } finally {
      await ctx.close()
    }
  }
  let malas = 0
  const contados = resultados.filter((r) => r.informativo !== true)
  for (const r of resultados) {
    if (!r.bien && r.informativo !== true) malas += 1
    console.log(`${r.informativo === true ? 'dato ' : r.bien ? 'ok   ' : 'FALLA'} ${String(r.ancho).padStart(4)} · avance ${r.avance.toFixed(1)} · ${r.nombre.padEnd(22)} · ${String(r.pixeles).padStart(7)} px · AA ${(r.aa * 100).toFixed(1)} % (≥4,5: ${(r.sobre45 * 100).toFixed(1)} %, ≥3: ${(r.sobre3 * 100).toFixed(1)} %) · p5 ${r.p5.toFixed(2)} · peor ${r.peor.toFixed(2)}`)
  }
  writeFileSync(path.join(SALIDA, `resultados-c${COMPOSICION || 'x'}${CONTROL === '' ? '' : `-${CONTROL}`}.json`), JSON.stringify(resultados, null, 1))
  console.log(`contraste-de-la-intro: ${String(contados.length - malas)} de ${String(contados.length)} textos con AA en el 95 % de sus píxeles${CONTROL === '' ? '' : ` (CONTROL=${CONTROL})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
