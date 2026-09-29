/**
 * SPRINT CALIDAD 1 — A1, el menú no dispara eventos de paso: viajes.ts <sonda|clips> <ancho> <alto> [etiqueta] [casos]
 *
 * - `sonda`: desde cada origen (las ocho secciones), un viaje del menú a cada destino (los cuatro ítems que
 *   viajan). En cada cuadro, en la página: el scroll, la noche de la sala (`uNoche`), el encendido del haz y el
 *   amanecer (activo, avance, pedido, rayos, resplandor, si sostiene la noche). Un viaje que sale y llega con
 *   la misma luz no puede tener evento de paso: ni el amanecer moviéndose, ni la noche sostenida, ni el haz
 *   encendiéndose, ni las estrellas. Los de día a noche y de noche a día quedan como hoy (sólo se informan).
 * - `clips`: graba los casos pedidos (`origen>destino`, separados por coma) a velocidad real.
 *
 * Va a `calidad1/a1-menu/`. La etiqueta (`antes`/`despues`) separa las dos corridas.
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { clicEnElItem } from '../scripts-viajes/b-humo'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { grabar, mover, topeMas } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const [QUE, ANCHO, ALTO, ETIQUETA, CASOS] = [process.argv[2] ?? 'sonda', Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900), process.argv[5] ?? 'antes', process.argv[6] ?? '']

/** Los ítems del menú que viajan (Contacto abre el formulario). */
const DESTINOS = ['quienes-somos', 'trabajos', 'servicios', 'por-que-develop'] as const
const ORIGENES = ['hero', 'quienes-somos', 'numeros', 'trabajos', 'servicios', 'tu-panel', 'por-que-develop', 'cierre'] as const

/** Una muestra por cuadro: ms, scroll, noche, fase del encendido, k, amanecer activo, avance, pedido, rayos, resplandor, sostiene, velo, reloj de la escena. */
type Muestra = [number, number, number, string | null, number, number, number, number, number, number, number, number, number?]

const MUESTREAR = `(() => {
  window.__lineaDelViaje = []
  const t0 = performance.now()
  const main = document.querySelector('[data-v3] main')
  const paso = () => {
    if (!window.__lineaDelViaje) return
    const v = window.__escenaViva || {}
    const a = window.__amanecerDelBanco ? window.__amanecerDelBanco.estado() : null
    const r = (x) => Math.round(x * 1000) / 1000
    window.__lineaDelViaje.push([Math.round(performance.now() - t0), Math.round(scrollY), r(v.noche ?? -1), v.encendido ? v.encendido.fase : null, v.encendido ? r(v.encendido.k) : -1, a ? (a.activo ? 1 : 0) : -1, a ? r(a.avance) : -1, a ? r(a.pedido) : -1, a ? r(a.rayos) : -1, a ? r(a.resplandor) : -1, a ? (a.sostiene ? 1 : 0) : -1, main && main.hasAttribute('data-v3-deslizando') ? 1 : 0, r(v.t ?? -1)])
    requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
  return 0
})()`
const JUNTAR = `(() => { const l = window.__lineaDelViaje; window.__lineaDelViaje = null; return l })()`

/** Dónde se para el banco en cada origen: el nudo del viaje si es un destino, si no un punto quieto de la sección. */
async function posiciones(b: Banco, nudos: Record<string, number>): Promise<Record<string, number>> {
  return {
    hero: 0,
    ...nudos,
    numeros: await topeMas('numeros', 0.5)(b),
    'tu-panel': await topeMas('tu-panel', 0.3)(b),
    cierre: await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight'),
  }
}

/** Un viaje: parado en `y`, asentado, clic en el ítem, hasta que el velo se fue y la escena terminó el viaje. */
async function viaje(b: Banco, y: number, destino: string, grabarEn: string | null): Promise<Muestra[]> {
  await scrollHasta(b, y)
  await mover(b, b.ancho - 40, b.alto - 20)
  await esperar(3500)
  await medir(b.p, MUESTREAR)
  const gesto = async (): Promise<void> => {
    await esperar(400)
    await clicEnElItem(b, destino)
    await esperar(1200)
    for (let i = 0; i < 120; i += 1) {
      const velo = await medir<boolean>(b.p, `document.querySelector('[data-v3] main').hasAttribute('data-v3-deslizando')`)
      if (!velo) break
      await esperar(50)
    }
    // El velo vuelve y recién ahí la escena termina el viaje; y un rato quieto, para ver que no pasa nada después.
    await esperar(2500)
  }
  if (grabarEn === null) await gesto()
  else await grabar(b, grabarEn, gesto, Math.min(b.ancho, 1200) & ~1)
  return medir<Muestra[]>(b.p, JUNTAR)
}

