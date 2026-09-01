/**
 * LO QUE SE LEE DE UNA MUESTRA DEL LOGO, y el banco de este frente.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Igual que `s10-logo.ts`: sus
 * números son coordenadas de cuadro y tamaños de grilla, no valores de diseño.
 *
 * Sale de `s10-logo.ts` por la regla de 300 líneas del repo, y el corte tiene
 * una costura real: **allá se muestrea, acá se lee.** Un muestreador que además
 * decidiera qué estadístico publicar sería un instrumento que se contesta a sí
 * mismo, que es exactamente lo que §7.25 anota como modo de falla recurrente.
 *
 * ── Las cuatro lecturas, y qué contesta cada una ──────────────────────────
 *
 *   · `fraccionDentro` — cuánto del logo entra en el cuadro. Es «¿está cortado?»
 *     con un número, y el denominador sale de la grilla EXTENDIDA.
 *   · `cobertura` — cuánto del cuadro es logo. Es «la masa negra», medida.
 *   · `superposicion` — cuánto de una caja de texto está tapada, y con qué
 *     valor sombreado: de ahí sale el contraste que `s8-tinta` descarta.
 *   · `barridoVertical` — la respuesta honesta a «no sé a qué altura cae este
 *     bloque»: se recorren TODAS las posiciones que caben y se publica el rango.
 *
 * ── El banco del frente, abajo ────────────────────────────────────────────
 *
 * `ESCENA_REAL`, los cuatro cuadros y las dos secciones transparentes se
 * derivan —de `probeCelosia`, `probeMoire`, `ALTOS`, `--fluido-techo` y
 * `MAPEO_DE_LAS_SECCIONES`— y no se escriben. Están acá y no en el invariante
 * para que el invariante sea sólo afirmaciones y tablas.
 */

import { razonDeContraste } from '../../__tests__/afirmar'
import { ALTOS } from '../../__tests__/s10-banco'
import { tokenPx } from '../../__tests__/s10-css'
import { TINTA_HEX } from '../../superficies'
import { ESCENARIO_MIN_ANCHO_PX } from '../../compuerta'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { CELOSIA_BAR, celosiaSkyFactor } from '../probeCelosia'
import { MOIRE_MISMATCH } from '../probeMoire'
import { MAPEO_DE_LAS_SECCIONES } from '../recorrido'
import { CHOREO_KEYFRAMES } from '../choreography'
import { makeTrack } from '@/app/probe-escena/__tests__/harness'
import { grisHex, muestrearCuadro, percentil, vistaEn } from './cuadro'
import { muestrearLogo, type CajaEnCuadro, type MuestraDelLogo } from './s10-logo'
import { cajasDeLaSeccion } from './s10-logo-cajas'

/** Qué fracción del área proyectada del logo queda DENTRO del cuadro. */
export function fraccionDentro(m: MuestraDelLogo): number {
  return m.celdasDeLogo === 0 ? Number.NaN : m.enCuadro / m.celdasDeLogo
}

/** Qué fracción del CUADRO ocupa el logo. Es la masa negra, medida. */
export function cobertura(m: MuestraDelLogo): number {
  return m.celdasDelCuadro === 0 ? Number.NaN : m.enCuadro / m.celdasDelCuadro
}

/** La caja envolvente del logo en coordenadas de cuadro, o `null` si no hay tinta. */
export function cajaDelLogo(m: MuestraDelLogo): CajaEnCuadro | null {
  if (m.celdasDeLogo === 0) return null
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (let i = 0; i < m.celdasDeLogo; i += 1) {
    if (m.x[i] < x0) x0 = m.x[i]
    if (m.x[i] > x1) x1 = m.x[i]
    if (m.y[i] < y0) y0 = m.y[i]
    if (m.y[i] > y1) y1 = m.y[i]
  }
  return { x0, x1, y0, y1 }
}

