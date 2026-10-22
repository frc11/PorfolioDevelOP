/**
 * [B13] EL CIERRE DE UNA PÁGINA EN `/v3/pagina-base` — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/`
 * bloqueado, con banco (`__entornoDeLaEscena`). Por ancho (1440 × 900 con el mouse; 390 × 844 táctil), recorre el cierre por sus pantallas
 * (la del pin del home: `__cierreDelBanco().pantalla`) con saltos de scroll y un rato quieto en cada parada:
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,390 npx tsx scripts-carga/cierre-de-pagina.ts
 *
 * El criterio, por ancho:
 *   · la pista del cierre manda (`manda`) desde que asoma, y la pantalla medida es la pedida (± 0,05);
 *   · LA TRANSFORMACIÓN: en la pantalla 5,8 (desde 1024, el escenario; abajo, en la 6: el fondo del bloque del CTA de la lista) la escena armó el CTA
 *     (`__ctaDelBanco().listo`), su progreso llegó (≥ 0,99) y dibuja sus piezas; desde 1024 en el escenario (`donde`), con la cámara en la
 *     pose C (la viva sin el mouse a < 0,6 de la del CTA) y la frase de la transformación armada; abajo de 1024, en la lista;
 *   · EL CTA: `a[data-pieza="cta-en-volumen"]` con `data-abre-contacto="panel"` y `data-precarga="web"`; un clic abre el contacto
 *     (`[data-pieza="contacto"]`) y se informa qué quedó marcado (la precarga);
 *   · LA RESOLUCIÓN ANTES DEL PIE: en la 6 (el CTA todavía clavado), la variante encendida (la luz de abajo prestada `__ranuraDelBanco()`:
 *     energía > 0,5 y teñida); en la 7, la resolución en 1 y la variante resuelta (energía 0,12 ± 0,02, blanca): el piso liso; y en la 6,5 el
 *     pie todavía no asoma (su parte, debajo del cuadro). Se informa (sin criterio) cuánto del cuadro de abajo tiene el acento en 6 y en 7;
 *   · EL PIE: al fondo (la 8), su titular a la vista y llegado (opacidad efectiva ≥ 0,99) y el final del home quieto (`__finalDelBanco`:
 *     `fin` 0, sin encastre) 3 s después.
 *
 *   CONTROL=sin-resolucion …  la variante recibe siempre 0 (`__cierreSinResolucion`): «la resolución antes del pie» tiene que dar FALLA.
 *   (Y en cada corrida, el detector del CTA se prueba contra una copia del enlace sin `data-precarga`: tiene que no verla.)
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'sin-resolucion'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: sin-resolucion`)
const RUTA = '/v3/pagina-base'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/cierre-de-pagina')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface DelCierre {
  readonly pantalla: number
  readonly resolucion: number
  readonly manda: boolean
}
interface DeLaRanura {
  readonly energia: number
  readonly color: string
  readonly duena: boolean
}
interface DelCta {
  readonly progreso: number
  readonly donde: string
  readonly listo: boolean
  readonly piezas: number
  readonly visibles: number
  readonly letrasDeLaFrase: number
  readonly camara: readonly number[]
  readonly camaraDelCta: readonly number[]
}

/** El scroll que pone la pantalla `q` del cierre (la inversa de `pantallaDelCierre`: el bloque de Seis razones, en el layout). */
const SCROLL_DE_LA_PANTALLA = `((q) => {
  const seis = document.querySelector('[data-cierre-de-pagina] [data-parte="seis-razones-del-cierre"]')
  if (!seis) return null
  const r = seis.getBoundingClientRect()
  const arriba = r.top + scrollY
  const recorrido = Math.max(1, r.height - innerHeight)
  return Math.round(q <= 0 ? arriba + q * innerHeight : q <= 6 ? arriba + (q / 6) * recorrido : arriba + recorrido + (q - 6) * innerHeight)
})`

async function aLaPantalla(p: Page, q: number, quietoMs: number): Promise<DelCierre | null> {
  const y = (await p.evaluate(`${SCROLL_DE_LA_PANTALLA}(${String(q)})`)) as number | null
  if (y === null) throw new Error('no está el cierre de la página')
  await p.evaluate(`window.scrollTo({ top: ${String(y)}, behavior: 'instant' })`)
  await dormir(quietoMs)
  return (await p.evaluate('window.__cierreDelBanco ? window.__cierreDelBanco() : null')) as DelCierre | null
}

const ranura = (p: Page): Promise<DeLaRanura | null> => p.evaluate('window.__ranuraDelBanco ? window.__ranuraDelBanco() : null') as Promise<DeLaRanura | null>
const delCta = (p: Page): Promise<DelCta | null> => p.evaluate('window.__ctaDelBanco ? window.__ctaDelBanco() : null') as Promise<DelCta | null>

