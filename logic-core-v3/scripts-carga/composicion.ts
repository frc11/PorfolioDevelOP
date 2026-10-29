/**
 * [B12a.8] LA COMPOSICIÓN DE LA INTRO Y EL TÍTULO PROTAGONISTA (T1), EN EL SITIO — `/v3/pagina-base?nombre=N` con el Chrome del sistema a
 * la vista, el banco de la escena (la silueta del logo, `__siluetaDelBanco`; los títulos en volumen, `__titulosDelBanco`) y `/api/`
 * bloqueado, el mouse quieto en el medio. Por ancho: fotos en los avances 0, 0,5 y 1 y lo medido en el avance 0 y en el 0,5.
 * [INT] La composición es fija desde L6 (la 3: el texto a la izquierda del logo); el banco ya no barre `?composicion=`.
 *
 *   ANCHOS=1440x900,1280x800,1024x768,768x1024,390x844 NOMBRE=3 npx tsx scripts-carga/composicion.ts
 *
 * El criterio:
 * · el logo en su hueco: su centro (la silueta) a ± 1 % del centro del hueco que deja el DOM, en el avance 0 y en el 0,5 (la pose 2 gira
 *   con el logo en su lugar); si el logo es más ancho que el cuadro (el teléfono, como el hero del home) su centro en x no se mide;
 * · T1, el título: en UNA línea; desde 1024, de costado y a la izquierda del logo, al menos el 85 % de su columna; abajo de 1024, al menos
 *   el 85 % del ancho útil (la columna), arriba del logo; sin pisar la píldora ni el logo (se informa la distancia a cada uno). Desde 1024
 *   se mide el título en volumen (el `h1` del DOM está apagado);
 * · el texto en un eje: el título, la bajada y «de qué se trata» con el mismo eje a ± 1 % del ancho (el borde izquierdo desde 1024; el
 *   centro abajo de 1024).
 * Fotos en `~/.cache/b4-medicion/composicion/`.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1280x800,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const NOMBRE = process.env.NOMBRE ?? '3'
const RUTA = process.env.RUTA ?? '/v3/pagina-base'
const EXTRA = process.env.EXTRA ?? ''
const PANTALLAS = Number(process.env.PANTALLAS ?? '2.5')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('composicion')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Caja {
  readonly izq: number
  readonly der: number
  readonly arriba: number
  readonly abajo: number
}

async function cajaDelLogo(p: Page): Promise<Caja | null> {
  return p.evaluate(() => {
    const s = (window as unknown as { __siluetaDelBanco?: (celda?: number) => { celda: number; cols: number; ocupadas: number[] } | null }).__siluetaDelBanco?.(2) ?? null
    if (s === null || s.ocupadas.length === 0) return null
    let [izq, der, arriba, abajo] = [Infinity, -Infinity, Infinity, -Infinity]
    for (const i of s.ocupadas) {
      const [x, y] = [(i % s.cols) * s.celda, Math.floor(i / s.cols) * s.celda]
      izq = Math.min(izq, x)
      der = Math.max(der, x + s.celda)
      arriba = Math.min(arriba, y)
      abajo = Math.max(abajo, y + s.celda)
    }
    return { izq, der, arriba, abajo }
  })
}

interface Medido {
  readonly tituloDom: Caja | null
  readonly titulo3d: Caja | null
  readonly renglones: number
  readonly bajada: Caja | null
  readonly deQue: Caja | null
  readonly hueco: Caja | null
  readonly columna: Caja | null
  readonly pildora: Caja | null
  readonly texto: string
}

const medir = (p: Page): Promise<Medido> =>
  p.evaluate(() => {
    const unir = (rs: DOMRect[]): { izq: number; der: number; arriba: number; abajo: number } | null =>
      rs.length === 0 ? null : { izq: Math.min(...rs.map((x) => x.left)), der: Math.max(...rs.map((x) => x.right)), arriba: Math.min(...rs.map((x) => x.top)), abajo: Math.max(...rs.map((x) => x.bottom)) }
    const tinta = (sel: string): { izq: number; der: number; arriba: number; abajo: number } | null => {
      const el = document.querySelector(sel)
      if (el === null) return null
      const r = document.createRange()
      r.selectNodeContents(el)
      return unir([...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0))
    }
    const caja = (sel: string): { izq: number; der: number; arriba: number; abajo: number } | null => {
      const el = document.querySelector(sel)
      if (el === null || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return null
      const r = el.getBoundingClientRect()
      return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom }
    }
    // Los renglones del `h1`, como los cuenta el título (`letrasDelDom`): uno nuevo cuando una letra baja más de medio cuerpo. (Las cajas
    // de los nodos redondeadas daban 2 a 1280: las dos partes van en dos caras de alturas distintas.)
    const h1 = document.querySelector('[data-intro-de-pagina] h1')
    const rango = document.createRange()
    const cuerpo = h1 === null ? 1 : parseFloat(getComputedStyle(h1).fontSize)
    const tops: number[] = []
    const recorrido = h1 === null ? null : document.createTreeWalker(h1, NodeFilter.SHOW_TEXT)
    for (let n = recorrido?.nextNode() ?? null; n !== null; n = recorrido?.nextNode() ?? null) {
      if (!(n instanceof Text)) continue
      for (let k = 0; k < n.length; k += 1) {
        if ((n.data[k] ?? ' ').trim() === '') continue
        rango.setStart(n, k)
        rango.setEnd(n, k + 1)
        const arriba = rango.getBoundingClientRect().top
        if (tops.length === 0 || arriba > (tops[tops.length - 1] ?? 0) + 0.5 * cuerpo) tops.push(arriba)
      }
    }
    type DelBanco = { titulos: () => { id: string; llegada: number; enElCuadro: { izquierda: number; derecha: number; arriba: number; abajo: number } }[] }
    const enVolumen = ((window as unknown as { __titulosDelBanco?: DelBanco }).__titulosDelBanco?.titulos() ?? []).filter((t) => t.id.startsWith('pagina-') && t.llegada > 0.95)
    return {
      tituloDom: tinta('[data-intro-de-pagina] h1'),
      titulo3d: enVolumen.length === 0 ? null : { izq: Math.min(...enVolumen.map((t) => t.enElCuadro.izquierda)), der: Math.max(...enVolumen.map((t) => t.enElCuadro.derecha)), arriba: Math.min(...enVolumen.map((t) => t.enElCuadro.arriba)), abajo: Math.max(...enVolumen.map((t) => t.enElCuadro.abajo)) },
      renglones: tops.length,
      bajada: tinta('[data-intro-de-pagina] [data-parte="bajada"]'),
      deQue: tinta('[data-intro-de-pagina] [data-parte="de-que-se-trata"] [data-parte="columna-de-la-intro"]'),
      hueco: caja('[data-parte="hueco-del-logo"]'),
      // [B12a.8] T4 · La columna del texto es su caja de contenido: el aire de afuera de las de costado (su padding) no es columna.
      columna: (() => {
        const c = caja('[data-parte="marco-de-la-intro"] [data-parte="columna-de-la-intro"]')
        const el = document.querySelector('[data-parte="marco-de-la-intro"] [data-parte="columna-de-la-intro"]')
        if (c === null || el === null) return c
        const cs = getComputedStyle(el)
        return { ...c, izq: c.izq + parseFloat(cs.paddingLeft), der: c.der - parseFloat(cs.paddingRight) }
      })(),
      pildora: caja('[data-pieza="barra"] [data-parte="pastilla"]') ?? caja('[aria-controls="menu-movil"]'),
      texto: h1?.textContent ?? '',
    }
  })

/** La distancia entre dos cajas (px): 0 si se tocan o se pisan. */
const distancia = (a: Caja | null, b: Caja | null): number => {
  if (a === null || b === null) return Number.NaN
  const dx = Math.max(0, a.izq - b.der, b.izq - a.der)
  const dy = Math.max(0, a.arriba - b.abajo, b.arriba - a.abajo)
  return Math.hypot(dx, dy)
}

