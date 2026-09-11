/**
 * D · EL TAMAÑO EN CUADRO — dónde está de verdad el 35–50 %, y qué palanca lo baja.
 *
 *     npx tsx scripts-b13/d-tamano.ts
 *     npx tsx scripts-b13/d-tamano.ts --distancias=quiénes somos:14,números:24
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * 1. **Cuánto cuadro ocupa el logo a lo largo de cada ventana en la que la
 *    sección deja ver la sala**, y no sólo en el progreso donde la sección
 *    llena el cuadro. El diagnóstico habla de un 35–50 % y las seis anclas dan
 *    entre 2,8 % y 15 %: la diferencia no es una discrepancia, es **dónde se
 *    mide**. Acá se barre la ventana entera.
 * 2. **Qué pasa si la cámara se aleja**: la misma cuenta con una distancia
 *    hipotética en las poses que se nombren, usando la palanca que `s10-logo`
 *    ya tiene para eso (`conPose`, que arma un track sobre una COPIA de los
 *    keyframes). `CHOREO_KEYFRAMES` no se toca.
 *
 * ⚠️ Las paradas en las que la escena **no dibuja** se marcan y no cuentan: el
 * logo puede ocupar el cuadro entero detrás de un panel opaco y eso no es un
 * problema de nadie. La ventana de suspensión sale de `visibilidad.ts`, que es
 * la misma que usa el home.
 */

import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { ANCLAJE } from '../src/app/v3/_lib/escena/anclaje'
import { MAPEO_DE_LAS_SECCIONES, pantallaDeProgreso } from '../src/app/v3/_lib/escena/recorrido'
import { MARGEN_DE_REANUDACION } from '../src/app/v3/_lib/escena/visibilidad'
import { muestrearLogo } from '../src/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, VENTANAS, cobertura, conPose } from '../src/app/v3/_lib/escena/__tests__/s10-logo-lectura'

import { argumento, escribirJson, red } from './b13-comun'

let ASPECTO = 16 / 9

/**
 * ¿La escena DIBUJA en este progreso? Es la misma condición de
 * `escenaEnCuadro` —las ventanas del anclaje más el margen de reanudación—
 * evaluada sobre el progreso en vez de sobre el scroll, porque acá no hay
 * documento. La condición no se re-escribe: se llama con la pantalla que el
 * progreso implica.
 */
function dibujaEn(progreso: number): boolean {
  const pantalla = pantallaDeProgreso(progreso)
  return ANCLAJE.ventanasDeLaEscena.some(
    ([desde, hasta]) => pantalla >= desde - MARGEN_DE_REANUDACION && pantalla <= hasta + MARGEN_DE_REANUDACION,
  )
}
/** Paso del barrido: 1/64 de recorrido ≈ un octavo de pantalla de scroll. */
const PASO = 1 / 256

interface Punto {
  readonly progreso: number
  readonly coberturaPct: number
}

function barrer(desde: number, hasta: number, cambio: Readonly<Record<string, number>> | null, prefijo: string): readonly Punto[] {
  const puntos: Punto[] = []
  for (let p = desde; p <= hasta + 1e-9; p += PASO) {
    const progreso = Math.min(1, red(p, 6))
    if (!dibujaEn(progreso)) continue
    const m =
      cambio === null
        ? muestrearLogo(progreso, ASPECTO, ESCENA_REAL, 220, 160, 2.6)
        : conPose(prefijo, cambio, progreso, ASPECTO)
    puntos.push({ progreso, coberturaPct: red(cobertura(m) * 100, 2) })
  }
  return puntos
}

function resumen(puntos: readonly Punto[]): { readonly n: number; readonly min: number; readonly max: number; readonly media: number; readonly donde: number } {
  if (puntos.length === 0) return { n: 0, min: Number.NaN, max: Number.NaN, media: Number.NaN, donde: Number.NaN }
  let min = Infinity
  let max = -Infinity
  let suma = 0
  let donde = Number.NaN
  for (const p of puntos) {
    if (p.coberturaPct < min) min = p.coberturaPct
    if (p.coberturaPct > max) {
      max = p.coberturaPct
      donde = p.progreso
    }
    suma += p.coberturaPct
  }
  return { n: puntos.length, min: red(min, 2), max: red(max, 2), media: red(suma / puntos.length, 2), donde }
}

