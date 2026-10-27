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
 * Abajo de 1024 (táctil), la LISTA: después del pie, cada pregunta con su respuesta en el DOM, sin WhatsApp ([C2 · 71t] un acordeón de
 * vidrio: un botón por pregunta; el toque, el vidrio y el desborde los mide `faq-telefono.ts`); con el pie al
 * fondo el encastre corre como siempre (el fondo del layout no cambió) y, con la lista a la vista, un dedo hacia arriba no se retiene.
 * En todos: los datos estructurados (`FAQPage`) con seis preguntas.
 *
 *   CONTROL=sin-hundimiento …  el pie no se hunde (`__faqSinHundimiento`): «la entrada» tiene que dar FALLA desde 1024.
 *
 * [C2-71] EL PIE Y EL FAQ DE ESCRITORIO (en el home, con el pie de volumen; `docs/rediseno/SPRINT-C2-71.md`):
 *   · EL BOTÓN: sale recién con el pie acostado entero (en ninguna muestra arriba sin `acostado`) y TOCARLO ES EL GESTO: la entrada del home
 *     se hace con un clic en el botón (`[data-bloque-del-faq="boton"] button`), sin mover la página; al final, otra entrada con la rueda;
 *     y UNA VEZ POR CARGA: después de ir al FAQ y volver, en 4 s no vuelve a salir;
 *   · LA SECUENCIA POR COLUMNAS: las dos columnas tienen su base (`__pieDelBanco.columnas().huecos` ≥ 2), el hueco se abre antes de que la
 *     plataforma baje y se cierra con la columna abajo del todo; los bloques del FAQ abren su hueco recién con el piso cerrado sobre el pie,
 *     y suben recién con su hueco abierto (`__pieDelBanco.faq()`); foto a mitad del hundimiento (`-a-mitad.png`);
 *   · LA RESPUESTA LARGA: la pregunta con la respuesta más larga; la placa de la derecha mide lo que su DOM (entra entera); foto
 *     (`-respuesta-larga.png`);
 *   · EL BUG DEL PIE (`lote2/19`): después de ir y volver del FAQ, abrir y cerrar el ingreso, subir al CTA y volver, cruzar los 1024 px
 *     (900 y de vuelta: la escena se rehace) y recargar, el formulario del pie vuelve en 3D (su placa armada y a la vista y sus rótulos del
 *     DOM transparentes: el 3D los dibuja).
 *
 *   CONTROL=boton-siempre …   el botón vuelve cada vez que el FAQ se va: «una vez» tiene que dar FALLA.
 *   CONTROL=boton-temprano …  el botón sale sin esperar a que el pie se acueste: «después de todo» tiene que dar FALLA.
 *   CONTROL=boton-sin-gesto … el botón no trae el FAQ: «botón = gesto» (la entrada del home) tiene que dar FALLA.
 *   CONTROL=contexto-global … lo perdido del contexto vuelve a ser uno para toda la página (el bug): «vuelta al pie» tiene que dar FALLA
 *                             (al cruzar los 1024 px).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,390').split(',').map(Number)