interface Veredicto {
  readonly origen: string
  readonly destino: string
  readonly sale: 'dia' | 'noche'
  readonly llega: 'dia' | 'noche'
  readonly nocheMax: number
  readonly encendiendo: boolean
  readonly amanecer: { readonly activo: boolean; readonly min: number; readonly max: number; readonly sostiene: boolean; readonly rayos: number; readonly resplandor: number; readonly llega: number }
  readonly evento: readonly string[]
}

/** Las opacas se ven de día y Trabajos de noche, como las clasifica `planDelViaje`; las demás, por la noche de la sala. */
const OPACAS = new Set(['servicios', 'tu-panel'])

/**
 * Los cuadros del viaje: desde que se prende el velo hasta que termina de volver. La escena termina el viaje
 * ahí (`relojDeLaEscena`, el fundido del `<main>`: 300 ms medidos), con el `<main>` opaco otra vez.
 */
const FUNDIDO_MS = 300
function delViaje(l: readonly Muestra[]): Muestra[] {
  const desde = l.findIndex((m) => m[11] === 1)
  if (desde < 0) return []
  const ultimo = l.length - 1 - [...l].reverse().findIndex((m) => m[11] === 1)
  // Sin los cuadros en que la escena todavía no dibujó después del clic (la muestra corre antes que su cuadro, y
  // una escena suspendida detrás de un panel opaco tarda en reanudarse): traen el estado del origen, tapado.
  const reloj = l[desde][12]
  let primero = desde + 1
  if (reloj !== undefined) while (primero < l.length && l[primero][12] === reloj) primero += 1
  return l.slice(primero, ultimo + 1).concat(l.slice(ultimo + 1).filter((m) => m[0] - l[ultimo][0] < FUNDIDO_MS - 20))
}

function juzgar(origen: string, destino: string, todas: readonly Muestra[]): Veredicto {
  const antes = todas.filter((m) => m[11] === 0 && m[0] < (todas.find((x) => x[11] === 1)?.[0] ?? Infinity))
  const porLaNoche = (m: Muestra | undefined): 'dia' | 'noche' => ((m?.[2] ?? 0) > 0.5 ? 'noche' : 'dia')
  const sale = OPACAS.has(origen) ? 'dia' : origen === 'trabajos' ? 'noche' : porLaNoche(antes[antes.length - 1])
  const llega = OPACAS.has(destino) ? 'dia' : destino === 'trabajos' ? 'noche' : porLaNoche(todas[todas.length - 1])
  const l = delViaje(todas)
  const activos = l.filter((m) => m[5] === 1)
  const avances = activos.map((m) => m[6])
  const amanecer = {
    activo: activos.length > 0,
    min: avances.length > 0 ? Math.min(...avances) : 0,
    max: avances.length > 0 ? Math.max(...avances) : 0,
    sostiene: l.some((m) => m[10] === 1),
    rayos: Math.max(0, ...l.map((m) => m[8])),
    resplandor: Math.max(0, ...l.map((m) => m[9])),
    llega: todas[todas.length - 1]?.[6] ?? 0,
  }
  // La noche de la sala en el viaje, salvo el primer cuadro del velo (una opaca de salida cambia ahí, todavía tapada).
  const nocheMax = Math.max(0, ...l.slice(1).map((m) => m[2]))
  const encendiendo = l.some((m) => m[3] === 'encendiendo')
  const evento: string[] = []
  if (sale === llega) {
    // El amanecer que se mueve mientras está prendido: es el evento que corre (quieto en su valor no lo es).
    if (amanecer.activo && amanecer.max - amanecer.min > 0.02) evento.push(`amanecer ${amanecer.min.toFixed(2)}→${amanecer.max.toFixed(2)}`)
    if (amanecer.sostiene && sale === 'dia') evento.push('noche sostenida por el amanecer')
    // Los rayos y el resplandor de la llegada son su estado (a 375 la llegada es un amanecer a medias): sólo cuenta lo que pasa de ahí.
    const fin = todas[todas.length - 1]
    if (amanecer.rayos > (fin?.[8] ?? 0) + 0.01 || amanecer.resplandor > (fin?.[9] ?? 0) + 0.01) evento.push(`rayos ${amanecer.rayos.toFixed(2)} · resplandor ${amanecer.resplandor.toFixed(2)}`)
    if (encendiendo) evento.push('el haz se enciende')
    if (sale === 'dia' && nocheMax > 0.05) evento.push(`noche ${nocheMax.toFixed(2)} (estrellas desde 0,5)`)
  }
  return { origen, destino, sale, llega, nocheMax, encendiendo, amanecer, evento }
}

