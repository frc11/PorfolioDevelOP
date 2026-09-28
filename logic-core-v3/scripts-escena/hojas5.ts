/**
 * SPRINT ESCENA 5 — las hojas. hojas5.ts <formacion|formacion375|densidad|densidad375|sombra|relieve|estrellas>
 *
 * Arma grillas con rótulo a partir de las capturas que dejan `formacion.ts`, `densidad5.ts` y
 * `rapido5.ts` en `escena5/<efecto>/cuadros/`. Una celda puede ir recortada (y agrandada) cuando lo
 * que hay que mirar es chico: la mancha de contacto, las estrellas.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

import { DIR5 } from './banco-escena'
import { rotuloDe } from './comparar'

const QUE = process.argv[2] ?? 'formacion'
const FUENTE = "C\\:/Windows/Fonts/arial.ttf"
const MOMENTOS = ['hero', 'quienes-somos', 'trabajos-de-noche', 'por-que-develop', 'pie']

interface Celda {
  readonly archivo: string
  readonly texto: string
  /** x, y, ancho, alto del recorte, en píxeles de la captura. */
  readonly recorte?: readonly [number, number, number, number]
}

const rotulo = (texto: string): string => `drawtext=fontfile='${FUENTE}':text='${texto}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`

function grilla(celdas: readonly (readonly Celda[])[], anchoDeCelda: number, destino: string): void {
  const planas = celdas.flat()
  for (const c of planas) if (!existsSync(c.archivo)) throw new Error(`falta ${c.archivo}`)
  const entradas = planas.flatMap((c) => ['-i', c.archivo])
  let filtro = ''
  planas.forEach((c, i) => {
    // ffmpeg pide ancho:alto:x:y.
    const corte = c.recorte === undefined ? '' : `crop=${String(c.recorte[2])}:${String(c.recorte[3])}:${String(c.recorte[0])}:${String(c.recorte[1])},`
    filtro += `[${String(i)}]${corte}scale=${String(anchoDeCelda)}:-2:flags=${c.recorte === undefined ? 'bicubic' : 'neighbor'},${rotulo(c.texto)}[c${String(i)}];`
  })
  let k = 0
  const filas: string[] = []
  celdas.forEach((fila, f) => {
    filtro += `${fila.map(() => `[c${String(k++)}]`).join('')}hstack=inputs=${String(fila.length)}[f${String(f)}];`
    filas.push(`[f${String(f)}]`)
  })
  filtro += filas.length === 1 ? `${filas[0]}null` : `${filas.join('')}vstack=inputs=${String(filas.length)}`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', filtro, '-frames:v', '1', '-update', '1', destino])
  console.log(destino)
}

const cuadro = (efecto: string, momento: string, ancho: number, pedido: string): string => `${DIR5}/${efecto}/cuadros/${momento}-${String(ancho)}-${rotuloDe(pedido)}.png`

function formacion(): void {
  const variantes = [
    ['sin formacion', 'producto'],
    ['con formacion', 'producto,formacion'],
  ] as const
  grilla(MOMENTOS.map((m) => variantes.map(([t, p]) => ({ archivo: cuadro('formacion', m, 1440, p), texto: `${t} - ${m}` }))), 720, `${DIR5}/formacion/hoja-1440.png`)
}

function formacion375(): void {
  const variantes = [
    ['ninguna (propuesta)', 'producto,formacion'],
    ['menos - dos filas', 'producto,formacion,movil=menos'],
  ] as const
  grilla(variantes.map(([t, p]) => MOMENTOS.map((m) => ({ archivo: cuadro('formacion', m, 375, p), texto: t }))), 375, `${DIR5}/formacion/hoja-375.png`)
}

function densidad(): void {
  const variantes = ['antes', 'despues'] as const
  grilla(MOMENTOS.map((m) => variantes.map((v) => ({ archivo: `${DIR5}/densidad/cuadros/${m}-1440-${v}.png`, texto: `${v === 'antes' ? 'antes' : 'ahora'} - ${m}` }))), 720, `${DIR5}/densidad/hoja-1440.png`)
}

function densidad375(): void {
  const variantes = ['antes', 'despues'] as const
  grilla(variantes.map((v) => MOMENTOS.map((m) => ({ archivo: `${DIR5}/densidad/cuadros/${m}-375-${v}.png`, texto: v === 'antes' ? 'antes' : 'ahora' }))), 375, `${DIR5}/densidad/hoja-375.png`)
}

function sombra(): void {
  const recortes: Record<string, readonly [number, number, number, number]> = {
    hero: [620, 620, 700, 240],
    'trabajos-de-noche': [200, 600, 700, 240],
  }
  const variantes = [
    ['sin', 'producto'],
    ['con 5c', 'producto,sombra=haz'],
  ] as const
  grilla(
    ['hero', 'trabajos-de-noche'].map((m) => variantes.map(([t, p]) => ({ archivo: cuadro('sombra-haz', m, 1440, p), texto: `${m === 'hero' ? 'dia' : 'noche'} ${t}`, recorte: recortes[m] }))),
    760,
    `${DIR5}/sombra-haz/hoja-dia-y-noche.png`,
  )
}

function relieve(): void {
  const variantes = [
    ['el de hoy', 'producto,formacion'],
    ['R1 paredes', 'producto,formacion,R1'],
    ['R2 piso', 'producto,formacion,R2'],
  ] as const
  grilla(['hero', 'quienes-somos', 'por-que-develop'].map((m) => variantes.map(([t, p]) => ({ archivo: cuadro('relieve', m, 1440, p), texto: `${t} - ${m}` }))), 640, `${DIR5}/relieve/hoja-quieto.png`)
}

function estrellas(): void {
  const variantes = [
    ['sin estrellas', 'producto,formacion'],
    ['con estrellas', 'producto,formacion,estrellas'],
  ] as const
  grilla([variantes.map(([t, p]) => ({ archivo: cuadro('estrellas', 'trabajos-de-noche', 1440, p), texto: `${t} (x2)`, recorte: [0, 60, 720, 300] as const }))], 1440, `${DIR5}/estrellas/hoja-noche-x2.png`)
}

const HOJAS: Record<string, () => void> = { formacion, formacion375, densidad, densidad375, sombra, relieve, estrellas }
const hoja = HOJAS[QUE]
if (hoja === undefined) throw new Error(`no sé qué es «${QUE}»`)
hoja()
