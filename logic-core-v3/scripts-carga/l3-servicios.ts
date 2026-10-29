/**
 * [L3] SERVICIOS EN EL SITIO (cola 3, ítem 50) — Chrome del sistema a la vista contra el dev (`BASE`), `/api/` bloqueado, el banco
 * prendido (`__gatillosDelBanco`, `__escenarioDeServicios`). Por ancho:
 *
 *   MODO=medidas   la entrada (renglones del título y de la bajada, la caja de la órbita, los avisos) y cada servicio en reposo (los
 *                  renglones del título y sus subrayados, la alineación por la diagonal, la letra del cuerpo, «Leer más…» y los enlaces)
 *   MODO=doble     dos muescas (o dos dedos) a 600 ms desde la entrada y desde web: cuadro a cuadro, la posición del enjambre y el
 *                  centroide de sus píxeles; ningún salto (Δ posición ≤ 0,05 y centroide ≤ 200 px por cuadro, en ventanas de tres) y el reposo final en 2
 *   MODO=fotos     `?aro-color=mezcla|tercios|ola` en la entrada y `?titulo-cursiva=1|2|3` en los tres servicios
 *
 *   BASE=http://localhost:3002 ANCHOS=1440,1024,768,390 MODO=medidas npx tsx scripts-carga/l3-servicios.ts
 *   CONTROL=con-candado MODO=doble …   el control positivo (`__defectosDeLosGatillos`): la transición entera traga el segundo gesto
 *   CONTROL=con-salto MODO=doble …     la posición salta cuando la distancia pasa de uno (el escenario de antes)
 *   CONTROL=aviso-en-el-aro ANCHOS=1440 MODO=medidas …   el aviso corrido sobre el arco: «entrada · avisos» tiene que FALLAR
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024,768,390').split(',').map(Number)
const MODO = process.env.MODO ?? 'medidas'
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l3-servicios')
const TRANSICION_MS = 2200
const UMBRAL_POSICION = 0.05
/**
 * El centroide por cuadro: la nube de C2-50 viaja con el resorte del enjambre, que arranca rápido (una transición sola, sin apuro, ya
 * mueve ~60 px por cuadro a 1440); pasar rápido lo acelera hasta ~1,8×. Una teletransportación mueve cientos (el control: 570–1020).
 */
const UMBRAL_CENTROIDE_PX = 200
/** La separación entre los dos gestos del doble (ms). */
const SEPARACION_MS = Number(process.env.SEPARACION_MS ?? 600)
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Fila {
  readonly ancho: number
  readonly caso: string
  readonly bien: boolean
  readonly dato: string
}

type Banco = Window & { __gatillosDelBanco?: { paso: () => number; regla: () => { pasoPx: number; inicio: number; cantidad: number } } }

async function ponerEn(p: Page, paso: number, espera = TRANSICION_MS + 800): Promise<void> {
  await p.evaluate((destino) => {
    const g = (window as Banco).__gatillosDelBanco
    if (!g) throw new Error('sin __gatillosDelBanco')
    const r = g.regla()
    const y = destino < 0 ? r.inicio - 250 : r.inicio + (destino + 0.5) * r.pasoPx
    window.scrollTo({ top: y, behavior: 'instant' })
  }, paso)
  await dormir(espera)
}

async function dedo(p: Page, s: 1 | -1, ancho: number, alto: number): Promise<void> {
  const cdp = await p.context().newCDPSession(p)
  const x = ancho / 2
  const [y0, y1] = s > 0 ? [alto * 0.7, alto * 0.3] : [alto * 0.3, alto * 0.7]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
  for (let k = 1; k <= 8; k++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * k) / 8 }] })
    await dormir(16)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

