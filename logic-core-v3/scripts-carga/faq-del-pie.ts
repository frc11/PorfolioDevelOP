/**
 * [B10] EL FAQ DESPUÉS DEL PIE — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado, con banco
 * (`__entornoDeLaEscena`). Por ruta (el home y la página base) y por ancho (1440 × 900 con el mouse; 390 × 844 táctil):
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,390 RUTAS=/v3,/v3/pagina-base npx tsx scripts-carga/faq-del-pie.ts
 *
 * El criterio, desde 1024 (el escenario), al fondo con el pie entero (en el home, acostado al final del encastre: `__faqDelBanco().acostado`):
 *   · LA ENTRADA: una rueda hacia abajo trae el FAQ (`adentro` en ≤ 2,6 s) sin mover la página; el pie se hunde ANTES de que suba el FAQ
 *     (en ninguna muestra los dos arriba: min(pie, faq) < 0,02); el pie hundido de verdad: en el home la escena lo hunde entero (`hunde` ≥ 0,99,
 *     sus piezas sin dibujar: `__pieDelBanco`), en la página sus columnas recortadas (`clip-path` en `inset(50 %)`); y los bloques del FAQ
 *     enteros (sin recorte, opacidad 1);
 *   · LA RESPUESTA: un clic en la primera pregunta hunde el aviso y sube la respuesta en su lugar (lo mostrado pasa del aviso a la 0 en
 *     ~1 s, su región a la vista y el aviso escondido); con ella sube el bloque de WhatsApp (`wa.me`, a la vista); otra pregunta (la 3)
 *     reemplaza a la 0 y el WhatsApp se queda arriba todo el cambio;
 *   · EL TECLADO: con el foco en la primera, ↓ pasa a la segunda, Tab a la tercera y Enter la abre;
 *   · LA SALIDA: una rueda hacia arriba saca el FAQ (`fuera`) sin mover la página, el FAQ se hunde ANTES de que vuelva el pie, y el pie
 *     vuelve entero (`hunde` 0; en la página, sus columnas sin recorte); en el home, el encastre NO se rebobina (`__finalDelBanco().fin` ≥ 0,99
 *     durante la salida y medio segundo después);
 *   · EL FOCO: enfocar una pregunta lo trae; Mayús+Tab (al pie) lo saca.
 * Abajo de 1024 (táctil), la LISTA: después del pie, cada pregunta con su respuesta a la vista, sin botones y sin WhatsApp; con el pie al
 * fondo el encastre corre como siempre (el fondo del layout no cambió) y, con la lista a la vista, un dedo hacia arriba no se retiene.
 * En todos: los datos estructurados (`FAQPage`) con seis preguntas.
 *
 *   CONTROL=sin-hundimiento …  el pie no se hunde (`__faqSinHundimiento`): «la entrada» tiene que dar FALLA desde 1024.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const RUTAS = (process.env.RUTAS ?? '/v3,/v3/pagina-base').split(',')
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'sin-hundimiento'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: sin-hundimiento`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/faq-del-pie')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface DelFaq {
  readonly fase: string
  readonly niveles: { readonly pie: number; readonly faq: number }
  readonly mostrado: number | 'aviso'
  readonly pedido: number | 'aviso'
  readonly whatsapp: number
  readonly hunde: number
  readonly acostado: boolean
  readonly volumen: boolean
}
const delFaq = (p: Page): Promise<DelFaq | null> => p.evaluate('window.__faqDelBanco ? window.__faqDelBanco() : null') as Promise<DelFaq | null>
const fin = async (p: Page): Promise<number | null> => ((await p.evaluate('window.__finalDelBanco ? window.__finalDelBanco().fin : null')) as number | null)
const scrollY = (p: Page): Promise<number> => p.evaluate('scrollY') as Promise<number>

/** Muestras del FAQ (y del final) cada `pasoMs` durante `ms`. */
async function muestrear(p: Page, ms: number, pasoMs = 60): Promise<{ readonly faq: DelFaq | null; readonly fin: number | null; readonly y: number }[]> {
  const serie: { faq: DelFaq | null; fin: number | null; y: number }[] = []
  for (let t = 0; t < ms; t += pasoMs) {
    serie.push({ faq: await delFaq(p), fin: await fin(p), y: await scrollY(p) })
    await dormir(pasoMs)
  }
  return serie
}