/** Cuánto de la mitad de abajo del cuadro tiene el acento de web (azulado y con luz): un dato del piso, sin criterio. */
async function acentoAbajo(p: Page, ancho: number, alto: number): Promise<number> {
  const { data, info } = await sharp(await p.screenshot({ clip: { x: 0, y: Math.round(alto / 2), width: ancho, height: Math.round(alto / 2) } })).resize(160, 60, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  let n = 0
  for (let i = 0; i < info.width * info.height; i += 1) {
    const [r, g, b] = [data[i * 3] ?? 0, data[i * 3 + 1] ?? 0, data[i * 3 + 2] ?? 0]
    if (b > 90 && b > r + 25 && b > g + 5) n += 1
  }
  return n / (info.width * info.height)
}

/** El detector del CTA: el enlace del contacto con la precarga de la página. */
const ctaConPrecarga = (a: { readonly abre: string | null; readonly precarga: string | null } | null): boolean => a !== null && a.abre === 'panel' && a.precarga === 'web'

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean }[] = []
  for (const ancho of ANCHOS) {
    const movil = ancho < 1024
    const alto = movil ? 844 : 900
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/cierre-perfil-${String(Date.now())}`)
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
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f); ${CONTROL === 'sin-resolucion' ? 'window.__cierreSinResolucion = true;' : ''} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}${RUTA}`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      const placa = await p.evaluate(() => {
        const gl = document.createElement('canvas').getContext('webgl')
        const info = gl?.getExtension('WEBGL_debug_renderer_info')
        return gl === null || gl === undefined || info === null || info === undefined ? 'sin WebGL' : String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      })
      console.log(`·     ${String(ancho)} · la placa: ${placa} · visible: ${String(await p.evaluate('document.visibilityState'))}`)

      // 1 · El papel y el relevo: antes del cierre, la intro manda; asomando, el cierre.
      const enElPapel = await aLaPantalla(p, -2.5, 1200)
      const asoma = await aLaPantalla(p, -0.5, 1500)
      const relevoBien = enElPapel !== null && !enElPapel.manda && asoma !== null && asoma.manda && Math.abs(asoma.pantalla + 0.5) < 0.05

      // 2 · La transformación: la frase (A), los valores (B) y el CTA armado (C, en la 5,8).
      await aLaPantalla(p, 1, 1800)
      await aLaPantalla(p, 2.6, 1800)
      await aLaPantalla(p, 4.2, 1800)
      // Abajo de 1024 el CTA de la lista llega con el fondo de su bloque en el del cuadro: el final del pin (la 6).
      const enC = await aLaPantalla(p, movil ? 6 : 5.8, 2500)
      let cta = await delCta(p)
      for (let i = 0; i < 20 && (cta === null || !cta.listo); i += 1) {
        await dormir(500)
        cta = await delCta(p)
      }
      const dist = cta === null ? Number.NaN : Math.hypot(...cta.camara.map((v, k) => v - (cta?.camaraDelCta[k] ?? 0)))
      const transformacionBien = cta !== null && cta.listo && cta.progreso >= 0.99 && cta.visibles > 0 && (movil ? cta.donde === 'lista' : cta.donde === 'escenario' && cta.letrasDeLaFrase > 0 && dist < 0.6)
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-cta${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })

      // 3 · El CTA: el contacto con la precarga de la página; el detector, contra una copia sin el atributo.
      const enlace = (await p.evaluate(`(() => { const a = document.querySelector('[data-cierre-de-pagina] a[data-pieza="cta-en-volumen"]'); if (!a) return null; const r = a.getBoundingClientRect(); return { abre: a.getAttribute('data-abre-contacto'), precarga: a.getAttribute('data-precarga'), x: r.left + r.width / 2, y: r.top + r.height / 2, tocable: getComputedStyle(a).pointerEvents !== 'none' } })()`)) as { abre: string | null; precarga: string | null; x: number; y: number; tocable: boolean } | null
      const detectorCiego = ctaConPrecarga(enlace === null ? null : { ...enlace, precarga: null })
      let contacto = { abierto: false, marcados: [] as string[] }
      if (enlace !== null && enlace.tocable) {
        if (movil) await p.touchscreen.tap(enlace.x, enlace.y)
        else await p.mouse.click(enlace.x, enlace.y)
        await dormir(1500)
        contacto = (await p.evaluate(`(() => { const c = document.querySelector('[data-pieza="contacto"]'); return { abierto: !!c, marcados: c ? [...c.querySelectorAll('input:checked, [aria-pressed="true"], [aria-checked="true"]')].map((e) => e.getAttribute('value') || e.textContent || '').map((s) => s.trim().slice(0, 30)) : [] } })()`)) as { abierto: boolean; marcados: string[] }
        await p.keyboard.press('Escape')
        await dormir(1200)
      }
      const ctaBien = ctaConPrecarga(enlace) && contacto.abierto && !detectorCiego

      // 4 · La resolución antes del pie.
      const enSeis = await aLaPantalla(p, 6, 1500)
      const encendida = await ranura(p)
      const acentoEn6 = await acentoAbajo(p, ancho, alto)
      const enSeisYMedio = await aLaPantalla(p, 6.5, 1200)
      const pieAsoma = (await p.evaluate(`(() => { const e = document.querySelector('[data-cierre-de-pagina] [data-parte="pie-del-cierre"]'); return e ? e.getBoundingClientRect().top < innerHeight - 1 : null })()`)) as boolean | null
      const enSiete = await aLaPantalla(p, 7, 1800)
      const resuelta = await ranura(p)
      const acentoEn7 = await acentoAbajo(p, ancho, alto)
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-resuelta${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
      const resolucionBien =
        enSeis !== null && enSeis.resolucion < 0.01 && encendida !== null && encendida.energia > 0.5 && encendida.color !== 'ffffff' &&
        enSeisYMedio !== null && enSeisYMedio.resolucion > 0.2 && enSeisYMedio.resolucion < 0.8 && pieAsoma === false &&
        enSiete !== null && enSiete.resolucion > 0.99 && resuelta !== null && resuelta.duena && Math.abs(resuelta.energia - 0.12) <= 0.02 && resuelta.color === 'ffffff'

      // 5 · El pie, al fondo; el final del home, quieto.
      const alFondo = await aLaPantalla(p, 8, 3000)
      const pie = (await p.evaluate(`(() => { const t = document.getElementById('titular-del-pie-del-cierre'); if (!t) return null; let o = 1; for (let e = t; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); const r = t.getBoundingClientRect(); return { opacidad: Math.round(o * 1000) / 1000, aLaVista: r.top >= 0 && r.bottom <= innerHeight } })()`)) as { opacidad: number; aLaVista: boolean } | null
      const final = (await p.evaluate('window.__finalDelBanco ? window.__finalDelBanco() : null')) as { fin: number; fase: string } | null
      await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-pie${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
      const pieBien = alFondo !== null && pie !== null && pie.aLaVista && pie.opacidad >= 0.99 && (final === null || final.fin === 0)

      const bien = relevoBien && transformacionBien && ctaBien && resolucionBien && pieBien
      const n = (v: number | undefined, d = 2): string => (v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d))
      const linea =
        `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)} · ${RUTA}` +
        ` · relevo ${relevoBien ? 'ok' : 'FALLA'} (en el papel manda ${String(enElPapel?.manda)}, asomando ${String(asoma?.manda)} en ${n(asoma?.pantalla)})` +
        ` · transformación ${transformacionBien ? 'ok' : 'FALLA'} (en ${n(enC?.pantalla)}: ${cta === null ? 'sin banco del CTA' : `${cta.donde}, listo ${String(cta.listo)}, progreso ${n(cta.progreso, 3)}, ${String(cta.visibles)} de ${String(cta.piezas)} piezas, frase ${String(cta.letrasDeLaFrase)} letras, cámara a ${n(dist)} de la del CTA`})` +
        ` · CTA ${ctaBien ? 'ok' : 'FALLA'} (${enlace === null ? 'sin enlace' : `data-abre-contacto=${String(enlace.abre)} data-precarga=${String(enlace.precarga)}`}; contacto ${contacto.abierto ? 'abierto' : 'NO abierto'}, marcado: ${contacto.marcados.join(' | ') || 'nada'}; el detector ${detectorCiego ? 'CIEGO' : 've la copia sin precarga'})` +
        ` · resolución ${resolucionBien ? 'ok' : 'FALLA'} (en 6: ${n(enSeis?.resolucion)} y la luz ${n(encendida?.energia)} #${String(encendida?.color)}; en 6,5: ${n(enSeisYMedio?.resolucion)} y el pie ${pieAsoma === false ? 'abajo del cuadro' : 'ASOMA'}; en 7: ${n(enSiete?.resolucion)} y la luz ${n(resuelta?.energia)} #${String(resuelta?.color)}; el acento abajo ${n(acentoEn6 * 100, 1)} % → ${n(acentoEn7 * 100, 1)} %, un dato)` +
        ` · pie ${pieBien ? 'ok' : 'FALLA'} (titular ${pie === null ? 'sin titular' : `${pie.aLaVista ? 'a la vista' : 'fuera'}, opacidad ${n(pie.opacidad, 3)}`}; el final del home ${final === null ? 'sin banco' : `fin ${n(final.fin, 3)} (${final.fase})`})`
      console.log(linea)
      lineas.push({ linea, bien })
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  console.log(`cierre: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} anchos dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR la resolución)`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