const RUTAS = (process.env.RUTAS ?? '/v3,/v3/pagina-base').split(',')
const CONTROL = process.env.CONTROL ?? ''
const CONTROLES = ['', 'sin-hundimiento', 'boton-siempre', 'boton-temprano', 'boton-sin-gesto', 'contexto-global']
if (!CONTROLES.includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: ${CONTROLES.slice(1).join(', ')}`)
const BANDERAS: Record<string, string> = { 'sin-hundimiento': '__faqSinHundimiento', 'boton-siempre': '__botonDelFaqSiempre', 'boton-temprano': '__botonDelFaqTemprano', 'boton-sin-gesto': '__botonDelFaqSinGesto', 'contexto-global': '__contextoDelLienzoGlobal' }
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('faq-del-pie')
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
  readonly boton?: { readonly usado: boolean; readonly nivel: number }
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
  const bloques = raiz ? [...raiz.querySelectorAll('[data-material="vidrio"], [data-bloque-del-faq]')].map(s) : []
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
  // [C2-71] Desde que la página llega al pie, en el home: el botón del FAQ sólo puede salir con el pie acostado entero.
  const vigia = home ? esperarElBoton(p) : null
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

  // [C2-71] 0 · El botón del FAQ (home, pie de volumen): esperar a que salga, mirando que sólo salga con el pie acostado.
  const deVolumen = home && (await delFaq(p))?.volumen === true
  const espera = vigia === null ? null : await vigia
  // 1 · La entrada: en el home de volumen, TOCANDO EL BOTÓN (es el gesto); si no, una rueda hacia abajo.
  if (deVolumen) await tocarElBoton(p)
  else await p.mouse.wheel(0, 400)
  const conLa3d = deVolumen ? muestrearEl3d(p, 2600, path.join(SALIDA, `${String(width)}${ruta.replaceAll('/', '-')}-a-mitad${CONTROL === '' ? '' : `-${CONTROL}`}.png`)) : null
  const entrada = conLa3d === null ? await muestrear(p, 2600) : (await conLa3d).serie
  const adentro = await estilos(p)
  await p.screenshot({ path: path.join(SALIDA, `${String(width)}${ruta.replaceAll('/', '-')}-adentro${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
  const ultimo = entrada[entrada.length - 1]?.faq ?? null
  const nuncaLosDos = entrada.every((m) => m.faq === null || Math.min(m.faq.niveles.pie, m.faq.niveles.faq) < 0.02)
  const pieHundido = home ? entrada.some((m) => (m.faq?.hunde ?? 0) >= 0.99) && ((await p.evaluate('window.__pieDelBanco ? window.__pieDelBanco.piezas().every((a) => !a.visible) : null')) as boolean | null) !== false : adentro.columnas.length > 0 && adentro.columnas.every((c) => c.clip.startsWith('inset(50'))
  const entradaBien = ultimo !== null && ultimo.fase === 'adentro' && nuncaLosDos && pieHundido && enteros(adentro.bloques.slice(0, 2)) && entrada.every((m) => Math.abs(m.y - y0) <= 2)
  // [C2-71] La secuencia por columnas y los bloques de volumen (sólo en el home de volumen).
  const secuencia = conLa3d === null ? null : secuenciaDe((await conLa3d).tres)

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

  // [C2-71] 2b · La respuesta más larga: la placa de la derecha mide lo que su DOM (entra entera); la foto.
  const larga = deVolumen ? await respuestaLarga(p, path.join(SALIDA, `${String(width)}${ruta.replaceAll('/', '-')}-respuesta-larga${CONTROL === '' ? '' : `-${CONTROL}`}.png`)) : null

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

  // [C2-71] 6 · En el home de volumen: el botón no vuelve en esta carga (4 s después de la última salida) y la rueda también entra.
  const unaVez = deVolumen ? await botonQueNoVuelve(p) : null
  let ruedaBien = true
  if (deVolumen) {
    await p.mouse.move(width / 2, height / 2)
    await p.mouse.wheel(0, 400)
    await dormir(2600)
    ruedaBien = (await delFaq(p))?.fase === 'adentro'
    await p.mouse.wheel(0, -400)
    await dormir(3000)
    ruedaBien = ruedaBien && (await delFaq(p))?.fase === 'fuera'
  }

  const datos = (await p.evaluate(DATOS)) as number
  const bien = entradaBien && respuestaBien && tecladoBien && salidaBien && focoBien && datos === 6 && (espera === null || espera.bien) && (secuencia === null || secuencia.bien) && (larga === null || larga.bien) && (unaVez === null || unaVez.bien) && ruedaBien
  const n = (v: number | null | undefined, d = 2): string => (v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d))
  const linea =
    `${bien ? 'ok   ' : 'FALLA'} ${String(width)} · ${ruta}` +
    ` · entrada ${entradaBien ? 'ok' : 'FALLA'} (${ultimo === null ? 'sin banco del FAQ' : `${ultimo.fase}, ${ultimo.volumen ? 'pie de volumen' : 'pie plano'}`}; nunca los dos arriba ${String(nuncaLosDos)}; el pie hundido ${String(pieHundido)}; la página se movió ${n(Math.max(...entrada.map((m) => Math.abs(m.y - y0))), 0)} px)` +
    ` · respuesta ${respuestaBien ? 'ok' : 'FALLA'} (aviso → ${String(cambio1[cambio1.length - 1]?.faq?.mostrado)} → ${String(cambio2[cambio2.length - 1]?.faq?.mostrado)}; WhatsApp ${conLaPrimera.whatsapp ? 'a la vista' : 'NO'}, abajo durante el cambio ${n(Math.min(...cambio2.map((m) => m.faq?.whatsapp ?? 0)))})` +
    ` · teclado ${tecladoBien ? 'ok' : 'FALLA'} (↓ ${trasLaFlecha}, Tab ${trasElTab}, Enter ${String(conEnter?.mostrado)})` +
    ` · salida ${salidaBien ? 'ok' : 'FALLA'} (${String(ultimaSalida?.fase)}, hunde ${n(ultimaSalida?.hunde)}; el encastre ${home ? `fin mínimo ${n(Math.min(...salida.map((m) => m.fin ?? 1)))}` : 'no aplica'})` +
    ` · foco ${focoBien ? 'ok' : 'FALLA'} (${String(conFoco?.fase)} → ${String(sinFoco?.fase)})` +
    ` · datos estructurados: ${String(datos)} preguntas` +
    (espera === null ? '' : ` · botón después de todo ${espera.bien ? 'ok' : 'FALLA'} (${espera.detalle})`) +
    (secuencia === null ? '' : ` · secuencia por columnas ${secuencia.bien ? 'ok' : 'FALLA'} (${secuencia.detalle})`) +
    (larga === null ? '' : ` · respuesta larga ${larga.bien ? 'ok' : 'FALLA'} (${larga.detalle})`) +
    (unaVez === null ? '' : ` · botón una vez ${unaVez.bien ? 'ok' : 'FALLA'} (${unaVez.detalle}) · la rueda también entra ${ruedaBien ? 'ok' : 'FALLA'}`)
  return { linea, bien }
}

