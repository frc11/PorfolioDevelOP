/**
 * [C2-70e] EL VOLTEO DE «SEIS RAZONES» Y LA SALIDA DEL ARO, contra el dev server (Chrome del sistema, a la vista, `/api/` bloqueado), a 1440 × 900
 * (`TAMANO=1024x768` para otro).
 *   BASE=http://localhost:3000 npx tsx scripts-carga/resenas-volteo.ts                     (MODO=volteo, por defecto)
 *   MODO=salida npx tsx scripts-carga/resenas-volteo.ts
 *   CONTROL=sin-juntar npx tsx scripts-carga/resenas-volteo.ts                            (tiene que FALLAR: las mitades no se corren)
 *   MODO=salida CONTROL=sin-camara npx tsx scripts-carga/resenas-volteo.ts                (tiene que FALLAR el aro; el cartel, en verde)
 *   MODO=salida CONTROL=sin-espera npx tsx scripts-carga/resenas-volteo.ts                (tiene que FALLAR el cartel: el sostén sin la espera)
 * Los controles van por la bandera de prueba `?resenas-control=` (sin ella, el sitio de siempre).
 *
 * VOLTEO: con el gatillo (el defecto), entra al tramo de las reseñas con la rueda y registra cada cuadro (requestAnimationFrame) del volteo: el
 * giro y su ángulo, el centro en pantalla (proyectado) de la mitad que se ve de cada lado, el corrimiento pedido, la opacidad de los valores y
 * la entrada del aro. Criterio: al terminar, «Lo que dicen nuestros clientes» en un renglón centrado (centro a ≤ 2 % del ancho, hueco entre
 * mitades ≤ 60 px; al empezar, > 300), cada cara se acerca al centro sin volver, el corrimiento va con la curva del ángulo (≤ 0,05) y hay
 * cuadros con los cuatro a la vez (giro, corrimiento y valores a mitad, el aro entrando). Después, otra pasada sólo para las fotos (~8, en
 * `~/.cache/b4-medicion/resenas-volteo/`): sacar fotos congela los pasos de render, así que no se mezclan con la medición.
 *
 * SALIDA: con el aro leyéndose al final del tramo, la rueda baja ~1,2 pantallas (la cámara del recorrido llega a C) y se registra cada cuadro
 * 6 s: la bajada, la caja en pantalla de las placas dibujadas y la cámara viva. Criterio: mientras quedan placas (bajada de 0,02 a 0,9) el
 * aro no pasa el borde de abajo (su arriba < alto − 8 px); la cámara deja B (pasa 22 de distancia) recién con el aro guardado (bajada ≥ 0,85); llega a C (altura
 * 4,5 ± 0,8 y distancia 30,75 ± 1,2, quieta el último medio segundo) sin salto (ningún cuadro mueve la cámara más de 3 veces lo de sus
 * vecinos y más de 0,3). [C2-70e, verificación] Y EL CARTEL ENTERO: en todos los cuadros (uno de cada tres), las letras del cartel (las del
 * CTA en la escena y el título de volumen de las reseñas, mientras se ve) quedan debajo del borde de abajo de la barra y adentro del cuadro.
 * Y ~6 fotos en otra pasada (`~/.cache/b4-medicion/resenas-salida/`).
 */
import { mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const MODO = process.env.MODO ?? 'volteo'
const CONTROL = process.env.CONTROL ?? ''
const [ANCHO, ALTO] = (process.env.TAMANO ?? '1440x900').split('x').map(Number)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `C:/Users/Valentino/.cache/b4-medicion/resenas-volteo-${String(Date.now())}`
const SALIDA = path.join(os.homedir(), `.cache/b4-medicion/resenas-${MODO === 'salida' ? 'salida' : 'volteo'}`)
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const vuelta = (g: number): number => {
  const u = Math.min(1, Math.max(0, g))
  return u * u * (3 - 2 * u)
}

interface Caja {
  readonly izquierda: number
  readonly derecha: number
  readonly arriba: number
  readonly abajo: number
}
interface Cuadro {
  readonly t: number
  readonly r: { giro: number; disolucion: number; entrada: number; corrimientos: number[]; bajada: number; transformacion: number; pesoDeLaCamara: number; esperaDelCta: number; delCta: number } | null
  readonly aro: { entrada: number; bajada: number; placasVisibles: number; enElCuadro: { arriba: number; abajo: number } | null; logo: { y0: number } } | null
  readonly titulos: { id: string; visible: boolean; caja: Caja }[]
  readonly camara: number[] | null
  readonly valores: number[]
  /** Las cajas (px) de lo que dibuja el CTA en su marco (el cartel y HABLANOS), uno de cada tres cuadros en la salida; `null` en los otros. */
  readonly cartel: { x: number; y: number; ancho: number; alto: number }[] | null
}

/**
 * El registrador: cada cuadro durante `ms`, en `window.__registro` (lee los bancos que publica el sitio con `__entornoDeLaEscena`). En la
 * salida, los títulos y el cartel del CTA uno de cada tres cuadros (medir sus cajas cuesta).
 */
const REGISTRAR = (ms: number, salida: boolean): string => `(() => {
  window.__registro = []
  const t0 = performance.now()
  const ids = ['frase-izquierda', 'frase-derecha', 'resenas-izquierda', 'resenas-derecha']
  let n = 0
  const paso = () => {
    const tb = window.__titulosDelBanco
    const medir = !${String(salida)} || n % 3 === 0
    n += 1
    const titulos = medir && tb ? tb.titulos().filter((x) => ids.includes(x.id)).map((x) => ({ id: x.id, visible: x.visible, caja: x.enElCuadro })) : []
    const cta = ${String(salida)} && medir && window.__ctaDelBanco ? window.__ctaDelBanco() : null
    window.__registro.push({
      t: performance.now() - t0,
      r: window.__resenasDelBanco ? window.__resenasDelBanco() : null,
      aro: window.__aroDelBanco ? window.__aroDelBanco() : null,
      titulos,
      camara: tb ? tb.camara().viva : null,
      valores: [...document.querySelectorAll('[data-pieza="valor-en-volumen"]')].map((e) => Number(getComputedStyle(e).opacity)),
      cartel: cta ? cta.cajas().filter((c) => c.grupo === 'cta3d:cta del final' && c.ancho > 0) : null,
    })
    if (performance.now() - t0 < ${String(ms)}) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
})()`

async function irA(p: Page, pantallas: number): Promise<void> {
  const y = await p.evaluate(`(() => { const pin = document.querySelector('[data-pieza="escenario-del-final"]')?.parentElement; return pin ? Math.round(pin.getBoundingClientRect().top + scrollY + ${String(pantallas)} * innerHeight) : null })()`)
  await p.evaluate(`window.scrollTo({ top: ${String(y)}, behavior: 'instant' })`)
}

async function rueda(p: Page, muescas: number): Promise<void> {
  for (let k = 0; k < muescas; k += 1) {
    await p.mouse.wheel(0, 100)
    await dormir(40)
  }
}

/** Fotos seguidas (jpeg), re-mandando las métricas después de cada una (la captura congela los pasos de render). */
async function fotos(p: Page, cdp: CDPSession, n: number, cadaMs: number, nombre: string): Promise<unknown[]> {
  const estados: unknown[] = []
  for (let k = 0; k < n; k += 1) {
    const archivo = path.join(SALIDA, `${nombre}-${String(ANCHO)}-${String(k).padStart(2, '0')}${CONTROL === '' ? '' : `-${CONTROL}`}.jpg`)
    await p.screenshot({ path: archivo, type: 'jpeg', quality: 80 })
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: false })
    estados.push({ archivo: path.basename(archivo), estado: await p.evaluate('window.__resenasDelBanco ? window.__resenasDelBanco() : null') })
    await dormir(cadaMs)
  }
  return estados
}

const centro = (c: Caja): number => (c.izquierda + c.derecha) / 2
const mitadQueSeVe = (q: Cuadro, lado: 'izquierda' | 'derecha'): { id: string; caja: Caja } | null => q.titulos.find((x) => x.visible && x.id.endsWith(lado)) ?? null

