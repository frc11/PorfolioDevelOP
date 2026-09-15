/**
 * VERTICAL-1 · A — ¿ENTRA EL LOGO EN EL CUADRO A 390×844? La pregunta que
 * decide si el sprint es posible con `frameX` sola.
 *
 *     npx tsx scripts-vertical/a-geometria.ts
 *
 * ── Por qué esto va PRIMERO, antes de elegir un solo valor ────────────────
 *
 * El criterio (a) del sprint es *«el logo ENTERO adentro del cuadro — 100 %, no
 * 89»*, y `frameX` **traslada**: no achica. Así que hay una pregunta previa que,
 * si se contesta mal, invalida todo lo que venga después: **¿el logo proyectado
 * CABE en el cuadro a este aspecto?**
 *
 * Si su caja es más ancha que el cuadro, ningún `frameX` la mete entera, y
 * elegir valores «que mejoran» sería componer sobre una premisa falsa.
 *
 * ── Las tres cosas que mide, y qué significa cada una ─────────────────────
 *
 *   1. **La geometría del recorrido** — `halfWidth` contra `LOGO_W/2` y el
 *      **aspecto de recorrido nulo** de cada keyframe, que es el aspecto al que
 *      los dos se igualan. Debajo de ese aspecto la caja DECLARADA del logo es
 *      más ancha que el cuadro y `travelX` empieza a crecer otra vez (la rama
 *      que `abs` habilitó en SITIO-S11). Es aritmética de `encuadre.ts`, no una
 *      copia.
 *   2. **La caja REAL de la tinta**, muestreada con campo ×2,6. No es lo mismo
 *      que (1): el recorrido usa la caja del logo QUIETO por decisión declarada
 *      de `cameraFraming.ts`, y la tinta proyectada en un azimut dado puede ser
 *      más angosta. Lo que decide si entra es ésta.
 *   3. **El barrido de `frameX`** en 81 valores, con la fracción que entra en
 *      cada uno: el máximo alcanzable y dónde está. Si el máximo es < 100 %, el
 *      criterio (a) es inalcanzable y eso es un HALLAZGO, no un fracaso.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { recorridoDeEncuadre } from '../src/app/v3/_lib/escena/encuadre'
import { CAMERA_FOV, FRAME_TRAVEL_SAFETY, ORBIT_TARGET_Y } from '../src/app/v3/_lib/escena/probeScene'
import { LOGO_W, TAN_HALF_V } from '@/app/probe-escena/__tests__/harness'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, cajaDelLogo, cobertura, fraccionDentro } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import {
  ASPECTO,
  FACTOR,
  MALLA_BARRIDO,
  MALLA_FINA,
  PISTA_DE_HOY,
  RAIZ_DE_SALIDAS,
  VENTANA,
  cuatro,
  pistaCon,
} from './vertical-comun'

/** Los 81 valores del barrido: de −2 a +2 en pasos de 0,05. */
const BARRIDO = Array.from({ length: 81 }, (_, i) => -2 + i * 0.05)

interface Medida {
  readonly frameX: number
  readonly dentro: number
  readonly cobertura: number
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
  readonly centroX: number
}

function medir(nombre: string, progreso: number, frameX: number, malla: { columnas: number; filas: number }): Medida | null {
  const pista = pistaCon({ [nombre]: frameX })
  const m = muestrearLogo(progreso, ASPECTO, ESCENA_REAL, malla.columnas, malla.filas, FACTOR, pista)
  const c = cajaDelLogo(m)
  if (c === null) return null
  return {
    frameX,
    dentro: fraccionDentro(m),
    cobertura: cobertura(m),
    x0: c.x0,
    x1: c.x1,
    y0: c.y0,
    y1: c.y1,
    centroX: (c.x0 + c.x1) / 2,
  }
}