// ═══════════════════════════════════════════════════════════════════════════
// [C2-71] El FAQ de volumen, el botón y el bug del pie.

interface Columnas { readonly porColumnas: boolean; readonly abre: number; readonly baja: number; readonly huecos: number }
interface BloqueDeVolumen { readonly id: string; readonly nivel: number; readonly abre: number; readonly sube: number; readonly visible: boolean; readonly alto: number }
interface MuestraEn3d { readonly columnas: Columnas | null; readonly faq: readonly BloqueDeVolumen[]; readonly boton: { readonly usado: boolean; readonly nivel: number } | null; readonly acostado: boolean }
const EN_3D = `(() => { const p = window.__pieDelBanco; const f = window.__faqDelBanco ? window.__faqDelBanco() : null; return { columnas: p && p.columnas ? p.columnas() : null, faq: p && p.faq ? p.faq() : [], boton: f ? f.boton : null, acostado: f ? f.acostado : false } })()`
const en3d = (p: Page): Promise<MuestraEn3d> => p.evaluate(EN_3D) as Promise<MuestraEn3d>
const resultado = (bien: boolean, detalle: string): { readonly bien: boolean; readonly detalle: string } => ({ bien, detalle })

/** Espera el botón (hasta 25 s) y mira que, en cada muestra en que se ve, el pie esté acostado entero. */
async function esperarElBoton(p: Page): Promise<{ readonly bien: boolean; readonly detalle: string }> {
  let antes = 0
  for (let i = 0; i < 250; i += 1) {
    const m = await en3d(p)
    const nivel = m.boton?.nivel ?? 0
    if (nivel > 0.01 && !m.acostado) antes += 1
    if (nivel >= 0.999) return resultado(antes === 0, `arriba a los ${String(i * 100)} ms${antes > 0 ? `, ${String(antes)} muestras arriba SIN el pie acostado` : ''}`)
    await dormir(100)
  }
  return resultado(false, 'el botón no salió en 25 s')
}

