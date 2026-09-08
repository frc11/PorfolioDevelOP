/**
 * B7 · FRENTE C — EL MAPA DEL FONDO, para poder ELEGIR palanca.
 *
 *     npx tsx scripts-b7/c-mapa.ts [antes|despues]
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * `c-contraste.ts` dice CUÁNTO da el contraste bajo el glifo. No dice si el
 * problema es del texto o de DÓNDE está parado, y esa es justamente la pregunta
 * que separa las cuatro palancas que la instrucción enumera: el tamaño y el
 * color son propiedades del texto; «dónde cae respecto de la escena» y «su ancho
 * de columna» son propiedades de la posición.
 *
 * Así que este archivo **no mide texto**: lee la captura del FONDO que
 * `c-contraste.ts` ya dejó en `os.tmpdir()` y calcula, celda por celda, qué
 * contraste daría la tinta real sobre ese fondo. Si hay una banda del cuadro
 * donde la tinta pasa AA con margen, existe palanca de posición. Si no hay
 * ninguna, no existe, y decirlo con el mapa es más honesto que probar y ver.
 *
 * ⚠️ **No abre el navegador y no vuelve a medir.** Reusa el PNG de la corrida
 * anterior a propósito: dos fondos capturados en dos instantes distintos de una
 * escena que se mueve no son el mismo fondo, y el mapa dejaría de explicar las
 * cifras de la tabla que acompaña.
 *
 * ⚠️ **Es un mapa del FONDO, no del texto.** No dice que ahí se lea: dice qué
 * daría la tinta si hubiera un glifo. La afirmación sobre el texto la sigue
 * haciendo `c-contraste.ts`, con su piso de píxeles de glifo.
 */

import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { AA_TEXTO_NORMAL, contraste, luminancia } from '../scripts-b4/color'
import { decodificarPng } from '../scripts-b4/png'

import { dos, guardarJson } from './b7-comun'

const TEMP = path.join(tmpdir(), 'b7-c-contraste')

/** La tinta REAL, leída del DOM por `c-contraste.ts`. No es un token. */
const TINTA: readonly [number, number, number] = [17, 17, 17]

const CELDA_X = 60
const CELDA_Y = 30

interface Celda {
  readonly x: number
  readonly y: number
  readonly mediana: number
  readonly p10: number
}

function mapaDe(ruta: string): { ancho: number; alto: number; celdas: Celda[] } {
  const img = decodificarPng(readFileSync(ruta))
  const lumTinta = luminancia(TINTA[0], TINTA[1], TINTA[2])
  const celdas: Celda[] = []
  for (let y = 0; y + CELDA_Y <= img.alto; y += CELDA_Y) {
    for (let x = 0; x + CELDA_X <= img.ancho; x += CELDA_X) {
      const razones: number[] = []
      for (let j = y; j < y + CELDA_Y; j += 1) {
        for (let i = x; i < x + CELDA_X; i += 1) {
          const k = (j * img.ancho + i) * 4
          razones.push(contraste(lumTinta, luminancia(img.datos[k], img.datos[k + 1], img.datos[k + 2])))
        }
      }
      razones.sort((a, b) => a - b)
      celdas.push({
        x,
        y,
        mediana: dos(razones[Math.floor(razones.length / 2)]),
        p10: dos(razones[Math.floor(razones.length * 0.1)]),
      })
    }
  }
  return { ancho: img.ancho, alto: img.alto, celdas }
}

function dibujar(m: { ancho: number; alto: number; celdas: Celda[] }): string {
  const filas: string[] = []
  const columnas = Math.floor(m.ancho / CELDA_X)
  const encabezado = Array.from({ length: columnas }, (_, i) => String(i * CELDA_X).padStart(4)).join('')
  filas.push(`   y \\ x${encabezado}`)
  for (let f = 0; f * CELDA_Y + CELDA_Y <= m.alto; f += 1) {
    const y = f * CELDA_Y
    const cuerpo = m.celdas
      .filter((c) => c.y === y)
      .map((c) => {
        // El símbolo dice de qué lado de AA cae el DÉCIMO percentil de la celda:
        // la mediana sola escondería una celda mitad clara mitad logo.
        const s = c.p10 >= AA_TEXTO_NORMAL * 1.35 ? '##' : c.p10 >= AA_TEXTO_NORMAL ? '++' : c.p10 >= 3 ? '..' : '  '
        return `${s}${String(Math.round(c.p10)).padStart(2)}`
      })
      .join('')
    filas.push(`${String(y).padStart(6)}${cuerpo}`)
  }
  return filas.join('\n')
}

