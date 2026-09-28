/**
 * SPRINT ESCENA 6 — las hojas. hojas6.ts <qué>
 *
 * Arma grillas con rótulo a partir de las capturas que dejan los bancos de ESCENA 6 en
 * `escena6/<carpeta>/cuadros/`. Una celda puede ir recortada (y agrandada) cuando lo que hay que
 * mirar es chico, o con el contraste estirado alrededor del papel cuando es tenue (el anillo).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

import { DIR6 } from './banco-escena'
import { rotuloDe } from './comparar'

const QUE = process.argv[2] ?? ''
const FUENTE = "C\\:/Windows/Fonts/arial.ttf"
export const MOMENTOS = ['hero', 'quienes-somos', 'trabajos-de-noche', 'por-que-develop', 'pie']

export interface Celda {
  readonly archivo: string
  readonly texto: string
  /** x, y, ancho, alto del recorte, en píxeles de la captura. */
  readonly recorte?: readonly [number, number, number, number]
  /** Estirar el contraste alrededor del papel (×5 desde 205). */
  readonly estirar?: boolean
}

const rotulo = (texto: string): string => `drawtext=fontfile='${FUENTE}':text='${texto}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`
const CURVA = "'clip((val-205)*5,0,255)'"

export function grilla(celdas: readonly (readonly Celda[])[], anchoDeCelda: number, destino: string): void {
  const planas = celdas.flat()
  for (const c of planas) if (!existsSync(c.archivo)) throw new Error(`falta ${c.archivo}`)
  const entradas = planas.flatMap((c) => ['-i', c.archivo])
  let filtro = ''
  planas.forEach((c, i) => {
    // ffmpeg pide ancho:alto:x:y.
    const corte = c.recorte === undefined ? '' : `crop=${String(c.recorte[2])}:${String(c.recorte[3])}:${String(c.recorte[0])}:${String(c.recorte[1])},`
    const estirar = c.estirar === true ? `lutrgb=r=${CURVA}:g=${CURVA}:b=${CURVA},` : ''
    filtro += `[${String(i)}]${corte}${estirar}scale=${String(anchoDeCelda)}:-2:flags=${c.recorte === undefined ? 'bicubic' : 'neighbor'},${rotulo(c.texto)}[c${String(i)}];`
  })
  let k = 0
  const filas: string[] = []
  celdas.forEach((fila, f) => {
    filtro += fila.length === 1 ? `[c${String(k++)}]null[f${String(f)}];` : `${fila.map(() => `[c${String(k++)}]`).join('')}hstack=inputs=${String(fila.length)}[f${String(f)}];`
    filas.push(`[f${String(f)}]`)
  })
  filtro += filas.length === 1 ? `${filas[0]}null` : `${filas.join('')}vstack=inputs=${String(filas.length)}`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', filtro, '-frames:v', '1', '-update', '1', destino])
  console.log(destino)
}

export const cuadro = (efecto: string, momento: string, ancho: number, pedido: string): string => `${DIR6}/${efecto}/cuadros/${momento}-${String(ancho)}-${rotuloDe(pedido)}.png`

/** 1 · antes/después del anillo detrás del texto, en la fase donde más pasa por detrás del texto. */
function fondos(): void {
  const wcag = JSON.parse(readFileSync(`${DIR6}/fondos-texto/wcag-1440.json`, 'utf8')) as Record<string, { despues: { fase: number; minimo: number }[]; sinAnillo: { minimo: number } }>
  const archivo = (m: string, cual: string, fase: number): string => `${DIR6}/fondos-texto/cuadros/${m}-1440-${cual}-${fase.toFixed(1)}.png`
  const faseDe = (m: string): number => {
    const d = wcag[m].despues
    const peor = d.reduce((a, b) => (b.minimo < a.minimo ? b : a))
    return peor.minimo < wcag[m].sinAnillo.minimo ? peor.fase : 0.9
  }
  const filas = MOMENTOS.map((m) => {
    const f = faseDe(m)
    return [
      { archivo: archivo(m, 'antes', f), texto: `${m} - antes (con mascara) - contraste x5`, estirar: true },
      { archivo: archivo(m, 'despues', f), texto: `${m} - despues (sin mascara) - contraste x5`, estirar: true },
      { archivo: archivo(m, 'despues', f), texto: `${m} - despues - como se ve` },
    ]
  })
  grilla(filas, 640, `${DIR6}/fondos-texto/hoja-antes-despues.png`)
}