/** Toca el botón del FAQ (su centro, como lo ve el puntero: el DOM sobre su placa). */
async function tocarElBoton(p: Page): Promise<void> {
  const c = (await p.evaluate(`(() => { const b = document.querySelector('[data-bloque-del-faq="boton"] button'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)) as { x: number; y: number } | null
  if (c !== null) await p.mouse.click(c.x, c.y)
}

/** Las muestras de la entrada con lo de la escena (y la foto a mitad del hundimiento de las columnas). */
async function muestrearEl3d(p: Page, ms: number, foto: string): Promise<{ readonly serie: { readonly faq: DelFaq | null; readonly fin: number | null; readonly y: number }[]; readonly tres: MuestraEn3d[] }> {
  const serie: { faq: DelFaq | null; fin: number | null; y: number }[] = []
  const tres: MuestraEn3d[] = []
  let conFoto = false
  const desde = Date.now()
  while (Date.now() - desde < ms) {
    serie.push({ faq: await delFaq(p), fin: await fin(p), y: await scrollY(p) })
    const m = await en3d(p)
    tres.push(m)
    if (!conFoto && m.columnas !== null && m.columnas.baja > 0.35 && m.columnas.baja < 0.65) {
      conFoto = true
      await p.screenshot({ path: foto })
      // Una captura congela pasos del render (CLAUDE.md, `Page.captureScreenshot`): se vuelve a emular el cuadro.
      const v = p.viewportSize()
      if (v !== null) await p.setViewportSize(v)
    }
    await dormir(40)
  }
  return { serie, tres }
}

/** La secuencia por columnas y los bloques que suben después (las muestras de la entrada). */
function secuenciaDe(tres: readonly MuestraEn3d[]): { readonly bien: boolean; readonly detalle: string } {
  const cols = tres.map((m) => m.columnas).filter((c): c is Columnas => c !== null && c.porColumnas)
  const dos = cols.some((c) => c.huecos >= 2)
  const abreAntes = cols.every((c) => c.baja <= 0.02 || c.abre >= 0.95 || c.baja >= 0.999)
  let abierto = false
  let cierraAbajo = true
  for (const c of cols) {
    if (c.abre >= 0.95) abierto = true
    else if (abierto && c.abre < 0.95 && c.baja < 0.999) cierraAbajo = false
  }
  const faqDespues = tres.every((m) => !m.faq.some((b) => b.abre > 0 && b.id !== 'boton') || (m.columnas !== null && m.columnas.abre <= 0 && m.columnas.baja >= 0.999))
  const subeAbierto = tres.every((m) => m.faq.every((b) => b.sube <= 0.02 || b.abre >= 0.95))
  const arriba = tres.length > 0 && ['preguntas', 'respuesta'].every((id) => tres[tres.length - 1].faq.some((b) => b.id === id && b.visible && b.nivel >= 0.999))
  const bien = cols.length > 0 && dos && abreAntes && cierraAbajo && faqDespues && subeAbierto && arriba
  return resultado(bien, `${String(cols.length)} muestras por columnas; las dos con base ${String(dos)}; abre antes de bajar ${String(abreAntes)}; cierra abajo ${String(cierraAbajo)}; el FAQ abre después ${String(faqDespues)}; sube con su hueco abierto ${String(subeAbierto)}; las dos placas arriba ${String(arriba)}`)
}

/** La pregunta de respuesta más larga: su placa mide lo que el bloque del DOM (la respuesta entra entera) y la foto. */
async function respuestaLarga(p: Page, foto: string): Promise<{ readonly bien: boolean; readonly detalle: string }> {
  const i = (await p.evaluate(`(() => { let mejor = 0, largo = -1; document.querySelectorAll('[data-bloque-del-faq="respuesta"] [id^="faq-del-pie-respuesta-"]').forEach((e, k) => { const n = (e.textContent || '').length; if (n > largo) { largo = n; mejor = k } }); return mejor })()`)) as number
  const c = (await p.evaluate(`(() => { const b = document.getElementById('faq-del-pie-pregunta-${String(i)}'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)) as { x: number; y: number } | null
  if (c !== null) await p.mouse.click(c.x, c.y)
  await dormir(2600)
  await p.screenshot({ path: foto })
  const v = p.viewportSize()
  if (v !== null) await p.setViewportSize(v)
  const m = (await p.evaluate(`(() => { const b = document.querySelector('[data-bloque-del-faq="respuesta"]'); const r = document.getElementById('faq-del-pie-respuesta-${String(i)}'); const placa = (window.__pieDelBanco ? window.__pieDelBanco.faq() : []).find((x) => x.id === 'respuesta'); return b && r ? { alto: b.offsetHeight, entra: b.scrollHeight <= b.clientHeight + 1, aLaVista: !r.hidden, placa: placa ? placa.alto : -1, opacidad: Number(getComputedStyle(b).opacity) } : null })()`)) as { alto: number; entra: boolean; aLaVista: boolean; placa: number; opacidad: number } | null
  const bien = m !== null && m.aLaVista && m.entra && Math.abs(m.placa - m.alto) <= 1 && m.opacidad >= 0.999
  return resultado(bien, m === null ? 'sin el bloque de volumen' : `la ${String(i)}: el bloque ${String(m.alto)} px, la placa ${String(Math.round(m.placa))} px, entra ${String(m.entra)}, a la vista ${String(m.aLaVista)}`)
}

/** Después de ir al FAQ y volver: 4 s sin que el botón vuelva a salir (y ya usado). */
async function botonQueNoVuelve(p: Page): Promise<{ readonly bien: boolean; readonly detalle: string }> {
  let maximo = 0
  let usado = true
  for (let k = 0; k < 40; k += 1) {
    const m = await en3d(p)
    maximo = Math.max(maximo, m.boton?.nivel ?? 0)
    usado = usado && m.boton?.usado === true
    await dormir(100)
  }
  return resultado(maximo === 0 && usado, `nivel máximo ${maximo.toFixed(2)}, usado ${String(usado)}`)
}

/** El formulario del pie en 3D: su placa armada y a la vista, y sus rótulos del DOM transparentes (los dibuja la escena). */
const FORMULARIO = `(() => { const p = window.__pieDelBanco; const placa = p ? p.piezas().find((a) => a.id === 'formulario-del-pie') : null; const rotulo = document.querySelector('#contacto label'); return { placa: !!placa && placa.visible, rotuloTransparente: !!rotulo && getComputedStyle(rotulo).color === 'rgba(0, 0, 0, 0)' } })()`
async function alPie(p: Page): Promise<boolean> {
  await p.evaluate('window.scrollTo({ top: document.documentElement.offsetHeight, behavior: "instant" })')
  for (let i = 0; i < 60; i += 1) {
    const f = await delFaq(p)
    if (f !== null && f.acostado) break
    await dormir(500)
  }
  await dormir(1500)
  const m = (await p.evaluate(FORMULARIO)) as { placa: boolean; rotuloTransparente: boolean }
  return m.placa && m.rotuloTransparente
}

/** [C2-71] El bug del pie (`lote2/19`): las vueltas al pie que lo dejaban sin el formulario. */
async function vueltasAlPie(p: Page): Promise<{ readonly linea: string; readonly bien: boolean }> {
  const { width, height } = p.viewportSize() ?? { width: 1440, height: 900 }
  const casos: [string, boolean][] = []
  casos.push(['al llegar', await alPie(p)])
  // El ingreso: abrirlo y cerrarlo (Esc).
  const ingreso = p.locator('[data-pieza="barra-login"]').first()
  if ((await ingreso.count()) > 0) {
    await ingreso.click()
    await dormir(1500)
    await p.keyboard.press('Escape')
    await dormir(1500)
    casos.push(['tras el ingreso', await alPie(p)])
  } else casos.push(['tras el ingreso (sin el botón de ingreso)', false])
  // Subir al CTA (rebobina el encastre) y volver.
  await p.mouse.move(width / 2, height / 2)
  for (let k = 0; k < 8; k += 1) {
    await p.mouse.wheel(0, -500)
    await dormir(700)
  }
  await dormir(1500)
  casos.push(['tras subir al CTA y volver', await alPie(p)])
  // Cruzar los 1024 px y volver: la escena se rehace (el lienzo viejo pierde su contexto medio segundo después).
  await p.setViewportSize({ width: 900, height })
  await dormir(2500)
  await p.setViewportSize({ width, height })
  await dormir(3500)
  casos.push(['tras cruzar los 1024 px', await alPie(p)])
  // Recargar en el medio.
  await p.reload({ waitUntil: 'load' })
  await dormir(7000)
  casos.push(['tras recargar', await alPie(p)])
  const bien = casos.every(([, ok]) => ok)
  return { bien, linea: `${bien ? 'ok   ' : 'FALLA'} ${String(width)} · /v3 · vuelta al pie (el form en 3D): ${casos.map(([n, ok]) => `${n} ${ok ? 'ok' : 'FALLA'}`).join(', ')}` }
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
  const listaBien = enLaLista !== null && enLaLista.aLaVista && enLaLista.items === 6 && enLaLista.conRespuesta && enLaLista.botones === enLaLista.items && !enLaLista.whatsapp && !enLaLista.retenido
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
      const perfil = perfilDelBanco('faq')
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
        await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f); ${CONTROL === '' ? '' : `window.${BANDERAS[CONTROL]} = true;`} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
        const p = ctx.pages()[0] ?? (await ctx.newPage())
        await p.route('**/api/**', (r) => r.abort())
        await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(ancho / 2, alto / 2)
        await dormir(7000)
        console.log(`·     ${String(ancho)} · ${ruta} · visible: ${String(await p.evaluate('document.visibilityState'))}`)
        const r = movil ? await lista(p, ruta) : await escenario(p, ruta)
        console.log(r.linea)
        lineas.push(r)
        // [C2-71] El bug del pie: en el home, desde 1024.
        if (!movil && ruta === '/v3') {
          const v = await vueltasAlPie(p)
          console.log(v.linea)
          lineas.push(v)
        }
      } finally {
        await ctx.close()
      }
    }
  }
  writeFileSync(path.join(SALIDA, `resultados${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), lineas.map((l) => l.linea).join('\n'))
  const ESPERADO: Record<string, string> = { 'sin-hundimiento': 'la entrada (y la secuencia por columnas) desde 1024', 'boton-siempre': 'el botón una vez', 'boton-temprano': 'el botón después de todo', 'boton-sin-gesto': 'la entrada del home (el botón es el gesto)', 'contexto-global': 'la vuelta al pie (tras cruzar los 1024 px)' }
  console.log(`faq: ${String(lineas.filter((l) => l.bien).length)} de ${String(lineas.length)} corridas dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL}: tiene que FALLAR ${ESPERADO[CONTROL] ?? ''})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
