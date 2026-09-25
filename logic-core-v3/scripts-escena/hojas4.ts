/**
 * SPRINT ESCENA 4 — las hojas de la formación. hojas4.ts <lecturas|densidad> <ancho> [lectura]
 *
 *   · `lecturas` — los cinco momentos en filas; sin formación, L1 y L2 en columnas. A 375 van
 *     traspuestas (los momentos en columnas), porque el cuadro es alto.
 *   · `densidad` — cuatro momentos en filas; menos, base y más en columnas, sobre una lectura.
 *
 * Toma las capturas que deja `formacion.ts` en `escena4/formacion/cuadros/`.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

import { rotuloDe } from './comparar'
import { DIR4 } from './formacion'

const [QUE, ANCHO, LECTURA] = [process.argv[2] ?? 'lecturas', Number(process.argv[3] ?? 1440), process.argv[4] ?? 'L1']
const DIR = `${DIR4}/formacion/cuadros`
const FUENTE = "C\\:/Windows/Fonts/arial.ttf"
const MOMENTOS = ['hero', 'quienes-somos', 'trabajos-de-noche', 'por-que-develop', 'pie']

const rotulo = (texto: string): string => `drawtext=fontfile='${FUENTE}':text='${texto}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`

/** Una grilla de capturas con rótulo, fila por fila. */
function grilla(celdas: readonly (readonly { archivo: string; texto: string }[])[], anchoDeCelda: number, destino: string): void {
  const planas = celdas.flat()
  for (const c of planas) if (!existsSync(c.archivo)) throw new Error(`falta ${c.archivo}`)
  const entradas = planas.flatMap((c) => ['-i', c.archivo])
  let filtro = ''
  planas.forEach((c, i) => {
    filtro += `[${String(i)}]scale=${String(anchoDeCelda)}:-2,${rotulo(c.texto)}[c${String(i)}];`
  })
  let k = 0
  const filas: string[] = []
  celdas.forEach((fila, f) => {
    const nombres = fila.map(() => `[c${String(k++)}]`).join('')
    filtro += `${nombres}hstack=inputs=${String(fila.length)}[f${String(f)}];`
    filas.push(`[f${String(f)}]`)
  })
  filtro += `${filas.join('')}vstack=inputs=${String(filas.length)}`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', filtro, '-frames:v', '1', '-update', '1', destino])
  console.log(destino)
}

const archivo = (momento: string, pedido: string): string => `${DIR}/${momento}-${String(ANCHO)}-${rotuloDe(pedido)}.png`

function lecturas(): void {
  const variantes = [
    ['sin formación', 'E1,E4,E6,E7'],
    ['L1 · plataforma', 'E1,E4,E6,E7,L1'],
    ['L2 · el piso cae', 'E1,E4,E6,E7,L2'],
  ] as const
  if (ANCHO >= 1000) {
    grilla(MOMENTOS.map((m) => variantes.map(([t, p]) => ({ archivo: archivo(m, p), texto: `${t} - ${m}` }))), 640, `${DIR4}/formacion/hoja-L1-L2-${String(ANCHO)}.png`)
    return
  }
  // En el teléfono la propuesta es sin formación; la versión con menos copias va con `movil=menos`.
  const angosto = [
    ['ninguna (propuesta)', 'E1,E4,E6,E7'],
    ['L1 menos copias', 'E1,E4,E6,E7,L1,movil=menos'],
    ['L2 menos copias', 'E1,E4,E6,E7,L2,movil=menos'],
  ] as const
  grilla(angosto.map(([t, p]) => MOMENTOS.map((m) => ({ archivo: archivo(m, p), texto: `${t}` }))), ANCHO, `${DIR4}/formacion/hoja-375-${String(ANCHO)}.png`)
}

function densidad(): void {
  const base = `E1,E4,E6,E7,${LECTURA}`
  const variantes = [
    ['menos', `${base},densidad=menos`],
    ['base', base],
    ['mas', `${base},densidad=mas`],
  ] as const
  const momentos = ['hero', 'quienes-somos', 'trabajos-de-noche', 'pie']
  grilla(momentos.map((m) => variantes.map(([t, p]) => ({ archivo: archivo(m, p), texto: `${LECTURA} ${t} - ${m}` }))), 640, `${DIR4}/formacion/hoja-densidad-${LECTURA}-${String(ANCHO)}.png`)
}

if (QUE === 'lecturas') lecturas()
else if (QUE === 'densidad') densidad()
else throw new Error(`no sé qué es «${QUE}»`)