/** La entrada: renglones del título (por sus cajas) y de la bajada, la caja de la órbita y los avisos del escenario. */
async function medirLaEntrada(p: Page): Promise<{ titulo: number; bajada: number; tituloPx: number; bajadaPx: number; orbita: { w: number; h: number }; arcoSobreElTitulo: boolean; holguraDelAviso: number; radioDelAviso: number; avisosDelGesto: number; avisos: string[] }> {
  return p.evaluate(() => {
    const esc = document.querySelector<HTMLElement>('[data-pieza="escenario-de-servicios"]')
    if (!esc) throw new Error('sin escenario')
    const h2 = esc.querySelector<HTMLElement>('[data-pieza="titulo-que-se-pinta"]')
    const bajada = esc.querySelector<HTMLElement>('[data-pieza="entrada-de-servicios"] p')
    const renglones = (el: HTMLElement | null): number => {
      if (!el) return 0
      const tops = new Set([...el.querySelectorAll<HTMLElement>('[data-palabra]')].map((w) => Math.round(w.getBoundingClientRect().top)))
      if (tops.size > 0) return tops.size
      const r = document.createRange()
      r.selectNodeContents(el)
      return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size
    }
    const lugar = esc.querySelector<HTMLElement>('[data-lugar-de-los-nanobots="0"]')?.getBoundingClientRect() ?? new DOMRect()
    const caja = h2?.getBoundingClientRect() ?? new DOMRect()
    // El arco de arriba de la elipse (su tope, en el centro) cae adentro de la caja del título.
    const arcoSobreElTitulo = lugar.top >= caja.top - 2 && lugar.top <= caja.bottom + 2
    const aviso = [...esc.querySelectorAll<HTMLElement>('[data-pieza="aviso-de-scroll"]')].find((a) => a.getClientRects().length > 0)
    const avisos = [...esc.querySelectorAll<HTMLElement>('[data-pieza="aviso-de-scroll"]')].filter((a) => a.getClientRects().length > 0).map((a) => (a.textContent ?? '').trim())
    return {
      titulo: renglones(h2),
      bajada: renglones(bajada),
      tituloPx: Number.parseFloat(h2 ? getComputedStyle(h2).fontSize : '0'),
      bajadaPx: Number.parseFloat(bajada ? getComputedStyle(bajada).fontSize : '0'),
      orbita: { w: Math.round(lugar.width), h: Math.round(lugar.height) },
      arcoSobreElTitulo,
      holguraDelAviso: aviso ? aviso.getBoundingClientRect().top - lugar.bottom : 999,
      // El aviso adentro del aro: el radio normalizado (1 = la elipse) de la esquina más lejana de su caja.
      radioDelAviso: (() => {
        if (!aviso || !(lugar.width > 0)) return 99
        const rango = document.createRange()
        rango.selectNodeContents(aviso)
        const a = rango.getBoundingClientRect()
        const [cx, cy, rx, ry] = [lugar.left + lugar.width / 2, lugar.top + lugar.height / 2, lugar.width / 2, lugar.height / 2]
        return Math.max(...[[a.left, a.top], [a.right, a.top], [a.left, a.bottom], [a.right, a.bottom]].map(([x, y]) => Math.hypot((x - cx) / rx, (y - cy) / ry)))
      })(),
      avisosDelGesto: avisos.filter((t) => t.startsWith('Desliz')).length,
      avisos,
    }
  })
}

/**
 * Cuántos píxeles con el color del aro caen sobre el aviso, sumados en seis capturas cada 500 ms: la caja de su TEXTO y la de sus chevrones,
 * cada una agrandada 6 px (no el rectángulo que las une: sus esquinas de abajo no tienen tinta).
 */
async function pixelesDelAroSobreElAviso(p: Page): Promise<number> {
  const cajas = await p.evaluate(() => {
    const aviso = [...document.querySelectorAll<HTMLElement>('[data-pieza="escenario-de-servicios"] [data-pieza="aviso-de-scroll"]')].find((a) => a.getClientRects().length > 0)
    if (!aviso) return null
    return [...aviso.children].map((hijo) => {
      const r = document.createRange()
      r.selectNodeContents(hijo)
      const b = r.getBoundingClientRect()
      return { x: Math.max(0, b.left - 6), y: Math.max(0, b.top - 6), width: b.width + 12, height: b.height + 12 }
    })
  })
  if (cajas === null) return -1
  let n = 0
  for (let k = 0; k < 6; k++) {
    for (const clip of cajas) {
      const png = await p.screenshot({ clip })
      const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
      for (let i = 0; i < data.length; i += info.channels) {
        const [r, g, b] = [data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0]
        if (Math.max(r, g, b) - Math.min(r, g, b) > 40) n += 1
      }
    }
    await dormir(500)
  }
  return n
}

