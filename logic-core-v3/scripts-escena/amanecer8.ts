/**
 * SPRINT ESCENA 8 — T3, el amanecer atado al scroll: amanecer8.ts <sonda|clips|momentos|contraste> [cuál]
 *
 * - `sonda <lento|rapido|vuelta>`: el gesto sin grabar y la línea de tiempo del avance (lo que pide el scroll,
 *   lo que se muestra y cuánto día hay para el texto), muestreada en la página en cada cuadro.
 * - `clips`: los tres gestos grabados a velocidad real, cada uno con su línea de tiempo al lado (JSON).
 * - `momentos`: el amanecer congelado en cada momento, con el borde de Tu panel arriba (la sala entera).
 * - `contraste`: un paso rápido reproducido congelado. El avance de cada instante sale de simular la
 *   persecución con el scroll del gesto; en cada uno se congela el amanecer, se fotografía, y cada texto a la
 *   vista se mide contra su fondo con la opacidad con que está (la frase llega con opacidad): WCAG efectivo.
 *
 * Va a `escena8/amanecer/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { AMANECER, avanceDelScroll, diaParaElTexto, perseguir } from '../src/app/v3/_lib/escena/amanecer/linea'
import { grabar, mover, topeMas } from './banco-escena'
import { abrir8, carpeta8 } from './banco8'
import { FUERA, scrollSuave } from './clips6'

const [QUE, CUAL] = [process.argv[2] ?? '', process.argv[3] ?? '']

/** El scroll con el borde de abajo de Tu panel en `f` del alto del cuadro. */
function bordeEn(b: Banco, f: number): Promise<number> {
  return medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * ${String(f)}) })()`)
}

/** Las puntas de los gestos: Tu panel tapando todavía, y el escenario del final con la frase entera. */
async function puntas(b: Banco): Promise<{ desde: number; hasta: number; mirada: number; puerta: number }> {
  return { desde: await bordeEn(b, 1.12), hasta: await topeMas('por-que-develop', 0.5)(b), mirada: await bordeEn(b, 0.12), puerta: await bordeEn(b, 0.5) }
}

/** Arranca el muestreo en la página: en cada cuadro, el tiempo, el scroll y el estado del amanecer. */
const MUESTREAR = `(() => { window.__lineaDelAmanecer = []; const t0 = performance.now(); const paso = () => { if (!window.__lineaDelAmanecer) return; const e = window.__amanecerDelBanco.estado(); window.__lineaDelAmanecer.push([Math.round(performance.now() - t0), Math.round(scrollY), Math.round(e.pedido * 1000) / 1000, Math.round(e.avance * 1000) / 1000, Math.round(e.texto * 1000) / 1000, Math.round(e.abajo * 1000) / 1000]); requestAnimationFrame(paso) }; requestAnimationFrame(paso) })()`
const JUNTAR = `(() => { const l = window.__lineaDelAmanecer; window.__lineaDelAmanecer = null; return l })()`

type Muestra = [number, number, number, number, number, number]

/** Los tres gestos. */
async function gesto(b: Banco, cual: string, p: Awaited<ReturnType<typeof puntas>>): Promise<void> {
  await esperar(800)
  if (cual === 'lento') {
    await scrollSuave(b, p.desde, p.hasta, 7000)
    await esperar(2500)
  } else if (cual === 'rapido') {
    await scrollSuave(b, p.desde, p.hasta, 500)
    await esperar(4000)
  } else {
    // La vuelta: despacio hacia atrás hasta que Tu panel tapa medio cuadro, quieto, y de un tirón hasta taparlo.
    await scrollSuave(b, p.hasta, p.puerta, 4500)
    await esperar(1500)
    await scrollSuave(b, p.puerta, p.desde, 400)
    await esperar(2500)
  }
}

/** Lo que se lee de una línea de tiempo: cuánto tardó el avance de punta a punta y cuándo apareció el texto. */
function resumen(l: readonly Muestra[]): Record<string, number | null> {
  const cuando = (f: (m: Muestra) => boolean): number | null => l.find(f)?.[0] ?? null
  const arranca = cuando((m) => m[3] > 0.01)
  const llega = cuando((m) => m[3] > 0.99)
  const vuelve = l.findIndex((m) => m[3] > 0.99) >= 0 ? cuando((m) => m[3] < 0.01 && l.indexOf(m) > l.findIndex((x) => x[3] > 0.99)) : null
  let atras = 0
  for (const m of l) atras = Math.max(atras, m[2] - m[3])
  return { arrancaMs: arranca, llegaMs: llega, deArribaAAbajoS: arranca !== null && llega !== null ? (llega - arranca) / 1000 : null, textoAparece: arranca === null ? null : cuando((m) => m[0] > arranca && m[4] > 0.05), vuelveALaNocheMs: vuelve, loMasAtrasDelScroll: Math.round(atras * 1000) / 1000 }
}

async function sonda(cual: string, grabarlo: boolean): Promise<void> {
  const dir = carpeta8('amanecer')
  const b = await abrir8('producto')
  try {
    const p = await puntas(b)
    await scrollHasta(b, cual === 'vuelta' ? p.hasta : p.desde)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(cual === 'vuelta' ? 4000 : 2500)
    await medir(b.p, MUESTREAR)
    const r = grabarlo ? await grabar(b, `${dir}/amanecer-${cual}`, () => gesto(b, cual, p), 1440) : (await gesto(b, cual, p), null)
    const linea = await medir<Muestra[]>(b.p, JUNTAR)
    writeFileSync(`${dir}/linea-${cual}.json`, JSON.stringify({ columnas: ['ms', 'scroll', 'pedido', 'avance', 'frase', 'abajo'], puntas: p, muestras: linea }))
    console.log(JSON.stringify({ gesto: cual, ...resumen(linea), clip: r }))
  } finally {
    await b.cerrar()
  }
}

/** Los momentos (s del guion de ESCENA 7, que sigue siendo el orden del avance). */
const MOMENTOS = [
  [0, 'noche'],
  [0.6, 'se-apagan-las-estrellas'],
  [1.9, 'resplandor-contraluz'],
  [3.2, 'frente-en-la-formacion'],
  [4.4, 'frente-en-las-primeras-filas'],
  [4.9, 'rayos-por-la-trama'],
  [5.8, 'el-piso-vivo'],
  [6.7, 'por-ultimo-el-logo'],
  [7.6, 'dia'],
] as const

async function momentos(): Promise<void> {
  const dir = carpeta8('amanecer/cuadros')
  const b = await abrir8('producto')
  try {
    const p = await puntas(b)
    await scrollHasta(b, p.desde)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(0)')
    await scrollHasta(b, p.mirada)
    for (const [s, nombre] of MOMENTOS) {
      await medir(b.p, `window.__amanecerDelBanco.congelar(${String(s)})`)
      await esperar(900)
      writeFileSync(`${dir}/${String(s).replace('.', '_')}-${nombre}.png`, await toma(b))
    }
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
  } finally {
    await b.cerrar()
  }
}

async function toma(b: Banco): Promise<Buffer> {
  await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(0)))))')
  const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(s.data, 'base64')
}

/** Un texto a la vista: su caja, su color, su tamaño y la opacidad con que está (la de todos sus ancestros). */
interface Texto {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly texto: string
  readonly color: string
  readonly px: number
  readonly peso: number
  readonly opacidad: number
}

const TEXTOS = `[...document.querySelectorAll('main :is(h1, h2, h3, h4, p, a, li, span), footer :is(p, a, span)')].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 12 && r.height > 8 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && s.visibility !== 'hidden' && !e.closest('.sr-only, [aria-hidden="true"]') && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() !== '') }).map((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); let o = 1; for (let a = e; a; a = a.parentElement) o *= Number(getComputedStyle(a).opacity); return { x: Math.round(Math.max(0, r.left)), y: Math.round(Math.max(0, r.top)), ancho: Math.round(Math.min(innerWidth, r.right) - Math.max(0, r.left)), alto: Math.round(Math.min(innerHeight, r.bottom) - Math.max(0, r.top)), texto: e.textContent.trim().slice(0, 32), color: s.color, px: parseFloat(s.fontSize), peso: Number(s.fontWeight) || 400, opacidad: Math.round(o * 1000) / 1000 } }).filter((t) => t.opacidad > 0.01)`

const lineal = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const luminancia = (r: number, g: number, b: number): number => 0.2126 * lineal(r / 255) + 0.7152 * lineal(g / 255) + 0.0722 * lineal(b / 255)
const razon = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const rgb = (c: string): [number, number, number] => {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(c)
  return m === null ? [0, 0, 0] : [Number(m[1]), Number(m[2]), Number(m[3])]
}

/**
 * El contraste de cada texto con la opacidad con que está: el fondo es la mediana de los píxeles de la caja que
 * no son glifo (lo que no se parece ni a la tinta ni a la tinta mezclada con el fondo); el texto, la tinta
 * mezclada con ese fondo por su opacidad (como compone el navegador, en sRGB).
 */
function contrastes(png: Buffer, textos: readonly Texto[]): { texto: string; opacidad: number; fondo: number; razon: number; aa: number }[] {
  const img = decodificarPng(png)
  return textos.map((t) => {
    const [tr, tg, tb] = rgb(t.color)
    const fondo: [number, number, number][] = []
    for (let y = t.y; y < Math.min(img.alto, t.y + t.alto); y += 1) {
      for (let x = t.x; x < Math.min(img.ancho, t.x + t.ancho); x += 1) {
        const i = (y * img.ancho + x) * 4
        fondo.push([img.datos[i], img.datos[i + 1], img.datos[i + 2]])
      }
    }
    // El fondo: la mitad más lejana de la tinta (los glifos, a cualquier opacidad, quedan del lado de la tinta).
    const lejos = (p: [number, number, number]): number => Math.abs(p[0] - tr) + Math.abs(p[1] - tg) + Math.abs(p[2] - tb)
    fondo.sort((a, b) => lejos(b) - lejos(a))
    const mitad = fondo.slice(0, Math.max(1, Math.floor(fondo.length / 2)))
    const lums = mitad.map((p) => luminancia(...p)).sort((a, b) => a - b)
    const lb = lums[Math.floor(lums.length / 2)] ?? 0
    const pb = mitad[Math.floor(mitad.length / 2)] ?? [0, 0, 0]
    const o = t.opacidad
    const efectivo: [number, number, number] = [pb[0] + (tr - pb[0]) * o, pb[1] + (tg - pb[1]) * o, pb[2] + (tb - pb[2]) * o]
    const grande = t.px >= 24 || (t.px >= 18.66 && t.peso >= 700)
    return { texto: t.texto, opacidad: o, fondo: Math.round(lb * 1000) / 1000, razon: Math.round(razon(luminancia(...efectivo), lb) * 100) / 100, aa: grande ? 3 : 4.5 }
  })
}

/** El avance de cada instante de un paso rápido: la persecución simulada con el borde de Tu panel del gesto. */
function pasoRapido(p: Awaited<ReturnType<typeof puntas>>, alto: number, pieDoc: number, ms: number): { t: number; scroll: number; avance: number }[] {
  const dt = 1 / 60
  const salida: { t: number; scroll: number; avance: number }[] = []
  let avance = 0
  let arranco = false
  for (let t = 0; t <= ms / 1000 + AMANECER.minimoS + 0.3; t += dt) {
    const u = Math.min(1, t / (ms / 1000))
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
    const scroll = p.desde + (p.hasta - p.desde) * e
    const borde = pieDoc - scroll
    const pedido = avanceDelScroll(borde, alto)
    // La compuerta prende el día con el borde en `visible`: desde ahí persigue (antes, noche).
    if (!arranco && borde < AMANECER.visible * alto) arranco = true
    avance = arranco ? perseguir(avance, pedido, dt) : 0
    salida.push({ t, scroll: Math.round(scroll), avance })
  }
  return salida
}

/** Hasta dónde llega el tirón (pantallas del pin de Por qué develOP): la frase entera, los valores, el CTA. */
const DESTINOS: Record<string, number> = { frase: 0.5, valores: 1.8, cta: 2.9 }

async function contraste(destino: string): Promise<void> {
  const dir = carpeta8(`amanecer/contraste/${destino}`)
  const b = await abrir8('producto')
  const filas: unknown[] = []
  try {
    const p = { ...(await puntas(b)), hasta: await topeMas('por-que-develop', DESTINOS[destino] ?? 0.5)(b) }
    const alto = await medir<number>(b.p, 'innerHeight')
    const pieDoc = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return r.bottom + scrollY })()`)
    // Un tirón a ~2.900 px/s (el de la frase dura 0,5 s).
    const instantes = pasoRapido(p, alto, pieDoc, Math.max(500, Math.round((p.hasta - p.desde) / 2.9)))
    // Un instante cada 0,1 s en el gesto y cada 0,2 s después, hasta que el avance llega.
    const fin = instantes.findIndex((m) => m.scroll === p.hasta)
    const elegidos = instantes.filter((m, i) => (i <= fin ? i % 6 === 0 : i % 12 === 0) && (m.avance < 1 || i <= fin)).concat([instantes[instantes.length - 1]])
    await scrollHasta(b, p.desde)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(0)')
    for (const m of elegidos) {
      await medir(b.p, `window.__amanecerDelBanco.congelar(${String(m.avance * AMANECER.final)})`)
      await scrollHasta(b, m.scroll)
      await esperar(700)
      const textos = await medir<Texto[]>(b.p, TEXTOS)
      const png = await toma(b)
      const nombre = `t${m.t.toFixed(2).replace('.', '_')}`

      writeFileSync(`${dir}/${nombre}.png`, png)
      const r = contrastes(png, textos)
      const visibles = r.filter((x) => x.opacidad >= 0.35)
      const peor = visibles.reduce<(typeof r)[number] | null>((a, x) => (a === null || x.razon / x.aa < a.razon / a.aa ? x : a), null)
      const fila = {
        t: Math.round(m.t * 100) / 100,
        scroll: m.scroll,
        avance: Math.round(m.avance * 1000) / 1000,
        frase: Math.round(diaParaElTexto(m.avance, 'frase') * 1000) / 1000,
        abajo: Math.round(diaParaElTexto(m.avance, 'abajo') * 1000) / 1000,
        textos: r.length,
        visibles: visibles.length,
        peor,
        bajoAA: visibles.filter((x) => x.razon < x.aa).map((x) => `${x.texto} ${String(x.razon)} (opacidad ${String(x.opacidad)})`),
        llegando: r.filter((x) => x.opacidad < 0.35).map((x) => `${x.texto} ${String(x.razon)} (opacidad ${String(x.opacidad)})`),
      }
      filas.push(fila)
      console.log(JSON.stringify(fila))
    }
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta8('amanecer')}/contraste-tiron-a-${destino}.json`, JSON.stringify(filas, null, 1))
}

/**
 * El pie a la vista antes de que termine el amanecer (un tirón de más de cuatro pantallas, o Fin): el pie es
 * compartido y no espera, así que la escena no deja al amanecer atrás de un mínimo. Esto mide su texto con el
 * amanecer congelado en varios avances, con el pie entrando (a medio cuadro) y entero.
 */
async function contrastePie(): Promise<void> {
  const dir = carpeta8('amanecer/contraste-pie')
  const b = await abrir8('producto')
  const filas: unknown[] = []
  try {
    const medio = await topeMas('cierre', -0.5)(b)
    const entero = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
    for (const [donde, y] of [['entrando', medio], ['entero', entero]] as const) {
      await scrollHasta(b, y)
      await esperar(1500)
      for (const avance of [0.64, 0.72, 0.8, 0.9, 1]) {
        await medir(b.p, `window.__amanecerDelBanco.congelar(${String(avance * AMANECER.final)})`)
        await esperar(700)
        const textos = await medir<Texto[]>(b.p, TEXTOS)
        const png = await toma(b)
        writeFileSync(`${dir}/${donde}-${String(avance).replace('.', '_')}.png`, png)
        const r = contrastes(png, textos).filter((x) => x.opacidad >= 0.35)
        const peor = r.reduce<(typeof r)[number] | null>((a, x) => (a === null || x.razon / x.aa < a.razon / a.aa ? x : a), null)
        const fila = { donde, avance, textos: r.length, peor, bajoAA: r.filter((x) => x.razon < x.aa).map((x) => `${x.texto} ${String(x.razon)}`) }
        filas.push(fila)
        console.log(JSON.stringify(fila))
      }
    }
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta8('amanecer')}/contraste-pie.json`, JSON.stringify(filas, null, 1))
}

async function principal(): Promise<void> {
  if (QUE === 'contraste-pie') return contrastePie()
  if (QUE === 'sonda') return sonda(CUAL, false)
  if (QUE === 'clips') {
    for (const c of CUAL === '' ? ['lento', 'rapido', 'vuelta'] : [CUAL]) await sonda(c, true)
    return
  }
  if (QUE === 'momentos') return momentos()
  if (QUE === 'contraste') {
    for (const d of CUAL === '' ? Object.keys(DESTINOS) : [CUAL]) await contraste(d)
    return
  }
  throw new Error(`no sé qué es «${QUE}»`)
}

if (process.argv[1]?.endsWith('amanecer8.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