function criteriosDelVolteo(cuadros: readonly Cuadro[]): Record<string, unknown> {
  const filas = cuadros.flatMap((q) => {
    const [i, d, r] = [mitadQueSeVe(q, 'izquierda'), mitadQueSeVe(q, 'derecha'), q.r]
    if (i === null || d === null || r === null) return []
    return [{ t: Math.round(q.t), giro: r.giro, angulo: 180 * vuelta(r.giro), caras: `${i.id}|${d.id}`, centroI: centro(i.caja), centroD: centro(d.caja), centroDelRenglon: (i.caja.izquierda + d.caja.derecha) / 2, hueco: d.caja.izquierda - i.caja.derecha, corrimiento: r.corrimientos[0] ?? 0, valores: q.valores.length === 0 ? null : q.valores.reduce((a, b) => a + b, 0) / q.valores.length, entrada: q.aro?.entrada ?? null, abajo: Math.max(i.caja.abajo, d.caja.abajo), logoArriba: q.aro?.logo.y0 ?? null }]
  })
  if (filas.length === 0) return { criterio: 'FALLA: ningún cuadro con las dos mitades a la vista (¿publica el sitio __titulosDelBanco y __resenasDelBanco?)', cuadros: cuadros.length }
  const empieza = filas.find((f) => f.giro <= 0.02) ?? filas[0]
  const termina = [...filas].reverse().find((f) => f.giro >= 0.999) ?? null
  const finDelCorrimiento = termina?.corrimiento ?? 0
  // Cada cara (frase en la primera mitad del giro, reseñas en la segunda) se acerca al centro sin volver.
  const sinVolver = (lado: 'centroI' | 'centroD'): boolean => filas.every((f, k) => k === 0 || filas[k - 1].caras !== f.caras || Math.abs(f[lado] - ANCHO / 2) <= Math.abs(filas[k - 1][lado] - ANCHO / 2) + 4)
  const conLaCurva = filas.every((f) => finDelCorrimiento === 0 || Math.abs(f.corrimiento / finDelCorrimiento - vuelta(f.giro)) <= 0.05)
  const aLaVez = filas.filter((f) => f.giro > 0.25 && f.giro < 0.75 && finDelCorrimiento !== 0 && f.corrimiento / finDelCorrimiento > 0.15 && f.corrimiento / finDelCorrimiento < 0.85 && f.valores !== null && f.valores > 0.05 && f.valores < 0.95 && (f.entrada ?? 0) > 0)
  const centrado = termina !== null && Math.abs(termina.centroDelRenglon - ANCHO / 2) <= ANCHO * 0.02 && termina.hueco <= 60 && empieza.hueco > 300
  const ok = centrado && sinVolver('centroI') && sinVolver('centroD') && conLaCurva && aLaVez.length > 0
  const tabla = filas.filter((_, k) => k % Math.max(1, Math.floor(filas.length / 14)) === 0).map((f) => ({ ...f, centroI: Math.round(f.centroI), centroD: Math.round(f.centroD), centroDelRenglon: Math.round(f.centroDelRenglon), hueco: Math.round(f.hueco), giro: Number(f.giro.toFixed(3)), angulo: Math.round(f.angulo), corrimiento: Math.round(f.corrimiento), valores: f.valores === null ? null : Number(f.valores.toFixed(3)), entrada: f.entrada === null ? null : Number(f.entrada.toFixed(3)) }))
  return {
    criterio: ok ? 'ok: centrado al terminar, cada cara hacia el centro, con la curva del ángulo y los cuatro a la vez' : 'FALLA',
    centrado,
    sinVolver: { izquierda: sinVolver('centroI'), derecha: sinVolver('centroD') },
    conLaCurva,
    cuadrosALaVez: aLaVez.length,
    empieza: { hueco: Math.round(empieza.hueco), centroDelRenglon: Math.round(empieza.centroDelRenglon) },
    termina: termina === null ? null : { hueco: Math.round(termina.hueco), centroDelRenglon: Math.round(termina.centroDelRenglon), aireSobreElLogo: termina.logoArriba === null ? null : Math.round(termina.logoArriba - termina.abajo) },
    nota: 'aireSobreElLogo es informativo (la caja del logo es el cuadrado de LOGO_BOX_WORLD): si es negativo, mirar la foto final',
    tabla,
  }
}

