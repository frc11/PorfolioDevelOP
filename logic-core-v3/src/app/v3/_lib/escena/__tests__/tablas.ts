/**
 * LAS TABLAS QUE LOS INVARIANTES DE LA ESCENA PUBLICAN — impresión y agregados,
 * separados del invariante.
 *
 * Están acá por la regla de tamaño del repo (300 líneas) y por una razón que no
 * es sólo de tamaño: **imprimir una tabla no es afirmar nada**, y mezclar las
 * dos cosas en el mismo archivo hace que cueste ver cuál es cuál. Lo que este
 * módulo devuelve son números; quién los afirma es el invariante.
 *
 * ── LO QUE SITIO-S9 LE AGREGÓ, Y POR QUÉ ACÁ ──────────────────────────────
 *
 * `MAPEO_PROVISIONAL_HISTORICO` es el mapeo VIEJO —la recta única sobre el
 * documento entero— reconstruido con la misma geometría real. Vive en un módulo
 * de instrumento y no en `recorrido.ts` a propósito: **no es un mapeo que nadie
 * use**, es el ANTES de una comparación. Dejarlo en el código de aplicación lo
 * mandaría al chunk de la escena y, peor, dejaría dos mapeos exportados donde la
 * decisión dice que hay uno.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { SECCIONES } from '../../secciones'
import { CHOREO_SCREENS, CHOREO_TRAMOS } from '../choreography'
import { ANCLAJE, TRAMOS_ANCLADOS, comoId } from '../anclaje'
// prettier-ignore
import { MAPEO_DE_LAS_SECCIONES, PANTALLAS_DEL_DOCUMENTO, PANTALLAS_DE_SCROLL, RITMO_COMPUESTO, RITMO_POR_SEGMENTO, progresoDePantalla, tramoEn, type TramoDeSeccion } from '../recorrido'
import { ORIGEN, RAIZ, SUBARBOL_DEL_EDITOR, pesoVivo } from './soporte'

const acotar01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * EL MAPEO VIEJO, reconstruido: `progreso = pantalla / PANTALLAS_DE_SCROLL`.
 *
 * ⚠ **No se copia la tabla de secciones: se usa `ANCLAJE.geometria`**, que es la
 * misma geometría real que consume el mapeo nuevo. Lo único que cambia entre las
 * dos tablas es la FÓRMULA, que es exactamente lo que la comparación mide. Si el
 * antes leyera su propia copia de los altos, una diferencia de tabla se leería
 * como una diferencia de mapeo.
 */
export const MAPEO_PROVISIONAL_HISTORICO: readonly TramoDeSeccion[] = ANCLAJE.geometria.map(
  (g): TramoDeSeccion => ({
    id: g.id,
    desdePantalla: g.desdePantalla,
    altoEnPantallas: g.altoEnPantallas,
    llenaDesde: acotar01(g.desdePantalla / PANTALLAS_DE_SCROLL),
    llenaHasta: acotar01((g.hastaPantalla - 1) / PANTALLAS_DE_SCROLL),
    seVeDesde: acotar01((g.desdePantalla - 1) / PANTALLAS_DE_SCROLL),
    seVeHasta: acotar01(g.hastaPantalla / PANTALLAS_DE_SCROLL),
    dejaVerLaEscena: g.dejaVerLaEscena,
  }),
)

/** Los nudos y el ritmo de cada segmento: la ESCALA, que ya no es una cifra. */
export function imprimirAnclaje(): void {
  console.log(
    `  la coreografía declara ${CHOREO_SCREENS} pantallas · la tabla del home suma ${PANTALLAS_DEL_DOCUMENTO}` +
      ` · el recorrido de scroll es ${PANTALLAS_DE_SCROLL}`,
  )
  console.log('  nudo   pantalla   progreso   qué lo ancla ahí')
  for (const n of ANCLAJE.nudos) {
    console.log(
      `         ${String(n.pantalla).padStart(8)}   ${n.progreso.toFixed(3).padStart(8)}   ${n.porQue}`,
    )
  }
  console.log(
    `  ritmo compuesto: ${RITMO_COMPUESTO.toFixed(4)} de progreso por pantalla de scroll (1 / ${CHOREO_SCREENS})`,
  )
  console.log('  segmento          pantallas   progreso   por pantalla   contra el compuesto')
  for (const r of RITMO_POR_SEGMENTO) {
    console.log(
      `  ${r.tramo.padEnd(16)} ${`${r.desdePantalla}→${r.hastaPantalla}`.padStart(9)}` +
        `   ${r.progreso.toFixed(3).padStart(8)}   ${r.porPantalla.toFixed(4).padStart(12)}` +
        `   ×${r.multiploDelCompuesto.toFixed(3)}`,
    )
  }
}

