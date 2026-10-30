/**
 * [M3] LOS MOMENTOS DE LAS TRES PÁGINAS DE SERVICIO, EN EL NAVEGADOR — Chrome del sistema a la vista, `/api/` bloqueado, contra el dev de
 * M3. En cada ancho de `ANCHOS` y cada página: el ancho real de la vista (`innerWidth`), un `h1`, el desborde (en el layout), la consola, y
 * lo propio de cada momento:
 *   · web: la secuencia en cuatro puntos (fotos), el menú cambia de trabajo en tres puntos SIN mover el scroll (`scrollY` antes y después de
 *     la repetición), el video que queda es el del trabajo elegido, y al final el marco es un teléfono;
 *   · software: un renglón a medio cruzar tiene el tachado y lo nuevo al mismo paso; el tablero recorrido de a 2 % no tiene saltos y al
 *     final ningún papel pisa a otro ni se sale de la mesa;
 *   · IA: el chat avanza solo sin mover la página, contesta una pregunta sugerida, y las tareas se tildan al pasar.
 * Con `REDUCIDO=1` (a 1440): todo quieto y entero (sin video, el tablero ordenado, las tareas tildadas).
 *
 *   BASE=http://localhost:3005 ANCHOS=1440x900,1024x768,768x1024,390x844 npx tsx scripts-carga/m3-momentos.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3005'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1024x768,768x1024,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const REDUCIDO = process.env.REDUCIDO === '1'
const ESPERA = Number(process.env.ESPERA ?? '6000')
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\M3'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Resultado { readonly linea: string; readonly bien: boolean }
const res = (bien: boolean, linea: string): Resultado => ({ bien, linea: `${bien ? 'ok   ' : 'FALLA'} ${linea}` })

/** El tope (en el documento) y el alto de un elemento. */
const medida = (p: Page, sel: string): Promise<{ top: number; alto: number } | null> =>
  p.evaluate((s) => {
    const el = document.querySelector(s)
    if (el === null) return null
    const r = el.getBoundingClientRect()
    return { top: r.top + scrollY, alto: r.height }
  }, sel)

const ir = async (p: Page, y: number, espera = 500): Promise<void> => {
  await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.max(0, Math.round(y)))
  await dormir(espera)
}

async function comun(p: Page, slug: string, h1: string, ancho: number, alto: number, consola: string[]): Promise<Resultado[]> {
  const datos = await p.evaluate(() => ({
    ancho: innerWidth,
    visible: document.visibilityState === 'visible',
    h1s: [...document.querySelectorAll('h1')].map((h) => (h.textContent ?? '').trim()),
    desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  const errores = consola.filter((c) => !/Failed to load resource|ERR_FAILED|net::/.test(c))
  return [
    res(datos.ancho === ancho && datos.visible, `${slug} · ${String(ancho)}: la vista mide ${String(datos.ancho)} px de ancho${datos.visible ? '' : ' · ⚠ pestaña oculta'}`),
    res(datos.h1s.length === 1 && datos.h1s[0] === h1, `${slug} · ${String(ancho)}: h1 ${JSON.stringify(datos.h1s)}`),
    res(datos.desborde <= 0, `${slug} · ${String(ancho)}: desborde ${String(datos.desborde)} px`),
    res(errores.length === 0, `${slug} · ${String(ancho)}: consola ${errores.length === 0 ? 'limpia' : errores.join(' | ')}`),
  ]
}

async function web(p: Page, ancho: number, alto: number, carpeta: string): Promise<Resultado[]> {
  const salida: Resultado[] = []
  const m = await medida(p, '[data-recorrido-de-la-pantalla]')
  if (m === null) return [res(false, `web · ${String(ancho)}: no está el recorrido de la pantalla`)]
  const en = (t: number): number => m.top + t * (m.alto - alto)
  for (const [i, t] of [0.2, 0.45, 0.75, 0.97].entries()) {
    await ir(p, en(t), 900)
    await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-pantalla-${String(i + 1)}.png`) })
  }
  const marco = await p.evaluate(() => {
    const r = document.querySelector('[data-marco-de-la-pantalla]')?.getBoundingClientRect()
    return r === undefined ? null : { w: r.width, h: r.height }
  })
  salida.push(res(marco !== null && marco.h / marco.w > 2, `web · ${String(ancho)}: al final el marco es un teléfono (${marco === null ? '?' : `${marco.w.toFixed(0)} × ${marco.h.toFixed(0)}`})`))
  // El menú: tres cambios en tres puntos de la secuencia; el scroll no se mueve y el video es el del trabajo elegido.
  const cambios: [number, number, string][] = [[0.2, 1, 'esquina-estudio'], [0.45, 2, 'banu-scents'], [0.75, 0, 'el-garage']]
  for (const [t, boton, slug] of cambios) {
    await ir(p, en(t), 700)
    const antes = await p.evaluate(() => scrollY)
    const b = p.locator('[data-bloque="la-pantalla"] [role="group"] button').nth(boton)
    await b.click({ timeout: 5000 })
    await dormir(3200)
    const despues = await p.evaluate(() => scrollY)
    const video = await p.evaluate(() => document.querySelector('[data-video-de-la-pantalla="escritorio"]')?.getAttribute('src') ?? '')
    const elegido = await b.getAttribute('aria-pressed')
    salida.push(res(Math.abs(despues - antes) < 1 && video.includes(slug) && elegido === 'true', `web · ${String(ancho)}: cambio a ${slug} en el ${String(t * 100)} %: scrollY ${String(antes)} → ${String(despues)}, video ${video || '(sin fuente)'}`))
    if (t === 0.45) await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-pantalla-cambio.png`) })
  }
  return salida
}