interface DelServicio {
  readonly renglones: { readonly izquierda: number; readonly derecha: number; readonly centro: number; readonly px: number; readonly familia: string; readonly cursiva: boolean }[]
  readonly subrayados: number[]
  readonly cuerpo: { readonly familia: string; readonly cursiva: boolean; readonly px: number; readonly parrafos: number }
  readonly leerMas: { readonly hay: boolean; readonly alFinal: boolean; readonly texto: string }
  readonly enlaces: number
  readonly enElTab: number
  readonly ctaViejo: number
}

async function medirElServicio(p: Page, id: string): Promise<DelServicio> {
  return p.evaluate((sid) => {
    const panel = document.querySelector<HTMLElement>(`[data-pieza="panel-de-servicio"][data-servicio="${sid}"]`)
    if (!panel) throw new Error(`sin el panel ${sid}`)
    const renglones = [...panel.querySelectorAll<HTMLElement>('[data-parte="renglon-del-titulo"]')].map((r) => {
      const b = r.getBoundingClientRect()
      const cs = getComputedStyle(r)
      return { izquierda: b.left, derecha: b.right, centro: (b.left + b.right) / 2, px: Number.parseFloat(cs.fontSize), familia: cs.fontFamily.split(',')[0] ?? '', cursiva: cs.fontStyle === 'italic' }
    })
    const subrayados = [...panel.querySelectorAll<HTMLElement>('[data-parte="subrayado-del-servicio"]')].map((s) => Number.parseFloat((s.style.scale || '1').split(' ')[0] ?? '1'))
    const parrafos = panel.querySelector<HTMLElement>('[data-parte="parrafos"]')
    const visibles = parrafos ? [...parrafos.querySelectorAll<HTMLElement>('p')].filter((x) => x.getClientRects().length > 0 && !x.hasAttribute('data-parte')) : []
    const cs = parrafos ? getComputedStyle(parrafos) : null
    const leer = panel.querySelector<HTMLElement>('[data-parte="leer-mas"]')
    const ultimo = parrafos ? [...parrafos.querySelectorAll<HTMLElement>('p')].filter((x) => x.getClientRects().length > 0).pop() : undefined
    const enlaces = [...panel.querySelectorAll<HTMLElement>('[data-viaje-del-servicio]')]
    return {
      renglones,
      subrayados,
      cuerpo: { familia: cs?.fontFamily.split(',')[0] ?? '', cursiva: cs?.fontStyle === 'italic', px: Number.parseFloat(cs?.fontSize ?? '0'), parrafos: visibles.length },
      leerMas: { hay: leer !== null, alFinal: leer !== null && ultimo !== undefined && ultimo.contains(leer), texto: (leer?.textContent ?? '').trim() },
      enlaces: enlaces.length,
      enElTab: enlaces.filter((a) => a.tabIndex >= 0 && a.closest('[aria-hidden="true"]') === null).length,
      ctaViejo: panel.textContent?.includes('Quiero mi') === true ? 1 : 0,
    }
  }, id)
}