/** 2 · los cinco momentos: sin formación, con fallas y sin fallas visibles; y 375, que no tiene. */
function formacion(): void {
  const filas = MOMENTOS.map((m) => [
    { archivo: cuadro('formacion', m, 1440, 'producto'), texto: `${m} - sin formacion` },
    { archivo: cuadro('formacion', m, 1440, 'producto,formacion'), texto: `${m} - con fallas` },
    { archivo: cuadro('formacion', m, 1440, 'producto,formacion,fallas=no'), texto: `${m} - sin fallas visibles` },
  ])
  grilla(filas, 640, `${DIR6}/formacion/hoja-1440.png`)
  // Un recorte al doble de la franja de la formación en Quiénes somos: las tres versiones.
  const franja: readonly [number, number, number, number] = [740, 290, 700, 210]
  grilla(
    [['producto', 'sin formacion'], ['producto,formacion', 'con fallas'], ['producto,formacion,fallas=no', 'sin fallas visibles']].map(([p, t]) => [{ archivo: cuadro('formacion', 'quienes-somos', 1440, p), texto: `quienes-somos x2 - ${t}`, recorte: franja }]),
    1440,
    `${DIR6}/formacion/hoja-franja-x2.png`,
  )
  grilla([['hero', 'quienes-somos'].map((m) => ({ archivo: cuadro('formacion', m, 375, 'producto,formacion'), texto: `375 - ${m} - con la bandera, sin formacion` }))], 375, `${DIR6}/formacion/hoja-375.png`)
}

/** Un cuadro de un clip, guardado como png. */
function cuadroDelClip(clip: string, segundo: number, destino: string): string {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(segundo), '-i', clip, '-frames:v', '1', destino])
  return destino
}

/** 3 · la noche quieta, antes y después: el cuadro entero y la esquina de arriba al doble. */
function estrellas(): void {
  const d = `${DIR6}/estrellas`
  const antes = cuadroDelClip(`${d}/noche-quieta-antes.mp4`, 7, `${d}/cuadro-antes.png`)
  const despues = cuadroDelClip(`${d}/noche-quieta-despues.mp4`, 7, `${d}/cuadro-despues.png`)
  grilla([[{ archivo: antes, texto: 'antes (ESCENA 5)' }, { archivo: despues, texto: 'despues' }]], 960, `${d}/hoja-noche.png`)
  const esquina: readonly [number, number, number, number] = [0, 0, 720, 300]
  grilla([[{ archivo: antes, texto: 'antes x2', recorte: esquina }], [{ archivo: despues, texto: 'despues x2', recorte: esquina }]], 1440, `${d}/hoja-noche-x2.png`)
}

/** 6c · con y sin la niebla rasante, en Quiénes somos y en Por qué develOP. */
function rasante(): void {
  const filas = ['quienes-somos', 'por-que-develop'].map((m) => [
    { archivo: cuadro('niebla-rasante', m, 1440, 'producto,formacion'), texto: `${m} - sin` },
    { archivo: cuadro('niebla-rasante', m, 1440, 'producto,formacion,rasante'), texto: `${m} - con 6c` },
  ])
  grilla(filas, 960, `${DIR6}/niebla-rasante/hoja.png`)
}

/** 5 · el piso de hoy y el piso vivo en reposo, en el hero y en el pie (con la mancha de contacto). */
function piso(): void {
  const filas = ['hero', 'pie'].map((m) => [
    { archivo: cuadro('piso-vivo', m, 1440, 'producto'), texto: `${m} - el piso de hoy` },
    { archivo: cuadro('piso-vivo', m, 1440, 'producto,piso'), texto: `${m} - piso vivo en reposo` },
  ])
  grilla(filas, 960, `${DIR6}/piso-vivo/hoja-reposo.png`)
  const mancha: readonly [number, number, number, number] = [560, 580, 720, 260]
  grilla([[{ archivo: cuadro('piso-vivo', 'hero', 1440, 'producto'), texto: 'hero x2 - hoy', recorte: mancha }], [{ archivo: cuadro('piso-vivo', 'hero', 1440, 'producto,piso'), texto: 'hero x2 - piso vivo', recorte: mancha }]], 1440, `${DIR6}/piso-vivo/hoja-mancha-x2.png`)
  // De noche, la mancha dura de 5c (el haz de E1 sobre el logo).
  grilla([[{ archivo: cuadro('piso-vivo', 'trabajos-de-noche', 1440, 'producto'), texto: 'noche - hoy' }, { archivo: cuadro('piso-vivo', 'trabajos-de-noche', 1440, 'producto,piso'), texto: 'noche - piso vivo' }]], 960, `${DIR6}/piso-vivo/hoja-noche.png`)
}

if (process.argv[1]?.endsWith('hojas6.ts')) {
  if (QUE === 'fondos') fondos()
  else if (QUE === 'formacion') formacion()
  else if (QUE === 'estrellas') estrellas()
  else if (QUE === 'rasante') rasante()
  else if (QUE === 'piso') piso()
  else throw new Error(`no sé qué es «${QUE}»`)
}