/** Cuántas celdas de la grilla caen dentro de una caja. El denominador de la superposición. */
export function celdasEnLaCaja(m: MuestraDelLogo, caja: CajaEnCuadro): number {
  const cuantas = (desde: number, hasta: number, n: number): number => {
    const paso = (2 * m.factor) / n
    const bajo = Math.ceil((desde + m.factor) / paso - 0.5)
    const alto = Math.floor((hasta + m.factor) / paso - 0.5)
    return Math.max(0, Math.min(n - 1, alto) - Math.max(0, bajo) + 1)
  }
  return cuantas(caja.x0, caja.x1, m.columnas) * cuantas(caja.y0, caja.y1, m.filas)
}

export interface Superposicion {
  /** Celdas de logo adentro de la caja. */
  readonly celdas: number
  /** Esas celdas sobre el área de la caja. 0 = el logo no la toca. */
  readonly fraccion: number
  /** Los valores sombreados del logo ahí, ORDENADOS. */
  readonly valores: Float64Array
}

/** Cuánto del área de una caja de texto está tapada por el logo, y con qué valor. */
export function superposicion(m: MuestraDelLogo, caja: CajaEnCuadro): Superposicion {
  const valores: number[] = []
  for (let i = 0; i < m.celdasDeLogo; i += 1) {
    if (m.x[i] < caja.x0 || m.x[i] > caja.x1) continue
    if (m.y[i] < caja.y0 || m.y[i] > caja.y1) continue
    valores.push(m.valor[i])
  }
  const area = celdasEnLaCaja(m, caja)
  const ordenados = Float64Array.from(valores)
  ordenados.sort()
  return {
    celdas: valores.length,
    fraccion: area === 0 ? 0 : valores.length / area,
    valores: ordenados,
  }
}

/** Percentil (0..1) sobre un array YA ordenado. Misma forma que `cuadro.ts`. */
export function percentilDe(ordenado: Float64Array, p: number): number {
  if (ordenado.length === 0) return Number.NaN
  const i = Math.min(ordenado.length - 1, Math.max(0, Math.round(p * (ordenado.length - 1))))
  return ordenado[i]
}

/** Un valor 0..255 escrito como gris `#RRGGBB`, para `razonDeContraste`. */
export function gris(valor: number): string {
  const v = Math.min(255, Math.max(0, Math.round(valor)))
  const h = v.toString(16).padStart(2, '0')
  return `#${h}${h}${h}`
}

export interface BarridoVertical {
  /** La superposición MÍNIMA sobre todas las posiciones verticales posibles. */
  readonly minima: number
  /** La MÁXIMA. Es una cota superior sin ningún supuesto de posición. */
  readonly maxima: number
  /** Dónde cae el borde superior de la caja en el peor caso, en coordenada de cuadro. */
  readonly peorArriba: number
}

/**
 * BARRE LA POSICIÓN VERTICAL de una caja de alto fijo y banda horizontal fija.
 *
 * El máximo es una cota superior que no depende de ningún supuesto; el mínimo
 * dice si la superposición es EVITABLE moviendo el bloque, que es la palanca de
 * composición más barata. Un mínimo mayor que cero significa que no hay altura
 * de pantalla en la que ese bloque quede limpio.
 */
export function barridoVertical(
  m: MuestraDelLogo,
  x0: number,
  x1: number,
  alto: number,
  pasos = 120,
): BarridoVertical {
  let minima = Infinity
  let maxima = -Infinity
  let peorArriba = Number.NaN
  const recorrido = Math.max(0, 2 - alto)
  for (let i = 0; i <= pasos; i += 1) {
    const arriba = 1 - (recorrido * i) / pasos
    const f = superposicion(m, { x0, x1, y0: arriba - alto, y1: arriba }).fraccion
    if (f < minima) minima = f
    if (f > maxima) {
      maxima = f
      peorArriba = arriba
    }
  }
  return { minima, maxima, peorArriba }
}

// ── EL BANCO DE ESTE FRENTE ─────────────────────────────────────────────────

/** La escena real: envolvente puesta, desajuste del panel y celosía con su cielo. */
export const ESCENA_REAL = {
  backdrop: true,
  mismatch: MOIRE_MISMATCH,
  celosia: { bar: CELOSIA_BAR, sky: celosiaSkyFactor(CELOSIA_BAR) },
} as const

export interface Ventana {
  readonly ancho: number
  readonly alto: number
  readonly etiqueta: string
  readonly aspecto: number
}