/** El estilo de los bloques del FAQ y de las columnas del pie plano (lo que el DOM se ve: recorte y opacidad). */
const ESTILOS = `(() => {
  const s = (e) => { const c = getComputedStyle(e); return { clip: c.clipPath, opacidad: Number(c.opacity) } }
  const raiz = document.querySelector('[data-faq-del-pie="escenario"]')
  const bloques = raiz ? [...raiz.querySelectorAll('[data-material="vidrio"]')].map(s) : []
  const columnas = [...document.querySelectorAll('[data-columna-del-pie]')].map(s)
  const wa = raiz ? raiz.querySelector('a[href^="https://wa.me/"]') : null
  const visible = (id) => { const e = document.getElementById(id); return !!e && !e.closest('[hidden]') }
  return { bloques, columnas, whatsapp: !!wa && !wa.hidden, respuesta0: visible('faq-del-pie-respuesta-0'), respuesta3: visible('faq-del-pie-respuesta-3'), activo: document.activeElement ? document.activeElement.id : '' }
})()`
interface Estilos {
  readonly bloques: readonly { readonly clip: string; readonly opacidad: number }[]
  readonly columnas: readonly { readonly clip: string; readonly opacidad: number }[]
  readonly whatsapp: boolean
  readonly respuesta0: boolean
  readonly respuesta3: boolean
  readonly activo: string
}
const estilos = (p: Page): Promise<Estilos> => p.evaluate(ESTILOS) as Promise<Estilos>
const enteros = (b: readonly { readonly clip: string; readonly opacidad: number }[]): boolean => b.length > 0 && b.every((x) => x.clip === 'none' && x.opacidad >= 0.999)

/** Los datos estructurados de FAQ de la página: cuántas preguntas trae el `FAQPage`. */
const DATOS = `(() => { for (const s of document.querySelectorAll('script[type="application/ld+json"]')) { try { const d = JSON.parse(s.textContent || ''); if (d['@type'] === 'FAQPage') return d.mainEntity.length } catch (e) {} } return 0 })()`

