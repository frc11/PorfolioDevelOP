/**
 * SPRINT ESCENA 8 — los clips: clips8.ts <haz|cielo-dia> [variante]
 *
 * - `haz` (T1): la noche cae y el haz se enciende (el gesto de ESCENA 7). Además, la luz de la columna del haz
 *   cuadro a cuadro (ffmpeg, la luma media de un recorte sobre la columna): cuántos intentos se ven antes de
 *   que prenda y cuánto dura la falla. Va a `haz/`.
 * - `cielo-dia` (T4): cada variante 15 s quieta en el hero (lo que se pidió) y 15 s quieta en Por qué develOP
 *   (donde el cielo es casi todo el cuadro: en el hero la formación llega hasta arriba y casi no se ve cielo).
 *   Va a `cielo-dia/clips/`.
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { DIR7, grabar, mover, topeMas } from './banco-escena'
import { abrir8, carpeta8 } from './banco8'
import { FUERA, scrollSuave } from './clips6'

const [QUE, VARIANTE] = [process.argv[2] ?? '', process.argv[3] ?? '']

/** La luma media de un recorte (x, y, ancho, alto), cuadro a cuadro, con el tiempo de cada cuadro (`metadata=print` escribe por la salida de error). */
function luma(clip: string, x: number, y: number, ancho: number, alto: number): { t: number; y: number }[] {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', clip, '-vf', `crop=${String(ancho)}:${String(alto)}:${String(x)}:${String(y)},signalstats,metadata=print:key=lavfi.signalstats.YAVG`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return lumaDeLaSalida(r.stderr)
}

function lumaDeLaSalida(texto: string): { t: number; y: number }[] {
  const salida: { t: number; y: number }[] = []
  let t = 0
  for (const linea of texto.split('\n')) {
    const tiempo = /pts_time:([\d.]+)/.exec(linea)
    if (tiempo !== null) t = Number(tiempo[1])
    const y = /YAVG=([\d.]+)/.exec(linea)
    if (y !== null) salida.push({ t, y: Number(y[1]) })
  }
  return salida
}

/**
 * Los intentos: sólo el tramo de noche (desde que la luz del día terminó de caer). La base es lo más oscuro de ese
 * tramo y la luz firme, la del final; cada vez que la luz sube por encima de una parte de ese salto es un intento,
 * salvo la última, que es el encendido de verdad (queda arriba). La falla: del primer intento al encendido. El
 * conteo depende de la parte (los intentos débiles apenas mueven la luma del recorte): se dan dos.
 */
function intentos(curva: readonly { t: number; y: number }[], parte: number): { umbral: string; intentos: number; fallaS: number; base: number; firme: number; picos: number[] } {
  const ys = curva.map((c) => c.y)
  const caida = ys.indexOf(Math.min(...ys))
  const noche = curva.slice(caida + 3)
  const orden = (v: number[]): number[] => [...v].sort((a, b) => a - b)
  const final = orden(noche.slice(-60).map((c) => c.y))
  const firme = final[Math.floor(final.length / 2)]
  const base = orden(noche.map((c) => c.y))[Math.floor(noche.length * 0.05)]
  const umbral = base + (firme - base) * parte
  // Con histéresis: un intento nuevo sólo después de 0,12 s apagada (entre dos intentos del guion hay 0,19 s o más;
  // un tramo que tiembla baja un instante y no es otro intento).
  const picos: number[] = []
  let arriba = false
  let bajo = -Infinity
  for (const c of noche) {
    if (!arriba && c.y > umbral) {
      arriba = true
      if (c.t - bajo >= 0.12 || picos.length === 0) picos.push(Math.round(c.t * 100) / 100)
    } else if (arriba && c.y < umbral) {
      arriba = false
      bajo = c.t
    }
  }
  const primero = picos[0] ?? 0
  return { umbral: `1/${String(Math.round(1 / parte))} del salto`, intentos: Math.max(0, picos.length - 1), fallaS: Math.round(((picos[picos.length - 1] ?? 0) - primero) * 100) / 100, base, firme, picos }
}

async function haz(): Promise<void> {
  const dir = carpeta8('haz')
  const b = await abrir8('producto')
  try {
    const dia = await topeMas('trabajos', -2.2)(b)
    const noche = await topeMas('trabajos', -0.9)(b)
    await scrollHasta(b, dia)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(3000)
    const r = await grabar(b, `${dir}/cae-la-noche`, async () => {
      await esperar(800)
      await scrollSuave(b, dia, noche, 3500)
      await esperar(6500)
    }, 1440)
    console.log(JSON.stringify({ clip: 'haz', ...r }))
  } finally {
    await b.cerrar()
  }
}

/** Después de grabar: la curva de la luz sobre el logo y los intentos; y lo mismo en el clip de ESCENA 7 (el antes). */
function curvaDelHaz(x: number, y: number, ancho: number, alto: number): void {
  const dir = carpeta8('haz')
  for (const [clip, nombre] of [[`${dir}/cae-la-noche.mp4`, 'luz-sobre-el-logo'], [`${DIR7}/haz/cae-la-noche.mp4`, 'luz-sobre-el-logo-escena7']] as const) {
    const curva = luma(clip, x, y, ancho, alto)
    // El clip de ESCENA 7 sigue con una ida y vuelta: sólo la primera noche (hasta 6 s después de la caída).
    const caida = curva.findIndex((c, i) => i > 0 && c.y < curva[0].y * 0.3)
    const primera = caida < 0 ? curva : curva.filter((c) => c.t <= curva[caida].t + 6)
    const medida = [intentos(primera, 1 / 3), intentos(primera, 1 / 6)]
    writeFileSync(`${dir}/${nombre}.json`, JSON.stringify({ clip, recorte: [x, y, ancho, alto], medida, curva: primera }, null, 1))
    console.log(JSON.stringify({ [nombre]: medida }))
  }
}

async function cieloDia(variante: string): Promise<void> {
  const dir = carpeta8('cielo-dia/clips')
  for (const [momento, donde] of [['hero', 0], ['por-que-develop', 'por-que-develop']] as const) {
    const b = await abrir8(`producto,cielo-dia=${variante}`)
    try {
      const y = typeof donde === 'number' ? donde : await topeMas(donde, 0.5)(b)
      await scrollHasta(b, y)
      await mover(b, FUERA[0], FUERA[1])
      await esperar(3000)
      const r = await grabar(b, `${dir}/${variante}-${momento}-quieto-15s`, () => esperar(15000), 1440)
      console.log(JSON.stringify({ clip: `${variante}-${momento}`, ...r }))
    } finally {
      await b.cerrar()
    }
  }
}

async function principal(): Promise<void> {
  if (QUE === 'haz') return haz()
  if (QUE === 'curva-del-haz') {
    const [x, y, ancho, alto] = VARIANTE.split(',').map(Number)
    return curvaDelHaz(x, y, ancho, alto)
  }
  if (QUE === 'cielo-dia') {
    for (const v of VARIANTE === '' ? ['pintado-celeste', 'pintado-mono', 'bloques-celeste', 'bloques-mono', 'particulas-celeste', 'particulas-mono'] : [VARIANTE]) await cieloDia(v)
    return
  }
  throw new Error(`no sé qué es «${QUE}»`)
}

if (process.argv[1]?.endsWith('clips8.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