const RELLENO = 'Texto de relleno del largo de una bajada real: dos o tres renglones que dicen qué hace el servicio y para quién, con palabras de largo normal.'

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: string[] = []
  let malas = 0
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('composicion')
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
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      {
        await p.goto(`${BASE}${RUTA}?nombre=${NOMBRE}${EXTRA}`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(ancho / 2, alto / 2)
        const t0 = Date.now()
        while (Date.now() - t0 < 60000) {
          const listo = await p.evaluate(() => typeof (window as unknown as { __siluetaDelBanco?: unknown }).__siluetaDelBanco === 'function' && typeof (window as unknown as { __avanceDeLaIntro?: unknown }).__avanceDeLaIntro === 'function')
          if (listo) break
          await dormir(300)
        }
        // Con la llave apagada la bajada y «de qué se trata» son su marcador: un relleno del largo del real; el cuadro 1 px más alto y de
        // vuelta, para que la escena coloque de nuevo el título (la columna centrada cambió de alto).
        await p.evaluate((largo) => {
          for (const el of document.querySelectorAll('[data-intro-de-pagina] p')) if ((el.textContent ?? '').trim() === '[TEXTO]') el.textContent = largo
        }, RELLENO)
        await p.setViewportSize({ width: ancho, height: alto + 1 })
        await dormir(400)
        await p.setViewportSize({ width: ancho, height: alto })
        await dormir(5500)
        const arriba = await p.evaluate(() => {
          const b = document.querySelector('[data-intro-de-pagina]')
          return b === null ? 0 : b.getBoundingClientRect().top + scrollY
        })
        const medido: Record<string, { readonly logo: Caja | null; readonly m: Medido }> = {}
        for (const f of [0, 0.5, 1]) {
          const desde = await p.evaluate(() => window.scrollY)
          for (let i = 1; i <= 10; i += 1) {
            await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), desde + ((arriba + f * PANTALLAS * alto - desde) * i) / 10)
            await dormir(70)
          }
          await dormir(2200)
          medido[String(f)] = { logo: await cajaDelLogo(p), m: await medir(p) }
          await p.screenshot({ path: path.join(SALIDA, `n${NOMBRE}-${String(ancho)}-avance-${String(f)}.png`) })
        }
        await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
        await dormir(400)
        const a0 = medido['0']
        const a5 = medido['0.5']
        if (a0 === undefined || a5 === undefined) continue
        const hueco = a0.m.hueco
        const cx = (k: Caja | null): number => (k === null ? Number.NaN : (k.izq + k.der) / 2)
        const cy = (k: Caja | null): number => (k === null ? Number.NaN : (k.arriba + k.abajo) / 2)
        // El logo más ancho que el cuadro (el teléfono): su silueta toca los dos bordes y su centro en x no se mide.
        const desborda = (k: Caja | null): boolean => k !== null && k.izq <= 2 && k.der >= ancho - 2
        const enHueco = (k: Caja | null): { readonly dx: number; readonly dy: number } => ({ dx: desborda(k) ? 0 : Math.abs(cx(k) - cx(hueco)) / ancho, dy: Math.abs(cy(k) - cy(hueco)) / alto })
        const h0 = enHueco(a0.logo)
        const h5 = enHueco(a5.logo)
        const deCostado = !movil
        // T1 · el título que se ve: desde 1024 el de volumen; abajo, el del DOM.
        const titulo = !movil && a0.m.titulo3d !== null ? a0.m.titulo3d : a0.m.tituloDom
        const anchoDelTitulo = titulo === null ? Number.NaN : titulo.der - titulo.izq
        const referencia = a0.m.columna === null ? Number.NaN : a0.m.columna.der - a0.m.columna.izq
        const parte = anchoDelTitulo / referencia
        const parteBien = parte >= 0.85 && parte <= 1.0001
        const aLaPildora = distancia(titulo, a0.m.pildora)
        const alLogo = distancia(titulo, a0.logo)
        const arribaDelLogo = !movil || (titulo !== null && a0.logo !== null && titulo.abajo <= a0.logo.arriba)
        const eje = (k: Caja | null): number => (k === null ? Number.NaN : deCostado ? k.izq : (k.izq + k.der) / 2)
        const ejes = [eje(a0.m.tituloDom), eje(a0.m.bajada), eje(a5.m.deQue)]
        const desvioDelEje = (Math.max(...ejes) - Math.min(...ejes)) / ancho
        const lado = !deCostado || cx(titulo) < cx(a0.logo)
        const bien = h0.dx <= 0.01 && h0.dy <= 0.01 && h5.dx <= 0.01 && h5.dy <= 0.01 && desvioDelEje <= 0.01 && lado && a0.m.renglones === 1 && parteBien && aLaPildora > 0 && alLogo > 0 && arribaDelLogo
        if (!bien) malas += 1
        const linea =
          `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · «${a0.m.texto}» en ${String(a0.m.renglones)} renglón(es), ${(parte * 100).toFixed(1)} % ${movil ? 'del ancho útil' : 'de su columna'}${!movil && a0.m.titulo3d !== null ? ' (en volumen)' : ''}` +
          ` · a la píldora ${aLaPildora.toFixed(0)} px, al logo ${alLogo.toFixed(0)} px${movil ? (arribaDelLogo ? ', arriba del logo' : ', NO arriba del logo') : ''}` +
          ` · el logo en su hueco: ${desborda(a0.logo) ? 'más ancho que el cuadro (x sin medir)' : `${(h0.dx * 100).toFixed(2)} %`} en x y ${(h0.dy * 100).toFixed(2)} % en y (avance 0,5: ${(h5.dx * 100).toFixed(2)} y ${(h5.dy * 100).toFixed(2)} %)` +
          ` · el eje (${deCostado ? 'el borde izquierdo' : 'el centro'}): ${(desvioDelEje * 100).toFixed(2)} %${lado ? '' : ' · DEL LADO EQUIVOCADO'}`
        console.log(linea)
        lineas.push(linea)
      }
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados-n${NOMBRE}.txt`), lineas.join('\n'))
  console.log(`composicion: ${String(lineas.length - malas)} de ${String(lineas.length)} dentro del criterio`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
