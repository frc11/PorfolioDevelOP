/**
 * [C2 · 60c] EL CTA DEL PANEL, EN EL SITIO — lo que `s6-cta-del-panel` afirma sobre el marcado y sólo el navegador puede medir. El Chrome
 * del sistema, a la vista, contra el dev o el build (`BASE`). TODA `/api/` se intercepta: `/api/newsletter` la contesta el banco con
 * `page.route` (nunca la ruta real: la base es compartida con Franco); el resto se corta.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/cta-del-panel.ts
 *   ANCHOS=1440x900,1024x768,768x1024,390x844 …   los tamaños (por defecto, esos cuatro; abajo de 1024, táctil)
 *
 * Por tamaño, con el CTA en pantalla (el titular arriba):
 *   A · «acá.» SOLO en el último renglón: su caja es un renglón, debajo de todo el resto del texto, y nada del texto comparte su renglón;
 *   B · las columnas y el divisor: desde 1024, «Probar el panel» | divisor | novedades lado a lado, y el divisor PARADO del alto de la
 *       fila, con «o si no» en el hueco entre sus dos tramos; abajo de 1024, una columna (la bajada, «Probar el panel» con su botón, el
 *       divisor ACOSTADO con «o si no», las novedades y el aviso, en ese orden);
 *   C · la entrada desde abajo: llevada la bajada a cruzar la línea, su hijo se corre en y (más de 4 px) y nunca en x;
 *   D · el botón en reposo, por cuadro durante 6,6 s (dos ciclos): dos medio-apretones a ~3 s (se hunde a ~0,94 y rebota a más de 1),
 *       quieto en 1 el resto del ciclo, y el reflejo de `Reluciente` que lo barre;
 *   E · el hover (sólo con mouse, desde 1024): se levanta ~4 px, el reposo se calla y el reflejo se intensifica (opacidad ≥ 0,5);
 *   F · el apretón: presionado se aplasta (≤ 0,92) y al soltar rebota (pasa de 1) y vuelve a 1;
 *   G · la newsletter: un mail inválido no envía y muestra el error del campo; ÉXITO (200 a los 300 ms): la carga, «¡Listo!» y el form
 *       vuelve vacío; ERROR (500 a los 900 ms): «Algo falló» y el form vuelve con lo escrito; el cuerpo que viaja es sólo `{ mail }`.
 * Y anota el alto del CTA y de la sección (en pantallas), para la REGLA DE ALTURAS. Fotos (el CTA, y el botón quieto, con el mouse y
 * apretado) y un video por tamaño en ~/.cache/b4-medicion/cta-del-panel. Las fotos van al final de cada paso: una captura congela los
 * pasos de render (CLAUDE.md), así que después de cada una se vuelve a poner el tamaño de la ventana.
 *
 *   CONTROL=aca-en-linea     «acá.» en línea (una hoja inyectada): A tiene que dar FALLA.
 *   CONTROL=sin-hueco        «o si no» escondido: B tiene que dar FALLA.
 *   CONTROL=de-costado       el gatillo corrido también en x: C tiene que dar FALLA.
 *   CONTROL=sin-reposo       la animación del reposo cancelada: D tiene que dar FALLA.
 *   CONTROL=sin-gestos       la transformada del botón anulada: E y F tienen que dar FALLA.
 *   CONTROL=envio-al-reves   la ruta contesta al revés (500 al éxito, 200 al error): G tiene que dar FALLA.
 *   CONTROL=con-nombre       la página manda también el nombre: G tiene que dar FALLA (el cuerpo no es sólo el mail).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const CONTROLES = ['', 'aca-en-linea', 'sin-hueco', 'de-costado', 'sin-reposo', 'sin-gestos', 'envio-al-reves', 'con-nombre']
const CONTROL = process.env.CONTROL ?? ''
if (!CONTROLES.includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: ${CONTROLES.filter(Boolean).join(' | ')}`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/cta-del-panel')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const CTA = '[data-pieza="cta-del-panel"]'
const HOJAS: Readonly<Record<string, string>> = {
  'aca-en-linea': '[data-parte="remate-del-texto"] { display: inline !important; }',
  'sin-hueco': '[data-pieza="o-del-cta"] > p { display: none !important; }',
  'de-costado': `${CTA} [data-gatillo] > div { --tw-translate-x: 2rem !important; }`,
  'sin-gestos': '[data-pieza="probar-ahora"] { transform: none !important; }',
}

interface Resultado {
  readonly linea: string
  readonly bien: boolean
}
const resultados: Resultado[] = []
function anotar(bien: boolean, texto: string): void {
  const linea = `${bien ? 'ok   ' : 'FALLA'} ${texto}`
  console.log(linea)
  resultados.push({ linea, bien })
}

/** Lleva el tope del elemento a `fraccion` del alto (scroll instantáneo) y espera dos cuadros. */
async function llevar(p: Page, selector: string, fraccion: number): Promise<void> {
  await p.evaluate(([s, f]) => {
    const el = document.querySelector(s as string)
    if (el === null) return
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * (f as number), behavior: 'instant' })
  }, [selector, fraccion] as const)
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}