async function sonda(): Promise<void> {
  const dir = carpeta('a1-menu')
  const b = await abrir('producto', ANCHO, ALTO)
  const filas: Veredicto[] = []
  const lineas: Record<string, Muestra[]> = {}
  try {
    // Los nudos: un viaje desde el hero a cada destino (que ya es un caso de la sonda).
    const nudos: Record<string, number> = {}
    for (const d of DESTINOS) {
      const l = await viaje(b, 0, d, null)
      nudos[d] = await medir<number>(b.p, 'Math.round(scrollY)')
      const v = juzgar('hero', d, l)
      filas.push(v)
      lineas[`hero>${d}`] = l
      console.log(JSON.stringify(v))
    }
    const donde = await posiciones(b, nudos)
    for (const o of ORIGENES.filter((x) => x !== 'hero')) {
      for (const d of DESTINOS.filter((x) => x !== o)) {
        const l = await viaje(b, donde[o], d, null)
        const v = juzgar(o, d, l)
        filas.push(v)
        lineas[`${o}>${d}`] = l
        console.log(JSON.stringify(v))
      }
    }
    const fallan = filas.filter((f) => f.evento.length > 0)
    const resumen = { ancho: ANCHO, alto: ALTO, etiqueta: ETIQUETA, viajes: filas.length, igualLuz: filas.filter((f) => f.sale === f.llega).length, fallan: fallan.map((f) => `${f.origen}>${f.destino}: ${f.evento.join('; ')}`), nudos: donde }
    writeFileSync(`${dir}/sonda-${String(ANCHO)}-${ETIQUETA}.json`, JSON.stringify({ resumen, filas, columnas: ['ms', 'scroll', 'noche', 'encendido', 'k', 'activo', 'avance', 'pedido', 'rayos', 'resplandor', 'sostiene', 'velo', 'reloj'], lineas }))
    console.log(JSON.stringify(resumen))
  } finally {
    await b.cerrar()
  }
}

/** Graba los casos pedidos (`origen>destino`), parando en el mismo lugar que la sonda. */
async function clips(): Promise<void> {
  const dir = carpeta('a1-menu/clips')
  const casos = CASOS.split(',').filter(Boolean).map((c) => c.split('>') as [string, string])
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    const nudos: Record<string, number> = {}
    for (const d of DESTINOS) {
      await scrollHasta(b, 0)
      await esperar(1500)
      await clicEnElItem(b, d)
      await esperar(6000)
      nudos[d] = await medir<number>(b.p, 'Math.round(scrollY)')
    }
    const donde = await posiciones(b, nudos)
    for (const [o, d] of casos) {
      const l = await viaje(b, donde[o], d, `${dir}/${o}-a-${d}-${String(ANCHO)}-${ETIQUETA}`)
      console.log(JSON.stringify(juzgar(o, d, l)))
    }
  } finally {
    await b.cerrar()
  }
}

/** Vuelve a juzgar una sonda ya corrida (las líneas guardadas), sin abrir el navegador. */
async function rejuzgar(): Promise<void> {
  const archivo = `${carpeta('a1-menu')}/sonda-${String(ANCHO)}-${ETIQUETA}.json`
  const j = JSON.parse(readFileSync(archivo, 'utf8')) as { resumen: Record<string, unknown>; lineas: Record<string, Muestra[]> }
  const filas = Object.entries(j.lineas).map(([k, l]) => {
    const [o, d] = k.split('>')
    return juzgar(o, d, l)
  })
  const fallan = filas.filter((f) => f.evento.length > 0)
  const resumen = { ...j.resumen, igualLuz: filas.filter((f) => f.sale === f.llega).length, fallan: fallan.map((f) => `${f.origen}>${f.destino}: ${f.evento.join('; ')}`) }
  writeFileSync(archivo, JSON.stringify({ ...j, resumen, filas }))
  console.log(JSON.stringify(resumen, null, 1))
}

if (process.argv[1]?.endsWith('viajes.ts')) {
  const correr = QUE === 'clips' ? clips : QUE === 'rejuzgar' ? rejuzgar : sonda
  correr().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
