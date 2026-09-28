/**
 * SPRINT ESCENA 6 — los clips: lo que se mueve se juzga en video. clips6.ts <qué> [variante]
 *
 * Cada `<qué>` escribe en su carpeta de `escena6/`. El cursor va como un punto rojo que sólo existe
 * en la captura (`PUNTO_DEL_CURSOR`).
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'
import { DIR6, PUNTO_DEL_CURSOR, escenaViva, grabar, mover, topeMas, viajarElPuntero } from './banco-escena'

const [QUE, VARIANTE] = [process.argv[2] ?? '', process.argv[3] ?? '']

export async function abrir(pedido: string, ancho = 1440, alto = 900): Promise<Banco> {
  return abrirBanco(ancho, alto, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${PUNTO_DEL_CURSOR}` })
}

export function carpeta(nombre: string): string {
  const dir = `${DIR6}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

/** Un scroll suave de `desde` a `hasta` en `ms`, con la curva de ida y vuelta de siempre. */
export function scrollSuave(b: Banco, desde: number, hasta: number, ms: number): Promise<unknown> {
  return medir(
    b.p,
    `new Promise((listo) => { const t0 = performance.now(); const paso = () => { const u = Math.min(1, (performance.now() - t0) / ${String(ms)}); const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; window.scrollTo(0, ${String(desde)} + (${String(hasta)} - ${String(desde)}) * e); if (u < 1) requestAnimationFrame(paso); else listo(1) }; requestAnimationFrame(paso) })`,
  )
}

/** Un punto de la zona donde el logo da hover (E4), recorriendo una grilla. */
export async function puntoDelLogo(b: Banco, zona: readonly [number, number, number, number]): Promise<[number, number]> {
  const [x0, y0, x1, y1] = zona
  const dentro: [number, number][] = []
  for (let j = 0; j <= 6; j += 1) {
    for (let i = 0; i <= 6; i += 1) {
      const x = x0 + ((x1 - x0) * i) / 6
      const y = y0 + ((y1 - y0) * j) / 6
      await mover(b, x, y)
      await esperar(200)
      if ((await escenaViva(b))?.hover === true) dentro.push([x, y])
    }
  }
  if (dentro.length === 0) throw new Error('no encontré el logo: ningún punto de la zona dio hover')
  const media = (k: 0 | 1): number => Math.round(dentro.reduce((s, p) => s + p[k], 0) / dentro.length)
  const c: [number, number] = [media(0), media(1)]
  return dentro.reduce((mejor, p) => (Math.hypot(p[0] - c[0], p[1] - c[1]) < Math.hypot(mejor[0] - c[0], mejor[1] - c[1]) ? p : mejor))
}

export function concatenar(partes: readonly string[], destino: string): void {
  const lista = partes.flatMap((p) => ['-i', p])
  const filtro = `${partes.map((_, i) => `[${String(i)}:v]`).join('')}concat=n=${String(partes.length)}:v=1[v]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...lista, '-filter_complex', filtro, '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
  for (const p of partes) rmSync(p, { force: true })
}

/** Recorta una zona del clip y la agranda al doble, sin suavizar: para lo que es chico. */
export function recorte(origen: string, destino: string, x: number, y: number, ancho: number, alto: number): void {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origen, '-vf', `crop=${String(ancho)}:${String(alto)}:${String(x)}:${String(y)},scale=${String(ancho * 2)}:-2:flags=neighbor`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
}

/** El mismo clip con el contraste estirado alrededor del papel: para ver lo que es tenue (el anillo). */
export function estirado(origen: string, destino: string): void {
  const curva = "'clip((val-205)*5,0,255)'"
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origen, '-vf', `lutrgb=r=${curva}:g=${curva}:b=${curva}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
}

export const fin = (b: Banco): Promise<number> => medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
export const FUERA: [number, number] = [1400, 880]