const GRABAR_CUADROS = `(() => {
  const w = window
  const log = (w.__cuadrosDeServicios = [])
  const cuadro = () => {
    const e = w.__escenarioDeServicios
    const g = w.__gatillosDelBanco
    if (e) { const c = e.centroide(); log.push({ t: performance.now(), p: e.posicion(), enjambre: e.posicionDelEnjambre(), paso: g ? g.paso() : null, cx: c ? c.x : null, cy: c ? c.y : null, n: c ? c.n : 0 }) }
    if (log.length < 900) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface Cuadro {
  readonly t: number
  readonly p: number
  readonly enjambre: number
  readonly paso: number | null
  readonly cx: number | null
  readonly cy: number | null
  readonly n: number
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const filas: Fila[] = []
  const anotar = (f: Fila): void => {
    filas.push(f)
    console.log(`${f.bien ? '✓' : '✗'} ${String(f.ancho)} · ${f.caso}: ${f.dato}`)
  }
  for (const ancho of ANCHOS) {
    const alto = ancho >= 1440 ? 900 : ancho >= 1024 ? 768 : ancho >= 768 ? 1024 : 844
    const telefono = ancho < 1024
    const ctx = await chromium.launchPersistentContext(perfilDelBanco(`l3-servicios-${String(ancho)}`), {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: telefono,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; window.__defectosDeLosGatillos = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const abrir = async (consulta: string): Promise<void> => {
        await p.goto(`${BASE}/v3${consulta}#servicios`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(8, 8)
        await dormir(7000)
        const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
        if (!visible) console.log(`· ${String(ancho)} · ⚠ pestaña no visible: la medición no vale`)
      }
      await abrir('')
      if (MODO === 'medidas') {
        // El control del aviso: corrido 40 px hacia arriba, sobre el arco de abajo del aro (escritorio): tiene que haber píxeles del aro.
        if (CONTROL === 'aviso-en-el-aro') await p.addStyleTag({ content: '[data-pieza="entrada-de-servicios"] [data-pieza="aviso-de-scroll"]{translate:0 -40px}' })
        await ponerEn(p, 0)
        const e = await medirLaEntrada(p)
        const unRenglon = !telefono
        anotar({ ancho, caso: 'entrada · título', bien: unRenglon ? e.titulo === 1 : e.titulo === 2, dato: `${String(e.titulo)} renglón(es), ${e.tituloPx.toFixed(1)} px` })
        anotar({ ancho, caso: 'entrada · bajada', bien: unRenglon ? e.bajada === 1 : e.bajada === 2, dato: `${String(e.bajada)} renglón(es), ${e.bajadaPx.toFixed(1)} px` })
        anotar({ ancho, caso: 'entrada · órbita', bien: telefono ? e.orbita.h > e.orbita.w : e.orbita.w > e.orbita.h && e.arcoSobreElTitulo, dato: `caja ${String(e.orbita.w)}×${String(e.orbita.h)}${telefono ? '' : `, arco de arriba sobre el título: ${String(e.arcoSobreElTitulo)}`}` })
        // Que el aro no toque el aviso («que no toquen el cartel»): en seis capturas a lo largo de 3 s, ningún píxel con el color del aro
        // (croma > 40: el aviso es gris y el papel también) adentro de la caja del aviso, agrandada 6 px.
        const tocados = await pixelesDelAroSobreElAviso(p)
        anotar({ ancho, caso: 'entrada · avisos', bien: (telefono ? e.avisosDelGesto === 1 : e.avisos.length === 1) && tocados === 0, dato: `${e.avisos.join(' | ') || 'ninguno'}; píxeles del aro sobre el aviso en 6 capturas: ${String(tocados)} (geometría: holgura ${e.holguraDelAviso.toFixed(0)} px, radio ${e.radioDelAviso.toFixed(2)})` })
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-entrada.png`) })
        for (const [i, id] of ['web', 'software', 'ia-automatizacion'].entries()) {
          await ponerEn(p, i + 1)
          const s = await medirElServicio(p, id)
          const [r1, r2] = s.renglones
          const tan = Math.tan((7 * Math.PI) / 180)
          let alineado = false
          let dato = 'sin dos renglones'
          // Lo que corre la diagonal en un renglón: su alto (0,9 em, `leading-cartel`) y el subrayado con su aire (8 px), por la tangente.
          const corrimiento = r1 ? (0.9 * r1.px + 8) * tan : 0
          if (r1 && r2) {
            if (telefono) {
              alineado = Math.abs(r1.izquierda - r2.izquierda) <= 2
              dato = `a la izquierda los dos (Δ ${(r2.izquierda - r1.izquierda).toFixed(1)} px)`
            } else if (id === 'web') {
              alineado = Math.abs(r2.izquierda - r1.izquierda - corrimiento) <= 1.5
              dato = `renglón 2 corrido ${(r2.izquierda - r1.izquierda).toFixed(1)} px a la derecha (la diagonal: ${corrimiento.toFixed(1)})`
            } else if (id === 'software') {
              alineado = Math.abs(r1.derecha - r2.derecha - corrimiento) <= 1.5
              dato = `renglón 1 termina ${(r1.derecha - r2.derecha).toFixed(1)} px más a la derecha (la diagonal: ${corrimiento.toFixed(1)})`
            } else {
              alineado = Math.abs(r1.centro - r2.centro) <= 2
              dato = `centros a ${Math.abs(r1.centro - r2.centro).toFixed(1)} px`
            }
          }
          anotar({ ancho, caso: `${id} · título`, bien: s.renglones.length === 2 && r1?.cursiva === false && r2?.cursiva === true, dato: s.renglones.map((r) => `${r.familia} ${r.px.toFixed(0)} px${r.cursiva ? ' cursiva' : ''}`).join(' / ') })
          anotar({ ancho, caso: `${id} · alineación`, bien: alineado, dato })
          anotar({ ancho, caso: `${id} · subrayados`, bien: s.subrayados.length === 2 && s.subrayados.every((x) => x > 0.99), dato: s.subrayados.map((x) => x.toFixed(2)).join(' · ') })
          anotar({ ancho, caso: `${id} · cuerpo`, bien: !s.cuerpo.cursiva && (telefono ? s.cuerpo.parrafos === 2 : s.cuerpo.parrafos === 4), dato: `${s.cuerpo.familia}${s.cuerpo.cursiva ? ' cursiva' : ''} ${s.cuerpo.px.toFixed(1)} px, ${String(s.cuerpo.parrafos)} párrafos` })
          anotar({ ancho, caso: `${id} · ir a la página`, bien: s.leerMas.hay && s.leerMas.alFinal && s.enlaces === 3 && s.enElTab === 2 && s.ctaViejo === 0, dato: `«${s.leerMas.texto}» al final: ${String(s.leerMas.alFinal)}; ${String(s.enlaces)} enlaces, ${String(s.enElTab)} en el Tab; CTA viejo: ${String(s.ctaViejo)}` })
          await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${id}.png`) })
        }
      }
      if (MODO === 'doble') {
        for (const desde of [0, 1]) {
          await ponerEn(p, desde)
          await p.evaluate(GRABAR_CUADROS)
          const gesto = telefono ? (): Promise<void> => dedo(p, 1, ancho, alto) : (): Promise<void> => p.mouse.wheel(0, 100)
          await gesto()
          await dormir(SEPARACION_MS)
          await gesto()
          await dormir(TRANSICION_MS * 2 + 600)
          const cuadros = await p.evaluate(() => (window as Window & { __cuadrosDeServicios?: Cuadro[] }).__cuadrosDeServicios ?? [])
          writeFileSync(path.join(SALIDA, `doble-${String(ancho)}-desde${String(desde)}-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify(cuadros))
          // Por cuadro, llevado a un cuadro de 60 Hz: un cuadro lento (el hilo trabado) mueve más por TIEMPO y no es un salto; un salto mueve
          // mucho en un cuadro normal. Se cuentan aparte los cuadros lentos (> 50 ms).
          // En ventanas de tres cuadros: el rAF del banco y el reloj de la animación no van en fase (un cuadro de 35 ms seguido de uno de 12).
          const CUADRO_MS = 1000 / 60
          const VENTANA = 3
          let [dp, dc, lentos, peorDt] = [0, 0, 0, 0]
          for (let k = 1; k < cuadros.length; k++) {
            const dt = (cuadros[k]?.t ?? 0) - (cuadros[k - 1]?.t ?? 0)
            if (dt > 50) lentos += 1
            peorDt = Math.max(peorDt, dt)
            const [a, b] = [cuadros[k - VENTANA], cuadros[k]]
            if (!a || !b) continue
            const escala = CUADRO_MS / Math.max((b.t - a.t) / VENTANA, CUADRO_MS) / VENTANA
            dp = Math.max(dp, Math.abs(b.enjambre - a.enjambre) * escala)
            if (a.cx !== null && b.cx !== null && a.cy !== null && b.cy !== null && a.n > 50 && b.n > 50) dc = Math.max(dc, Math.hypot(b.cx - a.cx, b.cy - a.cy) * escala)
          }
          const fin = cuadros[cuadros.length - 1]
          const llego = fin !== undefined && Math.abs(fin.p - (desde + 2)) < 1e-3 && fin.paso === desde + 2
          anotar({ ancho, caso: `doble gesto desde ${String(desde)}`, bien: llego && dp <= UMBRAL_POSICION && dc <= UMBRAL_CENTROIDE_PX, dato: `${String(cuadros.length)} cuadros (${String(lentos)} lentos, el peor ${peorDt.toFixed(0)} ms); reposo en ${fin?.p.toFixed(3) ?? '?'} (paso ${String(fin?.paso)}); por cuadro de 60 Hz: Δ posición máx ${dp.toFixed(4)}, centroide máx ${dc.toFixed(1)} px` })
        }
      }
      if (MODO === 'cajas') {
        // Las cajas del truco de profundidad en px del escenario (para los escenarios de s81: el título, el aro y el globo de web).
        await ponerEn(p, 0)
        const cajas = await p.evaluate(() => {
          const esc = document.querySelector<HTMLElement>('[data-pieza="escenario-de-servicios"]')
          if (!esc) return null
          const b = esc.getBoundingClientRect()
          const deRect = (r: DOMRect): Record<string, number> => ({ izquierda: Math.round(r.left - b.left), arriba: Math.round(r.top - b.top), derecha: Math.round(r.right - b.left), abajo: Math.round(r.bottom - b.top) })
          const delLayout = (el: HTMLElement | null): Record<string, number> | null => {
            if (!el) return null
            let [x, y] = [0, 0]
            for (let n: HTMLElement | null = el; n !== null && n !== esc; n = n.offsetParent instanceof HTMLElement ? n.offsetParent : null) [x, y] = [x + n.offsetLeft, y + n.offsetTop]
            return { izquierda: x, arriba: y, derecha: x + el.offsetWidth, abajo: y + el.offsetHeight }
          }
          return {
            titulo: [...esc.querySelectorAll<HTMLElement>('[data-caja-del-titulo]')].flatMap((e) => [...e.getClientRects()].map(deRect)),
            nube: delLayout(esc.querySelector<HTMLElement>('[data-lugar-de-los-nanobots="0"]')),
            globo: delLayout(esc.querySelector<HTMLElement>('[data-lugar-de-los-nanobots="1"]')),
          }
        })
        console.log(`· ${String(ancho)}×${String(alto)} ${JSON.stringify(cajas)}`)
      }
      if (MODO === 'fotos' && !telefono) {
        for (const c of ['mezcla', 'tercios', 'ola']) {
          await abrir(`?aro-color=${c}`)
          await ponerEn(p, 0)
          await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-aro-${c}-a.png`) })
          await dormir(1500)
          await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-aro-${c}-b.png`) })
        }
        for (const t of ['1', '2', '3']) {
          await abrir(`?titulo-cursiva=${t}`)
          for (const [i, id] of ['web', 'software', 'ia-automatizacion'].entries()) {
            await ponerEn(p, i + 1)
            await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${id}-cursiva${t}.png`) })
          }
        }
      }
      if (MODO === 'fotos' && telefono) {
        await ponerEn(p, 0)
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-aro-ola.png`) })
      }
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `l3-${MODO}-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify(filas, null, 2))
  const malos = filas.filter((f) => !f.bien).length
  if (filas.length > 0) console.log(CONTROL === '' ? `${malos === 0 ? '✓' : '✗'} ${String(filas.length - malos)} de ${String(filas.length)}` : `control ${CONTROL}: ${malos > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malos)} casos fallan)`)
}

void main()