async function escenario(p: Page, ruta: string): Promise<{ readonly linea: string; readonly bien: boolean }> {
  const home = ruta === '/v3'
  await p.evaluate('window.scrollTo({ top: document.documentElement.offsetHeight, behavior: "instant" })')
  // El pie entero: en el home, acostado al final del encastre; en una página, llegado.
  for (let i = 0; i < 40; i += 1) {
    const f = await delFaq(p)
    if (f !== null && (!home || f.acostado)) break
    await dormir(500)
  }
  await dormir(1500)
  const y0 = await scrollY(p)
  const { width, height } = p.viewportSize() ?? { width: 1440, height: 900 }
  await p.mouse.move(width / 2, height / 2)

  // 1 · La entrada.
  await p.mouse.wheel(0, 400)
  const entrada = await muestrear(p, 2600)
  const adentro = await estilos(p)
  await p.screenshot({ path: path.join(SALIDA, `${String(width)}${ruta.replaceAll('/', '-')}-adentro${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
  const ultimo = entrada[entrada.length - 1]?.faq ?? null
  const nuncaLosDos = entrada.every((m) => m.faq === null || Math.min(m.faq.niveles.pie, m.faq.niveles.faq) < 0.02)
  const pieHundido = home ? entrada.some((m) => (m.faq?.hunde ?? 0) >= 0.99) && ((await p.evaluate('window.__pieDelBanco ? window.__pieDelBanco.piezas().every((a) => !a.visible) : null')) as boolean | null) !== false : adentro.columnas.length > 0 && adentro.columnas.every((c) => c.clip.startsWith('inset(50'))
  const entradaBien = ultimo !== null && ultimo.fase === 'adentro' && nuncaLosDos && pieHundido && enteros(adentro.bloques.slice(0, 2)) && entrada.every((m) => Math.abs(m.y - y0) <= 2)

  // 2 · La respuesta y el WhatsApp.
  const primera = (await p.evaluate(`(() => { const b = document.getElementById('faq-del-pie-pregunta-0'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)) as { x: number; y: number } | null
  if (primera !== null) await p.mouse.click(primera.x, primera.y)
  const cambio1 = await muestrear(p, 2400)
  const conLaPrimera = await estilos(p)
  const cuarta = (await p.evaluate(`(() => { const b = document.getElementById('faq-del-pie-pregunta-3'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)) as { x: number; y: number } | null
  if (cuarta !== null) await p.mouse.click(cuarta.x, cuarta.y)
  const cambio2 = await muestrear(p, 2400)
  const conLaCuarta = await estilos(p)
  await p.screenshot({ path: path.join(SALIDA, `${String(width)}${ruta.replaceAll('/', '-')}-respuesta${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
  const bajaYSube = cambio1.some((m) => m.faq?.mostrado === 'aviso') && cambio1[cambio1.length - 1]?.faq?.mostrado === 0
  const respuestaBien = bajaYSube && conLaPrimera.respuesta0 && conLaPrimera.whatsapp && enteros(conLaPrimera.bloques) && cambio2[cambio2.length - 1]?.faq?.mostrado === 3 && conLaCuarta.respuesta3 && !conLaCuarta.respuesta0 && cambio2.every((m) => (m.faq?.whatsapp ?? 0) >= 0.99)

  // 3 · El teclado.
  await p.focus('#faq-del-pie-pregunta-0')
  await p.keyboard.press('ArrowDown')
  const trasLaFlecha = (await estilos(p)).activo
  await p.keyboard.press('Tab')
  const trasElTab = (await estilos(p)).activo
  await p.keyboard.press('Enter')
  await dormir(2400)
  const conEnter = await delFaq(p)
  const tecladoBien = trasLaFlecha === 'faq-del-pie-pregunta-1' && trasElTab === 'faq-del-pie-pregunta-2' && conEnter?.mostrado === 2

  // 4 · La salida (sin rebobinar el encastre del home).
  await p.evaluate('document.activeElement && document.activeElement.blur()')
  await p.mouse.move(width / 2, height / 2)
  await p.mouse.wheel(0, -400)
  const salida = await muestrear(p, 3100)
  const fuera = await estilos(p)
  await p.screenshot({ path: path.join(SALIDA, `${String(width)}${ruta.replaceAll('/', '-')}-fuera${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
  const finQuieto = !home || salida.every((m) => m.fin === null || m.fin >= 0.99)
  const ultimaSalida = salida[salida.length - 1]?.faq ?? null
  const salidaBien = ultimaSalida !== null && ultimaSalida.fase === 'fuera' && ultimaSalida.hunde === 0 && salida.every((m) => m.faq === null || Math.min(m.faq.niveles.pie, m.faq.niveles.faq) < 0.02) && salida.every((m) => Math.abs(m.y - y0) <= 2) && finQuieto && (home || fuera.columnas.every((c) => c.clip === 'none'))

  // 5 · El foco: lo trae y lo saca.
  await p.focus('#faq-del-pie-pregunta-0')
  await dormir(2400)
  const conFoco = await delFaq(p)
  await p.keyboard.press('Shift+Tab')
  await dormir(2600)
  const sinFoco = await delFaq(p)
  const focoBien = conFoco?.fase === 'adentro' && sinFoco?.fase === 'fuera'

  const datos = (await p.evaluate(DATOS)) as number
  const bien = entradaBien && respuestaBien && tecladoBien && salidaBien && focoBien && datos === 6
  const n = (v: number | null | undefined, d = 2): string => (v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d))
  const linea =
    `${bien ? 'ok   ' : 'FALLA'} ${String(width)} · ${ruta}` +
    ` · entrada ${entradaBien ? 'ok' : 'FALLA'} (${ultimo === null ? 'sin banco del FAQ' : `${ultimo.fase}, ${ultimo.volumen ? 'pie de volumen' : 'pie plano'}`}; nunca los dos arriba ${String(nuncaLosDos)}; el pie hundido ${String(pieHundido)}; la página se movió ${n(Math.max(...entrada.map((m) => Math.abs(m.y - y0))), 0)} px)` +
    ` · respuesta ${respuestaBien ? 'ok' : 'FALLA'} (aviso → ${String(cambio1[cambio1.length - 1]?.faq?.mostrado)} → ${String(cambio2[cambio2.length - 1]?.faq?.mostrado)}; WhatsApp ${conLaPrimera.whatsapp ? 'a la vista' : 'NO'}, abajo durante el cambio ${n(Math.min(...cambio2.map((m) => m.faq?.whatsapp ?? 0)))})` +
    ` · teclado ${tecladoBien ? 'ok' : 'FALLA'} (↓ ${trasLaFlecha}, Tab ${trasElTab}, Enter ${String(conEnter?.mostrado)})` +
    ` · salida ${salidaBien ? 'ok' : 'FALLA'} (${String(ultimaSalida?.fase)}, hunde ${n(ultimaSalida?.hunde)}; el encastre ${home ? `fin mínimo ${n(Math.min(...salida.map((m) => m.fin ?? 1)))}` : 'no aplica'})` +
    ` · foco ${focoBien ? 'ok' : 'FALLA'} (${String(conFoco?.fase)} → ${String(sinFoco?.fase)})` +
    ` · datos estructurados: ${String(datos)} preguntas`
  return { linea, bien }
}

async function lista(p: Page, ruta: string): Promise<{ readonly linea: string; readonly bien: boolean }> {
  const home = ruta === '/v3'
  // El pie al fondo del LAYOUT (donde corre el encastre) y después, la lista que cuelga.
  await p.evaluate('window.scrollTo({ top: document.documentElement.offsetHeight - innerHeight, behavior: "instant" })')
  await dormir(6000)
  const finAlPie = await fin(p)
  // La lista hasta la mitad del cuadro: el pie todavía asoma (el final del pie escucha los gestos) y la lista ya se ve.
  await p.evaluate('window.scrollTo({ top: document.documentElement.offsetHeight - innerHeight / 2, behavior: "instant" })')
  await dormir(1500)
  const enLaLista = (await p.evaluate(`(() => {
    const l = document.querySelector('[data-faq-del-pie="lista"]')
    if (!l) return null
    const r = l.getBoundingClientRect()
    const dedo = new TouchEvent('touchstart', { touches: [new Touch({ identifier: 1, target: l, clientX: 100, clientY: 300 })], cancelable: true, bubbles: true })
    l.dispatchEvent(dedo)
    const mueve = new TouchEvent('touchmove', { touches: [new Touch({ identifier: 1, target: l, clientX: 100, clientY: 360 })], cancelable: true, bubbles: true })
    l.dispatchEvent(mueve)
    return { aLaVista: r.top < innerHeight && r.bottom > 0, items: l.querySelectorAll('li').length, conRespuesta: [...l.querySelectorAll('li')].every((li) => (li.textContent || '').length > 40), botones: l.querySelectorAll('button').length, whatsapp: !!l.querySelector('a[href*="wa.me"]'), retenido: mueve.defaultPrevented }
  })()`)) as { aLaVista: boolean; items: number; conRespuesta: boolean; botones: number; whatsapp: boolean; retenido: boolean } | null
  await p.screenshot({ path: path.join(SALIDA, `390${ruta.replaceAll('/', '-')}-lista.png`), fullPage: false })
  const datos = (await p.evaluate(DATOS)) as number
  const listaBien = enLaLista !== null && enLaLista.aLaVista && enLaLista.items === 6 && enLaLista.conRespuesta && enLaLista.botones === 0 && !enLaLista.whatsapp && !enLaLista.retenido
  const encastreBien = !home || finAlPie === null || finAlPie > 0
  const bien = listaBien && encastreBien && datos === 6
  const linea =
    `${bien ? 'ok   ' : 'FALLA'} 390 · ${ruta} · lista ${listaBien ? 'ok' : 'FALLA'} (${enLaLista === null ? 'sin lista' : `${String(enLaLista.items)} preguntas, ${enLaLista.conRespuesta ? 'con' : 'SIN'} respuesta, ${String(enLaLista.botones)} botones, WhatsApp ${enLaLista.whatsapp ? 'SÍ' : 'no'}, el dedo ${enLaLista.retenido ? 'RETENIDO' : 'suelto'}`})` +
    ` · encastre al fondo del pie ${encastreBien ? 'ok' : 'FALLA'} (fin ${String(finAlPie)}) · datos estructurados: ${String(datos)} preguntas`
  return { linea, bien }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const lineas: { readonly linea: string; readonly bien: boolean }[] = []
  for (const ancho of ANCHOS) {
    const movil = ancho < 1024
    const alto = movil ? 844 : 900
    for (const ruta of RUTAS) {
      const perfil = path.join(os.homedir(), `.cache/b4-medicion/faq-perfil-${String(Date.now())}`)
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
        await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f); ${CONTROL === 'sin-hundimiento' ? 'window.__faqSinHundimiento = true;' : ''} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
        const p = ctx.pages()[0] ?? (await ctx.newPage())
        await p.route('**/api/**', (r) => r.abort())
        await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(ancho / 2, alto / 2)
        await dormir(7000)
        console.log(`·     ${String(ancho)} · ${ruta} · visible: ${String(await p.evaluate('document.visibilityState'))}`)
        const r = movil ? await lista(p, ruta) : await escenario(p, ruta)
        console.log(r.linea)
        lineas.push(r)
      } finally {
        await ctx.close()
      }
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  console.log(`faq: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} corridas dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR la entrada desde 1024)`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