/** Una serie por cuadro (rAF) durante `ms`, de lo que devuelve `medida` (el cuerpo de una función, en texto). */
async function porCuadro<T>(p: Page, ms: number, medida: string): Promise<(T & { readonly t: number })[]> {
  return (await p.evaluate(`new Promise((listo) => { const serie = []; const t0 = performance.now(); const medir = ${medida};
    const paso = () => { const t = performance.now() - t0; serie.push({ t, ...medir() }); if (t < ${String(ms)}) requestAnimationFrame(paso); else listo(serie) }; requestAnimationFrame(paso) })`)) as (T & { readonly t: number })[]
}

/** Una captura y, después, el tamaño otra vez (una captura congela los pasos de render). */
async function foto(p: Page, nombre: string, ancho: number, alto: number): Promise<void> {
  await p.screenshot({ path: path.join(SALIDA, `${nombre}.png`) }).catch(() => undefined)
  await p.setViewportSize({ width: ancho, height: alto })
  await dormir(150)
}

const MEDIDA_DEL_BOTON = `() => {
  const env = document.querySelector('[data-pieza="probar-el-panel"]'); const b = document.querySelector('[data-pieza="probar-ahora"]')
  const rel = b.querySelector('[data-reluciente="caja"]'); const cs = getComputedStyle(b); const antes = getComputedStyle(rel, '::before')
  const m = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform)
  const sEnv = getComputedStyle(env).scale
  return { reposo: sEnv === 'none' ? 1 : Number(sEnv.split(' ')[0]), escala: m.a, y: m.f, brillo: Number(antes.opacity), franja: antes.transform }
}`
interface MedidaDelBoton {
  readonly reposo: number
  readonly escala: number
  readonly y: number
  readonly brillo: number
  readonly franja: string
}