/** [C2-70e, verificación] Las letras del cartel en cada cuadro medido: debajo de la barra (`barra`, su borde de abajo) y adentro del cuadro. */
function cartelEntero(cuadros: readonly Cuadro[], barra: number): { readonly ok: boolean; readonly medidos: number; readonly cortados: { t: number; arriba: number; abajo: number; izquierda: number; derecha: number }[] } {
  const medidos = cuadros.filter((q) => q.cartel !== null)
  const cortados = medidos.flatMap((q) => {
    const titulo = q.titulos.filter((x) => x.visible && x.id.startsWith('resenas-')).map((x) => ({ x: x.caja.izquierda, y: x.caja.arriba, ancho: x.caja.derecha - x.caja.izquierda, alto: x.caja.abajo - x.caja.arriba }))
    const cajas = [...(q.cartel ?? []), ...titulo]
    if (cajas.length === 0) return []
    const [arriba, abajo] = [Math.min(...cajas.map((c) => c.y)), Math.max(...cajas.map((c) => c.y + c.alto))]
    const [izquierda, derecha] = [Math.min(...cajas.map((c) => c.x)), Math.max(...cajas.map((c) => c.x + c.ancho))]
    return arriba < barra - 1 || abajo > ALTO + 1 || izquierda < -1 || derecha > ANCHO + 1 ? [{ t: Math.round(q.t), arriba: Math.round(arriba), abajo: Math.round(abajo), izquierda: Math.round(izquierda), derecha: Math.round(derecha) }] : []
  })
  return { ok: medidos.length > 0 && cortados.length === 0, medidos: medidos.length, cortados: cortados.slice(0, 8) }
}