/** 3 · la noche quieta en Trabajos, y el recorte al doble de la esquina de arriba. */
async function estrellas(nombre: string, pedido: string): Promise<void> {
  const dir = carpeta('estrellas')
  const b = await abrir(pedido)
  try {
    const trabajos = await topeMas('trabajos', 0)(b)
    await scrollHasta(b, trabajos)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(5000)
    const r = await grabar(b, `${dir}/noche-quieta-${nombre}`, () => esperar(14000), 1440)
    recorte(`${dir}/noche-quieta-${nombre}.mp4`, `${dir}/noche-recorte-x2-${nombre}.mp4`, 0, 0, 720, 360)
    console.log(JSON.stringify({ clip: `estrellas-${nombre}`, ...r }))
  } finally {
    await b.cerrar()
  }
}

/** 1 · el pulso pasando detrás del texto del hero y del pie (y la versión con el contraste estirado). */
async function fondos(nombre: string): Promise<void> {
  const dir = carpeta('fondos-texto')
  const b = await abrir('producto')
  try {
    const pie = await fin(b)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const a = await grabar(b, `${dir}/pulso-hero-${nombre}`, () => esperar(9000), 1440)
    await scrollHasta(b, pie)
    await esperar(3000)
    const c = await grabar(b, `${dir}/pulso-pie-${nombre}`, () => esperar(9000), 1440)
    concatenar([`${dir}/pulso-hero-${nombre}.mp4`, `${dir}/pulso-pie-${nombre}.mp4`], `${dir}/pulso-hero-y-pie-${nombre}.mp4`)
    estirado(`${dir}/pulso-hero-y-pie-${nombre}.mp4`, `${dir}/pulso-hero-y-pie-${nombre}-contraste-x5.mp4`)
    console.log(JSON.stringify({ clip: `fondos-${nombre}`, hero: a, pie: c }))
  } finally {
    await b.cerrar()
  }
}

/** Un recorrido del cursor por el piso: una pasada larga, un círculo y una pasada corta y rápida. */
async function recorrerElPiso(b: Banco, centro: readonly [number, number]): Promise<void> {
  const [cx, cy] = centro
  await viajarElPuntero(b, FUERA, [cx - 520, cy + 40], 700)
  await esperar(500)
  await viajarElPuntero(b, [cx - 520, cy + 40], [cx + 480, cy + 90], 3200)
  await esperar(1500)
  // Un círculo alrededor del centro.
  const pasos = 90
  for (let i = 0; i <= pasos; i += 1) {
    const a = (i / pasos) * Math.PI * 2
    await mover(b, cx + 480 * Math.cos(a) * 0.55, cy + 90 * 0.7 + Math.sin(a) * 70)
    await esperar(33)
  }
  await esperar(1200)
  await viajarElPuntero(b, [cx + 260, cy + 60], [cx - 320, cy + 20], 600)
  await esperar(2500)
  await viajarElPuntero(b, [cx - 320, cy + 20], FUERA, 500)
  await esperar(3500)
}

/** 5 · el piso vivo: el cursor en el hero y en el pie, un scroll fuerte, y la variante del pulso. */
async function piso(que: string): Promise<void> {
  const dir = carpeta('piso-vivo')
  const b = await abrir(que === 'pulso' ? 'producto,piso=pulso' : 'producto,piso')
  try {
    if (que === 'cursor') {
      const pie = await fin(b)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(3000)
      const a = await grabar(b, `${dir}/cursor-hero`, () => recorrerElPiso(b, [900, 720]), 1440)
      await scrollHasta(b, pie)
      await esperar(3000)
      const c = await grabar(b, `${dir}/cursor-pie`, () => recorrerElPiso(b, [720, 760]), 1440)
      console.log(JSON.stringify({ clip: 'piso-cursor', hero: a, pie: c }))
    } else if (que === 'scroll') {
      const quienes = await topeMas('quienes-somos', 0.15)(b)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(3000)
      const r = await grabar(b, `${dir}/scroll-fuerte`, async () => {
        await esperar(1500)
        await scrollSuave(b, 0, quienes * 0.6, 900)
        await esperar(2500)
        await scrollSuave(b, quienes * 0.6, 0, 900)
        await esperar(4000)
      }, 1440)
      console.log(JSON.stringify({ clip: 'piso-scroll', ...r }))
    } else {
      const logo = await puntoDelLogo(b, [800, 330, 1150, 600])
      await mover(b, FUERA[0], FUERA[1])
      await esperar(3000)
      const r = await grabar(b, `${dir}/pulso`, async () => {
        await esperar(1500)
        // Entrar y salir del logo: dos principales.
        await viajarElPuntero(b, FUERA, logo, 700)
        await esperar(5000)
        await viajarElPuntero(b, logo, FUERA, 700)
        await esperar(6000)
      }, 1440)
      console.log(JSON.stringify({ clip: 'piso-pulso', logo, ...r }))
    }
  } finally {
    await b.cerrar()
  }
}

