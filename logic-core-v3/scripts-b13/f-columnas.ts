/**
 * F · LAS DOCE COLUMNAS, ANTES Y DESPUÉS — cuánta zona libre dejó §2.
 *
 *     npx tsx scripts-b13/f-columnas.ts
 *     npx tsx scripts-b13/f-columnas.ts --aspecto=1.1389
 *
 * ── Qué contesta, y por qué es la pregunta de §2 ─────────────────────────
 *
 * B11 acotó la composición de Números y de Quiénes somos midiendo **qué
 * columnas de la grilla tapaba el logo alguna vez a lo largo del tramo**: de la
 * 1 a la 6 estaban tapadas el 100 % de las paradas y de la 7 a la 12 quedaban
 * libres, así que la composición entera se mudó a la mitad derecha y perdió
 * amplitud —1.220 px a 594 a 1440—. §2 pide re-medir eso: **si el logo se
 * achica, la zona libre cambia**.
 *
 * Acá se barre la ventana de cada sección con la silueta del modelo
 * (`muestrearLogo`, la máscara real del SVG) y se publica, columna por columna,
 * qué fracción de las paradas la vio tapada — **con las distancias de hoy y con
 * las de antes de B13**, para que la diferencia sea del sprint y no de la vara.
 *
 * ⚠️ **Es la escena, no la página.** Dónde cae la grilla en píxeles lo decide el
 * layout; acá la columna es una banda vertical de 1/12 del cuadro, que es la
 * aproximación que B11 usó para el mapa y la que hace comparable a los tres
 * anchos. Lo que se publica es dónde está el obstáculo, no dónde está el texto.
 */

import { MAPEO_DE_LAS_SECCIONES, pantallaDeProgreso } from '../src/app/v3/_lib/escena/recorrido'
import { ANCLAJE } from '../src/app/v3/_lib/escena/anclaje'
import { MARGEN_DE_REANUDACION } from '../src/app/v3/_lib/escena/visibilidad'
import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { makeTrack } from '../src/app/probe-escena/__tests__/harness'

import { argumento, escribirJson, red } from './b13-comun'

const COLUMNAS = 12
const PASO = 1 / 128

/** Las distancias de antes de B13, para que el ANTES salga del mismo instrumento. */
const ANTES_DE_B13: Readonly<Record<string, number>> = { 'quiénes somos': 11.5, demos: 9 }
const PISTA_DE_ANTES = makeTrack(
  CHOREO_KEYFRAMES.map((k) =>
    ANTES_DE_B13[k.name] === undefined ? k : { ...k, pose: { ...k.pose, distance: ANTES_DE_B13[k.name] } },
  ),
)

function dibujaEn(progreso: number): boolean {
  const pantalla = pantallaDeProgreso(progreso)
  return ANCLAJE.ventanasDeLaEscena.some(
    ([desde, hasta]) => pantalla >= desde - MARGEN_DE_REANUDACION && pantalla <= hasta + MARGEN_DE_REANUDACION,
  )
}

/** Qué fracción de las paradas de la ventana vio tapada cada columna. */
function ocupacion(desde: number, hasta: number, aspecto: number, antes: boolean): readonly number[] {
  const vistas = new Array<number>(COLUMNAS).fill(0)
  let paradas = 0
  for (let p = desde; p <= hasta + 1e-9; p += PASO) {
    const progreso = Math.min(1, red(p, 6))
    if (!dibujaEn(progreso)) continue
    paradas += 1
    const m = antes
      ? muestrearLogo(progreso, aspecto, ESCENA_REAL, 220, 160, 1, PISTA_DE_ANTES)
      : muestrearLogo(progreso, aspecto, ESCENA_REAL, 220, 160, 1)
    const tocada = new Array<boolean>(COLUMNAS).fill(false)
    for (let i = 0; i < m.celdasDeLogo; i += 1) {
      const x = m.x[i]
      if (Math.abs(x) > 1) continue
      const c = Math.min(COLUMNAS - 1, Math.max(0, Math.floor(((x + 1) / 2) * COLUMNAS)))
      tocada[c] = true
    }
    for (let c = 0; c < COLUMNAS; c += 1) if (tocada[c]) vistas[c] += 1
  }
  return vistas.map((v) => (paradas === 0 ? 0 : red((100 * v) / paradas, 0)))
}

function principal(): void {
  const aspecto = Number(argumento('aspecto', String(16 / 9)))
  console.log(`cuadro: aspecto ${aspecto.toFixed(4)} · ${COLUMNAS} columnas · paso ${PASO}`)
  console.log('  sección            cuándo    c1  c2  c3  c4  c5  c6  c7  c8  c9 c10 c11 c12   libres (0 %)')
  const filas: unknown[] = []
  for (const t of MAPEO_DE_LAS_SECCIONES.filter((x) => x.dejaVerLaEscena)) {
    for (const antes of [true, false]) {
      const o = ocupacion(t.seVeDesde, t.seVeHasta, aspecto, antes)
      const libres = o.map((v, i) => (v === 0 ? i + 1 : 0)).filter((c) => c > 0)
      filas.push({ seccion: t.id, cuando: antes ? 'antes' : 'despues', ocupacionPct: o, columnasLibres: libres })
      console.log(
        `  ${t.id.padEnd(17)} ${(antes ? 'ANTES' : 'DESPUÉS').padEnd(8)} ` +
          o.map((v) => String(v).padStart(3)).join(' ') +
          `   ${libres.length === 0 ? 'ninguna' : libres.join(',')}`,
      )
    }
  }
  console.log(`\nescrito: ${escribirJson(`columnas-${aspecto.toFixed(4)}`, { aspecto, columnas: COLUMNAS, paso: PASO, antesDeB13: ANTES_DE_B13, filas })}`)
}

principal()