function principal(): void {
  console.log('las siete poses del recorrido, con su distancia de hoy:')
  for (const k of CHOREO_KEYFRAMES) {
    console.log(`  ${k.name.padEnd(18)} at=${k.at.toFixed(4)}  distancia ${k.pose.distance.toFixed(2)}  altura ${k.pose.height.toFixed(2)}  frameX ${k.pose.frameX}`)
  }

  // El cuadro en el que se miden la tabla por sección y las hipotéticas. Por
  // defecto 16:9 —el cuadro con el que se compuso el recorrido—; el 1,139 de
  // `1025×900` es el más angosto donde la escena existe, y es de donde sale el
  // 35–50 % del diagnóstico.
  ASPECTO = Number(argumento('aspecto', String(16 / 9)))
  console.log(`
  cuadro de esta corrida: aspecto ${ASPECTO.toFixed(4)}`)

  const hipoteticas = new Map<string, number>()
  const crudo = argumento('distancias', '')
  if (crudo !== '') {
    for (const par of crudo.split(',')) {
      const [nombre, valor] = par.split(':')
      hipoteticas.set(nombre.trim(), Number(valor))
    }
  }

  console.log('\nel logo en cuadro, ventana por ventana (sólo las paradas en que la escena DIBUJA):')
  console.log('  sección           ventana            paradas   min    media   MAX   (dónde)')
  const filas: unknown[] = []
  for (const t of MAPEO_DE_LAS_SECCIONES) {
    const puntos = barrer(t.seVeDesde, t.seVeHasta, null, '')
    const r = resumen(puntos)
    filas.push({ seccion: t.id, dejaVerLaEscena: t.dejaVerLaEscena, ventana: [t.seVeDesde, t.seVeHasta], ...r, puntos })
    console.log(
      `  ${t.id.padEnd(17)} ${t.seVeDesde.toFixed(4)}–${t.seVeHasta.toFixed(4)} ${t.dejaVerLaEscena ? ' ' : '·'} ${String(r.n).padStart(6)} ` +
        `${Number.isNaN(r.min) ? '  —  ' : r.min.toFixed(2).padStart(6)} ${Number.isNaN(r.media) ? '  —  ' : r.media.toFixed(2).padStart(6)} ` +
        `${Number.isNaN(r.max) ? '  —  ' : r.max.toFixed(2).padStart(6)}  ${Number.isNaN(r.donde) ? '' : `p=${r.donde.toFixed(4)}`}`,
    )
  }

  const global = barrer(0, 1, null, '')
  const rg = resumen(global)
  console.log(`\n  TODO el recorrido dibujando: ${rg.n} paradas · min ${rg.min} % · media ${rg.media} % · MÁXIMO ${rg.max} % en p=${rg.donde.toFixed(4)}`)

  // ⚠️ EL 35–50 % DEL DIAGNÓSTICO SALE DEL CUADRO ANGOSTO, no de otro lado: el
  // logo entra en un cuadro de 1025 px de ancho ocupando mucho más que en 16:9.
  // Los cuatro cuadros son los de `s10-logo-lectura.ts`, derivados y no escritos.
  const porAspecto: unknown[] = []
  console.log('\n  el MAXIMO del recorrido, cuadro por cuadro (los cuatro de `s10-logo`, mas los dos anchos del reporte):')
  const guardado = ASPECTO
  for (const v of [...VENTANAS, { etiqueta: '1440x900', aspecto: 1440 / 900 }, { etiqueta: '1920x1080', aspecto: 1920 / 1080 }]) {
    ASPECTO = v.aspecto
    const r = resumen(barrer(0, 1, null, ''))
    porAspecto.push({ cuadro: v.etiqueta, aspecto: red(v.aspecto, 4), ...r })
    console.log(`    ${v.etiqueta.padEnd(12)} (${v.aspecto.toFixed(3)})  min ${r.min.toFixed(2).padStart(6)} · media ${r.media.toFixed(2).padStart(6)} · MAXIMO ${r.max.toFixed(2).padStart(6)} % en p=${r.donde.toFixed(4)}`)
  }
  ASPECTO = guardado


  const hip: unknown[] = []
  for (const [nombre, distancia] of hipoteticas) {
    const k = CHOREO_KEYFRAMES.find((x) => x.name === nombre)
    if (k === undefined) throw new Error(`no hay una pose llamada «${nombre}»`)
    const tramoTocado = MAPEO_DE_LAS_SECCIONES.filter((t) => t.dejaVerLaEscena)
    console.log(`\n  HIPOTÉTICO — «${nombre}» de distancia ${k.pose.distance} a ${distancia}:`)
    for (const t of tramoTocado) {
      const antes = resumen(barrer(t.seVeDesde, t.seVeHasta, null, ''))
      const despues = resumen(barrer(t.seVeDesde, t.seVeHasta, { distance: distancia }, nombre))
      if (Number.isNaN(antes.max) || Number.isNaN(despues.max)) continue
      const cambio = despues.max - antes.max
      hip.push({ pose: nombre, distancia, seccion: t.id, antesMax: antes.max, despuesMax: despues.max })
      console.log(
        `    ${t.id.padEnd(17)} max ${antes.max.toFixed(2).padStart(6)} % → ${despues.max.toFixed(2).padStart(6)} % ` +
          `(${cambio >= 0 ? '+' : ''}${cambio.toFixed(2)})  ·  media ${antes.media.toFixed(2)} → ${despues.media.toFixed(2)}`,
      )
    }
  }

  console.log(`\nescrito: ${escribirJson('tamano-en-cuadro', { poses: CHOREO_KEYFRAMES, paso: PASO, secciones: filas, global: rg, porAspecto, hipoteticas: hip })}`)
}

principal()