/** 4 · el polvo que se posa: 40 s quieto y el scroll; y aparte el remolino del cursor en cámara lenta. */
async function posarse(que: string): Promise<void> {
  const dir = carpeta('polvo-se-posa')
  const b = await abrir('producto,posarse')
  try {
    await mover(b, FUERA[0], FUERA[1])
    await esperar(1500)
    if (que === 'lento') {
      // Que se pose entero sin grabar, y después el remolino del cursor a un cuarto de velocidad.
      await esperar(30000)
      await medir(b.p, 'window.__fisicaDelBanco.camaraLenta(0.25)')
      const r = await grabar(b, `${dir}/remolino-camara-lenta-x025`, async () => {
        await esperar(1500)
        await viajarElPuntero(b, [760, 800], [900, 780], 350)
        await esperar(16000)
      }, 1440)
      console.log(JSON.stringify({ clip: 'posarse-lento', ...r }))
      return
    }
    const r = await grabar(b, `${dir}/quieto-40s-y-scroll`, async () => {
      await esperar(40000)
      await scrollSuave(b, 0, 380, 1200)
      await esperar(1500)
      await scrollSuave(b, 380, 0, 1200)
      await esperar(7000)
    }, 1440)
    console.log(JSON.stringify({ clip: 'posarse', ...r }))
  } finally {
    await b.cerrar()
  }
}

/** Dos clips del mismo gesto, lado a lado (izquierda sin la prueba, derecha con ella), con rótulo. */
export function ladoALado(izquierda: string, derecha: string, destino: string, rotulos: readonly [string, string]): void {
  const fuente = "C\\:/Windows/Fonts/arial.ttf"
  const r = (t: string): string => `drawtext=fontfile='${fuente}':text='${t}':x=14:y=12:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=6`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', izquierda, '-i', derecha, '-filter_complex', `[0:v]scale=960:-2,${r(rotulos[0])}[a];[1:v]scale=960:-2,${r(rotulos[1])}[b];[a][b]hstack=inputs=2:shortest=1`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
}

/** El mismo gesto de scroll, con y sin una prueba: 6a (inercia) y 6b (remolinos). */
function conYSin(prueba: string, carpetaDe: string, gesto: (b: Banco, quienes: number) => Promise<void>): Promise<void> {
  return conYSinDe('producto', prueba, carpetaDe, gesto)
}

/** Lo mismo sobre una base cualquiera (6d va sobre el producto con la formación). */
async function conYSinDe(base: string, prueba: string, carpetaDe: string, gesto: (b: Banco, quienes: number) => Promise<void>): Promise<void> {
  const dir = carpeta(carpetaDe)
  const partes: string[] = []
  for (const [nombre, pedido] of [['sin', base], ['con', `${base},${prueba}`]] as const) {
    const b = await abrir(pedido)
    try {
      const quienes = await topeMas('quienes-somos', 0.15)(b)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(3000)
      const r = await grabar(b, `${dir}/${nombre}`, () => gesto(b, quienes), 1440)
      partes.push(`${dir}/${nombre}.mp4`)
      console.log(JSON.stringify({ clip: `${prueba}-${nombre}`, ...r }))
    } finally {
      await b.cerrar()
    }
  }
  ladoALado(partes[0], partes[1], `${dir}/sin-y-con.mp4`, ['sin', `con ${prueba}`])
}

