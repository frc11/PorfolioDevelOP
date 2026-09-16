/**
 * PAPEL-1 · A — EL ALTO DE LA SUPERFICIE, DERIVADO. No elegido a ojo.
 *
 *     npx tsx scripts-papel/a-alto.ts
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * La instrucción pide una superficie de papel opaco que llegue de borde a borde
 * y termine en el fondo del viewport, y fija su alto como **el mínimo que deja
 * la tinta del titular fuera de la masa del logo**. Eso es un barrido de UNA
 * variable —el borde de ARRIBA de la superficie— sobre el instrumento que
 * TAPADO-1 dejó arreglado: `repartoVertical` coloca las cajas de texto donde el
 * marcado las pone, `muestrearLogo` da la silueta del logo en la pose del hero,
 * y el cruce se hace **sólo sobre la parte de cada caja que queda ARRIBA del
 * borde**, porque lo que cae abajo ya no está sobre la escena: está sobre papel.
 *
 * ── ⚠️ EL DENOMINADOR NO SE ACHICA, Y ES LO QUE HACE HONESTA LA CIFRA ─────
 *
 * La tinta tapada por la superficie sigue contando en el denominador: sigue
 * siendo tinta del titular, sólo que ahora cae sobre papel. Achicar el
 * denominador junto con el numerador daría «100 % de lo que queda expuesto» y
 * eso no es la pregunta — la pregunta es qué fracción de la tinta del titular
 * está sobre la masa negra, y una superficie que la cubre entera tiene que dar
 * **cero**, no `NaN`.
 *
 * ── ⚠️ EL MODELO CORRE MÁS CORTO QUE EL NAVEGADOR, y por eso se publica el
 *    delta al lado ────────────────────────────────────────────────────────
 *
 * Las dos puntas coinciden en el borde de ABAJO del bloque —`justify-end` con
 * `pb-20`, o sea `alto − 80`— y difieren en el ALTO del bloque: el modelo lo
 * hace más corto, así que su borde de arriba cae más abajo y el alto que
 * prescribe es **menor que el que hace falta**. El delta contra los rectángulos
 * medidos de `docs/rediseno/outputs/tapado/a-verdad-hoy.json` se publica fila
 * por fila, y la columna `recomendado` es la del navegador, que es la
 * conservadora. Un alto derivado de un modelo que corre corto, aplicado tal
 * cual, dejaría la primera línea del titular afuera del papel.
 *
 * No juzga: publica el número y el delta.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { muestrearLogo, type CajaEnCuadro, type MuestraDelLogo } from '@/app/v3/_lib/escena/__tests__/s10-logo'
import { ESCENA_REAL, celdasEnLaCaja, superposicion } from '@/app/v3/_lib/escena/__tests__/s10-logo-lectura'
import { aCuadroAlto, aCuadroX } from '@/app/v3/_lib/escena/__tests__/s10-logo-cajas'
import { repartoVertical, type CajaEnPantalla } from '@/app/v3/_lib/escena/__tests__/s10-logo-alto'
import {
  CAMPO,
  MALLA_FINA,
  VENTANAS,
  dos,
  pistaConDistancia,
  tres,
  type Ventana,
} from '../scripts-camara/camara-comun'

const HERO = CHOREO_KEYFRAMES[0]

/** La salida va al mismo árbol de outputs que los demás bancos. */
const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/papel'
/** El recibo de navegador contra el que se contrasta el modelo. */
const VERDAD_DE_TAPADO = 'docs/rediseno/outputs/tapado/a-verdad-hoy.json'

/**
 * LAS CAJAS DEL TITULAR — los dos registros del `h1`, y nada más.
 *
 * `a-verdad.ts` publica su cifra sobre el rectángulo del `h1`; el modelo no
 * emite una caja para el `h1` porque el `h1` no tiene texto propio: lo tienen
 * sus dos `<span>`. Son los dos primeros de la sección en orden de documento y
 * los únicos dos que llevan el texto del titular.
 */
function cajasDelTitular(cajas: readonly CajaEnPantalla[]): readonly CajaEnPantalla[] {
  return cajas.filter((c) => c.caja.etiqueta === 'span' && c.caja.lineas > 0).slice(0, 2)
}