function main(): void {
  console.log(`\n  VENTANA ${VENTANA.ancho}×${VENTANA.alto} — aspecto ${ASPECTO.toFixed(6)} · campo ×${FACTOR} · escena REAL`)
  console.log(`  LOGO_W (la caja declarada del logo quieto) = ${LOGO_W.toFixed(6)} · FRAME_TRAVEL_SAFETY = ${FRAME_TRAVEL_SAFETY}\n`)

  // ── 1 · la geometría del recorrido ────────────────────────────────────────
  console.log('  1 · LA GEOMETRÍA DEL RECORRIDO — ¿el cuadro es más ancho que la caja declarada?\n')
  console.log('   #  keyframe            dist  altura   ojo    medioAncho   LOGO_W/2   travelX   aspecto de recorrido nulo')
  console.log('   ───────────────────────────────────────────────────────────────────────────────────────────────────────')
  const geometria = CHOREO_KEYFRAMES.map((k, i) => {
    const ojo = Math.hypot(k.pose.distance, k.pose.height - ORBIT_TARGET_Y)
    const medioAlto = TAN_HALF_V * ojo
    const medioAncho = medioAlto * ASPECTO
    const travelX = recorridoDeEncuadre(medioAncho, LOGO_W)
    // El aspecto al que medioAncho == LOGO_W/2, o sea recorrido cero.
    const aspectoNulo = LOGO_W / 2 / medioAlto
    console.log(
      `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.pose.distance.toFixed(1).padStart(5)} ${k.pose.height.toFixed(1).padStart(6)}  ${ojo.toFixed(2).padStart(6)}   ${medioAncho.toFixed(4).padStart(8)}   ${(LOGO_W / 2).toFixed(4).padStart(8)}   ${travelX.toFixed(4).padStart(7)}   ${aspectoNulo.toFixed(6).padStart(9)}  ${ASPECTO < aspectoNulo ? '← el cuadro es MÁS ANGOSTO que la caja' : ''}`,
    )
    return { nombre: k.name, progreso: k.at, frameX: k.pose.frameX, ojo, medioAlto, medioAncho, travelX, aspectoNulo, cuadroMasAngosto: ASPECTO < aspectoNulo }
  })

  // ── 2 · la caja real de la tinta, con el frameX de HOY ───────────────────
  console.log('\n  2 · LA CAJA REAL DE LA TINTA, con el `frameX` de HOY (malla fina)\n')
  console.log('   #  keyframe            frameX    x0       x1      ancho    ¿cabe?     y0       y1      alto     ¿cabe?   dentro')
  console.log('   ────────────────────────────────────────────────────────────────────────────────────────────────────────────────')
  const hoy = CHOREO_KEYFRAMES.map((k, i) => {
    const m = muestrearLogo(k.at, ASPECTO, ESCENA_REAL, MALLA_FINA.columnas, MALLA_FINA.filas, FACTOR, PISTA_DE_HOY)
    const c = cajaDelLogo(m)
    if (c === null) throw new Error(`sin tinta en ${k.name}`)
    const ancho = c.x1 - c.x0
    const alto = c.y1 - c.y0
    /**
     * ⚠️ **EL CUADRO ES 2×2 EN ESTA UNIDAD, Y ESTE SCRIPT LO ESCRIBIÓ MAL UNA
     * VEZ.** La primera versión comparaba el alto contra `2 / aspecto` = 4,328,
     * creyendo que el muestreo estaba en NDC de ANCHO. No lo está:
     * `s10-logo.ts:174-177` normaliza `cy` contra el medio FOV VERTICAL y `cx`
     * contra el horizontal, así que **las dos van de −1 a +1 sobre el cuadro** y
     * el criterio de `enCuadro` es `|cx| ≤ 1 && |cy| ≤ 1`. Con la referencia
     * equivocada el logo parecía ocupar el 16 % del alto cuando ocupa el 35 %.
     */
    const altoDelCuadro = 2
    console.log(
      `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.pose.frameX.toFixed(2).padStart(6)}  ${c.x0.toFixed(4).padStart(7)}  ${c.x1.toFixed(4).padStart(7)}  ${ancho.toFixed(4).padStart(7)}  ${ancho <= 2 ? '   sí  ' : '  NO   '}  ${c.y0.toFixed(4).padStart(7)}  ${c.y1.toFixed(4).padStart(7)}  ${alto.toFixed(4).padStart(7)}  ${alto <= altoDelCuadro ? '  sí  ' : ' NO   '}  ${(fraccionDentro(m) * 100).toFixed(1).padStart(5)} %`,
    )
    return {
      nombre: k.name,
      progreso: k.at,
      frameX: k.pose.frameX,
      x0: c.x0,
      x1: c.x1,
      ancho,
      cabeEnAncho: ancho <= 2,
      y0: c.y0,
      y1: c.y1,
      alto,
      altoDelCuadro,
      cabeEnAlto: alto <= altoDelCuadro,
      dentro: fraccionDentro(m),
      cobertura: cobertura(m),
    }
  })

  // ── 3 · el barrido ───────────────────────────────────────────────────────
  console.log(`\n  3 · EL BARRIDO DE \`frameX\` — ${BARRIDO.length} valores de ${BARRIDO[0]} a ${BARRIDO[BARRIDO.length - 1]}, malla ${MALLA_BARRIDO.columnas}×${MALLA_BARRIDO.filas}\n`)
  console.log('   #  keyframe            hoy      máx `dentro`   en frameX    rango de frameX con dentro = 100 %')
  console.log('   ─────────────────────────────────────────────────────────────────────────────────────────────')
  const barridos = CHOREO_KEYFRAMES.map((k, i) => {
    const muestras: Medida[] = []
    for (const fx of BARRIDO) {
      const m = medir(k.name, k.at, fx, MALLA_BARRIDO)
      if (m !== null) muestras.push(m)
    }
    const mejor = muestras.reduce((a, b) => (b.dentro > a.dentro ? b : a))
    const enteros = muestras.filter((m) => m.dentro >= 0.99999)
    const rango = enteros.length === 0 ? '(ninguno)' : `[${enteros[0].frameX.toFixed(2)} … ${enteros[enteros.length - 1].frameX.toFixed(2)}]  (${enteros.length} valores)`
    const deHoy = muestras.find((m) => Math.abs(m.frameX - k.pose.frameX) < 1e-9)
    console.log(
      `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${((deHoy?.dentro ?? Number.NaN) * 100).toFixed(1).padStart(5)} %   ${(mejor.dentro * 100).toFixed(1).padStart(6)} %      ${mejor.frameX.toFixed(2).padStart(6)}     ${rango}`,
    )
    return { nombre: k.name, progreso: k.at, frameXdeHoy: k.pose.frameX, dentroDeHoy: deHoy?.dentro ?? null, mejor, enteros: enteros.map((m) => cuatro(m.frameX)), muestras }
  })

  console.log('\n  ⚠️ `frameX` TRASLADA, NO ACHICA. Si en §2 la columna «¿cabe?» dice NO, el 100 % de §3')
  console.log('     es inalcanzable por construcción y el criterio (a) del sprint necesita otra palanca.\n')

  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const destino = path.join(RAIZ_DE_SALIDAS, 'a-geometria.json')
  writeFileSync(
    destino,
    `${JSON.stringify(
      { ventana: VENTANA, aspecto: ASPECTO, factor: FACTOR, mallaFina: MALLA_FINA, mallaBarrido: MALLA_BARRIDO, logoW: LOGO_W, fov: CAMERA_FOV, cuando: new Date().toISOString(), geometria, hoy, barridos },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`  escrito: ${destino}`)
}

main()