/** 6c · la niebla rasante: quieto en Quiénes y en Por qué, con la formación; y la hoja con y sin. */
async function rasante(): Promise<void> {
  const dir = carpeta('niebla-rasante')
  const b = await abrir('producto,formacion,rasante')
  try {
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    const porQue = await topeMas('por-que-develop', 0.7)(b)
    await scrollHasta(b, quienes)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const a = await grabar(b, `${dir}/quienes-quieto`, () => esperar(16000), 1440)
    await scrollHasta(b, porQue)
    await esperar(3000)
    const c = await grabar(b, `${dir}/porque-quieto`, () => esperar(16000), 1440)
    concatenar([`${dir}/quienes-quieto.mp4`, `${dir}/porque-quieto.mp4`], `${dir}/rodando-quieto.mp4`)
    console.log(JSON.stringify({ clip: 'rasante', quienes: a, porQue: c }))
  } finally {
    await b.cerrar()
  }
}

/** 6g · de Tu panel a Por qué develOP, despacio: el borde de Tu panel sube y deja ver la sala. */
async function dia(): Promise<void> {
  const dir = carpeta('dia-desde-afuera')
  const partes: string[] = []
  for (const [nombre, pedido] of [['hoy', 'producto,formacion'], ['variante', 'producto,formacion,dia=afuera']] as const) {
    const b = await abrir(pedido)
    try {
      const desde = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 1.12) })()`)
      const hasta = await topeMas('por-que-develop', 0.25)(b)
      await scrollHasta(b, desde)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(2500)
      const r = await grabar(b, `${dir}/${nombre}`, async () => {
        await esperar(800)
        await scrollSuave(b, desde, hasta, 3500)
        await esperar(3500)
      }, 1440)
      partes.push(`${dir}/${nombre}.mp4`)
      console.log(JSON.stringify({ clip: `dia-${nombre}`, desde, hasta, ...r }))
    } finally {
      await b.cerrar()
    }
  }
  ladoALado(partes[0], partes[1], `${dir}/hoy-y-variante.mp4`, ['hoy (con la formacion)', 'variante 6g'])
}

/** 6e · la noche cae y el haz se enciende; después, ida y vuelta sobre la frontera (sin volver a parpadear). */
async function encendido(): Promise<void> {
  const dir = carpeta('haz-encendido')
  const b = await abrir('producto,encendido')
  try {
    // La noche cae (la gota) a ~1,4 pantallas antes de Trabajos: se arranca de día, antes.
    const dia = await topeMas('trabajos', -2.2)(b)
    const noche = await topeMas('trabajos', -0.9)(b)
    await scrollHasta(b, dia)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const r = await grabar(b, `${dir}/cae-la-noche`, async () => {
      await esperar(800)
      await scrollSuave(b, dia, noche, 3500)
      await esperar(4500)
      // Ida y vuelta sobre la frontera: el haz se apaga suave y vuelve sin el guion.
      await scrollSuave(b, noche, dia, 2000)
      await esperar(1500)
      await scrollSuave(b, dia, noche, 2000)
      await esperar(3500)
    }, 1440)
    const estado = await medir<unknown>(b.p, 'window.__escenaViva.encendido')
    console.log(JSON.stringify({ clip: 'encendido', estado, ...r }))
  } finally {
    await b.cerrar()
  }
}

/** 6f · la noche quieta en Trabajos, con y sin el aire caliente, y el recorte al doble de la columna. */
async function calor(): Promise<void> {
  const dir = carpeta('aire-caliente')
  const partes: string[] = []
  for (const [nombre, pedido] of [['sin', 'producto'], ['con', 'producto,calor']] as const) {
    const b = await abrir(pedido)
    try {
      const trabajos = await topeMas('trabajos', 0)(b)
      await scrollHasta(b, trabajos)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(4000)
      const r = await grabar(b, `${dir}/${nombre}`, () => esperar(10000), 1440)
      partes.push(`${dir}/${nombre}.mp4`)
      recorte(`${dir}/${nombre}.mp4`, `${dir}/${nombre}-columna-x2.mp4`, 240, 250, 480, 520)
      console.log(JSON.stringify({ clip: `calor-${nombre}`, ...r }))
    } finally {
      await b.cerrar()
    }
  }
  ladoALado(partes[0], partes[1], `${dir}/sin-y-con.mp4`, ['sin', 'con 6f aire caliente'])
  ladoALado(`${dir}/sin-columna-x2.mp4`, `${dir}/con-columna-x2.mp4`, `${dir}/columna-x2-sin-y-con.mp4`, ['sin (x2)', 'con 6f (x2)'])
}

/** 2 · el recorrido con la formación (y con la variante sin fallas visibles). */
async function formacion(variante: string): Promise<void> {
  const dir = carpeta('formacion')
  const pedido = variante === 'sin-fallas' ? 'producto,formacion,fallas=no' : 'producto,formacion'
  const b = await abrir(pedido)
  try {
    const trabajos = await topeMas('trabajos', 0)(b)
    const porQue = await topeMas('por-que-develop', 0)(b)
    const pie = await fin(b)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(2500)
    const a = await grabar(b, `${dir}/ruta-a`, async () => {
      await esperar(1200)
      await scrollSuave(b, 0, trabajos, 12000)
      await esperar(1500)
    }, 1440)
    await scrollHasta(b, porQue)
    const c = await grabar(b, `${dir}/ruta-b`, async () => {
      await esperar(1000)
      await scrollSuave(b, porQue, pie, 10000)
      await esperar(1500)
    }, 1440)
    concatenar([`${dir}/ruta-a.mp4`, `${dir}/ruta-b.mp4`], `${dir}/recorrido-1440${variante === 'sin-fallas' ? '-sin-fallas-visibles' : ''}.mp4`)
    console.log(JSON.stringify({ clip: `formacion-${variante}`, a, b: c }))
  } finally {
    await b.cerrar()
  }
}

async function principal(): Promise<void> {
  if (QUE === 'formacion') return formacion(VARIANTE)
  if (QUE === 'encendido') return encendido()
  if (QUE === 'calor') return calor()
  if (QUE === 'dia') return dia()
  if (QUE === 'rasante') return rasante()
  if (QUE === 'velocidad')
    return conYSinDe('producto,formacion', 'velocidad', 'niebla-velocidad', async (b, quienes) => {
      await esperar(1500)
      await scrollSuave(b, 0, quienes, 1200)
      await esperar(3000)
      await scrollSuave(b, quienes, 0, 1200)
      await esperar(3000)
    })
  if (QUE === 'inercia')
    return conYSin('inercia', 'inercia-aire', async (b, quienes) => {
      await esperar(1200)
      await scrollSuave(b, 0, quienes * 0.6, 800)
      await esperar(6000)
      await scrollSuave(b, quienes * 0.6, 0, 800)
      await esperar(6000)
    })
  if (QUE === 'remolinos')
    return conYSin('remolinos', 'remolinos', async (b, quienes) => {
      await esperar(1200)
      await scrollSuave(b, 0, quienes, 2600)
      await esperar(4500)
      await scrollSuave(b, quienes, 0, 2600)
      await esperar(4500)
    })
  if (QUE === 'posarse') return posarse(VARIANTE)
  if (QUE === 'piso') return piso(VARIANTE)
  if (QUE === 'estrellas') return estrellas(VARIANTE === 'antes' ? 'antes' : 'despues', 'producto,formacion,estrellas')
  if (QUE === 'fondos') return fondos(VARIANTE === 'antes' ? 'antes' : 'despues')
  throw new Error(`no sé qué es «${QUE}»`)
}

if (process.argv[1]?.endsWith('clips6.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })

export { viajarElPuntero }
