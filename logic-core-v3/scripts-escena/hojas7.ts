/**
 * SPRINT ESCENA 7 — las hojas. hojas7.ts <qué>
 *
 * Arma grillas con rótulo (la `grilla` de ESCENA 6) con las capturas que dejan los bancos de este sprint
 * en `escena7/<carpeta>/cuadros/`; el «antes» sale de las entregas de ESCENA 6 donde existe.
 */
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'

import { DIR6, DIR7 } from './banco-escena'
import { rotuloDe } from './comparar'
import { MOMENTOS, grilla, type Celda } from './hojas6'

const QUE = process.argv[2] ?? ''

const cuadro7 = (efecto: string, momento: string, ancho: number, rotulo: string): string => `${DIR7}/${efecto}/cuadros/${momento}-${String(ancho)}-${rotulo}.png`
const cuadro6 = (efecto: string, momento: string, pedido: string): string => `${DIR6}/${efecto}/cuadros/${momento}-1440-${rotuloDe(pedido)}.png`

/** Un cuadro de un clip, guardado como png. */
function cuadroDelClip(clip: string, segundo: number, destino: string): string {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(segundo), '-i', clip, '-frames:v', '1', destino])
  return destino
}

/** T2 · antes (ESCENA 6, sin fallas visibles) y después, los cinco momentos; la franja al doble; 375. */
function formacion(): void {
  const filas = MOMENTOS.map((m) => [
    { archivo: cuadro6('formacion', m, 'producto,formacion,fallas=no'), texto: `${m} - antes (ESCENA 6)` },
    { archivo: cuadro7('formacion', m, 1440, 'producto'), texto: `${m} - despues` },
    { archivo: `${DIR7}/formacion/cuadros/${m}-1440-producto-escena-sin-formacion.png`, texto: `${m} - la escena sin formacion` },
  ])
  grilla(filas, 640, `${DIR7}/formacion/hoja-1440.png`)
  const franja: readonly [number, number, number, number] = [740, 290, 700, 210]
  grilla(
    [
      [{ archivo: cuadro6('formacion', 'quienes-somos', 'producto,formacion,fallas=no'), texto: 'quienes-somos x2 - antes (ESCENA 6)', recorte: franja }],
      [{ archivo: cuadro7('formacion', 'quienes-somos', 1440, 'producto'), texto: 'quienes-somos x2 - despues', recorte: franja }],
    ],
    1440,
    `${DIR7}/formacion/hoja-franja-x2.png`,
  )
  grilla([['hero', 'quienes-somos'].map((m) => ({ archivo: cuadro7('formacion', m, 375, 'producto'), texto: `375 - ${m} - sin formacion` }))], 375, `${DIR7}/formacion/hoja-375.png`)
}

/** T3 · la noche quieta: antes (ESCENA 6, en Trabajos) y después (en Trabajos y mirando el cielo); la esquina al doble. */
function cielo(): void {
  const d = `${DIR7}/cielo`
  const antes = `${DIR6}/estrellas/cuadro-despues.png`
  const trabajos = cuadroDelClip(`${d}/noche-quieta-trabajos.mp4`, 6, `${d}/cuadro-trabajos.png`)
  const numeros = cuadroDelClip(`${d}/noche-quieta-numeros.mp4`, 6, `${d}/cuadro-numeros.png`)
  grilla([[{ archivo: antes, texto: 'antes (ESCENA 6) - trabajos' }, { archivo: trabajos, texto: 'despues - trabajos' }], [{ archivo: numeros, texto: 'despues - numeros (la camara mira el cielo)' }, { archivo: `${d}/sin-formacion-numeros.png`, texto: 'numeros - sin la formacion' }]], 960, `${d}/hoja-noche.png`)
  const esquina: readonly [number, number, number, number] = [0, 0, 720, 300]
  grilla([[{ archivo: antes, texto: 'antes x2 - trabajos', recorte: esquina }], [{ archivo: numeros, texto: 'despues x2 - numeros', recorte: esquina }], [{ archivo: numeros, texto: 'despues x2 - numeros, la trama y la via lactea', recorte: [720, 0, 720, 300] }]], 1440, `${d}/hoja-noche-x2.png`)
}

/** T10 · antes y después, los cinco momentos; y el logo y el polvo al doble en el hero y de noche. */
function nitidez(): void {
  const c = (m: string, cual: string): string => cuadro7('nitidez', m, 1440, cual)
  grilla(MOMENTOS.map((m) => [{ archivo: c(m, 'antes'), texto: `${m} - antes (sin nitidez)` }, { archivo: c(m, 'despues'), texto: `${m} - despues` }]), 960, `${DIR7}/nitidez/hoja-antes-despues.png`)
  const zona: readonly [number, number, number, number] = [560, 160, 720, 420]
  const filas: Celda[][] = ['hero', 'trabajos-de-noche'].flatMap((m) => [[{ archivo: c(m, 'antes'), texto: `${m} x2 - antes`, recorte: zona }], [{ archivo: c(m, 'despues'), texto: `${m} x2 - despues`, recorte: zona }]])
  grilla(filas, 1440, `${DIR7}/nitidez/hoja-x2.png`)
}

