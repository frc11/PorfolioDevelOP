/**
 * H · LA AMPLITUD DE NÚMEROS — ¿cuánta de la que B11 sacrificó se puede recuperar?
 *
 *     npx tsx scripts-b13/h-amplitud.ts
 *     npx tsx scripts-b13/h-amplitud.ts --seccion=numeros --perfil=1440
 *
 * ── La pregunta, que es literal de §2 de la instrucción ───────────────────
 *
 * *«Mueve el acomodamiento de B11. El texto se acotó midiendo dónde caía el
 * logo: si el logo se achica, la zona libre cambia. Re-medí las seis secciones y
 * reportá cuáles quedaron con margen de sobra.»* Y §3: *«Si el logo se achica en
 * §2, esa amplitud se puede recuperar: medilo.»*
 *
 * B11 midió las DOCE COLUMNAS REALES de la grilla —no bandas del cuadro— y
 * publicó, para Números a 1440: *«las columnas 1–5 están tapadas en las cuatro
 * pantallas, la 6 a medias, y de la 7 a la 12 queda libre»*, y de ahí salió
 * `GEOMETRIA.primeraColumnaLibre = 7` y el sacrificio de amplitud **de 1.220 a
 * 594 px**. Acá se corre la MISMA pregunta sobre las MISMAS columnas, con las
 * poses de antes y de después de B13.
 *
 * ── De dónde salen las columnas ───────────────────────────────────────────
 *
 * De `outputs/b11/grillas.json`, que es la medición que B11 hizo en el navegador
 * sobre la grilla renderizada. **No se re-mide el layout**: el layout no cambió
 * en este bloque, y usar la misma tabla es lo que hace comparables las dos
 * corridas. Lo que cambió —y lo único que se recalcula— es dónde cae el logo.
 *
 * ⚠ **La silueta sale del modelo** (`muestrearLogo`, la máscara real del SVG
 * sobre la cámara del recorrido), no de una captura: la pregunta es de la
 * ESCENA, el paso fino (1/128 de recorrido) sería carísimo en el navegador, y el
 * modelo ya está cruzado contra la captura en `escena-*.json` con menos de medio
 * punto de diferencia en la fracción de cuadro.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { ANCLAJE } from '../src/app/v3/_lib/escena/anclaje'
import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { MAPEO_DE_LAS_SECCIONES, pantallaDeProgreso } from '../src/app/v3/_lib/escena/recorrido'
import { MARGEN_DE_REANUDACION } from '../src/app/v3/_lib/escena/visibilidad'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { makeTrack } from '../src/app/probe-escena/__tests__/harness'

import { argumento, escribirJson, red } from './b13-comun'

const PASO = 1 / 128

/** Las distancias de antes de B13. El ANTES sale del mismo instrumento. */
const ANTES_DE_B13: Readonly<Record<string, number>> = { 'quiénes somos': 11.5, demos: 9 }
const PISTA_DE_ANTES = makeTrack(
  CHOREO_KEYFRAMES.map((k) =>
    ANTES_DE_B13[k.name] === undefined ? k : { ...k, pose: { ...k.pose, distance: ANTES_DE_B13[k.name] } },
  ),
)

interface Borde {
  readonly desde: number
  readonly hasta: number
}
interface GrillaMedida {
  readonly nombre: string
  readonly pantalla: string
  readonly columnas: number
  readonly x: number
  readonly ancho: number
  readonly bordes: readonly Borde[]
}

function grillaDeDoce(seccion: string, perfil: string): GrillaMedida {
  const crudo = JSON.parse(
    readFileSync(path.join(process.cwd(), 'docs/rediseno/outputs/b11/grillas.json'), 'utf8'),
  ) as { perfiles: Record<string, { secciones: Record<string, { grillas: GrillaMedida[] }> }> }
  const grillas = crudo.perfiles[perfil]?.secciones[seccion]?.grillas ?? []
  const doce = grillas.find((g) => g.columnas === 12)
  if (doce === undefined) throw new Error(`no hay grilla de 12 columnas para «${seccion}» a ${perfil}`)
  return doce
}

function dibujaEn(progreso: number): boolean {
  const pantalla = pantallaDeProgreso(progreso)
  return ANCLAJE.ventanasDeLaEscena.some(
    ([desde, hasta]) => pantalla >= desde - MARGEN_DE_REANUDACION && pantalla <= hasta + MARGEN_DE_REANUDACION,
  )
}