/**
 * LOS CUATRO CUADROS. Tres son 1025 —el único ancho donde la escena existe—
 * cruzado con los tres altos que `ALTOS_DECLARADOS` justifica uno por uno; el
 * cuarto es `--fluido-techo` con el alto de referencia de escritorio, o sea el
 * cuadro con el que se compuso todo el recorrido. Ninguno se escribe a mano.
 */
export const VENTANAS: readonly Ventana[] = [
  ...ALTOS.map((alto) => ({ ancho: ESCENARIO_MIN_ANCHO_PX, alto })),
  { ancho: tokenPx('--fluido-techo', 0), alto: ALTOS[ALTOS.length - 1] },
].map((v) => ({ ...v, etiqueta: `${v.ancho}×${v.alto}`, aspecto: v.ancho / v.alto }))

/** Las dos secciones que dejan ver la sala. Sale de la tabla, no de una lista. */
export const TRANSPARENTES = MAPEO_DE_LAS_SECCIONES.filter((f) => f.dejaVerLaEscena)

/** Los cuatro progresos que retratan la ventana de una sección. */
export function progresosDe(f: (typeof TRANSPARENTES)[number]): readonly number[] {
  return [f.seVeDesde, f.llenaDesde, (f.llenaDesde + f.seVeHasta) / 2, f.seVeHasta]
}

const cache = new Map<string, MuestraDelLogo>()

/** Una muestra de la grilla de publicación, memorizada: el barrido la pide muchas veces. */
export function muestra(progreso: number, aspecto: number): MuestraDelLogo {
  const clave = `${progreso}|${aspecto}`
  const guardada = cache.get(clave)
  if (guardada !== undefined) return guardada
  const nueva = muestrearLogo(progreso, aspecto, ESCENA_REAL, 300, 220, 2.6)
  cache.set(clave, nueva)
  return nueva
}

/**
 * UNA MUESTRA CON UNA POSE HIPOTÉTICA — para medir una palanca sin moverla.
 *
 * Arma un track nuevo sobre una COPIA de `CHOREO_KEYFRAMES`. El archivo de la
 * coreografía no se toca: lo que sale de acá se rotula como hipotético y sirve
 * para poner un número al costado de cada palanca del reporte.
 */
export function conPose(
  prefijoDelNombre: string,
  cambio: Readonly<Record<string, number>>,
  progreso: number,
  aspecto: number,
): MuestraDelLogo {
  return muestrearLogo(
    progreso,
    aspecto,
    ESCENA_REAL,
    220,
    160,
    2.6,
    makeTrack(
      CHOREO_KEYFRAMES.map((k) =>
        k.name.startsWith(prefijoDelNombre) ? { ...k, pose: { ...k.pose, ...cambio } } : k,
      ),
    ),
  )
}

/** La razón de contraste de la tinta del texto contra el cuantil `q` del LOGO. */
export function contrasteSobreElLogo(m: MuestraDelLogo, q: number): number {
  const ordenados = m.valor.slice()
  ordenados.sort()
  return razonDeContraste(TINTA_HEX, gris(percentilDe(ordenados, q)))
}

/** La misma tinta contra el PEOR píxel del fondo: la cifra que `s8-tinta` publica. */
export function contrasteSobreElFondo(progreso: number): number {
  const h = muestrearCuadro(progreso, vistaEn(progreso), ESCENA_REAL, 200, 113)
  return razonDeContraste(TINTA_HEX, grisHex(percentil(h.sinLogo, 0)))
}

/** La caja de texto más grande por área de una sección: la que decide la composición. */
export function mayorCaja(id: string, ancho: number) {
  return cajasDeLaSeccion(id, ancho).reduce((a, b) =>
    b.altoPx * b.banda.ancho > a.altoPx * a.banda.ancho ? b : a,
  )
}

/** El papel de la sala. Expuesto para que el reporte nombre la otra tinta de la escena. */
export const PAPEL = PAPER_COLOR
/** La tinta del logo 3D: el color contra el que nadie había medido el texto. */
export const TINTA_DEL_LOGO = INK_COLOR