async function acaYColumnas(p: Page, tag: string, escritorio: boolean): Promise<void> {
  const m = await p.evaluate(() => {
    const caja = (s: string): DOMRect | null => document.querySelector(s)?.getBoundingClientRect() ?? null
    const remate = document.querySelector('[data-parte="remate-del-texto"]')
    const texto = remate?.parentElement?.firstChild ?? null
    const rango = document.createRange()
    if (texto !== null) rango.selectNodeContents(texto)
    const delTexto = texto === null ? [] : [...rango.getClientRects()].filter((r) => r.width > 0)
    const deAca = remate === null ? [] : [...remate.getClientRects()].filter((r) => r.width > 0)
    const tramos = [...document.querySelectorAll('[data-pieza="o-del-cta"] [data-parte="tramo"]')].map((t) => t.getBoundingClientRect())
    const o = document.querySelector('[data-pieza="o-del-cta"] > p')
    const oCaja = o === null || getComputedStyle(o).display === 'none' ? null : o.getBoundingClientRect()
    return {
      delTexto: delTexto.map((r) => ({ top: r.top, bottom: r.bottom })), deAca: deAca.map((r) => ({ top: r.top, bottom: r.bottom })),
      probar: caja('[data-pieza="columna-probar"]'), boton: caja('[data-pieza="probar-ahora"]'), novedades: caja('[data-pieza="columna-novedades"]'),
      bajada: caja('[data-pieza="bajada-del-cta"]'), aviso: caja('[data-pieza="aviso-de-scroll"]'), fila: caja('[data-pieza="fila-del-cta"]'),
      tramos: tramos.map((r) => ({ top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height })),
      o: oCaja === null ? null : { top: oCaja.top, bottom: oCaja.bottom, left: oCaja.left, right: oCaja.right },
    }
  })
  const aca = m.deAca[0]
  const acaBien = m.deAca.length === 1 && aca !== undefined && m.delTexto.length > 0 && m.delTexto.every((r) => r.bottom <= aca.top + 1)
  anotar(acaBien, `${tag} A · «acá.» solo en el último renglón (${String(m.delTexto.length)} cajas del texto arriba, «acá.» en ${String(m.deAca.length)} renglón)`)
  const [t1, t2] = m.tramos
  const { probar, novedades, boton, bajada, aviso, fila, o } = m
  let columnas = false
  let detalle = 'faltan piezas'
  if (t1 !== undefined && t2 !== undefined && o !== null && probar !== null && novedades !== null && boton !== null && bajada !== null && aviso !== null && fila !== null) {
    if (escritorio) {
      const parado = t1.height > 20 && t2.height > 20 && t1.width <= 2 && t1.bottom <= o.top + 1 && o.bottom <= t2.top + 1
      const alto = Math.abs(t1.top - fila.top) <= 2 && Math.abs(t2.bottom - fila.bottom) <= 2
      columnas = parado && alto && probar.right <= t1.left && t2.right <= novedades.left && Math.abs(probar.top - novedades.top) <= 2
      detalle = `divisor ${parado ? 'parado' : 'NO PARADO'}, ${alto ? 'del alto de la fila' : 'MÁS CORTO QUE LA FILA'}, columnas ${probar.right <= t1.left && t2.right <= novedades.left ? 'a los lados' : 'ENCIMADAS'}`
    } else {
      const acostado = t1.width > 40 && t2.width > 40 && t1.height <= 2 && t1.right <= o.left + 1 && o.right <= t2.left + 1
      const orden = bajada.bottom <= probar.top && boton.bottom <= o.top && o.bottom <= novedades.top && novedades.bottom <= aviso.top
      columnas = acostado && orden
      detalle = `divisor ${acostado ? 'acostado' : 'NO ACOSTADO'}, orden ${orden ? 'bajada · probar · divisor · novedades · aviso' : 'ROTO'}`
    }
  }
  anotar(columnas, `${tag} B · las columnas y el divisor con «o si no»: ${detalle}`)
}

async function entradaDesdeAbajo(p: Page, tag: string): Promise<void> {
  const bajada = `${CTA} [data-gatillo]`
  await llevar(p, bajada, 1.4)
  await dormir(900)
  await llevar(p, bajada, 0.8)
  const serie = await porCuadro<{ readonly x: number; readonly y: number }>(p, 900, `() => {
    const hijo = document.querySelector('${CTA} [data-gatillo] > div'); const t = getComputedStyle(hijo).translate
    const [x, y] = t === 'none' ? [0, 0] : t.split(' ').map((v) => parseFloat(v)); return { x: x || 0, y: y || 0 } }`)
  const maxY = Math.max(...serie.map((s) => s.y))
  const maxX = Math.max(...serie.map((s) => Math.abs(s.x)))
  anotar(maxY > 4 && maxX < 0.5 && (serie[serie.length - 1]?.y ?? 1) < 0.5, `${tag} C · la bajada entra desde abajo: hasta ${maxY.toFixed(1)} px en y, ${maxX.toFixed(1)} px en x, termina en su lugar`)
}