/** Qué fracción de las paradas vio tapada cada columna REAL de la grilla. */
function ocupacion(
  tramo: { readonly seVeDesde: number; readonly seVeHasta: number },
  grilla: GrillaMedida,
  anchoDeVentana: number,
  aspecto: number,
  antes: boolean,
): { readonly porColumna: readonly number[]; readonly paradas: number } {
  const vistas = new Array<number>(grilla.columnas).fill(0)
  let paradas = 0
  for (let p = tramo.seVeDesde; p <= tramo.seVeHasta + 1e-9; p += PASO) {
    const progreso = Math.min(1, red(p, 6))
    if (!dibujaEn(progreso)) continue
    paradas += 1
    const m = antes
      ? muestrearLogo(progreso, aspecto, ESCENA_REAL, 260, 180, 1, PISTA_DE_ANTES)
      : muestrearLogo(progreso, aspecto, ESCENA_REAL, 260, 180, 1)
    const tocada = new Array<boolean>(grilla.columnas).fill(false)
    for (let i = 0; i < m.celdasDeLogo; i += 1) {
      const cx = m.x[i]
      if (Math.abs(cx) > 1) continue
      const px = ((cx + 1) / 2) * anchoDeVentana
      for (let c = 0; c < grilla.columnas; c += 1) {
        const b = grilla.bordes[c]
        if (px >= b.desde && px <= b.hasta) tocada[c] = true
      }
    }
    for (let c = 0; c < grilla.columnas; c += 1) if (tocada[c]) vistas[c] += 1
  }
  return { porColumna: vistas.map((v) => (paradas === 0 ? 0 : red((100 * v) / paradas, 0))), paradas }
}

function principal(): void {
  const seccion = argumento('seccion', 'numeros')
  const perfil = argumento('perfil', '1440')
  const grilla = grillaDeDoce(seccion, perfil)
  const tramo = MAPEO_DE_LAS_SECCIONES.find((t) => t.id === seccion)
  if (tramo === undefined) throw new Error(`no hay tramo para «${seccion}»`)
  const anchoDeVentana = Number(perfil)
  const alto = perfil === '1440' ? 900 : 1080
  const aspecto = anchoDeVentana / alto

  console.log(
    `${seccion} a ${perfil}×${alto} (aspecto ${aspecto.toFixed(4)}) · ventana p=${tramo.seVeDesde.toFixed(4)}–${tramo.seVeHasta.toFixed(4)}\n` +
      `grilla de ${grilla.columnas} columnas: x ${grilla.x} … ${grilla.x + grilla.ancho} (${grilla.ancho} px), la de B11`,
  )
  console.log('  cuándo     ' + grilla.bordes.map((_, i) => `c${i + 1}`.padStart(4)).join('') + '   primera libre   amplitud desde ahí')
  const filas: unknown[] = []
  for (const antes of [true, false]) {
    const o = ocupacion(tramo, grilla, anchoDeVentana, aspecto, antes)
    // La primera columna desde la cual TODAS las siguientes están libres al 0 %.
    let primera = grilla.columnas + 1
    for (let c = grilla.columnas - 1; c >= 0; c -= 1) {
      if (o.porColumna[c] === 0) primera = c + 1
      else break
    }
    const amplitud =
      primera > grilla.columnas ? 0 : red(grilla.bordes[grilla.columnas - 1].hasta - grilla.bordes[primera - 1].desde, 1)
    filas.push({ cuando: antes ? 'antes' : 'despues', paradas: o.paradas, porColumna: o.porColumna, primeraColumnaLibre: primera, amplitudPx: amplitud })
    console.log(
      `  ${(antes ? 'ANTES' : 'DESPUÉS').padEnd(9)} ` +
        o.porColumna.map((v) => String(v).padStart(4)).join('') +
        `        c${primera}          ${amplitud} px de ${grilla.ancho}`,
    )
  }
  console.log(`\nescrito: ${escribirJson(`amplitud-${seccion}-${perfil}`, { seccion, perfil, aspecto, grilla, paso: PASO, antesDeB13: ANTES_DE_B13, filas })}`)
}

principal()