/**
 * LAS BANDAS LIMPIAS de una columna, DERIVADAS del mapa: los tramos de `y`
 * seguidos en los que **todas** las celdas de esa franja de `x` tienen su
 * décimo percentil en AA o mejor. Es la respuesta ejecutable a «¿existe palanca
 * de posición?»: si la banda más alta no llega al alto del bloque, no existe.
 *
 * ⚠️ Se pide a TODAS las celdas de la fila, no a su promedio: una fila con una
 * celda en 1,1:1 tiene una columna de texto ilegible adentro, y promediarla la
 * escondería.
 */
function bandasLimpias(
  m: { celdas: Celda[] },
  desdeX: number,
  hastaX: number,
): { desdeY: number; hastaY: number; alto: number }[] {
  const ys = [...new Set(m.celdas.map((c) => c.y))].sort((a, b) => a - b)
  const limpia = (y: number): boolean => {
    const fila = m.celdas.filter((c) => c.y === y && c.x + CELDA_X > desdeX && c.x < hastaX)
    return fila.length > 0 && fila.every((c) => c.p10 >= AA_TEXTO_NORMAL)
  }
  const bandas: { desdeY: number; hastaY: number; alto: number }[] = []
  let inicio: number | null = null
  for (const y of ys) {
    if (limpia(y)) {
      if (inicio === null) inicio = y
    } else if (inicio !== null) {
      bandas.push({ desdeY: inicio, hastaY: y, alto: y - inicio })
      inicio = null
    }
  }
  if (inicio !== null) {
    const fin = ys[ys.length - 1] + CELDA_Y
    bandas.push({ desdeY: inicio, hastaY: fin, alto: fin - inicio })
  }
  return bandas
}

/** La columna de las tarjetas, leída de la tabla de contraste. */
const COLUMNAS_DE_TARJETAS: Readonly<Record<string, { desde: number; hasta: number }>> = {
  'diferencial-cuerpo-1440': { desde: 32, hasta: 478 },
  'diferencial-cuerpo-1920': { desde: 77, hasta: 591 },
}

function principal(): void {
  const sufijo = process.argv[2] ?? ''
  const casos = ['diferencial-cuerpo-1440', 'diferencial-cuerpo-1920']
  const salida: Record<string, unknown> = {}
  for (const caso of casos) {
    const ruta = path.join(TEMP, `${caso}-A.png`)
    const m = mapaDe(ruta)
    const col = COLUMNAS_DE_TARJETAS[caso]
    const bandas = bandasLimpias(m, col.desde, col.hasta)
    salida[caso] = { ...m, columnaDeTarjetas: col, bandasLimpias: bandas }
    console.log(`\n=== ${caso} — el FONDO, contraste que daría la tinta ${TINTA.join(',')}`)
    console.log('    ## p10 ≥ 6,08 · ++ p10 ≥ 4,5 (AA) · .. p10 ≥ 3 · (vacío) p10 < 3')
    console.log(dibujar(m))
    console.log(
      `  bandas con TODA la columna de tarjetas (x ${col.desde}..${col.hasta}) en AA o mejor: ` +
        (bandas.length === 0
          ? 'ninguna'
          : bandas.map((b) => `y ${b.desdeY}..${b.hastaY} (${b.alto} px)`).join(' · ')),
    )
  }
  console.log(`\n→ ${guardarJson(sufijo === '' ? 'c-mapa' : `c-mapa-${sufijo}`, salida)}`)
}

principal()