/**
 * Imprime el mapeo derivado, sección por sección.
 *
 * ⚠ **La columna `tramo` es `tramoEn(llenaDesde)` y en un borde nombra al tramo
 * que TERMINA, no al que empieza.** Con el anclaje eso pasa en casi todas las
 * filas, porque cada sección llena el cuadro exactamente sobre un nudo. La
 * columna sirve para ubicar un progreso; **a qué tramo pertenece una sección lo
 * dice el reparto** (`repartoDelAnclaje`, publicado en `s9-anclaje` §5), que sale
 * de la declaración y no de una comparación de bordes.
 */
export function imprimirMapeo(): void {
  console.log(
    '  sección           alto   llena [desde, hasta]    se ve [desde, hasta]   tramo (en el borde, el que TERMINA)  escena',
  )
  for (const fila of MAPEO_DE_LAS_SECCIONES) {
    console.log(
      `  ${fila.id.padEnd(16)} ${fila.altoEnPantallas.toFixed(0)}pan  ` +
        `[${fila.llenaDesde.toFixed(3)}, ${fila.llenaHasta.toFixed(3)}]   ` +
        `[${fila.seVeDesde.toFixed(3)}, ${fila.seVeHasta.toFixed(3)}]   ` +
        `${tramoEn(fila.llenaDesde).padEnd(15)} ${fila.dejaVerLaEscena ? 'SE VE' : '—'}`,
    )
  }
}

/**
 * EL ANTES CONTRA EL DESPUÉS, fila por fila y en el mismo renglón.
 *
 * La columna que decide es `llena`: es el progreso en el que la sección ocupa la
 * ventana entera, o sea **qué pose de la escena le toca a esa sección**. El
 * `Δ` es cuánto se movió esa pose, en progreso.
 */
export function imprimirComparacion(): void {
  console.log('  sección           VIEJO llena    NUEVO llena    Δ        VIEJO se ve         NUEVO se ve')
  for (let i = 0; i < MAPEO_DE_LAS_SECCIONES.length; i += 1) {
    const nuevo = MAPEO_DE_LAS_SECCIONES[i]
    const viejo = MAPEO_PROVISIONAL_HISTORICO[i]
    const delta = nuevo.llenaDesde - viejo.llenaDesde
    console.log(
      `  ${nuevo.id.padEnd(16)} ${viejo.llenaDesde.toFixed(3).padStart(10)}    ` +
        `${nuevo.llenaDesde.toFixed(3).padStart(10)}   ${(delta >= 0 ? '+' : '') + delta.toFixed(3)}` +
        `   [${viejo.seVeDesde.toFixed(3)}, ${viejo.seVeHasta.toFixed(3)}]` +
        `   [${nuevo.seVeDesde.toFixed(3)}, ${nuevo.seVeHasta.toFixed(3)}]`,
    )
  }
}

export type Desalineacion = {
  readonly tramosSinSeccion: readonly string[]
  readonly seccionesSinTramo: readonly string[]
}

/**
 * LA DESALINEACIÓN **POR NOMBRE** — el estado anterior al anclaje.
 *
 * Qué nombres de tramo no son una sección y qué secciones no son un tramo. Se
 * deriva de las dos tablas, así que si mañana alguien renombra un tramo o
 * agrega una sección, la cuenta se mueve sola. Sigue midiendo lo que medía: es
 * el ANTES contra el que se lee `desalineacionDelAnclaje`.
 */
export function desalineacionDeNombres(): Desalineacion {
  const tramos = CHOREO_TRAMOS.map((t) => comoId(t.name))
  const ids = SECCIONES.map((s) => s.id)
  return {
    tramosSinSeccion: tramos.filter((t) => !ids.includes(t)),
    seccionesSinTramo: ids.filter((id) => !tramos.includes(id)),
  }
}

/**
 * LA DESALINEACIÓN **POR REPARTO** — el estado después del anclaje.
 *
 * ⚠ La pregunta cambia de forma, y por eso hay dos funciones y no una con una
 * bandera. Antes era *«¿este nombre de tramo existe como sección?»*; ahora es
 * *«¿hay alguna sección que ningún tramo recorra, o algún tramo que no corra
 * sobre ninguna sección?»*. Un tramo puede llevar el nombre de una sección y no
 * correr sobre ella —`cierre` es exactamente ese caso— así que comparar nombres
 * después del anclaje daría una cuenta que no significa nada.
 */
export function desalineacionDelAnclaje(): Desalineacion {
  const conSeccion = new Set(TRAMOS_ANCLADOS.filter((t) => t.secciones.length > 0).map((t) => t.tramo))
  const conTramo = new Set(TRAMOS_ANCLADOS.flatMap((t) => t.secciones))
  return {
    tramosSinSeccion: CHOREO_TRAMOS.map((t) => t.name).filter((n) => !conSeccion.has(n)),
    seccionesSinTramo: SECCIONES.map((s) => s.id).filter((id) => !conTramo.has(id)),
  }
}