/** T5 · la composición: el piso de ESCENA 6 contra el de ahora en reposo, y la mancha de contacto al doble. */
function piso(): void {
  const filas = ['hero', 'pie'].map((m) => [
    { archivo: cuadro6('piso-vivo', m, 'producto,piso'), texto: `${m} - antes (ESCENA 6, piso vivo)` },
    { archivo: cuadro7('piso-vivo', m, 1440, 'producto'), texto: `${m} - despues` },
    { archivo: cuadro7('piso-vivo', m, 1440, 'sin-piso'), texto: `${m} - sin piso vivo` },
  ])
  grilla(filas, 640, `${DIR7}/piso-vivo/hoja-composicion.png`)
  const mancha: readonly [number, number, number, number] = [560, 580, 720, 260]
  grilla(
    [
      [{ archivo: cuadro6('piso-vivo', 'hero', 'producto,piso'), texto: 'hero x2 - antes (ESCENA 6)', recorte: mancha }],
      [{ archivo: cuadro7('piso-vivo', 'hero', 1440, 'producto'), texto: 'hero x2 - despues', recorte: mancha }],
      [{ archivo: cuadro7('piso-vivo', 'hero', 1440, 'sin-piso'), texto: 'hero x2 - sin piso vivo', recorte: mancha }],
    ],
    1440,
    `${DIR7}/piso-vivo/hoja-mancha-x2.png`,
  )
}

/** T8 · con y sin la niebla, en Quiénes somos y en Por qué develOP. */
function niebla(): void {
  const filas = ['hero', 'quienes-somos', 'por-que-develop'].map((m) => [
    { archivo: cuadro7('niebla', m, 1440, 'sin-niebla'), texto: `${m} - sin niebla` },
    { archivo: cuadro7('niebla', m, 1440, 'producto'), texto: `${m} - con la niebla` },
  ])
  grilla(filas, 960, `${DIR7}/niebla/hoja.png`)
}

/** T12 · de noche, el charco del haz con y sin las sombras de las motas y el rebote, al doble. */
function motas(): void {
  const charco: readonly [number, number, number, number] = [230, 400, 720, 440]
  const c = (cual: string): string => cuadro7('motas', 'trabajos-de-noche', 1440, cual)
  grilla([[{ archivo: c('sin-rebote'), texto: 'noche - sin sombras ni rebote' }, { archivo: c('producto'), texto: 'noche - con sombras y rebote' }]], 960, `${DIR7}/motas/hoja-noche.png`)
  grilla([[{ archivo: c('sin-rebote'), texto: 'x2 - sin', recorte: charco }], [{ archivo: c('producto'), texto: 'x2 - con sombras de motas y rebote', recorte: charco }]], 1440, `${DIR7}/motas/hoja-x2.png`)
}

/** T11 · los momentos congelados del amanecer, en orden. */
function amanecer(): void {
  const d = `${DIR7}/amanecer/cuadros`
  const archivos = readdirSync(d).filter((a) => a.endsWith('.png')).sort((a, b) => Number(a.split('-')[0].replace('_', '.')) - Number(b.split('-')[0].replace('_', '.')))
  const celdas = archivos.map((a) => ({ archivo: `${d}/${a}`, texto: `${a.split('-')[0].replace('_', '.')} s -${a.replace(/^[\d_]+-/, '').replace('.png', '').replace(/-/g, ' ')}` }))
  const filas: Celda[][] = []
  for (let i = 0; i < celdas.length; i += 3) filas.push(celdas.slice(i, i + 3))
  grilla(filas, 640, `${DIR7}/amanecer/hoja-momentos.png`)
}

/** T13 · el grano al doble (con y sin), la fugaz clavada a mitad del cruce y las fibras. */
function pruebas(): void {
  const d = `${DIR7}/pruebas/cuadros`
  // Un pedazo de piso liso (se ve el grano) y el borde del logo (se ve si sigue nítido).
  const piso: readonly [number, number, number, number] = [40, 620, 360, 220]
  const borde: readonly [number, number, number, number] = [640, 330, 360, 220]
  grilla(
    [piso, borde].map((zona) => [{ archivo: `${d}/grano-sin.png`, texto: 'x4 - sin grano', recorte: zona }, { archivo: `${d}/grano-con.png`, texto: 'x4 - con grano', recorte: zona }]),
    1440,
    `${DIR7}/pruebas/hoja-grano-x4.png`,
  )
  grilla([[{ archivo: `${d}/fugaz-clavada.png`, texto: 'fugaz clavada a mitad del cruce' }, { archivo: `${d}/fibras.png`, texto: 'fibras - quienes somos' }]], 960, `${DIR7}/pruebas/hoja-fugaz-y-fibras.png`)
}

if (process.argv[1]?.endsWith('hojas7.ts')) {
  if (QUE === 'pruebas') pruebas()
  else if (QUE === 'formacion') formacion()
  else if (QUE === 'cielo') cielo()
  else if (QUE === 'nitidez') nitidez()
  else if (QUE === 'piso') piso()
  else if (QUE === 'niebla') niebla()
  else if (QUE === 'motas') motas()
  else if (QUE === 'amanecer') amanecer()
  else throw new Error(`no sé qué es «${QUE}»`)
}