/**
 * LA CAJA, RECORTADA POR EL BORDE DE ARRIBA DE LA SUPERFICIE.
 *
 * Devuelve `null` cuando la superficie la cubre entera: ahí no hay nada que
 * cruzar contra la escena porque no hay escena debajo.
 */
function expuesta(c: CajaEnPantalla, ancho: number, alto: number, bordePx: number): CajaEnCuadro | null {
  const visible = Math.min(c.caja.altoPx, Math.max(0, bordePx - c.arribaPx))
  if (visible <= 0) return null
  const y1 = 1 - (2 * c.arribaPx) / alto
  return {
    x0: aCuadroX(c.caja.banda.izquierda, ancho),
    x1: aCuadroX(c.caja.banda.izquierda + c.caja.banda.ancho, ancho),
    y0: y1 - aCuadroAlto(visible, alto),
    y1,
  }
}

/** La caja ENTERA, que es la que da el denominador. */
function entera(c: CajaEnPantalla, ancho: number, alto: number): CajaEnCuadro {
  const y1 = 1 - (2 * c.arribaPx) / alto
  return {
    x0: aCuadroX(c.caja.banda.izquierda, ancho),
    x1: aCuadroX(c.caja.banda.izquierda + c.caja.banda.ancho, ancho),
    y0: y1 - aCuadroAlto(c.caja.altoPx, alto),
    y1,
  }
}

/** La superposición de un juego de cajas con la superficie naciendo en `bordePx`. */
function conSuperficie(
  m: MuestraDelLogo,
  cajas: readonly CajaEnPantalla[],
  ancho: number,
  alto: number,
  bordePx: number,
): number {
  let area = 0
  let tapadas = 0
  for (const c of cajas) {
    if (c.caja.altoPx <= 0 || c.caja.banda.ancho <= 0) continue
    area += celdasEnLaCaja(m, entera(c, ancho, alto))
    const e = expuesta(c, ancho, alto, bordePx)
    if (e !== null) tapadas += superposicion(m, e).celdas
  }
  return area === 0 ? Number.NaN : tapadas / area
}

interface Punto {
  readonly bordePx: number
  readonly superposicion: number
}

interface Fila {
  readonly ancho: number
  readonly alto: number
  readonly enAlcance: boolean
  /** Sin superficie: el borde nace en el fondo del viewport y no cubre nada. */
  readonly superposicionHoy: number
  /** El borde de arriba del titular según el modelo, y según el navegador. */
  readonly titularArribaModeloPx: number
  readonly titularArribaNavegadorPx: number | null
  readonly deltaModeloPx: number | null
  /** Los tres altos derivados, en píxeles y como fracción del viewport. */
  readonly altoParaCeroPx: number
  readonly altoParaUnDigitoPx: number
  readonly altoRecomendadoPx: number | null
  readonly altoParaCeroPct: number
  readonly altoParaUnDigitoPct: number
  readonly altoRecomendadoPct: number | null
  /** Qué daría el «tercio inferior» de la instrucción, para poder compararlo. */
  readonly superposicionConUnTercio: number
  readonly curva: readonly Punto[]
}

interface VerdadDeTapado {
  readonly filas: readonly {
    readonly ancho: number
    readonly titular: { readonly caja: { readonly y: number } } | null
  }[]
}

function leerVerdad(): Map<number, number> {
  const crudo = JSON.parse(readFileSync(VERDAD_DE_TAPADO, 'utf8')) as VerdadDeTapado
  const m = new Map<number, number>()
  for (const f of crudo.filas) if (f.titular !== null) m.set(f.ancho, f.titular.caja.y)
  return m
}