async function boton(p: Page, cdp: CDPSession, tag: string, escritorio: boolean, ancho: number, alto: number): Promise<void> {
  await llevar(p, '[data-pieza="probar-el-panel"]', 0.55)
  await p.mouse.move(2, 2)
  await dormir(600)
  if (CONTROL === 'sin-reposo') await p.evaluate(() => document.querySelector('[data-pieza="probar-el-panel"]')?.getAnimations().forEach((a) => a.cancel()))
  const reposo = await porCuadro<MedidaDelBoton>(p, 6600, MEDIDA_DEL_BOTON)
  // Los medio-apretones: tramos seguidos con la escala del reposo por debajo de 0,97; de cada uno, su fondo y el rebote que le sigue.
  const apretones: { readonly t: number; readonly fondo: number; readonly rebote: number }[] = []
  for (let i = 0; i < reposo.length; i += 1) {
    if (reposo[i].reposo >= 0.97 || (i > 0 && reposo[i - 1].reposo < 0.97)) continue
    const tramo = reposo.slice(i, i + 40)
    apretones.push({ t: reposo[i].t, fondo: Math.min(...tramo.map((r) => r.reposo)), rebote: Math.max(...tramo.map((r) => r.reposo)) })
  }
  const periodos = apretones.slice(1).map((a, i) => a.t - apretones[i].t)
  const quieto = reposo.filter((r) => Math.abs(r.reposo - 1) < 0.002).length / Math.max(1, reposo.length)
  const franjas = new Set(reposo.map((r) => r.franja)).size
  const reposoBien = apretones.length >= 2 && apretones.every((a) => a.fondo >= 0.92 && a.fondo <= 0.96 && a.rebote > 1.005) && periodos.every((d) => Math.abs(d - 3000) <= 300) && quieto >= 0.7 && franjas >= 3
  anotar(reposoBien, `${tag} D · el reposo: ${String(apretones.length)} medio-apretones (fondos ${apretones.map((a) => a.fondo.toFixed(3)).join(', ')}; rebotes ${apretones.map((a) => a.rebote.toFixed(3)).join(', ')}; cada ${periodos.map((d) => d.toFixed(0)).join(', ')} ms), quieto el ${(quieto * 100).toFixed(0)} %, el reflejo en ${String(franjas)} posiciones`)
  await foto(p, `${tag}-boton-quieto`, ancho, alto)
  const caja = await p.locator('[data-pieza="probar-ahora"]').boundingBox()
  if (caja === null) return
  const centro = { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 }
  if (escritorio) {
    await p.mouse.move(centro.x, centro.y, { steps: 4 })
    const hover = await porCuadro<MedidaDelBoton>(p, 900, MEDIDA_DEL_BOTON)
    const final = hover[hover.length - 1]
    const hoverBien = final !== undefined && Math.abs(final.y + 4) <= 1 && hover.slice(-20).every((h) => Math.abs(h.reposo - 1) < 0.002) && final.brillo >= 0.5
    anotar(hoverBien, `${tag} E · el hover: sube ${final === undefined ? '—' : (-final.y).toFixed(1)} px, el reposo ${hover.slice(-20).every((h) => Math.abs(h.reposo - 1) < 0.002) ? 'callado' : 'SIGUE'}, el reflejo a ${final?.brillo.toFixed(2) ?? '—'}`)
    await foto(p, `${tag}-boton-hover`, ancho, alto)
    await p.mouse.move(centro.x, centro.y)
    await p.mouse.down()
  } else {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: centro.x, y: centro.y }] })
  }
  const abajo = await porCuadro<MedidaDelBoton>(p, 400, MEDIDA_DEL_BOTON)
  // Con el dedo, sin foto en el medio: un toque largo podría volverse el menú del navegador (y cancelar el puntero).
  if (escritorio) await foto(p, `${tag}-boton-apretado`, ancho, alto)
  if (escritorio) await p.mouse.up()
  else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  const suelto = await porCuadro<MedidaDelBoton>(p, 900, MEDIDA_DEL_BOTON)
  const fondo = Math.min(...abajo.map((a) => a.escala))
  const pico = Math.max(...suelto.map((s) => s.escala))
  const ultimo = suelto[suelto.length - 1]?.escala ?? 0
  anotar(fondo <= 0.92 && pico > 1.005 && Math.abs(ultimo - 1) < 0.01, `${tag} F · el apretón: se aplasta a ${fondo.toFixed(3)}, al soltar rebota a ${pico.toFixed(3)} y vuelve a ${ultimo.toFixed(3)}`)
  await p.mouse.move(2, 2)
}