async function software(p: Page, ancho: number, alto: number, carpeta: string): Promise<Resultado[]> {
  const salida: Resultado[] = []
  const renglon = await medida(p, '[data-bloque="lo-de-siempre"] li:nth-child(2)')
  if (renglon === null) return [res(false, `software · ${String(ancho)}: no está lo de siempre`)]
  // El tope del renglón en el 66 % del alto: a mitad de su cruce (de 85 % a 45 %).
  await ir(p, renglon.top - alto * 0.66, 700)
  const paso = await p.evaluate(() => {
    const li = document.querySelector('[data-bloque="lo-de-siempre"] li:nth-child(2)')
    const tramo = li?.querySelector<HTMLElement>('[data-trazo="tachado"]')
    const raya = tramo?.querySelector<HTMLElement>('[data-parte="linea"]')
    const nuevo = li?.querySelectorAll<HTMLElement>('p')[1]?.querySelector<HTMLElement>('span[class*="font-display"]')
    const despinte = Number(tramo?.style.getPropertyValue('--trazo-despinte') ?? 'NaN')
    const escala = Number(/scaleX\(([\d.]+)\)/.exec(raya?.style.transform ?? '')?.[1] ?? 'NaN')
    const recorte = Number(/inset\([^ ]+ ([\d.]+)%/.exec(nuevo?.style.clipPath ?? '')?.[1] ?? 'NaN')
    return { despinte, escala, descubierto: 1 - recorte / 100 }
  })
  const simultaneo = paso.escala > 0.05 && paso.escala < 0.98 && Math.abs(paso.escala - paso.despinte) < 0.01 && Math.abs(paso.escala - paso.descubierto) < 0.01
  salida.push(res(simultaneo, `software · ${String(ancho)}: a mitad del cruce, la raya ${paso.escala.toFixed(3)}, el despinte ${paso.despinte.toFixed(3)} y lo nuevo ${paso.descubierto.toFixed(3)} van juntos`))
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-tachado.png`) })
  const m = await medida(p, '[data-recorrido-del-orden]')
  if (m === null) return [...salida, res(false, `software · ${String(ancho)}: no está el orden`)]
  const en = (t: number): number => m.top + t * (m.alto - alto)
  let salto = 0
  let anterior: { x: number; y: number }[] | null = null
  let ancho0 = 1
  for (let t = 0; t <= 1.0001; t += 0.02) {
    await ir(p, en(t), 70)
    const ahora = await p.evaluate(() => {
      const mesa = document.querySelector('[data-recorrido-del-orden] [data-papel]')?.parentElement?.getBoundingClientRect()
      return { w: mesa?.width ?? 1, papeles: [...document.querySelectorAll<HTMLElement>('[data-recorrido-del-orden] [data-papel]')].map((el) => ({ x: Number.parseFloat(el.style.left), y: Number.parseFloat(el.style.top) })) }
    })
    ancho0 = ahora.w
    if (anterior !== null) salto = Math.max(salto, ...ahora.papeles.map((q, i) => Math.hypot(q.x - (anterior?.[i]?.x ?? q.x), q.y - (anterior?.[i]?.y ?? q.y))))
    anterior = ahora.papeles
    if (Math.abs(t - 0.5) < 0.011) await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-orden-medio.png`) })
  }
  // De a 2 % del recorrido, un papel viaja de a pedazos; un salto sería un cambio de lugar de una columna entera (33 %) o más.
  salida.push(res(salto < 12, `software · ${String(ancho)}: el tablero de a 2 %: el paso más grande de un papel fue ${salto.toFixed(1)} % de la mesa (${(salto * ancho0 / 100).toFixed(0)} px)`))
  await ir(p, en(1), 800)
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-orden-final.png`) })
  const solapes = await p.evaluate(() => {
    const cajas = [...document.querySelectorAll<HTMLElement>('[data-recorrido-del-orden] [data-papel]')].map((el) => el.getBoundingClientRect())
    const mesa = document.querySelector('[data-recorrido-del-orden] [data-papel]')?.parentElement?.parentElement?.getBoundingClientRect()
    let n = 0
    cajas.forEach((a, i) => cajas.forEach((b, j) => {
      if (j > i && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) n += 1
    }))
    const afuera = mesa === undefined ? -1 : cajas.filter((c) => c.left < mesa.left - 1 || c.right > mesa.right + 1 || c.top < mesa.top - 1 || c.bottom > mesa.bottom + 1).length
    const textoCortado = [...document.querySelectorAll<HTMLElement>('[data-recorrido-del-orden] [data-papel]')].filter((el) => el.scrollHeight > el.clientHeight + 1).length
    return { n, afuera, textoCortado }
  })
  salida.push(res(solapes.n === 0 && solapes.afuera === 0 && solapes.textoCortado === 0, `software · ${String(ancho)}: al final, ${String(solapes.n)} solapes, ${String(solapes.afuera)} papeles fuera de la mesa, ${String(solapes.textoCortado)} con el texto cortado`))
  return salida
}

async function ia(p: Page, ancho: number, alto: number, carpeta: string): Promise<Resultado[]> {
  const salida: Resultado[] = []
  const chat = await medida(p, '[data-chat-que-atiende]')
  if (chat === null) return [res(false, `ia · ${String(ancho)}: no está el chat`)]
  await ir(p, chat.top - Math.max(80, (alto - chat.alto) / 2), 500)
  const y0 = await p.evaluate(() => scrollY)
  await dormir(9000)
  const burbujas = await p.evaluate(() => document.querySelectorAll('[data-chat-que-atiende] [role="log"] > p').length)
  const y1 = await p.evaluate(() => scrollY)
  salida.push(res(burbujas >= 3 && Math.abs(y1 - y0) < 1, `ia · ${String(ancho)}: el chat contestó solo (${String(burbujas)} mensajes en 9 s) y la página no se movió (${String(y0)} → ${String(y1)})`))
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-chat.png`) })
  await p.locator('[data-chat-que-atiende] button').first().click({ timeout: 5000 })
  await dormir(2200)
  const tuya = await p.evaluate(() => [...document.querySelectorAll('[data-chat-que-atiende] [role="log"] > p')].slice(-2).map((x) => (x.textContent ?? '').replace(/^(Cliente|Asistente): /, '')))
  const y2 = await p.evaluate(() => scrollY)
  salida.push(res(tuya.length === 2 && /horarios/.test(tuya[0]) && Math.abs(y2 - y1) < 1, `ia · ${String(ancho)}: la pregunta sugerida y su respuesta llegaron al final, sin mover la página («${tuya[0] ?? ''}»)`))
  const lista = await medida(p, '[data-bloque="automatizaciones"] ul')
  if (lista === null) return [...salida, res(false, `ia · ${String(ancho)}: no está la lista`)]
  for (let y = lista.top - alto; y <= lista.top + lista.alto; y += alto / 6) await ir(p, y, 250)
  await dormir(1200)
  const hechas = await p.evaluate(() => document.querySelectorAll('[data-tarea][data-hecha]').length)
  await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-pasa-solo.png`) })
  await ir(p, lista.top - alto * 1.2, 900)
  const destildadas = await p.evaluate(() => document.querySelectorAll('[data-tarea][data-hecha]').length)
  salida.push(res(hechas === 5 && destildadas === 0, `ia · ${String(ancho)}: bajando se tildaron ${String(hechas)} de 5; subiendo quedaron ${String(destildadas)}`))
  return salida
}

async function reducido(p: Page, carpeta: string): Promise<Resultado[]> {
  const salida: Resultado[] = []
  await p.goto(`${BASE}/v3/paginas-web`, { waitUntil: 'load', timeout: 300000 })
  await dormir(ESPERA)
  const w = await p.evaluate(() => ({ videos: document.querySelectorAll('[data-bloque="la-pantalla"] video').length, recorrido: document.querySelector('[data-recorrido-de-la-pantalla]') !== null, imagenes: document.querySelectorAll('[data-bloque="la-pantalla"] img').length }))
  salida.push(res(w.videos === 0 && !w.recorrido && w.imagenes === 2, `reducido · web: sin video ni recorrido, las dos pantallas quietas (${JSON.stringify(w)})`))
  const pan = await medida(p, '[data-bloque="la-pantalla"]')
  if (pan !== null) {
    await ir(p, pan.top, 800)
    await p.screenshot({ path: path.join(carpeta, '1440-reducido-pantalla.png') })
  }
  await p.goto(`${BASE}/v3/software-a-medida`, { waitUntil: 'load', timeout: 300000 })
  await dormir(ESPERA)
  const s = await p.evaluate(() => ({ recorrido: document.querySelector('[data-recorrido-del-orden]') !== null, llegados: document.querySelectorAll('[data-papel][data-llego]').length, rayas: [...document.querySelectorAll<HTMLElement>('[data-bloque="lo-de-siempre"] [data-parte="linea"]')].map((r) => getComputedStyle(r).transform) }))
  salida.push(res(!s.recorrido && s.llegados === 9 && s.rayas.every((t) => t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)'), `reducido · software: el tablero ya ordenado (${String(s.llegados)} de 9) y los renglones tachados`))
  await p.goto(`${BASE}/v3/ia-y-automatizaciones`, { waitUntil: 'load', timeout: 300000 })
  await dormir(ESPERA)
  const i = await p.evaluate(() => ({ hechas: document.querySelectorAll('[data-tarea][data-hecha]').length, mensajes: document.querySelectorAll('[data-chat-que-atiende] [role="log"] > p').length }))
  salida.push(res(i.hechas === 5 && i.mensajes >= 8, `reducido · IA: las 5 tareas tildadas y la conversación entera, quieta (${JSON.stringify(i)})`))
  return salida
}

const PAGINAS = [
  { slug: 'paginas-web', h1: 'Desarrollo web', momento: web },
  { slug: 'software-a-medida', h1: 'Software a medida', momento: software },
  { slug: 'ia-y-automatizaciones', h1: 'Integraciones con IA', momento: ia },
] as const

async function main(): Promise<void> {
  const lineas: Resultado[] = []
  for (const [ancho, alto] of REDUCIDO ? [[1440, 900] as [number, number]] : ANCHOS) {
    const perfil = perfilDelBanco('m3')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: REDUCIDO ? 'reduce' : 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(Math.max(ancho, 500) + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const consola: string[] = []
      p.on('console', (msg) => {
        if (msg.type() === 'error' || /NaN/.test(msg.text())) consola.push(`${msg.type()}: ${msg.text().slice(0, 240)}`)
      })
      p.on('pageerror', (e) => consola.push(`pageerror: ${e.message.slice(0, 240)}`))
      if (REDUCIDO) {
        const carpeta = path.join(FOTOS, 'reducido')
        mkdirSync(carpeta, { recursive: true })
        for (const r of await reducido(p, carpeta)) {
          console.log(r.linea)
          lineas.push(r)
        }
        continue
      }
      for (const pagina of PAGINAS) {
        consola.length = 0
        const carpeta = path.join(FOTOS, pagina.slug)
        mkdirSync(carpeta, { recursive: true })
        await p.goto(`${BASE}/v3/${pagina.slug}`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(ancho / 2, alto / 2)
        await dormir(ESPERA)
        let rs: Resultado[]
        try {
          rs = await pagina.momento(p, ancho, alto, carpeta)
        } catch (e) {
          rs = [res(false, `${pagina.slug} · ${String(ancho)}: el banco tiró ${String(e).slice(0, 200)}`)]
        }
        rs = [...(await comun(p, pagina.slug, pagina.h1, ancho, alto, consola)), ...rs]
        for (const r of rs) {
          console.log(r.linea)
          lineas.push(r)
        }
      }
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
  const fallas = lineas.filter((l) => !l.bien).length
  console.log(`\n${String(lineas.length - fallas)} de ${String(lineas.length)} en verde`)
  process.exit(fallas === 0 ? 0 : 1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