function medir(v: Ventana, arribaNavegador: number | null): Fila {
  const m = muestrearLogo(
    HERO.at,
    v.ancho / v.alto,
    ESCENA_REAL,
    MALLA_FINA.columnas,
    MALLA_FINA.filas,
    CAMPO,
    pistaConDistancia(HERO.name, HERO.pose.distance),
  )
  const reparto = repartoVertical('hero', v.ancho, v.alto)
  const titular = cajasDelTitular(reparto.cajas)
  const arribaModelo = titular.reduce((a, c) => Math.min(a, c.arribaPx), Infinity)

  // El barrido: el borde de la superficie, de abajo hacia arriba, píxel a píxel.
  const curva: Punto[] = []
  for (let borde = v.alto; borde >= 0; borde -= 1) {
    curva.push({ bordePx: borde, superposicion: tres(conSuperficie(m, titular, v.ancho, v.alto, borde)) })
  }
  const primero = (u: number): number | null => {
    const p = curva.find((c) => c.superposicion <= u)
    return p === undefined ? null : v.alto - p.bordePx
  }
  const paraCero = primero(0) ?? v.alto
  const paraUnDigito = primero(0.099) ?? v.alto
  const recomendado = arribaNavegador === null ? null : v.alto - arribaNavegador

  return {
    ancho: v.ancho,
    alto: v.alto,
    enAlcance: v.enAlcance,
    superposicionHoy: tres(conSuperficie(m, titular, v.ancho, v.alto, v.alto)),
    titularArribaModeloPx: dos(arribaModelo),
    titularArribaNavegadorPx: arribaNavegador === null ? null : dos(arribaNavegador),
    deltaModeloPx: arribaNavegador === null ? null : dos(arribaModelo - arribaNavegador),
    altoParaCeroPx: Math.ceil(paraCero),
    altoParaUnDigitoPx: Math.ceil(paraUnDigito),
    altoRecomendadoPx: recomendado === null ? null : Math.ceil(recomendado),
    altoParaCeroPct: tres(paraCero / v.alto),
    altoParaUnDigitoPct: tres(paraUnDigito / v.alto),
    altoRecomendadoPct: recomendado === null ? null : tres(recomendado / v.alto),
    superposicionConUnTercio: tres(conSuperficie(m, titular, v.ancho, v.alto, v.alto * (2 / 3))),
    curva,
  }
}

function main(): void {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const verdad = leerVerdad()
  const pct = (x: number | null): string => (x === null ? '    n/d' : `${(x * 100).toFixed(1).padStart(5)} %`)
  const px = (x: number | null): string => (x === null ? ' n/d' : String(x).padStart(4))

  console.log('PAPEL-1 PASO 1 — el alto de la superficie, derivado con s10-logo-alto.ts (barrido de 1 px)\n')
  console.log(
    'ventana      superp.   titular arriba      alto para 0 %      alto para <10 %    ALTO RECOMENDADO    con 1/3 de pantalla',
  )
  console.log(
    '             hoy       modelo  navegad.    px     % vp        px     % vp        px     % vp        superposicion',
  )
  const filas: Fila[] = []
  for (const v of VENTANAS) {
    const f = medir(v, verdad.get(v.ancho) ?? null)
    filas.push(f)
    console.log(
      `  ${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)}  ${pct(f.superposicionHoy)}` +
        `   ${px(f.titularArribaModeloPx)}    ${px(f.titularArribaNavegadorPx)}` +
        `   ${px(f.altoParaCeroPx)}  ${pct(f.altoParaCeroPct)}` +
        `   ${px(f.altoParaUnDigitoPx)}  ${pct(f.altoParaUnDigitoPct)}` +
        `   ${px(f.altoRecomendadoPx)}  ${pct(f.altoRecomendadoPct)}` +
        `      ${pct(f.superposicionConUnTercio)}`,
    )
  }

  const salida = {
    cuando: new Date().toISOString(),
    instrumento:
      'scripts-papel/a-alto.ts — repartoVertical + muestrearLogo, barrido de 1 px sobre el borde de arriba de la superficie',
    pose: { keyframe: HERO.name, at: HERO.at, distancia: HERO.pose.distance },
    malla: MALLA_FINA,
    reciboDeNavegador: VERDAD_DE_TAPADO,
    filas,
  }
  writeFileSync(path.join(RAIZ_DE_SALIDAS, 'a-alto.json'), `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, 'a-alto.json')}`)
}

main()