export type FilaDelReparto = {
  readonly id: string
  /** El tramo que corre sobre esta sección, o `null` si ninguno. */
  readonly tramo: string | null
  /** Si ese tramo lleva el nombre de esta sección. */
  readonly llevaSuNombre: boolean
  /**
   * La ventana de scroll de la sección, en progreso: desde que llena el cuadro
   * hasta que deja de verse. Es el rango de la escena que se ve con este panel
   * encima, y con el anclaje coincide —tramo a tramo— con el `[from, to]` de la
   * coreografía.
   */
  readonly ventana: readonly [number, number]
}

/** En qué tramo cae la ventana de cada sección. Derivado, no escrito. */
export function repartoDelAnclaje(): readonly FilaDelReparto[] {
  return MAPEO_DE_LAS_SECCIONES.map((fila): FilaDelReparto => {
    const anclado = TRAMOS_ANCLADOS.find((t) => t.secciones.includes(fila.id))
    return {
      id: fila.id,
      tramo: anclado?.tramo ?? null,
      llevaSuNombre: anclado !== undefined && comoId(anclado.tramo) === fila.id,
      ventana: [fila.llenaDesde, fila.seVeHasta],
    }
  })
}

/** El antes y el después de la desalineación, y en qué tramo cae cada ventana. */
export function imprimirReparto(): void {
  const antes = desalineacionDeNombres()
  const despues = desalineacionDelAnclaje()
  console.log(
    `  ANTES (por nombre)    tramos sin sección: ${antes.tramosSinSeccion.length} (${antes.tramosSinSeccion.join(', ')})` +
      ` · secciones sin tramo: ${antes.seccionesSinTramo.length} (${antes.seccionesSinTramo.join(', ')})`,
  )
  console.log(
    `  DESPUÉS (por reparto) tramos sin sección: ${despues.tramosSinSeccion.length}` +
      ` · secciones sin tramo: ${despues.seccionesSinTramo.length} (${despues.seccionesSinTramo.join(', ') || '—'})`,
  )
  for (const fila of repartoDelAnclaje()) {
    const nombre = fila.tramo === null ? '—' : fila.llevaSuNombre ? 'su nombre' : 'OTRO nombre'
    console.log(
      `  ${fila.id.padEnd(16)} ventana p=[${fila.ventana[0].toFixed(3)}, ${fila.ventana[1].toFixed(3)}]` +
        `  tramo ${(fila.tramo ?? '— sin tramo —').padEnd(15)} ${nombre}`,
    )
  }
}

/**
 * Las ventanas de scroll con panel transparente en cuadro, traducidas a
 * progreso con el mapeo nuevo. Es el insumo del frente de la visibilidad: **qué
 * se hace con el hueco entre las dos no se decide acá.**
 */
export function ventanasEnProgreso(): readonly (readonly [number, number])[] {
  return ANCLAJE.ventanasDeLaEscena.map(
    ([desde, hasta]): readonly [number, number] => [
      progresoDePantalla(desde),
      progresoDePantalla(hasta),
    ],
  )
}

export function imprimirVentanas(): void {
  const transparentes = MAPEO_DE_LAS_SECCIONES.filter((f) => f.dejaVerLaEscena)
  const enProgreso = ventanasEnProgreso()
  for (let i = 0; i < ANCLAJE.ventanasDeLaEscena.length; i += 1) {
    const [a, b] = ANCLAJE.ventanasDeLaEscena[i]
    const [pa, pb] = enProgreso[i]
    console.log(
      `  pantallas [${a}, ${b}]  →  progreso [${pa.toFixed(3)}, ${pb.toFixed(3)}]  (${transparentes[i].id})`,
    )
  }
}

/** Los cuatro bordes de la ventana de progreso de una sección, en orden. */
export function bordesDe(id: string): readonly number[] {
  const fila = MAPEO_DE_LAS_SECCIONES.find((f) => f.id === id)
  if (fila === undefined) return []
  return [fila.seVeDesde, fila.llenaDesde, fila.llenaHasta, fila.seVeHasta]
}

export type PesoDelEditor = {
  /** Bytes de código vivo de los 11 archivos del subárbol del editor. */
  readonly total: number
  /** De esos, cuántos son las cuatro variantes alternativas y sus notas. */
  readonly variantes: number
}

/**
 * Lo que costaría mudar el editor de keyframes al chunk de la escena.
 *
 * Se mide **sin comentarios**, que es lo que aproxima lo que sobrevive a la
 * minificación: la mayor parte de estos archivos son notas de keyframe, y las
 * notas son cadenas —viven— mientras que los docblocks se borran.
 */
export function pesoDelEditor(): PesoDelEditor {
  const bytes = (nombre: string): number =>
    pesoVivo(readFileSync(path.join(RAIZ, ORIGEN, nombre), 'utf8'))
  return {
    total: SUBARBOL_DEL_EDITOR.reduce((n, f) => n + bytes(f), 0),
    variantes: SUBARBOL_DEL_EDITOR.filter((f) => f !== 'choreographyEditor.ts').reduce(
      (n, f) => n + bytes(f),
      0,
    ),
  }
}