function criteriosDeLaSalida(cuadros: readonly Cuadro[], barra: number): Record<string, unknown> {
  const conAro = cuadros.filter((q) => q.aro !== null && q.aro.enElCuadro !== null && q.aro.bajada > 0.02 && q.aro.bajada < 0.9)
  const abajoDelBorde = conAro.filter((q) => (q.aro?.enElCuadro?.arriba ?? 0) >= ALTO - 8)
  const cam = cuadros.filter((q) => q.camara !== null).map((q) => ({ t: q.t, x: q.camara?.[0] ?? 0, y: q.camara?.[1] ?? 0, z: q.camara?.[2] ?? 0, bajada: q.aro?.bajada ?? 0 }))
  const pasos = cam.slice(1).map((c, k) => Math.hypot(c.x - cam[k].x, c.y - cam[k].y, c.z - cam[k].z))
  const saltos = pasos.map((s, k) => ({ s, k })).filter(({ s, k }) => s > 0.3 && s > 3 * Math.max(pasos[k - 1] ?? 0, pasos[k + 1] ?? 0))
  // B está a 16 y C a 31: «dejó B» es pasar 22 (el 40 % del camino), más allá de lo que el scroll mueve antes del gatillo.
  const sale = cam.find((c) => Math.hypot(c.x, c.z) > 22)
  const despues = sale !== undefined && sale.bajada >= 0.85
  const fin = cam[cam.length - 1]
  const quieta = cam.filter((c) => fin !== undefined && fin.t - c.t <= 500)
  const enC = fin !== undefined && Math.abs(fin.y - 4.5) <= 0.8 && Math.abs(Math.hypot(fin.x, fin.z) - 30.75) <= 1.2 && quieta.every((c) => Math.hypot(c.x - fin.x, c.y - fin.y, c.z - fin.z) < 0.05)
  const aroYCamara = conAro.length > 0 && abajoDelBorde.length === 0 && despues && enC && saltos.length === 0
  const cartel = cartelEntero(cuadros, barra)
  const tabla = cuadros.filter((_, k) => k % 15 === 0).map((q) => ({ t: Math.round(q.t), bajada: Number((q.aro?.bajada ?? 0).toFixed(3)), arribaDelAro: q.aro?.enElCuadro ? Math.round(q.aro.enElCuadro.arriba) : null, peso: Number((q.r?.pesoDeLaCamara ?? 0).toFixed(3)), transformacion: Number((q.r?.transformacion ?? 0).toFixed(3)), espera: Number((q.r?.esperaDelCta ?? 0).toFixed(3)), delCta: Number((q.r?.delCta ?? 0).toFixed(3)), camara: q.camara === null ? null : q.camara.slice(0, 3).map((v) => Number(v.toFixed(2))) }))
  return {
    criterio: aroYCamara && cartel.ok ? 'ok: el aro en el cuadro hasta guardarse, la cámara sale de B después y llega a C sin salto, el cartel entero' : 'FALLA',
    aroYCamara: aroYCamara ? 'ok' : 'FALLA',
    cartelEntero: { criterio: cartel.ok ? 'ok' : 'FALLA', barra: Math.round(barra), medidos: cartel.medidos, cortados: cartel.cortados },
    cuadrosConAro: conAro.length,
    abajoDelBorde: abajoDelBorde.length,
    camaraSaleDeB: sale === undefined ? null : { t: Math.round(sale.t), conLaBajada: Number(sale.bajada.toFixed(3)), despues },
    llegaAC: fin === undefined ? null : { y: Number(fin.y.toFixed(2)), distancia: Number(Math.hypot(fin.x, fin.z).toFixed(2)), enC },
    saltos: saltos.length,
    mayorPaso: Number(Math.max(0, ...pasos).toFixed(3)),
    tabla,
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const ctx = await chromium.launchPersistentContext(PERFIL, { executablePath: CHROME, headless: false, viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 1, args: [`--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] })
  await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ; window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f) })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  await p.route('**/api/**', (r) => r.abort())
  await p.goto(`${BASE}/v3${CONTROL === '' ? '' : `?resenas-control=${CONTROL}`}`, { waitUntil: 'load', timeout: 240000 })
  await dormir(8000)
  const vista = (await p.evaluate('({ visible: document.visibilityState, ancho: innerWidth })')) as { visible: string; ancho: number }
  if (vista.visible !== 'visible' || vista.ancho <= 0) {
    console.log(JSON.stringify({ falla: 'la pestaña no está a la vista: toda medición de scroll o de layout da cero', vista }))
    await ctx.close()
    return
  }
  await p.mouse.move(ANCHO / 2, ALTO / 2)
  if (MODO === 'salida') {
    // El borde de abajo de la barra (lo visible de su arriba: la pastilla, las esquinas o el botón del menú).
    const barra = (await p.evaluate(`Math.max(0, ...[...document.querySelectorAll('[data-pieza="barra"] *')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0 && r.top < innerHeight / 3 && r.height < innerHeight / 4).map((r) => r.bottom))`)) as number
    // El aro leyéndose al final del tramo (el pin con las reseñas: 2,5 + 4 pantallas), con la entrada ya terminada.
    await irA(p, 6.45)
    await dormir(5000)
    await p.evaluate(REGISTRAR(6000, true))
    await rueda(p, 11)
    await dormir(6400)
    const cuadros = (await p.evaluate('window.__registro')) as Cuadro[]
    // Las fotos, en otra pasada: de vuelta al aro (la bajada se rebobina) y otra vez la rueda.
    await irA(p, 6.45)
    await dormir(5000)
    await rueda(p, 11)
    const estados = await fotos(p, cdp, 6, 250, 'salida')
    console.log(JSON.stringify({ modo: MODO, control: CONTROL || null, cuadro: `${String(ANCHO)}x${String(ALTO)}`, ...criteriosDeLaSalida(cuadros, barra), fotos: { carpeta: SALIDA, estados } }))
  } else {
    // Justo antes del tramo (la inserción, 2,5 pantallas del pin): la rueda entra y dispara el gatillo.
    await irA(p, 2.4)
    await dormir(4000)
    await p.evaluate(REGISTRAR(3500, false))
    await rueda(p, 3)
    await dormir(3800)
    const cuadros = (await p.evaluate('window.__registro')) as Cuadro[]
    // Las fotos: afuera del tramo (el gatillo se rebobina), y otra vez adentro.
    await irA(p, 2.4)
    await dormir(4000)
    await rueda(p, 3)
    const estados = await fotos(p, cdp, 8, 60, 'volteo')
    console.log(JSON.stringify({ modo: MODO, control: CONTROL || null, cuadro: `${String(ANCHO)}x${String(ALTO)}`, ...criteriosDelVolteo(cuadros), fotos: { carpeta: SALIDA, estados } }))
  }
  await ctx.close()
}
void main()