interface Pedido {
  estado: number
  ms: number
  readonly cuerpos: string[]
}

async function newsletter(p: Page, tag: string, pedido: Pedido): Promise<void> {
  const raiz = '[data-pieza="newsletter-del-panel"]'
  await llevar(p, raiz, 0.3)
  const vista = (): Promise<{ readonly vista: string; readonly texto: string; readonly nombre: string; readonly mail: string }> =>
    p.evaluate((r) => {
      const e = document.querySelector(`${r} [data-pieza="estado-de-envio"]`) as HTMLElement | null
      const valor = (id: string): string => (document.getElementById(id) as HTMLInputElement | null)?.value ?? ''
      return { vista: e?.dataset.vista ?? '', texto: e?.querySelector('[data-parte="mensaje-del-envio"]')?.textContent ?? '', nombre: valor('tu-panel-novedades-nombre'), mail: valor('tu-panel-novedades-mail') }
    }, raiz)
  // Inválido: no envía y muestra el error del campo.
  const antes = pedido.cuerpos.length
  await p.fill('#tu-panel-novedades-mail', 'ana')
  await p.click(`${raiz} button[type="submit"]`)
  await dormir(500)
  const errorVisible = await p.locator('#tu-panel-novedades-error').isVisible().catch(() => false)
  const invalidoBien = pedido.cuerpos.length === antes && errorVisible && (await vista()).vista === 'formulario'
  const envio = async (tipo: 'exito' | 'error', estado: number, ms: number): Promise<boolean> => {
    pedido.estado = estado
    pedido.ms = ms
    await p.fill('#tu-panel-novedades-nombre', 'Ana Prueba')
    await p.fill('#tu-panel-novedades-mail', 'ana@ejemplo.com')
    await p.click(`${raiz} button[type="submit"]`)
    const vistas: string[] = []
    let texto = ''
    const fin = Date.now() + ms + 8000
    let ultima = await vista()
    while (Date.now() < fin) {
      ultima = await vista()
      if (vistas[vistas.length - 1] !== ultima.vista) vistas.push(ultima.vista)
      if (ultima.texto !== '') texto = ultima.texto
      if (ultima.vista === 'formulario' && vistas.includes(tipo)) break
      await dormir(60)
    }
    const titulo = tipo === 'exito' ? '¡Listo!' : 'Algo falló'
    const datos = tipo === 'exito' ? ultima.nombre === '' && ultima.mail === '' : ultima.nombre === 'Ana Prueba' && ultima.mail === 'ana@ejemplo.com'
    const bien = vistas.includes('carga') && vistas.includes(tipo) && texto.includes(titulo) && ultima.vista === 'formulario' && datos
    anotar(bien, `${tag} G · ${tipo}: ${vistas.join(' → ')} («${texto.slice(0, 40)}»), vuelve ${datos ? (tipo === 'exito' ? 'vacío' : 'con lo escrito') : 'MAL'}`)
    return bien
  }
  anotar(invalidoBien, `${tag} G · un mail inválido no envía (${String(pedido.cuerpos.length - antes)} envíos) y ${errorVisible ? 'muestra' : 'NO MUESTRA'} el error del campo`)
  await envio('exito', 200, 300)
  await envio('error', 500, 900)
  const soloMail = pedido.cuerpos.length >= 2 && pedido.cuerpos.every((c) => JSON.stringify(Object.keys(JSON.parse(c) as Record<string, unknown>)) === '["mail"]')
  anotar(soloMail, `${tag} G · el cuerpo que viaja: ${pedido.cuerpos.join(' · ') || '(ninguno)'} (sólo el mail; la ruta no acepta el nombre)`)
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const [ancho, alto] of ANCHOS) {
    const escritorio = ancho >= 1024
    const tag = `${String(ancho)}x${String(alto)}`
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/cta-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: !escritorio,
      hasTouch: !escritorio,
      recordVideo: { dir: path.join(SALIDA, `video-${tag}`), size: { width: ancho, height: alto } },
      args: [`--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      if (CONTROL === 'con-nombre') {
        await ctx.addInitScript(`(() => { const f = window.fetch; window.fetch = (u, o) => String(u).includes('/api/newsletter') && o && o.body ? f(u, { ...o, body: JSON.stringify({ ...JSON.parse(o.body), nombre: 'Ana Prueba' }) }) : f(u, o) })()`)
      }
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      const pedido: Pedido = { estado: 200, ms: 300, cuerpos: [] }
      await p.route('**/api/**', async (r) => {
        if (!r.request().url().includes('/api/newsletter')) return r.abort()
        pedido.cuerpos.push(r.request().postData() ?? '')
        await dormir(pedido.ms)
        const estado = CONTROL === 'envio-al-reves' ? (pedido.estado === 200 ? 500 : 200) : pedido.estado
        return r.fulfill({ status: estado, contentType: 'application/json', body: estado === 200 ? '{"ok":true}' : '{"ok":false,"error":"x"}' })
      })
      await p.goto(`${BASE}/v3?preloader=no`, { waitUntil: 'load', timeout: 300000 })
      await dormir(4000)
      const visible = (await p.evaluate('document.visibilityState === "visible" && innerWidth > 0')) as boolean
      if (!visible) throw new Error('la pestaña no está visible: toda medición de scroll daría cero')
      const hoja = HOJAS[CONTROL]
      if (hoja !== undefined) await p.addStyleTag({ content: hoja })
      const cdp = await ctx.newCDPSession(p)
      await entradaDesdeAbajo(p, tag)
      await llevar(p, CTA, 0)
      await dormir(1500)
      const altos = await p.evaluate((s) => ({ cta: document.querySelector(s)?.getBoundingClientRect().height ?? 0, panel: document.querySelector('[data-panel="tu-panel"]')?.getBoundingClientRect().height ?? 0, ventana: innerHeight }), CTA)
      console.log(`·     ${tag} · el CTA mide ${altos.cta.toFixed(0)} px (${(altos.cta / altos.ventana).toFixed(2)} pantallas); la sección, ${altos.panel.toFixed(0)} px (${(altos.panel / altos.ventana).toFixed(2)} pantallas)`)
      await acaYColumnas(p, tag, escritorio)
      await foto(p, `${tag}-cta`, ancho, alto)
      await boton(p, cdp, tag, escritorio, ancho, alto)
      await newsletter(p, tag, pedido)
      await llevar(p, '[data-pieza="aviso-de-scroll"]', 0.7)
      await foto(p, `${tag}-novedades-y-aviso`, ancho, alto)
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), resultados.map((r) => r.linea).join('\n'))
  const fallas = resultados.filter((r) => !r.bien).length
  console.log(`\n${String(resultados.length)} criterios, ${String(fallas)} fallas${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que haber fallas en su criterio)`}`)
  process.exitCode = fallas > 0 && CONTROL === '' ? 1 : 0
}

void main()
